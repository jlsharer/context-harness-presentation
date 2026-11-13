# Stable reusable prefix

## Use when

Repeated calls share stable instructions/tools and may benefit from provider cache reuse.

## Inputs and prerequisites

Actual provider request construction, stable prefix and observed usage fields.

Delivered mechanism: **Protocol**. Native integrations are selected per harness; portable guidance does not imply automatic native enforcement.

## Procedure

1. Keep reusable instructions/tool schemas stable before volatile task/results where the native/provider assembly permits it.
2. Avoid needless prefix rewrites and record the versions used. Do not claim a native serialization order that has not been captured or documented.
3. Treat TTL expiration, model switches, tool changes and concurrent sessions according to provider rules; do not assume cache sharing across agents.
4. Pair reuse changes with actual usage/cost/latency observation. A cache read is still included context and does not free attention capacity.

## Output contract

A deliberate stable-prefix policy and evidence needed for a cache audit.

## Verification and evaluation

Compare actual fresh/read/write/output partitions and accepted-task results over repeated eligible calls, including cold and changed-prefix cases.

## Limits and recovery

Provider-specific minimums, TTL and pricing differ. A matching text prefix or fingerprint alone is not proof of a hit, and reuse does not remove source-selection or correctness requirements. Preserve existing unrelated files/hooks and enterprise settings. If a managed file differs, review it rather than overwriting. Keep task evidence until the project's retention/acceptance requirements permit removal.

## References

- [Native hook capabilities](https://code.claude.com/docs/en/hooks)
- [Skill loading and resources](https://code.claude.com/docs/en/skills)
- [Operating-package authoring basis](../qa/references/provenance.md)
