# Reconcile evidence without overstating acceptance

The full QA report is an operational artifact. The bounded handoff is a summary with links. Neither is a substitute for reading the actual test/CI results.

## Evidence matrix

For every required check preserve its ID, kind (local/CI), exact tested revision, command or job, status and artifact. A passed CI check also needs a run ID and HTTPS result URL. Record retries/attempts rather than dropping failed attempts from the narrative. Do not include credentials, authorization headers or private session histories.

| Status       | Meaning                                                             | Completion consequence                              |
| ------------ | ------------------------------------------------------------------- | --------------------------------------------------- |
| passed       | An actual result supports this check for its recorded code identity | Eligible for declared coverage; verify the artifact |
| failed       | Actual execution found a failing check                              | Required acceptance remains incomplete              |
| pending      | A run/job has not finished                                          | Wait or checkpoint; never relabel passed            |
| inaccessible | Result cannot be inspected with current approved access             | Report the gap and next authorized retrieval path   |
| not-run      | Execution did not occur or is outside authorized/available scope    | Required acceptance remains incomplete              |

## Identity and coverage gates

Bind the report to a user-reviewed task packet with explicit required checks. The helper rejects malformed/duplicate IDs and missing passed-result artifacts; it flags missing checks, wrong revisions, unresolved required diagnosis and declared open acceptance work. A green result for another SHA cannot satisfy the target check. A report cannot declare completion simply by omitting a required check from itself.

`external_actions` in the task packet records authorization metadata only. The helper does not inspect native permissions, grant approval or execute commands. A structurally valid report can still contain false claims or stale links. The coordinator independently verifies supporting source/results and organizational acceptance requirements.

## Full report and bounded return

```sh
node .context-kit/qa.mjs assess report.json --task task.json
node .context-kit/qa.mjs handoff report.json --task task.json
```

Assessment prints coverage status and reasons; exit 2 means incomplete declared evidence. The handoff uses the existing six-field worker contract and a 12,000-byte serialized bound. Pending/inaccessible checks become not-run in that reduced status vocabulary; the full report preserves their actual state. Reports from another revision must remain visibly unverified for the target.

## Handoff wording

Use a result such as: “Local targeted and parallel checks passed on the recorded patch. CI run X for target revision Y is pending; remote acceptance remains unverified.” If CI passes for Z instead, state the mismatch and retrieve the correct run. For release work, distinguish evidence readiness from deployment/release approval.
