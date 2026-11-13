'use strict';
const AtlasContent08 = {
  welcome(s) {
    return (
      '<div class="workshop08 welcome08"><div class="hero-copy">' +
      '<span class="section-label">CONTEXT ENGINEERING, THROUGH A WORKING SYSTEM</span>' +
      '<h2>Make each model call carry the right context.</h2>' +
      '<p>Use a custom policy layer on your native harness to choose what enters, what ' +
      'survives and what returns—while keeping the goal and required instructions intact.</p>' +
      '</div><div class="system-overview"><div class="foundation role-execution">' +
      '<strong>Base harness</strong><span>OpenCode · Claude Code · Codex · other ' +
      'harnesses</span></div><div class="policy-overlay role-policy">' +
      '<strong>Your context policy</strong>' +
      '<span>Scope → load → bound → preserve → validate</span></div><div class="overview-loop">' +
      [
        ['Load', 'Instructions + selected facts', 'policy'],
        ['Assemble', 'One explicit model input', 'evidence'],
        ['Act', 'Model calls + tools', 'execution'],
        ['Observe', 'Results, usage and acceptance', 'stored'],
      ]
        .map(
          ([a, b, c]) =>
            '<div class="role-' + c + '"><strong>' + a + '</strong><span>' + b + '</span></div>',
        )
        .join('') +
      '</div><div class="goal-line">Goal + constraints + acceptance travel through the entire loop.</div></div><div class="value-grid">' +
      [
        ['Spend deliberately', 'Measure included input, cache read/write and total cost.'],
        [
          'Keep the goal recoverable',
          'Preserve constraints and source anchors across a long session.',
        ],
        ['Automate repeatable decisions', 'Attach policies to supported lifecycle boundaries.'],
      ]
        .map(([a, b]) => '<section><h3>' + a + '</h3><p>' + b + '</p></section>')
        .join('') +
      ('</div><div class="actions08"><button data-view="contents">Explore the workshop ' +
        '→</button><span>Start with focused loading; add precise controls as the workflow ' +
        'grows.</span></div></div>')
    );
  },

  contents() {
    return (
      '<div class="workshop08"><div class="chapter-map">' +
      [
        [
          '01',
          'See the system',
          'system',
          'Single-session policies and the exact layers they affect.',
        ],
        [
          '02',
          'Delegate deliberately',
          'orchestration',
          'Keep worker scope separate; account for every invocation.',
        ],
        [
          '03',
          'Predict what loads',
          'loading',
          'Compare concrete repo trees across three harnesses.',
        ],
        [
          '04',
          'Reuse computation',
          'cache',
          'Understand provider cache reads, writes and invalidation.',
        ],
        [
          '05',
          'Keep the goal',
          'attention',
          'Read the evidence and choose a reliability intervention.',
        ],
        ['06', 'Automate a boundary', 'hooks', 'Use the lifecycle map to find supported hooks.'],
        [
          '07',
          'Install a technique',
          'recipes',
          'Choose packages with clear outcomes and support tiers.',
        ],
        [
          '08',
          'Verify the sources',
          'references',
          'Published methods, original experiments and offline materials.',
        ],
      ]
        .map(
          ([n, t, v, p]) =>
            '<button data-view="' +
            v +
            '"><span>' +
            n +
            '</span><strong>' +
            t +
            '</strong><p>' +
            p +
            '</p></button>',
        )
        .join('') +
      ('</div><div class="reading-key">' +
        '<span class="role-evidence">Measured research / recorded experiments</span>' +
        '<span class="role-policy">Candidate policies to test</span>' +
        '<span class="role-stored">Modeled budgets / authored examples</span></div>' +
        '<p>Use the arrows for a live talk, or jump directly to an engineering question. ' +
        'Expansions contain code, assumptions and full source scope.</p></div>')
    );
  },

  replayRow(row, path, index, methods) {
    let html = Round07Content.workloadRow.call(this, row, path, index);
    const method = methods.find((m) => m.layer === row.id);
    if (method && row.current) {
      html = html
        .replace('class="transition-row ', 'class="transition-row technique-target ')
        .replace(
          '<small>' +
            {
              retained: 'retained',
              added: 'added',
              removed: 'removed',
              extended: 'retained + added',
              reduced: 'reduced',
            }[row.change] +
            '</small>',
          '<small>' + method.label + '</small>',
        );
      html = html.replace(
        'data-transition-row=',
        'data-technique="' + method.kit + '" data-transition-row=',
      );
    }
    return html;
  },

  replayLane(s, path) {
    const d = AtlasReplay08.diff(s.step, path, s.workloadProfile),
      m = d.now,
      scale = AtlasReplay08.scale(s.workloadProfile);
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
            ' assigned tokens"></span>',
        )
        .join('') +
      ('</div><div class="transition-head"><span>Logical load order · technique</span>' +
        '<span>Previous</span><span>Change</span><span>Now</span></div><div class="ordered-transitions">') +
      d.rows.map((r) => this.replayRow(r, path, r.current ? ++rank : 0, m.methods)).join('') +
      '</div></section>'
    );
  },

  system(s) {
    const e = AtlasReplay08.at(s.step, 'managed', s.workloadProfile),
      active = e.methods.find((m) => m.hook === e.hook) || e.methods.at(-1);
    return (
      '<div class="system08 system07"><div class="scenario-toolbar"><label>Workload<select id="workloadProfile">' +
      Object.entries(AtlasWorkload.data.profiles)
        .map(
          ([id, x]) =>
            '<option value="' +
            id +
            '" ' +
            (id === s.workloadProfile ? 'selected' : '') +
            '>' +
            x.label +
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
      ('</span></div><div class="comparison-caption"><p>' +
        '<strong>Single session only.</strong> Modeled budgets; identical required instructions, ' +
        'tools and guidance.</p><button id="inspectWorkload">Assumptions + recorded scale ↗</button></div>') +
      (active
        ? '<div class="technique-strip role-policy"><strong>' +
          active.label +
          '</strong><span>' +
          active.detail +
          '</span><button data-hook="' +
          active.hook +
          '">See this boundary ↗</button></div>'
        : '') +
      '<div class="policy-comparison">' +
      this.replayLane(s, 'uncurated') +
      this.replayLane(s, 'managed') +
      ('</div><div class="transition-legend">' +
        '<span>Solid = retained · + = added · crossed/dashed = removed</span>' +
        '<span>Purple row cue = managed technique · click to inspect</span><span>Common scale ') +
      this.count(AtlasReplay08.scale(s.workloadProfile)) +
      ' · not model capacity</span></div><div class="unified-boundary role-execution"><strong>' +
      (s.step >= 8 && s.step <= 9
        ? 'Both paths: parent → separate summary request → checkpoint'
        : 'Scope → assemble → model/tool → select the next input') +
      '</strong>' +
      ([8, 9].includes(s.step)
        ? '<button id="inspectSummary08">Inspect summary inputs ↗</button>'
        : '<button data-view="orchestration">Next: isolate delegation →</button>') +
      '</div></div>'
    );
  },

  orchestration(s) {
    const d = AtlasReplay08.delegation(s.orchStep, s.workers, s.workloadProfile),
      b = AtlasReplay08.at(2, 'managed', s.workloadProfile),
      max = Math.max(d.single.total, d.delegated.total, 1);

    const lane = (m, title) =>
      '<section class="orchestration-lane"><h2>' +
      title +
      '</h2><div class="metric-total">' +
      this.count(m.total) +
      '<small>parent input prepared now · modeled tokens</small></div><div class="orchestration-context">' +
      m.layers
        .map(
          (l) =>
            '<div class="role-' +
            l.role +
            '"><strong>' +
            l.label +
            '</strong><span>' +
            this.count(l.tokens) +
            '</span></div>',
        )
        .join('') +
      '</div><div class="metric-pair"><span>Peak dispatched parent input<strong>' +
      this.count(m.parentPeak) +
      '</strong></span><span>Aggregate dispatched input<strong>' +
      this.count(m.aggregate) +
      '</strong></span></div></section>';

    return (
      '<div class="workshop08"><div class="scenario-toolbar"><label>Workers<select id="workerCount">' +
      [1, 2, 3]
        .map((n) => '<option ' + (n === s.workers ? 'selected' : '') + '>' + n + '</option>')
        .join('') +
      '</select></label><div class="unified-scrubber"><button id="orchBack">←</button><input id="orchStep" type="range" min="0" max="6" value="' +
      s.orchStep +
      '" aria-label="Delegation event"><button id="orchForward">→</button></div><strong>' +
      d.label +
      ('</strong></div><p class="scope-note">Same model, focused source set, tool-result bounds ' +
        'and total work. Fresh workers add repeated instruction overhead. Budgets are modeled; ' +
        'cache and latency gains are not assumed.</p><div class="policy-comparison">') +
      lane(d.single, 'Single managed session') +
      lane(d.delegated, 'Managed orchestration') +
      ('</div><div class="delegation-boundaries"><div class="role-policy">' +
        '<strong>Before spawn</strong><p>Partition the same work and sources. Set scope, ' +
        'ownership and a report schema.</p></div><div class="role-execution">' +
        '<strong>Worker windows are separate</strong><p>') +
      d.workers +
      (' worker(s) · two work calls each. Their requests never become one parent window.</p>' +
        '</div><div class="role-stored"><strong>Before parent integration</strong>' +
        '<p>Validate the handoff; import bounded reports and retain retrievable artifacts.</p>' +
        '</div></div><div class="actions08">' +
        '<button id="inspectInvocationLedger">Inspect every invocation ↗</button>' +
        '<button data-hook="handoff">Pre/post handoff hooks ↗</button>' +
        '<span>More workers can lower parent load while increasing aggregate input. Validate ' +
        'acceptance separately.</span></div></div>')
    );
  },

  loading(s) {
    const d = AtlasPlatform08.loading(s.harness, s.launch, s.loadPhase),
      skillPath = 'repo/' + d.skillLocation + '/commit-recovery/SKILL.md';
    return (
      '<div class="workshop08"><div class="control-row"><label>Harness<select id="loadingHarness">' +
      [
        ['claude', 'Claude Code'],
        ['opencode', 'OpenCode V2'],
        ['codex', 'Codex'],
      ]
        .map(
          ([v, t]) =>
            '<option value="' +
            v +
            '" ' +
            (s.harness === v ? 'selected' : '') +
            '>' +
            t +
            '</option>',
        )
        .join('') +
      '</select></label><label>Launch directory<select id="launchDirectory"><option value="root" ' +
      (s.launch === 'root' ? 'selected' : '') +
      '>repo/</option><option value="payments" ' +
      (s.launch === 'payments' ? 'selected' : '') +
      '>repo/services/payments/</option></select></label><label>Phase<select id="loadPhase"><option value="startup" ' +
      (s.loadPhase === 'startup' ? 'selected' : '') +
      '>Startup</option><option value="explore" ' +
      (s.loadPhase === 'explore' ? 'selected' : '') +
      ('>Read payments/worker.ts</option></select></label></div><div class="loading-layout">' +
        '<section class="repo-tree"><h2>One concrete organization repo</h2>' +
        '<pre>global/ guidance\nrepo/\n├─ AGENTS.md / CLAUDE.md\n├─ ') +
      d.skillLocation +
      ('/commit-recovery/SKILL.md\n├─ services/\n│  ├─ AGENTS.md / CLAUDE.md\n│  └─ payments/\n│    ' +
        ' ├─ AGENTS.md / CLAUDE.md\n│     ├─ AGENTS.override.md\n│     └─ worker.ts\n└─ analytics/ ' +
        '(unrelated guidance)</pre><div class="actions08"><button data-example-file="') +
      skillPath +
      ('">Inspect skill example ↗</button>' +
        '<button data-example-file="tool/read_contract.json">Inspect tool contract ↗</button>' +
        '</div><p>Catalog metadata supports discovery. Full skill bodies load when invoked; ' +
        'referenced files add more context.</p></section><section class="loaded-chain">' +
        '<h2>Predicted loaded order</h2><p class="global-location">Global source: <code>') +
      d.globalLocation +
      '</code></p><ol>' +
      d.loaded
        .map((f) => '<li><button data-example-file="' + f.path + '">' + f.path + ' ↗</button></li>')
        .join('') +
      '</ol><p id="loadingExplanation">' +
      d.note +
      '</p><p class="scope-note">' +
      d.scope +
      ('</p></section></div><div class="rule-cards"><section><h3>Keep the root small</h3>' +
        '<p>Put shared invariants and build/test entry points here. Route to deeper guidance for ' +
        'specialized work.</p></section><section><h3>Make loading observable</h3>' +
        '<p>Check the native instruction view or capture. Claude InstructionsLoaded can log ' +
        'actual load events.</p></section><section><h3>Preserve native authority</h3>' +
        '<p>Directory scope and assembly order do not identify a provider message role or fixed ' +
        'attention weight.</p></section></div><div class="actions08">' +
        '<button id="showNativeOrder">Native initial assembly detail ↗</button>' +
        '<button id="showWeights">Authority, position and attention weights ↗</button>' +
        '<button data-kit="focus">Get focused-loading package →</button></div></div>')
    );
  },

  cache(s) {
    const d = AtlasPlatform08.cache(s.cacheCase);
    return (
      '<div class="workshop08 cache08"><div class="control-row"><label>Request case<select id="cacheCase">' +
      [
        ['cold', 'First eligible request'],
        ['reuse', 'Identical reusable prefix'],
        ['edit', 'Edit after 8K tokens'],
        ['expired', 'Identical prefix, expired entry'],
      ]
        .map(
          ([v, t]) =>
            '<option value="' +
            v +
            '" ' +
            (s.cacheCase === v ? 'selected' : '') +
            '>' +
            t +
            '</option>',
        )
        .join('') +
      ('</select></label><strong class="cache-full">20,000 tokens remain in the input</strong>' +
        '</div><div class="cache-machine"><section class="request-cache-view">' +
        '<h2>Assembled request</h2><div class="cache-partitions">') +
      [
        ['read', 'Cache read', d.read],
        ['write', 'New cache write', d.write],
        ['fresh', 'Fresh tail', d.fresh],
      ]
        .filter((x) => x[2])
        .map(
          ([kind, label, n]) =>
            '<div class="cache-' +
            kind +
            '" style="flex:' +
            n +
            '"><strong>' +
            label +
            '</strong><span>' +
            this.count(n) +
            '</span></div>',
        )
        .join('') +
      ('</div><p>Stable prefix: instructions, tools and reusable reference content. Changing ' +
        'task/results follow within native message contracts.</p><div class="metric-pair"><span>Read<strong>') +
      this.count(d.read) +
      '</strong></span><span>Write<strong>' +
      this.count(d.write) +
      '</strong></span><span>Fresh<strong>' +
      this.count(d.fresh) +
      ('</strong></span></div></section><div class="cache-arrows">write →<br>← reuse</div>' +
        '<section class="provider-cache role-execution"><h2>Provider-controlled cache</h2>' +
        '<p>Reusable prefill state lives at the provider, under its model, routing and retention ' +
        'rules.</p><div class="cache-store-icon">KV<br><small>key / value state</small></div>' +
        '<p>Repository files and saved tool artifacts are your source store. They are not this ' +
        'prompt cache.</p></section></div><p class="scope-note">') +
      d.note +
      ('</p><div class="provider-grid"><section><h3>OpenAI</h3>' +
        '<p>Model-specific exact-prefix caching. Newer models expose read/write accounting and ' +
        'different retention controls. KV state can use encrypted GPU-local storage.</p>' +
        '</section><section><h3>Anthropic</h3>' +
        '<p>Read + creation + fresh sum to input. Ephemeral in-memory representations; supported ' +
        '5-minute / 1-hour lifetimes and model-specific pricing.</p></section><section>' +
        '<h3>Gemini</h3><p>Gemini4 / Interactions uses implicit caching. Explicit objects belong ' +
        'to supported older model/API combinations; verify current SDK usage fields.</p>' +
        '</section></div><div class="actions08">' +
        '<button id="inspectCacheUsage">Provider usage examples + checks ↗</button>' +
        '<button data-kit="cache">Get cache audit package →</button>' +
        '<span>Measure total cost and latency; preserve useful facts before chasing hit rate. ' +
        'Compaction can break reuse and still reduce total spend.</span></div></div>')
    );
  },

  reliability(s) {
    const m = atlasResearch05.position.models[Number(s.positionModel)],
      groups = atlasResearch05.position.tiers.map((t) => ({ label: t, values: m.questions[t] })),
      goal =
        'Fix retry/replay while preserving committed tenant/key identity, public API and tenant isolation.',
      choice = {
        reanchor: [
          'Prompt / next dispatch',
          'Restate the latest goal and acceptance alongside selected facts.',
          'task',
        ],
        bound: [
          'Before tool → admitted result',
          'Bound reads and retain retrievable artifacts; keep irrelevant result text outside active input.',
          'history',
        ],
        restore: [
          'Compaction → next dispatch',
          'Validate goal, constraints and anchors; restore referenced source facts.',
          'checkpoint',
        ],
      }[s.reliabilityLever];
    return (
      '<div class="workshop08 reliability08"><div class="reliability-heading">' +
      '<h2>As context grows, test whether the task stays recoverable.</h2>' +
      '<p>These studies measure task behavior. They do not directly measure our coding session ' +
      '“losing the goal,” or expose internal attention weights.</p></div>' +
      '<div class="reliability-grid"><section class="reliability-evidence">' +
      '<label>Published position example<select id="positionModel">' +
      atlasResearch05.position.models
        .map(
          (x, i) =>
            '<option value="' +
            i +
            '" ' +
            (Number(s.positionModel) === i ? 'selected' : '') +
            '>' +
            x.model +
            '</option>',
        )
        .join('') +
      '</select></label>' +
      this.contextPlot(groups, atlasResearch05.position.conditions, 'Task accuracy (%)') +
      ('<p class="study-caption">CRE2026 · Table16 · unanswered-question filler · 50 math ' +
        'questions per condition. Reported 8K/32K/64K tiers; model and filler matter. No ' +
        'universal monotonic decay. <button id="showResearchData" ' +
        'data-force-study="position">Data + method ↗</button></p></section>' +
        '<section class="goal-system"><div class="goal-card role-policy">' +
        '<strong>Canonical goal + acceptance</strong><p>') +
      goal +
      ('</p><small>Keep a current, source-linked task contract outside the growing ' +
        'transcript.</small></div><div class="context-growth">' +
        '<span class="role-evidence">Initial source packet</span>' +
        '<span class="role-stored">+ tool outputs + decisions</span>' +
        '<span class="role-stored">+ follow-up work + summary</span></div><div class="goal-intervention role-') +
      (s.reliabilityLever === 'bound' ? 'stored' : 'policy') +
      '" data-goal-target="' +
      choice[2] +
      '"><strong>' +
      choice[0] +
      '</strong><p>' +
      choice[1] +
      ('</p><small>Candidate intervention: verify acceptance and wrong-goal answers; no ' +
        'optimized score is invented.</small></div></section></div><div class="lever-controls">') +
      [
        ['reanchor', 'Re-anchor the goal'],
        ['bound', 'Bound result growth'],
        ['restore', 'Preserve + restore'],
      ]
        .map(
          ([id, t]) =>
            '<button data-reliability-lever="' +
            id +
            '" aria-pressed="' +
            (s.reliabilityLever === id) +
            '">' +
            t +
            '</button>',
        )
        .join('') +
      '</div><div class="actions08"><button id="showWeights">How roles and position influence attention weights ↗</button><button data-kit="' +
      (s.reliabilityLever === 'bound' ? 'results' : 'continuity') +
      '">Get this technique →</button></div></div>'
    );
  },

  attention(s) {
    let content;
    if (s.evidenceMode === 'walkthrough') content = Round07Content.bfsWalkthrough.call(this, s);
    else if (s.evidenceMode === 'mechanism') content = this.reliability(s);
    else {
      content =
        '<div class="study-controls">' +
        [
          ['frontier', 'Recover graph facts'],
          ['position', 'Task position × load'],
          ['signal', 'Preserve required facts'],
        ]
          .map(
            ([id, t]) =>
              '<button data-study="' +
              id +
              '" aria-pressed="' +
              (s.study === id) +
              '">' +
              t +
              '</button>',
          )
          .join('') +
        '</div>';
      const controls = Round07Content.learningToolbar
        .call(this, s)
        .replace(/<label>Study<select[\s\S]*?<\/select><\/label>/, '');
      content += controls + Round07Content.results.call(this, s);
    }
    return (
      '<div class="evidence08 workshop08"><div class="evidence-navigation">' +
      [
        ['walkthrough', '1 · Understand the task'],
        ['results', '2 · Read the evidence'],
        ['mechanism', '3 · Keep the goal'],
      ]
        .map(
          ([id, t]) =>
            '<button id="evidenceMode-' +
            id +
            '" data-evidence-mode="' +
            id +
            '" aria-pressed="' +
            (s.evidenceMode === id) +
            '">' +
            t +
            '</button>',
        )
        .join('') +
      '</div>' +
      content +
      '</div>'
    );
  },

  hookInfo(id) {
    const original = atlasResearch.hooks.entries.find((h) => h.id === id);
    const map =
      {
        start: [
          'focus',
          'Initialize applicable guidance and a small task-entry policy.',
          'instructions, guidance',
        ],
        prompt: ['focus', 'Admit a focused packet and the latest goal.', 'task, evidence, skills'],
        dispatch: [
          'continuity',
          'Prepare the next request; restore required source facts.',
          'task, evidence, checkpoint',
        ],
        pretool: ['results', 'Bound the request before a large tool read.', 'future tool result'],
        posttool: [
          'results',
          'Use an owned wrapper/adaptor for bounded output; keep full artifacts.',
          'history',
        ],
        child: [
          'handoff',
          'Scope the packet before spawn; child-start instructions reinforce the scope.',
          'child task, child evidence',
        ],
        precompact: [
          'continuity',
          'Preserve goal, constraints, anchors and open work in summary instructions.',
          'summary request',
        ],
        postcompact: [
          'continuity',
          'Observe the completed checkpoint, validate it and restore before dispatch.',
          'checkpoint, next evidence',
        ],
        handoff: [
          'handoff',
          'Validate the delivered report before integrating it into the parent.',
          'parent selected history',
        ],
      }[id] || null;
    if (!map) return this.hookInfo('prompt');
    return {
      id,
      kit: map[0],
      purpose: map[1],
      layers: map[2],
      label: original?.label || 'Subagent handoff / return',
      opencode: original?.opencode || 'Orchestrator report-validation boundary',
      claude:
        id === 'posttool'
          ? 'Current PostToolUse updatedToolOutput replaces model-visible output with a schema-matched value. Package adapts Bash stdout only.'
          : id === 'handoff'
            ? 'PreToolUse SubagentHandback: v2.1.271+ auto mode, only when that tool delivers the report. Otherwise validate manually before integration.'
            : original?.claude || 'Scoped orchestrator validation',
      limit:
        id === 'handoff'
          ? 'Requires the actual SubagentHandback delivery path. SubagentStop closing text may not ' +
            'be the report; its feedback goes to the child. Installer does not enable auto mode.'
          : id === 'posttool'
            ? 'Preserve the tool result schema and error details. Replacement changes model-visible ' +
              'output; tool side effects and original telemetry remain. Verify your installed runtime.'
            : original.limit,
    };
  },

  hooks(s) {
    const selected = this.hookInfo(s.hook || 'prompt'),
      ids = [
        'start',
        'prompt',
        'dispatch',
        'pretool',
        'posttool',
        'child',
        'handoff',
        'precompact',
        'postcompact',
      ];
    return (
      '<div class="workshop08"><div class="lifecycle-graphic"><div class="lifecycle-loop">' +
      '<span class="role-policy">Load + prepare</span><b>→</b>' +
      '<span class="role-evidence">Assembled input</span><b>→</b>' +
      '<span class="role-execution">Model / tool</span><b>↩</b>' +
      '<span class="role-stored">Observe + recover</span></div><div class="lifecycle-nodes">' +
      ids
        .map(
          (id, i) =>
            '<button data-select-hook="' +
            id +
            '" aria-pressed="' +
            (selected.id === id) +
            '"><small>' +
            String(i + 1).padStart(2, '0') +
            '</small><strong>' +
            this.hookInfo(id).label +
            '</strong><span>' +
            this.hookInfo(id).layers +
            '</span></button>',
        )
        .join('') +
      '</div></div><div class="hook-explainer"><section class="role-policy"><h2>' +
      selected.label +
      '</h2><p>' +
      selected.purpose +
      '</p><strong>Affects: ' +
      selected.layers +
      '</strong></section><section><h3>Native integration</h3><p><strong>OpenCode V2:</strong> ' +
      selected.opencode +
      '</p><p><strong>Claude Code:</strong> ' +
      selected.claude +
      '</p><p class="scope-note">' +
      selected.limit +
      ('</p><small>Codex: use the portable protocol/helper when an equivalent native event is ' +
        'not documented here.</small></section></div><div class="actions08"><button data-hook-example="') +
      selected.id +
      '">Inspect a concrete example ↗</button><button data-kit="' +
      selected.kit +
      '">Get ' +
      atlasKits08.find((k) => k.id === selected.kit).name +
      ' →</button><span>A native observer, instruction injection and input transformation have different powers.</span></div></div>'
    );
  },

  recipes(s) {
    const ids = s.selectedKits,
      h = s.kitHarness,
      command = ids.length
        ? 'node install.mjs --harness ' +
          h +
          ' --kits ' +
          ids.join(',') +
          ' --target /path/to/project --apply'
        : 'Select at least one package.';
    return (
      '<div class="workshop08 packages08"><div class="control-row"><label>Install target<select id="kitHarness">' +
      [
        ['opencode', 'OpenCode V2'],
        ['claude', 'Claude Code'],
        ['codex', 'Codex'],
        ['portable', 'Portable helpers'],
      ]
        .map(
          ([id, t]) =>
            '<option value="' + id + '" ' + (id === h ? 'selected' : '') + '>' + t + '</option>',
        )
        .join('') +
      '</select></label><span>Choose techniques independently; inspect what each target actually supports.</span></div><div class="package-grid">' +
      atlasKits08
        .map(
          (k) =>
            '<label class="package-card ' +
            (ids.includes(k.id) ? 'selected' : '') +
            '"><div><input type="checkbox" id="kitChoice-' +
            k.id +
            '" data-kit-selection="' +
            k.id +
            '" ' +
            (ids.includes(k.id) ? 'checked' : '') +
            '><h2>' +
            k.name +
            '</h2></div><p>' +
            k.purpose +
            '</p><small>OPTIMIZES / MEASURES</small><strong>' +
            k.metric +
            '</strong><p class="package-capability">' +
            k[h === 'portable' ? 'codex' : h] +
            '</p><span>' +
            k.contents +
            '</span></label>',
        )
        .join('') +
      ('</div><section class="install-panel role-execution">' +
        '<h2>Download → extract → install selected packages</h2>' +
        '<p>Node18+ · no API key or model calls · existing unrelated settings/instructions are ' +
        'preserved. The command previews paths when you omit --apply.</p><code id="installCommand">') +
      command +
      ('</code><div class="actions08"><a class="download-button" id="downloadKits" ' +
        'href="kits/context-kits.zip" download>Download offline kit bundle ↓</a>' +
        '<button id="copyInstallCommand" ') +
      (!ids.length ? 'disabled' : '') +
      ('>Copy command</button><button id="inspectPackageFiles">Files + capabilities ↗</button>' +
        '</div><p class="scope-note">Installations are additive. Helpers and installer are ' +
        'offline-tested. Native adapters/config are source-matched; test your installed runtime. ' +
        'Instruction-only integration is identified instead of claiming unsupported automatic ' +
        'trimming.</p></section></div>')
    );
  },

  references() {
    return Round07Content.references
      ? Round07Content.references.call(this)
      : '<div class="reference-grid">' +
          atlasSources.sources
            .map(
              (x) =>
                '<article class="reference-entry"><h3><a href="' +
                x.url +
                '" target="_blank" rel="noopener noreferrer">' +
                this.esc(x.title) +
                ' ↗</a></h3><p>' +
                this.esc(x.supports) +
                '</p><p class="scope">' +
                this.esc(x.limit) +
                '</p></article>',
            )
            .join('') +
          ('</div><div class="materials"><a href="benchmark.html?suite=service">Our experiment ' +
            'explorer ↗</a><a href="research/round07/workloads.json">Scenario assumptions ↗</a>' +
            '<a href="kits/context-kits.zip" download>Offline kit bundle ↓</a>' +
            '<a href="research/round03/sources.json">Full source catalog ↗</a></div>');
  },

  weightLab(s) {
    const rows = AtlasPlatform08.weights(s.weightQuery, s.weightHead, s.weightGap, s.weightContent);
    return (
      '<p><strong>Authority:</strong> intended conflict priority, learned through ' +
      'instruction-hierarchy training. <strong>Attention weight:</strong> a ' +
      'per-query/head/layer normalization of scores. A role has no fixed percentage here.</p>' +
      '<div class="authority-order"><span>Provider Root policy above application ' +
      'messages</span><strong>System → Developer → User</strong>' +
      '<small>Root means provider policy here, not a repository root filename. Simplified ' +
      'OpenAI example; delegated source authority remains scoped. Assistant history and tool ' +
      'content carry no independent instruction authority; applicable instructions can ' +
      'delegate scoped authority. Filename and directory depth do not establish a provider ' +
      'role.</small></div><div class="control-row"><label>Query<select id="weightQuery">' +
      ['system', 'developer', 'user', 'assistant history', 'tool']
        .map(
          (r, i) =>
            '<option value="' +
            i +
            '" ' +
            (s.weightQuery === i ? 'selected' : '') +
            '>' +
            i +
            ' · ' +
            r +
            ' token</option>',
        )
        .join('') +
      '</select></label><label>Toy head<select id="weightHead"><option value="0" ' +
      (!s.weightHead ? 'selected' : '') +
      '>A</option><option value="1" ' +
      (s.weightHead ? 'selected' : '') +
      '>B</option></select></label><label>Position spacing<select id="weightGap">' +
      [0, 1, 3, 6]
        .map(
          (n) =>
            '<option value="' +
            n +
            '" ' +
            (s.weightGap === n ? 'selected' : '') +
            '>' +
            (n + 1) +
            '</option>',
        )
        .join('') +
      '</select></label><label>Content representation<select id="weightContent"><option value="base" ' +
      (s.weightContent === 'base' ? 'selected' : '') +
      '>Base vectors</option><option value="task-match" ' +
      (s.weightContent === 'task-match' ? 'selected' : '') +
      ('>Changed user-token vector</option></select></label></div>' +
        '<p class="toy-label">Invented 2D vectors and angle (0.4 radians/position), RoPE ' +
        'rotation, scaled dot product and causal softmax. These are not measured frontier-model ' +
        'weights or a prediction of obedience.</p><div class="weight-table"><table><thead><tr>' +
        '<th>Illustrative message token</th><th>Position</th><th>Q·K / √2</th><th>Access</th>' +
        '<th>Weight</th></tr></thead><tbody>') +
      rows
        .map(
          (r) =>
            '<tr><th>' +
            r.role +
            '</th><td>' +
            r.position +
            '</td><td>' +
            r.score.toFixed(3) +
            '</td><td>' +
            (r.allowed ? 'allowed' : 'future masked') +
            '</td><td><div class="weight-track"><i style="width:' +
            r.weight * 100 +
            '%"></i><strong>' +
            (r.weight * 100).toFixed(1) +
            '%</strong></div></td></tr>',
        )
        .join('') +
      ('</tbody></table></div><div class="weight-factors"><p>' +
        '<strong>Content + role markers:</strong> serialized inputs and training affect learned ' +
        'representations, then Q/K projections.</p><p>' +
        '<strong>Position:</strong> encodings such as RoPE affect Q/K comparisons; they do not ' +
        'create a universal recency multiplier.</p><p>' +
        '<strong>Head / layer / query:</strong> different projections and hidden states produce ' +
        'different distributions. The causal mask rules out future keys.</p><p>' +
        '<strong>Competing keys:</strong> softmax normalizes across all accessible keys for this ' +
        'query/head. Adding keys can redistribute weights even if existing scores stay fixed; ' +
        'their scores matter, not only their count.</p><p>' +
        '<strong>Interpretation:</strong> the largest weight is not proof of which instruction ' +
        'governs the answer. Next-token sampling is a separate stage.</p></div><p>' +
        '<strong>Q (query)</strong> asks what the current token needs; <strong>K (key)</strong> ' +
        'provides each token’s comparison representation. Their scaled dot products become ' +
        'scores. The mask excludes future keys; softmax turns allowed scores into weights ' +
        'summing to one. Those weights combine <strong>V (value)</strong> representations to ' +
        'produce the attention output.</p>' +
        '<p>Attention output = softmax(QKᵀ / √d + mask)V. Native hooks control supplied context ' +
        'and workflow, not a universal “system attention weight” knob.</p>')
    );
  },
};
Object.assign(AtlasContent, AtlasContent08);
