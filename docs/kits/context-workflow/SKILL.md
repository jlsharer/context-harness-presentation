---
name: context-workflow
description: Use when investigating recurring automation or CI failures, distinguishing product defects from test defects, or coordinating diagnosis, a scoped fix and revision-linked local and CI verification.
---

# Context workflow

Coordinate one QA task through explicit stage contracts. This is a discoverable skill, not an always-running workflow engine. Read the selected project `.context-kit/PROTOCOLS.md`. Use only installed workers and approved tools. Preserve current user intent, native instruction priority and existing permission boundaries.

## Task packet

Capture the reported failure, reproduction command, relevant revision/CI run, constraints, allowed edits and acceptance checks. Unknowns stay unknown. Select relevant logs and source anchors; load only the current stage's skill instructions. Write project-specific state to `.context-kit/checkpoint.json`, not global instructions.

## Stage contracts

1. **Diagnose.** Input: failure evidence, minimal repro and relevant fixture/product sources. Compare isolated and parallel runs where relevant. Output: source-linked product-vs-test diagnosis, counterevidence and open questions. Do not patch before a supported hypothesis exists. If evidence is insufficient, collect the next targeted source instead of guessing.
2. **Repair.** Input: accepted hypothesis and constraints. Add a regression that reproduces the defect, make the smallest correct source/test/config change, inspect the diff. Output: patch, affected files and regression rationale. A test defect does not authorize unrelated product changes.
3. **Verify locally.** Input: patch and explicit checks. Execute authorized targeted, parallel-repeat and related-suite checks. Record command, actual status, artifact path and tested revision in project evidence. Passed, failed and not-run are different. A validated schema or hook-completion record is not proof that a check passed.
4. **Verify in CI.** Input: reviewed patch, local evidence and push authorization. Reuse existing authorization when it covers the action. If missing, prepare the concrete diff/evidence first and ask before pushing. Record the pushed commit, CI run URL/ID and actual job/test results. Check that CI tested the same revision; a green run for another commit does not satisfy acceptance. If CI is inaccessible or pending, say so and checkpoint remaining work. Local success never establishes CI success.
5. **Handoff.** Output: diagnosis, changed files, local and CI evidence for the exact revision, unresolved risks and a validated checkpoint. Claim completion only when required acceptance checks have evidence. Do not upload histories, secrets or telemetry as an incidental task step.

## Optional model-routed workers

Use `context-ci-evidence` for bounded read-only CI/log extraction and `context-fixture-review` for read-only fixture/product hypothesis critique, when installed and available. Assign exact files, questions and permitted actions. Do not copy the full parent conversation. Coordinator owns edits, source reconciliation, tests and acceptance. Escalate ambiguity, conflicting evidence, scope overflow or weak results to a more capable model or the parent.

Each worker returns only task_id, summary, source_anchors, findings, checks [{command,status}], open_questions. Validate with `node .context-kit/run.mjs handoff report.json` before integrating. Keep full artifacts outside the report; the 12,000-byte bound is not a token measurement. Structure validation does not establish factual truth. Delegation is optional; include worker requests and overhead when comparing accepted-task cost.

## Continuity

When compaction/resume is expected, preserve goal, constraints, source_anchors, open_work and acceptance_checks; validate with `node .context-kit/run.mjs checkpoint FILE`. Native auto-compaction is already provided by the harness. Selected hooks add preparation/restoration; they do not create accurate checkpoints automatically or guarantee retained constraints. Reopen source facts when needed after a boundary.

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

- [workflow-gates.md](references/workflow-gates.md): stage inputs/outputs, coordinator decisions and resume behavior.
- [diagnosis.md](references/diagnosis.md): product-versus-test hypothesis and counterevidence.
- [fixture-isolation.md](references/fixture-isolation.md): parallel resource ownership.
- [regression.md](references/regression.md): deterministic regression and scoped repair.
- [evidence.md](references/evidence.md): local/CI identity and acceptance reconciliation.

Before broad rollout, use [evaluation.md](references/evaluation.md) to test representative tasks, model suitability, actual native integration and accepted-task results. [provenance.md](references/provenance.md) records the published authoring patterns used; this package is original and carries no vendor certification.
