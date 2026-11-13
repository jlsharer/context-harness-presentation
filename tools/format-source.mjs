/** Consistent formatting without changing executable JavaScript or embedded payload values. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parse } from '@babel/parser';
import * as prettier from 'prettier';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(path.join(root, '.prettierrc.json'), 'utf8'));
const scriptExtensions = new Set(['.js', '.mjs', '.cjs', '.ts']);
const supported = new Set([...scriptExtensions, '.css', '.html', '.json']);
const excluded = new Set([
  '.git',
  'node_modules',
  '.venv-format',
  '.superpowers',
  'deliverables',
  'assets',
  'rendered_slides',
  '__pycache__',
]);

function syntax(text, file) {
  return parse(text, {
    sourceType: 'unambiguous',
    allowAwaitOutsideFunction: true,
    plugins: file.endsWith('.ts') ? ['typescript'] : [],
  });
}

function walk(node, visit, parent = null, key = null) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit, parent, key);
    return;
  }
  if (node.type) visit(node, parent, key);
  for (const [name, value] of Object.entries(node)) {
    if (
      ![
        'loc',
        'extra',
        'comments',
        'leadingComments',
        'trailingComments',
        'innerComments',
      ].includes(name)
    ) {
      walk(value, visit, node, name);
    }
  }
}

function chunks(value) {
  const result = [];
  let remaining = value;
  while (remaining.length > 100) {
    const window = remaining.slice(0, 88);
    const tag = window.lastIndexOf('><');
    const boundary =
      tag >= 30 ? tag + 1 : Math.max(window.lastIndexOf(' '), window.lastIndexOf('\n')) + 1;
    if (boundary < 30) return [value]; // Keep identifiers, URLs and other indivisible text intact.
    result.push(remaining.slice(0, boundary));
    remaining = remaining.slice(boundary);
  }
  result.push(remaining);
  return result;
}

function splitLongStrings(text, file) {
  const changes = [];
  walk(syntax(text, file), (node, parent, key) => {
    if (node.type !== 'StringLiteral' || node.value.length < 140) return;
    if (
      key === 'key' ||
      key === 'source' ||
      parent?.type?.startsWith('Import') ||
      parent?.type?.startsWith('TS') ||
      parent?.type?.endsWith('Specifier')
    )
      return;
    const parts = chunks(node.value);
    if (parts.length > 1) {
      changes.push({
        start: node.start,
        end: node.end,
        text: '(' + parts.map((part) => JSON.stringify(part)).join(' +\n') + ')',
      });
    }
  });
  for (const change of changes.sort((a, b) => b.start - a.start)) {
    text = text.slice(0, change.start) + change.text + text.slice(change.end);
  }
  return text;
}

function functionLike(node) {
  if (!node) return false;
  if (/Function|Method/.test(node.type)) return true;
  if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration')
    return functionLike(node.declaration);
  if (node.type === 'VariableDeclaration')
    return node.declarations.some((item) => functionLike(item.init));
  if (node.type === 'ObjectProperty' || node.type === 'ClassProperty')
    return functionLike(node.value);
  return (
    node.type === 'ExpressionStatement' &&
    node.expression.type === 'AssignmentExpression' &&
    functionLike(node.expression.right)
  );
}

function expandFunctionContainers(text, file) {
  const insertions = [];
  walk(syntax(text, file), (node) => {
    if (node.type !== 'ObjectExpression' || node.properties.length < 2) return;
    if (!node.properties.some(functionLike)) return;
    if (node.loc.start.line === node.properties[0].loc.start.line) insertions.push(node.start + 1);
  });
  for (const position of insertions.sort((a, b) => b - a)) {
    text = text.slice(0, position) + '\n' + text.slice(position);
  }
  return text;
}

function separateFunctions(text, file) {
  const insertions = new Set();
  walk(syntax(text, file), (node) => {
    for (const field of ['body', 'properties']) {
      const list = node[field];
      if (!Array.isArray(list)) continue;
      for (let i = 1; i < list.length; i++) {
        const previous = list[i - 1],
          current = list[i];
        if (current.loc.start.line === previous.loc.end.line) continue;
        if (
          (!functionLike(previous) && !functionLike(current)) ||
          current.loc.start.line - previous.loc.end.line > 1
        )
          continue;
        const start = text.lastIndexOf('\n', current.start - 1) + 1;
        insertions.add(start);
      }
    }
  });
  for (const position of [...insertions].sort((a, b) => b - a))
    text = text.slice(0, position) + '\n' + text.slice(position);
  return text;
}

function normalize(node) {
  if (Array.isArray(node)) return node.map(normalize);
  let pair = null;
  if (!node || typeof node !== 'object') return node;
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    const left = normalize(node.left),
      right = normalize(node.right);
    pair = { left, right };
    if (left.type === 'StringLiteral' && right.type === 'StringLiteral')
      return { type: 'StringLiteral', value: left.value + right.value };
  }
  const result = {};
  for (const [key, value] of Object.entries(node)) {
    if (
      ![
        'start',
        'end',
        'loc',
        'extra',
        'comments',
        'leadingComments',
        'trailingComments',
        'innerComments',
      ].includes(key)
    )
      result[key] = pair && (key === 'left' || key === 'right') ? pair[key] : normalize(value);
  }
  return result;
}

export function semanticFingerprint(text, file) {
  return JSON.stringify(normalize(syntax(text, file)));
}

export async function formatText(text, file) {
  const script = scriptExtensions.has(path.extname(file));
  const before = script ? semanticFingerprint(text, file) : null;
  let formatted = script ? expandFunctionContainers(splitLongStrings(text, file), file) : text;
  let stable = false;
  for (let pass = 0; pass < 4; pass++) {
    let next = await prettier.format(formatted, {
      ...config,
      filepath: file,
      embeddedLanguageFormatting: file.endsWith('.md') ? 'auto' : config.embeddedLanguageFormatting,
    });
    if (script) next = separateFunctions(next, file);
    if (next === formatted) {
      stable = true;
      break;
    }
    formatted = next;
  }
  if (!stable) throw Error('Formatter did not converge: ' + file);
  if (script && semanticFingerprint(formatted, file) !== before) {
    throw Error('Formatting changed JavaScript semantics: ' + file);
  }
  return formatted;
}

function sourceFiles(folder = root) {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    if (excluded.has(entry.name) || entry.isSymbolicLink()) return [];
    const file = path.join(folder, entry.name);
    return entry.isDirectory()
      ? sourceFiles(file)
      : supported.has(path.extname(file)) ||
          file.endsWith('.py') ||
          (file.endsWith('.md') &&
            entry.name !== 'SKILL.md' &&
            (path.relative(root, file).split(path.sep).join('/').startsWith('docs/kits/') ||
              path
                .relative(root, file)
                .split(path.sep)
                .join('/')
                .startsWith('docs/audit/context-audit/')))
        ? [file]
        : [];
  });
}

async function main(args) {
  if (args.includes('--stdin')) {
    const file = args[args.indexOf('--filepath') + 1];
    let input = '';
    for await (const chunk of process.stdin) input += chunk;
    process.stdout.write(await formatText(input, file));
    return;
  }
  const write = args.includes('--write');
  const files = [];
  for (const file of sourceFiles()) {
    const info = await prettier.getFileInfo(file, {
      ignorePath: path.join(root, '.prettierignore'),
    });
    if (!info.ignored) files.push(file);
  }
  let changed = 0;
  for (const file of files.filter((file) => !file.endsWith('.py'))) {
    const before = fs.readFileSync(file, 'utf8'),
      after = await formatText(before, file);
    if (before === after) continue;
    changed++;
    if (write) fs.writeFileSync(file, after);
    else console.error('Needs formatting: ' + path.relative(root, file));
  }
  const pythonFiles = files.filter((file) => file.endsWith('.py'));
  if (pythonFiles.length) {
    const candidate = path.join(
      root,
      '.venv-format',
      process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python',
    );
    const python = process.env.FORMAT_PYTHON || (fs.existsSync(candidate) ? candidate : 'python3');
    const run = spawnSync(
      python,
      [
        '-m',
        'black',
        '--workers',
        '1',
        '--line-length',
        '100',
        ...(write ? [] : ['--check']),
        ...pythonFiles,
      ],
      { stdio: 'inherit' },
    );
    if (run.status !== 0)
      throw Error(
        'Python formatting failed. Install requirements-format.txt in .venv-format or set FORMAT_PYTHON.',
      );
  }
  console.log(
    (write ? 'Formatted ' : 'Checked ') +
      files.length +
      ' source files; ' +
      changed +
      ' web/source files ' +
      (write ? 'updated.' : 'need changes.'),
  );
  if (!write && changed) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
