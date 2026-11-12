const atlasResearch = {
  "provider": {
    "id": "frontier-graphwalks",
    "sourceId": "gemini-carbon-card",
    "methodSourceId": "gemini-carbon-method",
    "sourceUrl": "https://deepmind.google/models/model-cards/gemini-4-carbon/",
    "methodUrl": "https://deepmind.google/models/evals-methodology/gemini-4-carbon/",
    "locator": "Results table, Long context / GraphWalks; methodology p3",
    "publishedCohort": "October 2026 results; model card updated 2026-11-10",
    "checkedOn": "2026-11-11",
    "metric": "BFS F1 (%)",
    "task": "Return graph nodes at a requested breadth-first-search depth. F1 balances correct returned nodes and required nodes recovered.",
    "context": "256K\u20131M token subset; 200 GraphWalks problems",
    "method": "Google DeepMind reports all GraphWalks results self-computed. Highest/max available thinking settings; best available reasoning where maximum results unavailable.",
    "series": [
      {
        "provider": "Google DeepMind",
        "model": "Gemini 4 Carbon",
        "value": 96.2
      },
      {
        "provider": "OpenAI",
        "model": "GPT-6 Astra",
        "value": 71.8
      },
      {
        "provider": "Anthropic",
        "model": "Claude Opus 5.5",
        "value": 66.8
      }
    ],
    "limits": "One published cohort and task, not an overall model ranking, internal attention measurement, exact-answer accuracy, or a length-by-length curve. No local experiment or equal token-budget claim."
  },
  "position": {
    "id": "position-accuracy",
    "sourceId": "lost-middle",
    "sourceUrl": "https://arxiv.org/html/2307.03172v3",
    "locator": "Appendix G.2, Table 6",
    "paperVersion": "v3, 20 November 2023",
    "checkedOn": "2026-11-11",
    "metric": "Question-answering accuracy (%)",
    "task": "Multi-document question answering, 20 retrieved documents; move the answer-containing document.",
    "positions": [
      0,
      4,
      9,
      14,
      19
    ],
    "series": [
      {
        "label": "GPT-3.5-Turbo",
        "values": [
          75.8,
          57.2,
          53.8,
          55.4,
          63.2
        ]
      },
      {
        "label": "Claude 1.3",
        "values": [
          59.9,
          55.9,
          56.8,
          57.2,
          60.1
        ]
      }
    ],
    "limits": "Historical model/task evidence of position sensitivity. Zero-based document indices, not token positions. Not current-model estimates, attention weights, or a universal curve.",
    "scoring": "An answer is correct when a listed acceptable answer occurs in the generated response; not whole-output exact match."
  },
  "hooks": {
    "checkedOn": "2026-11-11",
    "opencodeVersion": "V2 documented API; match installed version before copying examples",
    "sources": {
      "opencode": "https://opencode.ai/docs/build/plugins/server/",
      "opencodeEvents": "https://opencode.ai/docs/api",
      "claude": "https://code.claude.com/docs/en/hooks"
    },
    "entries": [
      {
        "id": "start",
        "label": "Parent session start",
        "purpose": "Prepare a small project policy and restore sourced task state before the first prompt.",
        "opencode": "session.created event + orchestration before prompting",
        "claude": "SessionStart",
        "capability": "Observe creation; initialize through orchestration. Claude can add startup context.",
        "limit": "Observing an OpenCode event does not itself rewrite or block the first request."
      },
      {
        "id": "prompt",
        "label": "User prompt admitted",
        "purpose": "Attach task-specific evidence and explicit acceptance checks.",
        "opencode": "session.hook(\"prompt\")",
        "claude": "UserPromptSubmit",
        "capability": "OpenCode transforms admitted input; Claude adds context alongside the prompt.",
        "limit": "Prompt admission is not every model invocation; Claude UserPromptSubmit does not replace the prompt."
      },
      {
        "id": "dispatch",
        "label": "Before each model call",
        "purpose": "Select the outgoing context, tools and request options for the current step.",
        "opencode": "session.hook(\"context\")",
        "claude": "No identical general per-request hook asserted here",
        "capability": "OpenCode agent-loop hook includes tool-driven continuations.",
        "limit": "Outgoing changes do not rewrite persisted history. Auxiliary request kinds have separate hooks."
      },
      {
        "id": "pretool",
        "label": "Before tool use",
        "purpose": "Bound requested files, arguments and output scope before execution.",
        "opencode": "tool.hook(\"execute.before\")",
        "claude": "PreToolUse",
        "capability": "Inspect or change tool input; Claude decision controls are event-specific.",
        "limit": "A tool invocation is not itself another model invocation."
      },
      {
        "id": "posttool",
        "label": "After tool use",
        "purpose": "Select useful result evidence, attach provenance and record an external artifact.",
        "opencode": "tool.hook(\"execute.after\")",
        "claude": "PostToolUse",
        "capability": "Inspect successful/failed execution; documented result transformation.",
        "limit": "Keep the original result retrievable; preserve the native tool/result contract."
      },
      {
        "id": "child",
        "label": "Child session start",
        "purpose": "Apply a scoped task and evidence packet in an independently tracked child context.",
        "opencode": "Create child \u2192 apply policy \u2192 prompt (orchestration)",
        "claude": "SubagentStart",
        "capability": "Claude adds child context; OpenCode initialization is an explicit orchestration step.",
        "limit": "Fork is different: OpenCode copies history before its fork hook. Do not assume a fresh child inherits nothing or everything."
      },
      {
        "id": "precompact",
        "label": "Before compaction",
        "purpose": "Include decisions, invariants, unresolved work and artifact references in the summary instructions.",
        "opencode": "session.hook(\"compaction\")",
        "claude": "PreCompact",
        "capability": "Influence the summary request; Claude stdout supplies compaction instructions.",
        "limit": "Compaction may lose details. Validate anchors and required constraints afterward."
      },
      {
        "id": "postcompact",
        "label": "After compaction",
        "purpose": "Record the checkpoint, verify surviving constraints, and schedule restoration before the next request.",
        "opencode": "session.compaction.ended event \u2192 next context hook",
        "claude": "PostCompact; SessionStart(source=compact) for restoration",
        "capability": "Observe the completed summary; next request is a separate restoration boundary.",
        "limit": "PostCompact is observational; it cannot edit the completed compaction result."
      }
    ]
  }
};
