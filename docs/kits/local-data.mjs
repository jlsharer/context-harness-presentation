import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const limits = Object.freeze({
  traceBytes: 256 * 1024,
  traceFiles: 20,
  artifactBytes: 4 * 1024 * 1024,
  artifactTotal: 16 * 1024 * 1024,
  artifactFiles: 20,
});

// Refuse redirects before opening local outputs. This is not isolation from
// malicious processes running as the same OS user, or encryption at rest.
export function checkedPath(file) {
  const target = path.resolve(file);
  let cursor = path.parse(target).root;
  for (const part of target.slice(cursor.length).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, part);
    try {
      const st = fs.lstatSync(cursor);
      if (st.isSymbolicLink()) throw Error('Refusing symbolic-link local data target');
      if (
        cursor === target &&
        ((!st.isFile() && !st.isDirectory()) || (st.isFile() && st.nlink !== 1))
      )
        throw Error('Refusing nonregular or hardlinked local data target');
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  }
  return target;
}

export function privateDirectory(folder, owned = false) {
  const target = checkedPath(folder);
  fs.mkdirSync(target, { recursive: true, mode: 0o700 });
  if (!fs.lstatSync(target).isDirectory()) throw Error('Local data directory required');
  if (owned && process.platform !== 'win32') {
    const st = fs.statSync(target);
    if (process.getuid && st.uid !== process.getuid())
      throw Error('Local data directory owned by another user');
    fs.chmodSync(target, 0o700);
  }
  return target;
}

export function writePrivate(file, value) {
  const target = checkedPath(file);
  privateDirectory(path.dirname(target));
  if (fs.existsSync(target) && !fs.lstatSync(target).isFile())
    throw Error('Regular output file required');
  const scratch = path.join(path.dirname(target), '.audit-' + crypto.randomUUID());
  let fd;
  try {
    fd = fs.openSync(scratch, 'wx', 0o600);
    fs.writeFileSync(fd, value);
    fs.closeSync(fd);
    fd = undefined;
    checkedPath(target);
    fs.renameSync(scratch, target);
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
    fs.rmSync(scratch, { force: true });
  }
  return target;
}

export function localOutput(claudeHome, kind) {
  if (!claudeHome) throw Error('--claude-home is required for a default local output');
  const root = privateDirectory(path.join(claudeHome, 'context-audit-data'), true);
  const folder = privateDirectory(path.join(root, kind), true);
  return path.join(folder, Date.now() + '-' + crypto.randomUUID() + '.json');
}

export function projectStore(cwd) {
  const root = privateDirectory(path.join(fs.realpathSync(cwd), '.context-audit'), true);
  const ignore = checkedPath(path.join(root, '.gitignore'));
  if (!fs.existsSync(ignore)) writePrivate(ignore, '*\n');
  return root;
}

// A short-lived lock bounds concurrent hook writes. Contention or a stale lock
// skips capture; original tool output is retained. No evidence is auto-deleted.
export function withStoreLock(root, work) {
  const lock = checkedPath(path.join(root, '.capture-lock'));
  try {
    fs.mkdirSync(lock, { mode: 0o700 });
  } catch (e) {
    if (e.code === 'EEXIST') return null;
    throw e;
  }
  try {
    return work();
  } finally {
    fs.rmdirSync(lock);
  }
}
