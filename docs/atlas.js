'use strict';
const AtlasModel = {
  ids: ['system', 'attention', 'hooks', 'assembly', 'recipes', 'references'],
  state: {
    view: 'system',
    sourcePolicy: 'incident',
    layoutPolicy: 'task-first',
    step: 2,
    study: 'frontier',
    hook: '',
    anchor: 'STORAGE-2',
    recipe: 'dependency',
    tier: '64K',
    filler: 'questions',
    researchModel: 'all',
    positionModel: '0',
    workloadProfile: 'platform',
    evidenceMode: 'walkthrough',
    bfsHop: 0,
    bfsAnswer: 'correct',
    attentionQuery: 6,
    presenting: false,
  },

  source(id) {
    const s = atlasSources.sources.find((s) => s.id === id);
    if (!s) throw Error('Unknown source ' + id);
    return s;
  },

  packet() {
    const files = AtlasSession.files(this.state.sourcePolicy);
    return { files, bytes: files.reduce((n, f) => n + AtlasSession.bytes(f.text), 0) };
  },
};

const A = (id) => document.getElementById(id),
  dialogOrigins = new Map();

const views = {
  system: {
    eyebrow: '01 / SEE THE CHANGING CONTEXT',
    title: 'Same harness. Different context decisions.',
    description: 'Follow managed and uncurated inputs through the same session events.',
    sources: ['opencode-hooks', 'opencode-instructions', 'opencode-skills'],
    scope: 'Modeled budgets · required contracts preserved · full native prompts not captured',
  },
  attention: {
    eyebrow: '02 / RESEARCH → A CONTROL YOU CAN TEST',
    title: 'Turn research into harness policy.',
    description:
      'Trace the task, compare model outcomes, then connect attention to a policy you can test.',
    sources: [],
    scope: 'Published studies · coding analogies are labeled',
  },
  hooks: {
    eyebrow: '03 / APPLY THE POLICY AT A SUPPORTED EVENT',
    title: 'One policy, repeated at the right boundary.',
    description: 'Connect the finding to code and an independent acceptance check.',
    sources: ['opencode-hooks', 'opencode-events', 'claude-hooks'],
    scope: 'Documented adapters · event capabilities differ',
  },
  assembly: {
    eyebrow: '04 / SOURCE → EXPLICIT REQUEST',
    title: 'Follow evidence into the request.',
    description: 'The same anchor and original text travel into both candidate layouts.',
    sources: [
      'opencode-instructions',
      'ordered-prompts',
      'openai-gpt41-layout',
      'tokenizer-reference',
    ],
    scope: 'Teaching user content · native instructions and roles stay separate',
  },
  recipes: {
    eyebrow: '05 / ADAPT THE POLICY TO YOUR HARNESS',
    title: 'Start with a small, verifiable recipe.',
    description: 'Portable helpers run offline; native integration follows your harness API.',
    sources: ['opencode-hooks', 'context-engineering'],
    scope: 'Portable code verified offline · native adapter not runtime-verified',
  },
  references: {
    eyebrow: 'REFERENCES / RESEARCH AND MATERIALS',
    title: 'Keep the source and its scope together.',
    description:
      'Current studies, background research, native hooks and original experiment materials.',
    sources: ['context-engineering'],
    scope: 'Local data and metadata · original websites need connectivity',
  },
};

function decodeState() {
  const q = new URLSearchParams(location.search),
    v = location.hash.slice(1);
  return {
    view: AtlasModel.ids.includes(v) ? v : 'system',
    sourcePolicy: q.get('sources') === 'all' ? 'all' : 'incident',
    layoutPolicy: ['evidence-first', 'task-last'].includes(q.get('layout'))
      ? q.get('layout')
      : 'task-first',
    step: AtlasSession.normalize(q.has('step') ? q.get('step') : 2),
    study:
      q.get('study') === 'position'
        ? 'position'
        : ['signal', 'length'].includes(q.get('study'))
          ? 'signal'
          : 'frontier',
    hook: atlasResearch.hooks.entries.some((h) => h.id === q.get('hook')) ? q.get('hook') : '',
    anchor: ['API-2', 'INCIDENT-2'].includes(q.get('anchor')) ? q.get('anchor') : 'STORAGE-2',
    recipe: ['placement', 'checkpoint'].includes(q.get('recipe')) ? q.get('recipe') : 'dependency',
    tier: ['8K', '32K'].includes(q.get('tier')) ? q.get('tier') : '64K',
    filler: q.get('filler') === 'worked' ? 'worked' : 'questions',
    researchModel: ['argon', 'astra', 'opus'].includes(q.get('model')) ? q.get('model') : 'all',
    positionModel: ['1', '2', '3'].includes(q.get('positionModel')) ? q.get('positionModel') : '0',
    workloadProfile: AtlasWorkload.profile(q.get('workload')),
    evidenceMode: ['results', 'mechanism'].includes(q.get('learn'))
      ? q.get('learn')
      : 'walkthrough',
    bfsHop: ['1', '2'].includes(q.get('hop')) ? Number(q.get('hop')) : 0,
    bfsAnswer: ['missing', 'extra', 'empty', 'ancestors'].includes(q.get('answer'))
      ? q.get('answer')
      : 'correct',
    attentionQuery: /^[0-7]$/.test(q.get('query') || '') ? Number(q.get('query')) : 6,
    presenting: q.get('present') === '1',
  };
}

function saveURL(push = false) {
  const s = AtlasModel.state,
    u = new URL(location.href);
  for (const [k, value, def] of [
    ['sources', s.sourcePolicy, 'incident'],
    ['layout', s.layoutPolicy, 'task-first'],
    ['step', String(s.step), '2'],
    ['study', s.study, 'frontier'],
    ['hook', s.hook, ''],
    ['anchor', s.anchor, 'STORAGE-2'],
    ['recipe', s.recipe, 'dependency'],
    ['tier', s.tier, '64K'],
    ['filler', s.filler, 'questions'],
    ['model', s.researchModel, 'all'],
    ['workload', s.workloadProfile, 'platform'],
    ['learn', s.evidenceMode, 'walkthrough'],
    ['hop', String(s.bfsHop), '0'],
    ['answer', s.bfsAnswer, 'correct'],
    ['query', String(s.attentionQuery), '6'],
    ['positionModel', s.positionModel, '0'],
    ['present', s.presenting ? '1' : '', ''],
  ])
    value === def ? u.searchParams.delete(k) : u.searchParams.set(k, value);
  u.searchParams.delete('cot');
  u.hash = s.view;
  history[push ? 'pushState' : 'replaceState'](null, '', u);
}

function render(focusId) {
  const s = AtlasModel.state,
    v = views[s.view];
  document.body.dataset.view = s.view;
  document.body.classList.toggle('is-presenting', s.presenting);
  A('togglePresentation').textContent = s.presenting ? 'Exit view' : 'Present';
  A('viewEyebrow').textContent = v.eyebrow;
  A('viewTitle').textContent = v.title;
  A('viewDescription').textContent = v.description;
  A('semanticKey').innerHTML = AtlasContent.roleKey();
  document.querySelectorAll('.atlas-masthead button[data-view]').forEach((b) => {
    if (b.dataset.view === s.view) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  const canvas = A('atlasCanvas');
  canvas.classList.toggle('references-view', s.view === 'references');
  canvas.innerHTML = AtlasContent[s.view](s, AtlasModel.packet());
  if (s.view === 'references')
    canvas.insertAdjacentHTML(
      'beforeend',
      '<div class="materials"><a href="research/round07/workloads.json">Workload assumptions + ' +
        'measured provenance ↗</a><a href="research/round06/bfs-context-bands.json">2026 BFS ' +
        'context-band data ↗</a><a href="research/round06/token-counts.json">Reference token ' +
        'manifest ↗</a><a href="research/round06/README.txt">Token counting method ↗</a>' +
        '<a href="research/round05/position.json">2026 position data ↗</a>' +
        '<a href="research/round05/signal-retention.json">2026 signal-retention data ↗</a>' +
        '<a href="policies/workshop.zip" download>Portable workshop ↓</a>' +
        '<a href="research/round04/hooks.json">Lifecycle mapping ↗</a></div>',
    );
  const i = AtlasModel.ids.indexOf(s.view);
  A('previousView').disabled = i === 0;
  A('nextView').disabled = i === 5;
  A('nextView').textContent = [
    'Research → policy →',
    'Inspect supported hooks →',
    'Follow source → request →',
    'Adapt a recipe →',
    'References + materials →',
    'End of checkpoint',
  ][i];
  A('viewPosition').textContent =
    s.view === 'references' ? 'Reference index' : i + 1 + ' / 5 · round07';
  let ids = v.sources;
  if (s.view === 'attention')
    ids =
      s.study === 'frontier'
        ? ['gemini-argon-card', 'gemini-argon-method', 'graphwalks-data']
        : s.study === 'position'
          ? ['cre-2026', 'opencode-hooks']
          : ['signal-2026', 'opencode-hooks'];
  if (s.view === 'attention' && s.evidenceMode === 'mechanism')
    ids = [...new Set([...ids, 'transformer', 'context-engineering', 'opencode-hooks'])];
  A('sourceFooter').innerHTML =
    '<span>SOURCES</span>' +
    ids
      .map((id) => {
        const x = AtlasModel.source(id);
        return (
          '<a data-source="' +
          id +
          '" href="' +
          x.url +
          '" target="_blank" rel="noopener noreferrer">' +
          AtlasContent.esc(shortTitle(id)) +
          ' ↗</a>'
        );
      })
      .join('') +
    '<span class="scope-label">' +
    v.scope +
    '</span>';
  readout();
  document.title = v.title + ' | Context Engineered';
  A('atlasStatus').textContent = v.title;
  if (focusId) A(focusId)?.focus({ preventScroll: true });
}

function shortTitle(id) {
  return (
    {
      'opencode-skills': 'Skill catalog + loading',
      'transformer': 'Causal attention mechanism',
      'opencode-hooks': 'OpenCode V2 hooks',
      'opencode-events': 'Session events',
      'claude-hooks': 'Claude Code hooks',
      'context-engineering': 'Context engineering',
      'opencode-instructions': 'Instruction order',
      'ordered-prompts': 'ACL2022 order effects',
      'openai-gpt41-layout': 'GPT-4.1 placement scope',
      'gemini-argon-card': 'Two context bands · Oct2026',
      'gemini-argon-method': 'Input subsets + method',
      'tokenizer-reference': 'Reference tokenization',
      'gemini-carbon-card': 'Model results · Oct2026',
      'gemini-carbon-method': 'Input range + method',
      'graphwalks-data': 'GraphWalks task + F1',
      'cre-2026': 'CRE2026 · Tables1/16',
      'signal-2026': 'Signal retention2026 · Table1',
    }[id] || AtlasModel.source(id).title
  );
}

function readout() {
  const s = AtlasModel.state;
  let text;
  if (s.view === 'system') {
    const e = AtlasWorkload.at(s.step, 'managed', s.workloadProfile);
    text = '<strong>' + e.label + '.</strong> ' + e.note;
  } else if (s.view === 'attention')
    text =
      '<strong>Measure task behavior.</strong> F1, task accuracy and paired accuracy change ' +
      'are different metrics. These are published experiments, not measurements of our coding fixture.';
  else if (s.view === 'hooks')
    text =
      '<strong>Candidate engineering policy.</strong> The research motivates a test; a native ' +
      'hook applies your rule. Verify missing facts, acceptance, latency and cost locally.';
  else if (s.view === 'assembly')
    text =
      '<strong>Inspect the actual text.</strong> Source selection changes both complete ' +
      'payloads. Layout changes preserve the selected bodies; no performance improvement is measured here.';
  else if (s.view === 'recipes')
    text =
      '<strong>Start offline.</strong> Replace the fixture mapping and checks, run the example, then bind it to a supported native boundary.';
  else
    text =
      '<strong>Traceable evidence.</strong> Older studies remain background references. Active ' +
      'result panels use the2026 cohorts and explicitly scoped primary research.';
  A('changeReadout').innerHTML = '<p>' + text + '</p>';
}

function navigate(view) {
  if (!AtlasModel.ids.includes(view) || view === AtlasModel.state.view) return;
  AtlasModel.state.view = view;
  saveURL(true);
  render();
}

function openDialog(id, origin) {
  const dialog = A(id);
  dialogOrigins.set(dialog, origin);
  dialog.showModal();
}

function showText(title, intro, text, origin, sourceIds = []) {
  A('manifestTitle').textContent = title;
  A('manifestIntro').textContent = intro;
  A('fullManifest').textContent = text;
  A('manifestLinks').innerHTML = sourceIds
    .map((id) => {
      const src = AtlasModel.source(id);
      return (
        '<a href="' +
        src.url +
        '" target="_blank" rel="noopener noreferrer">' +
        AtlasContent.esc(src.title) +
        ' ↗</a>'
      );
    })
    .join(' · ');
  openDialog('manifestDialog', origin);
}

function researchTable() {
  const s = AtlasModel.state;
  let d, heads, rows, file;
  if (s.study === 'frontier') {
    d = atlasResearch06;
    heads = ['Provider', 'Model', ...d.bands.map((b) => b + ' · F1 (%)')];
    rows = d.models.map((x) => [x.provider, x.model, ...x.values]);
    file = 'round06/bfs-context-bands.json';
    A('dataScope').textContent = d.title + ' · ' + d.context;
    A('dataLimit').textContent = d.method + ' ' + d.limits;
  } else if (s.study === 'position') {
    d = atlasResearch05.position;
    heads = ['Model', 'Input tier', 'Reasoning', 'End (%)', 'Middle (%)'];
    rows = d.models.flatMap((m) => d.tiers.map((t) => [m.model, t, m.thinking, ...m[s.filler][t]]));
    file = 'round05/position.json';
    A('dataScope').textContent =
      'CRE2026v1 · ' +
      d.locators[s.filler] +
      ' · 8K / 32K / 64K · ' +
      d.fillers[s.filler] +
      ' · n50 per condition';
    A('dataLimit').textContent = d.contextScope + ' ' + d.limits;
  } else {
    d = atlasResearch05.signal;
    heads = ['Model', 'Blind Δpp', '95%CI', 'Oracle-aware Δpp', '95%CI'];
    rows = d.models.map((m) => [
      m.model,
      m.naive,
      m.naiveCI.join(' to '),
      m.aware,
      m.awareCI.join(' to '),
    ]);
    file = 'round05/signal-retention.json';
    A('dataScope').textContent =
      'August2026v1 · BABILong · paired full→25% change · n240 per protocol/model';
    A('dataLimit').textContent = d.contextScope + ' ' + d.limits;
  }
  A('researchDataTable').innerHTML =
    '<table><thead><tr>' +
    heads.map((x) => '<th>' + AtlasContent.esc(x) + '</th>').join('') +
    '</tr></thead><tbody>' +
    rows
      .map(
        (r) =>
          '<tr>' +
          r
            .map(
              (v, i) =>
                '<' +
                (i ? 'td' : 'th') +
                '>' +
                AtlasContent.esc(v) +
                '</' +
                (i ? 'td' : 'th') +
                '>',
            )
            .join('') +
          '</tr>',
      )
      .join('') +
    '</tbody></table>';
  A('dataDownload').href = 'research/' + file;
  A('dataSource').href = d.sourceUrl;
}

document.addEventListener('click', (event) => {
  const b = event.target.closest('button');
  if (!b) return;
  const s = AtlasModel.state;
  if (b.dataset.view) {
    navigate(b.dataset.view);
    return;
  }
  if (b.dataset.open) {
    navigate(b.dataset.open);
    return;
  }
  if (b.dataset.step !== undefined) {
    s.step = AtlasSession.normalize(b.dataset.step);
    s.hook = '';
    saveURL();
    render();
    return;
  }
  if (b.dataset.evidenceMode) {
    s.evidenceMode = ['results', 'mechanism'].includes(b.dataset.evidenceMode)
      ? b.dataset.evidenceMode
      : 'walkthrough';
    saveURL();
    render('evidenceMode-' + s.evidenceMode);
    return;
  }
  if (b.dataset.bfsHop !== undefined) {
    s.bfsHop = Math.max(0, Math.min(2, Number(b.dataset.bfsHop) || 0));
    saveURL();
    render('bfsHop' + s.bfsHop);
    return;
  }
  if (b.dataset.bfsAnswer) {
    s.bfsAnswer = ['missing', 'extra', 'empty', 'ancestors'].includes(b.dataset.bfsAnswer)
      ? b.dataset.bfsAnswer
      : 'correct';
    saveURL();
    render('bfsAnswer-' + s.bfsAnswer);
    return;
  }
  if (b.dataset.workloadLayer || b.dataset.workloadDetail) {
    const d = AtlasWorkload.diff(s.step, b.dataset.workloadPath, s.workloadProfile),
      row = d.rows.find((l) => l.id === b.dataset.workloadLayer);
    showText(
      row ? row.label : d.now.path + ' · scenario input',
      'Assigned workload budgets, not native request tokens or measured savings. Logical teaching order, not captured native serialization.',
      JSON.stringify(row || d, null, 2),
      b,
      ['opencode-instructions', 'opencode-skills', 'opencode-hooks'],
    );
    return;
  }
  if (b.dataset.anchor) {
    s.anchor = b.dataset.anchor;
    saveURL();
    render();
    return;
  }
  if (b.dataset.layer || b.dataset.ledgerLayer) {
    const id = b.dataset.layer || b.dataset.ledgerLayer,
      d = AtlasSession.comparisonAt(s.step, s.sourcePolicy),
      scope = b.closest('[data-token-stack]')?.dataset.tokenStack,
      model = scope === 'before' ? d.reference : d.current,
      block =
        model?.blocks.find((x) => x.id === id) || d.reference?.blocks.find((x) => x.id === id);
    if (block)
      showText(
        block.label,
        'Exact teaching text. Layer tokens include its serialized heading and separators; reference tokenizer counts are not native usage.',
        block.text,
        b,
        ['tokenizer-reference'],
      );
    return;
  }
  if (b.dataset.inspectChange) {
    const d = AtlasSession.comparisonAt(s.step, s.sourcePolicy),
      kind = b.dataset.inspectChange;
    showText(
      kind.toUpperCase() + ' · exact text chunks',
      'Compared within the same session: ' +
        d.referenceLabel +
        '. Added/retained/removed refer to teaching text, not native request objects.',
      d[kind].map((x) => '### ' + x.label + ' · ' + x.origin + '\n' + x.text).join('\n\n') ||
        'None.',
      b,
    );
    return;
  }
  const id = b.id;
  if (id === 'togglePresentation') {
    s.presenting = !s.presenting;
    saveURL();
    render();
    return;
  }
  if (id === 'stepBack' || id === 'stepForward') {
    s.step = AtlasSession.normalize(s.step + (id === 'stepBack' ? -1 : 1));
    s.hook = '';
    saveURL();
    render(id);
    return;
  }
  if (id === 'inspectWorkload') {
    showText(
      'Workload assumptions + recorded scale',
      'Scenario comparisons are modeled token budgets, not measured savings. Recorded run ' +
        'peaks provide scale context only; arms/tasks differ. Full native prompts were not captured.',
      JSON.stringify(AtlasWorkload.data, null, 2),
      b,
      ['opencode-instructions', 'opencode-skills', 'opencode-hooks'],
    );
    return;
  }
  if (id === 'inspectWorkloadSummary') {
    showText(
      'S1 · separate auxiliary requests for both paths',
      'Both paths compact at the same teaching boundary. These are modeled budgets, not native ' +
        'captures. S1 inputs are not added to parent P3. Each completed checkpoint enters its ' +
        'own parent input once.',
      JSON.stringify(
        ['uncurated', 'managed'].map((path) => ({
          path,
          ...AtlasWorkload.summary(s.step, path, s.workloadProfile),
          parentAfter: s.step === 11 ? AtlasWorkload.at(11, path, s.workloadProfile).total : null,
        })),
        null,
        2,
      ),
      b,
      ['opencode-hooks'],
    );
    return;
  }
  if (id === 'inspectHook') {
    s.hook = AtlasSession.at(s.step, s.sourcePolicy).hook;
    navigate('hooks');
    return;
  }
  if (id === 'inspectSummary') {
    const q = AtlasSession.summaryRequestAt(s.step, s.sourcePolicy),
      r = atlasTokens.summaries[s.sourcePolicy],
      parent = atlasTokens.requests[s.sourcePolicy + ':11'];
    A('summaryGraphic').innerHTML =
      '<div class="summary-transform"><section><h3>S1 input · ' +
      r.tokens.toLocaleString() +
      ' tokens</h3><div class="summary-stack">' +
      r.layers
        .map(
          (l) =>
            '<div class="role-' +
            AtlasContent.blockRole(l.id) +
            '" style="flex:' +
            l.tokens +
            '" title="' +
            l.label +
            ' · ' +
            l.tokens +
            ' reference tokens"></div>',
        )
        .join('') +
      '</div><ul>' +
      r.layers
        .map((l) => '<li>' + l.label + ' · ' + l.tokens.toLocaleString() + ' tokens</li>')
        .join('') +
      ('</ul></section><section class="session-panel role-policy">' +
        '<h3>Summarize required state →</h3>' +
        '<p>Preserve constraints, sourced decisions, open work and artifact paths.</p>' +
        '<p>Separate model request in the parent session; it does not enlarge P3 or create a ' +
        'child.</p></section><section class="session-panel role-stored"><h3>') +
      (q.output ? 'Checkpoint · ' + r.outputTokens + ' tokens' : 'Checkpoint pending') +
      '</h3><p>' +
      (q.output
        ? 'The checkpoint replaces selected parent evidence/history. Next parent state: ' +
          parent.tokens +
          ' reference tokens.'
        : 'At preparation, no checkpoint has been produced. Parent state has not yet been replaced.') +
      '</p><p>Validate facts; restore sources before the next parent call.</p></section></div>';
    A('summaryText').textContent = JSON.stringify(
      {
        ...q,
        referenceInputTokens: r.tokens,
        referenceOutputTokens: q.output ? r.outputTokens : null,
      },
      null,
      2,
    );
    openDialog('summaryDialog', b);
    return;
  }
  if (id === 'inspectContext') {
    const d = AtlasSession.comparisonAt(s.step, s.sourcePolicy);
    showText(
      'Current context + exact changes',
      'Exact o200k_base reference text counts, not native provider usage. Layer allocation includes headings/separators. Compared with ' +
        d.referenceLabel +
        '.',
      'CURRENT WORKING TEXT\n\n' +
        d.current.text +
        '\n\nEXACT CHANGE CHUNKS\n\n' +
        ['added', 'retained', 'removed']
          .map(
            (k) =>
              k.toUpperCase() +
              '\n' +
              (d[k].map((x) => x.label + '\n' + x.text).join('\n\n') || 'None.'),
          )
          .join('\n\n'),
      b,
      ['tokenizer-reference'],
    );
    return;
  }
  if (id === 'inspectPolicy') {
    const p = AtlasContent.policyInfo(s.recipe);
    showText(
      p.title,
      'Portable policy code. Native integration and semantic validation must be adapted to your harness.',
      p.code + '\n\nValidation: ' + p.check + '\n\nLimit: ' + p.limit,
      b,
      ['opencode-hooks'],
    );
    return;
  }
  if (id === 'inspectSource') {
    const x = AtlasSession.anchors().find((x) => x.anchor === s.anchor);
    showText(
      x.anchor + ' · original source excerpt',
      x.name + ' · verbatim frozen fixture excerpt.',
      x.text,
      b,
    );
    return;
  }
  if (id === 'showBfsTerms') {
    showText(
      'GraphWalks · task and score',
      'Software dependency tracing is an analogy. The benchmark supplies artificial graph identifiers, not repository code.',
      'Breadth-first search (BFS): follow directed edges level by level. One hop means one ' +
        'edge; two hops means two edges. Return the nodes at the requested shortest-path depth.\n\n' +
        'Set-F1 balances precision (returned nodes that are correct) and recall (required nodes ' +
        'recovered). It is not the fraction of coding tasks passed.\n\nInput amount: up-to-128K ' +
        'and 256K–1M are separate GraphWalks subsets. Methodology reports 650 items and 200 ' +
        'problems respectively; it does not give a BFS-only count for the 650 subset.\n\nThese ' +
        'broad means cannot identify an exact degradation threshold, isolate length as the ' +
        'cause, or measure a session aging over time. All compared GraphWalks scores were ' +
        'computed by Google DeepMind. Inspect All models + data for full values.',
      b,
      ['gemini-argon-card', 'gemini-argon-method', 'graphwalks-data'],
    );
    return;
  }
  if (id === 'showPositionTerms') {
    showText(
      'Position study · terms and scope',
      'Definitions for the displayed CRE2026 experiment.',
      'GSM8K: grade-school math word problems.\n\nTask position: where the question appears ' +
        'among filler; not where supporting answer evidence appears.\n\nUnanswered-question ' +
        'filler: other questions without solutions. Worked-solution filler: questions with ' +
        'solutions.\n\nChain of Thought (CoT): intermediate reasoning text before an answer. ' +
        'Reasoning/thinking settings vary by model in this study; inspect All models + data.\n\n' +
        'Each chart shows one model, both positions and all three input tiers. Tier labels are ' +
        'not exact native usage for each prompt.',
      b,
      ['cre-2026'],
    );
    return;
  }
  if (id === 'inspectManifest') {
    showText(
      'Both complete candidate user-content requests',
      'Same selected bodies and checks; teaching serialization only. Native instructions, tools and output allowance are separate.',
      'BEFORE · EVIDENCE FIRST\n\n' +
        AtlasSession.candidate(s.sourcePolicy, 'evidence-first').text +
        '\n\n================ AFTER ================\n\n' +
        AtlasSession.candidate(s.sourcePolicy, s.layoutPolicy).text,
      b,
    );
    return;
  }
  if (id === 'inspectNative') {
    openDialog('nativeDialog', b);
    return;
  }
  if (id === 'showMechanism') {
    openDialog('mechanismDialog', b);
    return;
  }
  if (id === 'showLogits') {
    openDialog('researchDialog', b);
    return;
  }
  if (id === 'showResearchData') {
    researchTable();
    openDialog('dataDialog', b);
    return;
  }
  if (id === 'openStudyPolicy') {
    s.recipe = b.dataset.studyPolicy;
    s.hook =
      s.recipe === 'checkpoint' ? 'postcompact' : s.recipe === 'placement' ? 'prompt' : 'dispatch';
    navigate('hooks');
    return;
  }
  if (id === 'openAssemblyPolicy') {
    if (s.recipe === 'checkpoint') {
      s.step = 11;
      s.hook = 'postcompact';
      navigate('system');
      return;
    }
    if (s.recipe === 'placement') s.layoutPolicy = 'task-last';
    navigate('assembly');
    return;
  }
  if (id === 'inspectHookDetails') {
    const h = atlasResearch.hooks.entries.find(
      (x) => x.id === (s.hook || AtlasSession.at(s.step, s.sourcePolicy).hook),
    );
    showText(
      'Native hook capabilities',
      'Event observation, input transformation and completed state are distinct boundaries.',
      h.label +
        '\n\nOpenCode V2: ' +
        h.opencode +
        '\nClaude Code: ' +
        h.claude +
        '\n\n' +
        h.capability +
        '\n\nLimit: ' +
        h.limit,
      b,
      ['opencode-hooks', 'opencode-events', 'claude-hooks'],
    );
    return;
  }
  if (id === 'showNativeAdapter') {
    const text = [
      'import { Plugin } from \"@opencode/plugin\";',
      'export default Plugin.define({',
      '  id: \"workshop.context-policy\",',
      '  async setup(ctx) {',
      '    await ctx.session.hook(\"context\", event => {',
      '      event.system.push({ type: \"text\", text:',
      '        \"Use the current task, required source facts and acceptance checks. Cite source anchors.\" });',
      '    });',
      '    await ctx.session.hook(\"compaction\", event => {',
      '      event.system.push({ type: \"text\", text:',
      '        \"Preserve required constraints, source anchors, open work and artifact references.\" });',
      '    });',
      '  }',
      '});',
    ].join('\n');
    showText(
      'OpenCode V2 · source-matched adapter',
      'Teaching integration example. The portable helpers are offline-tested; this SDK adapter ' +
        'has not been runtime-verified against your installed native harness. Adapt policy ' +
        'inputs and validate behavior independently.',
      text,
      b,
      ['opencode-hooks'],
    );
    return;
  }
  if (b.hasAttribute('data-close')) b.closest('dialog').close();
});
document.addEventListener('input', (event) => {
  if (event.target.id === 'sessionStep') {
    AtlasModel.state.step = AtlasSession.normalize(event.target.value);
    AtlasModel.state.hook = '';
    saveURL();
    render('sessionStep');
  }
});
document.addEventListener('change', (event) => {
  const { id, value } = event.target,
    s = AtlasModel.state;
  if (id === 'workloadProfile') s.workloadProfile = AtlasWorkload.profile(value);
  else if (id === 'attentionQuery') s.attentionQuery = Math.max(0, Math.min(7, Number(value) || 0));
  else if (id === 'sourcePolicy') s.sourcePolicy = value;
  else if (id === 'layoutPolicy') s.layoutPolicy = value;
  else if (id === 'researchStudy') s.study = value;
  else if (id === 'hookPolicy') s.hook = value;
  else if (id === 'recipePolicy') s.recipe = value;
  else if (id === 'researchModel') s.researchModel = value;
  else if (id === 'positionModel') s.positionModel = value;
  else if (id === 'contextTier') s.tier = value;
  else if (id === 'fillerKind') s.filler = value;
  else return;
  saveURL();
  render(id);
});

A('previousView').onclick = () =>
  navigate(AtlasModel.ids[AtlasModel.ids.indexOf(AtlasModel.state.view) - 1]);

A('nextView').onclick = () =>
  navigate(AtlasModel.ids[AtlasModel.ids.indexOf(AtlasModel.state.view) + 1]);

window.addEventListener('popstate', () => {
  AtlasModel.state = decodeState();
  render();
});
window.addEventListener('hashchange', () => {
  AtlasModel.state = decodeState();
  render();
});
document.addEventListener('keydown', (event) => {
  if (document.querySelector('dialog[open]')) return;
  if (event.key === 'Escape' && AtlasModel.state.presenting) {
    AtlasModel.state.presenting = false;
    saveURL();
    render();
    return;
  }
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.target.closest('button,input,select,textarea,a')
  )
    return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    navigate(
      AtlasModel.ids[
        AtlasModel.ids.indexOf(AtlasModel.state.view) + (event.key === 'ArrowRight' ? 1 : -1)
      ],
    );
  }
});
document.querySelectorAll('dialog').forEach((dialog) =>
  dialog.addEventListener('close', () => {
    const origin = dialogOrigins.get(dialog);
    if (origin?.isConnected) origin.focus();
    dialogOrigins.delete(dialog);
  }),
);
A('nativeOrder').innerHTML =
  '<span class="sr">Documented initial instruction order, not captured native input.</span>' +
  AtlasContent.nativeOrder
    .map(
      ([name, note], i) =>
        '<div class="native-row"><span class="rank">' +
        (i + 1) +
        '</span><div><strong class="native-name">' +
        name +
        '</strong><small>' +
        note +
        '</small></div></div>',
    )
    .join('');
AtlasModel.state = decodeState();
saveURL();
render();
