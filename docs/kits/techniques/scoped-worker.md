# Scoped worker input

## Use when

An evidence/analysis subtask has a clear boundary and can be reviewed independently.

## Inputs and prerequisites

Exact question, selected files/anchors, allowed actions, acceptance and output schema.

Delivered mechanism: **SubagentStart / protocol**. Native integrations are selected per harness; portable guidance does not imply automatic native enforcement.

## Procedure

1. Assign a bounded question such as CI failure extraction or fixture ownership critique. Include only the necessary task/source packet.
2. Keep read-only workers from editing or pushing. Coordinator owns changes, actual test execution and final acceptance unless a task explicitly assigns otherwise.
3. Require the six-field bounded report and escalation on missing evidence, contradictions or scope overflow.
4. Track each worker session and its own initial instructions, tools, source/results and calls. Do not equate delegation with free context reduction.

## Output contract

A scoped worker input and a reviewable report, with full supporting artifacts outside the parent return.

## Verification and evaluation

Inspect the first child request and returned packet. Validate report shape and reconcile consequential claims against primary sources.

## Limits and recovery

A native reminder does not enforce every semantic boundary. The parent does not automatically inherit a complete worker history, and not every harness supports the same handback gate. Preserve existing unrelated files/hooks and enterprise settings. If a managed file differs, review it rather than overwriting. Keep task evidence until the project's retention/acceptance requirements permit removal.

## References

- [Native hook capabilities](https://code.claude.com/docs/en/hooks)
- [Skill loading and resources](https://code.claude.com/docs/en/skills)
- [Operating-package authoring basis](../qa/references/provenance.md)
