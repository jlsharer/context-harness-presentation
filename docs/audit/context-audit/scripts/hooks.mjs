import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { checkContract } from './contracts.mjs';
import {
  checkedPath,
  privateDirectory,
  writePrivate,
  projectStore,
  withStoreLock,
  limits,
} from './local-data.mjs';

function localPath(cwd, relative) {
  const root = fs.realpathSync(cwd),
    dest = path.resolve(root, '.context-audit', relative);
  if (!dest.startsWith(root + path.sep)) throw Error('Invalid artifact path');
  let cursor = root;
  for (const part of path.relative(root, dest).split(path.sep)) {
    cursor = path.join(cursor, part);
    try {
      if (fs.lstatSync(cursor).isSymbolicLink()) throw Error('Symbolic-link artifact target');
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  }
  return dest;
}

function existingProjectKit(cwd, mode, eventName) {
  try {
    const s = JSON.parse(fs.readFileSync(path.join(cwd, '.context-kit/selection.json'))),
      c = JSON.parse(fs.readFileSync(path.join(cwd, '.claude/settings.json')));
    const granular = s.byHarnessTechniques?.claude;
    const technique =
      mode === 'results'
        ? 'bounded-results'
        : eventName === 'PreCompact'
          ? 'compaction-checkpoint'
          : 'checkpoint-restore';
    const commandMode =
      mode === 'results' ? 'results' : eventName === 'PreCompact' ? 'continuity' : 'restore';
    return (
      (granular
        ? granular.includes(technique)
        : (s.byHarness?.claude || (s.harness === 'claude' && s.kits) || []).includes(mode)) &&
      (c.hooks?.[eventName] || []).some((e) =>
        (e.hooks || []).some(
          (h) =>
            h.command?.includes('.context-kit/hook.mjs') &&
            h.command.includes(granular ? commandMode : mode),
        ),
      )
    );
  } catch {
    return false;
  }
}

function record(cwd, event, extra = {}) {
  const sid = crypto
      .createHash('sha256')
      .update(String(event.session_id || 'unknown'))
      .digest('hex')
      .slice(0, 16),
    dest = localPath(cwd, 'trace-' + sid + '.jsonl');
  const root = projectStore(cwd);
  const data = {
    timestamp: new Date().toISOString(),
    event: ['SessionStart', 'SessionEnd', 'PreCompact', 'PostToolUse'].includes(
      event.hook_event_name,
    )
      ? event.hook_event_name
      : 'unknown',
    tool: ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'Agent', 'Task'].includes(
      event.tool_name,
    )
      ? event.tool_name
      : 'other',
    ...extra,
  };
  withStoreLock(root, () => {
    checkedPath(dest);
    const files = fs.readdirSync(root).filter((name) => /^trace-[a-f0-9]{16}\.jsonl$/.test(name));
    if (!fs.existsSync(dest) && files.length >= limits.traceFiles) return null;
    const text = JSON.stringify(data) + '\n';
    if (
      (fs.existsSync(dest) ? fs.statSync(dest).size : 0) + Buffer.byteLength(text) >
      limits.traceBytes
    )
      return null;
    const fd = fs.openSync(
      dest,
      fs.constants.O_WRONLY |
        fs.constants.O_APPEND |
        fs.constants.O_CREAT |
        (fs.constants.O_NOFOLLOW || 0),
      0o600,
    );
    try {
      const st = fs.fstatSync(fd);
      if (!st.isFile() || st.nlink !== 1) throw Error('Refusing nonregular or hardlinked trace');
      if (process.platform !== 'win32') fs.fchmodSync(fd, 0o600);
      fs.writeFileSync(fd, text);
    } finally {
      fs.closeSync(fd);
    }
    return true;
  });
  return dest;
}

export function handleHook(mode, event) {
  if (!event?.cwd || !fs.existsSync(event.cwd)) return null;
  const cwd = event.cwd;
  if (
    ['continuity', 'results'].includes(mode) &&
    existingProjectKit(
      cwd,
      mode,
      event.hook_event_name || (mode === 'results' ? 'PostToolUse' : 'PreCompact'),
    )
  )
    return null;
  if (mode === 'results') {
    const r = event.tool_response;
    if (
      event.tool_name !== 'Bash' ||
      !r ||
      typeof r.stdout !== 'string' ||
      typeof r.stderr !== 'string' ||
      typeof r.interrupted !== 'boolean' ||
      typeof r.isImage !== 'boolean' ||
      r.interrupted ||
      r.isImage ||
      r.stderr ||
      r.error ||
      ['exit_code', 'exitCode', 'returnCode'].some((k) => k in r && r[k] !== 0) ||
      r.stdout.length <= 8000
    )
      return null;
    const root = projectStore(cwd);
    const dest = localPath(cwd, 'artifacts/result-' + crypto.randomUUID() + '.json');
    const stored = withStoreLock(root, () => {
      const folder = privateDirectory(path.dirname(dest), true);
      const files = fs.readdirSync(folder).filter((name) => /^result-[a-f0-9-]+\.json$/.test(name));
      const size = files.reduce(
        (total, name) => total + fs.statSync(checkedPath(path.join(folder, name))).size,
        0,
      );
      const data = JSON.stringify(r);
      const bytes = Buffer.byteLength(data);
      if (
        files.length >= limits.artifactFiles ||
        bytes > limits.artifactBytes ||
        size + bytes > limits.artifactTotal
      )
        return null;
      writePrivate(dest, data);
      return true;
    });
    if (!stored) return null;
    const suffix = '\n[Successful output excerpt; full structured result: ' + dest + ']';
    return {
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        updatedToolOutput: { ...r, stdout: r.stdout.slice(0, 8000 - suffix.length) + suffix },
      },
    };
  }
  if (mode === 'evidence' || mode === 'measurement') {
    const r = event.tool_response || {},
      code = r.exit_code ?? r.exitCode ?? r.returnCode ?? null;
    record(cwd, event, {
      exit_code: typeof code === 'number' ? code : null,
      interrupted: typeof r.interrupted === 'boolean' ? r.interrupted : null,
      scope: 'Completion metadata; not an acceptance verdict. No raw command or output recorded.',
    });
    return null;
  }
  if (mode === 'continuity') {
    const instruction =
      'Preserve the current goal, applicable constraints, source anchors, decisions, ' +
      'unresolved work and verification status. Use the project .context-audit/checkpoint.json ' +
      'contract when preparing a handoff; never label unexecuted checks passed.';
    if (event.hook_event_name === 'PreCompact') return instruction;
    let text = instruction;
    const checkpoint = localPath(cwd, 'checkpoint.json');
    if (fs.existsSync(checkpoint)) {
      try {
        text +=
          '\nStored project checkpoint (reference; current user intent governs):\n' +
          JSON.stringify(checkContract('checkpoint', JSON.parse(fs.readFileSync(checkpoint))));
      } catch {
        text += '\nExisting checkpoint is invalid: inspect it before relying on it.';
      }
    }
    return { hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text } };
  }
  return null;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (x) => {
    raw += x;
    if (raw.length > 4000000) {
      process.stderr.write('Context audit hook input too large; original behavior retained.\n');
      process.exit(0);
    }
  });
  process.stdin.on('end', () => {
    try {
      const result = handleHook(process.argv[2], JSON.parse(raw));
      if (result !== null)
        process.stdout.write(typeof result === 'string' ? result : JSON.stringify(result));
    } catch (e) {
      process.stderr.write(
        'Context audit hook skipped: ' +
          (e instanceof SyntaxError ? 'Invalid local JSON input.' : e.message) +
          '\n',
      );
    }
  });
}
