/** Build focused native downloads from the same component records used for previews. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadNativeCatalog } from '../docs/kits/native/catalog.mjs';
import { planNativeInstall, resolveNative } from '../docs/kits/native/install.mjs';
import { formatText } from './format-source.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'docs/kits');
const catalog = loadNativeCatalog({ fresh: true });
const cache = new Map();
for (const component of Object.values(catalog.components))
  for (const file of component.files) {
    const key = file.hash + ':' + path.extname(file.path);
    if (!cache.has(key))
      cache.set(
        key,
        /\.(mjs|js|json)$/.test(file.path)
          ? await formatText(file.content, file.path)
          : file.content,
      );
    file.content = cache.get(key);
    file.hash = crypto.createHash('sha256').update(file.content).digest('hex');
  }
fs.writeFileSync(
  path.join(output, 'native/catalog.json'),
  await formatText(JSON.stringify(catalog), path.join(output, 'native/catalog.json')),
);
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'native-packages-'));
try {
  const packages = [
    ['all', Object.keys(catalog.components)],
    ...Object.keys(catalog.components).map((id) => ['technique-' + id, [id]]),
    ...Object.entries(catalog.bundles).map(([id, ids]) => ['bundle-' + id, ids]),
  ];
  fs.mkdirSync(path.join(output, 'claude'), { recursive: true });
  for (const [name, roots] of packages) {
    const directory = path.join(temporary, name);
    fs.mkdirSync(directory);
    const ids = resolveNative(catalog, roots);
    const descriptor = {
      schema: 1,
      defaults: name === 'all' ? catalog.defaults : roots,
      bundles: Object.fromEntries(
        Object.entries(catalog.bundles).filter(([, children]) =>
          children.every((id) => ids.includes(id)),
        ),
      ),
      components: {},
    };
    const written = new Set();
    for (const id of ids) {
      const component = catalog.components[id];
      descriptor.components[id] = {
        ...component,
        files: component.files.map(({ path, hash }) => ({ path, hash })),
      };
      for (const file of component.files) {
        if (written.has(file.path)) continue;
        written.add(file.path);
        const dest = path.join(directory, 'files', file.path);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, file.content);
      }
    }
    fs.writeFileSync(
      path.join(directory, 'components.json'),
      JSON.stringify(descriptor, null, 2) + '\n',
    );
    fs.copyFileSync(path.join(output, 'native/install.mjs'), path.join(directory, 'install.mjs'));
    const plan = planNativeInstall({
      claudeHome: path.join(temporary, 'preview-home'),
      payload: catalog,
      techniques: roots,
    });
    const settings = plan.files.find((f) => f.relative === 'settings.json');
    if (settings)
      fs.writeFileSync(
        path.join(directory, 'settings.fragment.json'),
        settings.content.replaceAll(path.join(temporary, 'preview-home'), '<CLAUDE_HOME>'),
      );
    fs.writeFileSync(
      path.join(directory, 'README.md'),
      `# Native Claude components: ${name}\n\nRequires Node.js 18+. This download contains only ${name === 'all' ? 'the native component library' : 'this selection and its dependencies'}.\n\nRun \`node install.mjs\` for a path-only preview. Run \`node install.mjs --apply\` to install the shown components into your normal personal Claude directory (CLAUDE_CONFIG_DIR, otherwise ~/.claude). Use \`--claude-home /path/to/fixture/.claude\` for another explicit configuration directory. The library archive accepts \`--techniques id1,id2\` or \`--kits bundle1,bundle2\`; its default selection is focused kickoff and continuity.\n\nOnly native skills, rules, agents, hook scripts and selected settings entries are installed. No runtime framework, registry or protocol index is required. Files under files/ show the exact installed relative paths. settings.fragment.json is a review example, not a replacement for your existing settings. The installer merges only selected hooks and preserves permissions, environment and unrelated configuration. It does not turn on auto mode, exporters, or network services. Existing differing files are refused, including upgrades: review changes locally before replacement. Identical reapplication and additive installs are supported.\n\nRules enter normal startup context; skills load on use; scripts run on their registered events. Native policies/versions can disable customization. Loaded instructions do not guarantee compliance. PreCompact provides summary guidance, not factual state creation. When selected, the session-checkpoint skill explicitly validates and saves cwd/session-scoped state; restore never selects another session's latest file. Hook artifacts and checkpoints are bounded private local data under the Claude home's state/ directories, created only when used. Full stores skip/refuse capture; nothing is automatically deleted. Windows needs appropriate ACLs.\n\nAfter installation, the extracted download can be deleted: runtime references use installed paths. Verify discovery/events in a fresh approved Claude session. Offline helper/install tests are not native runtime certification or evidence of savings. Sources: [memory/rules](https://code.claude.com/docs/en/memory), [skills](https://code.claude.com/docs/en/skills), [hooks](https://code.claude.com/docs/en/hooks).\n`,
    );
    const zip =
      name === 'all'
        ? path.join(output, 'claude-native.zip')
        : path.join(output, 'claude', name + '.zip');
    execFileSync(
      'python3',
      [path.join(root, 'tools/package-sources.py'), '--source-dir', directory, '--output', zip],
      { stdio: 'pipe' },
    );
  }
  console.log(
    'Built native Claude library +26 focused downloads, using minimal selected component files',
  );
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
