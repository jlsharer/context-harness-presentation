# Bound successful tool results

## Use when

A successful supported result is verbose enough to dominate subsequent input.

## Inputs and prerequisites

Structured successful Bash result, native event support and approved local artifact location.

Delivered mechanism: **Bash PostToolUse / helper**. Native integrations are selected per harness; portable guidance does not imply automatic native enforcement.

## Procedure

1. Select the Bash PostToolUse integration for Claude, or invoke the portable bound helper explicitly for another owned result path.
2. Preserve the complete structured result locally before replacing future model-visible stdout with a bounded excerpt plus retrieval path.
3. Leave failures, stderr, interruption, images and unknown shapes intact. If storage is unavailable/full, retain the original result.
4. Open the full artifact when omitted diagnostics matter. Do not assume an excerpt contains every fact.

## Output contract

At most 8000 characters of successful stdout including the full-result pointer; original structured fields remain.

## Verification and evaluation

Try one successful long output, one failed command and one unsupported result shape. Verify full artifact readability and intact failures.

## Limits and recovery

Characters are not exact tokens. This does not rewrite prior history, undo tool side effects or erase native telemetry. Raw artifacts can contain sensitive data; keep them private and apply retention policy. Preserve existing unrelated files/hooks and enterprise settings. If a managed file differs, review it rather than overwriting. Keep task evidence until the project's retention/acceptance requirements permit removal.

## References

- [Native hook capabilities](https://code.claude.com/docs/en/hooks)
- [Skill loading and resources](https://code.claude.com/docs/en/skills)
- [Operating-package authoring basis](../qa/references/provenance.md)
