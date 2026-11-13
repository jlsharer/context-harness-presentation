# Turn the diagnosis into a discriminating regression

## Define the acceptance invariant

State the supported behavior, triggering condition and observable violation. Link the source contract and failure evidence. Decide which layer owns the defect before choosing the test layer. A supported product defect may require product changes; an unsupported product theory does not expand a test-only authorization.

## Test design gate

The proposed regression should fail for the diagnosed reason before the fix and distinguish the corrected behavior afterward. Prefer controlled inputs, deterministic synchronization and resource ownership to arbitrary sleeps. Reuse the repository's test framework and fixtures. Do not weaken assertions, skip coverage or raise retries simply to obtain green output.

If the historical revision cannot be executed, report that limitation. A newly written passing test without a demonstrated failure is weaker evidence and must not be described as a verified regression. A flaky sample needs a bounded repetition strategy and explicit observed counts.

## Repair and inspect

1. Make the narrowest change that resolves the supported cause within allowed paths.
2. Inspect the diff for unrelated changes, weakened checks, cleanup hazards and compatibility effects.
3. Run the targeted regression and checks chosen for collateral risk. Use actual repository commands discovered during setup.
4. Keep the full report in the approved artifact store and admit a concise result into parent context. Failed diagnostic output remains intact when result bounding cannot safely apply.

## Revision-linked verification

Record the code identity actually tested. Distinguish an uncommitted worktree from its base HEAD. If a later commit changes the tested tree, rerun the relevant checks; if only packaging/commit metadata changes, retain evidence that the tested files match. Remote acceptance requires the CI run's tested revision and required job/test results, not just a green notification.

Use the shared task/report contracts to bind required checks before the report is assessed:

```sh
node .context-kit/qa.mjs validate-task task.json
node .context-kit/qa.mjs validate-report report.json
node .context-kit/qa.mjs assess report.json --task task.json
```

Exit 2 means declared evidence coverage is incomplete. It does not mean the program found the product defect or ran a test. Helpers never execute the command strings in reports.

## Stop and escalation

Stop speculative patching when the regression does not isolate the cause, authorized paths are insufficient, or new evidence contradicts the diagnosis. Report the conflict and next check. Do not hide unresolved failures in a completion summary or treat local success as CI acceptance.
