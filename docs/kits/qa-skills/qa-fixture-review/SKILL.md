---
name: qa-fixture-review
description: Use when parallel or order-dependent tests suggest shared mutable fixtures, cleanup collisions or cross-test data leakage.
---

# Fixture isolation review

## Input contract

Failing test/revision, fixture setup/teardown sources, worker topology and isolated-versus-parallel evidence.

## Review

1. Map resource ownership: who creates each user/cart/session, who mutates it and who cleans it up?
2. Identify shared IDs, static/global state, worker-scoped resources and cleanup that can affect another test.
3. Compare the fixture contract with product behavior before deciding which layer is defective.
4. Propose a deterministic competing-operation regression. A sleep or retry increase alone is not an evidence-based isolation fix.
5. Recommend the narrowest ownership change, including teardown safety and remaining risks.

## Output

Source-linked ownership table, candidate race/interference, counterevidence, proposed regression and unresolved questions. For delegated delivery use the installed six-field handoff contract and its byte bound. Report checks as passed, failed or not-run with actual evidence references in findings/source anchors.

## Limits

Review is read-only unless the task explicitly authorizes edits. Do not infer tenant/security correctness from fixture isolation alone. Do not claim the test is universally flake-free.

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

- [fixture-isolation.md](references/fixture-isolation.md): ownership ledger and discriminating parallel checks.
- [diagnosis.md](references/diagnosis.md): counterevidence before choosing a repair layer.

Before broad rollout, use [evaluation.md](references/evaluation.md) to test representative tasks, model suitability, actual native integration and accepted-task results. [provenance.md](references/provenance.md) records the published authoring patterns used; this package is original and carries no vendor certification.
