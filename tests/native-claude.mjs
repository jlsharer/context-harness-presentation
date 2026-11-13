import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { loadNativeCatalog } from '../docs/kits/native/catalog.mjs';
import { planNativeInstall, applyNativeInstall } from '../docs/kits/native/install.mjs';

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'native-claude-'));
const catalog = loadNativeCatalog();
const home = path.join(temporary, '.claude');

const plan = (techniques, options = {}) =>
  planNativeInstall({ claudeHome: home, payload: catalog, techniques, ...options });

try {
  assert.equal(Object.keys(catalog.components).length, 20);
  assert.deepEqual(
    plan(['goal-reminder'])
      .files.map((f) => f.relative)
      .sort(),
    ['hooks/goal-reminder.mjs', 'settings.json'],
  );
  assert.deepEqual(
    plan(['task-contract']).files.map((f) => f.relative),
    ['rules/task-contract.md'],
  );
  const triage = plan(['qa-triage-skill']);
  assert.ok(triage.files.every((f) => f.relative.startsWith('skills/qa-failure-triage/')));
  assert.ok(triage.files.some((f) => f.relative === 'skills/qa-failure-triage/scripts/qa.mjs'));
  assert.ok(
    !triage.files.some(
      (f) => f.relative.includes('context-menu') || f.relative.endsWith('core.mjs'),
    ),
  );
  for (const id of Object.keys(catalog.components)) {
    const p = plan([id]);
    for (const f of p.files) {
      assert.doesNotMatch(f.relative, /context-kit|PROTOCOLS|context-menu/);
      assert.doesNotMatch(f.content, /\.context-kit|PROTOCOLS\.md|context-menu/);
    }
    assert.ok(
      p.files.some((f) => f.relative === catalog.components[id].primary),
      id,
    );
  }
  assert.equal(fs.existsSync(home), false, 'Preview has no filesystem side effects');
  fs.mkdirSync(home);
  const original = {
    permissions: { allow: ['Read'] },
    env: { COMPANY: 'unchanged' },
    hooks: { UserPromptSubmit: [{ hooks: [{ type: 'command', command: 'existing' }] }] },
  };
  fs.writeFileSync(path.join(home, 'settings.json'), JSON.stringify(original));
  applyNativeInstall(plan(['goal-reminder']));
  applyNativeInstall(plan(['goal-reminder']));
  applyNativeInstall(plan(['task-contract', 'qa-triage-skill']));
  const settings = JSON.parse(fs.readFileSync(path.join(home, 'settings.json')));
  assert.deepEqual(settings.permissions, original.permissions);
  assert.deepEqual(settings.env, original.env);
  assert.equal(settings.hooks.UserPromptSubmit.length, 2);
  assert.equal(fs.existsSync(path.join(home, '.context-kit')), false);
  applyNativeInstall(
    plan([
      'compaction-checkpoint',
      'checkpoint-restore',
      'bounded-results',
      'artifact-ledger',
      'report-contract',
    ]),
  );
  const repo = path.join(temporary, 'repo'),
    other = path.join(temporary, 'other');
  fs.mkdirSync(repo);
  fs.mkdirSync(other);
  const state = await import(
    pathToFileURL(path.join(home, 'skills/session-checkpoint/scripts/state.mjs'))
  );
  const checkpoint = {
    goal: 'Repair checkout fixture',
    constraints: ['Test-only patch'],
    source_anchors: ['revision:r1'],
    open_work: ['Required CI pending'],
    acceptance_checks: ['CI on r1'],
  };
  const scope = { cwd: repo, session_id: 'session-a' };
  const saved = state.writeCheckpoint(checkpoint, scope);
  assert.deepEqual(state.readCheckpoint(scope), checkpoint);
  assert.equal(state.readCheckpoint({ ...scope, cwd: other }), null);
  assert.equal(state.readCheckpoint({ ...scope, session_id: 'session-b' }), null);
  if (process.platform !== 'win32') assert.equal(fs.statSync(saved.path).mode & 0o777, 0o600);

  const invoke = (name, event) => {
    const result = spawnSync(process.execPath, [path.join(home, 'hooks', name + '.mjs')], {
      input: JSON.stringify(event),
      encoding: 'utf8',
    });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  };

  const restored = JSON.parse(
    invoke('restore-checkpoint', { ...scope, hook_event_name: 'SessionStart' }),
  );
  assert.match(restored.hookSpecificOutput.additionalContext, /Repair checkout fixture/);
  assert.deepEqual(
    JSON.parse(
      invoke('restore-checkpoint', {
        ...scope,
        session_id: 'session-b',
        hook_event_name: 'SessionStart',
      }),
    ),
    {},
  );
  assert.match(
    invoke('prepare-compaction', { ...scope, hook_event_name: 'PreCompact' }),
    /does not author or save/,
  );
  const draft = path.join(temporary, 'checkpoint.json');
  fs.writeFileSync(draft, JSON.stringify(checkpoint));
  const written = spawnSync(
    process.execPath,
    [
      path.join(home, 'skills/session-checkpoint/scripts/state.mjs'),
      'write',
      draft,
      '--cwd',
      repo,
      '--session-id',
      'session-cli',
    ],
    { encoding: 'utf8' },
  );
  assert.equal(written.status, 0, written.stderr);
  assert.deepEqual(state.readCheckpoint({ ...scope, session_id: 'session-cli' }), checkpoint);
  const response = {
    stdout: 'full tool result '.repeat(1000),
    stderr: '',
    interrupted: false,
    isImage: false,
    metadata: 'retained',
  };
  const event = {
    ...scope,
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    tool_response: response,
  };
  const bounded = JSON.parse(invoke('bound-tool-output', event)).hookSpecificOutput
    .updatedToolOutput;
  assert.equal(bounded.stdout.length, 8000);
  assert.equal(bounded.metadata, 'retained');
  const artifact = bounded.stdout.match(/full structured result: (.*?)\. Read it/)[1];
  assert.deepEqual(JSON.parse(fs.readFileSync(artifact)), response);
  assert.deepEqual(
    JSON.parse(
      invoke('bound-tool-output', { ...event, tool_response: { ...response, exit_code: 1 } }),
    ),
    {},
  );
  invoke('record-tool-evidence', { ...event, tool_name: 'Private tool input must not be stored' });
  const traceDir = path.join(home, 'state/tool-evidence');
  const trace = fs.readFileSync(
    path.join(
      traceDir,
      fs.readdirSync(traceDir).find((n) => n.endsWith('.jsonl')),
    ),
    'utf8',
  );
  assert.doesNotMatch(trace, /full tool result|Private tool input/);
  const denied = JSON.parse(
    invoke('validate-worker-return', {
      ...scope,
      hook_event_name: 'PreToolUse',
      tool_name: 'SubagentHandback',
      tool_input: { message: '{"summary":"done"}' },
    }),
  );
  assert.equal(denied.hookSpecificOutput.permissionDecision, 'deny');
  const failurePlan = plan(['source-selection', 'cache-audit']);
  const rename = fs.renameSync;
  let writes = 0;

  fs.renameSync = (...args) => {
    if (++writes === 2) throw Error('Simulated write interruption');
    return rename(...args);
  };

  try {
    assert.throws(() => applyNativeInstall(failurePlan), /Simulated/);
  } finally {
    fs.renameSync = rename;
  }
  assert.equal(
    fs.existsSync(path.join(home, 'skills/targeted-context/SKILL.md')),
    false,
    'Interrupted install rolls back new files',
  );
  for (let i = 0; i < 30; i++)
    state.writeCheckpoint(checkpoint, { ...scope, session_id: 'cap-' + i });
  assert.throws(
    () => state.writeCheckpoint(checkpoint, { ...scope, session_id: 'too-many' }),
    /full/,
  );
  const stale = plan(['cache-prefix']);
  fs.mkdirSync(path.join(home, 'rules'), { recursive: true });
  fs.writeFileSync(path.join(home, 'rules/stable-context-prefix.md'), 'User changed this');
  assert.throws(() => applyNativeInstall(stale), /changed|differs/i);
  assert.throws(() => plan(['cache-prefix']), /differs/i);
  fs.symlinkSync(path.join(temporary, 'redirected'), path.join(home, 'agents'));
  assert.throws(() => plan(['model-routing']), /symbolic|link/i);
  console.log(
    'PASS minimal native Claude components, independent skills, no framework, private ' +
      'additive install, config preservation and collision refusal',
  );
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
