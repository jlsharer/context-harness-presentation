'use strict';
const AtlasModel = {
  ids: [
    'welcome',
    'contents',
    'qa',
    'system',
    'automation',
    'orchestration',
    'loading',
    'cache',
    'attention',
    'hooks',
    'recipes',
    'audit',
    'references',
  ],
  state: {},

  source(id) {
    const x = atlasSources.sources.find((s) => s.id === id);
    if (!x) throw Error('Unknown source ' + id);
    return x;
  },
};

const A = (id) => document.getElementById(id),
  origins = new Map();

const views = {
  qa: [
    'QA / CONTEXT AND WORKFLOW FOUNDATIONS',
    'Build a repeatable QA workflow.',
    'Understand how context, harness automation and session evidence support QA.',
    ['context-engineering', 'claude-context'],
  ],
  automation: [
    'FROM MANUAL EFFORT TO AUTOMATION',
    'Put the repeated work into the harness.',
    'Choose a familiar action; follow its mechanism, artifact and outcome check.',
    ['claude-hooks', 'claude-skills', 'claude-subagents'],
  ],
  audit: [
    'IMPROVE YOUR OWN SETUP',
    'Find the opportunity. Choose the change.',
    'A prepared sample demonstrates a real, downloadable Claude audit workflow.',
    ['claude-monitoring', 'claude-commands', 'claude-hooks'],
  ],
  welcome: [
    'PURPOSE / A CONTEXT CONTROL WORKSHOP',
    'Build a harness that keeps the goal in view.',
    'Understand the levers, then install the techniques that fit your workflow.',
    ['context-engineering'],
  ],
  contents: [
    'CONTENTS / FROM LOW EFFORT TO PRECISE CONTROL',
    'Follow the context through the system.',
    'A live presentation and an explorable engineering field guide.',
    ['context-engineering'],
  ],
  system: [
    '01 / SINGLE SESSION',
    'Show the technique inside the context it changes.',
    'Compare one session with and without added context policy.',
    ['opencode-hooks', 'opencode-instructions', 'opencode-skills'],
  ],
  orchestration: [
    '02 / ISOLATE DELEGATION',
    'Protect parent context without hiding worker overhead.',
    'Compare a broad parent packet with scoped workers; account for every independent call.',
    ['claude-hooks', 'opencode-hooks', 'context-engineering'],
  ],
  loading: [
    '03 / PREDICT LOADING',
    'Organize files around documented loading behavior.',
    'Inspect concrete guidance and skill examples across native harnesses.',
    ['claude-memory', 'codex-guidance', 'opencode-instructions', 'opencode-skills', 'codex-skills'],
  ],
  cache: [
    '04 / REUSE COMPUTATION',
    'Cache reads are still context.',
    'Separate provider reuse from input selection, local files and checkpoints.',
    ['openai-caching', 'anthropic-cache', 'gemini-cache'],
  ],
  attention: [
    '05 / KEEP THE GOAL',
    'Use evidence to choose a reliability control.',
    'Trace the task, read the measured outcomes, then preserve the goal through growth.',
    ['graphwalks-data', 'gemini-argon-card', 'gemini-argon-method'],
  ],
  hooks: [
    '06 / AUTOMATE THE BOUNDARY',
    'Put each policy where it can actually act.',
    'Select a lifecycle node to see the context layers, native capabilities and package.',
    ['opencode-hooks', 'opencode-events', 'claude-hooks'],
  ],
  recipes: [
    '07 / CHOOSE A PACKAGE',
    'Install a technique with a clear purpose.',
    'Portable helpers plus supported native integrations; each capability is stated.',
    ['opencode-hooks', 'claude-hooks', 'codex-skills'],
  ],
  references: [
    'REFERENCES / EVIDENCE AND MATERIALS',
    'Keep every claim attached to its scope.',
    'Primary documentation, published studies, recorded experiments and offline packages.',
    ['context-engineering'],
  ],
};

function decode(search = location.search, hash = location.hash) {
  const q = new URLSearchParams(search),
    raw = hash.slice(1),
    view = raw === 'assembly' ? 'loading' : AtlasModel.ids.includes(raw) ? raw : 'welcome',
    pick = (key, list, fallback) => (list.includes(q.get(key)) ? q.get(key) : fallback),
    num = (key, max, fallback = 0) =>
      q.has(key) && Number.isFinite(Number(q.get(key)))
        ? Math.max(0, Math.min(max, Math.trunc(Number(q.get(key)))))
        : fallback;

  return {
    legacy: q.get('legacy') === '13' || Boolean(window.ATLAS_LEGACY13),
    guide: raw === 'qa' || q.get('guide') === 'qa' ? 'qa' : '',
    qaHeat: q.get('heat') === '1',
    automationID: pick(
      'automation',
      ['reminders', 'results', 'continuity', 'workflow'],
      'reminders',
    ),
    auditStage: pick('audit', ['findings', 'choose', 'preview'], 'findings'),
    auditFinding: pick(
      'finding',
      atlasAudit13.demo.findings.map((f) => f.id),
      'verbose',
    ),
    auditSelected: q.has('packages')
      ? [
          ...new Set(
            q
              .get('packages')
              .split(',')
              .filter((id) => atlasAudit13.catalog.some((p) => p.id === id)),
          ),
        ]
      : ['results'],
    routes: Object.fromEntries(
      Object.keys(AtlasModel12.defaults).map((id) => [
        id,
        pick(
          'r' + id,
          atlasPricing12.models.map((m) => m.id),
          q.get('legacy') === '13' || window.ATLAS_LEGACY13 ? 'sonnet' : AtlasModel14.defaults[id],
        ),
      ]),
    ),
    view,
    step: num('step', q.get('legacy') === '13' || window.ATLAS_LEGACY13 ? 11 : 22, 0),
    orchStep: num('orch', q.get('legacy') === '13' || window.ATLAS_LEGACY13 ? 6 : 22),
    selectedTechniques: AtlasPackages14.resolve(
      q.has('kits') ? q.get('kits').split(',') : q.has('techniques') ? [] : ['focus', 'continuity'],
      q.has('techniques') ? q.get('techniques').split(',') : [],
    ),
    focusTechnique: pick(
      'technique',
      atlasTechniques14.map((t) => t.id),
      '',
    ),
    catalogCategory: pick(
      'catalog',
      ['bundles', 'hooks', 'workflows', 'protocols', 'helpers', 'routing'],
      'bundles',
    ),
    catalogKind: pick('catalogType', ['workflows', 'skills'], 'workflows'),
    workers: num('workers', 3, 1) || 1,
    workloadProfile: AtlasWorkload.profile(q.get('workload')),
    harness: pick('harness', ['claude', 'opencode', 'codex'], 'opencode'),
    launch: pick('launch', ['root', 'payments'], 'root'),
    loadPhase: pick('phase', ['startup', 'explore'], 'startup'),
    cacheCase: pick('cache', ['cold', 'reuse', 'edit', 'expired'], 'cold'),
    evidenceMode: pick('learn', ['walkthrough', 'results', 'mechanism'], 'walkthrough'),
    study: pick('study', ['frontier', 'position', 'signal'], 'frontier'),
    researchModel: pick('model', ['all', 'argon', 'astra', 'opus'], 'all'),
    positionModel: String(num('positionModel', 3, 0)),
    filler: pick('filler', ['questions', 'worked'], 'questions'),
    tier: '64K',
    bfsHop: num('hop', 2),
    bfsAnswer: pick('answer', ['correct', 'missing', 'extra', 'empty', 'ancestors'], 'correct'),
    reliabilityLever: pick('lever', ['reanchor', 'bound', 'restore'], 'reanchor'),
    hook: pick(
      'hook',
      [
        'start',
        'prompt',
        'dispatch',
        'pretool',
        'posttool',
        'child',
        'handoff',
        'precompact',
        'postcompact',
      ],
      'start',
    ),
    kitHarness: pick('target', ['opencode', 'claude', 'codex', 'portable'], 'opencode'),
    selectedKits: q.has('kits')
      ? [
          ...new Set(
            q
              .get('kits')
              .split(',')
              .filter((id) => atlasKits08.some((k) => k.id === id)),
          ),
        ]
      : ['focus', 'continuity'],
    presenting: q.get('present') === '1',
    weightStage: 0,
    walkthroughView: 'context',
    nativeHarness: 'opencode',
    weightQuery: 0,
    weightHead: 0,
    weightGap: 0,
    weightContent: 'base',
  };
}

function save(push = false) {
  const s = AtlasModel.state,
    u = new URL(location.href),
    extra = {
      guide: s.guide,
      heat: s.qaHeat ? '1' : '',
      automation: s.automationID === 'reminders' ? '' : s.automationID,
      audit: s.auditStage === 'findings' ? '' : s.auditStage,
      finding: s.auditFinding === 'verbose' ? '' : s.auditFinding,
      packages: s.auditSelected.join(',') === 'results' ? null : s.auditSelected.join(','),
      techniques: s.legacy ? null : s.selectedTechniques.join(','),
      technique: s.focusTechnique || null,
      catalog: s.catalogCategory === 'bundles' ? null : s.catalogCategory,
      catalogType: s.catalogKind === 'workflows' ? null : s.catalogKind,
    };
  for (const [k, v] of Object.entries(extra))
    v === null || (v === '' && !['packages', 'techniques'].includes(k))
      ? u.searchParams.delete(k)
      : u.searchParams.set(k, v);
  const fields = {
      step: 0,
      orch: 0,
      workers: 1,
      workload: 'platform',
      harness: 'opencode',
      launch: 'root',
      phase: 'startup',
      cache: 'cold',
      learn: 'walkthrough',
      study: 'frontier',
      model: 'all',
      positionModel: '0',
      filler: 'questions',
      hop: 0,
      answer: 'correct',
      lever: 'reanchor',
      hook: 'start',
      target: 'opencode',
      kits: 'focus,continuity',
      present: '',
    },
    values = {
      step: s.step,
      orch: s.orchStep,
      workers: s.workers,
      workload: s.workloadProfile,
      harness: s.harness,
      launch: s.launch,
      phase: s.loadPhase,
      cache: s.cacheCase,
      learn: s.evidenceMode,
      study: s.study,
      model: s.researchModel,
      positionModel: s.positionModel,
      filler: s.filler,
      hop: s.bfsHop,
      answer: s.bfsAnswer,
      lever: s.reliabilityLever,
      hook: s.hook,
      target: s.kitHarness,
      kits: s.selectedKits.join(','),
      present: s.presenting ? '1' : '',
    };
  for (const [k, v] of Object.entries(values))
    String(v) === String(fields[k]) ? u.searchParams.delete(k) : u.searchParams.set(k, v);
  for (const [id, model] of Object.entries(s.routes))
    model === (s.legacy ? 'sonnet' : AtlasModel14.defaults[id])
      ? u.searchParams.delete('r' + id)
      : u.searchParams.set('r' + id, model);
  if (!s.legacy) u.searchParams.delete('kits');
  u.searchParams.delete('inside');
  u.searchParams.delete('calc');
  u.hash = s.view;
  history[push ? 'pushState' : 'replaceState'](null, '', u);
}

function render(focus) {
  const s = AtlasModel.state;
  document.body.classList.toggle('round14', !s.legacy);
  AtlasModel.ids = s.legacy
    ? [
        'welcome',
        'contents',
        'qa',
        'system',
        'automation',
        'orchestration',
        'loading',
        'cache',
        'attention',
        'hooks',
        'recipes',
        'audit',
        'references',
      ]
    : [
        'welcome',
        'contents',
        'system',
        'orchestration',
        'automation',
        'loading',
        'cache',
        'attention',
        'hooks',
        'audit',
        'qa',
        'references',
        'recipes',
      ];
  let [eyebrow, title, description, sources] = views[s.view];
  document.body.dataset.view = s.view;
  document.body.classList.toggle('qa-simple13', s.guide === 'qa' && !s.qaHeat);
  A('qaGuide').hidden = s.guide !== 'qa';
  document.querySelector('.atlas-navigation').classList.toggle('guided13', s.guide === 'qa');
  document.body.classList.toggle('is-presenting', s.presenting);
  A('togglePresentation').textContent = s.presenting ? 'Exit view' : 'Present';
  A('viewEyebrow').textContent = eyebrow;
  A('viewTitle').textContent = title;
  A('viewDescription').textContent = description;
  A('semanticKey').innerHTML = ['welcome', 'contents', 'qa', 'automation', 'audit'].includes(s.view)
    ? ''
    : AtlasContent.roleKey();
  document
    .querySelectorAll('.atlas-masthead [data-view]')
    .forEach((b) =>
      s.view === b.dataset.view
        ? b.setAttribute('aria-current', 'page')
        : b.removeAttribute('aria-current'),
    );
  A('atlasCanvas').innerHTML = AtlasContent[s.view](s);
  if (!s.legacy) {
    if (['system', 'orchestration'].includes(s.view)) {
      const event = AtlasModel14.event(s.view === 'system' ? s.step : s.orchStep);
      document
        .querySelector('.replay-controls14')
        .insertAdjacentHTML(
          'afterend',
          '<p class="workflow-evidence14">' + AtlasContent.esc(event.evidence) + '</p>',
        );
    }
    for (const box of document.querySelectorAll('[data-bundle-selection]'))
      box.indeterminate = box.dataset.mixed === 'true';
    const headings = {
      system: [
        '01 / SINGLE SESSION',
        'Follow the fix through one session.',
        'See the context technique at the boundary where it acts.',
      ],
      orchestration: [
        '02 / MODEL-ROUTED DELEGATION',
        'Same QA task. Scoped workers.',
        'Follow parent input, worker context and validated returns.',
      ],
      automation: [
        '03 / MANUAL → AUTOMATED',
        'Move repeated effort into the harness.',
        'Map each familiar action to a concrete, selectable implementation.',
      ],
      recipes: [
        'PACKAGES / BUNDLES AND STANDALONE TECHNIQUES',
        'Install the parts you need.',
        'Keep a bundle, or choose its individual techniques.',
      ],
    };
    if (headings[s.view]) {
      const [eyebrow, title, copy] = headings[s.view];
      A('viewEyebrow').textContent = eyebrow;
      A('viewTitle').textContent = title;
      A('viewDescription').textContent = copy;
    }
    document.querySelector('.checkpoint').textContent = 'ROUND 14 · QA SYSTEM WALKTHROUGH';
  }
  let ids = [...sources];
  if (!s.legacy && ['system', 'orchestration', 'automation'].includes(s.view))
    for (const id of ['claude-context', 'claude-hooks']) if (!ids.includes(id)) ids.push(id);
  if (s.view === 'system') ids.push('transformer', 'rope', 'model-spec', 'instruction-hierarchy');
  if (['orchestration', 'cache'].includes(s.view)) ids.push('openai-pricing', 'anthropic-pricing');
  if (['system', 'orchestration', 'hooks'].includes(s.view) && !ids.includes('codex-hooks'))
    ids.push('codex-hooks');
  if (s.view === 'attention') {
    if (s.evidenceMode === 'mechanism')
      ids = ['cre-2026', 'context-engineering', 'opencode-hooks', 'instruction-hierarchy', 'rope'];
    else if (s.evidenceMode === 'results')
      ids =
        s.study === 'position'
          ? ['cre-2026', 'context-engineering']
          : s.study === 'signal'
            ? ['signal-2026', 'context-engineering']
            : sources;
  }
  A('sourceFooter').innerHTML =
    '<span>SOURCES</span>' +
    ids
      .map((id) => {
        const x = AtlasModel.source(id);
        return (
          '<a href="' +
          x.url +
          '" target="_blank" rel="noopener noreferrer">' +
          AtlasContent.esc(
            ['system', 'orchestration', 'cache'].includes(s.view)
              ? {
                  'model-spec': 'Instruction roles',
                  'instruction-hierarchy': 'Hierarchy research',
                  'openai-pricing': 'OpenAI rates',
                  'anthropic-pricing': 'Claude rates',
                  'openai-caching': 'OpenAI cache',
                  'anthropic-cache': 'Claude cache',
                  'gemini-cache': 'Gemini cache',
                  'claude-hooks': 'Claude hooks',
                  'context-engineering': 'Context engineering',
                  'opencode-hooks': 'OpenCode hooks',
                  'opencode-instructions': 'Instruction order',
                  'opencode-skills': 'Skills',
                  'transformer': 'Attention mechanism',
                  'rope': 'RoPE',
                  'codex-hooks': 'Codex hooks',
                }[id] || x.title
              : x.title,
          ) +
          ' ↗</a>'
        );
      })
      .join('') +
    '<span class="scope-label">' +
    (['system', 'orchestration'].includes(s.view)
      ? s.view === 'system' && s.walkthroughView === 'attention'
        ? 'Toy vectors and positions; not measured model weights.'
        : 'Modeled budgets; not native captures or measured gains.'
      : s.view === 'cache'
        ? 'Cache partitions are illustrative; verify model-specific usage and cost.'
        : 'Primary source scope is retained; examples and proposed policies are labeled.') +
    '</span>';
  const i = AtlasModel.ids.indexOf(s.view);
  A('previousView').disabled = !i;
  A('nextView').disabled = i === AtlasModel.ids.length - 1;
  A('viewPosition').textContent =
    i + 1 + ' / ' + AtlasModel.ids.length + (s.legacy ? ' · round13' : ' · round14');
  A('nextView').textContent =
    i === AtlasModel.ids.length - 1 ? 'End of checkpoint' : views[AtlasModel.ids[i + 1]][1] + ' →';
  A('changeReadout').innerHTML =
    '<p>' +
    (['welcome', 'contents'].includes(s.view)
      ? 'Build control progressively: select useful context, preserve the goal, validate outcomes.'
      : s.view === 'system' && s.walkthroughView === 'attention'
        ? 'Scores become relative weights through normalization; authority is a separate instruction-following rule.'
        : s.view === 'system'
          ? 'Context amounts and illustrative attention are different measures. Inspect a row to see the assumptions and native context definition.'
          : s.view === 'orchestration'
            ? 'Parent peak and aggregate input answer different questions. Worker calls include their own repeated context.'
            : 'Measure task acceptance and factual correctness alongside input, cache, latency and cost.') +
    '</p>';
  A('atlasStatus').textContent = title;
  document.title = title + ' | Context Engineered';
  if (focus) A(focus)?.focus({ preventScroll: true });
}

function navigate(view) {
  if (!AtlasModel.ids.includes(view)) return;
  AtlasModel.state.view = view;
  if (view === 'qa') AtlasModel.state.guide = 'qa';
  save(true);
  render();
  A('viewTitle').tabIndex = -1;
  A('viewTitle').focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

function open(id, origin) {
  origins.set(A(id), origin);
  A(id).showModal();
}

function textDialog(title, intro, text, origin, ids = []) {
  A('manifestTitle').textContent = title;
  A('manifestIntro').textContent = intro;
  A('fullManifest').textContent = text;
  A('manifestLinks').innerHTML = ids
    .map((id) => {
      const x = AtlasModel.source(id);
      return (
        '<a href="' +
        x.url +
        '" target="_blank" rel="noopener noreferrer">' +
        AtlasContent.esc(x.title) +
        ' ↗</a>'
      );
    })
    .join(' · ');
  open('manifestDialog', origin);
}

function weightRender(focus) {
  A('weightBody').innerHTML = AtlasContent.weightLab(AtlasModel.state);
  if (focus) A(focus)?.focus();
}

function researchData(study, fillerOverride) {
  const s = AtlasModel.state;
  let d, heads, rows, file;
  if (study === 'frontier') {
    d = atlasResearch06;
    heads = ['Provider', 'Model', ...d.bands];
    rows = d.models.map((m) => [m.provider, m.model, ...m.values]);
    file = 'round06/bfs-context-bands.json';
    A('dataScope').textContent = d.context;
    A('dataLimit').textContent = d.method + ' ' + d.limits;
  } else if (study === 'position') {
    d = atlasResearch05.position;
    heads = ['Model', 'Tier', 'Reasoning', 'End (%)', 'Middle (%)'];
    rows = d.models.flatMap((m) =>
      d.tiers.map((t) => [m.model, t, m.thinking, ...m[fillerOverride || s.filler][t]]),
    );
    file = 'round05/position.json';
    A('dataScope').textContent =
      'CRE2026 Tables1/16 · n50 per condition · ' + d.fillers[fillerOverride || s.filler];
    A('dataLimit').textContent = d.contextScope + ' ' + d.limits;
  } else {
    d = atlasResearch05.signal;
    heads = ['Model', 'Blind Δpp', '95% CI', 'Oracle Δpp', '95% CI'];
    rows = d.models.map((m) => [
      m.model,
      m.naive,
      m.naiveCI.join(' to '),
      m.aware,
      m.awareCI.join(' to '),
    ]);
    file = 'round05/signal-retention.json';
    A('dataScope').textContent = 'Paired full→25% retention · BABILong · n240';
    A('dataLimit').textContent = d.contextScope + ' ' + d.limits;
  }
  A('researchDataTable').innerHTML =
    '<table><thead><tr>' +
    heads.map((v) => '<th>' + AtlasContent.esc(v) + '</th>').join('') +
    '</tr></thead><tbody>' +
    rows
      .map((r) => '<tr>' + r.map((v) => '<td>' + AtlasContent.esc(v) + '</td>').join('') + '</tr>')
      .join('') +
    '</tbody></table>';
  A('dataDownload').href = 'research/' + file;
  A('dataSource').href = d.sourceUrl;
}

function inspectContext(path, layer, origin) {
  const s = AtlasModel.state;
  if (!s.legacy) {
    A('contextDetails').innerHTML = AtlasContent.detail14(
      s,
      layer || 'overview',
      path === 'uncurated' ? 'manual' : path,
    );
    A('contextTitle').textContent = 'Context component';
    if (!A('contextDialog').open) open('contextDialog', origin);
    return;
  }
  A('contextDetails').innerHTML =
    AtlasContent.componentDetails12(s, path, layer) +
    ('<p class="detail-sources12"><a href="https://model-spec.openai.com/2026-10-29.html" ' +
      'target="_blank" rel="noopener noreferrer">Instruction roles ↗</a> · <a ' +
      'href="https://opencode.ai/docs/instructions" target="_blank" rel="noopener ' +
      'noreferrer">Native loading ↗</a> · <a href="https://code.claude.com/docs/en/hooks" ' +
      'target="_blank" rel="noopener noreferrer">Claude hook contracts ↗</a></p>');
  A('contextTitle').textContent = layer
    ? AtlasModel12.component(s.step, path, s.workloadProfile, layer).label
    : path + ' · context overview';
  if (!A('contextDialog').open) open('contextDialog', origin);
}

function skillGuideRender(step = 'install', focus) {
  A('skillGuideBody').innerHTML = AtlasSkillGuide.render(step);
  A('skillGuideDialog').dataset.step = A('skillGuidePanel').dataset.guideStep;
  A('skillGuideDialog').scrollTop = 0;
  if (focus)
    A('skillGuideStep-' + A('skillGuideDialog').dataset.step)?.focus({ preventScroll: true });
}

function showSkillGuide(origin, step = 'install') {
  skillGuideRender(step);
  if (!A('skillGuideDialog').open) open('skillGuideDialog', origin);
}

function routingRender(actor, focus) {
  A('routingBody').innerHTML = AtlasContent.routing12(AtlasModel.state, actor);
  A('routingDialog').dataset.actor = actor;
  if (focus) A(focus)?.focus();
}

function packageFilesRender(key, file, mode = 'read') {
  const dialog = A('packageFilesDialog');
  const previousScroll =
    dialog.dataset.key === key
      ? A('packageFilesBody').querySelector('.explorer-tree14')?.scrollTop || 0
      : 0;
  A('packageFilesBody').innerHTML = AtlasCatalog14.preview(AtlasModel.state, key, file, mode);
  dialog.dataset.key = key;
  const view = A('packageFilesBody').querySelector('[data-preview-path]');
  dialog.dataset.file = view?.dataset.previewPath || '';
  dialog.dataset.mode = mode;
  const tree = A('packageFilesBody').querySelector('.explorer-tree14');
  if (tree) tree.scrollTop = previousScroll;
}

document.addEventListener('click', async (event) => {
  const b = event.target.closest('button');
  if (!b) return;
  const s = AtlasModel.state;
  if (
    !s.legacy &&
    (b.dataset.packagePreview ||
      b.dataset.previewFile ||
      b.dataset.previewRelative ||
      b.dataset.previewMode ||
      b.id === 'copyPreviewFile14' ||
      b.dataset.catalogCategory ||
      b.dataset.catalogKind)
  ) {
    if (b.dataset.catalogCategory || b.dataset.catalogKind) {
      if (b.dataset.catalogCategory) s.catalogCategory = b.dataset.catalogCategory;
      if (b.dataset.catalogKind) s.catalogKind = b.dataset.catalogKind;
      save();
      render();
      return;
    }
    const dialog = A('packageFilesDialog');
    if (b.dataset.previewRelative) {
      const candidate = new URL(
        b.dataset.previewRelative,
        'https://package.local/' + dialog.dataset.file,
      ).pathname.slice(1);
      const files = atlasPackageFiles14.manifests[s.kitHarness + ':' + dialog.dataset.key];
      if (files.some((f) => f.path === candidate))
        packageFilesRender(dialog.dataset.key, candidate, 'read');
      else A('atlasStatus').textContent = 'Reference is not part of this package preview.';
      return;
    }
    if (b.dataset.packagePreview) {
      packageFilesRender(b.dataset.packagePreview);
      open('packageFilesDialog', b);
      return;
    }
    if (b.id === 'copyPreviewFile14') {
      const files = atlasPackageFiles14.manifests[s.kitHarness + ':' + dialog.dataset.key],
        file = files.find((f) => f.path === dialog.dataset.file);
      try {
        await navigator.clipboard.writeText(atlasPackageFiles14.contents[file.hash]);
        b.textContent = 'Copied';
      } catch {
        b.textContent = 'Select source to copy';
      }
      return;
    }
    packageFilesRender(
      dialog.dataset.key,
      b.dataset.previewFile || dialog.dataset.file,
      b.dataset.previewMode || dialog.dataset.mode,
    );
    return;
  }
  if (
    !s.legacy &&
    (b.dataset.phaseStep !== undefined ||
      b.dataset.techniqueLink ||
      b.dataset.context14 ||
      b.dataset.eventDetail !== undefined ||
      b.dataset.mappingDetail ||
      b.id === 'inspectInvocation14' ||
      b.id === 'inspectPackageFiles14')
  ) {
    if (b.dataset.phaseStep !== undefined) {
      s[b.dataset.phaseLane === 'delegation' ? 'orchStep' : 'step'] = AtlasModel14.normalize(
        b.dataset.phaseStep,
      );
      save();
      render();
      return;
    }
    if (b.dataset.techniqueLink) {
      const id = b.dataset.techniqueLink;
      s.selectedTechniques = AtlasPackages14.resolve([], [...s.selectedTechniques, id]);
      s.focusTechnique = id;
      s.catalogCategory = 'bundles';
      for (const dialog of document.querySelectorAll('dialog[open]')) dialog.close();
      navigate('recipes');
      A('technique-' + id)?.scrollIntoView({ block: 'center' });
      return;
    }
    if (b.dataset.context14) {
      A('contextDetails').innerHTML = AtlasContent.detail14(
        s,
        b.dataset.context14,
        b.dataset.contextMode,
        b.dataset.contextActor,
      );
      A('contextTitle').textContent = 'Context component';
      if (!A('contextDialog').open) open('contextDialog', b);
      return;
    }
    if (b.id === 'inspectInvocation14') {
      A('ledgerBody').innerHTML = AtlasContent.ledger14(s);
      open('ledgerDialog', b);
      return;
    }
    A('auditPreviewTitle').textContent = b.dataset.mappingDetail
      ? 'Technique → implementation'
      : b.id === 'inspectPackageFiles14'
        ? 'Selected implementation scope'
        : 'QA workflow evidence';
    A('auditPreviewBody').innerHTML = b.dataset.mappingDetail
      ? AtlasContent.techniqueDetail14(s, b.dataset.mappingDetail)
      : b.id === 'inspectPackageFiles14'
        ? s.selectedTechniques.map((id) => AtlasContent.techniqueDetail14(s, id)).join('<hr>')
        : AtlasContent.eventDetail14(Number(b.dataset.eventDetail));
    open('auditPreviewDialog', b);
    return;
  }
  if (b.hasAttribute('data-show-skill-guide')) {
    showSkillGuide(b);
    return;
  }
  if (b.dataset.skillGuideStep) {
    skillGuideRender(b.dataset.skillGuideStep, true);
    return;
  }
  if (b.dataset.copySkillSnippet || b.id === 'copySkillGuideLink') {
    let text;
    if (b.dataset.copySkillSnippet) text = AtlasSkillGuide.snippets[b.dataset.copySkillSnippet];
    else {
      const link = new URL('atlas.html', location.href);
      link.searchParams.set('help', 'skill');
      link.searchParams.set('helpStep', A('skillGuideDialog').dataset.step);
      link.hash = 'qa';
      text = link.href;
    }
    try {
      await navigator.clipboard.writeText(text);
      A('skillGuideStatus').textContent =
        b.id === 'copySkillGuideLink' ? 'Link copied' : 'Command or prompt copied';
    } catch {
      A('skillGuideStatus').textContent =
        'Select the displayed text to copy it. Shareable link: ' +
        (b.id === 'copySkillGuideLink' ? text : 'use Copy link below.');
    }
    return;
  }
  if (b.dataset.qaJump) {
    s.guide = 'qa';
    if (b.dataset.qaAnchor === 'system') s.step = 0;
    navigate(b.dataset.qaJump);
    return;
  }
  if (b.dataset.qaPreset !== undefined) {
    s.step = Number(b.dataset.qaPreset);
    save();
    render();
    return;
  }
  if (b.dataset.automation) {
    s.automationID = b.dataset.automation;
    save();
    render('automation-' + s.automationID);
    return;
  }
  if (b.dataset.auditStage) {
    s.auditStage = b.dataset.auditStage;
    save();
    render('auditStage-' + s.auditStage);
    return;
  }
  if (b.dataset.auditFinding) {
    s.auditFinding = b.dataset.auditFinding;
    save();
    render('finding-' + s.auditFinding);
    return;
  }
  if (b.id === 'toggleQaHeat') {
    s.qaHeat = !s.qaHeat;
    save();
    render('toggleQaHeat');
    return;
  }
  if (b.id === 'exitQaGuide') {
    s.guide = '';
    s.qaHeat = false;
    navigate(s.view === 'qa' ? 'contents' : s.view);
    return;
  }
  const detail13 = {
    showAuditPreview: ['Selected artifacts + integration', () => AtlasContent.auditPreview13(s)],
    showAuditMethod: ['Coverage + interpretation', () => AtlasContent.auditMethod13()],
    showAutomationMore: [
      'More manual → automated techniques',
      () => AtlasContent.automationMore13(),
    ],
  }[b.id];
  if (detail13) {
    A('auditPreviewTitle').textContent = detail13[0];
    A('auditPreviewBody').innerHTML = detail13[1]();
    open('auditPreviewDialog', b);
    return;
  }
  if (b.dataset.nativeTarget) {
    s.harness = b.dataset.nativeTarget;
    save();
    render('nativePick-' + s.harness);
    return;
  }
  if (b.dataset.walkthroughView) {
    s.walkthroughView = b.dataset.walkthroughView;
    if (s.walkthroughView === 'attention') s.weightStage = 0;
    save();
    render(s.walkthroughView === 'attention' ? 'walkthroughAttention' : 'walkthroughContext');
    return;
  }
  if (b.dataset.weightQuery !== undefined || b.dataset.weightStage !== undefined) {
    if (b.dataset.weightQuery !== undefined) s.weightQuery = Number(b.dataset.weightQuery);
    else s.weightStage = Number(b.dataset.weightStage);
    const focus = b.id;
    if (A('weightDialog').open) weightRender(focus);
    else {
      save();
      render(focus);
    }
    return;
  }
  if (b.dataset.nativeHarness) {
    s.nativeHarness = b.dataset.nativeHarness;
    A('nativeOrder').innerHTML = AtlasContent.nativeAssembly09(s.nativeHarness);
    A('assembly-' + s.nativeHarness).focus({ preventScroll: true });
    return;
  }
  if (b.dataset.view) {
    navigate(b.dataset.view);
    return;
  }
  if (b.dataset.contextPath) {
    inspectContext(b.dataset.contextPath, null, b);
    return;
  }
  if (b.dataset.workloadLayer) {
    inspectContext(b.dataset.workloadPath, b.dataset.workloadLayer, b);
    return;
  }
  if (b.dataset.hook || b.dataset.selectHook) {
    s.hook = b.dataset.hook || b.dataset.selectHook;
    if (s.view !== 'hooks') navigate('hooks');
    else {
      save();
      render('hookNode-' + s.hook);
    }
    return;
  }
  if (b.dataset.kit) {
    if (!s.legacy)
      s.selectedTechniques = AtlasPackages14.resolve([b.dataset.kit], s.selectedTechniques);
    if (!s.selectedKits.includes(b.dataset.kit)) s.selectedKits.push(b.dataset.kit);
    navigate('recipes');
    return;
  }
  if (b.dataset.evidenceMode) {
    s.evidenceMode = b.dataset.evidenceMode;
    save();
    render('evidenceMode-' + s.evidenceMode);
    return;
  }
  if (b.dataset.study) {
    s.study = b.dataset.study;
    save();
    render();
    return;
  }
  if (b.dataset.bfsHop !== undefined) {
    s.bfsHop = Number(b.dataset.bfsHop);
    save();
    render('bfsHop' + s.bfsHop);
    return;
  }
  if (b.dataset.bfsAnswer) {
    s.bfsAnswer = b.dataset.bfsAnswer;
    save();
    render('bfsAnswer-' + s.bfsAnswer);
    return;
  }
  if (b.dataset.reliabilityLever) {
    s.reliabilityLever = b.dataset.reliabilityLever;
    save();
    render();
    return;
  }
  if (b.dataset.exampleFile) {
    textDialog(
      b.dataset.exampleFile,
      'Authored example for the documented loading tree, not instructions installed in your repository.',
      AtlasPlatform08.examples[b.dataset.exampleFile],
      b,
      ['claude-memory', 'codex-guidance', 'opencode-instructions'],
    );
    return;
  }
  if (b.dataset.hookExample) {
    const h = {
      ...AtlasContent.hookInfo(b.dataset.hookExample),
      selectedNative: AtlasModel09.native(s.harness, b.dataset.hookExample),
    };
    textDialog(
      h.label + ' · concrete integration',
      'Map the supported boundary to a policy; verify native version and event capabilities.',
      JSON.stringify(h, null, 2) +
        '\n\nPACKAGE PROTOCOL\n' +
        atlasKits08.find((k) => k.id === h.kit).contents +
        '\n\nHelper example:\nnode .context-kit/run.mjs ' +
        (h.kit === 'handoff'
          ? 'handoff report.json'
          : h.kit === 'continuity'
            ? 'checkpoint checkpoint.json'
            : h.kit === 'results'
              ? 'bound result.txt 8000 .context-kit/artifacts'
              : 'packet input.json'),
      b,
      [...new Set(['opencode-hooks', 'claude-hooks', ...h.selectedNative.sources])],
    );
    return;
  }
  if (b.dataset.referenceJump) {
    const group = A('references-' + b.dataset.referenceJump);
    group.open = true;
    const heading = A('reference-heading-' + b.dataset.referenceJump);
    heading.focus({ preventScroll: true });
    group.scrollIntoView({ behavior: 'auto', block: 'start' });
    return;
  }
  if (b.dataset.agentRoute) {
    routingRender(b.dataset.agentRoute);
    open('routingDialog', b);
    return;
  }
  if (b.hasAttribute('data-show-model-rates')) {
    A('pricingBody').innerHTML = AtlasContent.prices12();
    open('pricingDialog', b);
    return;
  }
  if (b.id === 'showAuthority' || b.hasAttribute('data-show-authority')) {
    A('authorityBody').innerHTML =
      AtlasContent.authority12(s, b.dataset.authorityPath || 'managed') +
      ('<p><a href="https://model-spec.openai.com/2026-10-29.html" target="_blank" ' +
        'rel="noopener noreferrer">OpenAI role priority ↗</a> · <a ' +
        'href="https://openai.com/index/instruction-hierarchy-challenge/" target="_blank" ' +
        'rel="noopener noreferrer">Instruction hierarchy training research ↗</a></p>');
    open('authorityDialog', b);
    return;
  }
  if (b.dataset.showAgentLedger) {
    A('ledgerBody').innerHTML = AtlasContent.ledger12(s, b.dataset.showAgentLedger);
    open('ledgerDialog', b);
    return;
  }
  const id = b.id;
  if (id === 'readHeatMap') {
    A('heatGuide').innerHTML = AtlasContent.heatGuide(s);
    open('heatDialog', b);
    return;
  }
  if (id === 'restartAtlas') {
    AtlasModel.state = decode('', '#welcome');
    save(true);
    render();
    A('viewTitle').tabIndex = -1;
    A('viewTitle').focus({ preventScroll: true });
    window.scrollTo(0, 0);
    return;
  }
  if (id === 'inspectBaseInstructions') {
    textDialog(
      'What the Instructions row includes',
      '6,000 is an increased scenario allowance, held equal across parent and workers. It is not a measured native baseline.',
      AtlasModel10.baseDefinition +
        ('\n\nSeparate rows count repository guidance, tool schemas, skill contents, current task ' +
          'and source evidence. Learned model weights/training are not serialized prompt text. ' +
          'Provider-injected overhead must be measured for the selected API/model/configuration; ' +
          'it is not inferred here.'),
      b,
      AtlasModel10.nativeEvidence(s.harness).sources,
    );
    return;
  }
  if (id === 'inspectNativeEvidence') {
    const e = AtlasModel10.nativeEvidence(s.harness),
      boundary = AtlasModel09.native(
        s.harness,
        s.view === 'orchestration'
          ? ['dispatch', 'child', 'pretool', 'posttool', 'handoff', 'dispatch', 'dispatch'][
              s.orchStep
            ]
          : AtlasReplay08.at(s.step).hook,
      );
    textDialog(
      e.label + ' · scoping + overhead evidence',
      'Base6,000 is an authored allowance held equal. No universal full native total is inferred from a partial provider overhead.',
      JSON.stringify(
        {
          scenario: {
            baseInstructions: AtlasModel10.baseTokens,
            parentTools: 6500,
            parentSkills: 2500,
            workerPackets: AtlasModel10.packets,
          },
          ...e,
          nativeBoundary: boundary,
        },
        null,
        2,
      ),
      b,
      [...new Set([...e.sources, ...boundary.sources])],
    );
    return;
  }

  if (id === 'togglePresentation') {
    s.presenting = !s.presenting;
    save();
    render();
    return;
  }
  if (id === 'stepBack' || id === 'stepForward') {
    s.step = (s.legacy ? AtlasReplay08 : AtlasModel14).normalize(
      s.step + (id === 'stepBack' ? -1 : 1),
    );
    save();
    render(id);
    return;
  }
  if (id === 'orchBack' || id === 'orchForward') {
    s.orchStep = Math.max(
      0,
      Math.min(s.legacy ? 6 : 22, s.orchStep + (id === 'orchBack' ? -1 : 1)),
    );
    save();
    render(id);
    return;
  }
  if (id === 'inspectWorkload') {
    textDialog(
      'Workload budgets + recorded scale',
      'All comparison amounts are modeled. Recorded peaks are from different service runs, not a matched policy-gain experiment.',
      JSON.stringify(AtlasModel10.workload(), null, 2),
      b,
    );
    return;
  }
  if (id === 'inspectSummary08') {
    textDialog(
      'Auxiliary summary requests',
      'Separate S1 inputs for both paths; output enters its parent checkpoint once, after completion.',
      JSON.stringify(
        ['uncurated', 'managed'].map((p) => AtlasModel10.summary(s.step, p, s.workloadProfile)),
        null,
        2,
      ),
      b,
      ['opencode-hooks'],
    );
    return;
  }
  if (id === 'inspectInvocationLedger') {
    A('ledgerBody').innerHTML = AtlasContent.ledger12(s);
    open('ledgerDialog', b);
    return;
  }
  if (
    id === 'showWeights' ||
    id === 'showMechanism' ||
    id === 'showPositionTerms' ||
    id === 'showBfsTerms'
  ) {
    Object.assign(s, {
      weightStage: 0,
      weightQuery: 0,
      weightHead: 0,
      weightGap: 0,
      weightContent: 'base',
      weightAdvanced: false,
    });
    weightRender();
    open('weightDialog', b);
    return;
  }
  if (id === 'showLogits') {
    open('researchDialog', b);
    return;
  }
  if (id === 'showNativeOrder') {
    s.nativeHarness = s.harness;
    A('nativeOrder').innerHTML = AtlasContent.nativeAssembly09(s.nativeHarness);
    open('nativeDialog', b);
    return;
  }
  if (id === 'inspectNativePolicy') {
    const h = AtlasModel09.native(s.harness, AtlasReplay08.at(s.step).hook);
    textDialog(
      'Native boundary · ' + s.harness,
      'Same illustrative budgets; native hook names and powers differ.',
      JSON.stringify(h, null, 2),
      b,
      h.sources,
    );
    return;
  }
  if (id === 'showResearchData') {
    researchData(
      b.dataset.forceStudy || s.study,
      b.dataset.forceStudy === 'position' ? 'questions' : undefined,
    );
    open('dataDialog', b);
    return;
  }
  if (id === 'openStudyPolicy') {
    s.hook = s.study === 'signal' ? 'postcompact' : s.study === 'position' ? 'prompt' : 'dispatch';
    navigate('hooks');
    return;
  }
  if (id === 'inspectCacheUsage') {
    textDialog(
      'Provider cache accounting',
      'Illustrative usage fields, not a request we executed. Missing data stays unknown. Real totals/eligibility are model and API specific.',
      'OpenAI newer-model example:\n{"input_tokens":20000,"input_tokens_details":{"cached_tokens":14000,"cache_write_tokens":0}}\n\nAnthropic example:\n{"input_tokens":6000,"cache_read_input_tokens":14000,"cache_creation_input_tokens":0}\nTotal = read + creation + fresh.\n\nGemini4: usage.total_cached_tokens reports reused tokens. Capture total input from the actual API/SDK response; do not infer write usage from another provider’s fields.\n\nKeep stable prefix versions and native tool ordering consistent. Compare actual read/write/fresh counts, total cost and latency over repeated tasks.',
      b,
      ['openai-caching', 'anthropic-cache', 'gemini-cache'],
    );
    return;
  }
  if (id === 'inspectPackageFiles') {
    textDialog(
      'Selected package capabilities',
      'Installer adds native reference discovery and portable helpers. Only supported, ' +
        'selected native adapters are activated; runtime validation is still required.',
      JSON.stringify(
        {
          target: s.kitHarness,
          selected: atlasKits08.filter((k) => s.selectedKits.includes(k.id)),
          files: ['.context-kit/core.mjs', 'run.mjs', 'hook.mjs', 'PROTOCOLS.md', 'selection.json'],
          native: {
            claude:
              'Merge selected hooks into .claude/settings.json; reference skill in .claude/skills',
            opencode:
              'Selected V2 adapter under .opencode/plugins; reference skill under .opencode/skills',
            codex: 'Reference skill under .agents/skills; portable protocol/helpers',
            portable: 'Helpers and protocols only',
          },
        },
        null,
        2,
      ),
      b,
      ['claude-hooks', 'opencode-hooks', 'codex-skills'],
    );
    return;
  }
  if (id === 'copyInstallCommand') {
    try {
      await navigator.clipboard.writeText(A('installCommand').textContent);
      A('atlasStatus').textContent = 'Install command copied';
      b.textContent = 'Copied';
    } catch {
      A('atlasStatus').textContent = 'Select the command text to copy it';
    }
    return;
  }
  if (b.hasAttribute('data-close')) b.closest('dialog').close();
});
document.addEventListener('input', (event) => {
  const s = AtlasModel.state;
  if (event.target.id === 'sessionStep')
    s.step = (s.legacy ? AtlasReplay08 : AtlasModel14).normalize(event.target.value);
  else if (event.target.id === 'orchStep')
    s.orchStep = Math.max(0, Math.min(s.legacy ? 6 : 22, Number(event.target.value)));
  else return;
  save();
  render(event.target.id);
});
document.addEventListener('change', (event) => {
  const e = event.target,
    s = AtlasModel.state;
  if (!s.legacy && (e.dataset.techniqueSelection || e.dataset.bundleSelection)) {
    const ids = e.dataset.bundleSelection
      ? atlasKits08.find((b) => b.id === e.dataset.bundleSelection).techniques
      : [e.dataset.techniqueSelection];
    s.selectedTechniques = e.checked
      ? AtlasPackages14.resolve([], [...s.selectedTechniques, ...ids])
      : ids.reduce((next, id) => AtlasPackages14.remove(next, id), s.selectedTechniques);
    save();
    render(
      e.dataset.bundleSelection
        ? 'bundleChoice-' + e.dataset.bundleSelection
        : 'techniqueChoice-' + e.dataset.techniqueSelection,
    );
    return;
  }
  if (e.dataset.auditPackage) {
    s.auditSelected = e.checked
      ? [...new Set([...s.auditSelected, e.dataset.auditPackage])]
      : s.auditSelected.filter((id) => id !== e.dataset.auditPackage);
    save();
    render('auditPackage-' + e.dataset.auditPackage);
    return;
  }
  if (e.id === 'routeProvider' || e.id === 'routeModel') {
    const actor = A('routingDialog').dataset.actor;
    s.routes[actor] = e.id === 'routeModel' ? e.value : e.value === 'openai' ? 'sol' : 'sonnet';
    save();
    render();
    origins.set(A('routingDialog'), A('agent-route-' + actor));
    routingRender(actor, e.id);
    return;
  }
  if (e.dataset.kitSelection) {
    s.selectedKits = e.checked
      ? [...new Set([...s.selectedKits, e.dataset.kitSelection])]
      : s.selectedKits.filter((k) => k !== e.dataset.kitSelection);
    save();
    render('kitChoice-' + e.dataset.kitSelection);
    return;
  }
  const map = {
      workloadProfile: 'workloadProfile',
      workerCount: 'workers',
      loadingHarness: 'harness',
      launchDirectory: 'launch',
      loadPhase: 'loadPhase',
      cacheCase: 'cacheCase',
      researchModel: 'researchModel',
      positionModel: 'positionModel',
      fillerKind: 'filler',
      kitHarness: 'kitHarness',
      weightQuery: 'weightQuery',
      weightHead: 'weightHead',
      weightGap: 'weightGap',
      weightContent: 'weightContent',
    },
    key = map[e.id];
  if (!key) return;
  s[key] = ['workers', 'weightQuery', 'weightHead', 'weightGap'].includes(key)
    ? Number(e.value)
    : e.value;
  if (key.startsWith('weight')) {
    s.weightAdvanced = true;
    if (A('weightDialog').open) weightRender(e.id);
    else {
      save();
      render(e.id);
    }
    return;
  }
  save();
  render(e.id);
});

A('previousView').onclick = () =>
  navigate(AtlasModel.ids[AtlasModel.ids.indexOf(AtlasModel.state.view) - 1]);

A('nextView').onclick = () =>
  navigate(AtlasModel.ids[AtlasModel.ids.indexOf(AtlasModel.state.view) + 1]);

for (const dialog of document.querySelectorAll('dialog'))
  dialog.addEventListener('close', () => {
    const origin = origins.get(dialog);
    if (origin?.isConnected) origin.focus();
    origins.delete(dialog);
  });

function restoreUrlState() {
  for (const dialog of document.querySelectorAll('dialog[open]')) dialog.close();
  AtlasModel.state = decode();
  render();
}

window.addEventListener('popstate', restoreUrlState);
window.addEventListener('hashchange', restoreUrlState);
document.addEventListener('keydown', (event) => {
  if (document.querySelector('dialog[open]')) return;
  if (event.key === 'Escape' && AtlasModel.state.presenting) {
    AtlasModel.state.presenting = false;
    save();
    render();
    return;
  }
  if (
    event.target.closest('button,input,select,a,textarea') ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  )
    return;
  if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
    navigate(
      AtlasModel.ids[
        AtlasModel.ids.indexOf(AtlasModel.state.view) + (event.key === 'ArrowRight' ? 1 : -1)
      ],
    );
  }
});
AtlasModel.state = decode();
save();
render();
{
  const link = new URL(location.href);
  if (link.searchParams.get('help') === 'skill') {
    showSkillGuide(
      document.querySelector('[data-show-skill-guide]'),
      link.searchParams.get('helpStep') || 'install',
    );
    link.searchParams.delete('help');
    link.searchParams.delete('helpStep');
    history.replaceState(null, '', link);
  }
}
