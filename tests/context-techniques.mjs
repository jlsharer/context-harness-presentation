import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { planInstall, applyInstall } from '../docs/kits/install.mjs';
import { resolveSelection, techniques } from '../docs/kits/selection.mjs';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'context-techniques-'));
try {
  assert.equal(techniques.length, 20);
  for (const harness of ['claude', 'codex', 'opencode', 'portable']) {
    const qaRoot = path.join(root, 'qa-reinstall-' + harness);
    fs.mkdirSync(qaRoot);
    applyInstall(planInstall({ root: qaRoot, harness, kits: ['qa'] }));
    assert.doesNotThrow(() => applyInstall(planInstall({ root: qaRoot, harness, kits: ['qa'] })));
    assert.doesNotThrow(() =>
      applyInstall(planInstall({ root: qaRoot, harness, techniques: ['goal-reminder'] })),
    );
  }
  assert.deepEqual(
    resolveSelection({ kits: ['continuity'] }).sort(),
    ['goal-reminder', 'compaction-checkpoint', 'checkpoint-restore'].sort(),
  );
  assert.deepEqual(
    resolveSelection({ techniques: ['model-routing'] }).sort(),
    ['model-routing', 'scoped-worker', 'report-contract'].sort(),
  );
  assert.throws(() => resolveSelection({ techniques: ['imaginary'] }));
  fs.writeFileSync(
    path.join(root, 'CLAUDE.md'),
    '# Existing guidance\nNever delete customer fixtures.\n',
  );
  fs.mkdirSync(path.join(root, '.claude'));
  const settings = {
    permissions: { allow: ['Read'] },
    env: { OTEL_EXPORTER_OTLP_ENDPOINT: 'https://internal.example' },
    hooks: { SessionStart: [{ hooks: [{ type: 'command', command: 'existing' }] }] },
  };
  fs.writeFileSync(path.join(root, '.claude/settings.json'), JSON.stringify(settings));
  const p = planInstall({
    root,
    harness: 'claude',
    techniques: ['goal-reminder', 'task-contract'],
  });
  assert.equal(fs.existsSync(path.join(root, '.context-kit')), false);
  applyInstall(p);
  let actual = JSON.parse(fs.readFileSync(path.join(root, '.claude/settings.json')));
  assert.equal(actual.hooks.UserPromptSubmit.length, 1);
  assert.equal(
    actual.hooks.PreCompact,
    undefined,
    'standalone reminder must not activate compaction',
  );
  assert.equal(actual.hooks.SubagentStart, undefined);
  assert.deepEqual(actual.env, settings.env);
  assert.deepEqual(actual.permissions, settings.permissions);
  const interrupted = path.join(root, 'interrupted');
  fs.mkdirSync(interrupted);
  fs.writeFileSync(path.join(interrupted, 'CLAUDE.md'), '# Preserve this guidance\n');
  fs.mkdirSync(path.join(interrupted, '.claude'));
  fs.writeFileSync(path.join(interrupted, '.claude/settings.json'), JSON.stringify(settings));
  const interruptedPlan = planInstall({
    root: interrupted,
    harness: 'claude',
    techniques: ['goal-reminder', 'task-contract'],
  });
  const originalWrite = fs.writeFileSync;
  let injected = false;

  fs.writeFileSync = function (file, ...args) {
    if (String(file).endsWith('/.context-kit/selection.json') && !injected) {
      injected = true;
      throw Error('simulated write failure');
    }
    return originalWrite.call(this, file, ...args);
  };

  try {
    assert.throws(() => applyInstall(interruptedPlan), /simulated write failure/);
  } finally {
    fs.writeFileSync = originalWrite;
  }
  assert.equal(
    fs.readFileSync(path.join(interrupted, 'CLAUDE.md'), 'utf8'),
    '# Preserve this guidance\n',
  );
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(interrupted, '.claude/settings.json'))),
    settings,
  );
  assert.equal(
    fs.existsSync(path.join(interrupted, '.context-kit/core.mjs')),
    false,
    'failed apply should restore prior files',
  );
  const legacy = path.join(root, 'legacy');
  fs.mkdirSync(path.join(legacy, '.context-kit'), { recursive: true });
  const originalHelpers = JSON.parse(fs.readFileSync('tests/fixtures/context-kit-legacy.json'));
  const legacyHashes = JSON.parse(fs.readFileSync('docs/kits/legacy-hashes.json'));
  for (const [name, source] of Object.entries(originalHelpers)) {
    assert.equal(
      crypto.createHash('sha256').update(source).digest('hex'),
      legacyHashes['.context-kit/' + name],
    );
    fs.writeFileSync(path.join(legacy, '.context-kit', name), source);
  }
  fs.writeFileSync(
    path.join(legacy, '.context-kit/selection.json'),
    JSON.stringify({ harness: 'claude', kits: ['focus'], harnesses: ['claude'] }),
  );
  fs.writeFileSync(
    path.join(legacy, '.context-kit/PROTOCOLS.md'),
    '# Focused kickoff\n' + fs.readFileSync('docs/kits/protocols/focus.md', 'utf8'),
  );
  applyInstall(planInstall({ root: legacy, harness: 'claude', techniques: ['goal-reminder'] }));
  assert.equal(
    fs.readFileSync(path.join(legacy, '.context-kit/hook.mjs'), 'utf8'),
    fs.readFileSync('docs/kits/hook.mjs', 'utf8'),
  );
  assert.ok(
    JSON.parse(
      fs.readFileSync(path.join(legacy, '.context-kit/selection.json')),
    ).byHarnessTechniques.claude.includes('goal-reminder'),
  );
  fs.appendFileSync(path.join(legacy, '.context-kit/hook.mjs'), '\n// owner change\n');
  assert.throws(
    () => planInstall({ root: legacy, harness: 'claude', techniques: ['artifact-ledger'] }),
    /Existing file differs/,
  );
  assert.match(
    fs.readFileSync(path.join(root, 'CLAUDE.md'), 'utf8'),
    /Never delete customer fixtures/,
  );
  applyInstall(
    planInstall({ root, harness: 'claude', techniques: ['goal-reminder', 'task-contract'] }),
  );
  assert.equal(
    (fs.readFileSync(path.join(root, 'CLAUDE.md'), 'utf8').match(/BEGIN CONTEXT TECHNIQUES/g) || [])
      .length,
    1,
  );
  applyInstall(planInstall({ root, harness: 'codex', techniques: ['compaction-checkpoint'] }));
  actual = JSON.parse(fs.readFileSync(path.join(root, '.claude/settings.json')));
  assert.equal(actual.hooks.PreCompact, undefined, 'Codex choices must not leak into Claude hooks');
  applyInstall(
    planInstall({ root, harness: 'claude', techniques: ['model-routing', 'workflow-coordinator'] }),
  );
  const installed = JSON.parse(fs.readFileSync(path.join(root, '.context-kit/selection.json')));
  assert.ok(installed.byHarnessTechniques.claude.includes('report-contract'));
  assert.ok(fs.existsSync(path.join(root, '.claude/agents/context-ci-evidence.md')));
  assert.ok(fs.existsSync(path.join(root, '.claude/skills/context-workflow/SKILL.md')));
  for (const file of [
    'scripts/qa.mjs',
    'scripts/core.mjs',
    'references/contracts.md',
    'references/diagnosis.md',
    'assets/task.json',
    'assets/report.json',
  ])
    assert.ok(fs.existsSync(path.join(root, '.claude/skills/context-workflow', file)), file);
  assert.match(
    fs.readFileSync(path.join(root, '.context-kit/PROTOCOLS.md'), 'utf8'),
    /Context protocol index/,
  );
  assert.ok(fs.existsSync(path.join(root, '.context-kit/protocols/goal-reminder.md')));
  actual = JSON.parse(fs.readFileSync(path.join(root, '.claude/settings.json')));
  assert.equal(actual.hooks.PreCompact, undefined);
  assert.ok(actual.hooks.SubagentStart);
  assert.deepEqual(actual.permissions, settings.permissions);
  console.log(
    'PASS granular techniques: 20 IDs, legacy bundles, dependency closure, exact hooks, ' +
      'preserved guidance/settings, per-harness isolation, workflow/routing artifacts and idempotence.',
  );
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
