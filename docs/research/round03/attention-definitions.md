The technical term you're looking for is Self-Attention, specifically Causal Self-Attention in autoregressive, Transformer-based LLMs.

However, several related terms describe how attention interacts with the context window of an LLM session.

## Key terminology

| Term                      | Technical meaning                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Self-Attention            | Mechanism allowing tokens to incorporate information from other tokens in the same sequence.                                               |
| Causal Self-Attention     | Restricts each token's attention to itself and preceding tokens, preventing access to future tokens.                                       |
| Attention Weights         | Numerical values representing how strongly a token attends to other accessible tokens within a particular attention head.                  |
| Attention Distribution    | How an attention head distributes its attention weights across accessible tokens.                                                          |
| Attention Decay           | Informal term for reduced influence of certain tokens, often as their distance from the current token increases. Not a universal property. |
| Effective Context Window  | The amount of context a model can meaningfully use, rather than merely accept as input.                                                    |
| Long-Context Retrieval    | The ability to identify and use relevant information from distant parts of a large context.                                                |
| Lost-in-the-Middle Effect | A documented tendency of some models to perform worse when relevant information is located in the middle of a long context.                |

## How attention works within a session

For standard scaled dot-product attention, the mathematical formulation is:

\\[ \operatorname{Attention}(Q,K,V)= \operatorname{softmax}\left(\frac{QK^T}{\sqrt{d_k}}+M\right)V \\]

Where:

- \\(Q\\) (Query): What information the current token representation seeks.
- \\(K\\) (Key): The representations used to determine which tokens are relevant.
- \\(V\\) (Value): Information aggregated from attended token representations.
- \\(M\\) (Mask): Prevents attention to future positions in causal models.

### Example: Attention across a 128K-token context

Illustrative attention distribution for one query token and one attention head

Early context

Middle context

Recent context

Conceptual only. Actual attention is dynamic, differs across heads and layers, and is not necessarily biased toward recent tokens.

An important distinction: a model having access to 128K tokens does not mean it uses every token equally effectively. Relevant information may be overlooked despite still being inside the context window.

## The term most applicable to harness engineering

For your interest in agentic orchestration, context management, and compaction, I'd distinguish three dimensions:

1. Context Window Utilization: How much of the available token budget is occupied.
2. Effective Context Utilization: How successfully the model incorporates relevant information from that context.
3. Attention Allocation: How attention is distributed across token positions at particular layers and heads.

A fourth useful concept is context interference: when irrelevant, conflicting, or competing information in the context degrades performance.

For example, an orchestrator could have 80% of its context window occupied but still perform well if relevant information is easy to retrieve. Conversely, it could have 30% utilization and struggle because of contradictory instructions or irrelevant tool output.

My recommendation: Use effective context utilization when discussing overall session quality, causal self-attention when discussing the underlying Transformer mechanism, and long-context degradation when discussing performance deterioration as sessions grow.

These distinctions are especially useful when designing compaction strategies, scoped subagent context, and evaluating whether larger context windows actually improve agent performance.