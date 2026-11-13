# Targeted source packet

## Use when

Initial context is broad, or the next investigation question needs a specific fact.

## Inputs and prerequisites

Goal, constraints, acceptance checks and selected source paths/full excerpts.

Delivered mechanism: **Packet helper**. Native integrations are selected per harness; portable guidance does not imply automatic native enforcement.

## Procedure

1. Start from the failing assertion, owning fixture and relevant product contract. Record source anchors and what is still unknown.
2. Build packet JSON with goal, constraints, checks and sources [{path,text}]. Use existing repository evidence rather than inventing file names.
3. Run node .context-kit/run.mjs packet input.json; admit the selected packet, not an entire repository dump.
4. Expand only for a discriminating unanswered question. Keep the source version/revision with the evidence.

## Output contract

A focused packet and traceable source scope. The helper reports bytes, not provider-native tokens.

## Verification and evaluation

Inspect required-fact coverage and source fidelity. Compare included input and accepted-task outcomes on representative work.

## Limits and recovery

Narrowing input can omit a critical dependency. Reopen anchors when conclusions conflict; the helper does not discover relevance or prove completeness. Preserve existing unrelated files/hooks and enterprise settings. If a managed file differs, review it rather than overwriting. Keep task evidence until the project's retention/acceptance requirements permit removal.

## References

- [Native hook capabilities](https://code.claude.com/docs/en/hooks)
- [Skill loading and resources](https://code.claude.com/docs/en/skills)
- [Operating-package authoring basis](../qa/references/provenance.md)
