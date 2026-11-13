# Prepare compaction checkpoint

## Use when

A long task is approaching compaction, interruption or a deliberate handoff.

## Inputs and prerequisites

Current goal, constraints, source anchors, decisions, open work and acceptance checks.

Delivered mechanism: **PreCompact / protocol**. Native integrations are selected per harness; portable guidance does not imply automatic native enforcement.

## Procedure

1. Keep native auto-compaction available. The package does not change its trigger threshold or claim ownership of native summarization.
2. Before the boundary, prepare .context-kit/checkpoint.json with goal, constraints, source_anchors, open_work and acceptance_checks. Keep the pending revision/CI state in those fields.
3. Validate with node .context-kit/run.mjs checkpoint FILE. The selected PreCompact hook supplies preparation guidance; it does not write a factual checkpoint automatically.
4. After the boundary, use the restoration protocol and reopen required primary facts before relying on the summary.

## Output contract

A validated compact state packet with explicit unfinished work, not a pasted prior conversation.

## Verification and evaluation

Exercise compact/resume with an incomplete CI check and changed user goal. Inspect the summary request overhead separately from the resumed parent.

## Limits and recovery

Structure validation does not establish factual accuracy. Summarization can lose details; do not mark pending checks passed or imply all harnesses expose the same events. Preserve existing unrelated files/hooks and enterprise settings. If a managed file differs, review it rather than overwriting. Keep task evidence until the project's retention/acceptance requirements permit removal.

## References

- [Native hook capabilities](https://code.claude.com/docs/en/hooks)
- [Skill loading and resources](https://code.claude.com/docs/en/skills)
- [Operating-package authoring basis](../qa/references/provenance.md)
