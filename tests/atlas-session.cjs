const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
const docs = path.resolve(__dirname, '../docs');
assert.ok(
  fs.existsSync(path.join(docs, 'atlas-session.js')),
  'A session model must expose changing context across turns and calls',
);
const context = { TextEncoder };
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(docs, 'atlas-evidence.js'), 'utf8') +
    '\n' +
    fs.readFileSync(path.join(docs, 'atlas-session.js'), 'utf8') +
    ';this.S=AtlasSession;',
  context,
);
const S = context.S;

const clean = (x) => JSON.parse(JSON.stringify(x)),
  p = S.at(1, 'incident'),
  first = S.at(2, 'incident'),
  before = S.at(3, 'incident'),
  result = S.at(4, 'incident'),
  second = S.at(5, 'incident'),
  child = S.at(6, 'incident'),
  childCall = S.at(7, 'incident'),
  returned = S.at(8, 'incident'),
  compactBefore = S.at(10, 'incident'),
  compactAfter = S.at(11, 'incident'),
  nextTurn = S.at(12, 'incident');

assert.equal(p.turn, 1);
assert.equal(p.call, 0);
assert.equal(first.call, 1);
assert.equal(before.call, 1);
assert.equal(result.call, 1, 'Tool result must not increment model invocations');
assert.equal(second.call, 2);
assert.ok(
  !second.text.includes('Replay P2 output'),
  'Dispatch P2 must not contain its own future output',
);
assert.ok(
  !S.at(9, 'incident').text.includes('Replay P3 output'),
  'Dispatch P3 must not contain its own future output',
);
assert.ok(
  S.at(10, 'incident').text.includes('Replay P3 output'),
  'Completed P3 output enters pre-compaction state',
);
assert.ok(
  S.at(3, 'incident').text.includes('Replay P1 output'),
  'Tool request follows completed P1 generation',
);
assert.equal(second.turn, 1, 'Multiple calls can occur within one user turn');
assert.notEqual(result.text, before.text, 'Tool result changes active context');
assert.equal(child.session, 'child');
assert.equal(child.call, 0);
assert.equal(childCall.call, 1);
assert.equal(returned.session, 'parent');
assert.equal(returned.call, 2);
assert.ok(child.sourceFiles.length < second.sourceFiles.length, 'Child has a scoped source packet');
assert.ok(!child.text.includes('full parent transcript'), 'No implicit full-parent history');
assert.ok(!second.text.includes('Child handoff'), 'Child result enters parent only on return');
assert.ok(returned.text.includes('Child handoff'));
assert.ok(
  compactAfter.bytes < compactBefore.bytes,
  'Selected history/evidence is replaced by a checkpoint',
);
assert.ok(compactAfter.blocks.some((x) => x.id === 'checkpoint'));
assert.equal(
  compactAfter.externalFiles.length,
  15,
  'Original sources remain retrievable outside active input',
);
assert.equal(nextTurn.turn, 2);
assert.equal(nextTurn.call, 3, 'New prompt is not yet a new model invocation');
assert.equal(S.at(13, 'incident').call, 4);
for (const n of [1.5, -2, NaN, Infinity, 999]) {
  const x = S.at(n, 'incident');
  assert.ok(Number.isInteger(x.step));
  assert.ok(x.step >= 0 && x.step < S.events.length);
}
const a = S.candidate('all', 'task-first'),
  b = S.candidate('incident', 'task-first'),
  c = S.candidate('incident', 'evidence-first');
assert.ok(a.sourceFiles.length > b.sourceFiles.length);
assert.ok(!b.text.includes('2027 roadmap note'));
assert.ok(a.text.includes('2027 roadmap note'));
assert.equal(b.sourceBodyBytes, 8026);
assert.equal(b.bytes, Buffer.byteLength(b.text));
assert.equal(c.bytes, Buffer.byteLength(c.text));
assert.deepEqual(clean(b.sourceFiles), clean(c.sourceFiles));
assert.notEqual(b.text, c.text);
assert.deepEqual([...b.sections].map((x) => x.id).sort(), [...c.sections].map((x) => x.id).sort());
const excerpt = S.excerpt('context/02-storage-contract.md', 'STORAGE-2');
const original = S.files('all').find((f) => f.name === 'context/02-storage-contract.md');
assert.ok(original.text.includes(excerpt.text));
assert.ok(excerpt.text.includes('STORAGE-2'));
console.log(
  'PASS: changing per-call state; parent/child separation; tool boundaries; compaction and ' +
    'retained artifacts; turn2; invalid state; actual source inclusion, payload order and ' +
    'exact bytes/excerpts.',
);
