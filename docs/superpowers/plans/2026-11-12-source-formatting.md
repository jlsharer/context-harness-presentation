# Readable presentation source implementation plan
> **For agentic workers:** superpowers:executing-plans inline; one final independent review. User explicitly requested formatting across all presentation packages and previously authorized updating the existing site. Current in-place workspace retained.
**Goal:** Readable maintained source, readable generated code/downloads, repeatable formatting and checks.
**Architecture:** Pinned Prettier forJS/TS/CSS/HTML/JSON, AST-guided blank lines between functions/methods and safe splitting of long static JS string literals without changing their values. Black forPython. Shared formatter helper used by source-generating builders; rebuild active archives.
**Tech stack:** Node18+ developer tools; Python formatter in isolated environment. No runtime dependency added to presentations/installable kits.
**Spec:** User request: codecurrentlysingleline, nofunctionspacing, fixacrossboard. Formatting-only; preserve behavior/data/visible presentation.
## Constraints
Preserve pre-existing functional edits via baseline ZIP/patch; stage formattedHEADforalreadydirtylegacyfiles while keeping formattedcurrentworkingedits. Neverrebuild benchmarkstartercode/recorded evidence hashes as if measurednewcode: existingfixturevalues unchanged. JSONL stays event-per-line. Historicaldeliverable snapshots preserved. Native/enduser settings untouched. Activekits/audit/policy/renderarchives source-matched; generatedcode formatted before packaging. No table/visual redesign.
## Review focus
AST/string/template literal semantic equivalence; existingdirtychanges isolation; readable generatedsource; archive/source fidelity; pinnedtools/check idempotence; UI whitespace sensitivity andallretainedbrowser flows.
## Task1: baseline and developer tooling
- [x] Snapshotallcurrentcode/dirtydiff; pinnedformatterconfig/npmcommands/Pythonrequirements/editorconfig/ignore.
- [x] Implement repeatable format/check command withfunction/methodblanklines, preserve strings when splitting long literals; verify ASTequivalence.
## Task2: allsource and generators/packages
- [x] Format maintained docs/tests/tools/rootcode; explicitimmutablefixtureexceptions. Make catalog/token/audit builders emitformattedJS; extractgeneratedOpenCodecode intoformattedTSsource.
- [x] Rebuild toolkit/audit/policy/renderZIPs; inspectbenchmarkstarterarchive source andformatonlyifneededwhilepreservingrecorded fixtureintegrity.
- [x] Confirm formattercheck/idempotence, AST/data equality; run21current suites+archivefidelity+legacyformatchecks. StageHEAD-onlyformatforpre-existingdirtytrackedcode, retainallworkingchanges.
## Task3: independent review and publication
- [x] One final review; one Important/Criticalfixpass ifneeded; no rereview.
- [ ] Commitformatcleanup, publishapprovedsite, verifylivecontrols/assets; report scope and commands.
