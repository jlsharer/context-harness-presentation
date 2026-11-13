const a = require('node:assert/strict'),
  fs = require('node:fs'),
  vm = require('node:vm'),
  p = require('node:path').resolve(__dirname, '../docs');
a.ok(fs.existsSync(p + '/atlas-replay08.js'), 'New single/delegation model required');
a.ok(fs.existsSync(p + '/atlas-platform08.js'), 'Platform loading/cache/weight model required');
const c = vm.createContext({ TextEncoder });
for (const f of [
  'atlas-evidence.js',
  'atlas-session.js',
  'atlas-workload.js',
  'atlas-replay08.js',
  'atlas-platform08.js',
])
  vm.runInContext(fs.readFileSync(p + '/' + f, 'utf8'), c);

const run = (s) => vm.runInContext(s, c),
  plain = (s) => JSON.parse(run('JSON.stringify(' + s + ')'));

for (const profile of ['service', 'platform', 'org'])
  for (let step = 0; step < 12; step++) {
    for (const mode of ['managed', 'uncurated']) {
      const d = plain(`AtlasReplay08.diff(${step},'${mode}','${profile}')`);
      a.equal(d.now.session, 'parent');
      a.equal(
        d.now.total,
        d.now.layers.reduce((n, l) => n + l.tokens, 0),
      );
      a.equal(d.net, d.now.total - (d.before?.total || 0));
      a.ok(!JSON.stringify(d).includes('Child handoff'));
    }
    const x = plain(`AtlasReplay08.at(${step},'managed','${profile}')`),
      y = plain(`AtlasReplay08.at(${step},'uncurated','${profile}')`);
    for (const id of ['base', 'tools', 'guidance'])
      a.equal(x.layers.find((l) => l.id === id).tokens, y.layers.find((l) => l.id === id).tokens);
  }
a.equal(
  run("AtlasReplay08.at(3,'managed','platform').methods.find(m=>m.layer==='history').hook"),
  'pretool',
  'Before-tool technique points to pre-tool boundary',
);
a.ok(run("AtlasReplay08.at(4,'managed','platform').methods.some(m=>m.layer==='history')"));
a.ok(run("AtlasReplay08.at(9,'managed','platform').layers.some(l=>l.id==='checkpoint')"));
for (let n = 1; n <= 3; n++)
  for (let step = 0; step < 7; step++) {
    const d = plain(`AtlasReplay08.delegation(${step},${n},'platform')`);
    for (const k of ['single', 'delegated'])
      a.equal(
        d[k].aggregate,
        d[k].calls.reduce((x, r) => x + r.tokens, 0),
      );
    a.equal(
      d.workPartitions.reduce((x, v) => x + v, 0),
      d.workTokens,
    );
    a.equal(
      d.sourcePartitions.reduce((x, v) => x + v, 0),
      8000,
    );
    a.ok(d.delegated.calls.filter((r) => r.session === 'child').every((r) => r.parent === false));
  }
for (let n = 1; n <= 3; n++) {
  const d = plain(`AtlasReplay08.delegation(6,${n},'platform')`);
  a.ok(
    Array.isArray(d.sourceUnits),
    'Each unique source keeps its token allowance across worker counts',
  );
  d.workerSourceIDs.forEach((ids, i) =>
    a.equal(
      ids.reduce((sum, id) => sum + d.sourceUnits.find((x) => x.id === id).tokens, 0),
      d.sourcePartitions[i],
    ),
  );
  a.ok(Array.isArray(d.workerWorkIDs), 'Unique worker work ledger required');
  a.deepEqual([...new Set(d.workerWorkIDs.flat())].sort(), [...d.uniqueWorkIDs].sort());
  a.deepEqual([...new Set(d.workerSourceIDs.flat())].sort(), [...d.uniqueSourceIDs].sort());
  const early = d.delegated.calls.filter((c) => c.id.endsWith('/C1'));
  a.equal(
    early.reduce((t, c) => t + c.workTokens, 0),
    6000,
    'Both strategies include the first tool-result half before work call1',
  );
}
a.ok(
  run(
    "AtlasReplay08.delegation(6,3,'platform').delegated.aggregate>AtlasReplay08.delegation(6,3,'platform').single.aggregate",
  ),
);
a.equal(
  run("AtlasPlatform08.loading('claude','root','startup').skillLocation"),
  '.claude/skills',
  'Concrete tree uses harness-native skill directory',
);
a.deepEqual(plain("AtlasPlatform08.loading('codex','payments','startup').loaded.map(f=>f.path)"), [
  'global/AGENTS.md',
  'repo/AGENTS.md',
  'repo/services/AGENTS.md',
  'repo/services/payments/AGENTS.override.md',
]);
a.equal(run("AtlasPlatform08.loading('codex','root','explore').loaded.length"), 2);
a.equal(run("AtlasPlatform08.loading('claude','root','startup').loaded.length"), 2);
a.equal(run("AtlasPlatform08.loading('claude','root','explore').loaded.length"), 4);
a.deepEqual(
  plain("AtlasPlatform08.loading('opencode','payments','startup').loaded.map(f=>f.path)"),
  [
    'global/AGENTS.md',
    'repo/services/payments/AGENTS.md',
    'repo/services/AGENTS.md',
    'repo/AGENTS.md',
  ],
);
for (const state of ['cold', 'reuse', 'edit', 'expired']) {
  const d = plain(`AtlasPlatform08.cache('${state}')`);
  a.equal(d.read + d.write + d.fresh, d.total);
  a.equal(d.total, 20000);
}
a.equal(run("AtlasPlatform08.cache('edit').read"), 8000);
a.equal(run("AtlasPlatform08.cache('reuse').read"), 14000);
a.equal(
  run("AtlasPlatform08.weights(4,0,0,'base').length"),
  5,
  'Include prior assistant history separately from user and tool tokens',
);
for (let q = 0; q < 5; q++)
  for (let head = 0; head < 2; head++)
    for (const gap of [0, 3]) {
      const r = plain(`AtlasPlatform08.weights(${q},${head},${gap},'base')`);
      a.ok(Math.abs(r.reduce((n, t) => n + t.weight, 0) - 1) < 1e-12);
      a.ok(r.slice(q + 1).every((t) => t.weight === 0));
    }
a.notDeepEqual(
  plain("AtlasPlatform08.weights(3,0,0,'base').map(r=>r.weight)"),
  plain("AtlasPlatform08.weights(3,1,0,'base').map(r=>r.weight)"),
);
console.log(
  'PASS single-session isolation/techniques; fixed-work invocation ledger; loading differences; cache partitions; causal RoPE/softmax math',
);
