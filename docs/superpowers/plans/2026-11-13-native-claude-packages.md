# Native Claude packages implementation plan

> Execute inline; no implementation subagents. Use test-first changes and one final independent review.

**Goal:** personal native Claude components with focused truthful previews and downloads.
**Spec:** docs/superpowers/specs/2026-11-13-native-claude-packages-design.md
**Architecture:** native component source/catalog + standalone manifest installer and generated ZIPs; legacy adapters retained separately.
**Constraints:** no owner home/history access; no permission/telemetry changes; all tests in temporary homes; preserve preexisting owner dirt.

## Tasks
- [x] Native component catalog:20 IDs, per-component files/primary/loading, on-demand procedures and self-contained QA resources. Add failing tests for tiny hook/rule installs and no context-kit references.
- [x] Native manifest installer and archives: dependency closure, global paths, reviewed settings fragments, no installed registry, collisions/stale previews/recovery; extracted ZIP tests.
- [x] Native hooks and scoped checkpoint/results/metadata helpers: event contracts, private bounded storage and cwd/session identity.
- [x] Preview integration: generated exact Claude install manifests, primary/dependency split, load explanation and focused downloads. Retain other harness choices and directory controls.
- [x] Audience docs/citations, format/build/affected regression suites and single final review.
- [ ] Scoped commit/push, exact Pages commit and live interaction/archive hash verification.

## Review focus
- Installed components must remain usable after deleting the extracted installer; no hidden framework/receipt lookup at runtime.
- Existing personal settings, modified managed files and unrelated native components survive additive installation.
- Two repositories/sessions must never receive one another's checkpoints or raw output.
- A primary-only preview must explain and expose actual required dependencies rather than hide runtime files.
- Native loading/event claims must match official documentation and not imply semantic compliance.

## Ledger
- Root cause: the previous installer always emitted common core/hook/run/context-menu/index files, and previews opened the common index before item-specific content. PROTOCOLS.md depended on model-directed reads rather than native discovery.
- User selected direction: normal personal native directories, focused contents; no new approval needed for this requested refinement.

- Builder check pinned an explicit checkpoint producer, session/cwd isolation, role-aware manifests and additive archive installation. Chose no installed receipt/registry: identical reapply is accepted; differing existing files, including upgrades, require local review. This trades automatic upgrades for a simpler native installation and avoids hidden runtime dependencies.
- Baseline instruction evaluation reproduced missing personal scope, shared per-repository checkpoint state and inconsistent standalone QA helper paths. Native application trials exercised explicit save/read, missing IDs, full stores/locks, different sessions/repositories, pending QA evidence and separate full-report versus bounded-worker schemas. Fixed stale reference wording from the trial.
- Native installer/hooks,26 focused archive installs and104 exact preview manifests passed.23 retained/new pure/helper suites, three browser suites and formatter checks passed. User data and installed settings were never used.
- Final independent review: no Critical/Important findings; independently installed all26 focused archives, deleted extracted sources and syntax-checked installed modules. Corrected two minor notes: conditional checkpoint inclusion wording and explicit subprocess launch-error diagnostics. Native installed-client behavior and empirical gains remain environment trials.
