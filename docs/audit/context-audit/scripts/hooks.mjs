import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { checkContract } from './contracts.mjs';

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

function existingProjectKit(cwd, mode) {
  try {
    const s = JSON.parse(fs.readFileSync(path.join(cwd, '.context-kit/selection.json'))),
      c = JSON.parse(fs.readFileSync(path.join(cwd, '.claude/settings.json')));
    return (
      (s.byHarness?.claude || (s.harness === 'claude' && s.kits) || []).includes(mode) &&
      Object.values(c.hooks || {})
        .flatMap((x) => x)
        .some((e) =>
          (e.hooks || []).some(
            (h) => h.command?.includes('.context-kit/hook.mjs') && h.command.includes(mode),
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
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const data = {
    timestamp: new Date().toISOString(),
    event: event.hook_event_name || 'unknown',
    tool: event.tool_name || null,
    tool_use_id: event.tool_use_id || null,
    ...extra,
  };
  fs.appendFileSync(dest, JSON.stringify(data) + '\n', { mode: 0o600 });
  return dest;
}

export function handleHook(mode, event) {
  if (!event?.cwd || !fs.existsSync(event.cwd)) return null;
  const cwd = event.cwd;
  if (['continuity', 'results'].includes(mode) && existingProjectKit(cwd, mode)) return null;
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
    const dest = localPath(cwd, 'artifacts/result-' + crypto.randomUUID() + '.json');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, JSON.stringify(r), { mode: 0o600 });
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
      process.stderr.write('Context audit hook skipped: ' + e.message + '\n');
    }
  });
}
