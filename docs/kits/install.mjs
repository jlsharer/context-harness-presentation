import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const directory = path.dirname(fileURLToPath(import.meta.url)),
  catalog = JSON.parse(fs.readFileSync(path.join(directory, 'catalog.json')));

const quote = (s) => "'" + s.replaceAll("'", "'\\''") + "'";

function targetPath(root, relative) {
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep)) throw Error('Target escapes root');
  let cursor = root;
  for (const part of path.relative(root, target).split(path.sep)) {
    cursor = path.join(cursor, part);
    try {
      if (fs.lstatSync(cursor).isSymbolicLink())
        throw Error('Refusing symbolic-link target: ' + cursor);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return target;
}

export function planInstall({ root, harness, kits }) {
  if (!['claude', 'opencode', 'codex', 'portable'].includes(harness))
    throw Error('Choose claude, opencode, codex or portable');
  if (!Array.isArray(kits) || !kits.length || kits.some((id) => !catalog.some((k) => k.id === id)))
    throw Error('Choose known packages');
  const actual = fs.realpathSync(root),
    selectionPath = targetPath(actual, '.context-kit/selection.json'),
    prior = fs.existsSync(selectionPath)
      ? JSON.parse(fs.readFileSync(selectionPath, 'utf8'))
      : { kits: [], harnesses: [] };
  if (!Array.isArray(prior.kits) || prior.kits.some((id) => !catalog.some((k) => k.id === id)))
    throw Error('Unrecognized existing kit selection');
  const selected = [...new Set([...prior.kits, ...kits])].sort(),
    byHarness = { ...(prior.byHarness || {}) };
  if (prior.harness && !byHarness[prior.harness]) byHarness[prior.harness] = prior.kits;
  const active = [...new Set([...(byHarness[harness] || []), ...kits])].sort();
  byHarness[harness] = active;
  const files = [];

  const add = (relative, content, merge = false) => {
    const dest = targetPath(actual, relative);
    files.push({
      path: dest,
      relative,
      content,
      merge,
      expected: fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : null,
    });
  };

  for (const name of ['core.mjs', 'hook.mjs', 'run.mjs'])
    add('.context-kit/' + name, fs.readFileSync(path.join(directory, name), 'utf8'));
  add(
    '.context-kit/selection.json',
    JSON.stringify(
      {
        harnesses: [...new Set([...(prior.harnesses || [prior.harness].filter(Boolean)), harness])],
        kits: selected,
        byHarness,
      },
      null,
      2,
    ) + '\n',
    true,
  );

  const protocols = (ids) =>
      ids
        .map(
          (id) =>
            '# ' +
            catalog.find((k) => k.id === id).name +
            '\n' +
            fs.readFileSync(path.join(directory, 'protocols', id + '.md'), 'utf8'),
        )
        .join('\n\n'),
    protocolPath = targetPath(actual, '.context-kit/PROTOCOLS.md');

  if (
    fs.existsSync(protocolPath) &&
    fs.readFileSync(protocolPath, 'utf8') !== protocols(prior.kits)
  )
    throw Error('Existing protocols differ; review before replacing');
  add('.context-kit/PROTOCOLS.md', protocols(selected), true);
  if (fs.existsSync(path.join(directory, 'context-menu', 'SKILL.md')) && harness !== 'portable') {
    const folder = {
      claude: '.claude/skills',
      opencode: '.opencode/skills',
      codex: '.agents/skills',
    }[harness];
    add(
      folder + '/context-menu/SKILL.md',
      fs.readFileSync(path.join(directory, 'context-menu/SKILL.md'), 'utf8'),
    );
  }
  if (harness === 'claude') {
    const configPath = targetPath(actual, '.claude/settings.json'),
      config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
    config.hooks ??= {};

    const hook = (event, mode, matcher) => {
      const command =
          'node ' + quote(path.join(actual, '.context-kit/hook.mjs')) + ' ' + quote(mode),
        entry = { ...(matcher ? { matcher } : {}), hooks: [{ type: 'command', command }] };
      config.hooks[event] ??= [];
      if (!config.hooks[event].some((e) => JSON.stringify(e) === JSON.stringify(entry)))
        config.hooks[event].push(entry);
    };

    if (active.includes('continuity')) {
      hook('UserPromptSubmit', 'continuity');
      hook('PreCompact', 'continuity');
    }
    if (active.includes('handoff')) {
      hook('SubagentStart', 'handoff');
      hook('PreToolUse', 'handoff', '^SubagentHandback$');
    }
    if (active.includes('results')) hook('PostToolUse', 'results', '^Bash$');
    if (active.some((k) => ['continuity', 'handoff', 'results'].includes(k)))
      add('.claude/settings.json', JSON.stringify(config, null, 2) + '\n', true);
  }
  if (harness === 'opencode' && active.includes('continuity'))
    add(
      '.opencode/plugins/context-kit/index.ts',
      fs.readFileSync(path.join(directory, 'adapters/opencode.ts'), 'utf8'),
    );
  return { root: actual, harness, kits: selected, files };
}

export function applyInstall(plan) {
  for (const f of plan.files) {
    targetPath(plan.root, f.relative);
    const current = fs.existsSync(f.path) ? fs.readFileSync(f.path, 'utf8') : null;
    if (f.merge && current !== f.expected)
      throw Error('File changed since planning: ' + f.relative);
    if (fs.existsSync(f.path) && !f.merge && fs.readFileSync(f.path, 'utf8') !== f.content)
      throw Error('Existing file differs; review before replacing: ' + f.relative);
  }
  for (const f of plan.files) {
    fs.mkdirSync(path.dirname(f.path), { recursive: true });
    if (!fs.existsSync(f.path) || fs.readFileSync(f.path, 'utf8') !== f.content)
      fs.writeFileSync(f.path, f.content);
  }
  return plan;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2),
    get = (key, fallback) => (args.includes(key) ? args[args.indexOf(key) + 1] : fallback);

  try {
    const plan = planInstall({
      root: get('--target', '.'),
      harness: get('--harness', 'portable'),
      kits: get('--kits', 'focus').split(','),
    });
    if (args.includes('--apply')) applyInstall(plan);
    console.log(
      JSON.stringify(
        {
          mode: args.includes('--apply') ? 'installed' : 'preview',
          harness: plan.harness,
          kits: plan.kits,
          files: plan.files.map((f) => f.relative),
          scope:
            'Helpers validated offline. Native adapters require installed-version/runtime verification.',
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
