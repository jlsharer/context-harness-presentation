# Coordinator stage gates

Read only the reference for the current stage. The coordinator can revisit a stage when new evidence changes the hypothesis; this is not an irreversible linear script.

| Stage              | Required input                                                  | Concrete output                                                      | Hold or revisit when                                           |
| ------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| Scope              | User goal, permitted actions, relevant revision and constraints | Reviewed task packet, required-check IDs and selected source scope   | Acceptance or allowed edits are ambiguous                      |
| Diagnose           | Failure signature, bounded repro, fixture and product anchors   | Classification, supporting/counterevidence and falsifying regression | Evidence conflicts or no discriminating check exists           |
| Repair             | Supported hypothesis, allowed paths and regression design       | Minimal patch, diff review and regression evidence                   | Patch exceeds authorization or the regression misses the cause |
| Local verification | Actual patch identity and repository commands                   | Targeted/parallel/related command results and artifacts              | Required local checks fail, are unavailable or were not run    |
| CI verification    | Reviewed patch, applicable push authorization, target revision  | Actual run/job results for that revision                             | Run is pending, inaccessible, wrong-revision or failed         |
| Handoff            | Verified evidence matrix and explicit coverage limits           | Full report, bounded summary, checkpoint/open work                   | Required evidence or acceptance remains incomplete             |

## Worker coordination

Assign bounded read-only tasks that can be reviewed independently: CI failure extraction, fixture/product ownership critique or verification-report review. Give exact files/anchors and expected return fields. Do not give every worker the full parent history. Parent owns edits, tests, source reconciliation and acceptance. Model choice follows task difficulty and evidence quality; escalate uncertainty. Model availability and quality need native validation.

Validate report structure before admitting it. Reopen primary source anchors when claims conflict or affect acceptance. A successful helper validation is not a successful test. Include worker calls and repeated prefixes when evaluating cost; parallel work does not automatically reduce all-call input.

## Session boundaries

Before compaction or a deliberate handoff, preserve current goal, applicable constraints, source/revision anchors, decisions, required checks and unfinished work. The selected PreCompact hook supplies guidance; it does not generate a factual checkpoint itself. Validate the checkpoint and restore selected facts after the boundary. Native auto-compaction remains the base harness's responsibility and timing is version-dependent.

## External actions and recovery

Reuse existing authorization that covers the concrete action. If absent, prepare the diff/results before asking. Do not push, rerun paid infrastructure, deploy or alter permissions merely because a skill requests a stage. On interruption, leave a checkpoint with exact pending run/revision IDs. Resume by verifying that the goal, branch/worktree and CI state still match; stale checkpoints cannot override current user intent.
