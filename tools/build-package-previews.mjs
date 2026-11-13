/** Generate fresh-project file inventories from the real installer; never read user projects. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { planInstall } from '../docs/kits/install.mjs';
import { bundles, techniques } from '../docs/kits/selection.mjs';
import { formatText } from './format-source.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'context-preview-'));
const manifests = {},
  contents = {};
try {
  for (const harness of ['claude', 'opencode', 'codex', 'portable'])
    for (const [kind, items] of [
      ['bundle', bundles],
      ['technique', techniques],
    ])
      for (const item of items) {
        const plan = planInstall({
          root: temporary,
          harness,
          ...(kind === 'bundle' ? { kits: [item.id] } : { techniques: [item.id] }),
        });
        manifests[harness + ':' + kind + ':' + item.id] = plan.files
          .map((file) => {
            const text = file.content.replaceAll(temporary, '<PROJECT>');
            const hash = crypto.createHash('sha256').update(text).digest('hex');
            contents[hash] = text;
            return { path: file.relative, hash, markdown: file.relative.endsWith('.md') };
          })
          .sort((a, b) => a.path.localeCompare(b.path));
      }
  const data = {
    schema: 1,
    scope:
      'Fresh-project installer previews, with <PROJECT> root placeholders. Existing user ' +
      'settings and files are not read. Dependencies included; local installation merges ' +
      'reviewed private files.',
    manifests,
    contents,
  };
  fs.writeFileSync(
    path.join(root, 'docs/atlas-package-files14.js'),
    await formatText(
      "'use strict';\nconst atlasPackageFiles14=" + JSON.stringify(data) + ';\n',
      path.join(root, 'docs/atlas-package-files14.js'),
    ),
  );
  console.log(
    'Built',
    Object.keys(manifests).length,
    'package inventories;',
    Object.keys(contents).length,
    'deduplicated complete file bodies.',
  );
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
