# Global Claude integration

Sources checked2026-11-12: https://code.claude.com/docs/en/hooks ; https://code.claude.com/docs/en/skills ; https://code.claude.com/docs/en/sub-agents . Check the installed client version and current docs before relying on native behavior. Offline helper tests are not installed-runtime tests.

Download/extract the package. Choose an existing Claude user directory (normally ~/.claude; managed deployments/custom configuration may differ). Bootstrap only:
`node context-audit/scripts/cli.mjs install --claude-home /absolute/path/to/.claude --out bootstrap-preview.json`
Inspect, then `node context-audit/scripts/cli.mjs apply --plan bootstrap-preview.json`. This adds the skill, not runtime hooks. Invoke `/context-audit` in Claude; if discovery does not refresh, restart the session. The installer does not install Node or Claude. Scripts use Node18+ built-ins. Generated hook command quoting is POSIX: use macOS/Linux/WSL/Git Bash; on native Windows use portable commands or adapt/test the hook command for your shell.

## Capabilities

- continuity: SessionStart startup/resume/compact returns additionalContext; validated project checkpoint included if present. PreCompact stdout supplies instructions for compaction summary. Native auto-compaction is already built in; no compaction threshold or setting is changed.
- results: Bash PostToolUse updatedToolOutput replaces model-visible future result with≤8,000characters plus an artifact path, while preserving its structured fields. Full successful original stored locally. Errors/stderr/interrupted/image/unrecognized shapes remain original; side effects already happened, telemetry may retain original. This cannot delete arbitrary past messages or guarantee exact token reduction.
- evidence: PostToolUse records time, event, tool name, tool-use ID and explicit exit/interruption metadata when present. Missing exit code remains unknown. Raw commands/prompts/output are not copied. A tool completion does not prove a semantic check passed.
- measurement: SessionStart, PreCompact and SessionEnd log local event metadata only. This does not enable native OTel, token counters or raw payload logging. Optional OTel configuration is separate and explicit.
- workflow: two read-only user-level worker definitions using native haiku/sonnet aliases. Native model availability/alias resolution and task quality must be checked. Their descriptions enter discovery context; full instructions load when used. Parent supplies task scope, source selection and report contract. No automatic use or permission elevation.

## Coexistence and recovery

Global settings merge selected hooks; preserve unrelated hooks and permissions. Namespaced generated files are owned by the package. Reapplication is idempotent; differing unmanaged files/user edits and changes since preview are refused. Apply records exact before/after hashes/content in private Claude user directory `context-audit-install/manifests/`. Rollback with `node scripts/cli.mjs rollback --manifest FILE` only if affected files still match that installation. If edited later, inspect/merge manually; do not overwrite. Previews/manifests can contain private existing settings: keep them local.

At runtime, global continuity/results skip their corresponding adapter when the active cwd project has a selected Claude context-kit and matching `.context-kit/hook.mjs` command configured. This avoids known duplicate adapters, not arbitrary third-party hooks. Inspect other output-transforming hooks for conflicts. All project checkpoints/traces/results resolve against event.cwd under `.context-audit/`; symlink targets are refused. Do not commit artifacts containing sensitive evidence by default; follow the project's ignore/retention rules. The installer does not edit project .gitignore or permission policies.
