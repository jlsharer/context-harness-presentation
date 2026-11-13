# One workflow with stage contracts

## Use when

A multi-stage QA task needs consistent inputs, outputs and evidence through local and CI acceptance.

## Inputs and prerequisites

Reviewed task packet, repository setup, current authorization and selected source scope.

Delivered mechanism: **Discoverable workflow skill**. Native integrations are selected per harness; portable guidance does not imply automatic native enforcement.

## Procedure

1. Invoke the context-workflow entry using the current harness syntax; read repository-setup and the current stage reference.
2. Move through diagnosis, discriminating regression, minimal repair, local verification, exact-revision CI and handoff. Revisit a stage when evidence contradicts the hypothesis.
3. Use contained triage/fixture/regression/evidence skills as needed; optional scoped workers return bounded reports, not full histories.
4. Validate task/report structure and declared required-check coverage with qa.mjs. Independently inspect the actual results before accepting claims.

## Output contract

A full source-linked QA report, bounded handoff and checkpoint of unfinished work.

## Verification and evaluation

Run the supplied incomplete/wrong-revision contract cases, then a representative native QA trial. Evaluate accepted-task outcomes, cost and latency.

## Limits and recovery

Local green does not establish CI success. Existing approval may cover a push; otherwise prepare the concrete work before requesting that action. The skill does not grant permissions or fabricate native execution. Preserve existing unrelated files/hooks and enterprise settings. If a managed file differs, review it rather than overwriting. Keep task evidence until the project's retention/acceptance requirements permit removal.

## References

- [Native hook capabilities](https://code.claude.com/docs/en/hooks)
- [Skill loading and resources](https://code.claude.com/docs/en/skills)
- [Operating-package authoring basis](../qa/references/provenance.md)
