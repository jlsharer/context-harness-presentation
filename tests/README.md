Presentation browser checks

Requires Node.js and Playwright with Chromium available. From the repository root:

    node tests/presentation.cjs

Set TEST_BROWSER to a Chromium executable if using an existing installation. To test a deployment instead of the temporary local server, set PRESENTATION_URL to its full URL, including the trailing slash.

The check validates all seventeen native slide layouts at desktop size, horizontal fit on mobile, both measured datasets against every chart value, zero-baseline chart scaling, context and cache controls, all three event-modal tabs, Close/Escape/focus/Next navigation and slide-15 deep linking, and JavaScript/asset errors. Screenshots are saved to an OS temporary directory printed at completion.

Benchmark comparison checks

    node tests/benchmark.cjs

Uses the same Playwright/Chromium dependencies. Set BENCHMARK_URL for live validation. Tests no-data and synthetic states, unavailable approaches, matched pair selection, local import, missing cost, unsafe text rendering, detail Close/focus restoration and mobile layout. The demo is synthetic, uses the deck's 6-call/10-call token inputs, and supports no empirical claim.

The browser validator in docs/benchmark-schema.js is generated from the portable benchmark's public-schema.ts; refresh it with the corresponding harness build when the public contract changes. Local import stays in the browser. No private traces are published.


Refined presentation exports

    node tools/export-refined.cjs

Run the presentation browser check first to refresh the default-view slide PNGs. Export requires PptxGenJS as well as Playwright. The browser deck remains the interactive presentation; PDF and PowerPoint companions are static renders of the default slide views. PowerPoint retains speaker notes but its slide artwork is not individually editable. Expanded detail panels and alternate chart states remain in the browser deck. `deliverables/v5-speaker-notes.txt` is a plain-text notes companion.

Tools used for the recorded verification: Node 24.22.1, Playwright 1.65.0, PptxGenJS 4.0.1 and the installed Chromium (exact version in deliverables/render-environment.json). Use TEST_BROWSER to select an existing Chromium executable. The recorded environment installed render dependencies only in a temporary staging folder; no runtime installation is required to view the static site. For a new checkout, install Playwright and PptxGenJS in your chosen development tool environment and make their modules available with NODE_PATH.


Round 03 system-atlas checkpoint

From the project root, start the durable local preview:

    python3 -m http.server 8768 --bind 127.0.0.1 --directory docs

Open http://localhost:8768/atlas.html#system. The original index.html presentation remains available separately. All preview assets and source metadata load locally; opening cited websites requires connectivity. This is the three-view design checkpoint, followed by references, rather than the completed presentation.

    node tests/atlas-data.cjs
    node tests/atlas.cjs /path/to/chromium

The browser test uses the Playwright dependency described above; TEST_BROWSER also selects an existing Chromium executable. It checks full-canvas composition, individual node fit, unobstructed feedback-loop labels, readable mobile chart typography, documented instruction order versus candidate content layout, source selection and body-byte labels, output allowance outside input, URL persistence and Back/Forward, keyboard and modal focus, exact published chart values, reference completeness, local-only asset requests and desktop/mobile screenshots. Screenshots are saved in deliverables/round03. The data check verifies the source/research bundles, archived figure hash and every included fixture document against its original input record.

Research catalog, reviewed transcription, figure provenance and claim limits are in docs/research/round03. Build decisions and review status are in docs/superpowers/iterations/round03-build.md.


Round04 session-journey checkpoint

The current preview remains http://localhost:8768/atlas.html#system using the same local server command above. Round03 source is archived in deliverables/round03/source-snapshot.zip. The original presentation index and experiment records remain separate.

    node tests/atlas-session.cjs
    node tests/atlas-data.cjs
    node tests/atlas-research.cjs
    node tests/atlas.cjs /path/to/chromium

The new pure-model checks cover turn/call distinction, child isolation, compaction, retained external artifacts, candidate payloads and malformed state. Research checks cover exact provider/model/metric/cohort values, historical position data and hook capabilities. Browser checks exercise the evolving context, all14steps/eighthookpolicies, verbatim selectable excerpts, complete before/after requests, native instruction inspector, all3research panels and definitions. Screenshots now go to deliverables/round04.

The replay is deterministic teaching material built from frozen synthetic fixture sources plus explicitly authored state; it is not a captured experimental trajectory. Context byte counts are exact for those teaching text snapshots and are not model token counts. Current named-provider graph-task F1 and historical QA/NoLiMa accuracy remain different metrics and cohorts. Original websites need internet, while application assets, source metadata and checked data are local.


The targeted review regression can also be run with the preview server active:

    node tests/atlas-review.cjs /path/to/chromium

It verifies visible per-call change text and linear document-index coordinates. Those assertions are also included in the canonical atlas browser check. The session unit suite excludes each dispatch’s own future output.


Round05: explain the change

The current atlas now follows session replay → evidence/policy → hooks → assembly → recipes → references. Use the same localhost server command. Round04 source and its browser checks are preserved in deliverables/round04/source-snapshot.zip.

    node tests/atlas-session.cjs
    node tests/atlas-changes.cjs
    node tests/atlas-data.cjs
    node tests/atlas-research.cjs
    node tests/atlas-research05.cjs
    node tests/atlas-policy.cjs
    node tests/atlas.cjs /path/to/chromium

atlas.cjs forwards to the current atlas-round05.cjs. The earlier atlas-review.cjs alias does the same; running both is redundant. Current checks cover same-session text changes, scoped child initialization and S1 request input/output; all modern research controls and bar values; minimum main/citation typography14px; source-to-candidate anchor correspondence and task-last policy handoff; offline recipe downloads; viewport/state fit and local-only asset loading. Screenshots are in deliverables/round05.

Portable recipes have no SDK/API dependency. Run node docs/policies/example.mjs; the downloadable ZIP contains the same module/example/frozen fixture/README. Native OpenCodeV2 adapter code in the UI is illustrative and source-matched, not runtime-verified. Anchor presence is not semantic verification.

Active research uses the2026 provider cohort, CRE2026 task-position results, and paired signal-retention results. Older position/NoLiMa data remain archived/background materials. Current GraphWalks bars are aggregate results for the reported256K–1M band; no per-size model curve is manufactured. Context-tier versus exact token-count limits remain explicit.

Round06: ordered context in tokens

Current presentation: http://localhost:8768/atlas.html (docs/atlas.html).
atlas.cjs and atlas-review.cjs now forward to atlas-round06.cjs; run one alias.
The old round05 browser assertions are historical and are preserved with that checkpoint.

    node tests/atlas-tokens.cjs
    node tests/atlas-session.cjs
    node tests/atlas-changes.cjs
    node tests/atlas-data.cjs
    node tests/atlas-research.cjs
    node tests/atlas-research05.cjs
    node tests/atlas-policy.cjs
    node tests/atlas.cjs /path/to/chromium

Browser coverage: all 14 replay events fit Present mode at 1366×768; event and arrow controls remain unobstructed at 1366/1024/768 widths; scoped child/S1 views and exact text expansions; all provider-band values and position model/filler/tier combinations; checkpoint→replay handoff; source inclusion/order; code/workshop download; URL-restored controls; desktop/mobile layout and no nested main vertical scrolling; assets load offline. Screenshots: deliverables/round06.

Counts are exact o200k_base reference text tokens, not native/provider usage. Prefix differences allocate each layer including separators; independently tokenized bodies are not summed. Reproduction: docs/research/round06/README.txt. Current BFS chart compares broad input bands for the same selected model; separate subsets do not establish a precise onset, time curve, attention weights or coding success.

Round07: unified managed-versus-uncurated workflows

Current atlas aliases now run atlas-round07.cjs. Prior checkpoints and their assertions remain archived/historical. Add these pure checks to the retained token/session/source/research/policy suites:

    node tests/atlas-workload.cjs
    node tests/atlas-learning.cjs
    node tests/atlas.cjs /path/to/chromium

The new replay uses assigned scenario token budgets. It does not relabel them as exact reference/native tokens or empirical savings. Durable assumptions, measured service peak provenance and source SHA256 are in docs/research/round07/workloads.json. Complete native prompts were not captured. Original exact-text assembly and o200k_base manifests remain separate.

Coverage includes three workload profiles, required contract equality, catalog-only initialization, causal output admission, within-session previous/current changes, fresh child isolation and separate S1 budgets; exactly-two-hop practice, missing/extra/closer/empty answer F1; three-provider context-band bars and all position/signal conditions; structural causal access including diagonal; URL state, nested focus, offline workshop, no nested main scroll panes, mobile layout, live fit/control hit-tests and lane-total containment at all14 events. Screenshots: deliverables/round07.

Round08: context control workshop

The current atlas starts with Purpose and Contents, followed by single-session policies, isolated delegation, harness loading rules, provider caching, goal reliability/evidence, lifecycle map, package menu and references. #assembly redirects to loading. Canonical atlas aliases now run atlas-round08.cjs.

    node tests/atlas-round08-models.cjs
    node tests/context-kits.mjs
    node tests/atlas.cjs /path/to/chromium

Retained pure token/session/change/source/research/policy tests continue to verify original fixtures/data. Browser checks all10 chapters at320/390/1366/1600 widths, all12 single-session live events, active technique rows, separate worker invocation ledger, native loader examples, cache partitions, toy role/position/head/mask lab, measured goal-position chart, hooks→kits and offline ZIP. Package subprocess tests may need the allowed execution profile in sandboxed environments.

Rebuild packages: python3 tools/build-context-kits.py. Native source-matched adapters/configs are not installed-runtime verified; reference skill discovery wrapper is validated structurally and application-tested, without claiming a behavioral gain. All owner repositories/harness settings remain untouched. Workload/cache budgets and toy weights are labeled; observed experiment records and published research remain distinct.

Final R08 regressions also cover mobile chapter scroll/heading focus, keyboard package selection, visible Claude handoff prerequisites, exact report fields and a total UTF-8/raw-delivery bound, plus schema-preserving Bash stdout replacement with full artifacts and unchanged error cases. `python3 tests/context-kits-archive.py` verifies the downloadable ZIP and browser catalog against tested sources. Native runtime validation and measured optimization gains remain outside these offline checks.

Round09: visible attention and delegated context

Canonical atlas checks now use atlas-round09.cjs. Add `node tests/atlas-round09-models.cjs` to the retained pure suites. Browser coverage includes three progressive calculation stages in the session walkthrough, an axis-labeled bar chart, every query/key weight and Δpp simultaneously, exact causal/mask/normalization relationships, advanced control persistence, four sourced native assembly views, the figure reading guide, parent/worker ordered layers, separate latest-window/cumulative-input metrics, vertical lifecycle switching across OpenCode/Claude/Codex, and live fit at1366×768. Existing offline/mobile and12-event checks remain.

The comparison advances the query through an invented five-token sequence; it does not measure changing weight values across actual session calls. Claude/Cursor assembly inventories are not presented as a known complete serialization order. Codex native hooks are documented separately from the bundled portable integration. Round08 source and screenshots remain under deliverables/round08.

Round10: attention in context rows and scoped worker packets

Canonical atlas aliases now use atlas-round10.cjs. Add `node tests/atlas-round10-models.cjs` to retained pure suites. The session starts at0/Turn0 with no task/query heat; subsequent rows display illustrative raw Q·K and normalized share. One invented key per row, synthetic positions from authored load budgets; this is not measured token/layer attention or native authority. The separate inline calculation view is removed; the existing math modal remains.

Parent/worker base6000 is an authored allowance. Workers have different smaller tool/skill budgets, propagated into all calls/window sums/peaks. Source/work units remain fixed; the comparison now combines delegation and scoping and does not isolate their empirical effects. Native readouts/inspectors expose documented configuration and partial overhead; no universal native full baseline is invented. Restart resets all ordered progress, while valid explicit deep links remain. Browser tests cover these behaviors, large-token text containment on320/390/1366/1600 widths and retained lifecycle/modal/offline controls.

R10 final regressions cover every21 delegation live state at1366×768, visible scoping/snapshot caveats in presentation mode, and the sourced native example’s required description field.

Round11: paired heat maps, explicit delegated handoffs, simultaneous comparisons

Canonical atlas checks now use atlas-round11.cjs. Add `node tests/atlas-round11-models.cjs` to the retained pure checks. The model preserves original R10 attention inputs while displaying paired before/current colors on a shared0–40%+ scale and explaining signed QK, softmax shares and percentage-point deltas. No-query/new/out states stay distinct. Native selectors are removed from Single session/Delegation; documented loading/lifecycle controls remain.

Varied task/source/result/report budgets preserve fixed12 work IDs/8 source IDs and12000 retained result tokens. Initial worker C1 requests are now counted before local results exist, then C2/C3 consume the initial/full results; only validated report output enters the prepared parent at handoff. Browser coverage includes all12/21 live states, stable stepper coordinates across every state at320/390/1366/1600, large-workload numeral containment,4 always-visible cache cases, complete44-source/6-topic references with focus/hash behavior, and retained advanced modal/native loader/lifecycle/offline package flows. Snapshots/screenshots: deliverables/round11.

Round12: scoped context details and model-routing economics

Canonical atlas checks now use atlas-round12.cjs. Add `node tests/atlas-round12-models.cjs` to retained pure checks. Every component inspector shows only that category’s token/attention changes, interpretation, techniques and assigned packet-budget examples. Short excerpts are not presented as full tokenized packets. Authority and input presence stay distinct from unmeasured compliance, with the originating lane preserved.

Eight standard-global API model rates are source-dated in research/round12/pricing.json and mirrored by atlas-pricing12.js. Calls/usage are synthetic:10 single-session requests,4 delegated-parent requests and5 per worker at completion. Each agent writes its eligible stable prefix once, then reads it within short TTL; other input stays fresh. Actual cache hits, output/reasoning, quality and latency vary. Rate thresholds apply to total input of each request, including caches, not accumulated session input. Costs sum F/R/W/O per call; accrued input is never multiplied by calls again. Per-call endpoint assignments are labeled as scope metadata, not exact interpolated content admission.

Optional agent chips open independent provider/model controls, persisting through URL state and cleared by Restart. Shared model-rate and long-request tables are available on Delegation/Caching;16 cost bars use one USD scale and exact expected amounts. Full browser coverage retains every12/21 live state,4 cache cases, fixed stepper coordinates, native loaders/hooks/packages, mobile/offline/large-token checks,51-source indexing, scoped details, nested modal focus, Back cleanup, lane preservation and assignment audits. Artifacts: deliverables/round12.
