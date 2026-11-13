# Local evidence ledger

## Use when

A workflow repeatedly asks for evidence recording or loses which checks actually executed.

## Inputs and prerequisites

Selected native completion events, task/revision identity and actual report artifacts.

Delivered mechanism: **PostToolUse / local file**. Native integrations are selected per harness; portable guidance does not imply automatic native enforcement.

## Procedure

1. Record allowlisted tool-completion metadata locally at the selected event. Unknown tool names become a generic category; exclude commands, raw output and direct tool-use identifiers.
2. Link substantive test/CI reports in the full QA evidence report; keep exact revision and run identities with those results.
3. Separate completion metadata from test acceptance. An exit code or a tool event alone cannot establish semantic QA success.
4. Stop capture at bounded storage limits and disclose gaps; do not delete evidence or infer that skipped capture means no activity.

## Output contract

Private bounded metadata traces plus source-linked substantive QA artifacts.

## Verification and evaluation

Inspect event fields using synthetic data. Confirm sensitive strings are absent, quotas stop capture and declared coverage remains honest.

## Limits and recovery

This is not full per-request token/cost telemetry. No collector or exporter is enabled. Preserve existing enterprise logging and permission policy. Preserve existing unrelated files/hooks and enterprise settings. If a managed file differs, review it rather than overwriting. Keep task evidence until the project's retention/acceptance requirements permit removal.

## References

- [Native hook capabilities](https://code.claude.com/docs/en/hooks)
- [Skill loading and resources](https://code.claude.com/docs/en/skills)
- [Operating-package authoring basis](../qa/references/provenance.md)
