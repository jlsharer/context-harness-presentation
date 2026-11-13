---
name: qa-evidence-report
description: Use when reconciling local and CI checks into an honest, revision-linked QA handoff or release-readiness report.
---

# Verification evidence report

## Input contract

Target revision, acceptance checks, local reports, CI run/job links and any required approval state.

## Reconcile

1. Create a table of check, command/job, revision, status, artifact/run link and limitations.
2. Read actual reports. Distinguish passed, failed, pending, inaccessible and not-run; schema/metadata completion is not an acceptance result.
3. Confirm that every claimed local and remote check applies to the target revision. A green older/different commit does not verify the patch.
4. Account for missing required jobs, failures, retries and infrastructure exceptions rather than omitting them.
5. Produce an accepted result only when all required criteria have evidence; otherwise checkpoint the remaining work explicitly.

## Output

Diagnosis or release scope, exact revision, changed files, evidence table, unresolved risks and next action. Do not claim a release was deployed or approved unless that action actually occurred within authorization.

## Privacy

Exclude credentials and private histories from reports. Use relevant reduced telemetry only within the approved data scope. Link approved local artifacts or enterprise CI records for detailed evidence. Follow the project's data-sharing rules.

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

- [evidence.md](references/evidence.md): status meanings, required checks and exact revision identity.
- [workflow-gates.md](references/workflow-gates.md): acceptance and external-action boundaries.

Before broad rollout, use [evaluation.md](references/evaluation.md) to test representative tasks, model suitability, actual native integration and accepted-task results. [provenance.md](references/provenance.md) records the published authoring patterns used; this package is original and carries no vendor certification.
