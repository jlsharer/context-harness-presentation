const slides = [
  {
    "title": "Context & Harness Engineering",
    "description": "Context & Harness Engineering",
    "notes": "Prompt engineering shapes the instruction. Context engineering selects the information available for each call. Harness engineering governs the calls, tools, state, permissions and checks that complete the work. These practices overlap. This distinction describes the scope of the engineering work.",
    "view": "intro"
  },
  {
    "title": "A new model call starts at the inference boundary",
    "description": "One prompt starts a harness loop: assemble input, invoke the model, execute requested tools, collect results, and return to assembly. A final answer goes through completion checks. The Explore the 16 events button opens the detailed breakdown.",
    "notes": "Model call and model invocation mean one generation request at the harness-to-model boundary in this client-managed example. Token generation and streaming events are part of that call. The model generates text and/or tool requests; the harness validates and executes tools and selects results for the next request. A single response can request several tools. Rule-based checks, hooks, routing, logging and state updates do not themselves invoke a model; model-backed variants do. Hosted agent services may wrap multiple internal model calls inside one outer API request. Completion, cancellation, permissions and budget limits can stop or pause the loop.\n\nPrompt engineering shapes the goal, instructions, tool descriptions and response format. Context engineering selects and orders state at Assemble and Update. Exact ordering and hooks vary by harness. The modal exposes the 16 event details.\n\nSources checked 4 November 2026\nhttps://developers.openai.com/api/docs/guides/function-calling\nhttps://developers.openai.com/api/docs/guides/agents/running-agents\nhttps://developers.openai.com/api/docs/guides/compaction",
    "view": "loop"
  },
  {
    "title": "Six calls, eight tool executions, one prompt",
    "description": "Six inference calls, eight tool executions, and growing input in a hypothetical single session. Each call generates 2K output. Tool-result batches feed the next call. A modal lists all 16 loop events.",
    "notes": "A model call is one provider inference request and its response as observed by the harness. Streaming chunks belong to that call. One user request triggers six sequential calls here. Tools can return large batches without being model invocations themselves. Provider-managed tools can hide internal processing inside one API request; use reported usage.\n\nHypothetical stress example with full retention. The 50K initial input comprises 40K stable setup and 10K task material. Setup examples are system instructions 8K, harness/tool schemas 16K, loaded skills 8K and memory 8K. Every call emits 2K output. Tool batches contain 98K, 148K, 198K, 198K and 148K tokens. Thus input snapshots are 50,150,300,500,700,850K. Total input is 2,550K and output is 12K. Largest input is 850K, leaving 150K before generation against the illustrative 1M window. This is an example choice, not a universal default. Tools are deliberately verbose; selection and compaction could change this trajectory.\n\nUncached Sonnet 5.5 example cost is 2.55M×$2 + .012M×$10 = $5.22, without other fees. A new user prompt can cause more work and input, but turn count is not a fixed unit of API spend. Subscription quotas are separate.\n\nSources checked 4 November 2026\nhttps://platform.claude.com/docs/en/about-claude/pricing\nhttps://platform.claude.com/docs/en/build-with-claude/prompt-caching\nhttps://developers.openai.com/api/docs/guides/function-calling\n\nExplicit tool counts: call1 requests three reads (API specification, source and tests); call2 requests one search of related code/traces; call3 requests one dependencies/fixtures inspection; call4 generates a patch and one CLI script request that applies it and runs unit tests; call5 requests integration tests plus saved-log inspection (two executions, sequenced if logs depend on that run); call6 generates the final answer with no tool request. Total 3+1+1+1+2+0=8 executions. One script can contain several shell commands; count at the harness tool-request boundary. The same five aggregate result sizes and six input sizes used in the cost ledger are preserved. These are illustrative verbose batches, not typical test-log measurements. The example demonstrates event boundaries rather than prescribing an optimal fix workflow.",
    "view": "calls"
  },
  {
    "title": "As context grows, test whether the key fact survives",
    "description": "As context grows, test whether the key fact survives",
    "notes": "The rule is placed at illustrative token 80K, inside the first 98K tool batch. Its absolute position stays fixed while later calls retain all earlier history. Its relative position is 80/150, 80/500 and 80/850. The bars show occupancy only, not attention weights or measured correctness. Liu et al. evaluated position effects in specific models on question answering and key-value retrieval. Do not extrapolate their numerical results to these models. A suitable evaluation varies length and evidence position independently and measures compliance with the repeated-key API rule, with repeated runs and model versions recorded. Longer uncached prompts can increase input-processing time; cache, model architecture and provider load affect the result.\n\nSources checked 4 November 2026\nhttps://aclanthology.org/2024.tacl-1.9/\nhttps://developers.openai.com/api/docs/guides/latency-optimization",
    "view": "performance"
  },
  {
    "title": "Model API pricing and thresholds",
    "description": "OpenAI: developers.openai.com/api/docs/pricing  ·  Anthropic: platform.claude.com/docs/en/about-claude/pricing · 10 · MODEL · WINDOW · BASE IN / OUT · THRESHOLD · LONG IN / OUT · GPT-6 Astra · 1.05M · $10 / $50 · >272K · $20 / $75 · GPT-6.1 Sol · 1.05M · $2 / $10 · >272K · $4 / $15 · GPT-6.1 Terra · 1.05M · $1 / $5 · >272K · $2 / $7.50 · GPT-6 Luna · 1.05M · $0.10 / $0.50 · >272K · $0.20 / $0.75 · GPT-5.6 Luna · 1.05M · $0.20 / $1.20 · >272K · $0.40 / $1.80 · Claude Opus 5.5 · 1M · $4 / $20 · None in 1M · Same · Claude Sonnet 5.5 · 1M · $2 / $10 · None in 1M · Same · Claude Haiku 5.5 · 1M · $0.10 / $0.50 · >100K · $0.50 / $2.50 · USD / million tokens · prompt threshold applies to the full request · standard API tier · 04 Nov 2026 · cache, regional, service-tier and tool charges differ; app quotas are separate.",
    "notes": "OpenAI listed models apply the long rate to the full request above 272K input tokens: 2x input/cache and 1.5x output. The table shows uncached input and output, not cache read/write pricing. Claude Opus and Sonnet 5.5 use standard rates across the documented 1M window; Haiku 5.5 raises rates for full requests above 100K, counting cache reads and writes in threshold. Verify provider, route and current pricing.\n\nSources: https://developers.openai.com/api/docs/models/gpt-6-astra; https://developers.openai.com/api/docs/models/gpt-6.1-sol; https://developers.openai.com/api/docs/models/gpt-6.1-terra; https://developers.openai.com/api/docs/models/gpt-6-luna; https://developers.openai.com/api/docs/models/gpt-5.6-luna; https://platform.claude.com/docs/en/about-claude/pricing\nAccessed 2026-11-04.",
    "view": "image",
    "image": "slides/slide-10.png"
  },
  {
    "title": "Cache billing changes the price of repeated input",
    "description": "Cache billing changes the price of repeated input",
    "notes": "U means newly processed input billed at the ordinary input rate. W is input written to an explicit cache and billed at the write rate. R is eligible input reused from cache. O is output, including reasoning when the provider bills it there. Categories are mutually exclusive in this example, with U+W+R equal to each call’s input. The 40K prefix is identical in all six calls and is the only cache breakpoint. Each later call begins before the refreshed five-minute cache expires. The rest of the growing history is uncached in this policy.\n\nSonnet 5.5 standard rates per million are U $2, W $2.50 for five-minute writes, R $0.10, O $10, across the documented 1M window. Six rows in K are [10,40,0,2], [110,0,40,2], [260,0,40,2], [460,0,40,2], [660,0,40,2], [810,0,40,2] in U,W,R,O order. Costs are $0.140, $0.244, $0.544, $0.944, $1.344 and $1.644. Totals U2310K/W40K/R200K/O12K cost $4.62+$0.10+$0.02+$0.12=$4.86. Without cache the same calls cost $5.22. The first call is dearer with its write ($0.14 vs $0.12). Hits do not reduce logical context occupancy. Cache expiration, prefix changes, model changes or different billing routes change this result.\n\nC is API USD; P is the corresponding per-million category rate; Σ sums actual model calls. Add tool, storage and infrastructure fees where applicable. For cost per accepted task include failed attempts and retries in the numerator. Quotas and elapsed time are separate measures.\n\nSources checked 4 November 2026\nhttps://platform.claude.com/docs/en/about-claude/pricing\nhttps://platform.claude.com/docs/en/build-with-claude/prompt-caching",
    "view": "economics"
  },
  {
    "title": "One delegation can contain many model calls",
    "description": "Each worker receives one assignment, runs its own loop without parent intervention, and returns one completion report. Three worker runs contain eight worker model calls, plus two orchestrator model calls: ten total.",
    "notes": "This is a proposed sequential decomposition of the SAME duplicate-order task, preserving all five tool batches from slide 3. Research receives 98K, Implement receives 148K and 198K, Validate receives 198K and 148K. Every worker starts at 50K, made from 40K session-specific setup and 10K assigned context including required artifact/handoff excerpts. Every model call emits 2K. Research inputs 50/150K total200K; Implement inputs50/200/400K total650K; Validate inputs50/250/400K total700K. The orchestrator has two calls 50/60K total110K. Each labeled mini box is one call; the session totals sum repeated inputs.\n\nThe initial orchestrator response dispatches a predefined sequential harness workflow. Stage results move through typed artifact handoffs without extra parent model calls. A dynamic orchestration policy may need additional parent calls. The final parent input is initial50K + parent output2K + three final worker summaries6K + selected evidence2K =60K. There are10 model calls,1660K input and20K output, costing $3.52 uncached. Peak one-call input400K vs850K in the single session. These assumed packets must be tested for sufficient information and equivalent acceptance criteria. No speed or quality equivalence is asserted.\n\nFor an independent40K prefix cache in each of four sessions, assume four initial writes160K, six reads240K, and uncached1260K. Cost $0.40+$0.024+$2.52+$0.20 output=$3.144. Cross-session reuse is not assumed. All calls hit within each prefix’s TTL. Same rates as slide6. Compare against single-session$4.860 with caching, or compare both without caching$3.52 vs$5.22.\n\nA delegated worker may invoke a skill that makes multiple model requests. Delegation is a harness action; model usage is counted per request across parent and child sessions.\n\nSources checked 4 November 2026\nhttps://platform.claude.com/docs/en/about-claude/pricing\nhttps://platform.claude.com/docs/en/build-with-claude/prompt-caching\nhttps://code.claude.com/docs/en/sub-agents\n\nDelegation semantics: one prompt sent to a worker followed by one completion response is one delegation (worker run). No additional parent intervention is required for the worker to execute tools and make more model requests. In this example the three workers have 2, 3 and 3 calls: eight child requests. The orchestrator has two requests for a total of ten. If a custom wrapper directly invokes a model once and returns that response, it is one model call. If it invokes an agent runner or hosted agent endpoint, one outer invocation may encapsulate many. Inspect child inference request IDs/usage spans to establish the count. The number of parent-visible messages alone cannot establish it. This presentation does not claim that a specific custom harness has been inspected.\n\nCurrent source confirms independent subagent requests\nhttps://code.claude.com/docs/en/sub-agents\nAccessed 4 November 2026.",
    "view": "workers"
  },
  {
    "title": "Six ways to control the next model call",
    "description": "Six ways to control the next model call",
    "notes": "Each card opens a worked example. Close returns to this lifecycle slide.\n\nRetrieve\nTrigger — Two requests reuse an idempotency key but create two separate orders.\nAction — Read the team’s API specification via MCP. Include the clause “a repeated key returns the existing order” with its version and source reference.\nCheck — Use a CLI integration test to repeat the request. Both responses should identify the same order.\nhttps://modelcontextprotocol.io/specification/2025-11-25/server/resources\n\nPrune\nTrigger — A test produced thousands of lines. One assertion failed.\nAction — Save the full log as an artifact. A harness filter selects the assertion, stack frame and artifact path for the next call.\nCheck — Open the saved log if the excerpt is inconclusive. The filter changes the next input. Stored history follows its own retention policy.\nhttps://opencode.ai/v2/docs/compaction\n\nCompact\nBefore — Save the failing test ID and the acceptance rule. Where supported, name both in the instructions that guide the summary.\nAfter — In Claude Code, a SessionStart hook matching compact can add the saved test ID and rule to the next request. PostCompact can log the summary.\nCheck — Have the agent identify the open test and rerun it. Restore missing details from the saved artifact.\nhttps://code.claude.com/docs/en/hooks\n\nCache\nTrigger — Each review uses the same instructions and tool definitions, followed by a different patch.\nAction — Put identical setup first and the changing diff last. Choose an available cache retention period that fits the interval between reviews.\nCheck — Inspect reported cache-read tokens and effective cost. A hit can reduce price or latency while the prefix still occupies context.\nhttps://developers.openai.com/api/docs/guides/prompt-caching\n\nCheckpoint\nTrigger — A patch passes unit tests. Integration tests still need to run.\nAction — At that stage boundary, write a checkpoint with the commit SHA, test-log path, acceptance rule and pending integration command.\nCheck — On resume, compare the current commit to the saved SHA. Rerun stale tests before reusing their results.\n\n\nIsolate\nTrigger — A security review can proceed independently of implementation.\nAction — Give the worker the diff and threat model, read-only permissions and a time budget. Ask for findings with file, line and evidence.\nCheck — The orchestrator validates the findings and decides which fixes to assign. The next worker receives only the relevant records.\nhttps://opencode.ai/v2/docs/agents",
    "view": "lifecycle"
  },
  {
    "title": "How the harness assembles a model request",
    "description": "How the harness assembles a model request",
    "notes": "This diagram is a common packaging pattern, not a universal serialization order or authority ranking. System/developer instructions, tool definitions and messages may be separate API fields. Relevant skills and memory can be loaded at different points. Conversation messages retain their chronology; tool results follow the tool requests they answer. Tool schemas often occupy a stable prefix. Reuse of that prefix requires provider cache eligibility. A harness may reference provider-managed state rather than resend all tokens. This applies to parent and child sessions; their selected contents can differ. Model weights shape behavior outside prompt content.\n\nSources checked 4 November 2026\nhttps://developers.openai.com/api/docs/guides/conversation-state\nhttps://platform.claude.com/docs/en/build-with-claude/prompt-caching",
    "view": "assembly"
  },
  {
    "title": "Bring the right evidence into the workspace",
    "description": "Bring the right evidence into the workspace",
    "notes": "Internal and external describe where source information is held, not the transport or its authority. MCP resources may expose internal specifications or external material; CLI tools can search local source, fetch remote documentation and run tests. A harness chooses what content to include. The model cannot read every organization system merely because a connector exists. Preserve permissions, source version and evidence references. Public sources are publicly accessible, not necessarily in the legal public domain.\n\nExample API contract clause (invented): POST /orders with a repeated idempotency key returns the existing order instead of creating another one. This is the team’s software interface specification, not a legal agreement. A useful retrieval packet includes that exact rule, the handler excerpt, the failing test and the dependency documentation version. Current instructions, skills, memory and summaries are combined with this selected evidence.\n\nSources checked 4 November 2026\nhttps://modelcontextprotocol.io/specification/2025-11-25/server/resources\nhttps://developers.openai.com/api/docs/guides/function-calling",
    "view": "scope"
  },
  {
    "title": "Where should each skill run?",
    "description": "Agent Skills overview · agentskills.io/home   |   Anthropic · Building effective agents · 14 · A skill packages one procedure. A workflow connects procedures by passing defined inputs and outputs. · SEQUENTIAL · One session · Review a small patch · Review skill · diff → findings[] · Keep the diff in one session. A local fix skill can consume the findings next. · Low setup cost. Later calls may reread a growing history. · SEQUENTIAL · Separate workers · Review, then fix a patch · Review → Fix · findings[] → patch_ref · The fix worker needs the review result. Check the handoff before it starts. · Scoped inputs can reduce rereads. Both worker setup and handoff add cost and time. · PARALLEL · Separate workers · Review independent patches · Review A  +  Review B · findings[] + findings[] → merge · Both workers can start at once. The merge waits for the slower review. · Overlap can cut elapsed time. Count duplicate setup, conflicts and merge work. · Handoff example   findings[] = file, line, severity and evidence for each issue. · Route each call separately. A lower-cost model can triage findings before a specialist reviews uncertain cases.",
    "notes": "A skill is reusable procedure content. It can be invoked repeatedly or require several model calls and tools. A workflow defines how outputs satisfy downstream inputs. Formal input/output schemas are a design choice in these examples. Review takes a diff reference and returns findings, with file (string), line (integer), severity (enum) and evidence (string). Fix validates the records and returns patch_ref and test_refs. The same workflow can run inside one session. Separate workers add isolation, concurrency or specialized permissions. A parallel merge should deduplicate by file and line and resolve conflicting findings. Routing is a separate per-call choice in all three modes. Compare topology on matched tasks and include failed attempts.\n\nSources: https://agentskills.io/home; https://www.anthropic.com/research/building-effective-agents\nAccessed 2026-11-04.",
    "view": "image",
    "image": "slides/slide-14.png"
  },
  {
    "title": "Choose an approach against all five dimensions",
    "description": "Choose an approach against all five dimensions",
    "notes": "The five comparison dimensions are context, quality, cost, latency and control. These are conditional engineering tradeoffs. Single-session work tends to be easiest to coordinate when decisions are tightly coupled. Sequential workers can isolate context and permissions but introduce handoff risks and overhead. Parallel workers can overlap independent tasks but require integration and may duplicate context. The dollar examples are the same hypothetical sequential task from slides3/7 with standard Sonnet5.5 rates and no caching. The parallel security/UX review is a different example, so no fabricated matching cost or latency estimate is shown. Routing can change model choice per call in any topology. Evaluate all options with acceptance checks and measure total spend, retries and time to validated completion.\n\nSources checked 4 November 2026\nhttps://www.anthropic.com/research/building-effective-agents",
    "view": "decision"
  }
];
const controls = [
  {
    "name": "Retrieve",
    "action": "Bring in missing evidence",
    "example": "Read the API rule for repeated order requests.",
    "title": "Which API rule applies to this failure?",
    "steps": [
      [
        "Trigger",
        "Two requests reuse an idempotency key but create two separate orders."
      ],
      [
        "Action",
        "Read the team’s API specification via MCP. Include the clause “a repeated key returns the existing order” with its version and source reference."
      ],
      [
        "Check",
        "Use a CLI integration test to repeat the request. Both responses should identify the same order."
      ]
    ],
    "source": "https://modelcontextprotocol.io/specification/2025-11-25/server/resources"
  },
  {
    "name": "Prune",
    "action": "Shorten the next input",
    "example": "Keep the failing lines from a long test log.",
    "title": "What does the next call need from the log?",
    "steps": [
      [
        "Trigger",
        "A test produced thousands of lines. One assertion failed."
      ],
      [
        "Action",
        "Save the full log as an artifact. A harness filter selects the assertion, stack frame and artifact path for the next call."
      ],
      [
        "Check",
        "Open the saved log if the excerpt is inconclusive. The filter changes the next input. Stored history follows its own retention policy."
      ]
    ],
    "source": "https://opencode.ai/v2/docs/compaction"
  },
  {
    "name": "Compact",
    "action": "Summarize older work",
    "example": "Carry an unresolved test across a summary.",
    "title": "How does the agent resume after compaction?",
    "steps": [
      [
        "Before",
        "Save the failing test ID and the acceptance rule. Where supported, name both in the instructions that guide the summary."
      ],
      [
        "After",
        "In Claude Code, a SessionStart hook matching compact can add the saved test ID and rule to the next request. PostCompact can log the summary."
      ],
      [
        "Check",
        "Have the agent identify the open test and rerun it. Restore missing details from the saved artifact."
      ]
    ],
    "source": "https://code.claude.com/docs/en/hooks"
  },
  {
    "name": "Cache",
    "action": "Reuse a stable input prefix",
    "example": "Share the same review rubric across calls.",
    "title": "How can repeated reviews reuse their setup?",
    "steps": [
      [
        "Trigger",
        "Each review uses the same instructions and tool definitions, followed by a different patch."
      ],
      [
        "Action",
        "Put identical setup first and the changing diff last. Choose an available cache retention period that fits the interval between reviews."
      ],
      [
        "Check",
        "Inspect reported cache-read tokens and effective cost. A hit can reduce price or latency while the prefix still occupies context."
      ]
    ],
    "source": "https://developers.openai.com/api/docs/guides/prompt-caching"
  },
  {
    "name": "Checkpoint",
    "action": "Save a durable result",
    "example": "Resume a review from a commit and test log.",
    "title": "What should survive an interrupted run?",
    "steps": [
      [
        "Trigger",
        "A patch passes unit tests. Integration tests still need to run."
      ],
      [
        "Action",
        "At that stage boundary, write a checkpoint with the commit SHA, test-log path, acceptance rule and pending integration command."
      ],
      [
        "Check",
        "On resume, compare the current commit to the saved SHA. Rerun stale tests before reusing their results."
      ]
    ],
    "source": ""
  },
  {
    "name": "Isolate",
    "action": "Bound a worker’s scope",
    "example": "Give a reviewer read-only access to a diff.",
    "title": "How can a reviewer inspect a change safely?",
    "steps": [
      [
        "Trigger",
        "A security review can proceed independently of implementation."
      ],
      [
        "Action",
        "Give the worker the diff and threat model, read-only permissions and a time budget. Ask for findings with file, line and evidence."
      ],
      [
        "Check",
        "The orchestrator validates the findings and decides which fixes to assign. The next worker receives only the relevant records."
      ]
    ],
    "source": "https://opencode.ai/v2/docs/agents"
  }
];
const eventDetail = {
  "kind": "events",
  "category": "SESSION EVENT LOOP · REPRESENTATIVE ORDER",
  "title": "Inside one pass through the loop",
  "steps": [
    [
      "01 · Receive",
      "Record the user prompt, attachments and session ID. One prompt may start a multi-step run.",
      "No inference"
    ],
    [
      "02 · Restore",
      "Load retained conversation, task state, memory references and artifact locations.",
      "No inference"
    ],
    [
      "03 · Configure",
      "Resolve system/developer instructions, available skills, tool schemas, permissions and budgets.",
      "No inference"
    ],
    [
      "04 · Startup hooks",
      "Run configured scripts or inject context. A hook that explicitly asks a model to judge or summarize adds inference.",
      "Depends on hook"
    ],
    [
      "05 · Route",
      "Choose the configured model or apply routing rules. A model-based router makes its own auxiliary request.",
      "No inference for rules"
    ],
    [
      "06 · Assemble",
      "Select and order instructions, goal, skills, memory, retained messages and evidence. Preserve tool-request/result pairing.",
      "No inference"
    ],
    [
      "07 · Check limits",
      "Check cancellation, context headroom, output allowance and spending limits. Pause or stop if a limit prevents continuation.",
      "No inference"
    ],
    [
      "08 · Invoke",
      "Submit the assembled input and generation settings to the selected model. This is one model call, also called an invocation.",
      "NEW MODEL CALL"
    ],
    [
      "09 · Stream",
      "Receive text, tool names and arguments. Streaming chunks and token generation are parts of the current call, not new calls.",
      "Same model call"
    ],
    [
      "10 · Record",
      "Persist the response, request ID, usage and timing. Retained assistant output can become input on a later call.",
      "No inference"
    ],
    [
      "11 · Dispatch",
      "Inspect the response type. Route tool requests to executors or a candidate final answer to completion checks.",
      "No inference for dispatch"
    ],
    [
      "12 · Authorize",
      "Validate tool arguments and permissions. If approval is required, pause and resume after approval. A model-based reviewer is an extra call.",
      "No inference for ordinary checks"
    ],
    [
      "13 · Execute",
      "Read files, query MCP, apply a patch, run tests or wait for a job. One model response may request multiple tools. A tool backed by a model adds its own inference.",
      "No main-model call"
    ],
    [
      "14 · Collect",
      "Capture success, errors and logs; run post-tool hooks; save full artifacts and select useful excerpts. A scripted retry can execute without asking the model.",
      "No inference for ordinary processing"
    ],
    [
      "15 · Update context",
      "Retain required outputs and tool results; prune or compact as configured. Model-generated summaries may add a request; provider-managed compaction can occur inside one API request.",
      "Compaction is implementation-dependent"
    ],
    [
      "16 · Continue / finish",
      "With new evidence, return to Assemble and Invoke: that is the NEXT call. On a candidate final answer, run completion checks, then deliver and persist. Failed checks can feed the loop again.",
      "Next invocation only if continuing"
    ]
  ],
  "sources": [
    "https://developers.openai.com/api/docs/guides/function-calling",
    "https://developers.openai.com/api/docs/guides/agents/running-agents",
    "https://developers.openai.com/api/docs/guides/compaction"
  ],
  "note": "Hypothetical client-managed loop; ordering and hooks vary by harness. The six-call example has 8 tool executions: 3 + 1 + 1 + 1 + 2 + 0. Call 4 requests one CLI script containing patch application and unit tests. Commands inside a script are not separate harness tool requests. A hosted agent endpoint can wrap multiple internal model calls. API spend follows reported usage; subscription quotas are separate."
};
