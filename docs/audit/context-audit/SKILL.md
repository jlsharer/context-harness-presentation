---
name: context-audit
description: Use when a user asks about inefficient Claude Code sessions, growing context, repeated reminders, verbose tool results, model-routing opportunities, or installing context-management improvements from session evidence.
---

# Context audit

Turn local session evidence into selectable, concrete harness changes. Default to a report generated on disk from selected Claude history. The local analyzer makes no network or model calls. Claude interpreting any shared information still uses its normal model connection. The browser demonstration is synthetic.

## Entry points

- `/context-audit`: inspect usage and recommend improvements.
- `/context-audit install`: prepare or apply the user's selected packages.
- `/context-audit workflow`: run the QA workflow in [workflow.md](references/workflow.md).
- `/context-audit evaluate`: compare representative tasks using [measurement.md](references/measurement.md).

Resolve scripts relative to this SKILL.md directory. Invoke them through `node`, using quoted absolute paths when necessary. Node18+ required. Read only the references needed for the current mode.

## Audit → choose → preview → apply → evaluate

1. **Establish scope locally.** Read [privacy.md](references/privacy.md) and [telemetry.md](references/telemetry.md). Use the user-selected Claude directory and transcript paths. Offer terminal commands for private execution outside Claude. `node scripts/cli.mjs discover --claude-home DIR --limit 20` writes a local path/size inventory; it does not print inventory contents. The user can inspect that file locally to choose paths. Use repeated `--transcript FILE` and optionally an existing `--events JSONL`; `--discover` opts into the bounded recent set. Without inputs, analysis inspects config metadata only. Do not Read/cat raw history, full reports, inventories or secret-bearing previews into conversation.
2. **Generate the private report.** Run `node scripts/cli.mjs analyze --claude-home DIR --transcript FILE`. With no `--out`, the file goes under `DIR/context-audit-data/reports/`. Return its local path and explain how to read it; stop there by default. It contains selected request/peak/accrued input, known cost subtotals, unknowns, candidate findings and local file/line provenance. A long session or costly model is a review signal, not proof of waste. For optional Claude assistance, the user first runs `node scripts/cli.mjs summary --report REPORT.json`, reviews that reduced file locally and chooses to share it. Only after that choice may you read the reduced file or run `summary --report REPORT.json --print`. Existing authorization to share a particular reduced summary persists; do not repeatedly ask. Use its numeric aggregates and candidate package IDs, with catalog explanations. It omits per-request provenance and arbitrary strings, so do not invent evidence details or missing metrics. Native `/insights` is complementary, not this offline report.
3. **Let the user choose.** After the user chooses to share a reduced summary, read [selection.md](references/selection.md) and `catalog.json`. Use Claude's `AskUserQuestion` when available: explain that summary's candidate signals before offering package choices, allow multiple selections, defer/skip and custom preferences. If unavailable, ask one concise text question with the same choices. Separate optional model routing from lower-effort fixes. Report only observed costs; hypothetical savings need stated assumptions. Package selection does not authorize unrelated settings or permissions changes.
4. **Make the chosen changes reviewable.** `node scripts/cli.mjs install --claude-home DIR --selected continuity,evidence` writes a private preview under `DIR/context-audit-data/previews/` without changing Claude settings. The preview includes existing settings and may contain credentials; the user reviews it locally. Explain the selected package's standard additions from the catalog/native integration reference, not by loading the entire preview into Claude. The bootstrap-only form omits `--selected`. Project facts/checkpoints stay in that project's `.context-audit/`, not global instructions. Read [native-integration.md](references/native-integration.md) for event capabilities, coexistence and platform limits.
5. **Apply the reviewed selection.** If the user has authorized those concrete changes, run `node scripts/cli.mjs apply --plan PREVIEW.json`. Existing permissions, unrelated hooks and custom files remain. The apply manifest records changes for rollback. If a collision or changed file is reported, have the user review it locally; avoid importing secret-bearing settings or previews into conversation. Resolve within the user's scope; do not overwrite blindly. Never enable automatic approval, disable native compaction, or add a telemetry destination as an incidental optimization.
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

## Local data boundary

The bootstrap enables no hooks or telemetry exporter. Existing enterprise telemetry, endpoints, headers and permissions are preserved. Selected `results` stores raw successful output locally; `continuity` can inject a project checkpoint into Claude. These are separate opt-in optimization dataflows, not a promise that all Claude activity is local. Read [privacy.md](references/privacy.md) for storage caps, permissions, retention and limitations.
