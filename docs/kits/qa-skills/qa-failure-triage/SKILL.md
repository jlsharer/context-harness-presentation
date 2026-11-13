---
name: qa-failure-triage
description: Use when a QA failure needs a bounded reproduction and evidence-based product-versus-test classification.
---

# Failure triage

## Input contract

Failure signature, exact revision, test command, CI run/job identity, relevant logs and known constraints. Missing fields stay unknown.

## Procedure

1. Extract the failing assertion and the first causal diagnostic; distinguish it from downstream noise.
2. Reproduce with the smallest authorized test. Compare isolated/parallel, environment, timing and data ownership when relevant.
3. Inspect the relevant test fixture and product source. Record source anchors and competing explanations.
4. Classify product defect, test/fixture defect, environment issue or unresolved. Explain supporting and contradicting evidence. Do not treat a passing retry as proof of a fix.
5. Propose the next discriminating check, or hand a supported diagnosis to the repair stage.

## Output contract

Return task_id, summary, source_anchors, findings, checks [{command,status}], open_questions. Use not-run for commands not executed. Keep the complete report within 12000 UTF-8 bytes and validate with the installed handoff helper. Schema validation is not truth verification.

## Boundaries

Read only assigned sources when delegated. Do not edit, push or expand scope without authorization. Escalate missing evidence. Keep full logs in approved local artifacts; admit only relevant excerpts.

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

- [diagnosis.md](references/diagnosis.md): failure classification, bounded repro and escalation.
- [evidence.md](references/evidence.md): honest statuses and source-linked output.

Before broad rollout, use [evaluation.md](references/evaluation.md) to test representative tasks, model suitability, actual native integration and accepted-task results. [provenance.md](references/provenance.md) records the published authoring patterns used; this package is original and carries no vendor certification.
