# Validate worker return

## Use when

A worker return must be admitted without flooding or misleading the parent.

## Inputs and prerequisites

Worker report and links to its full evidence.

Delivered mechanism: **Validator + supported gate**. Native integrations are selected per harness; portable guidance does not imply automatic native enforcement.

## Procedure

1. Require task_id, summary, source_anchors, findings, checks [{command,status}], open_questions only.
2. Validate via node .context-kit/run.mjs handoff report.json before delivery. The serialized byte limit is 12000, not a provider token estimate.
3. Reject unknown fields, invalid statuses and over-budget returns rather than silently dropping important evidence. Keep a full local report and links.
4. If the supported Claude SubagentHandback gate is unavailable for the installed version/mode, invoke the validator explicitly and review before parent integration.

## Output contract

A structurally valid bounded return, with unresolved questions and unexecuted checks labeled honestly.

## Verification and evaluation

Test malformed/oversized reports and conflicting source claims. For detailed QA reports, bind required checks/revisions with qa.mjs instead of relying on the narrow handoff schema.

## Limits and recovery

The schema is not factual verification. Installing this technique does not enable auto mode or grant permission, and a worker closing message may differ from its validated report. Preserve existing unrelated files/hooks and enterprise settings. If a managed file differs, review it rather than overwriting. Keep task evidence until the project's retention/acceptance requirements permit removal.

## References

- [Native hook capabilities](https://code.claude.com/docs/en/hooks)
- [Skill loading and resources](https://code.claude.com/docs/en/skills)
- [Operating-package authoring basis](../qa/references/provenance.md)
