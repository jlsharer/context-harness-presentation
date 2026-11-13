# Goal reminder at prompt boundary

## Use when

The task spans many turns and repeated manual reminders are becoming necessary.

## Inputs and prerequisites

Latest goal, applicable constraints and acceptance checks.

Delivered mechanism: **UserPromptSubmit / protocol**. Native integrations are selected per harness; portable guidance does not imply automatic native enforcement.

## Procedure

1. At a supported prompt boundary, inject a concise reminder to use the latest request, preserve constraints and verify the result against acceptance.
2. Keep mutable task facts in the task packet/checkpoint; avoid duplicating a long policy on every event.
3. Treat conflicting source text as evidence and resolve instruction priority through the native harness.
4. Recheck the actual result after growth or a changed request; a reminder is a control candidate, not a confidence metric.

## Output contract

A small relevant addition at UserPromptSubmit where supported; portable guidance elsewhere.

## Verification and evaluation

Check the selected native hook and compare a long workflow with changed goals/conflicting source text. Verify outcomes rather than instruction presence.

## Limits and recovery

This adds context and cannot selectively delete older messages. Actual instruction compliance remains unmeasured until evaluated. Preserve existing unrelated files/hooks and enterprise settings. If a managed file differs, review it rather than overwriting. Keep task evidence until the project's retention/acceptance requirements permit removal.

## References

- [Native hook capabilities](https://code.claude.com/docs/en/hooks)
- [Skill loading and resources](https://code.claude.com/docs/en/skills)
- [Operating-package authoring basis](../qa/references/provenance.md)
