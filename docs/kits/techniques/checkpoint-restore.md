# Restore checkpoint on resume

## Use when

A session resumes or compacts and should recover the selected task state.

## Inputs and prerequisites

Project checkpoint, current user intent and relevant source/revision anchors.

Delivered mechanism: **SessionStart / protocol**. Native integrations are selected per harness; portable guidance does not imply automatic native enforcement.

## Procedure

1. At selected Claude startup/resume/compact events, read the real project checkpoint only after bounded structural validation.
2. Inject the checkpoint as a reference subject to the current user request and native instruction authority. Reopen source facts and verify that branch/revision/CI state still match.
3. When the file is absent, continue without invented state. When invalid or oversized, leave native behavior intact and inspect the local file before relying on it.
4. Use explicit protocol/helper steps on a harness without the delivered native restore adapter.

## Output contract

Relevant checkpoint context, at most 12000 UTF-8 bytes before injection, with source facts restored as needed.

## Verification and evaluation

Test missing, malformed, oversized and valid checkpoints; verify a changed goal supersedes stale state.

## Limits and recovery

Checkpoint contents enter the normal approved model connection. This is neither a guarantee of semantic retention nor a way to bypass normal instructions or permissions. Preserve existing unrelated files/hooks and enterprise settings. If a managed file differs, review it rather than overwriting. Keep task evidence until the project's retention/acceptance requirements permit removal.

## References

- [Native hook capabilities](https://code.claude.com/docs/en/hooks)
- [Skill loading and resources](https://code.claude.com/docs/en/skills)
- [Operating-package authoring basis](../qa/references/provenance.md)
