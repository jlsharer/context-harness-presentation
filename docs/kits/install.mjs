import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { resolveSelection, techniques } from './selection.mjs';
const directory = path.dirname(fileURLToPath(import.meta.url)),
  catalog = JSON.parse(fs.readFileSync(path.join(directory, 'catalog.json')));

const quote = (s) => "'" + s.replaceAll("'", "'\\''") + "'";

const hash = (text) => crypto.createHash('sha256').update(text).digest('hex');

const legacyHashes = JSON.parse(fs.readFileSync(path.join(directory, 'legacy-hashes.json')));

function targetPath(root, relative) {
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep)) throw Error('Target escapes root');
  let cursor = root;
  for (const part of path.relative(root, target).split(path.sep)) {
    cursor = path.join(cursor, part);
    try {
      const st = fs.lstatSync(cursor);
      if (st.isSymbolicLink()) throw Error('Refusing symbolic-link target: ' + cursor);
      if (st.isFile() && st.nlink !== 1) throw Error('Refusing hardlinked installation target');
      if (!st.isFile() && !st.isDirectory()) throw Error('Refusing nonregular installation target');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return target;
}

export function planInstall({ root, harness, kits = [], techniques: requested = [] }) {
  if (!['claude', 'opencode', 'codex', 'portable'].includes(harness))
    throw Error('Choose claude, opencode, codex or portable');
  const requestedTechniques = resolveSelection({ kits, techniques: requested });
  if (!requestedTechniques.length) throw Error('Choose at least one package or technique');
  const actual = fs.realpathSync(root),
    selectionPath = targetPath(actual, '.context-kit/selection.json'),
    prior = fs.existsSync(selectionPath)
      ? JSON.parse(fs.readFileSync(selectionPath, 'utf8'))
      : { kits: [], harnesses: [] };
  if (!Array.isArray(prior.kits) || prior.kits.some((id) => !catalog.some((k) => k.id === id)))
    throw Error('Unrecognized existing kit selection');
  const selected = [...new Set([...prior.kits, ...kits])].sort(),
    byHarness = { ...(prior.byHarness || {}) };
  if (prior.harness && !byHarness[prior.harness]) byHarness[prior.harness] = prior.kits;
  const active = [...new Set([...(byHarness[harness] || []), ...kits])].sort();
  byHarness[harness] = active;
  const priorTechniques = prior.techniques || resolveSelection({ kits: prior.kits });
  const selectedTechniques = resolveSelection({
    techniques: [...priorTechniques, ...requestedTechniques],
  });
  const byHarnessTechniques = { ...(prior.byHarnessTechniques || {}) };
  for (const [target, ids] of Object.entries(byHarness))
    byHarnessTechniques[target] ??= resolveSelection({ kits: ids });
  byHarnessTechniques[harness] = resolveSelection({
    techniques: [...(byHarnessTechniques[harness] || []), ...requestedTechniques],
  });
  const enabled = byHarnessTechniques[harness];
  const files = [];

  const add = (relative, content, merge = false) => {
    const dest = targetPath(actual, relative);
    const expected = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : null;
    const managed =
      expected !== null &&
      (prior.hashes?.[relative] === hash(expected) ||
        (prior.kits.length && legacyHashes[relative] === hash(expected)));
    if (expected !== null && expected !== content && !merge && !managed)
      throw Error('Existing file differs; review before replacing: ' + relative);
    files.push({
      path: dest,
      relative,
      content,
      merge,
      managed,
      expected,
    });
  };

  for (const name of ['core.mjs', 'hook.mjs', 'run.mjs', 'local-data.mjs'])
    add('.context-kit/' + name, fs.readFileSync(path.join(directory, name), 'utf8'));

  const protocols = (ids) =>
      ids
        .map(
          (id) =>
            '# ' +
            catalog.find((k) => k.id === id).name +
            '\n' +
            fs.readFileSync(path.join(directory, 'protocols', id + '.md'), 'utf8'),
        )
        .join('\n\n'),
    protocolPath = targetPath(actual, '.context-kit/PROTOCOLS.md');

  const granularProtocols = (ids) =>
    ids
      .map((id) =>
        fs.readFileSync(path.join(directory, techniques.find((t) => t.id === id).protocol), 'utf8'),
      )
      .join('\n\n');

  const protocolIndex = (ids) =>
    '# Context protocol index\n\nKeep the current goal and acceptance checks explicit. Read ' +
    'only the protocol needed for the current stage. Check selection.json ' +
    'byHarnessTechniques for the current harness; the shared index may include files ' +
    'selected for another harness.\n\n' +
    ids
      .map((id) => {
        const t = techniques.find((t) => t.id === id);
        return '- [' + t.name + '](protocols/' + id + '.md): ' + t.purpose;
      })
      .join('\n') +
    '\n';

  if (
    fs.existsSync(protocolPath) &&
    fs.readFileSync(protocolPath, 'utf8') !== protocolIndex(priorTechniques) &&
    fs.readFileSync(protocolPath, 'utf8') !== granularProtocols(priorTechniques) &&
    (prior.kits.some((id) => !fs.existsSync(path.join(directory, 'protocols', id + '.md'))) ||
      fs.readFileSync(protocolPath, 'utf8') !== protocols(prior.kits))
  )
    throw Error('Existing protocols differ; review before replacing');
  add('.context-kit/PROTOCOLS.md', protocolIndex(selectedTechniques), true);
  add(
    '.context-kit/qa/references/provenance.md',
    fs.readFileSync(path.join(directory, 'qa/references/provenance.md'), 'utf8'),
  );
  for (const id of selectedTechniques)
    add(
      '.context-kit/protocols/' + id + '.md',
      fs.readFileSync(path.join(directory, techniques.find((t) => t.id === id).protocol), 'utf8'),
    );
  if (enabled.includes('task-contract') && harness !== 'portable') {
    const name = harness === 'claude' ? 'CLAUDE.md' : 'AGENTS.md';
    const file = targetPath(actual, name);
    const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    const block =
      '<!-- BEGIN CONTEXT TECHNIQUES -->\nKeep the current goal, constraints and acceptance ' +
      'checks explicit. Read the applicable stage from .context-kit/PROTOCOLS.md when needed. ' +
      'For QA defect work, diagnose the owning layer before patching. Bind required local and CI results to ' +
      'the exact revision; do not claim pending checks passed. External actions require ' +
      'existing user authorization.\n<!-- END CONTEXT TECHNIQUES -->';
    const matches =
      before.match(/<!-- BEGIN CONTEXT TECHNIQUES -->[\s\S]*?<!-- END CONTEXT TECHNIQUES -->/g) ||
      [];
    if (
      matches.length > 1 ||
      (matches.length && matches[0] !== block) ||
      (!matches.length && /<!-- (BEGIN|END) CONTEXT TECHNIQUES -->/.test(before))
    )
      throw Error('Existing managed guidance differs; review before replacing');
    add(
      name,
      matches.length
        ? before
        : before + (before && !before.endsWith('\n') ? '\n' : '') + '\n' + block + '\n',
      true,
    );
  }
  if (fs.existsSync(path.join(directory, 'context-menu', 'SKILL.md')) && harness !== 'portable') {
    const folder = {
      claude: '.claude/skills',
      opencode: '.opencode/skills',
      codex: '.agents/skills',
    }[harness];
    add(
      folder + '/context-menu/SKILL.md',
      fs.readFileSync(path.join(directory, 'context-menu/SKILL.md'), 'utf8'),
    );
  }
  if (enabled.includes('workflow-coordinator') && harness !== 'portable') {
    const folder = {
      claude: '.claude/skills',
      opencode: '.opencode/skills',
      codex: '.agents/skills',
    }[harness];
    add(
      folder + '/context-workflow/SKILL.md',
      fs.readFileSync(path.join(directory, 'context-workflow/SKILL.md'), 'utf8'),
    );
  }
  for (const id of enabled) {
    const t = techniques.find((t) => t.id === id);
    if (!t.skill || (id === 'workflow-coordinator' && harness !== 'portable')) continue;
    const folder = {
      claude: '.claude/skills',
      opencode: '.opencode/skills',
      codex: '.agents/skills',
      portable: '.context-kit/skills',
    }[harness];
    const source =
      id === 'workflow-coordinator'
        ? 'context-workflow/SKILL.md'
        : (t.category === 'skills' ? 'qa-skills/' : 'qa-workflows/') + t.skill + '/SKILL.md';
    add(
      folder + '/' + t.skill + '/SKILL.md',
      fs.readFileSync(path.join(directory, source), 'utf8'),
    );
  }
  if (enabled.includes('model-routing') && harness === 'claude') {
    for (const [id, model, purpose] of [
      ['ci-evidence', 'haiku', 'Extract bounded CI failure evidence and revision identifiers.'],
      [
        'fixture-review',
        'sonnet',
        'Review fixture versus product hypotheses against assigned sources.',
      ],
    ])
      add(
        '.claude/agents/context-' + id + '.md',
        '---\nname: context-' +
          id +
          '\ndescription: ' +
          purpose +
          '\nmodel: ' +
          model +
          '\ntools: Read, Glob, Grep\n---\n' +
          purpose +
          ('\nRead only assigned files. Do not edit, push or run tools outside the task scope. ' +
            'Return task_id, summary, source_anchors, findings, checks [{command,status}], ' +
            'open_questions. Keep serialized output within 12000 UTF-8 bytes. Use not-run for ' +
            'unexecuted checks. Escalate ambiguity. Parent validates the report and source claims.\n'),
      );
  }
  const qaEnabled = enabled.some((id) => techniques.find((t) => t.id === id).skill);
  if (qaEnabled) {
    add('.context-kit/qa.mjs', fs.readFileSync(path.join(directory, 'qa.mjs'), 'utf8'));
    for (const asset of fs.readdirSync(path.join(directory, 'qa/assets')))
      add(
        '.context-kit/qa/assets/' + asset,
        fs.readFileSync(path.join(directory, 'qa/assets', asset), 'utf8'),
      );
    for (const ref of fs
      .readdirSync(path.join(directory, 'qa/references'))
      .filter((name) => name !== 'provenance.md'))
      add(
        '.context-kit/qa/references/' + ref,
        fs.readFileSync(path.join(directory, 'qa/references', ref), 'utf8'),
      );
    const folder = {
      claude: '.claude/skills',
      opencode: '.opencode/skills',
      codex: '.agents/skills',
      portable: '.context-kit/skills',
    }[harness];
    for (const id of enabled) {
      const t = techniques.find((t) => t.id === id);
      if (!t.skill) continue;
      for (const source of ['qa.mjs', 'core.mjs'])
        add(
          folder + '/' + t.skill + '/scripts/' + source,
          fs.readFileSync(path.join(directory, source), 'utf8'),
        );
      for (const ref of fs.readdirSync(path.join(directory, 'qa/references')))
        add(
          folder + '/' + t.skill + '/references/' + ref,
          fs.readFileSync(path.join(directory, 'qa/references', ref), 'utf8'),
        );
      for (const asset of fs.readdirSync(path.join(directory, 'qa/assets')))
        add(
          folder + '/' + t.skill + '/assets/' + asset,
          fs.readFileSync(path.join(directory, 'qa/assets', asset), 'utf8'),
        );
      if (harness === 'opencode' && t.category === 'workflows')
        add(
          '.opencode/commands/' + t.skill + '.md',
          'Use the ' +
            t.skill +
            (' skill for this task. Read its SKILL.md, then only the references needed for the ' +
              'current stage. Preserve current user constraints and native permissions.\n\nTask: $ARGUMENTS\n'),
        );
    }
  }
  if (harness === 'claude') {
    const configPath = targetPath(actual, '.claude/settings.json'),
      config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
    config.hooks ??= {};

    const hook = (event, mode, matcher) => {
      const command =
          'node ' + quote(path.join(actual, '.context-kit/hook.mjs')) + ' ' + quote(mode),
        entry = { ...(matcher ? { matcher } : {}), hooks: [{ type: 'command', command }] };
      config.hooks[event] ??= [];
      if (!config.hooks[event].some((e) => JSON.stringify(e) === JSON.stringify(entry)))
        config.hooks[event].push(entry);
    };

    if (enabled.includes('goal-reminder')) hook('UserPromptSubmit', 'continuity');
    if (enabled.includes('compaction-checkpoint')) hook('PreCompact', 'continuity');
    if (enabled.includes('checkpoint-restore'))
      hook('SessionStart', 'restore', 'startup|resume|compact');
    if (enabled.includes('scoped-worker')) hook('SubagentStart', 'handoff');
    if (enabled.includes('report-contract')) hook('PreToolUse', 'handoff', '^SubagentHandback$');
    if (enabled.includes('bounded-results')) hook('PostToolUse', 'results', '^Bash$');
    if (enabled.includes('artifact-ledger')) hook('PostToolUse', 'evidence');
    if (
      enabled.some((k) =>
        [
          'goal-reminder',
          'compaction-checkpoint',
          'checkpoint-restore',
          'scoped-worker',
          'report-contract',
          'bounded-results',
          'artifact-ledger',
        ].includes(k),
      )
    )
      add('.claude/settings.json', JSON.stringify(config, null, 2) + '\n', true);
  }
  if (
    harness === 'opencode' &&
    enabled.includes('goal-reminder') &&
    enabled.includes('compaction-checkpoint')
  )
    add(
      '.opencode/plugins/context-kit/index.ts',
      fs.readFileSync(path.join(directory, 'adapters/opencode.ts'), 'utf8'),
    );
  const hashes = Object.fromEntries(
    files.filter((f) => !f.merge).map((f) => [f.relative, hash(f.content)]),
  );
  add(
    '.context-kit/selection.json',
    JSON.stringify(
      {
        schema: 2,
        harnesses: [...new Set([...(prior.harnesses || [prior.harness].filter(Boolean)), harness])],
        kits: selected,
        byHarness,
        techniques: selectedTechniques,
        byHarnessTechniques,
        hashes: { ...prior.hashes, ...hashes },
      },
      null,
      2,
    ) + '\n',
    true,
  );
  const identity = fs.lstatSync(actual);
  return {
    root: actual,
    rootIdentity: { dev: identity.dev, ino: identity.ino },
    harness,
    kits: selected,
    techniques: selectedTechniques,
    files,
  };
}

export function applyInstall(plan) {
  const root = fs.lstatSync(plan.root);
  if (
    root.isSymbolicLink() ||
    !root.isDirectory() ||
    fs.realpathSync(plan.root) !== plan.root ||
    !plan.rootIdentity ||
    root.dev !== plan.rootIdentity.dev ||
    root.ino !== plan.rootIdentity.ino
  )
    throw Error('Installation root changed; generate a fresh preview');
  for (const f of plan.files) {
    targetPath(plan.root, f.relative);
    const current = fs.existsSync(f.path) ? fs.readFileSync(f.path, 'utf8') : null;
    if (current !== f.expected) throw Error('File changed since planning: ' + f.relative);
    if (
      fs.existsSync(f.path) &&
      !f.merge &&
      !f.managed &&
      fs.readFileSync(f.path, 'utf8') !== f.content
    )
      throw Error('Existing file differs; review before replacing: ' + f.relative);
  }
  const applied = [];
  try {
    for (const f of plan.files) {
      fs.mkdirSync(path.dirname(f.path), { recursive: true });
      if (!fs.existsSync(f.path) || fs.readFileSync(f.path, 'utf8') !== f.content) {
        applied.push(f);
        fs.writeFileSync(f.path, f.content);
      }
    }
  } catch (error) {
    const conflicts = [];
    for (const f of applied.reverse())
      try {
        targetPath(plan.root, f.relative);
        if (f.expected === null) fs.rmSync(f.path, { force: true });
        else fs.writeFileSync(f.path, f.expected);
      } catch {
        conflicts.push(f.relative);
      }
    if (conflicts.length)
      throw Error('Install failed and some files need local recovery: ' + conflicts.join(', '));
    throw error;
  }
  return plan;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2),
    get = (key, fallback) => (args.includes(key) ? args[args.indexOf(key) + 1] : fallback);

  try {
    const plan = planInstall({
      root: get('--target', '.'),
      harness: get('--harness', 'portable'),
      kits: get('--kits', args.includes('--techniques') ? '' : 'focus')
        .split(',')
        .filter(Boolean),
      techniques: get('--techniques', '').split(',').filter(Boolean),
    });
    if (args.includes('--apply')) applyInstall(plan);
    console.log(
      JSON.stringify(
        {
          mode: args.includes('--apply') ? 'installed' : 'preview',
          harness: plan.harness,
          kits: plan.kits,
          techniques: plan.techniques,
          files: plan.files.map((f) => f.relative),
          scope:
            'Helpers validated offline. Native adapters require installed-version/runtime verification.',
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(
      error instanceof SyntaxError
        ? 'Invalid JSON in local configuration; inspect it locally.'
        : error.message,
    );
    process.exitCode = 1;
  }
}
