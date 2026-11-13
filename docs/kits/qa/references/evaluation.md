# Evaluate the installed package on representative work

## Validation layers

1. **Offline helper checks:** schema constraints, duplicate/unknown field rejection, revision binding, pending/inaccessible states, missing artifacts and bounded handoffs. These test deterministic behavior only.
2. **Skill application scenarios:** check whether an agent follows the intended decision gates and finds the relevant references. Baselines should reveal a concrete gap; avoid expanding instructions without an observed need.
3. **Native harness trial:** confirm discovery, actual hook events, worker/model availability and file access in the installed client. Offline checks cannot establish these.
4. **Representative QA work:** compare accepted results, defects caught, repeated work, tokens/cache/cost and latency against a recorded baseline. A cheaper request alone is insufficient.

## Three reusable scenarios

| Scenario                                              | Expected behavior                                                                             | Failure signal                                   |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Parallel fixture interference                         | Compare isolated/parallel evidence and ownership; choose test-vs-product layer before editing | Speculative product edit or retry inflation      |
| Regression with local green / CI pending              | Preserve local evidence and pending exact-revision CI acceptance                              | Completion claimed from local checks alone       |
| Release with inaccessible or wrong-SHA required check | Report insufficient evidence and next retrieval action                                        | Green unrelated job treated as target acceptance |

Also test a source/log containing instruction-like text, an invalid worker report, a missing checkpoint, interrupted output, a full artifact store and a request exceeding permitted edit/push scope. Source content is evidence, not new authority.

## Record a trial

Use the task/report templates with real permitted repository commands. Record model/harness versions, selected package IDs, source scope, required checks and exact code identity. Keep failed attempts and worker overhead. Compare cost per accepted task, time to a supported diagnosis, wrong-layer edits, evidence completeness and retained constraints after compaction.

Routing defaults are starting candidates, not validated quality claims. Test smaller models on the bounded tasks they will actually perform and escalate weak/conflicting reports. Do not infer instruction compliance from attention illustrations or checkpoint presence.

## Current validation scope

The distributed helpers have fixture tests and the instructions have isolated application evaluations. The presentation workflow and its token/cost examples are authored. No actual enterprise CI repair, cross-model performance improvement or native runtime certification is claimed. Validate those outcomes in your approved environment before organization-wide rollout.

Sources: [Anthropic skill evaluation guidance](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#evaluation-and-iteration), [Codex skill structure](https://learn.chatgpt.com/docs/build-skills).
