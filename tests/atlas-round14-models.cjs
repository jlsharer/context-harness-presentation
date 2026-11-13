const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const c = vm.createContext({});
for (const file of [
  'atlas-pricing12.js',
  'atlas-model12.js',
  'atlas-model10.js',
  'atlas-qa14.js',
  'atlas-model14.js',
])
  vm.runInContext(fs.readFileSync('docs/' + file, 'utf8'), c);

const run = (code) => JSON.parse(vm.runInContext('JSON.stringify(' + code + ')', c));

assert.equal(run('atlasQA14.events.length'), 23);
assert.equal(run('atlasQA14.phases.length'), 6);
for (let step = 0; step < 23; step++) {
  const d = run(`AtlasModel14.delegation(${step})`);
  for (const lane of ['single', 'delegated']) {
    assert.equal(
      d[lane].input,
      d[lane].calls.reduce((sum, call) => sum + call.input, 0),
    );
    for (const call of d[lane].calls) assert.equal(call.input, call.fresh + call.read + call.write);
    assert.equal(
      d[lane].cost,
      d[lane].calls.reduce((sum, call) => sum + call.cost.total, 0),
    );
  }
  for (const report of d.reports) assert.ok(report.admit <= step, 'no future return enters parent');
  if (step < 6) assert.equal(d.reports.length, 0);
}
const final = run('AtlasModel14.delegation(22)');
for (const id of ['single', 'parent', 'W1', 'W2', 'W3']) {
  const billing = run(`AtlasModel14.billing(AtlasModel14.delegation(22).actors.${id})`);
  assert.ok(Math.abs(billing.formula - billing.cost) < 1e-9);
  assert.ok(Math.abs(billing.parts.reduce((n, p) => n + p.share, 0) - 1) < 1e-12);
}
assert.equal(final.reports.length, 4);
assert.ok(final.actors.W1.calls > 0 && final.actors.W3.calls > final.actors.W1.calls);
assert.notEqual(final.actors.W1.latest.total, final.actors.W2.latest.total);
assert.ok(
  run("AtlasModel14.at(16, 'managed').total") < run("AtlasModel14.at(15, 'managed').total"),
);
assert.equal(run("AtlasModel14.at(0, 'managed').calls"), 0);
const h = run("AtlasModel14.heat(12, 'managed')");
assert.ok(Math.abs(h.rows.reduce((sum, row) => sum + row.weight, 0) - 1) < 1e-10);
assert.equal(run('atlasQA14.events[7].classification'), 'test-defect');
assert.match(run('atlasQA14.events[20].evidence'), /same revision/);
console.log(
  'PASS R14: 23 causal QA events, six jumps, independent calls/cache/costs, worker scopes/reports, compaction and illustrative heat.',
);
