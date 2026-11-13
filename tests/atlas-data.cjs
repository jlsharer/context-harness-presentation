const fs = require('fs'),
  vm = require('vm'),
  assert = require('assert/strict'),
  crypto = require('crypto');
const base = require('path').resolve(__dirname, '../docs') + '/';
const bundled = vm.runInNewContext(
  fs.readFileSync(base + 'atlas-sources.js', 'utf8') + ';JSON.stringify({atlasSources,atlasStudy})',
);
const bundle = JSON.parse(bundled);
assert.deepEqual(
  bundle.atlasSources,
  JSON.parse(fs.readFileSync(base + 'research/round03/sources.json')),
);
assert.deepEqual(
  bundle.atlasStudy,
  JSON.parse(fs.readFileSync(base + 'research/round03/nolima-table4.json')),
);
const manifest = JSON.parse(fs.readFileSync(base + 'research/round03/figures/manifest.json'));
assert.equal(
  crypto
    .createHash('sha256')
    .update(fs.readFileSync(base + 'research/round03/figures/' + manifest.file))
    .digest('hex'),
  manifest.sha256,
);
const evidence = JSON.parse(
  vm.runInNewContext(
    fs.readFileSync(base + 'atlas-evidence.js', 'utf8') + ';JSON.stringify(atlasEvidence)',
  ),
);
const original = JSON.parse(
  fs.readFileSync(base + 'benchmark-data/service-1-incident-recovery-A-inputs.json'),
);
assert.equal(evidence.files.length, 15);
for (const file of evidence.files) {
  const source = original.starterFiles.find((f) => f.path === file.name || f.name === file.name);
  assert.ok(source, 'Source exists: ' + file.name);
  assert.equal(file.text, source.content ?? source.text, 'Unchanged source text: ' + file.name);
}
console.log(
  'PASS: bundled source catalog and research data match durable JSON; archived figure ' +
    'SHA256 matches; all 15 fixture source bodies match original record.',
);
