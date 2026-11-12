# Context optimization kits

Requires Node.js 18+ and a project directory you choose. No API keys, package installation or model calls.

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
