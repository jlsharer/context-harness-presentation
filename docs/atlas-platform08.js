'use strict';
const AtlasPlatform08 = {
  examples: {
    'tool/read_contract.json': JSON.stringify(
      {
        name: 'read_contract',
        description:
          'Read the requested section of a contract; return its source anchor and artifact path.',
        input_schema: {
          type: 'object',
          properties: { path: { type: 'string' }, anchor: { type: 'string' } },
          required: ['path', 'anchor'],
        },
      },
      null,
      2,
    ),
    'harness/policy-fragment.txt':
      'Authored harness policy fragment: preserve the current goal, required instruction ' +
      'authority and tool contracts. Distinguish source facts from hypotheses; verify ' +
      'acceptance before reporting success.',
    'global/AGENTS.md':
      'Keep source claims separate from hypotheses. Report the exact verification commands and results.',
    'repo/AGENTS.md':
      'Shared service contracts live in contracts/. Preserve public API and tenant isolation. Run the relevant package tests.',
    'repo/services/AGENTS.md':
      'Service changes require restart/replay tests. Use the service test command from its package manifest.',
    'repo/services/payments/AGENTS.md':
      'For payments, distinguish durable commit from acknowledgement failure. Check duplicate tenant/key identity.',
    'repo/services/payments/AGENTS.override.md':
      'Payments override for Codex: use npm run test:payments. Preserve committed identity on retry.',
    'global/CLAUDE.md':
      'Keep source claims separate from hypotheses. Report exact verification commands and results.',
    'repo/CLAUDE.md':
      'Preserve the public API. Consult contracts/ before editing service behavior.',
    'repo/services/CLAUDE.md': 'Service changes require restart/replay tests.',
    'repo/services/payments/CLAUDE.md':
      'Payments: inspect durable commit and acknowledgement failure separately; test concurrent retries.',
    'repo/.agents/skills/commit-recovery/SKILL.md':
      'name: commit-recovery\ndescription: Use when retry/replay behavior crosses a durable ' +
      'commit boundary.\nRead relevant API/storage contracts, trace commit and acknowledgement ' +
      'separately, then validate concurrent retry and restart recovery.',
  },

  loading(harness = 'claude', launch = 'root', phase = 'startup') {
    const h = ['claude', 'opencode', 'codex'].includes(harness) ? harness : 'claude',
      nested = launch === 'payments',
      explore = phase === 'explore';
    let paths, note;
    if (h === 'claude') {
      paths = ['global/CLAUDE.md', 'repo/CLAUDE.md'];
      if (nested || explore)
        paths.push('repo/services/CLAUDE.md', 'repo/services/payments/CLAUDE.md');
      note =
        'Ancestor files load at launch; deeper files enter when Claude works in their directory. Imports and path rules can add context.';
    } else if (h === 'opencode') {
      paths = nested
        ? [
            'global/AGENTS.md',
            'repo/services/payments/AGENTS.md',
            'repo/services/AGENTS.md',
            'repo/AGENTS.md',
          ]
        : ['global/AGENTS.md', 'repo/AGENTS.md'];
      if (!nested && explore)
        paths.push('repo/services/payments/AGENTS.md', 'repo/services/AGENTS.md');
      note =
        'V2: global first, then workspace toward ancestors. Reading/listing below the workspace discovers nested guidance nearest-first.';
    } else {
      paths = ['global/AGENTS.md', 'repo/AGENTS.md'];
      if (nested)
        paths.push('repo/services/AGENTS.md', 'repo/services/payments/AGENTS.override.md');
      note =
        'Documented startup chain: global then root→launch directory; one preferred file per ' +
        'directory. A later shell cd is not a documented chain rebuild.';
    }
    return {
      harness: h,
      globalLocation: {
        claude: '~/.claude/CLAUDE.md',
        opencode: '~/.config/opencode/AGENTS.md',
        codex: '~/.codex/AGENTS.md (or AGENTS.override.md)',
      }[h],
      skillLocation: {
        claude: '.claude/skills',
        opencode: '.opencode/skills',
        codex: '.agents/skills',
      }[h],
      launch: nested ? 'payments' : 'root',
      phase: explore ? 'explore' : 'startup',
      loaded: paths.map((path) => ({ path, text: this.examples[path] })),
      note,
      scope:
        'Authored example tree; documented behavior with default settings, not a runtime capture. Filename scope is not a provider message role.',
    };
  },

  cache(value = 'reuse') {
    const mode = ['cold', 'reuse', 'edit', 'expired'].includes(value) ? value : 'reuse',
      read = mode === 'reuse' ? 14000 : mode === 'edit' ? 8000 : 0,
      write = 14000 - read;
    return {
      mode,
      total: 20000,
      read,
      write,
      fresh: 6000,
      stablePrefix: 14000,
      editAt: mode === 'edit' ? 8000 : null,
      measured: false,
      note:
        'Logical eligible-prefix illustration. Real hits depend on model, settings, breakpoint ' +
        'boundaries, routing and expiry. All 20,000 tokens remain included input.',
    };
  },

  weights(query = 4, head = 0, gap = 0, content = 'base') {
    const q = Math.max(0, Math.min(4, Math.trunc(Number(query) || 0))),
      h = Number(head) === 1 ? 1 : 0,
      g = Math.max(0, Math.min(8, Number(gap) || 0)),
      roles = ['system', 'developer', 'user', 'assistant history', 'tool'],
      base = [
        [1, 0.2],
        [0.3, 1],
        [0.9, 0.7],
        [0.7, -0.2],
        [0.5, 0.8],
      ],
      rotate = (v, p) => [
        v[0] * Math.cos(p * 0.4) - v[1] * Math.sin(p * 0.4),
        v[0] * Math.sin(p * 0.4) + v[1] * Math.cos(p * 0.4),
      ],
      Q = rotate(h ? [-0.3, 1.2] : [1, 0.6], q * (g + 1));

    const rows = base.map((v, i) => {
      let key = content === 'task-match' && i === 2 ? [1.7, 0.6] : v;
      if (h) key = [0.2 * key[0] + key[1], -0.4 * key[0] + 0.3 * key[1]];
      const K = rotate(key, i * (g + 1)),
        score = (Q[0] * K[0] + Q[1] * K[1]) / Math.sqrt(2);
      return { role: roles[i], position: i * (g + 1), score, allowed: i <= q, weight: 0 };
    });
    const max = Math.max(...rows.filter((r) => r.allowed).map((r) => r.score)),
      sum = rows.filter((r) => r.allowed).reduce((n, r) => n + Math.exp(r.score - max), 0);
    for (const r of rows) r.weight = r.allowed ? Math.exp(r.score - max) / sum : 0;
    return rows;
  },
};

for (const prefix of ['.claude', '.opencode'])
  AtlasPlatform08.examples['repo/' + prefix + '/skills/commit-recovery/SKILL.md'] =
    AtlasPlatform08.examples['repo/.agents/skills/commit-recovery/SKILL.md'];
