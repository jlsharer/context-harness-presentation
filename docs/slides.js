const slides = [
  {
    "title": "Context & Harness Engineering",
    "description": "01 · How context selection and model routing shape validated work · HARNESS · route · budget · select · delegate · CONTEXT · rules · skills · memory · evidence · MODEL · reason · generate · request tools · TOOLS · read · search · edit · test · OUTCOME · evidence · review · accept · retry · QUALITY · • Evidence quality · • Tests + review · COST · • Model + tool calls · • Retries + integration · TIME · • Critical path · • Time to validation",
    "notes": "Prompt engineering shapes the instruction. Context engineering selects the information available for each call. Harness engineering governs the calls, tools, state, permissions and checks that complete the work. These practices overlap. This distinction describes the scope of the engineering work.",
    "view": "intro",
    "image": "slides/slide-01.png"
  },
  {
    "title": "What does an accepted result cost?",
    "description": "02 · CONTEXT · Relevant information per call · QUALITY · Correctness and rework · COST · Tokens, tools, retries · LATENCY · Critical path to validation · CONTROL · Budgets and observability · Choose the workflow that meets acceptance criteria at an acceptable total cost and time.",
    "notes": "A large context or faster individual call does not guarantee the best task outcome. Evaluate options against the same acceptance criteria.\n\nSources: Conceptual synthesis based on the presentation brief.\nAccessed 2026-11-04.",
    "view": "image",
    "image": "slides/slide-02.png"
  },
  {
    "title": "One request can become a whole team’s calls",
    "description": "OpenCode v2 steps: opencode.ai/v2/docs/agents · 03 · HYPOTHETICAL  ·  K TOKENS  ·  NO CACHE · CALL 1 · 49K base + 1K goal · 50K in → 2K out · READ · tool returns 13K · not an inference · CALL 2 · 50K + 2K + 13K · 65K in → 2K out · TEST · tool returns 18K · not an inference · CALL 3 · 65K + 2K + 18K · 85K in → 2K out · MODEL CALL · Provider inference; output may return as later input. · HARNESS STEP · One user turn can span all three calls. OpenCode’s step limit counts model steps. · TOOL RESULT · 13K / 18K enter the next input if retained. · Retained prior output is billed as later input; pruning, summaries and cache can change this.",
    "notes": "A model call (model invocation) means one provider inference request and its response, as observed by the harness. Streaming chunks belong to the same call. One user-triggered run can contain parent and child requests. Delegation launches or assigns a worker session, which can loop through several model calls and tool actions. Provider-managed tools can hide internal work inside a request, so reconcile the reported usage and tool fees rather than guessing the number of hidden passes.\n\nHypothetical walkthrough. Parent A processes 20K input and produces 2K output ($0.06). Delegation assembles a separate 50K input for child B, including 49K base and 1K task. Child B produces 2K output, then reads 13K of files. Child C input is 50+2+13=65K. C produces 2K output, then receives 18K of test results. Child D input is 65+2+18=85K. D produces a 2K summary. The parent receives that summary plus 1K of selected evidence, giving E input 20+2+2+1=25K. E produces 2K output ($0.07). B/C/D cost $0.12/$0.15/$0.19. All five calls total 245K input +10K output = $0.59 at $2/M input and $10/M output. Peak one-call input is 85K. No cache, separate tool fees or retries.\n\nA new user message can introduce more input and more work, but user-turn count alone does not determine token-priced API spend. Product quotas may weight turns or requests differently. Record actual usage.\n\nSources checked 4 November 2026\nhttps://code.claude.com/docs/en/sub-agents\nhttps://developers.openai.com/api/docs/guides/function-calling\nhttps://developers.openai.com/api/docs/guides/conversation-state",
    "view": "calls",
    "image": "slides/slide-03.png"
  },
  {
    "title": "Six ways to control the next model call",
    "description": "Claude Code hooks · OpenAI prompt caching · MCP resources · OpenCode agents and compaction · 15 · Retrieve · + · Bring in missing evidence · Read the contract for a failing endpoint. · Prune · + · Shorten the next input · Keep the failing lines from a long test log. · Compact · + · Summarize older work · Carry an unresolved test across a summary. · Cache · + · Reuse a stable input prefix · Share the same review rubric across calls. · Checkpoint · + · Save a durable result · Resume a review from a commit and test log. · Isolate · + · Bound a worker’s scope · Give a reviewer read-only access to a diff. · Select a card in Slide Show to explore a worked example. In the PDF, open the note beside the card.",
    "notes": "Each card opens an optional worked example. Close the example to return here. In a linear presentation advance to the task ledger. Retrieve — Trigger. A test expects HTTP 409. The trace shows HTTP 200. Action. Use search or an MCP resource to read the versioned contract. Put the conflict clause and its source in the next call. Check. Match the endpoint and API version. Keep the source reference so the reviewer can reopen it.\nPrune — Trigger. A test produced thousands of lines. One assertion failed. Action. Save the full log as an artifact. A harness filter selects the assertion, stack frame and artifact path for the next call. Check. Open the saved log if the excerpt is inconclusive. The filter changes the next input. Stored history follows its own retention policy.\nCompact — Before. Save the failing test ID and the acceptance rule. Where supported, name both in the instructions that guide the summary. After. In Claude Code, a SessionStart hook matching compact can add the saved test ID and rule to the next request. PostCompact can log the summary. Check. Have the agent identify the open test and rerun it. Restore missing details from the saved artifact.\nCache — Trigger. Each review uses the same instructions and tool definitions, followed by a different patch. Action. Put identical setup first and the changing diff last. Choose an available cache retention period that fits the interval between reviews. Check. Inspect reported cache-read tokens and effective cost. A hit can reduce price or latency while the prefix still occupies context.\nCheckpoint — Trigger. A patch passes unit tests. Integration tests still need to run. Action. At that stage boundary, write a checkpoint with the commit SHA, test-log path, acceptance rule and pending integration command. Check. On resume, compare the current commit to the saved SHA. Rerun stale tests before reusing their results.\nIsolate — Trigger. A security review can proceed independently of implementation. Action. Give the worker the diff and threat model, read-only permissions and a time budget. Ask for findings with file, line and evidence. Check. The orchestrator validates the findings and decides which fixes to assign. The next worker receives only the relevant records.\n\nSources: https://modelcontextprotocol.io/specification/2025-11-25/server/resources\nhttps://opencode.ai/v2/docs/compaction\nhttps://code.claude.com/docs/en/hooks\nhttps://developers.openai.com/api/docs/guides/prompt-caching\nhttps://opencode.ai/v2/docs/agents\nAccessed 2026-11-04.",
    "view": "lifecycle",
    "image": "slides/slide-15.png"
  },
  {
    "title": "The harness owns the execution loop",
    "description": "05 · RECEIVE · objective + constraints · ASSEMBLE · select relevant context · INFER · model call + output · ACT · execute permitted tools · UPDATE · capture results + state · REPEAT · recheck or finish · ▲ · Budgets, permissions and acceptance tests apply throughout",
    "notes": "A model invocation produces output and possibly tool calls. The harness enforces permissions, stores tool results, updates task state, and selects what enters the next call. Packaging varies by provider.\n\nSources: Conceptual synthesis based on the presentation brief.\nAccessed 2026-11-04.",
    "view": "image",
    "image": "slides/slide-05.png"
  },
  {
    "title": "How the harness assembles a model request",
    "description": "OpenAI context: developers.openai.com/api/docs/guides/conversation-state · 06 · SYSTEM INSTRUCTIONS · Policy + model-specific guidance · SOURCE: provider / platform / developer · HARNESS · Agent role + tool schemas · SOURCE: harness configuration · SKILLS · Instructions + references · SOURCE: installed skill files · MEMORY + TRACES · Preferences · decisions · summaries · SOURCE: memory store / trace artifacts · TASK · Goal + user messages · SOURCE: user / workflow state · EVIDENCE · Files + tool results · SOURCE: repo / search / tools · Model weights also shape behavior but are not prompt tokens; sources apply when loaded for a session.",
    "notes": "This diagram is a common packaging pattern, not a universal serialization order or authority ranking. System/developer instructions, tool definitions and messages may be separate API fields. Relevant skills and memory can be loaded at different points. Conversation messages retain their chronology; tool results follow the tool requests they answer. Tool schemas often occupy a stable prefix. Reuse of that prefix requires provider cache eligibility. A harness may reference provider-managed state rather than resend all tokens. This applies to parent and child sessions; their selected contents can differ. Model weights shape behavior outside prompt content.\n\nSources checked 4 November 2026\nhttps://developers.openai.com/api/docs/guides/conversation-state\nhttps://platform.claude.com/docs/en/build-with-claude/prompt-caching",
    "view": "assembly",
    "image": "slides/slide-06.png"
  },
  {
    "title": "From the workspace to one model’s view",
    "description": "OpenAI context: developers.openai.com/api/docs/guides/conversation-state · 07 · AVAILABLE CANDIDATES · Stored history · files · memories · current instructions and user request · HARNESS SELECTS + PACKAGES · Retrieve, filter or compact; add required current instructions · ACTIVE CONTEXT · ONE CALL · the effective input to the model now · Conceptual containment: candidates include transient instructions; provider-managed state may be referenced.",
    "notes": "The workspace is the candidate pool. Saved files and trace artifacts can remain outside active context. The harness selects excerpts, compacts prior conversation, and combines them with required instructions and current task state. A stored resource becomes usable evidence when its content is supplied or accessed through a supported mechanism; the existence of a file does not itself expose its contents to the model. The diagram shows transformations, not strictly nested byte-for-byte subsets. The active packet and reserved generation headroom must fit the provider/model limits. Weights are separate. Each parent or child call gets its own effective context.\nhttps://developers.openai.com/api/docs/guides/conversation-state",
    "view": "scope",
    "image": "slides/slide-07.png"
  },
  {
    "title": "Long context can change retrieval accuracy",
    "description": "Liu et al., Lost in the Middle (TACL 2024): aclanthology.org/2024.tacl-1.9/ · 09 · ILLUSTRATIVE ONLY  ·  NOT MEASURED MODEL ATTENTION · Y: task evidence-use success (illustrative) · start · middle · end · CAPACITY · How much fits. · RETRIEVAL · Observed accuracy using a relevant fact. · X: evidence position  ·  Example: correctly use a fact to answer; bars are invented.",
    "notes": "These invented bars depict possible accuracy on a controlled task requiring the model to find and use a relevant fact, not an empirical curve for any specific model or a visualization of attention weights. Liu et al. document such position effects in tested models and tasks. Evaluate normalized position, context length, evidence type, multi-hop reasoning and uncertainty.\n\nSources: Liu et al., Lost in the Middle (TACL 2024): aclanthology.org/2024.tacl-1.9/\nAccessed 2026-11-04.",
    "view": "image",
    "image": "slides/slide-09.png"
  },
  {
    "title": "Model API pricing: thresholds matter",
    "description": "OpenAI: developers.openai.com/api/docs/pricing  ·  Anthropic: platform.claude.com/docs/en/about-claude/pricing · 10 · MODEL · WINDOW · BASE IN / OUT · THRESHOLD · LONG IN / OUT · GPT-6 Astra · 1.05M · $10 / $50 · >272K · $20 / $75 · GPT-6.1 Sol · 1.05M · $2 / $10 · >272K · $4 / $15 · GPT-6.1 Terra · 1.05M · $1 / $5 · >272K · $2 / $7.50 · GPT-6 Luna · 1.05M · $0.10 / $0.50 · >272K · $0.20 / $0.75 · GPT-5.6 Luna · 1.05M · $0.20 / $1.20 · >272K · $0.40 / $1.80 · Claude Opus 5.5 · 1M · $4 / $20 · None in 1M · Same · Claude Sonnet 5.5 · 1M · $2 / $10 · None in 1M · Same · Claude Haiku 5.5 · 1M · $0.10 / $0.50 · >100K · $0.50 / $2.50 · USD / million tokens · prompt threshold applies to the full request · standard API tier · 04 Nov 2026 · cache, regional, service-tier and tool charges differ; app quotas are separate.",
    "notes": "OpenAI listed models apply the long rate to the full request above 272K input tokens: 2x input/cache and 1.5x output. The table shows uncached input and output, not cache read/write pricing. Claude Opus and Sonnet 5.5 use standard rates across the documented 1M window; Haiku 5.5 raises rates for full requests above 100K, counting cache reads and writes in threshold. Verify provider, route and current pricing.\n\nSources: https://developers.openai.com/api/docs/models/gpt-6-astra; https://developers.openai.com/api/docs/models/gpt-6.1-sol; https://developers.openai.com/api/docs/models/gpt-6.1-terra; https://developers.openai.com/api/docs/models/gpt-6-luna; https://developers.openai.com/api/docs/models/gpt-5.6-luna; https://platform.claude.com/docs/en/about-claude/pricing\nAccessed 2026-11-04.",
    "view": "image",
    "image": "slides/slide-10.png"
  },
  {
    "title": "Price the tokens each call actually uses",
    "description": "OpenAI pricing: developers.openai.com/api/docs/models/compare · 11 · C = Σᵢ (Uᵢ × Pᵤ,ᵢ + Rᵢ × Pᵣ,ᵢ + Oᵢ × Pₒ,ᵢ) / 1,000,000 + extras · C · API cost in USD · i · each model call · U / R / O · uncached input / cache-read / output tokens · P · USD per million for category and call · extras · cache writes, tools, infrastructure, if applicable · 20 calls × 10K  =  200K · 5 calls × 100K  =  500K · Fewer calls can use more tokens. API USD ≠ subscription quota consumed.",
    "notes": "Token categories must be mutually exclusive for billing. U is uncached input excluding input separately billed as cache writes. R is cache-read input. W is input billed as a cache write where that category exists. O is billed output, including reasoning when reported within output. P is the applicable USD per million tokens rate for the category and call. Sum all observed parent and child model requests and add tool/storage/service fees. Apply threshold, tier and regional rates as appropriate.\n\nHypothetical five-call run from slide 3. U=245000, R=0, W=0, O=10000. Input $0.49 + output $0.10 = $0.59. The task passes its acceptance checks, yielding $0.59 for one accepted task in this example. For a cohort, include failed attempts and retries in spend and divide by accepted tasks. Measure request-to-validation time separately. Subscription quota must be recorded in its own product units.\nhttps://developers.openai.com/api/docs/guides/prompt-caching\nhttps://platform.claude.com/docs/en/about-claude/pricing",
    "view": "economics",
    "image": "slides/slide-11.png"
  },
  {
    "title": "Where should each skill run?",
    "description": "Agent Skills overview · agentskills.io/home   |   Anthropic · Building effective agents · 14 · A skill packages one procedure. A workflow connects procedures by passing defined inputs and outputs. · SEQUENTIAL · One session · Review a small patch · Review skill · diff → findings[] · Keep the diff in one session. A local fix skill can consume the findings next. · Low setup cost. Later calls may reread a growing history. · SEQUENTIAL · Separate workers · Review, then fix a patch · Review → Fix · findings[] → patch_ref · The fix worker needs the review result. Check the handoff before it starts. · Scoped inputs can reduce rereads. Both worker setup and handoff add cost and time. · PARALLEL · Separate workers · Review independent patches · Review A  +  Review B · findings[] + findings[] → merge · Both workers can start at once. The merge waits for the slower review. · Overlap can cut elapsed time. Count duplicate setup, conflicts and merge work. · Handoff example   findings[] = file, line, severity and evidence for each issue. · Route each call separately. A lower-cost model can triage findings before a specialist reviews uncertain cases.",
    "notes": "A skill is reusable procedure content. It can be invoked repeatedly or require several model calls and tools. A workflow defines how outputs satisfy downstream inputs. Formal input/output schemas are a design choice in these examples. Review takes a diff reference and returns findings, with file (string), line (integer), severity (enum) and evidence (string). Fix validates the records and returns patch_ref and test_refs. The same workflow can run inside one session. Separate workers add isolation, concurrency or specialized permissions. A parallel merge should deduplicate by file and line and resolve conflicting findings. Routing is a separate per-call choice in all three modes. Compare topology on matched tasks and include failed attempts.\n\nSources: https://agentskills.io/home; https://www.anthropic.com/research/building-effective-agents\nAccessed 2026-11-04.",
    "view": "image",
    "image": "slides/slide-14.png"
  },
  {
    "title": "One session vs isolated workers: token snapshots",
    "description": "13 · HYPOTHETICAL INPUT SNAPSHOTS  ·  K TOKENS · System · Harness + tools · Skills + memory · Task + evidence · SINGLE · CALL 1 · 50K · CALL 2 · 65K · CALL 3 · 85K · CALL 4 · 110K · 310K input + 10K output = $0.72 · ORCHESTRATOR · 60K · delegates ↓ · WORKERS · RESEARCH · 45K · PLAN · 48K · IMPLEMENT · 52K · VALIDATE · 50K · 255K input incl. orchestrator + 14K output = $0.65 · Equal-width bars show mix, not total size · hypothetical rates · no cache.",
    "notes": "Each colored bar is one hypothetical call, scaled internally to its own total; widths are normalized to show the share, not total-token comparison. Platform/system / harness and tools / skills and memory / task and evidence in K: single [8,16,8,18], [8,16,8,33], [8,16,8,53], [8,16,8,78], sum 310K. Workers [8,16,6,15], [8,16,6,18], [8,16,6,22], [8,16,6,20], plus orchestrator [8,16,8,28] = 255K. At $2/M input and $10/M output: $0.72 vs $0.65. No caching, fees, or quality equivalence assumed. The model processes the context assembled by the harness; model weights are not prompt tokens.\n\nSources: Conceptual synthesis based on the presentation brief.\nAccessed 2026-11-04.",
    "view": "image",
    "image": "slides/slide-13.png"
  },
  {
    "title": "Pick the simplest path that meets the goal",
    "description": "17 · SMALL FIX · ONE SESSION · shared context → edit → test · AUDIT + BUILD · SEQUENTIAL AGENTS · research → implement → validate · INDEPENDENT REVIEWS · PARALLEL AGENTS · security + UX → integrate · Route by task difficulty → validate → escalate or retry when needed · For every handoff: objective + scope + budget → evidence + result + uncertainty.",
    "notes": "These are illustrative task examples. Choose topology based on coupling, isolation and critical path, and select models based on task risk and evaluation. Validate results, account for coordination, and escalate after failures. Preserve artifacts and evidence rather than forwarding entire transcripts.\n\nSources: Conceptual synthesis based on the presentation brief.\nAccessed 2026-11-04.",
    "view": "image",
    "image": "slides/slide-17.png"
  }
];
const controls = [
  {
    "name": "Retrieve",
    "action": "Bring in missing evidence",
    "example": "Read the contract for a failing endpoint.",
    "title": "Which contract applies to this failure?",
    "steps": [
      [
        "Trigger",
        "A test expects HTTP 409. The trace shows HTTP 200."
      ],
      [
        "Action",
        "Use search or an MCP resource to read the versioned contract. Put the conflict clause and its source in the next call."
      ],
      [
        "Check",
        "Match the endpoint and API version. Keep the source reference so the reviewer can reopen it."
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
