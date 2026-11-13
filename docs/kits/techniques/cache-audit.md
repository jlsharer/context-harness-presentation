# Cache usage audit

## Use when

A workflow needs to distinguish input reduction from discounted cache reuse.

## Inputs and prerequisites

Provider-native usage, actual totals and before/now prefix text when appropriate.

Delivered mechanism: **Usage audit helper**. Native integrations are selected per harness; portable guidance does not imply automatic native enforcement.

## Procedure

1. Build the documented provider usage object and run node .context-kit/run.mjs cache usage.json.
2. Keep absent fields unknown. For Anthropic, sum fresh + read + creation for input; use each provider's actual field definitions instead of copying another schema.
3. Calculate per-call cost using the appropriate rates/thresholds and sum calls once. Separate output/reasoning and cache writes/reads from fresh input.
4. Compare accepted-task quality and latency alongside costs; include workers and summary calls.

## Output contract

A provider-aware accounting report with known/unknown partitions and prefix fingerprints.

## Verification and evaluation

Test cold, read reuse, changed prefix and incomplete usage. Reconcile reported totals against the native event/API source.

## Limits and recovery

Prefix character counts are not token counts, guaranteed hits or attention weights. API estimates are separate from subscription usage and do not establish measured savings by themselves. Preserve existing unrelated files/hooks and enterprise settings. If a managed file differs, review it rather than overwriting. Keep task evidence until the project's retention/acceptance requirements permit removal.

## References

- [Native hook capabilities](https://code.claude.com/docs/en/hooks)
- [Skill loading and resources](https://code.claude.com/docs/en/skills)
- [Operating-package authoring basis](../qa/references/provenance.md)
