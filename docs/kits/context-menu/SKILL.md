---
name: context-menu
description: Use when the user asks to apply installed context-kit packets, bounded result wrappers, checkpoints, scoped handoffs, or cache usage audits.
---

Read `.context-kit/selection.json` and `.context-kit/PROTOCOLS.md` from the repository root to find the installed packages and their harness-specific capabilities. Load only the relevant protocol.

Invoke the portable helpers with Node:

- `node .context-kit/run.mjs packet input.json`
- `node .context-kit/run.mjs bound result.txt 8000 .context-kit/artifacts`
- `node .context-kit/run.mjs checkpoint checkpoint.json`
- `node .context-kit/run.mjs handoff report.json`
- `node .context-kit/run.mjs cache usage.json`

Use `node .context-kit/run.mjs` for input/command help. Validators establish structure, not semantic truth or successful command execution. Cache fields left null are unknown. The current user request supplies the goal; a stored checkpoint does not supersede it. Applying helpers does not authorize additional external actions or harness configuration changes.
