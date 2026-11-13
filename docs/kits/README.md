# Context optimization packages

Requires Node.js18+. No API keys, dependencies, telemetry exporters or model calls are installed.

## Claude: native personal installation

The default Packages view installs directly into your existing personal Claude configuration directory: `CLAUDE_CONFIG_DIR`, otherwise `~/.claude/`. It does not install a context-kit framework, context-menu skill, PROTOCOLS.md index or selection registry. The original portable implementation used a shared index to avoid loading all procedures up front, but that filename has no native loading behavior; it was only read when an instruction/skill requested it.

Download a standalone item or bundle for only its dependency closure. Download `claude-native.zip` for arbitrary combined selections. Extract it, then preview:

```sh
node install.mjs --techniques goal-reminder,checkpoint-restore
node install.mjs --kits handoff
```

Add `--apply` to apply the reviewed file changes. Use `--claude-home /explicit/path/.claude` for another configuration directory or an isolated trial. With no selection flags, a focused download previews that package; the library defaults to kickoff and continuity. Previewing creates no files. The extracted download can be deleted after installation; installed components use their own local resources.

| Native path                                                | Loading mechanism                                                   |
| ---------------------------------------------------------- | ------------------------------------------------------------------- |
| `~/.claude/rules/*.md`                                     | Personal startup guidance in normal sessions                        |
| `~/.claude/skills/NAME/SKILL.md`                           | Native discovery metadata; body loads on invocation                 |
| `~/.claude/agents/*.md`                                    | Scoped native subagent selected by the coordinator                  |
| `~/.claude/hooks/*.mjs` + selected `settings.json` entries | Deterministic event execution, with event-specific output semantics |

`task-contract`, `skill-discovery` and `cache-prefix` are small native rules. Source packets, cache audits and bounded report validation are independent skills. QA workflows carry only current-stage operating references, their own scripts, templates and genuinely required reusable skills. Hook dependencies are explicit; a goal-reminder-only install adds just its script and settings registration. Settings fragments are review examples; do not overwrite existing settings with them.

Every preview opens the selected item's main file. Its own files are visible first; required dependency files are available through a labeled control. Directory folding and full source/copy/download remain available. The displayed root is `~/.claude`, never an example project. Fresh public previews do not read private settings.

## Loading is explicit, not a compliance guarantee

Rules enter normal startup context. Skills load when used, not merely because they exist. Hook scripts run only the selected registered events and subject to native version/trust/enterprise policies. For current documented versions, PreCompact stdout gives instructions to the compaction summary; it does not author factual checkpoint state.

The included `/session-checkpoint` skill is the producer: it validates and writes the task state using the actual cwd and current session ID. SessionStart restore selects that exact canonical cwd/session pair only. Other sessions and repositories get no fallback state. A new session needs a deliberate reviewed transfer. Checkpoints are at most 12000 bytes, max 32 files, private under `state/session-checkpoints/`. Full stores/locks refuse writes, never delete evidence. Bounded result storage is capped at 20 artifacts,4 MiB each / 16 MiB total; evidence logs at 20 files/256 KiB each. Full stores skip capture and preserve original results. Raw result artifacts may contain secrets; select capture only within your organization's data policy. Windows needs suitable ACLs. Local modes are not encryption or isolation from hostile same-user processes.

The installer preserves existing permissions, environment, enterprise telemetry and unrelated hooks. It accepts identical files and refuses differing files, including previously generated versions; review upgrades locally. It preflights stale previews and rolls back completed writes on interruption where paths remain unchanged. No registry or receipt is installed. Existing legacy project integrations are not silently removed.

Sources: [Claude memory/rules](https://code.claude.com/docs/en/memory), [skills](https://code.claude.com/docs/en/skills), [hooks](https://code.claude.com/docs/en/hooks). Native installed-client behavior and accepted-task improvements require trials in your approved environment. Fixture tests and schema checks do not authenticate CI results or guarantee instruction compliance. The separate global audit retains its file-first private-report defaults.

## Legacy project installer — retained compatibility

## Bundles, individual techniques and QA workflows

The presentation catalog groups Bundled, Hooks, Commands/Workflows (including a Skills subcategory), Protocols, Helpers/Guidance and Agents/Routing. Every item has **Preview files**: a fresh-project directory inventory generated by this installer, with complete rendered Markdown and source views. Expand or collapse folders individually or with the tree controls; folder states persist while switching files and views. These public previews never read your private project/settings. `<PROJECT>` stands for the project path used when you install. Your local preview lists the actual paths to review before applying.

The legacy archive is `context-kits.zip`. It retains project-scoped Claude/OpenCode/Codex adapters and portable helpers for existing installations. The current Claude Packages page uses the separate native personal installer described above.

Keep the existing bundle commands, or choose granular items:

```sh
node install.mjs --harness claude --techniques goal-reminder,compaction-checkpoint --target /path/to/project
node install.mjs --harness claude --techniques workflow-coordinator --target /path/to/project
node install.mjs --harness codex --techniques qa-regression-workflow,qa-evidence-skill --target /path/to/project
```

These commands preview file paths; add `--apply` only after reviewing and authorizing the changes. Mixing `--kits` and `--techniques` unions their selections. Dependencies are included; each harness keeps its own selection. `task-contract` appends one small managed block to root CLAUDE.md (Claude) or AGENTS.md (OpenCode/Codex), preserving existing text. Conflicting managed blocks or edited generated files are refused. Known prior managed helper versions can be upgraded; arbitrary files cannot be replaced. No approval mode, native compaction threshold, telemetry exporter or enterprise permission is changed.

For Claude, the workflow library provides `/context-workflow` (CI diagnosis and repair, in Scoped delegation), `/qa-regression-repair` and `/qa-release-validation` (in the QA collection), with separately selectable `qa-failure-triage`, `qa-fixture-review`, `qa-regression-design` and `qa-evidence-report` skills. Codex invokes the same entries with `$context-workflow`, `$qa-regression-repair` and `$qa-release-validation`; OpenCode receives slash-command wrappers for the workflows. Modern discoverable SKILL.md entries serve as workflow commands; Claude documents these as the successor to command files. Start a fresh native session after install and confirm skill discovery. Portable installs store complete Markdown under `.context-kit/skills/` for explicit use rather than claiming native discovery.

Workflow input: failure/target revision, source or CI anchors, reproduction command, permitted actions and acceptance checks. Stages exchange bounded reports, not whole conversations. The coordinator owns edits, actual test execution, authorization and acceptance. A local pass does not establish CI success; required CI must match the exact revision. Pending/inaccessible results remain incomplete. Hook metadata and report schemas do not prove correctness.

Selected Claude routing installs read-only Haiku CI-evidence and Sonnet fixture-review agents. Other harnesses receive a routing protocol here, not a claimed native agent adapter. Select only useful delegation and include worker overhead when evaluating cost.

Standalone hooks activate only their event: `goal-reminder` uses UserPromptSubmit; `compaction-checkpoint` uses PreCompact; `checkpoint-restore` uses SessionStart startup/resume/compact. OpenCode's existing native continuity adapter requires both reminder and compaction techniques; partial selections use the portable protocol. Native auto-compaction already exists. Checkpoints are structurally validated and bounded; their contents enter the normal model context. Nothing here guarantees instruction compliance.

Optional Bash result artifacts may contain secrets. New hook captures use private POSIX directories/files and bounded storage (20 artifacts, 4 MiB each / 16 MiB total; 20 traces, 256 KiB each). Capture skips when full or locked and retains original tool results. No evidence is automatically deleted; follow your organization's retention policy. Windows requires appropriate ACLs. The separate global Claude audit retains its private report/reduced-sharing workflow; matching project integrations take precedence at corresponding boundaries.

Sources checked 2026-11-13: [Claude skills and commands](https://code.claude.com/docs/en/skills), [Claude hooks](https://code.claude.com/docs/en/hooks), [Claude subagents](https://code.claude.com/docs/en/sub-agents), [OpenCode commands](https://opencode.ai/docs/commands/). Cross-harness discovery and native execution require validation in the installed client.

1. Choose packages in the presentation and download this ZIP.
2. Extract it, then run the displayed command, for example:

```sh
node install.mjs --harness claude --kits focus,continuity --target /path/to/project --apply
```

Omit `--apply` to preview paths. Supported targets: `claude`, `opencode`, `codex`, `portable`. Existing unrelated settings and instruction files are preserved. Differing user-edited generated files cause a refusal before writes. Adding packages merges the selection; each harness activates only its own selected native adapters. Do not move a project after generating absolute Claude hook paths without reinstalling/reviewing those commands.

The native discovery wrapper is `context-menu`. Invoke it explicitly or ask the agent to read `.context-kit/PROTOCOLS.md`. Native reminder hooks add instructions; they do not prove semantic retention. OpenCode V2 adapter and Claude config are source-matched and offline-event-tested, not verified in your installed native runtime. Codex gets skill/protocol integration in this bundle. Current native hooks are documented at https://learn.chatgpt.com/docs/hooks; this installer does not add a Codex hook adapter. The generated command hooks assume a POSIX-compatible shell (including WSL/Git Bash).

Portable helpers:

```sh
node .context-kit/run.mjs packet input.json
node .context-kit/run.mjs bound full-result.txt 8000 .context-kit/artifacts
node .context-kit/run.mjs checkpoint checkpoint.json
node .context-kit/run.mjs handoff report.json
node .context-kit/run.mjs cache usage.json
```

Packet JSON: `{ "goal":"Fix retry", "constraints":["Preserve API"], "checks":["Concurrent retry"], "sources":[{"path":"contracts/storage.md","text":"Full selected source text"}] }`.
Checkpoint JSON: `{ "goal":"Fix retry", "constraints":["Preserve API"], "source_anchors":["STORAGE-2"], "open_work":["Implement"], "acceptance_checks":["Concurrent retry"] }`.
Handoff JSON: `{ "task_id":"retry", "summary":"Commit differs from acknowledgement", "source_anchors":["STORAGE-2"], "findings":["Retain committed identity"], "checks":[{"command":"npm test","status":"not-run"}], "open_questions":[] }`.
Cache JSON: `{ "provider":"openai", "usage":{"input_tokens":20000,"input_tokens_details":{"cached_tokens":14000,"cache_write_tokens":0}}, "before":"stable prefix A", "now":"stable prefix B" }`.

Structural validation is not proof of factual truth or executed checks. Cache read tokens remain included input; absent write/fresh fields stay unknown. Inspect real model usage, task acceptance, factual errors, latency and total cost before adopting a default policy.

Selected `results` on Claude installs a Bash PostToolUse `updatedToolOutput` adapter: at most 8000 characters of model-visible stdout including the artifact path. It stores the full structured original, preserves metadata, and leaves errors/interrupted/image/unknown result shapes unchanged. Tool side effects and original telemetry remain. Other tools use the portable wrapper; validate the installed version against the current hook reference.

Handoffs accept exactly the six demonstrated top-level fields, and only command/status inside checks. Maximum serialized report size is 12000 UTF-8 bytes. Unknown fields and oversized reports are rejected. Automatic Claude delivery validation requires v2.1.271+ auto mode and the actual SubagentHandback path. Outside it, invoke the helper before integration. The installer never enables auto mode or changes permission settings.
