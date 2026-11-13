import assert from 'node:assert/strict';
import { validateTask, validateQAReport, assessEvidence, toHandoff } from '../docs/kits/qa.mjs';
const task = {
  schema: 1,
  task_id: 'qa-42',
  goal: 'Fix shared cart fixture',
  revision: 'abc123',
  classification_required: true,
  required_checks: [
    { id: 'local', kind: 'local' },
    { id: 'ci', kind: 'ci' },
  ],
  constraints: ['Keep checkout API unchanged'],
  allowed_paths: ['tests/'],
  commands: { targeted: 'pnpm test checkout' },
  external_actions: { push: 'not-authorized', deploy: 'not-authorized' },
};
const report = {
  schema: 1,
  task_id: 'qa-42',
  revision: 'abc123',
  diagnosis: {
    classification: 'test-defect',
    summary: 'Shared mutable cart fixture',
    supporting_evidence: ['source-1'],
    counter_evidence: [],
  },
  evidence: [
    { id: 'source-1', anchor: 'tests/fixtures/cart.ts:12', note: 'Per-test ownership missing' },
  ],
  checks: [
    {
      id: 'local',
      kind: 'local',
      revision: 'abc123',
      status: 'passed',
      command: 'pnpm test checkout',
      artifact: 'reports/local.xml',
      run_id: null,
      url: null,
    },
    {
      id: 'ci',
      kind: 'ci',
      revision: 'abc123',
      status: 'passed',
      command: 'checkout shard',
      artifact: 'reports/ci.xml',
      run_id: '1842',
      url: 'https://ci.example/runs/1842',
    },
  ],
  risks: [],
  open_work: [],
};

const copy = (value) => JSON.parse(JSON.stringify(value));

assert.equal(validateTask(task).task_id, 'qa-42');
assert.equal(validateQAReport(report).checks.length, 2);
assert.equal(assessEvidence(task, report).evidence_gate_passed, true);
let changed = copy(report);
changed.checks[1].status = 'pending';
assert.equal(assessEvidence(task, changed).evidence_gate_passed, false);
assert.equal(toHandoff(task, changed, 'reports/qa.json').checks[1].status, 'not-run');
changed = copy(report);
changed.checks[1].revision = 'other-revision';
assert.equal(assessEvidence(task, changed).evidence_gate_passed, false);
assert.equal(toHandoff(task, changed, 'reports/qa.json').checks[1].status, 'not-run');
changed = copy(report);
changed.checks = [];
assert.equal(assessEvidence(task, changed).evidence_gate_passed, false);
changed = copy(report);
changed.checks[0].artifact = null;
assert.throws(() => validateQAReport(changed), /artifact/i);
changed = copy(report);
changed.checks.push(changed.checks[0]);
assert.throws(() => validateQAReport(changed), /duplicate/i);
changed = copy(report);
changed.diagnosis.classification = 'unresolved';
assert.equal(assessEvidence(task, changed).evidence_gate_passed, false);
changed = copy(report);
changed.diagnosis.supporting_evidence = ['missing-id'];
assert.throws(() => validateQAReport(changed), /evidence/i);
changed = copy(report);
changed.checks[1].url = 'javascript:alert(1)';
assert.throws(() => validateQAReport(changed), /https/i);
changed = copy(report);
changed.open_work = ['Required approval missing'];
assert.equal(assessEvidence(task, changed).evidence_gate_passed, false);
changed = copy(task);
changed.required_checks = [];
assert.throws(() => validateTask(changed), /required/i);
changed = copy(task);
changed.revision = 'SET_TARGET_REVISION';
assert.throws(() => validateTask(changed), /revision/i);
assert.ok(Buffer.byteLength(JSON.stringify(toHandoff(task, report, 'reports/qa.json'))) < 12000);
assert.match(assessEvidence(task, report).scope, /not.*truth|not.*factual/i);
console.log(
  'PASS QA evidence contracts: task-bound required checks, revision identity, ' +
    'pending/inaccessible/unknowns, artifacts, duplicate rejection, evidence IDs, safe URLs ' +
    'and bounded handoff.',
);
