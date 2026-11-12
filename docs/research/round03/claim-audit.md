# Round 03 claim and visual audit

Sources were opened and checked on 11 November 2026. Stable IDs and locators are in [sources.json](sources.json). This is research/design preparation; no new model experiment was run.

| Claim or visual | Evidence | Presentation treatment |
| --- | --- | --- |
| The harness assembles multiple sources into each request | OpenCode Instructions, Ordering; OpenAI prompt guide | Show OpenCode's documented initial instruction sequence, with the remaining message/tool context as a separate layer. Do not call it a universal serialization order. |
| Ordering can change behavior | Lu et al. 2022; GPT-4.1 and Claude official guidance | Demonstrate two serialized arrangements of the same material. Attribute measured ordering effects to the tested tasks; leave gains on our tasks unmeasured. |
| Instruction authority is determined solely by being earlier | Unsupported; conflicts with role semantics | Remove. Label provenance/API role separately from content position. |
| Reserved output allowance is another included prompt layer | Incorrect category | Draw an external capacity bracket/gauge. Do not render allowance as input tokens. |
| Every token has equal influence if it fits | Not established | Explain effective use separately from capacity and from internal attention allocation. |
| Causal self-attention restricts access to subsequent tokens | Vaswani et al., decoder masking | Use a labeled causal-mask schematic and the attention equation. A schematic of allowed connections is not a measured attention heatmap. |
| Attention always decays with distance, or all current models share a U-shaped attention curve | Unsupported universal claim | Remove generated curves and model-tier heatmaps. Use published measurements with model/head/layer/task labels. |
| Internal attention distribution has measurable nonuniform structure | Xiao et al., Fig. 2 | Optional technical panel using the actual attention-logit figure, with its aggregation and short-sequence scope clearly identified. Do not relabel logits as weights. |
| Retrieval performance can depend on evidence position | Liu et al., Fig. 1 | Use original figure or a traceable redraw with actual values. Y-axis stays task performance, not attention. |
| Length and associative difficulty affect measured retrieval | NoLiMa v3, Fig. 3 / Table 4 | Use the checked table transcription for a factual chart and cite the original setup. Mechanistic explanations are attributed to the authors, not presented as directly measured head weights. |
| Stable input prefixes enable cache reuse | OpenAI cache documentation | Show prefix identity and mismatch location. No current price or latency percentage without additional source verification. |
| Retrieval/compaction/scoped workers always improve results | Unsupported universal claim | Present source-backed techniques with conditions and evaluation requirements. Our observed orchestration overhead stays visible. |
| Our pilot/service findings | Original public JSON and method pages | Preserve actual acceptance, natural caching, one-repeat scope, pilot requested vs service observed concurrency, and counterfactual API-cost labeling. |

## Original assets

- `assets/01_prompt_assembly.png`: use its connected source/control/assembly/output structure and static/dynamic distinction. Correct the treatment of output allowance and universal order.
- `assets/02_attention_comparison_early.png`: use its integrated panels and annotated comparisons. Do not carry over conceptual attention curves, named-model tiers, or the claim that earlier content is inherently higher priority.
- `assets/03_attention_comparison_updated.png`: use its capacity/use/mitigation relationships and connected cards. Replace model capacity tables unless separately verified, and replace the conceptual U-shaped chart with published data.

These generated images guide composition, iconography and information density. They are not factual evidence. Preserve the current green/mint/gold palette in rebuilt native diagrams.

## Citation rules

Each non-experimental substantive claim needs one or more source IDs. Engineering interpretations must be visibly scoped, and proposed local interventions remain unmeasured until tested. A citation must support the specific claim, not just the topic.

Each relevant page has a visible bottom source strip. Research plots identify publication/version, model, task, axes, units, smoothing and aggregation where applicable. Final references pages group mechanisms, provider guidance, research and our experimental materials. The offline bundle retains bibliographic metadata, verified data and any permitted local figure assets; source URLs remain usable online.
