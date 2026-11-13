---
name: qa-regression-design
description: Use when turning a supported defect hypothesis into a deterministic regression and appropriately scoped verification plan.
---

# Regression design

## Input contract

Supported hypothesis, affected source anchors, expected invariant, allowed edits and acceptance criteria.

## Design and execution

1. State the invariant and the counterexample that should fail before the fix.
2. Prefer deterministic synchronization/data setup over sleeps or probabilistic timing.
3. Add the smallest regression at the layer that owns the defect. Preserve relevant product contracts.
4. Run the regression before and after the scoped patch if execution is authorized. Record actual commands and results; otherwise label not-run.
5. Select related checks, parallel repeats and CI coverage that can catch collateral effects. Explain limitations and cost.

## Output

Regression rationale, changed paths, before/after evidence, required local/CI checks and unresolved risks. A passing local test is not a CI result. Keep revision identity with each test report.

## Boundaries

Do not weaken assertions or inflate retries to hide a failure. Do not modify production code when only a test defect is supported. Ask for missing external-action authorization only after preparing the concrete diff and evidence.

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

- [regression.md](references/regression.md): test-before-fix, allowed edits and verification.
- [evidence.md](references/evidence.md): revision-linked before/after records.

Before broad rollout, use [evaluation.md](references/evaluation.md) to test representative tasks, model suitability, actual native integration and accepted-task results. [provenance.md](references/provenance.md) records the published authoring patterns used; this package is original and carries no vendor certification.
