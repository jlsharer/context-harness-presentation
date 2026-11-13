import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateHandoff } from './core.mjs';

const statuses = ['passed', 'failed', 'pending', 'inaccessible', 'not-run'];
const classifications = ['product-defect', 'test-defect', 'environment-issue', 'unresolved'];

const text = (value, name, max = 2000) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max)
    throw Error(name + ' must be nonempty bounded text');
  return value;
};

const object = (value, keys, name) => {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).some((k) => !keys.includes(k))
  )
    throw Error('Invalid ' + name + ' fields');
};

const array = (value, name, max = 50) => {
  if (!Array.isArray(value) || value.length > max) throw Error('Invalid ' + name + ' array');
  return value;
};

const strings = (value, name) => array(value, name).map((x) => text(x, name));

const unique = (rows, key, name) => {
  const ids = rows.map((row) => text(row?.[key], name, 200));
  if (new Set(ids).size !== ids.length) throw Error('Duplicate ' + name);
};

const revision = (value) => {
  text(value, 'revision', 200);
  if (/^(SET_|REPLACE_)/.test(value))
    throw Error('Configure the actual revision before assessment');
  return value;
};

export function validateTask(task) {
  object(
    task,
    [
      'schema',
      'task_id',
      'goal',
      'revision',
      'classification_required',
      'required_checks',
      'constraints',
      'allowed_paths',
      'commands',
      'external_actions',
    ],
    'task',
  );
  if (task.schema !== 1) throw Error('Task schema must be 1');
  text(task.task_id, 'task_id', 200);
  if (/^(SET_|REPLACE_)/.test(task.task_id)) throw Error('Configure the task ID before assessment');
  text(task.goal, 'goal');
  revision(task.revision);
  if (typeof task.classification_required !== 'boolean')
    throw Error('classification_required must be boolean');
  const checks = array(task.required_checks, 'required checks', 30);
  if (!checks.length) throw Error('At least one required acceptance check is needed');
  unique(checks, 'id', 'required check ID');
  for (const check of checks) {
    object(check, ['id', 'kind'], 'required check');
    if (!['local', 'ci'].includes(check.kind))
      throw Error('Required check kind must be local or ci');
  }
  strings(task.constraints, 'constraints');
  strings(task.allowed_paths, 'allowed_paths');
  if (
    task.allowed_paths.some(
      (p) => /^(SET_|REPLACE_)/.test(p) || path.isAbsolute(p) || p.split(/[\\/]/).includes('..'),
    )
  )
    throw Error('Configure repository-relative approved edit paths');
  if (!task.commands || typeof task.commands !== 'object' || Array.isArray(task.commands))
    throw Error('commands map required');
  for (const command of Object.values(task.commands))
    if (command !== null) text(command, 'command');
  object(task.external_actions, ['push', 'deploy'], 'external actions');
  for (const key of ['push', 'deploy'])
    if (!['authorized', 'not-authorized'].includes(task.external_actions[key]))
      throw Error('Explicit external action metadata required');
  return task;
}

export function validateQAReport(report) {
  object(
    report,
    ['schema', 'task_id', 'revision', 'diagnosis', 'evidence', 'checks', 'risks', 'open_work'],
    'QA report',
  );
  if (report.schema !== 1) throw Error('Report schema must be 1');
  text(report.task_id, 'task_id', 200);
  revision(report.revision);
  object(
    report.diagnosis,
    ['classification', 'summary', 'supporting_evidence', 'counter_evidence'],
    'diagnosis',
  );
  if (!classifications.includes(report.diagnosis.classification))
    throw Error('Unknown diagnosis classification');
  text(report.diagnosis.summary, 'diagnosis summary');
  const evidence = array(report.evidence, 'evidence');
  unique(evidence, 'id', 'evidence ID');
  for (const e of evidence) {
    object(e, ['id', 'anchor', 'note'], 'evidence');
    text(e.anchor, 'evidence anchor');
    text(e.note, 'evidence note');
  }
  for (const id of [
    ...strings(report.diagnosis.supporting_evidence, 'supporting evidence'),
    ...strings(report.diagnosis.counter_evidence, 'counter evidence'),
  ])
    if (!evidence.some((e) => e.id === id)) throw Error('Diagnosis references missing evidence');
  if (
    report.diagnosis.classification !== 'unresolved' &&
    !report.diagnosis.supporting_evidence.length
  )
    throw Error('Resolved diagnosis requires supporting evidence');
  const checks = array(report.checks, 'checks', 30);
  unique(checks, 'id', 'check ID');
  for (const check of checks) {
    object(
      check,
      ['id', 'kind', 'revision', 'status', 'command', 'artifact', 'run_id', 'url'],
      'check',
    );
    if (!['local', 'ci'].includes(check.kind) || !statuses.includes(check.status))
      throw Error('Unknown check kind/status');
    revision(check.revision);
    text(check.command, 'check command/job');
    for (const key of ['artifact', 'run_id', 'url']) if (check[key] !== null) text(check[key], key);
    if (check.status === 'passed') {
      if (!check.artifact) throw Error('Passed checks require an artifact reference');
      if (check.kind === 'ci') {
        if (!check.run_id || !check.url)
          throw Error('Passed CI needs run identity and HTTPS evidence URL');
        let url;
        try {
          url = new URL(check.url);
        } catch {
          throw Error('CI evidence needs a valid HTTPS URL');
        }
        if (url.protocol !== 'https:' || url.username || url.password)
          throw Error('CI evidence URL must use HTTPS without credentials');
      }
    }
  }
  strings(report.risks, 'risks');
  strings(report.open_work, 'open_work');
  if (Buffer.byteLength(JSON.stringify(report)) > 128 * 1024)
    throw Error('Full QA report exceeds 128 KiB; keep large evidence in linked artifacts');
  return report;
}

export function assessEvidence(task, report) {
  validateTask(task);
  validateQAReport(report);
  const reasons = [];
  if (task.task_id !== report.task_id) reasons.push('Task identity does not match');
  if (task.revision !== report.revision) reasons.push('Report revision does not match the target');
  if (task.classification_required && report.diagnosis.classification === 'unresolved')
    reasons.push('Required diagnosis is unresolved');
  for (const required of task.required_checks) {
    const check = report.checks.find((c) => c.id === required.id);
    if (!check) reasons.push('Required check missing: ' + required.id);
    else if (
      check.kind !== required.kind ||
      check.revision !== task.revision ||
      check.status !== 'passed'
    )
      reasons.push('Required check not verified for target revision: ' + required.id);
  }
  if (report.open_work.length) reasons.push('Declared acceptance work remains open');
  return {
    schema: 1,
    evidence_gate_passed: reasons.length === 0,
    required_checks: task.required_checks.length,
    reasons,
    scope:
      'Structure and declared evidence coverage only; not factual truth, artifact ' +
      'authenticity, authorization or release approval. Verify the referenced results independently.',
  };
}

export function toHandoff(task, report, reportAnchor) {
  const gate = assessEvidence(task, report);
  text(reportAnchor, 'full report anchor');
  return validateHandoff({
    task_id: report.task_id,
    summary: report.diagnosis.summary,
    source_anchors: [reportAnchor, ...report.evidence.slice(0, 10).map((e) => e.anchor)],
    findings: [
      'Classification: ' + report.diagnosis.classification,
      'Declared evidence gate: ' +
        (gate.evidence_gate_passed ? 'passed (facts still require review)' : 'incomplete'),
    ],
    checks: report.checks.map((c) => ({
      command: c.command,
      status:
        c.revision === task.revision && ['passed', 'failed'].includes(c.status)
          ? c.status
          : 'not-run',
    })),
    open_questions: [...gate.reasons, ...report.open_work],
  });
}

function readJSON(file) {
  const size = fs.statSync(file).size;
  if (size > 128 * 1024) throw Error('QA input exceeds 128 KiB');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, file, ...args] = process.argv.slice(2),
    taskFile = args.includes('--task') ? args[args.indexOf('--task') + 1] : null;
  try {
    let result;
    if (command === 'validate-task') result = { valid: Boolean(validateTask(readJSON(file))) };
    else if (command === 'validate-report')
      result = { valid: Boolean(validateQAReport(readJSON(file))) };
    else if (command === 'assess' || command === 'handoff') {
      if (!taskFile) throw Error('--task FILE is required to bind acceptance checks');
      const task = readJSON(taskFile),
        report = readJSON(file);
      result = command === 'assess' ? assessEvidence(task, report) : toHandoff(task, report, file);
      if (command === 'assess' && !result.evidence_gate_passed) process.exitCode = 2;
    } else {
      console.log(
        'Usage: node .context-kit/qa.mjs validate-task TASK.json | validate-report REPORT.json | ' +
          'assess REPORT.json --task TASK.json | handoff REPORT.json --task TASK.json\nNo commands, ' +
          'network calls, pushes or model requests are executed. Assessment validates declared ' +
          'evidence coverage, not truth.',
      );
      process.exitCode = command && !['--help', '-h'].includes(command) ? 1 : 0;
    }
    if (result) console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(
      error instanceof SyntaxError
        ? 'Invalid local QA JSON; inspect it in a local editor.'
        : error.message,
    );
    process.exitCode = 1;
  }
}
