# Portable Harness Benchmark Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Preserve the owner's chosen execution method and use GPT-6.1 Sol for any development/review subagents.

**Goal:** Produce a portable benchmark core with an OpenCode adapter, reproducible A–E comparisons, per-request evidence and a presentation report that states where results generalize and where they do not.

**Architecture:** A dependency-free measurement/evaluation core consumes versioned canonical events through an adapter contract. OpenCode supplies the first native collector and execution adapter; a canonical importer supports other harnesses without importing OpenCode code. Common fixtures and external evaluation feed a static comparison report, stratified by harness and configuration.

**Tech Stack:** Existing strict TypeScript, Node 24, generated JavaScript, node:test; existing vanilla JavaScript/CSS presentation and Playwright checks. Initial execution target is WSL/Linux; do not claim Windows-native runtime support.

**Spec:** [Approved design](../specs/2026-11-05-reusable-harness-benchmark-design.md), including the owner's portability condition.

## Global Constraints

- Development/review subagents use GPT-6.1 Sol. Experimental worker models are separate configuration.
- Keep portable modules free of native OpenCode imports and test their published package closure in an empty directory.
- Task prompts, fixtures, external evaluators and metric definitions are shared across harnesses; differing tools/policies/coverage are disclosed.
- Unknown data remains unknown even when another adapter exposes it.
- Preserve exactly four OpenCode role names: researcher, planner, implementer, validator. Portable events allow other role names.
- No paid trial starts from an unspecified budget. Deployment and live launch use a concrete release/launch manifest.
- All five arms are required for the intended benchmark delivery; intermediate tranches are not overall completion.
- Existing protocol admission, fresh-task identity, cancellation uncertainty, independent acceptance, source generation and packaging rules remain intact.
- Cross-harness empirical claims require matched real runs beyond OpenCode. Synthetic adapter conformance proves portability only.

## Review Focus

1. One native usage snapshot arriving twice or after reconnect must not double cost; task 2 tests duplicate/conflicting observations.
2. A cancelled parent with an active child must remain termination-unconfirmed; task 7 tests descendant reconciliation.
3. An apparently matched pair with different tools or incomplete child coverage must carry comparability warnings; task 3 tests each mismatch.
4. An adapter with clocks from multiple processes must not create a fabricated critical path; task 2 tests unrelated monotonic clocks.
5. A public report containing malicious task text or an unapproved artifact path must neither execute markup nor expose private files; tasks 8 and 10 test this boundary.

## Repository and file map

Harness repository `H=/home/joshl/projects/opencode-harness`; presentation repository `P=/home/joshl/projects/context_harness_presentation`. Paths below are relative to H unless prefixed P. Read H/AGENTS.md before execution; use an isolated worktree at execution time and preserve unrelated changes. Do not install into the current global release as a side effect of tests.

- `.opencode/src/benchmark/`: portable contracts, ledger, accounting, comparison, artifacts, evaluation, runner, report and adapter interface. No imports from `plugin-modules` or native clients.
- `.opencode/src/benchmark/adapters/canonical-import.ts`: read-only importer; not an execution adapter.
- `.opencode/src/plugin-modules/global-benchmark-collector.ts`: OpenCode native observation and normalization.
- `.opencode/src/plugin-modules/global-benchmark-adapter.ts`: OpenCode launch, capability and result lifecycle.
- `.opencode/src/plugin-modules/global-benchmark-policy.ts`: benchmark-owned session treatment; default behavior unchanged.
- `.opencode/src/benchmark/*.test.ts` and adapters tests: offline unit/conformance tests.
- `.opencode/evaluation/portable/`: versioned task bundles, schemas, sanitized synthetic traces and experiment example.
- `.opencode/benchmark/`: generated portable JavaScript, registered in the existing generated-artifact inventory.
- `bin/harness-benchmark.ts` → generated `bin/harness-benchmark.mjs`: independent CLI, not a mandatory OpenCode installation path.
- Existing `.opencode/scripts/generated-typescript-artifacts.mts`, package scripts/files, global/runtime/source inventories and relevant validators: publish and verify the new closure without adding unrelated files.
- P/`docs/benchmark.html`, `benchmark.js`, `benchmark.css`: linked static report; preserve existing slide count and event/lifecycle modals.
- P/`tests/benchmark.cjs`: browser coverage; existing `tests/presentation.cjs` remains regression coverage.

Dependency order: 1 → 2 → 3; 1 → 4 → 5; 1/2 → 6 → 7; 3/4/5/7 → 8 → 9 → 10 → 11. Each task includes focused tests and a scoped commit; no broad unrelated refactor.

## Task 1: Portable contracts and adapter boundary

**Files:** Create `.opencode/src/benchmark/contracts.ts`, `adapter.ts`, `contracts.test.ts`, `adapters/canonical-import.ts`, `adapters/canonical-import.test.ts`; create `.opencode/evaluation/portable/schemas/{manifest,event,coverage,public-report}.schema.json`; update generated inventory/build/package closure as these files become executable.

**Interfaces:** Export `parseManifest(value: unknown): ExperimentManifest`, `parseEvent(value: unknown): BenchmarkEvent`, `parseCoverage(value: unknown): CoverageReport`. Schema version is 1. Export `BenchmarkAdapter` with `identity`, `preflight(manifest): Promise<CoverageReport>`, `start(run, emit): Promise<RunHandle>`, `wait(handle): Promise<RunTermination>`, `cancel(handle): Promise<CancellationResult>`, `reconcile(handle): Promise<Reconciliation>`. These named types live in contracts.ts. `importCanonicalBundle(directory: string): Promise<ImportedRun>` consumes the same contracts without providing start/cancel.

Manifest defines task/starter/evaluator hashes, seed, harness+adapter versions, arm A–E, model IDs/settings, instructions and tool/permission hashes, cache/accounting policies, explicit limits and repetitions. Events are a discriminated union of inference attempt start/end, tool start/end, delegation start/end, workflow start/end, intervention, context change and coverage diagnostic. Require source identity and occurrence/observation timestamps; native session and orchestration IDs are optional source references, not portable requirements. Operation kinds: primary, compaction, title, generate, evaluator. Token fields are integer-or-null with an explicit usage basis and source; cache and reasoning inclusion flags prevent guessing semantics.

- [ ] Write validation tests: reject unknown version, invalid/negative counts, nonfinite USD, absent run identity, inconsistent lineage and unbounded live launch. Accept arbitrary nonempty worker role `reviewer`, null native IDs and unavailable cache usage.
- [ ] Run `node --test .opencode/src/benchmark/contracts.test.ts .opencode/src/benchmark/adapters/canonical-import.test.ts`; confirm missing contracts fail before implementation.
- [ ] Implement validators/types/importer and generated portable closure. The importer validates existing evidence and cannot invoke providers or import authority from protocol traces.
- [ ] Repeat tests plus typecheck/generated checks. Add a static dependency assertion: portable core imports only Node built-ins and other portable modules; adapters contract uses no OpenCode types.
- [ ] Commit the portable boundary and its tests.

## Task 2: Durable ledger, normalization and exact accounting

**Files:** Create `.opencode/src/benchmark/{ledger,usage,pricing,timing}.ts` and corresponding `.test.ts` files.

**Interfaces:** `reconcileEvents(events: readonly BenchmarkEvent[]): ReconciledRun`; `priceUsage(run: ReconciledRun, rates: PricingSnapshot): CostSummary`; `summarizeTiming(run: ReconciledRun): TimingSummary`. Export result types from contracts.ts. Preserve separate logical generations, physical attempts, completed responses, tools and worker runs. PricingSnapshot contains effective date/source URL, exact provider/model/service tier, prompt thresholds, input/cache-write/cache-read/output semantics and applicable extra charges.

- [ ] Write fixtures proving replayed equal events count once, contradictory same-ID payloads produce coverage errors, partial observations stay unknown, retries count as attempts, and a cumulative usage snapshot is not added to its earlier snapshot.
- [ ] Pin arithmetic: uncached 2.31M × $2 + write 0.04M × $2.50 + read 0.20M × $0.10 + output 0.012M × $10 = $4.86; reject incompatible token-category inclusion. Test threshold boundary equality, reasoning already included in output, failed billable attempts and subscription-reported zero. Fixed decimal/rational arithmetic rounds only for display.
- [ ] Run `node --test .opencode/src/benchmark/{ledger,usage,pricing,timing}.test.ts` and confirm relevant failures.
- [ ] Implement normalization, price provenance and timing. Unknown-rate or missing-usage totals stay partial/null; distinguish native reported cost from invoice-verified charges and API-equivalent estimates. Monotonic deltas require the same clock domain; cross-process ordering uses documented bounds or stays unknown. Costs do not sum nested parent/child totals twice.
- [ ] Repeat tests, then commit. Verify overlap is computed from actual comparable intervals, not summed durations or dispatched task count.

## Task 3: Harness-aware comparisons and adapter conformance

**Files:** Create `.opencode/src/benchmark/{compare,conformance}.ts`, corresponding tests, and `.opencode/evaluation/portable/traces/` fixtures.

**Interfaces:** `compareRuns(runs: readonly EvaluatedRun[]): ComparisonReport`; `checkComparability(a: RunManifest, b: RunManifest, coverageA: CoverageReport, coverageB: CoverageReport): Comparability`; `checkAdapterEvidence(bundle: ImportedRun): ConformanceResult`. EvaluatedRun combines ReconciledRun, evaluation and manifest, defined in contracts.ts.

- [ ] Build two synthetic source representations of the same work: streamed incremental events and terminal cumulative records. The canonical importer yields identical call counts, $4.86 cost and timing where supported. Include a worker role outside the OpenCode four-role set.
- [ ] Test mismatched task/evaluator/model/tool/permission/budget/cache fingerprints, unknown child coverage, unsupported arms and different clock coverage. A/B policy differences are expected experimental treatment; unexpected differences get explicit warnings. Cross-harness reports group by harness before comparison.
- [ ] Run `node --test .opencode/src/benchmark/{compare,conformance}.test.ts`; confirm failures, then implement comparison and conformance.
- [ ] Assert cost-per-accept includes failures: costs $1 accepted + $2 failed gives $3 per accepted result; zero accepted returns null. Small pilots show run-level values, median/range, paired differences and missing counts, not fabricated p95/confidence claims.
- [ ] Repeat tests and commit. Mark both synthetic adapters as test-only; they cannot unlock a measured multi-harness claim.

## Task 4: Portable task bundles and common external evaluator

**Files:** Create `.opencode/src/benchmark/{tasks,evaluate}.ts` and tests; `.opencode/evaluation/portable/tasks/{idempotency,component-feature,evidence-investigation}/` with manifest, starter files, public acceptance description and protected evaluator fixtures. Preserve existing paired-tasks.json and its 60-starter tests.

**Interfaces:** `materializeTask(task: TaskBundle, destination: string): Promise<PreparedTask>`; `evaluateArtifact(task: TaskBundle, artifact: FrozenArtifact, limits: EvaluationLimits): Promise<EvaluationResult>`. Type declarations in contracts.ts. Evaluators run against a frozen copy, in bounded child processes, without modifying the agent worktree.

- [ ] Write failing tests for duplicate and concurrent order requests; frozen API/client contract compatibility and integration; and source-grounded investigation answers against fixed expected evidence. Known-correct fixture outputs pass and starter/known-bad outputs fail for substantive assertions.
- [ ] Add tests that changed evaluator bytes, missing outputs, timeout, traversal or an attempt to overwrite protected checks cannot pass acceptance. Keep hidden test files outside agent-accessible materialized workspaces; verify actual tool/access restrictions before calling them hidden in live trials.
- [ ] Run `node --test .opencode/src/benchmark/{tasks,evaluate}.test.ts`; inspect expected failures, implement, repeat to pass.
- [ ] Record exact prompt/starter/evaluator/evidence hashes and portable command argv. Evidence-investigation evaluation reports structured rubric dimensions; do not collapse ambiguous answers into an unjustified scalar.
- [ ] Commit bundles/evaluator and document what quality dimensions these fixtures do and do not measure.

## Task 5: Runner, experiment policies and isolated artifacts

**Files:** Create `.opencode/src/benchmark/{runner,artifacts,limits}.ts` and tests; `.opencode/evaluation/portable/experiment.example.json`; `bin/harness-benchmark.ts`; add CLI tests and package/build registration.

**Interfaces:** `prepareExperiment(manifest: ExperimentManifest, root: string): Promise<PreparedExperiment>`; `runExperiment(prepared: PreparedExperiment, adapter: BenchmarkAdapter): Promise<ExperimentResult>`; `openRunStore(root: string, run: RunManifest): Promise<RunStore>`. RunStore provides append/flush/finalize with private file ownership and no-follow checks. CLI subcommands: prepare, preflight, run, evaluate, report, export; run requires a validated concrete launch manifest.

- [ ] Fake-adapter tests: seeded block order reproducible; 3 tasks × 5 arms × 3 repeats yields 45 distinct fresh runs; trial arms never overlap; worker concurrency is a per-run adapter responsibility. Unsupported configurations emit records, not fake executions.
- [ ] Test workspace/memory/artifact isolation, stale start hashes, write failures, truncated final JSONL record, restart marking interrupted without redispatch, and symlink/refused existing destinations. Preserve failed attempts and explicit replacement IDs.
- [ ] Test request/time/token limits across descendants, estimated-cost reservations, and unknown pricing disabling a hard-dollar-cap claim. No deadline may return while silently labelling live descendants terminated.
- [ ] Run `node --test .opencode/src/benchmark/{runner,artifacts,limits}.test.ts`; implement runner/store/CLI after confirming failures; repeat to pass. Prepare/report must work without network or any OpenCode installation.
- [ ] Commit; CLI smoke help and offline fixture export must pass from the packaged closure in an empty directory.

## Task 6: OpenCode collection and baseline policy

**Files:** Create `.opencode/src/plugin-modules/global-benchmark-{collector,policy,adapter}.ts` and tests; modify `global-native-plugin.ts`, `context-budget.ts`, global manifest and schema as required. Document native compatibility in `docs/benchmark-native-capabilities.md`.

**Interfaces:** `attachBenchmarkCollector(ctx: VerifiedNativeContext, options: CollectorOptions): Promise<CollectorHandle>` with dispose/flush/coverage; `resolveBenchmarkPolicy(sessionId: string, bindings: BenchmarkBindings): BenchmarkPolicy | null`; `createOpenCodeBenchmarkAdapter(options: OpenCodeAdapterOptions): BenchmarkAdapter`. Native types remain here, never in the portable contract.

- [ ] Inspect the selected executable/source and pin observed hook contracts. Write compatibility tests that distinguish documented-but-absent hooks, HTTP/WS, primary/compaction/title/generate operations, response usage, retries and child metadata. Do not invent API callbacks to make a fixture pass.
- [ ] Establish failing tests for packet-preserving observation: chunks reach the consumer unchanged; credentials/raw prompts/reasoning cannot enter canonical events; missing callbacks degrade coverage. Reconciliation uses native request IDs or defensible observed boundaries, not timestamps alone.
- [ ] Write policy tests: A removes delegation availability and injected orchestration guidance, including after compaction, only for bound benchmark sessions. Ordinary sessions retain current behavior. B–E preserve current managed checks. Loaded skills/tool catalog and observed route must match the manifest; drift invalidates comparability.
- [ ] Run `node --test .opencode/src/plugin-modules/global-benchmark-*.test.ts`; implement the verified native adapter and instrumentation, then rerun plus existing global and context-budget tests.
- [ ] Commit and record which coverage is proven offline, which requires native smoke evidence and what is unavailable. If critical request usage cannot be observed, stop that native integration with an exact gap; portable core remains testable, but overall benchmark is incomplete.

## Task 7: Verified concurrency and cancellation

**Files:** Extend global-benchmark-adapter.ts and its tests; modify global-native-plugin.ts/global-protocol.ts only where proven necessary; add `.opencode/scripts/benchmark-native-concurrency.test.mts` and documented smoke fixtures.

**Interfaces:** Adapter start/wait/cancel/reconcile retain task 1 signatures. RunTermination includes terminal state, known descendants and confirmed/unconfirmed termination. OpenCode maps portable roles/modes into its existing admission contracts; no fifth managed role.

- [ ] Characterize concurrent foreground dispatch using the pinned native implementation. Prove independent calls can overlap, preserve identity and settle exactly once. If unavailable, identify a supported background completion/cancellation path before adding it; never reuse legacy transport assumptions without proof.
- [ ] Add tests for dependency serialization, maximum three live workers, disjoint implementation worktrees, merge conflicts, bounded remediation with fresh task IDs, parallel researchers and validators on frozen artifacts, late results and parent cancellation with an active child.
- [ ] Run focused tests to see them fail, implement the chosen verified transport, then rerun. Count integration and waiting as workflow time. Native smoke evidence must prove overlap rather than simultaneous dispatch alone.
- [ ] Verify existing protocol/global tests and prove C/E cannot silently execute sequentially under a parallel label. Missing native support remains an explicit unsupported state and an outstanding delivery requirement.
- [ ] Commit concurrent support with capability evidence; preserve current global failure/termination invariants.

## Task 8: Reproducible reports and safe export

**Files:** Create `.opencode/src/benchmark/{report,export}.ts`, tests and `docs/benchmark-adapter-contract.md`; extend CLI report/export.

**Interfaces:** `buildReport(runs: readonly EvaluatedRun[]): ComparisonReport`; `exportPublicReport(report: ComparisonReport, allowedArtifacts: readonly ApprovedArtifact[]): PublicReport`. JSON schemas and types from task 1 must remain synchronized. Add `importCanonicalBundle` walkthrough for a custom harness producer.

- [ ] Test complete/partial/unknown data, measured versus synthetic labels, harness-specific summaries, comparability warnings, missing native IDs, unsafe artifact references and text containing script tags. Reject unapproved private fields instead of blacklisting a few known secrets.
- [ ] Run `node --test .opencode/src/benchmark/{report,export}.test.ts`, confirm failures, implement, then repeat to pass.
- [ ] Rebuild the same report from frozen events twice and assert identical canonical data/hashes except separately supplied display metadata. Verify every public metric links to run/evidence IDs and uses the task 2 accounting implementation.
- [ ] Include a standalone synthetic imported example with clear non-empirical labeling and no OpenCode dependency. Document how a second harness supplies IDs, timing, usage basis and coverage without copying native OpenCode steps.
- [ ] Commit report/export and adapter documentation.

## Task 9: Release closure and full regression validation

**Files:** Update package.json, generated inventory, `.opencode/global.manifest.json`, applicable source/runtime/portable inventories and relevant validator/package tests; add `docs/benchmark-operator-guide.md`.

- [ ] Add package tests that run portable prepare/import/report in a fresh empty directory without OpenCode, global config or source checkout; reject accidental native imports and omitted generated files.
- [ ] Verify benchmark remains opt-in, a damaged collector cannot grant workflow acceptance, and installation dry-run identifies exact owned assets and rollback. No real installed release changes in these tests.
- [ ] Run focused package tests, `npm run build`, `npm run validate:global`, `npm run test:global`, both runtime test scripts, `npm test`, and `npm pack --dry-run --json`; inspect failures/skips and resolve change-related regressions. Update expected inventory sizes deliberately; never hard-code previous counts as current proof.
- [ ] Review complete changes independently using GPT-6.1 Sol. Resolve findings, rerun affected checks and prepare the exact release candidate with hash, rollback and runtime capability report.
- [ ] Commit verified release preparation and evidence; installation stays pending its concrete activation step.

## Task 10: Static presentation comparison view

**Files in P:** Create `docs/benchmark.html`, `docs/benchmark.js`, `docs/benchmark.css`, `tests/benchmark.cjs`; modify docs/index.html to link the report, add notes in docs/slides.js, and document import use in tests/README.md. Public result JSON goes under `docs/benchmark-data/` only after allowlisted export.

**Interfaces:** Browser consumes PublicReport v1 only. URL parameters select task, harness, arm and repeat. No browser-native pricing recalculation or inference from slide images.

- [ ] Add browser tests for no-measured-data state, paired arm selection, harness filtering, evidence-scope warning, parent/worker/tool lanes, worker expansion into calls, keyboard-accessible detail modal, Close/focus restoration and responsive layouts.
- [ ] Add malicious text/path fixtures; render untrusted strings with textContent and use approved relative evidence links. Unknown costs must display unavailable, never $0; unsupported arms remain visible.
- [ ] Run the new browser tests and observe expected failures; implement the linked static view using existing visual styles. Preserve 12-slide presentation order and all current modal navigation.
- [ ] Run new browser tests plus existing `tests/presentation.cjs`, inspect desktop/mobile screenshots and fix layout. Synthetic development fixtures remain explicitly labeled and never become measured public results.
- [ ] Commit the report view. Existing Pages publication authorization applies to sanitized presentation changes, not private raw trace uploads.

## Task 11: Native smoke, bounded pilot and evidence publication

**Files:** Versioned launch manifest and private run bundles under approved external state root; evidence summary in H/docs; sanitized report export into P/docs/benchmark-data/.

- [ ] Prepare concrete active-build/model/account/routing capability evidence and launch manifest with numeric limits, approved fixture hashes, cache policy, instrumentation overhead check and restart timing. Present only unresolved account/budget/activation choices to the owner; do not ask again for the already approved architecture.
- [ ] Activate the exact reviewed release when authorized; run the smallest instrumented native smoke set proving parent/worker requests, tools, retries/auxiliary coverage and actual concurrency. Compare native totals and ledger; close coverage gaps before the pilot.
- [ ] Execute seeded 45-run OpenCode pilot only within the approved suite bounds. Persist failures, rate-limit events, interruptions and unresolved descendants. Do not spend the remaining budget merely to fill a table if coverage is invalid.
- [ ] Evaluate frozen artifacts with the common evaluator; regenerate report; inspect arithmetic and evidence links. Report findings as OpenCode-configuration results with portable reproduction instructions.
- [ ] Import matched evidence from other real harnesses when available through the same contract. Until then, keep cross-harness replication explicitly unmeasured; do not infer empirical results from synthetic conformance. Additional live adapters and trials need their concrete implementation/launch scope.
- [ ] Publish the sanitized report and run browser tests at the live Pages URL. Deliver the report link, artifact/evidence index, exact tested configurations and remaining limitations. Code completion, measured OpenCode results and demonstrated cross-harness replication are three separate statuses.

## Plan self-review record

- Spec coverage: matrix and portability (1/3/8); fixtures/fairness (4/5); native coverage/baseline (6); parallelism (7); metrics (2/3); artifacts (5/8); release checks (9); presentation (10); activation and empirical scope (11).
- Interface consistency: all adapter implementations/importers use contracts.ts types; compare/report consume EvaluatedRun; PublicReport is the browser boundary. The canonical importer is explicitly not an executable adapter.
- Review Focus: all five conditions have assigned tests above. Native capability uncertainty is a verified gate, not a proposed API shape treated as fact.
- Scope: this is one dependent end-to-end project with independently testable tasks. Real collectors for additional named harnesses are not claimed shipped by an importer/conformance suite.
- Execution handoff pending owner choice; no implementation completed by writing this plan.
