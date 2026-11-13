# Load skills when needed

## Use when

Many skills or long protocols are installed, but only one stage is active.

## Inputs and prerequisites

Current task/stage and native skill inventory.

Delivered mechanism: **Protocol**. Native integrations are selected per harness; portable guidance does not imply automatic native enforcement.

## Procedure

1. Keep discovery descriptions narrow and cheap. Confirm how the installed harness discovers the actual skill path.
2. Load the current skill entry and only its relevant references. Use helper --help before loading implementation source when the helper already performs the needed operation.
3. Have the coordinator name the stage input/output and decide when a skill result is sufficient to proceed. A list of skill names is not an enforced sequence.
4. Keep earlier artifacts accessible by path rather than pasting every skill body and result repeatedly.

## Output contract

Current-stage instructions and explicit handoff; inactive reference bodies stay on disk.

## Verification and evaluation

Inspect native context/discovery and verify the required skill is found. Confirm the workflow completes rather than merely naming several skills.

## Limits and recovery

Discovery and invocation differ across Claude, Codex and OpenCode. Do not claim all installed skill bodies load at startup or all native commands use the same syntax. Preserve existing unrelated files/hooks and enterprise settings. If a managed file differs, review it rather than overwriting. Keep task evidence until the project's retention/acceptance requirements permit removal.

## References

- [Native hook capabilities](https://code.claude.com/docs/en/hooks)
- [Skill loading and resources](https://code.claude.com/docs/en/skills)
- [Operating-package authoring basis](../qa/references/provenance.md)
