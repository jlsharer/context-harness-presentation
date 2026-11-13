/** Dependency-free personal Claude installer. No installed framework or registry. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const hash = (text) => crypto.createHash('sha256').update(text).digest('hex');

const quote = (text) => "'" + text.replaceAll("'", "'\\''") + "'";

function safe(file) {
  const target = path.resolve(file);
  let cursor = path.parse(target).root;
  for (const part of target.slice(cursor.length).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, part);
    try {
      const st = fs.lstatSync(cursor);
      if (st.isSymbolicLink()) throw Error('Refusing symbolic-link install path');
      if (
        cursor === target &&
        ((!st.isFile() && !st.isDirectory()) || (st.isFile() && st.nlink !== 1))
      )
        throw Error('Refusing nonregular or hardlinked install path');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return target;
}

function relativePath(value) {
  if (
    typeof value !== 'string' ||
    !/^(skills|rules|hooks|agents)\/[A-Za-z0-9_./-]+$/.test(value) ||
    value.split('/').some((p) => !p || p === '.' || p === '..')
  )
    throw Error('Invalid native component file path');
  return value;
}

export function resolveNative(payload, techniques = payload.defaults) {
  if (
    payload.schema !== 1 ||
    !payload.components ||
    !Array.isArray(techniques) ||
    !techniques.length
  )
    throw Error('Choose native components');
  const selected = new Set();

  const visit = (id) => {
    if (!Object.hasOwn(payload.components, id))
      throw Error('Unknown or unavailable component: ' + id);
    if (selected.has(id)) return;
    selected.add(id);
    for (const dependency of payload.components[id].requires) visit(dependency);
  };

  techniques.forEach(visit);
  return [...selected].sort();
}

export function planNativeInstall({ claudeHome, payload, techniques, kits = [] }) {
  if (typeof claudeHome !== 'string' || !claudeHome) throw Error('Claude home required');
  const root = safe(claudeHome);
  const roots = kits.length
    ? [
        ...(techniques || []),
        ...kits.flatMap((id) => {
          if (!Object.hasOwn(payload.bundles || {}, id)) throw Error('Unknown bundle');
          return payload.bundles[id];
        }),
      ]
    : techniques;
  const selected = resolveNative(payload, roots);
  const files = new Map();

  const add = (relative, content, owner, role = 'resource') => {
    if (relative !== 'settings.json') relativePath(relative);
    const dest = safe(path.join(root, relative));
    if (!dest.startsWith(root + path.sep) || typeof content !== 'string')
      throw Error('Invalid installation file');
    const expected = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : null;
    if (expected !== null && expected !== content && relative !== 'settings.json')
      throw Error('Existing file differs; review locally before replacing: ' + relative);
    if (files.has(relative)) {
      if (files.get(relative).content !== content) throw Error('Conflicting component files');
      files.get(relative).owners.push(owner);
      return;
    }
    files.set(relative, { relative, path: dest, content, expected, role, owners: [owner] });
  };

  const registrations = [];
  for (const id of selected) {
    const component = payload.components[id];
    for (const file of component.files) {
      if (hash(file.content) !== file.hash) throw Error('Component content hash mismatch');
      add(file.path, file.content, id, file.path === component.primary ? 'primary' : 'resource');
    }
    registrations.push(...(component.hooks || []).map((h) => ({ ...h, owner: id })));
  }
  if (registrations.length) {
    const settingFile = safe(path.join(root, 'settings.json'));
    const settings = fs.existsSync(settingFile)
      ? JSON.parse(fs.readFileSync(settingFile, 'utf8'))
      : {};
    if (!settings || typeof settings !== 'object' || Array.isArray(settings))
      throw Error('Settings object required');
    settings.hooks ??= {};
    if (!settings.hooks || typeof settings.hooks !== 'object' || Array.isArray(settings.hooks))
      throw Error('Hooks object required');
    for (const registration of registrations) {
      const { event, matcher, script } = registration;
      if (
        ![
          'UserPromptSubmit',
          'PreCompact',
          'SessionStart',
          'SubagentStart',
          'PreToolUse',
          'PostToolUse',
        ].includes(event)
      )
        throw Error('Unsupported native hook event');
      relativePath(script);
      if (!files.has(script)) throw Error('Missing hook implementation');
      const entry = {
        ...(matcher ? { matcher } : {}),
        hooks: [{ type: 'command', command: 'node ' + quote(path.join(root, script)) }],
      };
      settings.hooks[event] ??= [];
      if (!Array.isArray(settings.hooks[event])) throw Error('Hook event array required');
      if (!settings.hooks[event].some((e) => JSON.stringify(e) === JSON.stringify(entry)))
        settings.hooks[event].push(entry);
    }
    add(
      'settings.json',
      JSON.stringify(settings, null, 2) + '\n',
      'selected hook registrations',
      'integration',
    );
    files.get('settings.json').owners = [...new Set(registrations.map((entry) => entry.owner))];
  }
  let anchor = root;
  while (!fs.existsSync(anchor)) anchor = path.dirname(anchor);
  const st = fs.statSync(safe(anchor));
  return {
    root,
    anchor,
    identity: { dev: st.dev, ino: st.ino },
    techniques: selected,
    files: [...files.values()],
  };
}

function atomicWrite(file, content) {
  safe(file);
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const scratch = path.join(path.dirname(file), '.install-' + crypto.randomUUID());
  try {
    fs.writeFileSync(scratch, content, { flag: 'wx', mode: 0o600 });
    safe(file);
    fs.renameSync(scratch, file);
  } finally {
    fs.rmSync(scratch, { force: true });
  }
}

export function applyNativeInstall(plan) {
  const st = fs.statSync(safe(plan.anchor));
  if (st.dev !== plan.identity.dev || st.ino !== plan.identity.ino)
    throw Error('Install root changed');

  const current = (f) => (fs.existsSync(safe(f.path)) ? fs.readFileSync(f.path, 'utf8') : null);

  for (const f of plan.files)
    if (current(f) !== f.expected) throw Error('File changed since preview: ' + f.relative);
  const applied = [];
  try {
    for (const f of plan.files) {
      if (current(f) !== f.expected) throw Error('File changed during installation: ' + f.relative);
      if (f.content === f.expected) continue;
      atomicWrite(f.path, f.content);
      applied.push(f);
    }
  } catch (error) {
    const conflicts = [];
    for (const f of applied.reverse())
      try {
        if (current(f) !== f.content) throw Error('Concurrent change');
        if (f.expected === null) fs.rmSync(f.path);
        else atomicWrite(f.path, f.expected);
      } catch {
        conflicts.push(f.relative);
      }
    if (conflicts.length)
      throw Error('Install interrupted; review recovery for: ' + conflicts.join(', '));
    throw error;
  }
  return plan;
}

export function readNativePayload(directory) {
  const payload = JSON.parse(
    fs.readFileSync(safe(path.join(directory, 'components.json')), 'utf8'),
  );
  for (const component of Object.values(payload.components))
    for (const file of component.files) {
      relativePath(file.path);
      const source = safe(path.join(directory, 'files', file.path));
      if (fs.statSync(source).size > 2 * 1024 * 1024) throw Error('Oversized package file');
      file.content = fs.readFileSync(source, 'utf8');
    }
  return payload;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);

    const get = (key, fallback) => (args.includes(key) ? args[args.indexOf(key) + 1] : fallback);

    const payload = readNativePayload(path.dirname(fileURLToPath(import.meta.url)));
    const plan = planNativeInstall({
      claudeHome: get(
        '--claude-home',
        process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'),
      ),
      payload,
      techniques: args.includes('--techniques')
        ? get('--techniques', '').split(',').filter(Boolean)
        : undefined,
      kits: get('--kits', '').split(',').filter(Boolean),
    });
    if (args.includes('--apply')) applyNativeInstall(plan);
    console.log(
      JSON.stringify(
        {
          mode: args.includes('--apply') ? 'installed' : 'preview',
          claudeHome: plan.root,
          techniques: plan.techniques,
          files: plan.files.map((f) => f.relative),
          scope:
            'Native personal files. Existing differing files require local review. No permissions or telemetry changes.',
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(
      error instanceof SyntaxError ? 'Invalid local JSON; inspect locally.' : error.message,
    );
    process.exitCode = 1;
  }
}
