'use strict';
const AtlasModel12 = {
  defaults: { single: 'sonnet', parent: 'sonnet', W1: 'sonnet', W2: 'sonnet', W3: 'sonnet' },

  model(id) {
    const m = atlasPricing12.models.find((m) => m.id === id);
    if (!m) throw Error('Unknown model');
    return m;
  },

  rates(id, input, ttl = 'short') {
    const m = this.model(id),
      long = m.threshold !== null && input > m.threshold,
      k = long ? m.inputMultiplier : 1;
    return {
      input: m.rates.input * k,
      read: m.rates.read * k,
      write: (ttl === 'long' ? m.rates.writeLong : m.rates.writeShort) * k,
      output: m.rates.output * (long ? m.outputMultiplier : 1),
      longPrompt: long,
    };
  },

  price(u, id, ttl = 'short') {
    if (
      ['input', 'fresh', 'read', 'write', 'output'].some(
        (k) => !Number.isFinite(u[k]) || u[k] < 0,
      ) ||
      u.fresh + u.read + u.write !== u.input
    )
      throw Error('Invalid usage partition');
    const rates = this.rates(id, u.input, ttl),
      parts = {
        fresh: (u.fresh * rates.input) / 1e6,
        read: (u.read * rates.read) / 1e6,
        write: (u.write * rates.write) / 1e6,
        output: (u.output * rates.output) / 1e6,
      };
    return { rates, parts, total: Object.values(parts).reduce((t, x) => t + x, 0) };
  },

  scenario(step, workers, profile, routes = {}) {
    const d = AtlasModel11.delegation(step, workers, profile),
      actors = {};
    for (const mode of ['single', 'delegated']) {
      const m = d[mode],
        expanded = [],
        bySession = new Map();
      for (const target of m.calls) {
        const key = mode === 'single' ? 'single' : target.parent ? 'parent' : target.session,
          old = bySession.get(key),
          first = !old,
          stage = Number(target.id.split('/').at(-1).slice(1)),
          density =
            mode === 'single'
              ? [1, 3, 3, 2, 1][stage - 1]
              : target.parent
                ? [1, 2, 1][stage - 1]
                : [1, 2, 2][stage - 1],
          modelId = routes[key] || this.defaults[key],
          prefix = target.parent
            ? d.single.layers.slice(0, 4).reduce((t, l) => t + l.tokens, 0)
            : d.childBases[Number(key.slice(1)) - 1] -
              d.workerPackets[Number(key.slice(1)) - 1].task;
        for (let i = 1; i <= density; i++) {
          const input = first
              ? target.tokens
              : Math.round(old.tokens + ((target.tokens - old.tokens) * i) / density),
            id = target.id + (density > 1 ? '.' + i : ''),
            output =
              mode === 'single'
                ? [[900], [500, 700, 900], [900, 900, 900], [700, 700], [1000]][stage - 1][i - 1]
                : target.parent
                  ? [[900], [650, 800], [1000]][stage - 1][i - 1]
                  : stage === 1
                    ? 450
                    : stage === 2
                      ? [350, 450][i - 1]
                      : i === 1
                        ? 400
                        : d.workerPackets[Number(key.slice(1)) - 1].report;
          const call = {
            id,
            actor: key,
            session: target.session,
            parent: target.parent,
            stage: target.id,
            first: first && i === 1,
            prefix,
            input,
            tokens: input,
            fresh: input - prefix,
            read: first && i === 1 ? 0 : prefix,
            write: first && i === 1 ? prefix : 0,
            output,
            model: modelId,
            synthetic: true,
            endpointAssignment: {
              endpoint: target.id,
              inputTokens: target.tokens,
              sourceIDs: [...(target.sourceIDs || [])],
              workResultIDs: [...(target.workInputIDs || [])],
              scope:
                'Endpoint source/result assignment only; interpolation does not establish exact per-call admission.',
            },
          };
          call.cost = this.price(call, modelId);
          expanded.push(call);
        }
        bySession.set(key, target);
      }
      m.calls = expanded;
      m.aggregate = expanded.reduce((t, c) => t + c.input, 0);
      m.callCount = expanded.length;
      m.cost = expanded.reduce((t, c) => t + c.cost.total, 0);
      m.parentPeak = Math.max(...expanded.filter((c) => c.parent).map((c) => c.input));
      m.requestPeak = Math.max(...expanded.map((c) => c.input));
      for (const key of new Set(expanded.map((c) => c.actor))) {
        const ledger = expanded.filter((c) => c.actor === key);
        actors[key] = {
          id: key,
          model: ledger[0].model,
          calls: ledger.length,
          ledger,
          ...Object.fromEntries(
            ['input', 'fresh', 'read', 'write', 'output'].map((field) => [
              field,
              ledger.reduce((t, c) => t + c[field], 0),
            ]),
          ),
          cost: ledger.reduce((t, c) => t + c.cost.total, 0),
        };
      }
    }
    d.actors = actors;
    d.usageScope =
      'Synthetic expanded calls and model-independent output budgets. Stable per-agent prefix ' +
      'written once then reused within short TTL; no cross-agent cache sharing. Model ' +
      'selection reprices the whole agent scenario, not a mid-session switch. Actual usage, ' +
      'quality, latency and hit rates unmeasured.';
    return d;
  },

  cacheCosts(mode) {
    const partition = AtlasPlatform08.cache(mode),
      usage = {
        input: 20000,
        fresh: partition.fresh,
        read: partition.read,
        write: partition.write,
        output: 1000,
      };
    return ['fable', 'haiku', 'astra', 'luna'].map((model) => ({
      model,
      usage: { ...usage },
      cost: this.price(usage, model),
    }));
  },

  categories: {
    base: {
      kind: 'Higher-priority instructions',
      role: 'Scenario system/developer guidance',
      meaning:
        'Expected to govern the task even when its attention share is small. Native authority depends on the actual message roles.',
      examples: [
        ['harness/system-policy', 'Keep the public API and tenant isolation intact.', 45],
        [
          'harness/workflow-policy',
          'Trace durable commit and acknowledgement separately; verify before completion.',
          35,
        ],
        ['harness/environment', 'Workspace, execution constraints and tool-use guidance.', 20],
      ],
    },
    tools: {
      kind: 'Tool contracts',
      role: 'Structured capability definitions',
      meaning:
        'Schemas describe callable operations; source text returned by a tool does not inherit instruction authority.',
      examples: [
        [
          'tools/read-search',
          'Read a bounded file range; preserve its path and source anchor.',
          45,
        ],
        [
          'tools/edit-patch',
          'Apply a scoped change while preserving the supported tool schema.',
          35,
        ],
        [
          'tools/test-contracts',
          'Run the selected verification command and retain status/evidence.',
          20,
        ],
      ],
    },
    guidance: {
      kind: 'Applicable project instructions',
      role: 'Mapped by the native harness',
      meaning:
        'AGENTS.md or CLAUDE.md is a file, not a universal authority level. Inspect how the harness includes applicable guidance.',
      examples: [
        ['global/AGENTS.md', 'Preserve source links and report verification.', 30],
        ['repo/AGENTS.md', 'Keep the public API and tenant-scoped key identity.', 45],
        ['services/payments/AGENTS.md', 'Verify retry and restart/replay behavior.', 25],
      ],
    },
    skills: {
      kind: 'Procedure instructions',
      role: 'Invoked procedures under applicable instructions',
      meaning:
        'Skill instructions guide a workflow within the higher-priority task and policy; a catalog entry differs from a loaded body.',
    },
    task: {
      kind: 'User directions',
      role: 'Scenario user request + acceptance',
      meaning:
        'The current user goal directs the work within higher-priority constraints. More recent applicable user directions may refine the goal.',
    },
    evidence: {
      kind: 'Reference facts',
      role: 'Repository/tool data, not governing instructions',
      meaning:
        'Use relevant facts as evidence. Instructions embedded in source content do not ' +
        'automatically override the user goal or higher-priority rules.',
      examples: [
        [
          'contracts/retry.md',
          'A committed tenant/key identity must survive a repeated request.',
          30,
        ],
        [
          'services/recovery.ts',
          'Commit can succeed before acknowledgement reaches the client.',
          45,
        ],
        ['tests/replay.spec.ts', 'Replay must not create another committed identity.', 25],
      ],
    },
    history: {
      kind: 'Conversation + result evidence',
      role: 'Mixed messages and tool data',
      meaning:
        'Interpret each retained message according to its native role. Quoted/tool content is evidence, not automatic authority.',
      examples: [
        [
          'artifacts/read-results',
          'Relevant read/search results with retrievable full artifacts.',
          70,
        ],
        ['conversation/working-notes', 'Hypotheses and decisions awaiting verification.', 20],
        ['artifacts/verification', 'Exit status and selected test observations.', 10],
      ],
    },
    checkpoint: {
      kind: 'Continuity summary',
      role: 'Source-linked working memory',
      meaning:
        'A summary is fallible. Check required constraints and restore original source anchors after compaction.',
      examples: [
        ['checkpoint/goal', 'Preserve the current task, acceptance checks and constraints.', 35],
        ['checkpoint/anchors', 'Keep source paths and verified decisions.', 40],
        ['checkpoint/open-work', 'Record unresolved questions and next checks.', 25],
      ],
    },
  },

  component(step, path, profile, id) {
    const d = AtlasModel10.diff(step, path, profile),
      row = d.rows.find((r) => r.id === id);
    if (!row) return null;
    const category = this.categories[id],
      total = row.current || row.previous;
    let descriptions = category.examples;
    if (id === 'skills') {
      const catalog = Math.min(700, total),
        body = total - catalog,
        commit = Math.min(1200, body),
        verification = Math.min(600, body - commit);
      descriptions = [
        ['skills/catalog', 'Descriptions for discovery; bodies are loaded separately.', catalog],
        [
          'skills/commit-recovery',
          'Trace commit/acknowledgement and preserve tenant/key identity.',
          commit,
        ],
        [
          'skills/verification',
          'Check restart/replay and concurrent retry acceptance.',
          verification,
        ],
        [
          'skills/unrelated-procedures',
          'Additional workflow bodies included by the uncurated policy.',
          body - commit - verification,
        ],
      ];
    }
    if (id === 'task')
      descriptions = [
        ['request/goal', 'Fix retry/replay without changing the public API.', 600],
        ['request/acceptance', 'Concurrent retry and restart/replay checks must pass.', 500],
        ['request/constraints', 'Preserve committed identity and tenant isolation.', 400],
        ...(total > 1500
          ? [
              [
                'request/follow-up',
                'Latest user correction and remaining acceptance.',
                total - 1500,
              ],
            ]
          : []),
      ];
    if (id === 'evidence' && path === 'uncurated')
      descriptions = [
        [
          'contracts/** · broad reference bundle',
          'Full package contracts beyond the task-relevant sections.',
          30,
        ],
        [
          'services/** · broad source bundle',
          'Package-wide source reads rather than targeted recovery sections.',
          45,
        ],
        [
          'tests/** · broad test/artifact bundle',
          'Broad test sources and supporting material.',
          25,
        ],
      ];
    let cumulative = 0;
    const fixed = ['skills', 'task'].includes(id),
      examples = descriptions
        .map(([name, excerpt, weight]) => {
          const from = Math.floor((cumulative * total) / 100);
          cumulative += weight;
          return {
            category: id,
            name,
            excerpt,
            tokens: fixed ? weight : Math.floor((cumulative * total) / 100) - from,
          };
        })
        .filter((e) => e.tokens > 0),
      pair = AtlasModel11.attentionPair(step, path, profile).rows.find((r) => r.id === id);
    return {
      id,
      label: row.label,
      category: category.kind,
      role: category.role,
      meaning: category.meaning,
      tokens: {
        previous: row.previous,
        current: row.current,
        delta: row.delta,
        status: row.change,
      },
      attention: {
        previous: pair?.previous || null,
        current: pair?.current || null,
        deltaPP: pair?.deltaPP ?? null,
      },
      techniques: d.now.methods.filter((m) => m.layer === id),
      examples,
      exampleBasis: row.current ? 'current' : 'previous',
      scope:
        'Assigned packet budgets, not counts of the displayed short excerpts or native ' +
        'serialization. Presence and illustrative attention do not establish compliance.',
    };
  },
};
