---
name: session-checkpoint
description: Use when a long-running task needs explicit session-scoped continuity before compaction, interruption or a deliberate handoff.
---

# Preserve and restore this session's task state

This personal skill is the factual checkpoint producer. A PreCompact reminder alone does not create a checkpoint. Use the current user goal and actual evidence; do not summarize invented progress or copy a whole conversation.

## Inputs and scope

Bind the current repository working directory and current Claude session ID. The helper canonicalizes cwd and keys storage by both identities. Concurrent sessions in the same repository and sessions in different repositories have distinct state. Never choose a “latest” checkpoint from another session. A deliberate transfer to a new session needs an explicit, reviewed handoff, not automatic fallback.

## Author a checkpoint

Create a small JSON draft in an approved local task directory with exactly these fields:

```json
{
  "goal": "Current requested outcome",
  "constraints": ["Applicable constraint and permitted scope"],
  "source_anchors": ["Actual source/revision and CI run identity"],
  "open_work": ["Unfinished action or pending required check"],
  "acceptance_checks": ["Required acceptance criterion and actual current status"]
}
```

Use actual task details in place of the illustrative strings. Keep pending/inaccessible/not-run checks incomplete. Reconcile contradictory facts before saving; the validator checks structure, not truth. Exclude credentials and raw private histories. The complete stored envelope must fit 12000 UTF-8 bytes.

## Validate and persist

Use the current session variable supplied by Claude, not a guessed session ID. Commands use the resolved skill directory; they work after the extracted installer is deleted.

```sh
node "${CLAUDE_SKILL_DIR}/scripts/state.mjs" write /absolute/checkpoint-draft.json --cwd "$PWD" --session-id "${CLAUDE_SESSION_ID}"
node "${CLAUDE_SKILL_DIR}/scripts/state.mjs" read --cwd "$PWD" --session-id "${CLAUDE_SESSION_ID}"
```

The write command validates and saves state, then prints its local path and scope. It does not update a global instruction file or upload data. The optional separate SessionStart restore hook reads only this exact scope and adds validated reference state on startup/resume/compact. Missing state produces no injection. If a session changes cwd, save again with the intended actual working directory; state is deliberately not searched across directories.

## Recheck after a boundary

Current user intent and native instruction authority govern. Reopen consequential source/revision facts and inspect actual pending CI state before continuing. A structurally valid checkpoint does not establish that a test passed or permission was granted.

State is private local data under the configured Claude home’s `state/session-checkpoints/`, keyed by canonical cwd and session ID. At most 32 bounded checkpoint files are retained. A full store or lock contention refuses a new write; inspect retention locally and retry explicitly. Nothing is automatically deleted. On Windows, use appropriate ACLs; POSIX modes do not provide encryption or protection from a hostile process running as the same OS user.

## Evaluate

Save a synthetic task in two temporary repositories and two simultaneous session IDs. Confirm every read returns only the matching state and a new session returns null. Verify actual installed-client SessionStart behavior before relying on restoration. Source: [Claude skills](https://code.claude.com/docs/en/skills), [hook events](https://code.claude.com/docs/en/hooks).
