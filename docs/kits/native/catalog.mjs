/** Author native Claude components from maintained operating resources. Build-time only. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { techniques, bundles } from '../selection.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const kits = path.dirname(directory);

const read = (name) => fs.readFileSync(path.join(kits, name), 'utf8');

const file = (name) => fs.readFileSync(path.join(directory, 'files', name), 'utf8');

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');

function helper(name) {
  const source = read('core.mjs');
  const start = source.indexOf('export function ' + name);
  const end = source.indexOf('\nexport function ', start + 1);
  const prelude = ['buildPacket', 'validateHandoff', 'validateCheckpoint'].includes(name)
    ? source.slice(source.indexOf('const text ='), source.indexOf('export function buildPacket'))
    : '';
  return `import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
${name === 'auditCache' ? "import { createHash } from 'node:crypto';" : ''}
${prelude}
${source.slice(start, end < 0 ? undefined : end)}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const input = process.argv[2];
    if (!input || fs.statSync(input).size > 1024 * 1024) throw Error('Supply a bounded local JSON file');
    console.log(JSON.stringify(${name}(JSON.parse(fs.readFileSync(input, 'utf8'))), null, 2));
  } catch (error) { console.error(error instanceof SyntaxError ? 'Invalid local JSON.' : error.message); process.exitCode = 1; }
}
`;
}

function hook(imports, body) {
  return `${imports}
let raw = '';
try {
  for await (const chunk of process.stdin) { raw += chunk; if (raw.length > 4000000) throw Error('Hook input too large'); }
  const event = JSON.parse(raw || '{}');
  const output = await (async () => { ${body} })();
  process.stdout.write(typeof output === 'string' ? output : JSON.stringify(output || {}));
} catch (error) { process.stderr.write('Context component skipped: ' + (error instanceof SyntaxError ? 'Invalid local JSON.' : error.message) + '\\n'); }
`;
}

const skill = (name, description, body) =>
  `---\nname: ${name}\ndescription: ${description}\n---\n\n${body}\n`;

const nativeReferences = ['repository-setup.md', 'contracts.md', 'evaluation.md', 'provenance.md'];
const stageReferences = {
  'qa-failure-triage': ['diagnosis.md', 'evidence.md'],
  'qa-fixture-review': ['fixture-isolation.md', 'diagnosis.md'],
  'qa-regression-design': ['regression.md', 'evidence.md'],
  'qa-evidence-report': ['evidence.md', 'workflow-gates.md'],
};

function nativeText(text) {
  return text
    .replaceAll('node .context-kit/run.mjs packet', 'node scripts/packet.mjs')
    .replaceAll('node .context-kit/run.mjs cache', 'node scripts/cache.mjs')
    .replaceAll('node .context-kit/qa.mjs', 'node scripts/qa.mjs')
    .replaceAll('`core.mjs`', '`handoff.mjs`')
    .replace(
      'Run helpers from the repository root (`node scripts/qa.mjs ...`)',
      'Run helpers from this skill directory (`node scripts/qa.mjs ...`)',
    )
    .replaceAll('node .context-kit/run.mjs handoff', 'node scripts/handoff.mjs')
    .replaceAll('node .context-kit/run.mjs checkpoint', 'node scripts/checkpoint.mjs')
    .replaceAll('node .context-kit/qa.mjs', 'node scripts/qa.mjs')
    .replaceAll(
      'The installer also provides the same helper at the repository root as `.context-kit/qa.mjs`.',
      'This skill carries its own helpers; it does not require a project framework.',
    )
    .replace(
      'Examples assume the repository root. From a subdirectory, use a quoted absolute helper path after determining the root.',
      'Helper commands in this reference are relative to the installed skill directory. Keep ' +
        'the actual QA work in the repository and use a quoted absolute skill-helper path there.',
    )
    .replace(/^.*- Portable:.*\n/gm, '')
    .replace(
      'Coordinate one QA task through explicit stage contracts. This is a discoverable skill, ' +
        'not an always-running workflow engine. Read the selected project `.context-kit/PROTOCOLS.md`.',
      'Coordinate one QA task through explicit stage contracts. This skill loads when invoked; read only its current-stage references.',
    )
    .replace(
      'Write project-specific state to `.context-kit/checkpoint.json`, not global instructions.',
      'Keep task evidence in an approved local task directory, not in global instructions. Use ' +
        '/session-checkpoint when that separate component is installed.',
    )
    .replaceAll(
      '`node scripts/checkpoint.mjs FILE`',
      '`node scripts/checkpoint.mjs FILE` (validation only; /session-checkpoint persists session-scoped state when installed)',
    );
}

export function loadNativeCatalog({ fresh = false } = {}) {
  const compiled = path.join(directory, 'catalog.json');
  if (!fresh && fs.existsSync(compiled)) return JSON.parse(fs.readFileSync(compiled, 'utf8'));
  const components = Object.fromEntries(
    techniques.map((t) => [
      t.id,
      {
        id: t.id,
        name: t.name,
        bundle: t.bundle,
        requires: [...t.requires],
        primary: '',
        loading: '',
        files: [],
        hooks: [],
      },
    ]),
  );

  const add = (id, target, content) =>
    components[id].files.push({ path: target, content, hash: hash(content) });

  const primary = (id, target, content, loading) => {
    components[id].primary = target;
    components[id].loading = loading;
    add(id, target, content);
  };

  const register = (id, target, source, event, explanation, matcher) => {
    primary(id, 'hooks/' + target + '.mjs', source, explanation);
    components[id].hooks.push({
      event,
      ...(matcher ? { matcher } : {}),
      script: 'hooks/' + target + '.mjs',
    });
  };

  primary(
    'task-contract',
    'rules/task-contract.md',
    `# Task and evidence contract

For a multi-step task, keep the current goal, applicable constraints, allowed changes and acceptance checks explicit. Reconfirm after a scope change. Repository-specific instructions and current user intent remain relevant; this rule grants no permissions.

For QA defect work, distinguish product, test/fixture and environment hypotheses before choosing the repair layer. Link consequential claims to sources and actual results. Required local and CI checks must concern the target revision; pending, inaccessible and not-run checks remain incomplete. A passing retry or schema validator does not prove a fix. Preserve unfinished work at handoff and use existing authorization for external actions.
`,
    'Unconditional personal rule in ~/.claude/rules/: startup instruction context in normal ' +
      'Claude Code sessions. Loaded guidance is not enforced compliance.',
  );
  primary(
    'skill-discovery',
    'rules/on-demand-skills.md',
    `# Load the procedure needed for this stage

Use installed skill names/descriptions to choose relevant capabilities. Load a full skill only when its triggering conditions match the current task, then read only the supporting references needed for that stage. Explicit /skill-name invocation selects a procedure directly. Do not open every installed skill, tool description or repository document at kickoff. Reassess source scope when the task changes. Skill instructions do not grant tool, edit, push or deployment permissions.
`,
    'Personal rule loaded at startup; individual skill bodies and reference files remain on demand.',
  );
  primary(
    'cache-prefix',
    'rules/stable-context-prefix.md',
    `# Preserve useful reusable prefixes

When assembling requests you control, keep stable instructions, tool definitions and reusable reference blocks stable and place variable task content after the reusable prefix where the provider supports this. Preserve semantic ordering and native instruction precedence; do not reorder a native harness blindly. Route requests by task suitability, not cache price alone.

Cache reads still occupy model input. A shared prefix is only a candidate hit: provider/model, routing, TTL, minimum length and exact request serialization affect reuse. Use real usage fields to distinguish fresh input, cache writes, reads and output; missing fields stay unknown. Validate quality, latency and total cost per accepted task before adopting a policy. This rule does not configure provider caches.
`,
    'Personal rule loaded at startup; it guides request assembly and does not create or guarantee cache hits.',
  );

  for (const [id, name, fn, filename] of [
    ['source-selection', 'targeted-context', 'buildPacket', 'packet'],
    ['cache-audit', 'cache-usage-audit', 'auditCache', 'cache'],
    ['report-contract', 'validate-worker-report', 'validateHandoff', 'handoff'],
  ]) {
    const t = techniques.find((t) => t.id === id);
    const instructions = nativeText(read(t.protocol))
      .replace(/^# [^\n]+\n+/, '')
      .replace(
        /\[Operating-package authoring basis\]\([^)]*\)/g,
        '[Claude skills](https://code.claude.com/docs/en/skills)',
      );
    primary(
      id,
      `skills/${name}/SKILL.md`,
      skill(
        name,
        'Use when ' +
          {
            'source-selection':
              'a task needs a focused packet of selected source evidence before broader repository exploration.',
            'cache-audit':
              'provider usage must distinguish fresh input, cached input and output without assuming missing usage values.',
            'report-contract':
              'a delegated worker returns a bounded report that must be validated before parent integration.',
          }[id],
        `# ${t.name}

${instructions}

## Native operation

This is an independent personal skill. Invoke /${name}; no shared menu or index is needed. From this skill directory run the command below, or use its resolved absolute path while working in the repository:

\`\`\`sh
node "${'${CLAUDE_SKILL_DIR}'}/scripts/${filename}.mjs" /absolute/input.json
\`\`\`

${
  id === 'report-contract'
    ? 'Input is exactly task_id, summary, source_anchors, findings, checks [{command,status}], ' +
      'open_questions. Maximum 12000 UTF-8 bytes. Status is passed, failed or not-run. ' +
      'Invalid/oversized reports are rejected. Reopen consequential source anchors: schema ' +
      'validity does not authenticate claims. On supported Claude versions, the accompanying ' +
      'PreToolUse hook gates the actual SubagentHandback path only; it does not enable auto ' +
      'mode or intercept ordinary assistant text.'
    : id === 'source-selection'
      ? 'Input is goal, constraints[], checks[] and sources[{path,text}]. Select complete ' +
        'relevant excerpts with source anchors; do not use the helper to ingest the entire ' +
        'repository. It constructs a packet and reports UTF-8 bytes, not native token usage. It ' +
        'does not fetch files or call a model. Review required-fact coverage before admitting the packet.'
      : 'Input includes provider, actual usage, before/now prefixes and observedTotal when ' +
        'needed. Missing quantities remain null; prefix characters/hashes are diagnostics, not ' +
        'cached-token counts. The helper reads only the explicitly supplied local JSON and makes ' +
        'no network/model requests. Compare accepted-task quality and all-call cost before ' +
        'changing model or cache policy.'
}
`,
      ),
      `Native personal skill /${name}; description is discoverable, body loads when invoked. Helper executes locally only when called.`,
    );
    add(id, `skills/${name}/scripts/${filename}.mjs`, helper(fn));
  }

  register(
    'goal-reminder',
    'goal-reminder',
    hook(
      '',
      `if (event.hook_event_name !== 'UserPromptSubmit') return {};
return { hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: 'Keep the latest user goal, applicable constraints and acceptance checks explicit. Apply native instruction precedence. Verify the result against that goal; do not claim checks passed without results.' } };`,
    ),
    'UserPromptSubmit',
    'UserPromptSubmit executes this registered script and adds its bounded guidance to that prompt boundary.',
  );
  register(
    'scoped-worker',
    'scope-worker',
    hook(
      '',
      `if (event.hook_event_name !== 'SubagentStart') return {};
return { hookSpecificOutput: { hookEventName: 'SubagentStart', additionalContext: 'Stay within the delegated question, assigned sources and permitted actions. Return a bounded report: task_id, summary, source_anchors, findings, checks [{command,status}], open_questions. Use not-run for unexecuted checks and surface uncertainty. Coordinator owns source review and acceptance. This guidance grants no permissions.' } };`,
    ),
    'SubagentStart',
    'SubagentStart executes this script; its guidance enters the child session at that boundary.',
  );
  register(
    'compaction-checkpoint',
    'prepare-compaction',
    hook(
      '',
      `if (event.hook_event_name !== 'PreCompact') return {};
return 'Preserve the current user goal, applicable constraints, source/revision anchors, decisions, unfinished work and required checks in the compaction summary. Keep pending checks incomplete. If a validated session checkpoint already exists, preserve its path. This hook supplies summary instructions; it does not author or save factual checkpoint state.';`,
    ),
    'PreCompact',
    'PreCompact stdout supplies compaction-summary instructions on documented supported ' +
      'versions. Factual checkpoints must be explicitly authored and saved.',
  );
  register(
    'checkpoint-restore',
    'restore-checkpoint',
    hook(
      "import { readCheckpoint } from '../skills/session-checkpoint/scripts/state.mjs';",
      `if (event.hook_event_name !== 'SessionStart') return {};
const checkpoint = readCheckpoint(event); if (!checkpoint) return {};
return { hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: 'Validated checkpoint for this repository and this session only. Current user intent governs; recheck source/revision facts.\\n' + JSON.stringify(checkpoint) } };`,
    ),
    'SessionStart',
    'SessionStart reads only an explicitly saved checkpoint for the canonical cwd and current session ID. No checkpoint means no injection.',
    'startup|resume|compact',
  );
  for (const id of ['compaction-checkpoint', 'checkpoint-restore']) {
    add(id, 'skills/session-checkpoint/SKILL.md', file('skills/session-checkpoint/SKILL.md'));
    add(id, 'skills/session-checkpoint/scripts/checkpoint.mjs', helper('validateCheckpoint'));
    for (const name of ['state.mjs', 'files.mjs'])
      add(
        id,
        'skills/session-checkpoint/scripts/' + name,
        file('skills/session-checkpoint/scripts/' + name),
      );
  }
  components['report-contract'].hooks.push({
    event: 'PreToolUse',
    matcher: '^SubagentHandback$',
    script: 'hooks/validate-worker-return.mjs',
  });
  add(
    'report-contract',
    'hooks/validate-worker-return.mjs',
    hook(
      "import { validateHandoff } from '../skills/validate-worker-report/scripts/handoff.mjs';",
      `if (event.hook_event_name !== 'PreToolUse' || event.tool_name !== 'SubagentHandback') return {};
try { const message = event.tool_input?.message;
if (typeof message === 'string' && Buffer.byteLength(message) > 12000) throw Error('Oversized report');
validateHandoff(typeof message === 'string' ? JSON.parse(message) : message); return {};
} catch { return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: 'Worker report is not a valid bounded six-field handoff.' } }; }`,
    ),
  );

  const outputSource = file('hooks/lib/output-store.mjs');
  const outputPrelude = outputSource.slice(
    0,
    outputSource.indexOf('export function captureOutput'),
  );
  for (const [id, name, fn] of [
    ['bounded-results', 'bound-tool-output', 'captureOutput'],
    ['artifact-ledger', 'record-tool-evidence', 'recordEvidence'],
  ]) {
    register(
      id,
      name,
      hook(`import { ${fn} } from './lib/${name}.mjs';`, `return ${fn}(event);`),
      'PostToolUse',
      id === 'bounded-results'
        ? 'Bash PostToolUse bounds supported successful output after saving the full structured ' +
            'result privately. It leaves failures and unsupported shapes unchanged.'
        : 'PostToolUse records bounded local completion metadata only; it does not prove a test passed.',
      id === 'bounded-results' ? '^Bash$' : undefined,
    );
    const fnStart = outputSource.indexOf('export function ' + fn),
      fnEnd = outputSource.indexOf('\nexport function ', fnStart + 1);
    add(
      id,
      `hooks/lib/${name}.mjs`,
      outputPrelude + outputSource.slice(fnStart, fnEnd < 0 ? undefined : fnEnd),
    );
    add(id, 'hooks/lib/files.mjs', file('hooks/lib/files.mjs'));
  }

  for (const t of techniques.filter((t) => t.skill)) {
    const source =
      t.id === 'workflow-coordinator'
        ? 'context-workflow/SKILL.md'
        : `${t.category === 'skills' ? 'qa-skills' : 'qa-workflows'}/${t.skill}/SKILL.md`;
    let text = nativeText(read(source));
    text = text.replace(
      /node scripts\/(qa|handoff|checkpoint)\.mjs/g,
      'node "${CLAUDE_SKILL_DIR}/scripts/$1.mjs"',
    );
    text +=
      '\n## Two different report operations\n\nUse scripts/qa.mjs with the full QA report and ' +
      'reviewed task to assess required-check coverage or generate a bounded handoff. A ' +
      'returned six-field worker report is validated directly with scripts/handoff.mjs; do not ' +
      'pass it as a full QA report. All helper paths belong to this skill and remain usable ' +
      'after the download is deleted. Commands in reference pages are relative to this skill ' +
      'directory; use the resolved absolute script path from a repository.\n';
    primary(
      t.id,
      `skills/${t.skill}/SKILL.md`,
      text,
      `Personal /${t.skill} skill: description is discoverable; full procedure loads on use. Read only the reference for the current stage.`,
    );
    add(
      t.id,
      `skills/${t.skill}/scripts/qa.mjs`,
      nativeText(read('qa.mjs')).replace("from './core.mjs'", "from './handoff.mjs'"),
    );
    add(t.id, `skills/${t.skill}/scripts/handoff.mjs`, helper('validateHandoff'));
    if (t.category === 'workflows')
      add(t.id, `skills/${t.skill}/scripts/checkpoint.mjs`, helper('validateCheckpoint'));
    const refs = new Set([
      ...nativeReferences,
      ...(stageReferences[t.skill] || fs.readdirSync(path.join(kits, 'qa/references'))),
    ]);
    for (const name of refs)
      add(t.id, `skills/${t.skill}/references/${name}`, nativeText(read('qa/references/' + name)));
    for (const name of fs.readdirSync(path.join(kits, 'qa/assets')))
      add(t.id, `skills/${t.skill}/assets/${name}`, read('qa/assets/' + name));
  }
  for (const [name, model, purpose] of [
    ['ci-evidence', 'haiku', 'Extract bounded CI failure evidence and exact revision identifiers.'],
    [
      'fixture-review',
      'sonnet',
      'Review fixture versus product hypotheses against assigned sources.',
    ],
  ]) {
    const target = 'agents/context-' + name + '.md';
    add(
      'model-routing',
      target,
      `---\nname: context-${name}\ndescription: Use when a coordinator delegates ${name === 'ci-evidence' ? 'read-only CI failure evidence extraction' : 'read-only fixture ownership and product/test diagnosis review'}.\nmodel: ${model}\ntools: Read, Glob, Grep\n---\n\n# ${purpose}\n\nReceive the exact question, source files/anchors, target revision, constraints and expected output. Inspect only assigned local evidence; request a missing CI artifact rather than assume network tooling is available. Do not edit, push, deploy or broaden scope. Compare supporting and contradicting evidence. Return task_id, summary, source_anchors, findings, checks [{command,status}], open_questions in at most 12000 serialized UTF-8 bytes. Mark unexecuted checks not-run. Escalate ambiguity or weak evidence to the parent. Coordinator validates structure, reopens consequential sources and owns acceptance. Model availability must be verified in the installed client; a default model is not a quality guarantee.\n`,
    );
  }
  components['model-routing'].primary = 'agents/context-ci-evidence.md';
  components['model-routing'].loading =
    'Native personal subagent definitions. Coordinator explicitly chooses a scoped ' +
    'worker/model; installing these does not automatically route every task.';
  return {
    schema: 1,
    defaults: [
      'task-contract',
      'source-selection',
      'skill-discovery',
      'goal-reminder',
      'compaction-checkpoint',
      'checkpoint-restore',
    ],
    bundles: Object.fromEntries(bundles.map((b) => [b.id, b.techniques])),
    components,
  };
}
