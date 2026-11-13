'use strict';
const AtlasContent10 = {
  nativeReadout10(s) {
    const e = AtlasModel10.nativeEvidence(s.harness),
      short = {
        opencode: 'Agent/provider prompt + added guidance.',
        claude: 'Tool allowlist + skill preloads; inspect /context.',
        codex: 'Model-catalog instructions; verify effective tools.',
      }[s.harness];
    return (
      '<div class="native-readout10"><strong>' +
      e.label +
      '</strong><span class="native-long10">' +
      e.summary +
      '</span><span class="native-short10">' +
      short +
      '</span><small>Base 6,000 is a scenario allowance, held equal.</small></div>'
    );
  },

  row10(row, path, index, methods, heat) {
    const names = {
        base: 'Base instructions',
        tools: 'Tool definitions',
        guidance: 'Repo guidance',
        skills: 'Skills',
        task: 'Task + checks',
        evidence: 'Source evidence',
        history: 'History + results',
        checkpoint: 'Checkpoint + anchors',
      },
      method = methods.find((m) => m.layer === row.id),
      status = {
        retained: 'retained',
        added: 'added',
        removed: 'removed',
        extended: 'retained + added',
        reduced: 'reduced',
      }[row.change],
      marker =
        row.delta === 0 ? 'kept' : (row.delta > 0 ? '+' : '−') + this.count(Math.abs(row.delta)),
      point = heat.rows.find((r) => r.id === row.id);
    const cue = point
      ? '<span class="heat-cell10" data-heat-weight="' +
        point.weight +
        '" data-heat-layer="' +
        row.id +
        '" style="--attention:' +
        point.weight +
        '" title="Illustrative Q·K ' +
        point.dot.toFixed(4) +
        '; scaled score ' +
        point.score.toFixed(4) +
        '; share ' +
        (point.weight * 100).toFixed(2) +
        '%; ' +
        (point.delta === null
          ? 'new key'
          : (point.delta * 100).toFixed(2) + 'pp since previous step') +
        '"><b>' +
        (point.weight * 100).toFixed(1) +
        '%</b><small>' +
        point.dot.toFixed(2) +
        '</small></span>'
      : '<span class="heat-cell10 empty-heat10" title="' +
        (row.current ? 'No task/query yet' : 'Outside current input') +
        '">—</span>';
    return (
      '<button class="transition-row role-' +
      row.role +
      (method && row.current ? ' technique-target' : '') +
      '" data-transition-row="' +
      row.id +
      '" data-workload-layer="' +
      row.id +
      '" data-workload-path="' +
      path +
      '" data-change="' +
      row.change +
      '" ' +
      (method && row.current ? 'data-technique="' + method.kit + '"' : '') +
      ' title="' +
      row.label +
      ' · ' +
      status +
      ' · ' +
      row.previous +
      ' → ' +
      row.current +
      ' scenario tokens"><span class="order-index">' +
      (row.current ? index : '×') +
      '</span><span class="layer-name">' +
      names[row.id] +
      '<small>' +
      (method && row.current ? method.label : status) +
      '</small></span><span class="previous-amount">' +
      this.count(row.previous) +
      ('</span><span class="transition-indicator" aria-hidden="true"><svg viewBox="0 0 100 28">' +
        '<path d="M5 14H95"/><circle cx="5" cy="14" r="3"/><circle cx="95" cy="14" r="3"/></svg><small>') +
      marker +
      '</small></span><strong class="current-amount">' +
      this.count(row.current) +
      '</strong>' +
      cue +
      '</button>'
    );
  },

  replayLane10(s, path) {
    const d = AtlasModel10.diff(s.step, path, s.workloadProfile),
      m = d.now,
      scale = AtlasModel10.scale(s.workloadProfile),
      heat = AtlasModel10.heat(s.step, path, s.workloadProfile);
    let rank = 0;
    return (
      '<section class="policy-lane" data-policy-lane="' +
      path +
      '"><header><h2>' +
      (path === 'managed' ? 'Managed workflow' : 'Uncurated workflow') +
      '</h2><button data-context-path="' +
      path +
      '">Inspect Context ↗</button></header><div class="lane-totals"><span>Previous <b>' +
      this.count(d.before?.total || 0) +
      '</b></span><strong data-current-total="' +
      path +
      '">' +
      this.count(m.total) +
      '<small>scenario tokens now</small></strong></div><div class="integrated-token-ribbon">' +
      m.layers
        .map(
          (l) =>
            '<span class="role-' +
            l.role +
            '" style="width:' +
            (l.tokens / scale) * 100 +
            '%" title="' +
            l.label +
            ' · ' +
            l.tokens +
            ' scenario tokens"></span>',
        )
        .join('') +
      ('</div><div class="transition-head"><span></span><span>Load order / technique</span>' +
        '<span>Before</span><span>Change</span><span>Now</span><span>Toy share / Q·K</span>' +
        '</div><div class="ordered-transitions">') +
      d.rows.map((r) => this.row10(r, path, r.current ? ++rank : 0, m.methods, heat)).join('') +
      '</div></section>'
    );
  },

  system(s) {
    const e = AtlasModel10.at(s.step, 'managed', s.workloadProfile),
      active = e.methods.find((m) => m.hook === e.hook) || e.methods.at(-1);
    return (
      '<div class="system08 system07 system10"><div class="scenario-toolbar"><label>Workload<select id="workloadProfile">' +
      ['platform', 'service', 'org']
        .map(
          (id) =>
            '<option value="' +
            id +
            '" ' +
            (id === s.workloadProfile ? 'selected' : '') +
            '>' +
            AtlasWorkload.data.profiles[id].label +
            '</option>',
        )
        .join('') +
      ('</select></label><div class="unified-scrubber">' +
        '<button id="stepBack" aria-label="Previous event">←</button>' +
        '<input id="sessionStep" type="range" min="0" max="11" value="') +
      s.step +
      '" aria-label="Single-session event"><button id="stepForward" aria-label="Next event">→</button></div><span class="current-event"><strong>' +
      e.label +
      '</strong>Turn ' +
      e.turn +
      ' · parent call ' +
      e.call +
      ('</span></div><div class="comparison-caption">' +
        '<p>Single session · modeled budgets; base instructions, tools and repo guidance are ' +
        'held equal.</p><button id="inspectWorkload">Assumptions + recorded scale ↗</button>' +
        '</div><div class="technique-strip role-policy"><strong>') +
      (active ? active.label : 'Before the task') +
      ('</strong><span>Heat = illustrative next-call share, one invented key per row. Q·K ÷ √2 ' +
        '→ softmax. Not measured attention or authority.</span>') +
      (active ? '<button data-hook="' + active.hook + '">Boundary ↗</button>' : '') +
      '<button id="showWeights">Attention math ↗</button></div><div class="policy-comparison">' +
      this.replayLane10(s, 'uncurated') +
      this.replayLane10(s, 'managed') +
      ('</div><div class="transition-legend">' +
        '<span>+ added · solid retained · dashed removed</span>' +
        '<span>Heat uses the same0–100% scale across steps/lanes.</span>' +
        '<span>Scenario tokens ≠ attention weights.</span></div><div class="system-native10">') +
      this.nativePicker(s) +
      this.nativeReadout10(s) +
      '<button id="inspectNativeEvidence">Native scope / counts ↗</button>' +
      ([8, 9].includes(s.step) ? '<button id="inspectSummary08">Summary inputs ↗</button>' : '') +
      '</div></div>'
    );
  },

  miniWindow09(layers, title, total, worker, compact = false) {
    let html = AtlasContent09.miniWindow09.call(this, layers, title, total, worker, compact);
    for (const l of layers)
      html = html.replace(
        '<li class="mini-layer09 role-' + l.role + '">',
        '<li class="mini-layer09 role-' + l.role + '" data-mini-layer="' + l.id + '">',
      );
    if (worker)
      html = html.replace(
        '<strong>' + title + '</strong>',
        '<strong>' +
          title +
          '</strong><small class="worker-packet10">' +
          worker.packet.name +
          '</small>',
      );
    return html;
  },

  flow10(d) {
    const active = d.step < 2 ? 'scope' : d.step < 4 ? 'work' : 'return';
    return (
      '<ol class="delegation-rail10" aria-label="Parent to child to return">' +
      [
        ['scope', '1', 'P → W', 'Scoped packet'],
        ['work', '2', 'W · local', 'Tools + skills'],
        ['return', '3', 'W → P', 'Validated report'],
      ]
        .map(
          ([id, n, arrow, label]) =>
            '<li data-flow-phase="' +
            id +
            '" ' +
            (active === id ? 'aria-current="step"' : '') +
            '><small>' +
            n +
            ' · ' +
            label +
            '</small><strong>' +
            arrow +
            '</strong></li>',
        )
        .join('') +
      '</ol>'
    );
  },

  orchestration(s) {
    const d = AtlasModel10.delegation(s.orchStep, s.workers, s.workloadProfile);

    const lane = (m, title, children) =>
      '<section class="orchestration-lane delegation-lane09"><h2>' +
      title +
      '</h2>' +
      (children
        ? this.flow10(d)
        : '<p class="single-scope10">One broad tool + skill packet; all work stays in the parent.</p>') +
      '<div class="context-family09 ' +
      (children && d.step ? 'has-workers09' : '') +
      '" style="--family-count:' +
      (d.workers + 1) +
      '">' +
      this.miniWindow09(m.layers, 'Parent', m.total, null, children && d.step > 0) +
      '<div class="delegation-flow09 ' +
      (!children ? 'no-workers09' : '') +
      '">' +
      (children
        ? d.workerWindows.length
          ? '<div class="worker-grid09" style="--workers:' +
            d.workers +
            '">' +
            d.workerWindows
              .map((w) => this.miniWindow09(w.layers, w.id + ' · ' + w.status, w.total, w, true))
              .join('') +
            '</div><div class="flow-arrow09 role-stored return-path10">' +
            (d.step >= 4
              ? '↑ ' + d.workers + ' × 1,200-token reports returned · child histories stay local'
              : '↑ Reports not admitted yet · validate before parent integration') +
            '</div>'
          : '<div class="empty-worker09">No worker context yet. Advance to scope the packets.</div>'
        : '<div class="empty-worker09">No separate child windows or report handoff.</div>') +
      '</div></div><div class="delegation-metrics09"><span>Latest windows, summed<strong data-window-sum="' +
      m.kind +
      '">' +
      this.count(m.currentAcrossSessions) +
      '</strong></span><span>Peak dispatched parent<strong>' +
      this.count(m.parentPeak) +
      '</strong></span><span>Accrued input · all calls<strong data-accrued-input="' +
      m.kind +
      '">' +
      this.count(m.aggregate) +
      '</strong></span></div></section>';

    return (
      '<div class="workshop08 delegation09 delegation10"><div class="scenario-toolbar"><label>Workers · scenario tokens<select id="workerCount">' +
      [1, 2, 3]
        .map((n) => '<option ' + (n === s.workers ? 'selected' : '') + '>' + n + '</option>')
        .join('') +
      ('</select></label><div class="unified-scrubber">' +
        '<button id="orchBack" aria-label="Previous delegation event">←</button>' +
        '<input id="orchStep" type="range" min="0" max="6" value="') +
      s.orchStep +
      '" aria-label="Delegation event"><button id="orchForward" aria-label="Next delegation event">→</button></div><strong>' +
      d.label +
      ('</strong></div><p class="delegation-scope09">' +
        '<span class="native-long10">Delegation + worker scoping. Same assigned work/source ' +
        'units; smaller, different worker tool/skill packets are authored assumptions, not ' +
        'native defaults or measured savings.</span>' +
        '<span class="native-short10">Delegation + worker scoping · authored budgets · summed ' +
        'snapshots ≠ one window · gains unmeasured.</span></p><div class="policy-comparison">') +
      lane(d.single, 'One managed session', false) +
      lane(d.delegated, 'Scoped parent + workers', true) +
      ('</div><div class="delegation-accounting09">' +
        '<button id="inspectBaseInstructions" class="base-definition10">Base instructions: 6,000 ' +
        'per session · what counts? ↗</button>' +
        '<span>Tool and skill packets vary by worker. Accrued input counts repeated requests. ' +
        'Latest windows sum independent snapshots, not one model window. Acceptance, output ' +
        'costs and latency are unmeasured.</span></div><div class="delegation-native10">') +
      this.nativePicker(s) +
      this.nativeReadout10(s) +
      ('<button id="inspectNativeEvidence">Native scope / counts ↗</button>' +
        '<button id="inspectInvocationLedger">Inspect every invocation ↗</button></div></div>')
    );
  },

  loading(s) {
    return AtlasContent08.loading.call(this, s).replace(
      /<select id="loadingHarness">.*?<\/select>/,
      '<select id="loadingHarness">' +
        [
          ['opencode', 'OpenCode V2'],
          ['claude', 'Claude Code'],
          ['codex', 'Codex'],
        ]
          .map(
            ([id, t]) =>
              '<option value="' +
              id +
              '" ' +
              (s.harness === id ? 'selected' : '') +
              '>' +
              t +
              '</option>',
          )
          .join('') +
        '</select>',
    );
  },
};
Object.assign(AtlasContent, AtlasContent10);
