import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { planInstall } from '../docs/kits/install.mjs';
import { loadNativeCatalog } from '../docs/kits/native/catalog.mjs';
import { planNativeInstall } from '../docs/kits/native/install.mjs';
const c = vm.createContext({});
vm.runInContext(fs.readFileSync('docs/atlas-package-files14.js', 'utf8'), c);
const data = JSON.parse(vm.runInContext('JSON.stringify(atlasPackageFiles14)', c));
const native = loadNativeCatalog();
assert.equal(Object.keys(data.manifests).length, 104);
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-package-preview-'));
try {
  for (const [key, files] of Object.entries(data.manifests)) {
    const [harness, kind, id] = key.split(':');
    const plan =
      harness === 'claude'
        ? planNativeInstall({
            claudeHome: temporary,
            payload: native,
            ...(kind === 'bundle' ? { kits: [id] } : { techniques: [id] }),
          })
        : planInstall({
            root: temporary,
            harness,
            ...(kind === 'bundle' ? { kits: [id] } : { techniques: [id] }),
          });
    assert.equal(
      new Set(plan.files.map((f) => f.relative)).size,
      plan.files.length,
      'No duplicate destination files',
    );
    assert.deepEqual(
      plan.files.map((f) => f.relative).sort(),
      files.map((f) => f.path).sort(),
      key,
    );
    const metadata = data.metadata[key];
    assert.ok(
      files.some((f) => f.path === metadata.primary),
      key + ' meaningful primary',
    );
    assert.ok(metadata.focus.includes(metadata.primary), key + ' primary is visible');
    assert.ok(
      metadata.focus.every((p) => files.some((f) => f.path === p)),
      key + ' focus subset',
    );
    if (harness === 'claude') {
      assert.equal(metadata.root, '~/.claude');
      assert.ok(files.every((f) => !/context-kit|context-menu|PROTOCOLS/.test(f.path)));
      assert.ok(fs.existsSync(path.join('docs', metadata.archive)), key + ' focused download');
    }
    for (const file of plan.files) {
      const expected = files.find((f) => f.path === file.relative);
      assert.equal(
        file.content.replaceAll(temporary, harness === 'claude' ? '<CLAUDE_HOME>' : '<PROJECT>'),
        data.contents[expected.hash],
        key + '/' + file.relative,
      );
    }
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
for (const [key, files] of Object.entries(data.manifests)) {
  assert.ok(files.length > 0, key);
  for (const f of files) {
    assert.ok(!f.path.startsWith('/') && !f.path.includes('..'));
    assert.equal(crypto.createHash('sha256').update(data.contents[f.hash]).digest('hex'), f.hash);
    assert.ok(!data.contents[f.hash].includes('/tmp/context-preview-'));
  }
}
const files = data.manifests['claude:technique:workflow-coordinator'];
for (const name of [
  'context-workflow',
  'qa-failure-triage',
  'qa-fixture-review',
  'qa-regression-design',
  'qa-evidence-report',
])
  assert.ok(
    files.some((f) => f.path === 'skills/' + name + '/SKILL.md'),
    name,
  );
for (const target of ['claude', 'codex', 'opencode', 'portable'])
  assert.ok(
    data.manifests[target + ':technique:qa-regression-workflow'].some((f) =>
      f.path.includes('qa-regression-repair/SKILL.md'),
    ),
  );
assert.ok(
  Buffer.byteLength(fs.readFileSync('docs/atlas-package-files14.js')) < 1500000,
  'deduplicated complete operational source bundle',
);
console.log(
  'PASS 104 fresh-project package inventories, full-body hashes, workflow/contained skills, four targets and deduplicated payload.',
);
