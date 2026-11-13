# Local report and data handling defaults

User-approved scope: analyze explicitly selected local Claude history into local files; optional reduced summary for Claude. Preserve enterprise configuration. Implement inline, with one independent final review; never inspect real owner history or install globally during development.

## Design

The analyzer remains a network-free Node helper. CLI analysis/discovery and installation previews write private local files by default. Full reports retain local provenance and are not model input. A separate allowlisted summary contains numeric aggregates, fixed coverage caveats and package identifiers; printing it requires an explicit flag. Claude-assisted interpretation uses Claude's normal model connection and the user's approved data policy.

Owned directories/files use POSIX 0700/0600; reject links and nonregular output targets. Existing unrelated directories/settings retain their permissions and contents except reviewed additive hook changes. Project artifacts get an internal ignore file. Hook metadata excludes arbitrary strings and direct identifiers. Hook storage stops at documented caps without deleting evidence or altering results when storage is unavailable. No collector, exporter, telemetry destination or approval bypass is installed.

## Tasks

1. RED→GREEN: CLI private local outputs, allowlisted summary, link refusal, permissions, enterprise settings preservation and bounded hook storage. Keep analyzer accounting API compatible.
2. Update skill, references and audience guide with terminal-first steps, local report interpretation and explicit optional sharing. Rebuild source-matched archive and synthetic browser data. Skill baseline already found automatic report-ingestion guidance; evaluate revised instructions in fresh context.
3. Run helper/archive/format/browser checks, independent final review and one necessary fix pass, then publish to the previously authorized public site and verify live assets.

## Review focus

Untrusted metadata entering reduced summaries; secret-bearing previews on stdout; symlink/hardlink writes; private POSIX files vs existing settings modes; bounded trace/artifact failure behavior; confusing local execution with Claude network isolation; untouched enterprise telemetry; source/archive fidelity. Same-user hostile filesystem races, encryption at rest, Windows ACL administration and enterprise approval are outside this helper's security boundary and must not be claimed.

## Ledger

- Baseline: existing skill instructs automatic ingestion of compact findings; CLI prints reports/previews to stdout without --out. No reduced-summary command. Existing hooks have unbounded metadata/artifact storage and default directory modes.
- Task 1 complete: `tests/context-audit-local.mjs` failed on default stdout disclosure, then passed after file-first outputs, allowlisting, private storage and caps. Existing audit/main edge regressions pass. Enterprise fixture env/permissions and existing settings modes preserved; owner history/config never accessed.
- Task 2 complete: revised skill application evaluation returns only the local path by default, waits for reduced-summary sharing, avoids secret-bearing previews and correctly rejects absent-env telemetry inference. Audience guide/browser tests pass at desktop and 320/390 widths. All 15 ZIP files match source; skill validator and pinned format check pass.
- Final: fixed Important parse-error disclosure — malformed-report canary RED→GREEN; added malformed preview/settings/hook-input coverage. JSON SyntaxErrors now produce fixed messages. Audit suites pass; source-matched ZIP rebuilt.
- Final: minor (deferred): selection.md's detailed table still mentions source file/line and confidence absent from reduced summaries. The main skill explicitly forbids inventing omitted provenance/metrics; a later wording pass can tailor that table. No full report ingestion is authorized by that template.
- Final: Ruling: hostile same-user filesystem races remain outside this helper's boundary, as documented; OS isolation is required for that threat. Cost if misread: local-data disclosure or write redirection.
- Final: Ruling: encryption at rest and Windows ACL administration remain enterprise controls, as documented. Cost if misread: local files may lack required storage protection.
- Final: Ruling: enterprise approval remains organizational; fixture tests verify settings preservation without certifying deployment. Cost if misread: an unapproved deployment.
- Final: Ruling: native Claude runtime and machine-wide egress remain unverified; the helper has no network/model calls and does not disable existing telemetry. Cost if misread: integration differences or unexpected native dataflows.
- Final: Ruling: unrelated pre-existing owner edits are excluded from this change/publication. Cost if misread: unrelated pending work is not published.
- Task 3 verification: final 18 pure/helper suites plus R12/R13 browser suites pass (20/20); all 15 archive entries/source bytes match; skill validator, diff whitespace check and pinned format check pass. Independent review completed; Important finding fixed in the single pass. Publishing to the existing authorized site, followed by live asset and interaction verification.
