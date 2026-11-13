'use strict';
const AtlasModel14 = {
  defaults: { single: 'opus', parent: 'opus', W1: 'haiku', W2: 'sonnet', W3: 'haiku' },
  layers: [
    ['base', 'Base instructions', 'policy'],
    ['tools', 'Tool definitions', 'execution'],
    ['guidance', 'Project guidance', 'policy'],
    ['skills', 'Loaded skills', 'policy'],
    ['task', 'Goal + acceptance', 'policy'],
    ['evidence', 'Selected sources', 'evidence'],
    ['history', 'History + results', 'stored'],
    ['checkpoint', 'Checkpoint + reports', 'stored'],
  ],

  normalize(value) {
    return Math.max(0, Math.min(22, Math.trunc(Number(value) || 0)));
  },

  event(value) {
    return atlasQA14.events[this.normalize(value)];
  },

  at(value, mode = 'managed') {
    const step = this.normalize(value),
      managed = mode !== 'manual';
    const values = [
      6000,
      managed ? 6200 : 12000,
      managed ? 2800 : 14000,
      managed ? (step >= 2 ? 1100 : 350) : 8000,
      step ? 1800 : 0,
      atlasQA14.sourceBudgets[mode === 'manual' ? 'manual' : 'managed'][step],
      atlasQA14.historyBudgets[mode === 'manual' ? 'manual' : 'managed'][step],
      step >= 15 ? (managed ? 2200 : 5200) : 0,
    ];
    const layers = this.layers
      .map(([id, label, role], i) => ({ id, label, role, tokens: values[i] }))
      .filter((l) => l.tokens);
    return {
      step,
      turn: step ? 1 : 0,
      label: this.event(step).title,
      layers,
      total: layers.reduce((n, l) => n + l.tokens, 0),
      calls: atlasQA14.events.filter((e) => e.step <= step && e.call).length + (step >= 16 ? 1 : 0),
    };
  },

  diff(step, mode) {
    const now = this.at(step, mode),
      before = now.step ? this.at(now.step - 1, mode) : null;
    return {
      now,
      before,
      rows: this.layers
        .map(([id, label, role]) => {
          const previous = before?.layers.find((l) => l.id === id)?.tokens || 0,
            current = now.layers.find((l) => l.id === id)?.tokens || 0;
          return { id, label, role, previous, current, delta: current - previous };
        })
        .filter((l) => l.current || l.previous),
    };
  },

  heat(step, mode) {
    const now = AtlasModel10.attentionFor(this.at(step, mode)),
      before = step ? AtlasModel10.attentionFor(this.at(step - 1, mode)) : null;
    return {
      ...now,
      rows: now.rows.map((row) => ({
        ...row,
        deltaPP: before?.rows.find((x) => x.id === row.id)
          ? (row.weight - before.rows.find((x) => x.id === row.id).weight) * 100
          : null,
      })),
    };
  },

  worker(value, id) {
    const step = this.normalize(value),
      w = atlasQA14.workers.find((w) => w.id === id),
      completed = w.steps.filter((s) => s <= step);
    if (!completed.length) return null;
    const progress = completed.length,
      values = [
        6000,
        w.tools,
        w.guidance,
        w.skills,
        w.task,
        w.sources,
        Math.round((w.results * progress) / w.steps.length),
        0,
      ];
    const layers = this.layers
      .map(([id, label, role], i) => ({ id, label, role, tokens: values[i] }))
      .filter((l) => l.tokens);
    return {
      id: w.id,
      name: w.name,
      purpose: w.purpose,
      layers,
      total: layers.reduce((n, l) => n + l.tokens, 0),
      progress,
      completed: step >= w.steps.at(-1),
    };
  },

  parent(value) {
    const step = this.normalize(value),
      state = this.at(step),
      reports = atlasQA14.reports.filter((r) => r.admit <= step);
    state.layers = state.layers.map((l) => ({ ...l }));
    for (const layer of state.layers) {
      if (layer.id === 'evidence') layer.tokens = Math.min(layer.tokens, step >= 6 ? 3500 : 2400);
      if (layer.id === 'history') layer.tokens = Math.min(layer.tokens, step >= 16 ? 2200 : 4200);
    }
    const reportTokens = reports.reduce((n, r) => n + r.tokens, 0);
    const checkpoint = state.layers.find((l) => l.id === 'checkpoint');
    if (checkpoint) checkpoint.tokens += reportTokens;
    else if (reportTokens)
      state.layers.push({
        id: 'checkpoint',
        label: 'Checkpoint + reports',
        role: 'stored',
        tokens: reportTokens,
      });
    state.total = state.layers.reduce((n, l) => n + l.tokens, 0);
    return state;
  },

  delegation(value, routes = {}) {
    const step = this.normalize(value),
      actors = {},
      single = [],
      delegated = [];

    const add = (actor, event, state, target) => {
      const prior = target.filter((c) => c.actor === actor),
        prefix = state.layers
          .filter((l) => ['base', 'tools', 'guidance', 'skills'].includes(l.id))
          .reduce((n, l) => n + l.tokens, 0);
      const cold =
        !prior.length ||
        event.step === 16 ||
        event.step === 18 ||
        (prior.length && (event.step - prior.at(-1).step > 4 || prior.at(-1).prefix !== prefix));
      const model = routes[actor] || this.defaults[actor];
      const call = {
        actor,
        step: event.step,
        id: actor + '/C' + (prior.length + 1),
        prefix,
        purpose: event.summary ? 'compaction summary' : 'work',
        input: state.total,
        fresh: state.total - prefix,
        read: cold ? 0 : prefix,
        write: cold ? prefix : 0,
        output: event.summary
          ? 2200
          : actor.startsWith('W')
            ? 450 + prior.length * 90
            : 700 + (event.step % 3) * 150,
        model,
      };
      call.cost = AtlasModel12.price(call, model);
      target.push(call);
    };

    for (const e of atlasQA14.events.filter((e) => e.step <= step)) {
      if (e.step === 16) {
        add('single', { ...e, summary: true }, this.at(15), single);
        add('parent', { ...e, summary: true }, this.parent(15), delegated);
      }
      if (e.call) add('single', e, this.at(e.step), single);
      const assigned = atlasQA14.workers.filter((w) => w.steps.includes(e.step));
      for (const w of assigned) add(w.id, e, this.worker(e.step, w.id), delegated);
      if (e.call && !assigned.length) add('parent', e, this.parent(e.step), delegated);
    }
    for (const [key, calls] of Object.entries({ single, delegated }))
      for (const actor of new Set(calls.map((c) => c.actor))) {
        const ledger = calls.filter((c) => c.actor === actor);
        actors[actor] = {
          id: actor,
          model: routes[actor] || this.defaults[actor],
          calls: ledger.length,
          ledger,
          latest:
            actor === 'single'
              ? this.at(step)
              : actor === 'parent'
                ? this.parent(step)
                : this.worker(step, actor),
          ...Object.fromEntries(
            ['input', 'fresh', 'read', 'write', 'output'].map((k) => [
              k,
              ledger.reduce((n, c) => n + c[k], 0),
            ]),
          ),
          cost: ledger.reduce((n, c) => n + c.cost.total, 0),
        };
      }

    const summarize = (calls, parent) => ({
      calls,
      input: calls.reduce((n, c) => n + c.input, 0),
      cost: calls.reduce((n, c) => n + c.cost.total, 0),
      count: calls.length,
      parentPeak: Math.max(0, ...calls.filter((c) => c.actor === parent).map((c) => c.input)),
    });

    return {
      step,
      event: this.event(step),
      actors,
      single: summarize(single, 'single'),
      delegated: summarize(delegated, 'parent'),
      reports: atlasQA14.reports.filter((r) => r.admit <= step),
      workers: atlasQA14.workers.map((w) => this.worker(step, w.id)).filter(Boolean),
      parent: this.parent(step),
    };
  },

  billing(actor, modelId) {
    const count = actor?.calls || 0,
      total = (actor?.input || 0) + (actor?.output || 0);
    const fallback = AtlasModel12.rates(modelId || actor?.model || 'sonnet', 0);
    const parts = ['fresh', 'read', 'write', 'output'].map((key) => {
      const tokens = actor?.[key] || 0,
        cost = (actor?.ledger || []).reduce((n, c) => n + c.cost.parts[key], 0);
      return {
        key,
        average: count ? tokens / count : 0,
        share: total ? tokens / total : null,
        rate: tokens ? (cost / tokens) * 1e6 : fallback[key === 'fresh' ? 'input' : key],
      };
    });
    return {
      count,
      average: count ? total / count : 0,
      parts,
      cost: actor?.cost || 0,
      formula: count * parts.reduce((n, p) => n + (p.average * p.rate) / 1e6, 0),
    };
  },
};
