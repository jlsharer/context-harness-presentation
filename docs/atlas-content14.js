'use strict';
const AtlasPackages14 = {
  resolve(kits = [], ids = []) {
    const selected = new Set();

    const visit = (id) => {
      const t = atlasTechniques14.find((t) => t.id === id);
      if (!t) return;
      if (selected.has(id)) return;
      selected.add(id);
      t.requires.forEach(visit);
    };

    kits.forEach((id) => atlasKits08.find((b) => b.id === id)?.techniques.forEach(visit));
    ids.forEach(visit);
    return [...selected].sort();
  },

  remove(selected, id) {
    let next = selected.filter((x) => x !== id),
      changed = true;
    while (changed) {
      const old = next.length;
      next = next.filter((x) =>
        atlasTechniques14.find((t) => t.id === x).requires.every((r) => next.includes(r)),
      );
      changed = old !== next.length;
    }
    return next;
  },
};

const AtlasContent14 = {
  technique14(id) {
    return atlasTechniques14.find((t) => t.id === id);
  },

  techniqueLink14(id, label) {
    const t = this.technique14(id);
    return `<button class="tech-link14" data-technique-link="${id}">${this.esc(label || t.name)} ↗</button>`;
  },

  phaseRail14(step, lane) {
    const current = atlasQA14.phases.filter((p) => p.step <= step).at(-1);
    return `<nav class="phase-rail14" aria-label="QA workflow phase checkpoints">${atlasQA14.phases
      .map(
        (
          p,
          i,
        ) => `<button data-phase-step="${p.step}" data-phase-lane="${lane}" aria-pressed="${current.name === p.name}">
      <small>${String(i + 1).padStart(2, '0')}</small>${p.name}</button>`,
      )
      .join('')}</nav>`;
  },

  replayControl14(s, delegation = false) {
    const step = delegation ? s.orchStep : s.step,
      e = AtlasModel14.event(step);
    return `<div class="replay-controls14">
      <div class="fixed-stepper14">
      <button id="${delegation ? 'orchBack' : 'stepBack'}" aria-label="Previous workflow event" ${step === 0 ? 'disabled' : ''}>←</button>
      <button id="${delegation ? 'orchForward' : 'stepForward'}" aria-label="Next workflow event" ${step === 22 ? 'disabled' : ''}>→</button>
      <span>${step} / 22</span>
      </div>
      <strong>${this.esc(e.title)}</strong>
      <button data-event-detail="${step}">Evidence + boundary ↗</button>
      <input id="${delegation ? 'orchStep' : 'sessionStep'}" type="range" min="0" max="22" value="${step}" aria-label="QA workflow event">
      </div>`;
  },

  boundary14(step, delegation = false) {
    const e = AtlasModel14.event(step),
      ids = delegation
        ? [...new Set([...e.techniques, ...(step >= 3 && step <= 8 ? ['model-routing'] : [])])]
        : e.techniques;
    return `<div class="boundary14" data-technique-boundary="${step}">
      <strong>${this.esc(e.boundary)}</strong>
      <span class="boundary-arrow14">→</span>
      <div>${ids.map((id) => this.techniqueLink14(id)).join('')}</div>
      <span class="boundary-targets14">↳ ${e.layers.map((id) => AtlasModel14.layers.find((l) => l[0] === id)?.[1] || id).join(' · ')}</span>
      </div>`;
  },

  tokenRows14(state, options = {}) {
    const before = options.before,
      active = options.active || [],
      mode = options.mode || 'managed';
    const heat = options.heat ? AtlasModel14.heat(state.step, mode) : null;
    return `<div class="context-stack14 ${options.mini ? 'mini-stack14' : ''}" data-context-actor="${options.actor || mode}">${AtlasModel14.layers
      .map(([id, label, role], i) => {
        const now = state.layers.find((l) => l.id === id)?.tokens || 0,
          old = before?.layers.find((l) => l.id === id)?.tokens || 0;
        const delta = now - old,
          point = heat?.rows.find((r) => r.id === id);
        return `<button class="context-row14 role-${role} ${active.includes(id) ? 'impacted14' : ''} ${!now ? 'removed14' : ''}" data-context14="${id}" data-context-mode="${mode}" data-context-actor="${options.actor || ''}" ${active.includes(id) ? 'data-affected-layer="' + id + '"' : ''}>
      <span class="order14">${String(i + 1).padStart(2, '0')}</span>
      <span class="row-label14">${this.esc(label)}</span>${
        !options.mini
          ? `<span class="before14">${this.count(old)}</span>
      <span class="delta14 ${delta < 0 ? 'down14' : ''}">${delta ? (delta > 0 ? '+' : '−') + this.count(Math.abs(delta)) : '='}</span>`
          : ''
      }<b data-layer-tokens="${id}">${this.count(now)}</b>${point ? `<span class="toy-heat14" style="--share:${point.weight}" title="Illustrative Q·K ${point.dot.toFixed(2)}; share ${(point.weight * 100).toFixed(1)}%; not native attention">${(point.weight * 100).toFixed(1)}%</span>` : ''}</button>`;
      })
      .join('')}</div>`;
  },

  system(s) {
    const step = s.step;
    return `<div class="journey14">
      <div class="scenario-title14">
      <strong>One QA task · fix flaky parallel checkout CI</strong>
      <span>Authored example · Turn 0 starts before the task</span>
      </div>${this.phaseRail14(step, 'single')}${this.replayControl14(s)}<div class="session-comparison14">${[
        'manual',
        'managed',
      ]
        .map((mode) => {
          const d = AtlasModel14.diff(step, mode),
            state = d.now,
            e = AtlasModel14.event(step);
          return `<section class="session-lane14" data-session-lane="${mode}">
      <header>
      <h2>${mode === 'managed' ? 'Managed context' : 'Manual stewardship'}</h2>
      <strong>${this.count(state.total)}<small> tokens · input prepared now</small>
      </strong>
      </header>
      <div class="stack-heading14">
      <span>Load order / component</span>
      <span>Before</span>
      <span>Δ tokens</span>
      <span>Now</span>${s.qaHeat ? '<span>Toy %</span>' : ''}</div>${this.tokenRows14(state, { before: d.before, mode, active: mode === 'managed' ? e.layers : [], heat: s.qaHeat })}${
        mode === 'managed'
          ? this.boundary14(step)
          : `<div class="manual-boundary14">
      <strong>Same task + native harness</strong>
      <span>Broader manual admission, rather than a claim about every native default. Native compaction remains available.</span>
      </div>`
      }<footer>
      <span>${state.calls} estimated calls incl. summary</span>
      <button data-context14="overview" data-context-mode="${mode}">Inspect Context ↗</button>
      </footer>
      </section>`;
        })
        .join('')}</div>
      <div class="journey-footer14">
      <span>+ added · − reduced · = retained · highlighted rows are the active control’s targets</span>
      <button id="toggleQaHeat">${s.qaHeat ? 'Hide' : 'Show'} illustrative attention</button>
      <button data-event-detail="15">Compaction scope ↗</button>
      </div>
      </div>`;
  },

  actorChip14(id, s, actor) {
    const model = AtlasModel12.model(s.routes[id] || AtlasModel14.defaults[id]);
    return `<button id="agent-route-${id}" data-agent-route="${id}" class="actor-route14">${this.esc(model.name)} · ${actor?.calls || 0} calls ↗</button>`;
  },

  actorCard14(s, id, state, actor) {
    const title =
      id === 'single'
        ? 'One managed session'
        : id === 'parent'
          ? 'Coordinator'
          : atlasQA14.workers.find((w) => w.id === id).name;
    return `<section class="actor-card14 ${id.startsWith('W') ? 'worker-card14' : ''}" data-actor-card="${id}">
      <header>
      <strong>${id.startsWith('W') ? id + ' · ' : ''}${title}</strong>${this.actorChip14(id, s, actor)}</header>${state ? this.tokenRows14(state, { mini: true, actor: id, mode: 'managed', active: AtlasModel14.event(s.orchStep).layers }) : '<p class="worker-wait14">Not started<br>Scoped input is created at dispatch.</p>'}${this.billing14(s, id, actor, state)}</section>`;
  },

  billing14(s, id, actor, state, full = false) {
    const bill = AtlasModel14.billing(actor, s.routes[id] || AtlasModel14.defaults[id]);
    const labels = {
      fresh: 'Fresh input',
      read: 'Cache read',
      write: 'Cache write',
      output: 'Output',
    };
    const shortLabels = { fresh: 'Fresh', read: 'Cache R', write: 'Cache W', output: 'Output' };

    const compact = (n) =>
      new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

    if (full)
      return `<section class="full-billing14">
      <h3>${id} · average tokens per model call</h3>
      <p>
      <strong>${bill.average.toFixed(2)} billed tokens/call</strong> = input + output. Percentages below divide each category by all billed tokens, so fresh + read + write + output = 100%. They are not cache-hit percentages.</p>
      <div class="billing-parts14">${bill.parts
        .map(
          (p) => `<div>
      <strong>${labels[p.key]}</strong>
      <b>${p.average.toFixed(2)} tokens/call</b>
      <span>${p.share === null ? 'No calls' : (p.share * 100).toFixed(2) + '% of billed tokens'}</span>
      <span>× $${p.rate.toFixed(4)} / million tokens</span>
      </div>`,
        )
        .join('')}</div>
      <p class="cost-equation14">
      <strong>${bill.count} calls × [${bill.parts.map((p) => `(${p.average.toFixed(2)} ${labels[p.key].toLowerCase()} × $${p.rate.toFixed(4)})`).join(' + ')}] ÷ 1,000,000 = ${this.money12(bill.cost)}</strong>
      </p>
      <p>Displayed averages are rounded; the estimate uses unrounded per-call values. Rates are token-weighted effective USD/M if a request-length tier varies. Each call’s rate/partition is applied before summing. Accrued input is never multiplied by call count again.</p>
      </section>`;
    return `<button class="average-formula14" data-show-agent-ledger="${id}" data-average-actor="${id}" title="Open the full cost formula and exact per-call ledger">
      <span class="average-heading14">
      <span>Now <b>${compact(state?.total || 0)}</b>
      </span>
      <span>Avg/call <b>${compact(bill.average)}</b>
      </span>
      </span>
      <span class="average-parts14">${bill.parts
        .map(
          (p) => `<span>
      <b>${compact(p.average)}</b>
      <small>${shortLabels[p.key]} ${p.share === null ? '—' : Math.round(p.share * 100) + '%'}</small>
      </span>`,
        )
        .join('')}</span>
      <span class="average-equation14">${bill.count} × (avg mix × rates) ÷ 1M = <b>${this.money12(bill.cost)}</b> ↗</span>
      </button>`;
  },

  orchestration(s) {
    const d = AtlasModel14.delegation(s.orchStep, s.routes),
      metric = (m) =>
        `<div class="delegation-totals14">
      <span>
      <b>${m.count}</b> model calls</span>
      <span>
      <b>${this.count(m.input)}</b> accrued input</span>
      <span>
      <b>${this.money12(m.cost)}</b> estimated API cost</span>
      </div>`;

    return `<div class="journey14 delegation14">
      <div class="scenario-title14">
      <strong>Same QA task · scoped, model-routed work</strong>
      <span>Other context techniques held constant · coordinator owns edits + acceptance</span>
      </div>${this.phaseRail14(s.orchStep, 'delegation')}${this.replayControl14(s, true)}<div class="delegation-comparison14">
      <section class="solo-lane14">
      <h2>All work in one session</h2>${this.actorCard14(s, 'single', AtlasModel14.at(s.orchStep), d.actors.single)}${metric(d.single)}</section>
      <section class="routed-lane14">
      <h2>Coordinator → scoped workers → verified return</h2>
      <div class="agent-flow14">${this.actorCard14(s, 'parent', d.parent, d.actors.parent)}<div class="flow-directions14">
      <b>→</b>
      <span>Task + selected sources</span>
      <b>←</b>
      <span>Bounded, validated report</span>
      </div>
      <div class="workers14">${atlasQA14.workers.map((w) => this.actorCard14(s, w.id, AtlasModel14.worker(s.orchStep, w.id), d.actors[w.id])).join('')}</div>
      </div>
      <div class="report-returns14" data-return-count="${d.reports.length}">
      <strong>Worker output → next parent input</strong>${d.reports.length ? d.reports.map((r) => `<span title="${this.esc(r.label)}">${r.worker} → ${this.count(r.tokens)} tokens</span>`).join('') : '<span>No worker report admitted yet.</span>'}</div>${metric(d.delegated)}</section>
      </div>${this.boundary14(s.orchStep, true)}<div class="journey-footer14">
      <span>Avg/call = input + output; shares cover billed tokens. Synthetic usage and outcomes; sourced rates.</span>
      <button id="inspectInvocation14">All calls + cache ledger ↗</button>
      <button data-show-model-rates>Model costs ↗</button>
      </div>
      </div>`;
  },

  mapping14: [
    [
      'Load the repo and every instruction',
      'Start from a small task contract + targeted sources',
      'task-contract',
      'AGENTS.md / CLAUDE.md + packet',
    ],
    [
      'Invoke or paste every skill at kickoff',
      'Discover skills; load the current stage only',
      'skill-discovery',
      'Skill descriptions + staged workflow',
    ],
    [
      'Paste complete test and CI logs',
      'Store full evidence; admit useful bounded returns',
      'bounded-results',
      'PostToolUse + local artifact',
    ],
    [
      'Run /compact whenever context feels full',
      'Use native auto-compaction + prepared checkpoints',
      'compaction-checkpoint',
      'Native compaction + PreCompact',
    ],
    [
      'Start over and paste the old session',
      'Restore selected state, then reopen source anchors',
      'checkpoint-restore',
      'SessionStart + checkpoint',
    ],
    [
      'Repeat the goal and guidelines manually',
      'Re-anchor at relevant lifecycle boundaries',
      'goal-reminder',
      'Prompt hook + concise guidance',
    ],
    [
      'Ask repeatedly to save traceable evidence',
      'Capture completion metadata; link actual check reports',
      'artifact-ledger',
      'PostToolUse + local ledger',
    ],
    [
      'Relay outputs between a chain of skills',
      'Use one coordinator with stage input/output contracts',
      'workflow-coordinator',
      'Workflow skill + protocols',
    ],
    [
      'Run the entire complex workflow on one model',
      'Route scoped work; validate small returns',
      'model-routing',
      'Native agents + report gate',
    ],
  ],

  automation() {
    return `<div class="automation-map14">
      <div class="map-head14">
      <strong>Familiar manual action</strong>
      <span>
      </span>
      <strong>Optimized counterpart</strong>
      <strong>Implementation → package</strong>
      </div>${this.mapping14
        .map(
          ([
            manual,
            automatic,
            id,
            artifact,
          ]) => `<div class="mapping-row14" data-manual-map="${id}">
      <p>${this.esc(manual)}</p>
      <span class="mapping-wire14" aria-hidden="true">⟶</span>
      <button data-mapping-detail="${id}">${this.esc(automatic)}</button>
      <div>
      <span>${this.esc(artifact)}</span>${this.techniqueLink14(id, 'Choose technique')}</div>
      </div>`,
        )
        .join(
          '',
        )}<p class="mapping-scope14">Native auto-compaction is already provided by the harness. Hooks prepare/restore state; protocols guide behavior; validators check structure. Verify actual task outcomes.</p>
      </div>`;
  },

  recipes(s) {
    const selected = s.selectedTechniques,
      command = selected.length
        ? `node install.mjs --harness ${s.kitHarness} --techniques ${selected.join(',')} --target /path/to/project`
        : 'Select a bundle or technique.';
    return `<div class="packages14">
      <div class="package-intro14">
      <p>
      <strong>Choose a bundle, or just its parts.</strong> Parent checkboxes select every technique; mixed state means a partial bundle. Required dependencies are included and shown in each technique’s details.</p>
      <label>Target <select id="kitHarness">${[
        ['opencode', 'OpenCode'],
        ['claude', 'Claude Code'],
        ['codex', 'Codex'],
        ['portable', 'Portable helpers'],
      ]
        .map(
          ([id, label]) =>
            `<option value="${id}" ${s.kitHarness === id ? 'selected' : ''}>${label}</option>`,
        )
        .join('')}</select>
      </label>
      </div>
      <div class="bundle-grid14">${atlasKits08
        .map((bundle) => {
          const chosen = bundle.techniques.filter((id) => selected.includes(id)).length;
          return `<section class="bundle-card14" data-bundle-card="${bundle.id}">
      <header>
      <label>
      <input type="checkbox" data-bundle-selection="${bundle.id}" ${chosen === bundle.techniques.length ? 'checked' : ''} data-mixed="${chosen > 0 && chosen < bundle.techniques.length}">
      <strong>${this.esc(bundle.name)}</strong>
      </label>
      <span>Bundle · ${chosen}/${bundle.techniques.length}</span>
      </header>
      <p>${this.esc(bundle.purpose)}</p>
      <div class="standalone-list14">${bundle.techniques
        .map((id) => {
          const t = this.technique14(id);
          return `<div class="standalone14 ${s.focusTechnique === id ? 'focused14' : ''}" id="technique-${id}">
      <label>
      <input type="checkbox" data-technique-selection="${id}" ${selected.includes(id) ? 'checked' : ''}>
      <span>${this.esc(t.name)}<small>${this.esc(t.mechanism)}</small>
      </span>
      </label>
      <button data-mapping-detail="${id}" aria-label="Details for ${this.esc(t.name)}">↗</button>
      </div>`;
        })
        .join('')}</div>
      </section>`;
        })
        .join('')}</div>
      <section class="install-panel14">
      <strong>${selected.length} techniques selected · preview first</strong>
      <code id="installCommand">${this.esc(command)}</code>
      <p>Extract the archive, run this preview command, inspect the listed files locally, then repeat with <code>--apply</code> when authorized. Existing bundle commands (<code>--kits</code>) still work.</p>
      <div>
      <a href="kits/context-kits.zip" download>Download project packages ↓</a>
      <button id="copyInstallCommand" ${!selected.length ? 'disabled' : ''}>Copy preview command</button>
      <button id="inspectPackageFiles14">Selected files + support ↗</button>
      <button data-view="audit">Global Claude audit →</button>
      </div>
      <p>Claude: selected native hooks/agents. OpenCode: existing continuity adapter when both reminder + compaction techniques are selected; otherwise portable guidance. Codex: portable protocols/helpers here. Native runtime validation required; no permission or telemetry-export changes.</p>
      </section>
      </div>`;
  },

  detail14(s, id, mode = 'managed', actor = '') {
    const step = s.view === 'orchestration' ? s.orchStep : s.step;
    const state = actor
      ? actor === 'single'
        ? AtlasModel14.at(step)
        : actor === 'parent'
          ? AtlasModel14.parent(step)
          : AtlasModel14.worker(step, actor)
      : AtlasModel14.at(step, mode);
    if (!state) return '<p>This worker has not started. No input or calls are attributed yet.</p>';
    const before = step
      ? actor
        ? actor === 'single'
          ? AtlasModel14.at(step - 1)
          : actor === 'parent'
            ? AtlasModel14.parent(step - 1)
            : AtlasModel14.worker(step - 1, actor)
        : AtlasModel14.at(step - 1, mode)
      : null;
    if (id === 'overview')
      return `<h3>Ordered input · ${this.count(state.total)} tokens</h3>
      <p>Authored scenario budgets, not native token measurements. Selection, compaction and report returns alter the prepared input; cache reads still count as input.</p>${this.tokenRows14(state, { mini: true, actor, mode })}`;
    const row = state.layers.find((l) => l.id === id),
      old = before?.layers.find((l) => l.id === id)?.tokens || 0,
      n = row?.tokens || 0;
    const heatNow = AtlasModel10.attentionFor(state).rows.find((r) => r.id === id),
      heatBefore = before ? AtlasModel10.attentionFor(before).rows.find((r) => r.id === id) : null,
      heat = heatNow
        ? { ...heatNow, deltaPP: heatBefore ? (heatNow.weight - heatBefore.weight) * 100 : null }
        : null;
    const names = {
      base: [
        'Base harness policy',
        'Environment + tool policy',
        'Model-facing instruction allowance',
      ],
      tools: ['Read/search contracts', 'Patch contracts', 'Test/CI tool schemas'],
      guidance: ['Root task constraints', 'Applicable test guidance', 'Fixture ownership rules'],
      skills: ['Current stage instructions', 'Skill discovery metadata', 'Verification protocol'],
      task: [
        'Reported failure + scope',
        'Product-vs-test acceptance',
        'Local + CI revision checks',
      ],
      evidence: [
        'tests/fixtures/cart.ts',
        'tests/checkout.parallel.spec.ts',
        'CI failure / product source anchors',
      ],
      history: ['Relevant prior decisions', 'Tool result excerpts', 'Observed check reports'],
      checkpoint: [
        'Goal + constraints',
        'Source/revision anchors',
        'Pending work + worker reports',
      ],
    };
    const total = n || old,
      a = Math.floor(total * 0.45),
      b = Math.floor(total * 0.35),
      values = [a, b, total - a - b];
    return `<div class="component14">
      <h3>${this.esc(AtlasModel14.layers.find((l) => l[0] === id)[1])}</h3>
      <section>
      <h4>Context and change</h4>
      <p>Before <strong>${this.count(old)}</strong> → Now <strong>${this.count(n)}</strong> · Δ ${(n - old >= 0 ? '+' : '−') + this.count(Math.abs(n - old))} tokens. ${n ? 'Included in prepared input.' : 'Outside the current input.'}</p>
      </section>
      <section>
      <h4>Purpose and illustrative attention</h4>
      <p>${id === 'base' ? 'Higher-priority instructions remain present; their token count or toy attention share does not establish instruction compliance.' : 'Category: ' + this.esc(AtlasModel14.layers.find((l) => l[0] === id)[2]) + '. Context category and native message role are separate.'}</p>
      <p>${heat ? `Toy Q·K ${heat.dot.toFixed(3)} → scaled score ${heat.score.toFixed(3)} → share ${(heat.weight * 100).toFixed(2)}%. Δ ${heat.deltaPP === null ? 'new' : heat.deltaPP.toFixed(2) + ' percentage points'}.` : 'No task query or included component: no illustrative share.'} These are invented vectors, not measured native attention or confidence.</p>
      </section>
      <section>
      <h4>Example packet budgets · ${n ? 'current' : 'prior'} input</h4>${names[id]
        .map(
          (label, i) => `<p>
      <strong>${this.esc(label)}</strong> · ${this.count(values[i])} tokens</p>`,
        )
        .join(
          '',
        )}<p>These assigned full-packet budgets sum to ${this.count(total)}; labels are examples, not tokenized source excerpts.</p>
      </section>
      <section>
      <h4>Current workflow boundary</h4>
      <p>${this.esc(AtlasModel14.event(step).evidence)}</p>${this.boundary14(step)}</section>
      </div>`;
  },

  eventDetail14(step) {
    const e = AtlasModel14.event(step);
    return `<h3>${step} · ${this.esc(e.title)}</h3>
      <p>${this.esc(e.evidence)}</p>
      <p>
      <strong>Boundary:</strong> ${this.esc(e.boundary)}. <strong>Diagnosis at this point:</strong> ${e.classification === 'unknown' ? 'unknown' : 'test-fixture defect (authored evidence)'}.</p>${this.boundary14(step)}<p>All workflow outcomes are authored teaching examples. Compaction timing is illustrated, not a native threshold claim. Both comparisons retain native compaction. Checkpoint preparation/restoration is the added technique; semantic correctness must be checked. Summary requests and worker calls are included in the delegated cost ledger.</p>`;
  },

  techniqueDetail14(s, id) {
    const t = this.technique14(id),
      bundle = atlasKits08.find((b) => b.id === t.bundle);
    return `<h3>${this.esc(t.name)}</h3>
      <p>${this.esc(t.purpose)}</p>
      <dl>
      <dt>Mechanism</dt>
      <dd>${this.esc(t.mechanism)}</dd>
      <dt>Context affected</dt>
      <dd>${this.esc(t.layers)}</dd>
      <dt>Bundle</dt>
      <dd>${this.esc(bundle.name)} · also selectable alone</dd>
      <dt>Required dependencies</dt>
      <dd>${t.requires.length ? t.requires.join(', ') : 'None'}</dd>
      </dl>
      <p>Claude installs a supported native integration where stated. OpenCode/Codex use the delivered portable protocol/helper unless the package explicitly lists a native adapter. Instructions and schema validation do not establish factual correctness or measured savings.</p>
      <p>
      <a href="kits/${t.protocol}" target="_blank" rel="noopener noreferrer">Read the exact protocol ↗</a>
      </p>${this.techniqueLink14(id, 'Select this technique on Packages')}`;
  },

  ledger14(s, actor) {
    const d = AtlasModel14.delegation(s.orchStep, s.routes),
      calls = actor ? d.actors[actor]?.ledger || [] : [...d.single.calls, ...d.delegated.calls];
    return `${actor ? this.billing14(s, actor, d.actors[actor], d.actors[actor]?.latest, true) : ''}<p>Authored per-call accounting. Accrued input is already the sum across calls. Stable per-agent prefixes are assumed reusable within short TTL; prefix changes, resume and CI waits create cold writes. No cross-agent cache sharing. Summary overhead included. Actual usage, quality and latency are unmeasured.</p>
      <div class="ledger-table14">
      <table>
      <thead>
      <tr>
      <th>Call</th>
      <th>Event / purpose</th>
      <th>Fresh</th>
      <th>Read</th>
      <th>Write</th>
      <th>Output</th>
      <th>Cost</th>
      </tr>
      </thead>
      <tbody>${calls
        .map(
          (c) => `<tr>
      <th>${c.id}</th>
      <td>${c.step} · ${c.purpose}</td>
      <td>${this.count(c.fresh)}</td>
      <td>${this.count(c.read)}</td>
      <td>${this.count(c.write)}</td>
      <td>${this.count(c.output)}</td>
      <td>${this.money12(c.cost.total)}</td>
      </tr>`,
        )
        .join('')}</tbody>
      </table>
      </div>`;
  },

  routing14(s, actor) {
    const d = AtlasModel14.delegation(s.orchStep, s.routes),
      a = d.actors[actor],
      model = AtlasModel12.model(s.routes[actor] || AtlasModel14.defaults[actor]);
    return `<p>Reprice this actor’s entire authored scenario; this is not a native model switch. ${actor.startsWith('W') ? this.esc(atlasQA14.workers.find((w) => w.id === actor).purpose) : 'Coordinator owns decisions, edits, test execution and acceptance.'}</p>
      <div class="routing-controls12">
      <label>Provider<select id="routeProvider">${Object.entries(atlasPricing12.providers)
        .map(
          ([id, p]) =>
            `<option value="${id}" ${id === model.provider ? 'selected' : ''}>${p.label}</option>`,
        )
        .join('')}</select>
      </label>
      <label>Model<select id="routeModel">${atlasPricing12.models
        .filter((m) => m.provider === model.provider)
        .map(
          (m) =>
            `<option value="${m.id}" ${m.id === model.id ? 'selected' : ''}>${m.name}</option>`,
        )
        .join('')}</select>
      </label>
      </div>
      <div class="detail-metrics12">${this.smallMetric12('Estimated calls', a?.calls || 0)}${this.smallMetric12('Accrued input', this.count(a?.input || 0))}${this.smallMetric12('Estimated cost', this.money12(a?.cost || 0))}</div>
      <p>Usage budgets are held constant when repricing. Model suitability, output length, cache hits and accepted-task quality require actual evaluation.</p>
      <button data-show-agent-ledger="${actor}">This actor’s calls + cache ↗</button>
      <button data-show-model-rates>All rates ↗</button>`;
  },
};

const legacyContent14 = {};
for (const key of ['system', 'orchestration', 'automation', 'recipes']) {
  legacyContent14[key] = AtlasContent[key];

  AtlasContent[key] = function (s) {
    return s.legacy ? legacyContent14[key].call(this, s) : AtlasContent14[key].call(this, s);
  };
}
for (const [key, fn] of Object.entries(AtlasContent14))
  if (!['system', 'orchestration', 'automation', 'recipes'].includes(key)) AtlasContent[key] = fn;
const oldRouting14 = AtlasContent.routing12,
  oldLedger14 = AtlasContent.ledger12;

AtlasContent.routing12 = function (s, actor) {
  return s.legacy ? oldRouting14.call(this, s, actor) : this.routing14(s, actor);
};

AtlasContent.ledger12 = function (s, actor) {
  return s.legacy ? oldLedger14.call(this, s, actor) : this.ledger14(s, actor);
};

const oldContents14 = AtlasContent.contents;
const referencesBefore14 = AtlasContent.references;

AtlasContent.references = function (s) {
  return referencesBefore14
    .call(this, s)
    .replace(
      '<div class="materials">',
      '<div class="materials">' +
        (!s?.legacy
          ? '<a href="research/round14/qa-workflow.json">Authored QA workflow + budgets ↗</a>' +
            '<a href="kits/qa/references/provenance.md">Package authoring sources ↗</a>' +
            '<a href="kits/README.md">Package installation + operating guide ↗</a>'
          : ''),
    );
};

AtlasContent.contents = function (s) {
  if (s.legacy) return oldContents14.call(this, s);
  return `<div class="contents14">
      <div class="central-chapters14">${[
        [
          'system',
          '01',
          'Follow one session',
          'See context loads, results and compaction inside a complete QA task.',
        ],
        [
          'orchestration',
          '02',
          'Route the same work',
          'Follow scoped worker inputs and validated returns into the coordinator.',
        ],
      ]
        .map(
          ([v, n, title, copy]) =>
            `<button data-view="${v}">
      <span>${n}</span>
      <h2>${title}</h2>
      <p>${copy}</p>
      <strong>Explore the working system →</strong>
      </button>`,
        )
        .join('')}</div>
      <div class="support-chapters14">${[
        ['automation', 'Manual → automated'],
        ['recipes', 'Choose bundles or techniques'],
        ['loading', 'Native loading rules'],
        ['cache', 'Cache computation'],
        ['attention', 'Goal reliability + evidence'],
        ['hooks', 'Lifecycle integrations'],
        ['audit', 'Audit your own sessions'],
        ['qa', 'Optional QA foundations'],
        ['references', 'Sources + materials'],
      ]
        .map(([id, label]) => `<button data-view="${id}">${label} →</button>`)
        .join('')}</div>
      </div>`;
};
