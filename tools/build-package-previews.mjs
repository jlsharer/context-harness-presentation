/** Generate fresh-project file inventories from the real installer; never read user projects. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { planInstall } from '../docs/kits/install.mjs';
import { bundles, techniques } from '../docs/kits/selection.mjs';
import { formatText } from './format-source.mjs';
import { loadNativeCatalog } from '../docs/kits/native/catalog.mjs';
import { planNativeInstall } from '../docs/kits/native/install.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'context-preview-'));
const manifests = {},
  contents = {},
  metadata = {};
const native = loadNativeCatalog();
try {
  for (const harness of ['claude', 'opencode', 'codex', 'portable'])
    for (const [kind, items] of [
      ['bundle', bundles],
      ['technique', techniques],
    ])
      for (const item of items) {
        const requested = kind === 'bundle' ? item.techniques : [item.id];
        const plan =
          harness === 'claude'
            ? planNativeInstall({ claudeHome: temporary, payload: native, techniques: requested })
            : planInstall({
                root: temporary,
                harness,
                ...(kind === 'bundle' ? { kits: [item.id] } : { techniques: [item.id] }),
              });
        const key = harness + ':' + kind + ':' + item.id;
        const nativePrimary = harness === 'claude' ? native.components[requested[0]].primary : null;
        const primary =
          nativePrimary ||
          (kind === 'technique' && item.skill
            ? plan.files.find((f) => f.relative.endsWith('/' + item.skill + '/SKILL.md'))?.relative
            : '.context-kit/protocols/' + requested[0] + '.md');
        const focus =
          harness === 'claude'
            ? plan.files
                .filter((f) => f.owners.some((owner) => requested.includes(owner)))
                .map((f) => f.relative)
            : plan.files
                .filter((f) =>
                  requested.some((id) => {
                    const t = techniques.find((entry) => entry.id === id);
                    return (
                      f.relative === '.context-kit/protocols/' + id + '.md' ||
                      (t.skill && f.relative.includes('/' + t.skill + '/'))
                    );
                  }),
                )
                .map((f) => f.relative);
        metadata[key] = {
          primary,
          focus,
          root: harness === 'claude' ? '~/.claude' : '<PROJECT>',
          archive: harness === 'claude' ? 'kits/claude/' + kind + '-' + item.id + '.zip' : null,
          loading:
            harness === 'claude'
              ? requested.map((id) => native.components[id].loading)
              : [
                  'Legacy project/portable integration. Arbitrary protocol files are not loaded ' +
                    'automatically; inspect the selected native entry or explicit helper invocation.',
                ],
        };
        manifests[harness + ':' + kind + ':' + item.id] = plan.files
          .map((file) => {
            const text = file.content.replaceAll(
              temporary,
              harness === 'claude' ? '<CLAUDE_HOME>' : '<PROJECT>',
            );
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
    metadata,
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
