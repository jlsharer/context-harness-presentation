# Task, evidence report and bounded handoff contracts

Run helpers from the repository root (`node .context-kit/qa.mjs ...`) or through the installed skill's quoted absolute `scripts/qa.mjs` path. The latter and its supporting `core.mjs` allow a skill folder to remain usable independently of the project helper location.

## User-reviewed task packet

Copy [assets/task.json](../assets/task.json) and configure the actual task ID, goal, revision, allowed paths, required checks and repository commands. The draft revision marker is deliberately rejected until replaced. Required checks belong in this packet before assessment; a report cannot relax them by omission.

| Field                          | Meaning                                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| `task_id`, `goal`, `revision`  | Stable task identity, requested outcome and actual target code identity                         |
| `classification_required`      | Whether a supported non-unresolved diagnosis is an acceptance requirement                       |
| `required_checks`              | Unique `{id, kind}` entries; `kind` is `local` or `ci`                                          |
| `constraints`, `allowed_paths` | User/repository constraints and approved edit scope                                             |
| `commands`                     | Repository-specific command strings or null when not configured; the helper never executes them |
| `external_actions`             | Push/deploy authorization metadata; never a permission grant                                    |

```sh
node .context-kit/qa.mjs validate-task task.json
```

## Full QA evidence report

Copy [assets/report.json](../assets/report.json). Keep the full report within 128 KiB; large logs and test reports stay in approved linked artifacts. Unknown top-level/nested fields and duplicate identifiers are rejected.

- `diagnosis` contains classification, summary and supporting/counterevidence IDs. Classification is product-defect, test-defect, environment-issue or unresolved. Referenced evidence IDs must exist; resolved diagnoses need support.
- `evidence` contains unique `{id, anchor, note}` entries. Anchors identify actual source lines, local artifacts or approved remote records. Exclude secrets and raw private histories.
- `checks` contains `{id, kind, revision, status, command, artifact, run_id, url}`. Status is passed, failed, pending, inaccessible or not-run. Passed checks require artifacts; passed CI checks also need run identity and a credential-free HTTPS URL. Use null for unavailable optional references, not invented values.
- `risks` records limitations; `open_work` records unfinished acceptance work. Do not remove a genuine open requirement merely to satisfy an automated gate.

```sh
node .context-kit/qa.mjs validate-report report.json
node .context-kit/qa.mjs assess report.json --task task.json
```

Assessment exit codes: 0 = declared coverage gate passed; 2 = valid input but incomplete/mismatched evidence; 1 = invalid input or invocation. This is not factual validation, artifact authenticity, CI execution, authorization or release approval. Reopen relevant primary results before accepting claims.

## Worker return

```sh
node .context-kit/qa.mjs handoff report.json --task task.json
```

The generated return uses exactly `task_id`, `summary`, `source_anchors`, `findings`, `checks [{command,status}]`, `open_questions`, within the existing 12,000-byte serialized limit. It links the full report rather than embedding it. Incomplete statuses use not-run in the narrower worker vocabulary. Wrong-revision results cannot be advertised as passed for the target. Preserve the full report's more specific state and assessment reasons.

## Honest incomplete example

A report with local passed and CI pending is structurally valid but cannot pass a task that requires CI. A green CI job for another revision is also incomplete. Neither condition authorizes new remote activity; the coordinator uses existing approval or requests only the missing action after preparing the concrete work.
