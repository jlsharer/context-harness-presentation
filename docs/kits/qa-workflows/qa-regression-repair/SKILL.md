---
name: qa-regression-repair
description: Use when a known regression needs a minimal fix, deterministic test and revision-linked local and CI verification.
---

# Repair a regression

## Stage 1 · Establish the defect

Input: failing behavior, known-good/bad revision or change, relevant source anchors, allowed edits and acceptance checks. Confirm the supported hypothesis; use qa-failure-triage if the cause is still unknown. Output: invariant, counterexample and scoped repair plan.

## Stage 2 · Design the regression

Use qa-regression-design with the hypothesis and constraints. Add a deterministic failing check before the fix where execution is authorized. Output: regression rationale, actual baseline result and affected paths.

## Stage 3 · Repair and verify locally

Make the smallest correct patch, inspect the diff, execute targeted and related checks. Preserve public behavior outside the accepted defect scope. Output: changed files, command/status/artifact and tested revision.

## Stage 4 · Verify the remote revision

Prepare the concrete diff and local evidence. Push only under existing authorization; otherwise ask before the external action. Use qa-evidence-report to inspect CI for the exact pushed revision. Pending, inaccessible or another revision is not passed.

Input: reviewed patch, tested revision, local check artifacts and external-action authorization. Output: pushed revision (if authorized), CI run/job identities, actual statuses for that revision and remaining acceptance work. Do not claim CI acceptance while required evidence is missing.

## Handoff

Report root cause, patch, local and matching-revision CI evidence, coverage limits and unfinished work. If acceptance remains incomplete, checkpoint it instead of claiming completion. Optional workers are read-only unless explicitly granted more scope; coordinator owns edits and final acceptance.

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

- [workflow-gates.md](references/workflow-gates.md): stage gates and interruption recovery.
- [regression.md](references/regression.md): supported regression and scoped fix.
- [evidence.md](references/evidence.md): remote verification and handoff.

Before broad rollout, use [evaluation.md](references/evaluation.md) to test representative tasks, model suitability, actual native integration and accepted-task results. [provenance.md](references/provenance.md) records the published authoring patterns used; this package is original and carries no vendor certification.
