import { pathToFileURL, fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { validateHandoff, validateCheckpoint } from './core.mjs';
import { checkedPath, privateDirectory, withStoreLock, limits } from './local-data.mjs';

const kitRoot = path.dirname(fileURLToPath(import.meta.url));

function protectArtifacts() {
  privateDirectory(kitRoot, true);
  const ignore = checkedPath(path.join(kitRoot, '.gitignore'));
  if (!fs.existsSync(ignore))
    try {
      fs.writeFileSync(ignore, 'artifacts/\ntrace-*.jsonl\ncheckpoint.json\n', {
        mode: 0o600,
        flag: 'wx',
      });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
}

function saveToolArtifact(response) {
  protectArtifacts();
  privateDirectory(kitRoot, true);
  const directory = checkedPath(path.join(kitRoot, 'artifacts'));
  try {
    fs.mkdirSync(directory, { mode: 0o700 });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
  if (fs.lstatSync(directory).isSymbolicLink() || !fs.lstatSync(directory).isDirectory())
    throw Error('Artifact directory must be a real directory');
  privateDirectory(directory, true);
  const body = JSON.stringify(response),
    digest = createHash('sha256').update(body).digest('hex'),
    file = checkedPath(path.join(directory, digest + '.json'));
  if (Buffer.byteLength(body) > limits.artifactBytes) return null;
  const stored = withStoreLock(kitRoot, () => {
    const files = fs.readdirSync(directory).filter((name) => /^[a-f0-9]{64}\.json$/.test(name));
    const total = files.reduce(
      (n, name) => n + fs.statSync(checkedPath(path.join(directory, name))).size,
      0,
    );
    if (
      !fs.existsSync(file) &&
      (files.length >= limits.artifactFiles ||
        total + Buffer.byteLength(body) > limits.artifactTotal)
    )
      return null;
    try {
      fs.writeFileSync(file, body, { flag: 'wx', mode: 0o600 });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      if (
        fs.lstatSync(file).isSymbolicLink() ||
        !fs.lstatSync(file).isFile() ||
        fs.readFileSync(file, 'utf8') !== body
      )
        throw Error('Artifact path conflict');
    }
    return true;
  });
  if (!stored) return null;
  return '.context-kit/artifacts/' + digest + '.json';
}

export function handleHook(event, mode) {
  if (mode === 'restore' && event.hook_event_name === 'SessionStart') {
    const file = checkedPath(path.join(kitRoot, 'checkpoint.json'));
    if (!fs.existsSync(file)) return {};
    if (!fs.lstatSync(file).isFile() || fs.statSync(file).size > 12000)
      throw Error('Checkpoint must be a regular file within 12000 bytes');
    const checkpoint = validateCheckpoint(JSON.parse(fs.readFileSync(file, 'utf8')));
    return {
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext:
          'Project checkpoint reference; current user intent and native instruction authority govern. Reopen source facts as needed.\n' +
          JSON.stringify(checkpoint),
      },
    };
  }
  if (mode === 'evidence' && event.hook_event_name === 'PostToolUse') {
    privateDirectory(kitRoot, true);
    const ignore = checkedPath(path.join(kitRoot, '.gitignore'));
    if (!fs.existsSync(ignore))
      fs.writeFileSync(ignore, 'artifacts/\ntrace-*.jsonl\ncheckpoint.json\n', {
        mode: 0o600,
        flag: 'wx',
      });
    const sid = createHash('sha256')
      .update(String(event.session_id || 'unknown'))
      .digest('hex')
      .slice(0, 16);
    const file = checkedPath(path.join(kitRoot, 'trace-' + sid + '.jsonl'));
    withStoreLock(kitRoot, () => {
      const names = fs.readdirSync(kitRoot).filter((n) => /^trace-[a-f0-9]{16}\.jsonl$/.test(n));
      if (!fs.existsSync(file) && names.length >= limits.traceFiles) return null;
      const r = event.tool_response || {};
      const line =
        JSON.stringify({
          timestamp: new Date().toISOString(),
          event: 'PostToolUse',
          tool: ['Bash', 'Read', 'Edit', 'Write', 'Glob', 'Grep', 'Agent', 'Task'].includes(
            event.tool_name,
          )
            ? event.tool_name
            : 'other',
          exit_code: Number.isFinite(r.exit_code ?? r.exitCode)
            ? (r.exit_code ?? r.exitCode)
            : null,
          interrupted: typeof r.interrupted === 'boolean' ? r.interrupted : null,
          scope: 'Completion metadata, not QA acceptance.',
        }) + '\n';
      if (
        (fs.existsSync(file) ? fs.statSync(file).size : 0) + Buffer.byteLength(line) >
        limits.traceBytes
      )
        return null;
      const fd = fs.openSync(
        file,
        fs.constants.O_APPEND |
          fs.constants.O_CREAT |
          fs.constants.O_WRONLY |
          (fs.constants.O_NOFOLLOW || 0),
        0o600,
      );
      try {
        if (!fs.fstatSync(fd).isFile() || fs.fstatSync(fd).nlink !== 1)
          throw Error('Invalid trace target');
        fs.fchmodSync(fd, 0o600);
        fs.writeFileSync(fd, line);
      } finally {
        fs.closeSync(fd);
      }
      return true;
    });
    return {};
  }
  if (mode === 'results' && event.hook_event_name === 'PostToolUse' && event.tool_name === 'Bash') {
    const r = event.tool_response;
    if (
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
    // Keep the original structured artifact. Only the model-visible stdout changes.
    const artifact = saveToolArtifact(r),
      suffix =
        '\n[Preview truncated; full structured result: ' +
        artifact +
        '. Read it when omitted facts matter.]';
    if (!artifact) return {};
    return {
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        updatedToolOutput: { ...r, stdout: r.stdout.slice(0, 8000 - suffix.length) + suffix },
      },
    };
  }
  if (mode === 'continuity' && event.hook_event_name === 'UserPromptSubmit')
    return {
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext:
          'Use the latest user request as the current goal. Keep required constraints and ' +
          'acceptance checks explicit. Resolve conflicts by native instruction authority. Verify ' +
          'the artifact against this goal before finishing.',
      },
    };
  if (mode === 'continuity' && event.hook_event_name === 'PreCompact')
    return (
      'Preserve the latest goal, constraints, source anchors, decisions, open work and ' +
      'acceptance checks. Do not claim checks passed without results. Restore referenced ' +
      'source facts when needed after compaction.'
    );
  if (mode === 'handoff' && event.hook_event_name === 'SubagentStart')
    return {
      hookSpecificOutput: {
        hookEventName: 'SubagentStart',
        additionalContext:
          'Stay within the delegated task and source scope. Return a JSON report with task_id, ' +
          'summary, source_anchors, findings, checks (command/status), open_questions. State ' +
          'not-run for checks without results. Validate with the context-kit helper before handoff.',
      },
    };
  if (
    mode === 'handoff' &&
    event.hook_event_name === 'PreToolUse' &&
    event.tool_name === 'SubagentHandback'
  ) {
    try {
      const message = event.tool_input?.message;
      if (typeof message === 'string' && Buffer.byteLength(message, 'utf8') > 12000)
        throw Error('Delivered message exceeds 12000 UTF-8 bytes');
      validateHandoff(typeof message === 'string' ? JSON.parse(message) : message);
      return {};
    } catch (error) {
      return {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: 'Handoff structure invalid: ' + error.message,
        },
      };
    }
  }
  return {};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let raw = '';
  try {
    for await (const chunk of process.stdin) {
      raw += chunk;
      if (raw.length > 4000000) throw Error('Hook input too large');
    }
    const output = handleHook(JSON.parse(raw || '{}'), process.argv[2]);
    process.stdout.write(typeof output === 'string' ? output : JSON.stringify(output));
  } catch (error) {
    process.stderr.write(
      'Context technique skipped: ' +
        (error instanceof SyntaxError ? 'Invalid local JSON.' : error.message) +
        '\n',
    );
  }
}
