# Round12 routing economics and scoped details plan
> For agentic workers: superpowers:executing-plans inline; one builder check and one final independent review, no implementer delegation. Existing workspace/refinement authorization retained.
Goal: readable per-component detail, sourced authority interpretation, auditable call/routing/cache costs.
Architecture: add atlas-pricing12.js (sourced rates), atlas-model12.js (scoped details/expanded usage/cost), atlas-content12.js and atlas-round12.css. Active controller/HTML wiring, durable research/round12 data, current aliases/tests. No dependencies/native calls.
Spec: docs/superpowers/specs/2026-11-12-round12-routing-costs-design.md
Global constraints: synthetic usage/heat distinctly labeled; actual rates cited; no subscription or performance-equivalence inference; preserve old fixture/math and unrelated edits; publish only after green checks/review.
Review focus: category scope and budget/excerpt distinction; authority vs attention/confidence; full-request thresholds including caches; cold starts/output inclusion and no double multiplication; route persistence/focus and live/mobile density.

## Task1: sourced pricing and accounting
Files atlas-pricing12.js, atlas-model12.js, research/round12/*; tests atlas-round12-models.cjs; source catalog and reference taxonomy additive entries.
Interfaces: rates(model,input,ttl), price(usage,model), scenario(step,n,profile,routes) → R11-shaped snapshot + expanded calls/actor/lane counts, usage and costs; cacheCosts(case); component(step,path,profile,id) → only that category's counts/attention/techniques/examples/authority.
- [x] RED pure checks, implement rate card/thresholds, expanded ledger and scoped details, GREEN retained pure checks.

## Task2: readable details and authority
Files atlas-content12.js/CSS, controller/HTML; tests atlas-round12.cjs.
- [x] RED scoped component dialog and authority priority/presence/unmeasured-compliance views.
- [x] Implement sectioned details, balanced example budgets and authority diagram; GREEN all session states/mobile/modal focus.

## Task3: routing and cache-price comparisons
Interfaces per-agent chips data-agent-route; provider/model dialog; shared model-rates dialog and call ledger;4 case×4 model cost bars. URL fields for5 model selections and Reset defaults.
- [x] RED route/cost/count/table/bars/deep-reset/focus checks; implement compact main views and expanded dialogs.
- [x] GREEN complete browser matrix, source and archive fidelity, full suite.
- [ ] One final review/fix pass, snapshot, public deployment with asset matching and precise feedback checkpoint.
