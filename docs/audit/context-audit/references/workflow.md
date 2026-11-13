# QA workflow and context contracts

Use when `/context-audit workflow` is requested, or a selected optimization needs a concrete QA protocol. Keep repository facts in the active project's `.context-audit/`, following repository conventions and user scope.

## Ordered workflow

1. **Task packet:** current user goal; failure/reproduction evidence; applicable constraints; specific source paths; acceptance checks; allowed actions. Ask only for missing information that changes the work. Load relevant sources rather than entire repositories/log histories.
2. **Investigate:** collect source-linked observations and competing explanations. If the `workflow` package is installed and independent read-only collection would flood parent context, optionally delegate a bounded packet to `context-audit-evidence` (Haiku). The parent decides what it needs, limits sources and expected output, and keeps coordination responsibility. Small shared-context work can stay in the parent.
3. **Hypothesis and regression checks:** derive an explanation and proposed test from the evidence. Review constraints and coverage; optionally use `context-audit-review` (Sonnet) for a focused read-only critique. Handoff stages through the report schema below, not accumulated raw histories. Escalate ambiguous evidence, contradictory requirements, failed checks, or worker scope/output overflow to the parent; move to a more capable approved model only when justified.
4. **Verify and hand off:** execute checks within authorized scope. Record actual command, outcome and artifact; distinguish expected behavior from observed behavior. The parent validates facts and acceptance criteria, then integrates bounded results. Record remaining questions and project checkpoint. Do not install global policies as an incidental part of QA execution.

Before work delegation, provide task_id, goal, constraints, allowed source paths, output contract/budget and stop/escalation condition. After delegation, validate the schema and inspect cited evidence before using the result. Model routing is a hypothesis about suitable work allocation; count parent and every worker's requests, outputs and overhead when evaluating it. Nothing in this package changes native permission modes or forces all work into subagents.

## Report contract

Exactly these fields, at most12,000 serialized characters:

```json
{
  "task_id": "retry-investigation",
  "summary": "Observed condition and proposed next step",
  "source_anchors": ["tests/retry.test.ts:42"],
  "findings": ["Source-linked observation, not an unsupported assertion"],
  "checks": [{ "command": "npm test -- retry", "status": "not-run", "artifact": null }],
  "open_questions": ["What outcome would disprove the hypothesis?"]
}
```

Statuses: passed, failed, not-run. Passed/failed require an artifact path or stable evidence reference. The validator checks structure and evidence-reference presence, not truth or command execution. Run `node scripts/cli.mjs validate --kind report --file REPORT.json`.

## Checkpoint contract

Exactly these fields:

```json
{
  "goal": "Investigate retry failure without API changes",
  "constraints": ["Preserve tenant isolation"],
  "source_anchors": ["contracts/storage.md:18"],
  "decisions": ["Decision and evidence supporting it"],
  "open_work": ["Run the proposed regression check"],
  "checks": [{ "command": "npm test -- retry", "status": "not-run", "artifact": null }]
}
```

Validate with `--kind checkpoint`, then write to active project `.context-audit/checkpoint.json`. Creation is agent work, not something a hook can infer. Current user intent takes precedence over stored checkpoints. Before compaction, preserve these elements; on resume/after compaction, the selected SessionStart hook supplies a bounded validated checkpoint if present. Check applicable native instruction loading separately.
