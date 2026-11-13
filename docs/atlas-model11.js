'use strict';
const AtlasModel11 = {
  packets: [
    { name: 'Trace commit paths', tools: 1800, skills: 450, task: 1000, report: 900 },
    { name: 'Check API contracts', tools: 2400, skills: 800, task: 750, report: 650 },
    { name: 'Verify replay + tests', tools: 3300, skills: 1200, task: 1250, report: 1150 },
  ],
  stages: [
    ['Parent frames the task', 'P1 receives the goal and selected evidence.'],
    ['Send scoped inputs', 'C1: each worker receives its task and sources; no local results yet.'],
    ['Workers review initial results', 'C2: first tool results become the next worker input.'],
    ['Workers synthesize reports', 'C3: full local results support a bounded report output.'],
    ['Validate returned reports', 'Only validated report outputs become prepared parent input.'],
    ['Parent verifies acceptance', 'P2 consumes the reports plus verification evidence.'],
    ['Parent completes the task', 'P3 receives the closing results and checks the goal.'],
  ],

  delegation(value, workers = 1, profile = 'platform') {
    const step = Math.max(0, Math.min(6, Math.trunc(Number(value) || 0))),
      n = Math.max(1, Math.min(3, Math.trunc(Number(workers) || 1))),
      parent = AtlasModel10.at(2, 'managed', profile),
      evidence = parent.layers.find((l) => l.id === 'evidence').tokens;
    const workUnits = [1000, 900, 1400, 700, 1200, 800, 1600, 600, 1300, 1000, 900, 600].map(
      (tokens, index) => ({ id: 'work-' + (index + 1), index, tokens }),
    );
    let cumulative = 0;
    const sourceUnits = [14, 9, 18, 7, 16, 11, 15, 10].map((p, index) => {
      const from = Math.floor((cumulative * evidence) / 100);
      cumulative += p;
      return {
        id: 'source-' + (index + 1),
        tokens: Math.floor((cumulative * evidence) / 100) - from,
      };
    });

    const uniqueWorkIDs = workUnits.map((u) => u.id),
      uniqueSourceIDs = sourceUnits.map((u) => u.id),
      workerWorkIDs = Array.from({ length: n }, (_, i) =>
        workUnits.filter((u) => u.index % n === i).map((u) => u.id),
      ),
      workerSourceIDs = Array.from({ length: n }, (_, i) =>
        sourceUnits.filter((u, j) => j % n === i).map((u) => u.id),
      ),
      sum = (units, ids) =>
        units.filter((u) => ids.includes(u.id)).reduce((t, u) => t + u.tokens, 0),
      sourcePartitions = workerSourceIDs.map((ids) => sum(sourceUnits, ids)),
      workPartitions = workerWorkIDs.map((ids) => sum(workUnits, ids)),
      workerPackets = this.packets.slice(0, n).map((p) => ({ ...p })),
      childBases = workerPackets.map((p) => 6000 + p.tools + 4000 + p.skills + p.task),
      admittedReportTokens = step >= 4 ? workerPackets.reduce((t, p) => t + p.report, 0) : 0;

    const state = (kind, extra) => {
      const layers = [
        ...parent.layers.map((l) => ({ ...l })),
        ...(extra
          ? [
              {
                id: 'history',
                role: 'stored',
                label:
                  kind === 'single'
                    ? 'Work results + verification'
                    : 'Validated reports + verification',
                tokens: extra,
              },
            ]
          : []),
      ];
      return {
        kind,
        layers,
        total: layers.reduce((t, l) => t + l.tokens, 0),
        calls: [{ id: 'P1', session: 'parent', parent: true, tokens: parent.total }],
        prepared: step === 4,
      };
    };

    const single = state('single', [0, 0, 6000, 12000, 12000, 15000, 17000][step]),
      delegated = state(
        'delegated',
        admittedReportTokens + (step >= 5 ? 3000 : 0) + (step >= 6 ? 2000 : 0),
      );
    for (let event = 1; event <= Math.min(step, 3); event++) {
      if (event >= 2)
        single.calls.push({
          id: 'P' + event,
          session: 'parent',
          parent: true,
          tokens: parent.total + (event === 2 ? 6000 : 12000),
        });
      for (let i = 0; i < n; i++) {
        const units = workUnits.filter(
            (u) => workerWorkIDs[i].includes(u.id) && (event === 3 || (event === 2 && u.index < 6)),
          ),
          workTokens = units.reduce((t, u) => t + u.tokens, 0);
        delegated.calls.push({
          id: 'W' + (i + 1) + '/C' + event,
          session: 'W' + (i + 1),
          parent: false,
          tokens: childBases[i] + sourcePartitions[i] + workTokens,
          sourceTokens: sourcePartitions[i],
          workTokens,
          sourceIDs: workerSourceIDs[i],
          workInputIDs: units.map((u) => u.id),
          packet: workerPackets[i],
        });
      }
    }
    if (step >= 5) {
      single.calls.push({
        id: 'P4',
        session: 'parent',
        parent: true,
        tokens: parent.total + 15000,
      });
      delegated.calls.push({
        id: 'P2',
        session: 'parent',
        parent: true,
        tokens: parent.total + admittedReportTokens + 3000,
      });
    }
    if (step >= 6) {
      single.calls.push({
        id: 'P5',
        session: 'parent',
        parent: true,
        tokens: parent.total + 17000,
      });
      delegated.calls.push({
        id: 'P3',
        session: 'parent',
        parent: true,
        tokens: parent.total + admittedReportTokens + 5000,
      });
    }
    const workerWindows = step
      ? workerPackets.map((packet, index) => {
          const id = 'W' + (index + 1),
            resultTokens =
              step === 1
                ? 0
                : sum(
                    workUnits.filter((u) => step >= 3 || u.index < 6),
                    workerWorkIDs[index],
                  ),
            sourceTokens = sourcePartitions[index],
            layers = parent.layers.slice(0, 4).map((l) => ({
              ...l,
              tokens:
                l.id === 'tools' ? packet.tools : l.id === 'skills' ? packet.skills : l.tokens,
            }));
          layers.push(
            {
              id: 'task',
              role: 'policy',
              label: packet.name + ' · task + report contract',
              tokens: packet.task,
            },
            {
              id: 'evidence',
              role: 'evidence',
              label: 'Assigned source units',
              tokens: sourceTokens,
            },
          );
          if (resultTokens)
            layers.push({
              id: 'history',
              role: 'stored',
              label: 'Local tool/results context, not report output',
              tokens: resultTokens,
            });
          return {
            id,
            index,
            packet,
            status: step >= 4 ? 'returned' : 'C' + Math.min(step, 3),
            layers,
            total: layers.reduce((t, l) => t + l.tokens, 0),
            taskTokens: packet.task,
            sourceTokens,
            resultTokens,
            reportTokens: packet.report,
            inputFromParentTokens: packet.task + sourceTokens,
            reportReady: step >= 4,
          };
        })
      : [];
    for (const s of [single, delegated]) {
      s.aggregate = s.calls.reduce((t, r) => t + r.tokens, 0);
      s.parentPeak = Math.max(...s.calls.filter((r) => r.parent).map((r) => r.tokens));
      s.requestPeak = Math.max(...s.calls.map((r) => r.tokens));
    }
    single.currentAcrossSessions = single.total;
    delegated.currentAcrossSessions =
      delegated.total + workerWindows.reduce((t, w) => t + w.total, 0);
    return {
      step,
      workers: n,
      label: this.stages[step][0],
      stageDetail: this.stages[step][1],
      single,
      delegated,
      workerWindows,
      workerPackets,
      childBases,
      sourceUnits,
      workUnits,
      sourcePartitions,
      workPartitions,
      uniqueWorkIDs,
      uniqueSourceIDs,
      workerWorkIDs,
      workerSourceIDs,
      workTokens: 12000,
      admittedReportTokens,
      measured: false,
      workAssumption:
        'Authored fixed source/work units and varied worker packets; delegation + scoping, not ' +
        'an isolated measured effect. Result budgets denote retained tool/result text; report ' +
        'budgets denote generated output returned to the parent. Accrued input includes every ' +
        'dispatched initial/repeated worker call, excludes generated output fees; capability ' +
        'equivalence, acceptance, cost and latency are unmeasured.',
    };
  },

  attentionPair(step, path, profile) {
    const current = AtlasModel10.heat(step, path, profile),
      previous = step ? AtlasModel10.heat(step - 1, path, profile) : { rows: [], query: null },
      ids = [...new Set([...previous.rows.map((r) => r.id), ...current.rows.map((r) => r.id)])];
    return {
      current,
      previous,
      rows: ids.map((id) => {
        const a = previous.rows.find((r) => r.id === id) || null,
          b = current.rows.find((r) => r.id === id) || null;
        return {
          id,
          previous: a,
          current: b,
          deltaPP: a && b ? (b.weight - a.weight) * 100 : null,
          color: b ? this.heatColor(b.weight) : null,
        };
      }),
    };
  },

  heatColor(weight) {
    const colors = [
        [23, 45, 52],
        [43, 70, 88],
        [88, 77, 108],
        [132, 77, 102],
        [164, 88, 103],
      ],
      x = Math.max(0, Math.min(0.4, Number(weight) || 0)) * 10,
      i = Math.min(3, Math.floor(x)),
      t = x - i;
    return (
      'rgb(' + colors[i].map((a, j) => Math.round(a + (colors[i + 1][j] - a) * t)).join(',') + ')'
    );
  },

  referenceGroups() {
    return [
      {
        id: 'assembly',
        title: 'Context + prompt assembly',
        ids: [
          'context-engineering',
          'openai-prompt-engineering',
          'openai-gpt41-layout',
          'anthropic-long-context',
          'ordered-prompts',
          'tokenizer-reference',
        ],
      },
      {
        id: 'attention',
        title: 'Attention, authority + position',
        ids: [
          'transformer',
          'rope',
          'model-spec',
          'instruction-hierarchy',
          'attention-sinks',
          'lost-middle',
        ],
      },
      {
        id: 'evidence',
        title: 'Long-context benchmarks',
        ids: [
          'nolima',
          'graphwalks-data',
          'gemini-carbon-card',
          'gemini-carbon-method',
          'gemini-argon-card',
          'gemini-argon-method',
          'openai-accuracy',
          'cre-2026',
          'signal-2026',
        ],
      },
      {
        id: 'native',
        title: 'Native loading + agent context',
        ids: [
          'opencode-instructions',
          'opencode-skills',
          'opencode-agents',
          'claude-memory',
          'claude-context',
          'claude-subagents',
          'claude-costs',
          'claude-tool-overhead',
          'claude-skills',
          'claude-commands',
          'codex-guidance',
          'codex-skills',
          'codex-subagents',
          'codex-catalog',
          'codex-config',
          'cursor-prompting',
          'cursor-rules',
          'instruction-stack-study',
        ],
      },
      {
        id: 'lifecycle',
        title: 'Lifecycle hooks + events',
        ids: [
          'opencode-hooks',
          'opencode-events',
          'claude-hooks',
          'claude-monitoring',
          'codex-hooks',
        ],
      },
      {
        id: 'cache',
        title: 'Model pricing + provider caching',
        ids: [
          'openai-caching',
          'anthropic-cache',
          'gemini-cache',
          'openai-pricing',
          'anthropic-pricing',
          'fable52-model',
          'model-astra',
          'model-sol',
          'model-terra',
          'model-luna',
        ],
      },
    ];
  },
};
