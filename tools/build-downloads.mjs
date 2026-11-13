/** Rebuild the active downloads from formatted source; preserve frozen experiment bytes. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { formatText } from './format-source.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packager = path.join(root, 'tools/package-sources.py');

const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const run = (file, args = []) =>
  execFileSync('python3', [path.join(root, file), ...args], { cwd: root, stdio: 'inherit' });

const packageDirectory = (source, output, files) =>
  execFileSync(
    'python3',
    [packager, '--source-dir', source, '--output', output, ...(files ? ['--files', ...files] : [])],
    { stdio: 'inherit' },
  );

async function readableArchive(source, output) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'readable-presentation-'));
  try {
    execFileSync('python3', [packager, '--extract', source, '--target', temporary]);

    async function visit(folder) {
      for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
        const file = path.join(folder, entry.name);
        if (entry.isDirectory()) await visit(file);
        else if (/\.(?:js|mjs|cjs|ts|css|html|json)$/.test(file)) {
          fs.writeFileSync(file, await formatText(fs.readFileSync(file, 'utf8'), file));
        }
      }
    }

    await visit(temporary);
    packageDirectory(temporary, output);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

execFileSync(process.execPath, [path.join(root, 'tools/build-native-claude.mjs')], {
  cwd: root,
  stdio: 'inherit',
});
run('tools/build-context-kits.py');
run('tools/build-qa-workflow.py');
execFileSync(process.execPath, [path.join(root, 'tools/build-package-previews.mjs')], {
  cwd: root,
  stdio: 'inherit',
});
run('tools/build-context-audit.py');
packageDirectory(path.join(root, 'docs/policies'), path.join(root, 'docs/policies/workshop.zip'));
const starters = path.join(root, 'docs/benchmark-data/service-starters.zip');
const originalHash = hash(starters);
await readableArchive(
  starters,
  path.join(root, 'docs/benchmark-data/service-starters-readable.zip'),
);
if (hash(starters) !== originalHash) throw Error('Frozen benchmark archive changed');
if (fs.existsSync(path.join(root, 'presentation-render-tool.zip'))) {
  packageDirectory(root, path.join(root, 'presentation-render-tool.zip'), [
    'tools/README.md',
    'tools/Render-Presentation.ps1',
    'tools/presentation-navigation.mjs',
    'tools/render-presentation.mjs',
  ]);
}
const legacy = path.join(root, 'Context_Harness_GitHub_Pages.zip');
if (fs.existsSync(legacy)) await readableArchive(legacy, legacy);
console.log('Rebuilt formatted workshop downloads; original recorded benchmark archive unchanged.');
