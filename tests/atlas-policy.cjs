const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm'),
  { pathToFileURL } = require('node:url');
(async () => {
  const file = path.resolve(__dirname, '../docs/policies/context-policy.mjs');
  assert.ok(fs.existsSync(file), 'Adaptable context-policy recipe must exist');
  const P = await import(pathToFileURL(file));
  const graph = [
    ['API', 'Service'],
    ['Service', 'Journal'],
    ['Service', 'Delivery'],
    ['Journal', 'API'],
    ['Delivery', 'Journal'],
    ['Cache', 'Service'],
  ];
  const result = P.scopeDependencies(graph, 'API', 2);
  assert.deepEqual(result.exact.sort(), ['Delivery', 'Journal']);
  assert.deepEqual(result.within.sort(), ['API', 'Delivery', 'Journal', 'Service']);
  assert.deepEqual(
    P.scopeDependencies(graph, 'API', 3).exact,
    [],
    'Cycles must not create nodes at a false shortest depth',
  );
  assert.throws(() => P.scopeDependencies(graph, 'API', 1.5), /integer/);
  const data = JSON.parse(
    vm.runInNewContext(
      fs.readFileSync(path.resolve(__dirname, '../docs/atlas-evidence.js'), 'utf8') +
        ';JSON.stringify(atlasEvidence)',
    ),
  );
  const files = data.files.slice(0, 8),
    before = JSON.stringify(files);
  const a = P.buildPacket(files, data.task, data.criteria, 'task-first'),
    b = P.buildPacket(files, data.task, data.criteria, 'evidence-first'),
    c = P.buildPacket(files, data.task, data.criteria, 'task-last');
  assert.notEqual(a.text, b.text);
  assert.ok(c.text.lastIndexOf(data.task) > c.text.indexOf('Acceptance checks'));
  for (const f of files) assert.ok(a.text.includes(f.text));
  assert.equal(JSON.stringify(files), before);
  assert.equal(a.bytes, Buffer.byteLength(a.text));
  assert.equal(a.sourceBodyBytes, 8026);
  assert.ok(P.requireAnchors(a.text, ['API-2', 'STORAGE-2', 'INCIDENT-2']));
  assert.throws(() => P.requireAnchors('API-2 only', ['API-2', 'STORAGE-2']), /STORAGE-2/);
  assert.throws(() => P.buildPacket(files, '', data.criteria, 'task-first'), /task/);
  console.log(
    'PASS: offline recipes preserve original fixture; exact/within BFS with cycles; explicit order; missing-anchor rejection; exact bytes.',
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
