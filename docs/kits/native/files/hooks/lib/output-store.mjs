import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { checkedPath, privateDirectory, writePrivate, withStoreLock, limits } from './files.mjs';

const home = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function session(event) {
  if (
    typeof event.cwd !== 'string' ||
    typeof event.session_id !== 'string' ||
    !event.session_id ||
    event.session_id.length > 256
  )
    throw Error('Session identity unavailable');
  return crypto
    .createHash('sha256')
    .update(fs.realpathSync(event.cwd) + '\0' + event.session_id)
    .digest('hex');
}

export function captureOutput(event) {
  const r = event.tool_response;
  if (
    event.hook_event_name !== 'PostToolUse' ||
    event.tool_name !== 'Bash' ||
    !r ||
    typeof r.stdout !== 'string' ||
    typeof r.stderr !== 'string' ||
    r.stderr !== '' ||
    r.interrupted !== false ||
    r.isImage !== false ||
    r.error ||
    (r.exitCode !== undefined && r.exitCode !== 0) ||
    (r.exit_code !== undefined && r.exit_code !== 0) ||
    r.stdout.length <= 8000
  )
    return {};
  const body = JSON.stringify(r);
  if (Buffer.byteLength(body) > limits.artifactBytes) return {};
  const root = privateDirectory(path.join(home, 'state', 'bounded-results'), true);
  const sid = session(event),
    digest = crypto.createHash('sha256').update(body).digest('hex');
  const dest = checkedPath(path.join(root, sid + '-' + digest + '.json'));
  const stored = withStoreLock(root, () => {
    const files = fs.readdirSync(root).filter((n) => /^[a-f0-9]{64}-[a-f0-9]{64}\.json$/.test(n));
    const total = files.reduce(
      (n, name) => n + fs.statSync(checkedPath(path.join(root, name))).size,
      0,
    );
    if (
      !fs.existsSync(dest) &&
      (files.length >= limits.artifactFiles ||
        total + Buffer.byteLength(body) > limits.artifactTotal)
    )
      return null;
    if (fs.existsSync(dest)) {
      if (fs.readFileSync(dest, 'utf8') !== body) throw Error('Artifact collision');
    } else writePrivate(dest, body);
    return dest;
  });
  if (!stored) return {};
  const suffix =
    '\n[Bounded preview; full structured result: ' +
    stored +
    '. Read it when omitted facts matter.]';
  return {
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      updatedToolOutput: { ...r, stdout: r.stdout.slice(0, 8000 - suffix.length) + suffix },
    },
  };
}

export function recordEvidence(event) {
  if (event.hook_event_name !== 'PostToolUse') return {};
  const sid = session(event),
    root = privateDirectory(path.join(home, 'state', 'tool-evidence'), true);
  const file = checkedPath(path.join(root, sid + '.jsonl'));
  withStoreLock(root, () => {
    const names = fs.readdirSync(root).filter((n) => /^[a-f0-9]{64}\.jsonl$/.test(n));
    if (!fs.existsSync(file) && names.length >= limits.traceFiles) return null;
    const r = event.tool_response || {};
    const line =
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'PostToolUse',
        tool: ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'Agent', 'Task'].includes(
          event.tool_name,
        )
          ? event.tool_name
          : 'other',
        exit_code: Number.isFinite(r.exit_code ?? r.exitCode) ? (r.exit_code ?? r.exitCode) : null,
        interrupted: typeof r.interrupted === 'boolean' ? r.interrupted : null,
        scope: 'Completion metadata, not acceptance evidence.',
      }) + '\n';
    const previous = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    if (Buffer.byteLength(previous) + Buffer.byteLength(line) > limits.traceBytes) return null;
    writePrivate(file, previous + line);
    return true;
  });
  return {};
}
