---
name: qa-release-validation
description: Use when preparing a release-readiness assessment from scoped requirements, regression risks and actual local or CI evidence.
---

# Validate release readiness

## Stage 1 · Define the release gate

Input: target revision/release candidate, change scope, affected features, required test suites, environment and acceptance criteria. Distinguish a readiness assessment from permission to deploy. Output: bounded test/evidence matrix and unresolved requirements.

## Stage 2 · Gather evidence

Select relevant CI jobs, reports and change anchors. Use qa-failure-triage on failures to separate product, test/fixture and environment hypotheses. Optional read-only workers receive exact sources and a bounded report contract; do not paste the whole release history.

Input: the approved evidence matrix and permitted sources. Output: source-linked failure classifications, actual job/report identities and missing or inaccessible evidence. Preserve unknowns rather than filling gaps with assumptions.

## Stage 3 · Reconcile the exact revision

Use qa-evidence-report. Match every required job/report to the candidate revision and required environment. Include failures, retries, missing jobs and inaccessible results. A green unrelated commit or a local-only pass does not satisfy the CI gate.

Input: collected reports plus the candidate revision and required environment. Output: a check-by-check acceptance table, revision matches/mismatches and unresolved gates for the recommendation stage.

## Stage 4 · Recommend and hand off

Output: ready / blocked / insufficient evidence, evidence matrix, unresolved risk, approvals still required and next action. No deployment, push, rollback or permission change is authorized merely by invoking this workflow. Preserve a checkpoint when awaiting CI or review. A report describes evidence; it does not replace organization-specific release approval.

## Operating resources and first-use setup

Before acting in a new repository, read [repository-setup.md](references/repository-setup.md) to bind actual commands, revision identity, allowed paths and CI tooling. Use native discovery appropriate to the harness: Claude slash invocation, Codex dollar skill mention, or the delivered OpenCode command/skill. If a required tool or permission is unavailable, report the gap; do not invent an execution result.

Use the [task and report contracts](references/contracts.md) and supplied [task](assets/task.json) / [report](assets/report.json) drafts. Replace draft markers and required checks before assessment. From this skill's directory, inspect `node scripts/qa.mjs --help`, then run the helpers using quoted absolute paths as needed. The installer also provides the same helper at the repository root as `.context-kit/qa.mjs`.

```sh
node scripts/qa.mjs validate-task /path/to/task.json
node scripts/qa.mjs validate-report /path/to/report.json
node scripts/qa.mjs assess /path/to/report.json --task /path/to/task.json
node scripts/qa.mjs handoff /path/to/report.json --task /path/to/task.json
```

Assessment binds required checks to the reviewed task. Exit 2 means declared evidence is incomplete; the helper does not run commands, authenticate, fetch CI, grant permission or establish factual truth. A wrong-revision result cannot become a passed check for the target in the bounded handoff. Reopen actual source/results when reviewing consequential claims.

## Read only the reference for this stage

- [workflow-gates.md](references/workflow-gates.md): readiness versus action authorization.
- [evidence.md](references/evidence.md): missing/inaccessible/wrong-revision release evidence.
- [diagnosis.md](references/diagnosis.md): classify failures without masking product issues.

Before broad rollout, use [evaluation.md](references/evaluation.md) to test representative tasks, model suitability, actual native integration and accepted-task results. [provenance.md](references/provenance.md) records the published authoring patterns used; this package is original and carries no vendor certification.
