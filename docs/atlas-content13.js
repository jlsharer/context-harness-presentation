'use strict';
const AtlasContent13 = {
  automationCases13: {
    reminders: {
      title: 'Stop repeating the same reminders',
      manual: '“Remember tenant isolation. Keep the API unchanged. Save the evidence.”',
      boundary: 'SessionStart · applicable prompt/tool boundaries',
      mechanism: 'Concise persistent rules + targeted context injection',
      artifact: 'Current goal + constraints + evidence anchors',
      check: 'Test the required invariant after growth, conflicting source text and compaction.',
      target: 'hooks',
      kit: 'continuity',
      note: 'Injection adds relevant context. It does not guarantee compliance or remove earlier messages.',
    },
    results: {
      title: 'Keep the evidence; shorten the repeated input',
      manual: 'Paste the entire test log into the parent conversation.',
      boundary: 'PostToolUse · successful supported Bash result',
      mechanism: 'Store full structured result → return a bounded excerpt',
      artifact: '≤8,000 characters + a path to the full result',
      check: 'Confirm the excerpt contains useful diagnostics and the full artifact can be opened.',
      target: 'system',
      kit: 'results',
      note: 'Errors, interrupted calls, images and unknown shapes stay intact. Characters are not exact tokens.',
    },
    continuity: {
      title: 'Carry the right state across a boundary',
      manual: 'Start over, reconstruct decisions, and paste the old conversation.',
      boundary: 'PreCompact → native compaction → SessionStart(compact/resume)',
      mechanism: 'Prepare a structured checkpoint; restore applicable state',
      artifact: 'Goal · constraints · source links · decisions · open checks',
      check:
        'Resume and verify what was decided, what is unfinished and which checks actually ran.',
      target: 'hooks',
      kit: 'continuity',
      note: 'Claude already auto-compacts. A fresh session is useful when the goal changes; a handoff makes it deliberate.',
    },
    workflow: {
      title: 'Run a workflow instead of relaying every step',
      manual: 'Invoke skills one by one; copy each result into the next prompt.',
      boundary: 'Coordinator → scoped stage → validated report → next stage',
      mechanism: 'One workflow skill + explicit inputs/outputs + optional routed workers',
      artifact: 'Evidence report → hypothesis → regression check → verified handoff',
      check: 'Validate the report structure, inspect sources, and evaluate the resulting QA work.',
      target: 'orchestration',
      kit: 'handoff',
      note: 'Stacking skill instructions is not an enforced sequence. Delegation is optional and adds its own requests.',
    },
  },

  qa(s) {
    return (
      '<div class="qa13"><div class="qa-story13">' +
      '<span class="qa-label13">ONE QA TASK · INVESTIGATE A RETRY FAILURE</span>' +
      '<h2>Give every call the context it needs.</h2>' +
      '<p>Investigate a retry failure. Preserve tenant isolation and the API; collect evidence ' +
      'and prepare a regression check.</p></div><div class="qa-system13"><section>' +
      '<b>CONTEXT</b><h3>The input for this call</h3><div class="qa-packets13">' +
      '<span class="role-policy">Goal + applicable instructions</span>' +
      '<span class="role-evidence">Selected code + test evidence</span>' +
      '<span class="role-stored">Relevant history + checkpoint</span></div></section>' +
      '<span class="qa-arrow13">→</span><section class="qa-harness13"><b>HARNESS</b>' +
      '<h3>The software around the model</h3><p>Assemble → invoke → run tools → observe</p>' +
      '<small>Your skills, hooks and workflows control these boundaries.</small></section>' +
      '<span class="qa-arrow13">→</span><section><b>MODEL</b>' +
      '<h3>Generate the next response</h3><p>Propose an explanation, action or test.</p>' +
      '<small>Check the result against the QA goal.</small></section></div><div class="qa-anchors13">' +
      [
        [
          'system',
          '01',
          'See context grow',
          'Context changes with every call.',
          'Inspect session context',
        ],
        [
          'automation',
          '02',
          'Automate the repetitive parts',
          'Replace repeated steps with reusable mechanisms.',
          'Explore manual → automated',
        ],
        [
          'audit',
          '03',
          'Improve your own setup',
          'Choose improvements using session evidence.',
          'Inspect the example audit',
        ],
      ]
        .map(
          ([v, n, t, p, cta]) =>
            '<button data-qa-anchor="' +
            v +
            '" data-qa-jump="' +
            v +
            '"><span>' +
            n +
            '</span><h3>' +
            t +
            '</h3><p>' +
            p +
            '</p><strong>' +
            cta +
            ' →</strong></button>',
        )
        .join('') +
      ('</div><div class="qa-bottom13"><p>' +
        '<strong>Optimize the workflow, then verify the outcome.</strong> Preserve useful ' +
        'context, traceable evidence and explicit acceptance checks.</p>' +
        '<button data-show-skill-guide>How to use the skill ↗</button>' +
        '<a href="audit/context-audit.zip" download>Download the Claude audit skill ↓</a></div></div>')
    );
  },

  automation(s) {
    const id = s.automationID,
      c = this.automationCases13[id];
    return (
      '<div class="automation13"><div class="automation-menu13">' +
      Object.entries(this.automationCases13)
        .map(
          ([key, x], i) =>
            '<button id="automation-' +
            key +
            '" data-automation="' +
            key +
            '" aria-pressed="' +
            (key === id) +
            '"><span>0' +
            (i + 1) +
            '</span><strong>' +
            x.title +
            '</strong><small>' +
            [
              'Repeated reminders',
              'Oversized logs',
              'Lost continuity',
              'Manual skill coordination',
            ][i] +
            '</small></button>',
        )
        .join('') +
      '</div><div class="automation-detail13" data-automation-detail="' +
      id +
      '"><div class="manual-card13"><span>MANUAL ACTION</span><p>' +
      c.manual +
      '</p></div><div class="automation-bridge13"><span>↓</span><strong>' +
      c.boundary +
      '</strong><span>↓</span></div><div class="automated-card13"><span>AUTOMATABLE MECHANISM</span><h2>' +
      c.mechanism +
      '</h2><p>' +
      c.artifact +
      '</p></div>' +
      (id === 'workflow'
        ? '<div class="workflow-stages13">' +
          [
            ['Evidence', 'Scoped sources'],
            ['Hypothesis', 'Explain the failure'],
            ['Regression check', 'Define acceptance'],
            ['Verification', 'Record actual results'],
          ]
            .map(
              ([t, d], i) =>
                '<div data-workflow-stage="' + i + '"><b>' + t + '</b><span>' + d + '</span></div>',
            )
            .join('') +
          '</div>'
        : '') +
      '<div class="automation-check13"><strong>Verify the outcome</strong><p>' +
      c.check +
      '</p><small>' +
      c.note +
      '</small></div><div class="automation-actions13"><button data-qa-jump="' +
      c.target +
      ('">See it in the system →</button>' +
        '<button data-qa-jump="audit">Choose an implementation →</button>' +
        '<button id="showAutomationMore">More manual → automated examples ↗</button></div></div></div>')
    );
  },

  audit(s) {
    const d = atlasAudit13.demo,
      m = d.metrics,
      selected = s.auditSelected,
      st = s.auditStage,
      f = d.findings.find((x) => x.id === s.auditFinding) || d.findings[0];
    let body = '';
    if (st === 'findings')
      body =
        '<div class="audit-findings13"><div class="finding-list13">' +
        d.findings
          .map(
            (x) =>
              '<button id="finding-' +
              x.id +
              '" data-audit-finding="' +
              x.id +
              '" aria-pressed="' +
              (f.id === x.id) +
              '"><span>P' +
              x.priority +
              ' · ' +
              x.confidence +
              ' confidence in signal</span><h3>' +
              ({
                verbose: 'Bound large successful results',
                continuity: 'Preserve a task checkpoint',
                routing: 'Test scoped model routing',
              }[x.id] || x.title) +
              '</h3><small>' +
              atlasAudit13.catalog.find((p) => p.id === x.package).effort +
              ' effort · ' +
              x.package +
              '</small></button>',
          )
          .join('') +
        '</div><section class="finding-detail13"><span>WHAT THE SELECTED RECORDS SHOW</span><h2>' +
        f.title +
        '</h2><p>' +
        f.detail +
        '</p><div class="audit-evidence13">' +
        f.evidence
          .map(
            (e) =>
              '<span>' +
              this.esc(e.file.split('/').pop()) +
              (e.line ? ':' + e.line : ' · metadata') +
              '</span>',
          )
          .join('') +
        '</div><p class="audit-caveat13">' +
        f.benefit +
        '</p><button data-audit-stage="choose">Choose a package →</button></section></div>';
    else if (st === 'choose')
      body =
        '<div class="audit-packages13">' +
        atlasAudit13.catalog
          .map(
            (p) =>
              '<label class="audit-package13 ' +
              (selected.includes(p.id) ? 'selected' : '') +
              '"><div><input id="auditPackage-' +
              p.id +
              '" type="checkbox" data-audit-package="' +
              p.id +
              '" ' +
              (selected.includes(p.id) ? 'checked' : '') +
              '><strong>' +
              p.name +
              '</strong></div><p>' +
              p.purpose +
              '</p><small>' +
              p.effort +
              ' effort · ' +
              p.optimizes +
              '</small></label>',
          )
          .join('') +
        '</div><div class="audit-choice-footer13"><p>' +
        selected.length +
        ' selected · choose independently; native integration must be tested in your installed version.</p><button data-audit-stage="preview" ' +
        (!selected.length ? 'disabled' : '') +
        '>Preview selected artifacts →</button></div>';
    else
      body =
        '<div class="audit-delivery13"><section><span>YOUR SELECTED PACKAGE MENU</span><h2>' +
        selected.map((id) => atlasAudit13.catalog.find((p) => p.id === id).name).join(' + ') +
        ('</h2><p>The download contains the real analyzer, skill, contracts and installer. This ' +
          'page uses a synthetic sample; it cannot inspect or configure your machine.</p>' +
          '<div class="audit-downloads13">' +
          '<a id="downloadAuditBundle" class="download-button" href="audit/context-audit.zip" ' +
          'download>Download Claude audit skill ↓</a>' +
          '<a id="downloadAuditSelection" href="data:application/json;charset=utf-8,') +
        encodeURIComponent(JSON.stringify({ schema: 1, packages: selected }, null, 2)) +
        ('" download="qa-context-selection.json">Download my selection ↓</a>' +
          '<button id="showAuditPreview">Inspect planned files + hooks ↗</button></div></section>' +
          '<section class="audit-install13"><h3>Start with your own evidence</h3><ol>' +
          '<li>Extract the ZIP; Node18+ required.</li>' +
          '<li>Preview the bootstrap; review the file locally, then apply.</li>' +
          '<li>Run the analyzer in your terminal; review its local report.</li>' +
          '<li>Optionally share a reviewed reduced summary with Claude; choose changes and validate.</li></ol>' +
          '<code class="audit-command13">node context-audit/scripts/cli.mjs install --claude-home ' +
          '/path/to/.claude --out bootstrap-preview.json</code>' +
          '<p>Bootstrap adds the skill only. Selected hooks require a separate concrete ' +
          'preview/apply step. The analyzer needs no model connection or collector. Claude ' +
          'interpreting shared data uses its normal connection.</p></section></div>');
    return (
      '<div class="audit13"><div class="audit-scope13">' +
      '<span>SYNTHETIC QA SESSION · PREPARED WITH THE REAL ANALYZER</span>' +
      '<p>Authored sample, not a real session. Overlapping native/OTel usage is counted once; ' +
      'savings remain unmeasured.</p></div>' +
      (st === 'findings'
        ? '<div class="audit-metrics13"><div><span>Model requests</span><strong data-audit-metric="requests">' +
          m.requests +
          '</strong></div><div><span>Accrued input · all requests</span><strong data-audit-metric="input">' +
          this.count(m.totalInput) +
          '</strong></div><div><span>Largest reported request</span><strong>' +
          this.count(m.peakInput) +
          '</strong></div><div><span>Observed in this fixture</span><strong>' +
          m.compactions +
          ' compaction</strong></div></div>'
        : '<p class="audit-summary13">Prepared sample · ' +
          m.requests +
          ' requests · ' +
          this.count(m.totalInput) +
          ' accrued input tokens · choose only the techniques you want to try.</p>') +
      '<div class="audit-steps13">' +
      [
        ['findings', '1 · Read findings'],
        ['choose', '2 · Choose packages'],
        ['preview', '3 · Inspect artifacts'],
      ]
        .map(
          ([id, t]) =>
            '<button id="auditStage-' +
            id +
            '" data-audit-stage="' +
            id +
            '" aria-pressed="' +
            (id === st) +
            '" ' +
            (id === 'preview' && !selected.length ? 'disabled' : '') +
            '>' +
            t +
            '</button>',
        )
        .join('') +
      '<button data-show-skill-guide>How to use the skill ↗</button><button id="showAuditMethod">Coverage + method ↗</button></div>' +
      body +
      '</div>'
    );
  },

  auditPreview13(s) {
    return (
      '<p>This is a package-level preview for your selection. The downloaded CLI generates ' +
      'exact machine-specific before/after contents before applying anything.</p>' +
      s.auditSelected
        .map((id) => {
          const p = atlasAudit13.catalog.find((x) => x.id === id);
          return (
            '<section class="audit-preview-package13"><h3>' +
            p.name +
            '</h3><p>' +
            p.mechanism +
            '</p><ul>' +
            p.files.map((f) => '<li>' + this.esc(f) + '</li>').join('') +
            '</ul><p>' +
            p.caveat +
            '</p></section>'
          );
        })
        .join('') +
      ('<p>Global generic code lives in <code>~/.claude/skills/context-audit/</code>. ' +
        'Repository-specific checkpoints and evidence stay under the active project. Existing ' +
        'permissions and unrelated hooks are preserved. Known project-kit continuity/results ' +
        'adapters take precedence. Full reports and credential-bearing settings previews stay ' +
        'local; reduced-summary sharing is optional.</p><p>' +
        '<a href="audit/context-audit/references/native-integration.md">Exact integration and ' +
        'rollback behavior ↗</a></p>')
    );
  },

  auditMethod13() {
    const d = atlasAudit13.demo;
    return (
      '<h3>What is observed here?</h3><p>The real offline analyzer processed the authored fixture: ' +
      d.metrics.requests +
      ' selected requests; ' +
      this.count(d.metrics.totalInput) +
      ' accrued input; ' +
      this.count(d.metrics.peakInput) +
      (' largest reported request. No real user data or native Claude execution is ' +
        'involved.</p><h3>How overlap is handled</h3><p>OTel supplies usage. ') +
      d.coverage.excludedNativeRequests +
      (' native request records are excluded from usage accounting. Native compaction/tool ' +
        'metadata remains separate. Fresh + cache read + cache write form each known request’s ' +
        'input.</p><h3>What this cannot establish</h3>' +
        '<p>Current resident context, actual attention weights, instruction compliance, task ' +
        'difficulty and counterfactual savings are not reconstructed. Real partial records keep ' +
        'unknown fields unknown. Thresholds prioritize candidates; they are not universal ' +
        'optimization rules.</p><ul>') +
      d.coverage.limits.map((x) => '<li>' + this.esc(x) + '</li>').join('') +
      ('</ul><p><a href="research/round13/demo-report.json">Full generated report ↗</a> · <a ' +
        'href="research/round13/demo-native.jsonl">Synthetic native fixture ↗</a> · <a ' +
        'href="research/round13/demo-otel.jsonl">Synthetic OTel fixture ↗</a> · <a ' +
        'href="audit/context-audit/references/telemetry.md">Accounting and limits ↗</a></p>')
    );
  },

  automationMore13() {
    return (
      '<table class="automation-more13"><thead><tr><th>Manual action</th>' +
      '<th>Automatable equivalent</th><th>Boundary / limitation</th></tr></thead><tbody>' +
      [
        [
          'Start fresh and reconstruct the old session',
          'Source-linked checkpoint and explicit handoff',
          'A new goal can justify a new session; injection does not delete history.',
        ],
        [
          'Pick a model for every stage',
          'Scoped workers with model defaults and escalation',
          'Check accepted-task quality and count worker overhead.',
        ],
        [
          'Ask the agent to save evidence repeatedly',
          'Hook-driven completion metadata + agent-written report',
          'Hooks record mechanical facts; semantic conclusions require verification.',
        ],
        [
          'Paste large reference procedures every time',
          'One workflow skill that loads relevant procedures on demand',
          'Custom commands and skills share invocation; stacking is not sequencing.',
        ],
        [
          'Assume caching makes long input free',
          'Observe read/write/fresh usage and stabilize eligible prefixes',
          'Cache reads still count as input; provider rules and TTL apply.',
        ],
      ]
        .map((row) => '<tr>' + row.map((x) => '<td>' + x + '</td>').join('') + '</tr>')
        .join('') +
      ('</tbody></table><p><a href="https://code.claude.com/docs/en/skills">Skills ↗</a> · <a ' +
        'href="https://code.claude.com/docs/en/hooks">Hooks ↗</a> · <a ' +
        'href="https://code.claude.com/docs/en/sub-agents">Subagents ↗</a></p>')
    );
  },
};
Object.assign(AtlasContent, AtlasContent13);
const systemBefore13 = AtlasContent.system,
  referencesBefore13 = AtlasContent.references;

AtlasContent.system = function (s) {
  let html = systemBefore13.call(this, s);
  if (s.guide !== 'qa') return html;
  const t = document.createElement('template');
  t.innerHTML = html;
  t.content.querySelector('.system-footer11').innerHTML =
    '<strong>Context stages</strong>' +
    [
      [0, 'Initial context'],
      [6, 'Bound successful results'],
      [9, 'Preserve a checkpoint'],
    ]
      .map(
        ([n, t]) =>
          '<button data-qa-preset="' +
          n +
          '" aria-pressed="' +
          (s.step === n) +
          '">' +
          t +
          '</button>',
      )
      .join('') +
    '<button id="toggleQaHeat">' +
    (s.qaHeat ? 'Hide' : 'Show') +
    ' attention detail</button>';
  return t.innerHTML;
};

AtlasContent.references = function () {
  return referencesBefore13
    .call(this)
    .replace(
      '<div class="materials">',
      '<div class="materials"><a href="atlas.html#qa">QA foundations ↗</a>' +
        '<a href="atlas.html?help=skill#qa">Skill installation + usage guide ↗</a>' +
        '<a href="audit/context-audit.zip" download>Claude audit skill ↓</a>',
    );
};
