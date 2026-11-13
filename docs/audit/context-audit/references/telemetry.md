# Claude evidence and accounting

Primary sources, checked2026-11-12:
- https://code.claude.com/docs/en/monitoring-usage
- https://code.claude.com/docs/en/commands
- https://code.claude.com/docs/en/how-claude-code-works

## Available evidence

Discover selected local `CLAUDE_HOME/projects/**/*.jsonl` metadata, then analyze explicit paths. Transcript formats are implementation details; this adapter recognizes assistant message usage, system `compact_boundary` and tool-result sizes. It does not reconstruct the full system prompt, current resident context, hidden attention values or native compliance. Missing formats/events are unknown. Bounded discovery scans at most5000 directory entries, depth4, returns up to50 files (default20). Analysis handles up to50 explicit files plus one OTel export, skips lines over2M characters, stops each file at100MB and overall at100,000 rows. Limits are reported. Date filtering only applies to records carrying timestamps; undated records remain and should be disclosed.

Optional existing OTel JSONL supports one event per line or OTLP `resourceLogs/scopeLogs/logRecords` envelopes. Attributes can be objects or OTLP key/value arrays. Request events expose model, reported cost, latency (native source), fresh input, cache read/creation, output, source attribution and request IDs, subject to client version/configuration. This analyzer emits usage/cost and line provenance; inspect the native telemetry for additional latency/agent breakdowns. Do not enable raw request bodies or prompt/output collection just to get token metrics.

## Arithmetic

For a Claude API request:
`total request input = input_tokens + cache_read_tokens + cache_creation_tokens`.
Native transcript usage uses `cache_read_input_tokens` and `cache_creation_input_tokens` instead. Ordinary input excludes cache reads/writes. All three components must be known to display a complete input total. Missing fields remain null; known components contribute only to a labeled subtotal. Costs emitted by native OTel are estimates; they are not a subscription invoice.

Repeated native assistant message IDs use the last available usage record; identifiable assistant messages without usage remain nullable records, not the sum of streaming snapshots. OTel uses request_id, falling back to client_request_id then line and envelope-record provenance. Without trustworthy IDs, duplicates cannot be reconciled. When both native and OTel request streams are supplied, the analyzer uses OTel for usage and excludes native usage; it reports the exclusion. It can still use native compaction/tool metadata, which may cover a different scope. Partial OTel coverage does not become complete because native files were supplied.

Accrued input sums request input over calls. Peak input is the maximum fully reported selected request, not the true peak when records are missing. Neither is the current session's resident context. Output/cost totals are null if any selected request lacks those fields; known subtotals stay available. A subagent_completed total covers its final request, not the entire worker: collect child request records for worker accounting. No parent/worker ownership inference is made from filename alone.

## Findings

Rules are transparent candidate heuristics, not measured causal effects: result>16,000characters; peak known request>80K across≥8requests; observed compaction;≥80% of≥8requests on an Opus/Fable-named model. These prioritize review, not universal thresholds. Workload difficulty, model suitability, missed events and acceptance outcomes can change recommendations. Recommendations never assert a measured savings percentage.

Run analysis outside the conversational context; inspect the compact report first. Keep original paths/lines for local traceability. Redact usernames/repository paths before sharing; the report excludes raw text but metadata can still identify projects. Never publish real histories as presentation fixtures.
