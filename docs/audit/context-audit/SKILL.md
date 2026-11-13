---
name: context-audit
description: Use when a user asks about inefficient Claude Code sessions, growing context, repeated reminders, verbose tool results, model-routing opportunities, or installing context-management improvements from session evidence.
---

# Context audit

Turn local session evidence into selectable, concrete harness changes. Run the bundled metadata analyzer before drawing conclusions; load only its compact findings into conversation. The browser demonstration is synthetic. This skill analyzes actual selected local files; it makes no model API calls itself.

## Entry points

- `/context-audit`: inspect usage and recommend improvements.
- `/context-audit install`: prepare or apply the user's selected packages.
- `/context-audit workflow`: run the QA workflow in [workflow.md](references/workflow.md).
- `/context-audit evaluate`: compare representative tasks using [measurement.md](references/measurement.md).

Resolve scripts relative to this SKILL.md directory. Invoke them through `node`, using quoted absolute paths when necessary. Node18+ required. Read only the references needed for the current mode.

## Audit → choose → preview → apply → evaluate

1. **Establish scope and coverage.** Read [telemetry.md](references/telemetry.md). Confirm the Claude user directory and desired project/date range from the request or environment. `node scripts/cli.mjs discover --claude-home DIR --limit 20` lists recent transcript paths and sizes without reading content. Analyze explicit selected paths with repeated `--transcript FILE`, plus an existing `--events JSONL` if available. `--discover` is an explicit opt-in to analyze the bounded recent set. Without file inputs, analysis inspects config metadata only. Keep raw histories out of model context and shared artifacts.
2. **Produce a readable evidence report.** Run `node scripts/cli.mjs analyze --claude-home DIR --transcript FILE --out REPORT.json`. Present: coverage and unknowns; observed request/peak/accrued input and cost; three highest-value findings; evidence file/line references; recommended package, effort, confidence, tradeoff and evaluation. Include known subtotals beside unknown totals. A long session or expensive model is a candidate signal, not proof of waste. Native `/insights` is complementary.
3. **Let the user choose.** Read [selection.md](references/selection.md) and `catalog.json`. Use Claude's `AskUserQuestion` when available: show findings before offering concrete package choices, allow multiple selections, defer/skip and custom preferences. If unavailable, ask one concise text question with the same choices. Separate optional model routing from lower-effort fixes. Report only observed costs; hypothetical savings need stated assumptions. Package selection does not authorize unrelated settings or permissions changes.
4. **Make the chosen changes reviewable.** `node scripts/cli.mjs install --claude-home DIR --selected continuity,evidence --out PREVIEW.json` creates a plan without modifying Claude. Explain files and exact settings additions from that plan. The bootstrap-only form omits `--selected`. Project facts/checkpoints stay in that project's `.context-audit/`, not global instructions. Read [native-integration.md](references/native-integration.md) for event capabilities, coexistence and platform limits.
5. **Apply the reviewed selection.** If the user has authorized those concrete changes, run `node scripts/cli.mjs apply --plan PREVIEW.json`. Existing permissions, unrelated hooks and custom files remain. The apply manifest records changes for rollback. If a collision or changed file is reported, inspect it and resolve within the user's scope; do not overwrite blindly. Never enable automatic approval, disable native compaction, or add a telemetry destination as an incidental optimization.
6. **Verify the installed behavior.** Offline schema/helper tests are not native-runtime verification. Check the actual `/skills`/`/hooks` discovery and selected events in the user's installed Claude version. Run a representative QA task. Label unexecuted checks `not-run`; preserve the manifest path. Read [measurement.md](references/measurement.md) to compare accepted-task cost, latency, repeated work and retained constraints. If metrics are missing, offer optional measurement setup rather than estimating missing usage as zero.

## Practical routing

| Observation | Candidate | Verify before adopting |
|---|---|---|
| Repeated large successful tool results | `results` | Excerpt remains sufficient; full evidence readable |
| Growth, resume or compaction | `continuity` | Goal, constraints and open checks survive |
| Missing execution evidence | `evidence` | Artifact links match executed commands/results |
| Repeated bounded work on one expensive model | `workflow` | Scoped workers meet QA checks; overhead included |
| Incomplete request/cost coverage | `measurement` | New selected records contain required fields |

Instructions and checkpoint presence do not establish compliance. Hook metadata records completion, not semantic truth. Schemas establish structure, not factual correctness. Use [workflow.md](references/workflow.md) for checkpoint/report contracts and escalation criteria; validate payloads with `node scripts/cli.mjs validate --kind report --file FILE`.
