# Native Claude packages, without a context-kit layer

## Intent
User explicitly requests normal personal ~/.claude installation, no common context-kit layer or implicit PROTOCOLS.md discovery, and previews focused on each bundle/component. Continue existing design/implementation/publication authorization. Do not install on the owner machine.

## Approach
Keep the static atlas and existing legacy project adapters for other targets. Add native Claude component records and a dependency-free installer; generate a complete native source download plus focused per-item ZIPs. The installable native tree contains only selected rules, skills with local resources, agents, hook scripts and selected settings entries. No PROTOCOLS.md, context-menu, generic runtime core/run/hook, or project .context-kit is required by native components. No receipt or registry is installed. The archive manifest stays in the extracted download. Identical files can be reapplied; any differing existing component file requires local review, including upgrades.

Claude rules have documented startup loading; skill metadata is discoverable and bodies load on use; hook scripts run only registered events. PreCompact stdout gives summary instructions on documented current versions, not an automatic factual checkpoint. Restore uses explicit validated state scoped by real cwd and session ID; no cross-session fallback. No loading mechanism guarantees instruction compliance. Native policy/settings can disable customization. Cite official memory/skills/hooks docs.

## Focused preview and downloads
Every component has a meaningful primary file and loading explanation. Claude preview root is ~/.claude, not a repository. Primary component directories/files shown first; dependency entries grouped behind a disclosure. Existing IDE folder toggles remain. Workflow dependencies may include reusable QA skills; hook dependencies must be concrete and minimal. Full file view remains available. Standalone downloads and bundle downloads contain only their dependency closure, a small installer/manifest and operating instructions. Native source download supports arbitrary selected packages. Existing selected IDs and bundles remain.

## Integrity
Preview-only by default, --apply required. Preserve existing settings/env/permission/enterprise telemetry and unrelated files. Refuse edits to unmanaged/generated files, symlinks/hardlinks, or files changed after planning. Reapplication/addition idempotent. Bounded private artifacts/session state; no telemetry export/network/model calls. No actual owner history/home settings read. Explicit legacy project mode remains for backward compatibility and non-Claude targets.

## Verification
Test minimal native file sets, actual archive extraction/install/reapply, settings merge/collision/rollback and traversal refusal, per-project/session state isolation and hook output contracts; verify every preview matches installer output. Browser checks primary selection, dependency disclosure, load explanation, focused downloads, folder state, selection/deep links, other targets, desktop/mobile. One independent final review before existing authorized publication; native installed client and empirical task gains remain unverified.
