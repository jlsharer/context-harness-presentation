import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { handleHook } from '../docs/audit/context-audit/scripts/hooks.mjs';
import { planInstall, applyPlan, rollback } from '../docs/audit/context-audit/scripts/install.mjs';

const cli = fileURLToPath(new URL('../docs/audit/context-audit/scripts/cli.mjs', import.meta.url));
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-local-'));
const home = path.join(temp, 'claude');
fs.mkdirSync(home);

const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });

const mode = (file) => fs.statSync(file).mode & 0o777;

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

try {
  const transcript = path.join(temp, 'private-client-session.jsonl');
  fs.writeFileSync(
    transcript,
    JSON.stringify({
      type: 'assistant',
      sessionId: 'private-session-id',
      message: {
        id: 'private-request-id',
        model: 'private-client-model-secret',
        usage: {
          input_tokens: 100,
          cache_read_input_tokens: 200,
          cache_creation_input_tokens: 0,
          output_tokens: 5,
        },
      },
    }) + '\n',
  );
  const result = run('analyze', '--claude-home', home, '--transcript', transcript);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(!result.stdout.includes('"metrics"'), 'default report must not enter tool stdout');
  const report = result.stdout.trim().match(/^Wrote (.+)$/m)?.[1];
  assert.ok(report?.startsWith(path.join(home, 'context-audit-data', 'reports')), result.stdout);
  assert.equal(read(report).metrics.totalInput, 300);
  assert.equal(mode(report), 0o600);
  assert.equal(mode(path.dirname(report)), 0o700);
  const shared = run('summary', '--report', report);
  assert.equal(shared.status, 0, shared.stderr);
  assert.ok(!shared.stdout.includes('"metrics"'));
  const summaryFile = shared.stdout.trim().match(/^Wrote (.+)$/m)?.[1];
  const summary = read(summaryFile);
  assert.equal(summary.metrics.totalInput, 300);
  assert.equal(summary.metrics.totalCost, null);
  assert.ok(
    !JSON.stringify(summary).includes('private-'),
    'no arbitrary IDs, model names or paths',
  );
  const printed = run('summary', '--report', report, '--print');
  assert.equal(JSON.parse(printed.stdout).metrics.requests, 1);
  const poisoned = path.join(temp, 'poison.json');
  fs.writeFileSync(
    poisoned,
    JSON.stringify({
      ...read(report),
      coverage: { limits: ['private-secret'], usageSource: 'private-secret' },
      metrics: { ...read(report).metrics, totalInput: 'private-secret' },
      findings: [{ id: 'private-secret', package: 'private-secret', detail: 'private-secret' }],
    }),
  );
  const reduced = run('summary', '--report', poisoned, '--print');
  assert.equal(reduced.status, 0, reduced.stderr);
  assert.ok(!reduced.stdout.includes('private-secret'));
  assert.equal(JSON.parse(reduced.stdout).metrics.totalInput, null);
  const invalidReport = path.join(temp, 'invalid-report.json');
  fs.writeFileSync(invalidReport, 'SECRET_VALUE');
  const invalidSummary = run('summary', '--report', invalidReport);
  assert.notEqual(invalidSummary.status, 0);
  assert.ok(
    !invalidSummary.stderr.includes('SECRET_VALUE'),
    'malformed private reports must not leak JSON snippets',
  );
  assert.match(invalidSummary.stderr, /JSON.*local/i);
  const invalidPreview = path.join(temp, 'invalid-preview.json');
  fs.writeFileSync(invalidPreview, 'PRIVATE_PREVIEW_CANARY');
  const invalidApply = run('apply', '--plan', invalidPreview);
  assert.notEqual(invalidApply.status, 0);
  assert.ok(!(invalidApply.stdout + invalidApply.stderr).includes('PRIVATE_PREVIEW_CANARY'));
  const hookCli = fileURLToPath(
    new URL('../docs/audit/context-audit/scripts/hooks.mjs', import.meta.url),
  );
  const invalidHook = spawnSync(process.execPath, [hookCli, 'measurement'], {
    encoding: 'utf8',
    input: 'PRIVATE_HOOK_CANARY',
  });
  assert.ok(!(invalidHook.stdout + invalidHook.stderr).includes('PRIVATE_HOOK_CANARY'));

  const outside = path.join(temp, 'outside.json');
  fs.writeFileSync(outside, 'unchanged');
  const link = path.join(temp, 'linked.json');
  fs.symlinkSync(outside, link);
  assert.notEqual(run('analyze', '--claude-home', home, '--out', link).status, 0);
  assert.equal(fs.readFileSync(outside, 'utf8'), 'unchanged');
  fs.unlinkSync(link);
  fs.linkSync(outside, link);
  assert.notEqual(run('analyze', '--claude-home', home, '--out', link).status, 0);
  assert.equal(fs.readFileSync(outside, 'utf8'), 'unchanged');

  const enterprise = {
    env: {
      CLAUDE_CODE_ENABLE_TELEMETRY: '1',
      OTEL_EXPORTER_OTLP_ENDPOINT: 'https://internal.example',
      OTEL_EXPORTER_OTLP_HEADERS: 'secret-token',
    },
    permissions: { allow: ['Read'] },
  };
  const settings = path.join(home, 'settings.json');
  fs.writeFileSync(settings, '{"env":{"AUTH_TOKEN":secretCredentialValue}}');
  const invalidInstall = run('install', '--claude-home', home);
  assert.notEqual(invalidInstall.status, 0);
  assert.ok(
    !invalidInstall.stderr.includes('secretCred'),
    'malformed settings must not leak credentials',
  );
  fs.writeFileSync(settings, JSON.stringify(enterprise), { mode: 0o640 });
  fs.chmodSync(settings, 0o640);
  const preview = run('install', '--claude-home', home, '--selected', 'measurement');
  assert.equal(preview.status, 0, preview.stderr);
  assert.ok(!preview.stdout.includes('secret-token'));
  const previewFile = preview.stdout.trim().match(/^Wrote (.+)$/m)?.[1];
  assert.equal(mode(previewFile), 0o600);
  const applied = applyPlan(planInstall({ claudeHome: home, selected: ['measurement'] }));
  assert.deepEqual(read(settings).env, enterprise.env);
  assert.deepEqual(read(settings).permissions, enterprise.permissions);
  assert.equal(mode(settings), 0o640);
  assert.equal(mode(applied.path), 0o600);
  assert.equal(mode(path.dirname(applied.path)), 0o700);
  rollback(applied.path);
  assert.deepEqual(read(settings), enterprise);

  const project = path.join(temp, 'repo');
  fs.mkdirSync(project);
  const event = {
    cwd: project,
    session_id: 's',
    tool_use_id: 'private-tool-id',
    tool_name: 'private-tool-name',
    hook_event_name: 'PostToolUse',
    tool_response: {},
  };
  handleHook('evidence', event);
  const local = path.join(project, '.context-audit');
  const trace = fs.readdirSync(local).find((x) => x.startsWith('trace-'));
  assert.equal(mode(local), 0o700);
  assert.equal(mode(path.join(local, trace)), 0o600);
  assert.ok(!fs.readFileSync(path.join(local, trace), 'utf8').includes('private-'));
  assert.match(fs.readFileSync(path.join(local, '.gitignore'), 'utf8'), /\*/);
  fs.writeFileSync(path.join(local, trace), 'x'.repeat(256 * 1024));
  handleHook('evidence', event);
  assert.equal(fs.statSync(path.join(local, trace)).size, 256 * 1024, 'stop at trace cap');
  for (let i = 0; i < 25; i++) handleHook('evidence', { ...event, session_id: String(i) });
  assert.ok(fs.readdirSync(local).filter((x) => x.startsWith('trace-')).length <= 20);
  const success = { stdout: 'x'.repeat(18000), stderr: '', interrupted: false, isImage: false };
  for (let i = 0; i < 20; i++)
    assert.ok(handleHook('results', { ...event, tool_name: 'Bash', tool_response: success }));
  assert.equal(
    handleHook('results', { ...event, tool_name: 'Bash', tool_response: success }),
    null,
    'full artifact store keeps original output',
  );
  assert.equal(mode(path.join(local, 'artifacts')), 0o700);
  console.log(
    'PASS local audit: file-first reports/previews, numeric allowlist, explicit summary ' +
      'stdout, private storage, links refused, enterprise settings preserved, bounded hooks.',
  );
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
