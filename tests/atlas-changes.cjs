const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
const docs = path.resolve(__dirname, '../docs'),
  c = { TextEncoder };
vm.createContext(c);
vm.runInContext(
  fs.readFileSync(docs + '/atlas-evidence.js', 'utf8') +
    '\n' +
    fs.readFileSync(docs + '/atlas-session.js', 'utf8') +
    ';this.S=AtlasSession;',
  c,
);
const S = c.S;
assert.equal(
  typeof S.comparisonAt,
  'function',
  'Replay needs actual added/retained/removed comparisons',
);
const p2 = S.comparisonAt(5, 'incident');
assert.equal(p2.reference.step, 2);
assert.ok(p2.added.some((b) => b.text.includes('Read durable events')));
assert.equal(p2.removed.length, 0);
assert.ok(p2.retained.some((b) => b.id === 'evidence'));
assert.ok(!p2.added.some((b) => b.text.includes('Replay P2 output')));
const child = S.comparisonAt(6, 'incident');
assert.equal(child.reference, null);
assert.equal(child.current.session, 'child');
assert.equal(child.removed.length, 0, 'Fresh child is not a subtraction from parent');
assert.equal(child.added.length, 4);
const cc = S.comparisonAt(7, 'incident');
assert.equal(cc.reference.session, 'child');
assert.equal(cc.added.length, 0);
const p3 = S.comparisonAt(9, 'incident');
assert.equal(p3.reference.step, 5);
assert.ok(p3.added.some((b) => b.text.includes('Child handoff')));
assert.ok(p3.retained.some((b) => b.id === 'history'));
const compact = S.comparisonAt(11, 'incident');
assert.equal(compact.reference.step, 10);
assert.ok(compact.removed.some((b) => b.id === 'evidence'));
assert.ok(compact.removed.some((b) => b.id === 'history'));
assert.ok(compact.added.some((b) => b.id === 'checkpoint'));
assert.ok(compact.retained.some((b) => b.id === 'checks'));
assert.equal(compact.current.externalFiles.length, 15);
const p4 = S.comparisonAt(13, 'incident');
assert.equal(p4.reference.step, 9);
assert.ok(p4.added.some((b) => b.id === 'new-prompt'));
assert.ok(p4.retained.some((b) => b.id === 'task'));
for (let n = 0; n < 14; n++) {
  const d = S.comparisonAt(n, 'all');
  assert.ok(!d.reference || d.reference.session === d.current.session);
}
assert.equal(
  S.candidate('incident', 'task-last')
    .sections.map((x) => x.id)
    .join(','),
  'evidence,checks,task',
  'Placement recipe must be inspectable in the actual candidate',
);
const summary = S.summaryRequestAt(10, 'incident');
assert.equal(summary.id, 'S1');
assert.equal(summary.session, 'parent');
assert.equal(summary.kind, 'compaction');
assert.ok(summary.input.includes('Replay P3 output'));
assert.equal(summary.output, null);
assert.ok(S.summaryRequestAt(11, 'incident').output.includes('Keep API-2'));
assert.equal(S.summaryRequestAt(9, 'incident'), null);
console.log(
  'PASS: actual text diffs; same-session baselines; append retained prefix; child isolation; compaction replacement; P4 continuity.',
);
