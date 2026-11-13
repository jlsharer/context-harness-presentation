import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { checkedPath, privateDirectory, writePrivate, withStoreLock } from './files.mjs';
import { validateCheckpoint } from './checkpoint.mjs';

const claudeHome = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const root = path.join(claudeHome, 'state', 'session-checkpoints');

function identity({ cwd, session_id }) {
  if (
    typeof cwd !== 'string' ||
    typeof session_id !== 'string' ||
    !session_id.trim() ||
    session_id.length > 256
  )
    throw Error('Actual cwd and current session ID are required');
  return { cwd: fs.realpathSync(cwd), session_id };
}

function destination(scope) {
  const digest = crypto
    .createHash('sha256')
    .update(scope.cwd + '\0' + scope.session_id)
    .digest('hex');
  return checkedPath(path.join(root, digest + '.json'));
}

export function writeCheckpoint(checkpoint, event) {
  validateCheckpoint(checkpoint);
  const scope = identity(event);
  const content = JSON.stringify({ schema: 1, scope, checkpoint });
  if (Buffer.byteLength(content) > 12000) throw Error('Checkpoint envelope exceeds 12000 bytes');
  privateDirectory(root, true);
  const file = destination(scope);
  const result = withStoreLock(root, () => {
    const names = fs.readdirSync(root).filter((name) => /^[a-f0-9]{64}\.json$/.test(name));
    if (!fs.existsSync(file) && names.length >= 32)
      throw Error('Checkpoint store full; review retention locally');
    writePrivate(file, content + '\n');
    return file;
  });
  if (!result) throw Error('Checkpoint store busy; retry explicitly');
  return { path: result, scope, bytes: Buffer.byteLength(content) };
}

export function readCheckpoint(event) {
  const scope = identity(event),
    file = destination(scope);
  if (!fs.existsSync(file)) return null;
  if (!fs.lstatSync(file).isFile() || fs.statSync(file).size > 12001)
    throw Error('Invalid checkpoint file');
  const record = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (
    record.schema !== 1 ||
    record.scope?.cwd !== scope.cwd ||
    record.scope?.session_id !== scope.session_id
  )
    throw Error('Checkpoint identity mismatch');
  return validateCheckpoint(record.checkpoint);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);

    const get = (key) => args[args.indexOf(key) + 1];

    const scope = {
      cwd: args.includes('--cwd') ? get('--cwd') : process.cwd(),
      session_id: args.includes('--session-id') ? get('--session-id') : null,
    };
    if (args[0] === 'write') {
      if (!args[1] || fs.statSync(args[1]).size > 12000)
        throw Error('Bounded checkpoint input required');
      console.log(
        JSON.stringify(writeCheckpoint(JSON.parse(fs.readFileSync(args[1], 'utf8')), scope)),
      );
    } else if (args[0] === 'read') console.log(JSON.stringify(readCheckpoint(scope)));
    else
      throw Error('Usage: state.mjs write FILE|read --cwd REPOSITORY --session-id CURRENT_SESSION');
  } catch (error) {
    console.error(error instanceof SyntaxError ? 'Invalid local checkpoint JSON.' : error.message);
    process.exitCode = 1;
  }
}
