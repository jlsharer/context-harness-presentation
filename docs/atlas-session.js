'use strict';
// Deterministic teaching replay. This is not a recording of an executed model run.
const AtlasSession = {
  events: [
    { label: 'Parent start', hook: 'start', session: 'parent', turn: 0, call: 0, node: 'memory' },
    { label: 'User prompt', hook: 'prompt', session: 'parent', turn: 1, call: 0, node: 'sources' },
    { label: 'Call P1', hook: 'dispatch', session: 'parent', turn: 1, call: 1, node: 'model' },
    { label: 'Before tool', hook: 'pretool', session: 'parent', turn: 1, call: 1, node: 'tools' },
    {
      label: 'Tool result',
      hook: 'posttool',
      session: 'parent',
      turn: 1,
      call: 1,
      node: 'assembler',
    },
    { label: 'Call P2', hook: 'dispatch', session: 'parent', turn: 1, call: 2, node: 'model' },
    { label: 'Child start', hook: 'child', session: 'child', turn: 1, call: 0, node: 'child' },
    { label: 'Call C1', hook: 'dispatch', session: 'child', turn: 1, call: 1, node: 'child' },
    {
      label: 'Child returns',
      hook: 'posttool',
      session: 'parent',
      turn: 1,
      call: 2,
      node: 'assembler',
    },
    { label: 'Call P3', hook: 'dispatch', session: 'parent', turn: 1, call: 3, node: 'model' },
    {
      label: 'Pre-compact',
      hook: 'precompact',
      session: 'parent',
      turn: 1,
      call: 3,
      node: 'memory',
    },
    {
      label: 'Post-compact',
      hook: 'postcompact',
      session: 'parent',
      turn: 1,
      call: 3,
      node: 'assembler',
    },
    { label: 'User turn 2', hook: 'prompt', session: 'parent', turn: 2, call: 3, node: 'sources' },
    { label: 'Call P4', hook: 'dispatch', session: 'parent', turn: 2, call: 4, node: 'model' },
  ],
  notes: [
    'Initialize sourced project guidance. The session exists; no model request has been sent.',
    'A user turn begins. Select the current task, evidence and checks; preparation is not generation.',
    'The base harness dispatches parent call P1. This assembled input is the model’s working context for this call.',
    'P1 has requested a tool. Bound the read before execution; this event does not increment the model-call count.',
    'A source-linked tool result joins selected history. Stored output and the next model-visible input are separate objects.',
    'Parent call P2 includes selected tool evidence. The user is still in turn 1; the input has changed.',
    'Initialize a child with a narrower task and source packet. Its call counter and working context are independent.',
    'Child call C1 inspects the scoped packet. The parent does not automatically receive the child’s intermediate context.',
    'The child returns a bounded handoff. Only the selected handoff enters parent context at this return boundary.',
    'Parent call P3 reads its updated request. This is the third parent invocation in the same user turn.',
    'Before compaction, choose invariants, decisions, open work and artifact references for the checkpoint.',
    'The replay replaces old working evidence/history with a checkpoint and anchor index. ' +
      'Observe and validate it; restore needed material before the next call.',
    'User turn 2 adds a request to verify concurrent retries. The same parent session resumes with retained checkpoint state.',
    'Parent call P4 uses the checkpoint, current constraints and new request. One session has spanned two turns and four parent calls.',
  ],

  normalize(n) {
    return Number.isFinite(Number(n))
      ? Math.max(0, Math.min(this.events.length - 1, Math.trunc(Number(n))))
      : 0;
  },

  files(policy) {
    return atlasEvidence.files.filter((f, i) => policy !== 'incident' || i < 8);
  },

  bytes(text) {
    return new TextEncoder().encode(text).length;
  },

  excerpt(name, anchor) {
    const f = atlasEvidence.files.find((f) => f.name === name);
    if (!f) throw Error('Unknown fixture source');
    const start = f.text.indexOf('## ' + anchor);
    if (start < 0) throw Error('Unknown anchor');
    const end = f.text.indexOf('\n## ', start + 3);
    return { name, anchor, text: f.text.slice(start, end < 0 ? undefined : end).trimEnd() };
  },

  anchors() {
    return [
      ['context/01-api-contract.md', 'API-2'],
      ['context/02-storage-contract.md', 'STORAGE-2'],
      ['context/05-incident-timeline.md', 'INCIDENT-2'],
    ].map(([n, a]) => this.excerpt(n, a));
  },

  candidate(policy, layout) {
    const files = this.files(policy),
      task = { id: 'task', label: 'Task + constraints', text: atlasEvidence.task },
      evidence = {
        id: 'evidence',
        label: 'Selected evidence',
        text: files.map((f) => `<source path="${f.name}">\n${f.text}\n</source>`).join('\n\n'),
      },
      checks = {
        id: 'checks',
        label: 'Acceptance checks',
        text: atlasEvidence.criteria.map((x, i) => `${i + 1}. ${x}`).join('\n'),
      };
    const sections =
        layout === 'task-last'
          ? [evidence, checks, task]
          : layout === 'evidence-first'
            ? [evidence, task, checks]
            : [task, evidence, checks],
      text = sections.map((x) => `### ${x.label}\n${x.text}`).join('\n\n');
    return {
      sections,
      text,
      sourceFiles: files.map((x) => x.name),
      sourceBodyBytes: files.reduce((s, f) => s + this.bytes(f.text), 0),
      bytes: this.bytes(text),
    };
  },

  at(input, policy = 'incident') {
    const step = this.normalize(input),
      event = this.events[step],
      child = event.session === 'child',
      files = child
        ? this.files(policy).filter((f) => /01-api|02-storage|05-incident/.test(f.name))
        : this.files(policy);
    const instructions = {
      id: 'instructions',
      label: 'Project policy',
      origin: 'Authored replay guidance',
      text:
        'Use current contracts. Distinguish observations from hypotheses. Preserve public API ' +
        'and tenant isolation. Cite source anchors; verify acceptance. Keep full artifacts ' +
        'retrievable outside the active request.',
    };
    let blocks = [instructions];
    if (step > 0) {
      blocks.push({
        id: 'task',
        label: child ? 'Scoped child task' : 'Current user task',
        origin: child ? 'Authored scoped task' : 'Original fixture task',
        text: child
          ? 'Inspect API-2, STORAGE-2 and INCIDENT-2. Explain how caller rejection differs from ' +
            'durable commit. Return a source-linked handoff; do not edit code.'
          : atlasEvidence.task,
      });
      blocks.push({
        id: 'evidence',
        label: child ? 'Scoped source packet' : 'Selected source material',
        origin: 'Original frozen source bodies',
        text: files.map((f) => f.text).join('\n\n'),
      });
      blocks.push({
        id: 'checks',
        label: 'Acceptance constraints',
        origin: 'Original fixture checks',
        text: atlasEvidence.criteria.join('\n'),
      });
    }
    const history = [
      'Replay P1 output: Read current contracts before deciding whether a rejected call rolled ' +
        'back. Compare durable events with reported counts. Request bounded evidence from API-2, ' +
        'STORAGE-2 and INCIDENT-2.',
      'Replay tool result (source excerpt):\n' +
        this.excerpt('context/02-storage-contract.md', 'STORAGE-2').text,
      'Replay P2 output: Keep pre-commit and post-commit paths distinct. Delegate a focused ' +
        'check of the durable identity constraint. Parent retains responsibility for ' +
        'implementing and verifying the change.',
      'Child handoff (authored replay): STORAGE-2 distinguishes no commit from lost ' +
        'acknowledgement. API-2 requires the first committed identity on retry. INCIDENT-2 ' +
        'reports a count without a committed event. Validate durable state, not caller rejection.',
      'Replay P3 output: The next change should preserve committed tenant/key identity, count ' +
        'committed orders and make recovery idempotent. Open work: implement, test concurrent ' +
        'retries, test restart recovery, and report exact verification results. This plan is not ' +
        'an accepted implementation.',
    ];
    if (!child && step >= 3)
      blocks.push({
        id: 'history',
        label: 'Selected conversation + results',
        origin: 'Authored replay + exact source excerpt',
        text: history.slice(0, step >= 10 ? 5 : step >= 8 ? 4 : step >= 4 ? 2 : 1).join('\n\n'),
      });
    if (step >= 11) {
      blocks = blocks.filter((b) => !['evidence', 'history'].includes(b.id));
      blocks.push({
        id: 'checkpoint',
        label: 'Checkpoint + source anchors',
        origin: 'Authored compaction policy example',
        text:
          'Keep API-2 durable tenant/key identity; STORAGE-2 before/after commit distinction; ' +
          'INCIDENT-2 successful-count discrepancy. Parent owns final verification. Open: ' +
          'implementation, concurrent retries and restart recovery. Full source bodies and prior ' +
          'output remain in the external store. Reload referenced sources when needed.\n\n' +
          this.anchors()
            .map((a) => `${a.anchor} → ${a.name}`)
            .join('\n'),
      });
      if (step >= 12)
        blocks.push({
          id: 'new-prompt',
          label: 'New request · user turn 2',
          origin: 'Authored follow-up prompt',
          text: 'Verify the fix under concurrent retries and restart recovery. Retain the public API and report the exact test results.',
        });
    }
    blocks = blocks.map((b) => ({ ...b, bytes: this.bytes(b.text) }));
    const text = blocks.map((b) => `### ${b.label}\n${b.text}`).join('\n\n');
    const storageQuote = this.excerpt('context/02-storage-contract.md', 'STORAGE-2').text.split(
      'Read durable',
    )[1];
    const recent = [
      instructions.text,
      atlasEvidence.task,
      'Current task, selected source bodies and acceptance checks; no tool result yet.',
      history[0],
      'Read durable' + storageQuote,
      'Read durable' + storageQuote,
      'Scoped child task with API-2, STORAGE-2 and INCIDENT-2; own context and call counter.',
      'Scoped child task with API-2, STORAGE-2 and INCIDENT-2; no child output yet.',
      history[3].split('. ')[0] + '.',
      history[3].split('. ')[0] + '.',
      history[4],
      'Checkpoint replaces old working evidence/history; source anchors and open work remain.',
      'Verify the fix under concurrent retries and restart recovery. Retain the public API.',
      'Checkpoint + request to verify concurrent retries and restart recovery.',
    ];
    const delta = {
      label: [
        'Initialized',
        'Added',
        'Prepared for P1',
        'Added from P1',
        'Added tool result',
        'New since P1',
        'Scoped for child',
        'Prepared for C1',
        'Added handoff',
        'New since P2',
        'Added from P3',
        'Replaced',
        'Added for turn 2',
        'New since P3',
      ][step],
      text: recent[step],
    };
    const changes = [
      'Prepare policy',
      'Add task + selected sources',
      'Dispatch snapshot',
      'Bound tool input',
      'Add selected tool evidence',
      'Dispatch changed input',
      'Create separate child packet',
      'Dispatch child snapshot',
      'Import selected handoff',
      'Dispatch parent + handoff',
      'Prepare checkpoint',
      'Replace old working history/evidence',
      'Add new user request',
      'Dispatch checkpoint + new task',
    ];
    return {
      ...event,
      step,
      blocks,
      text,
      bytes: this.bytes(text),
      sourceFiles: files.map((f) => f.name),
      externalFiles: atlasEvidence.files.map((f) => f.name),
      change: changes[step],
      delta,
      note: this.notes[step],
      compacted: step >= 11,
      measured: false,
    };
  },

  comparisonAt(input, policy = 'incident') {
    const current = this.at(input, policy),
      step = current.step,
      refs = { 2: 0, 5: 2, 6: null, 7: 6, 8: 5, 9: 5, 13: 9 };
    const refStep = step === 0 ? null : Object.hasOwn(refs, step) ? refs[step] : step - 1;
    const reference = refStep === null ? null : this.at(refStep, policy);
    if (reference && reference.session !== current.session) throw Error('Cross-session comparison');
    const previous = new Map((reference?.blocks || []).map((b) => [b.id, b])),
      next = new Map(current.blocks.map((b) => [b.id, b]));
    const added = [],
      retained = [],
      removed = [];
    for (const b of current.blocks) {
      const old = previous.get(b.id);
      if (!old) added.push({ ...b, change: 'new' });
      else if (old.text === b.text) retained.push({ ...b, change: 'unchanged' });
      else if (b.text.startsWith(old.text + '\n\n')) {
        retained.push({ ...old, change: 'retained prefix' });
        const text = b.text.slice(old.text.length).replace(/^\n\n/, '');
        added.push({ ...b, text, bytes: this.bytes(text), change: 'appended' });
      } else {
        removed.push({ ...old, change: 'replaced' });
        added.push({ ...b, change: 'replacement' });
      }
    }
    for (const b of previous.values())
      if (!next.has(b.id)) removed.push({ ...b, change: 'removed' });
    return {
      current,
      reference,
      added,
      retained,
      removed,
      referenceLabel: reference
        ? (reference.session === 'child' ? 'Child' : 'Parent') + ' · ' + reference.label
        : 'New ' + current.session + ' context (empty baseline)',
    };
  },

  summaryRequestAt(input, policy = 'incident') {
    const step = this.normalize(input);
    if (step !== 10 && step !== 11) return null;
    const parent = this.at(10, policy),
      instructions =
        'Create a checkpoint for the next parent request. Preserve source-linked decisions, ' +
        'API/storage constraints, acceptance checks, unresolved implementation and validation ' +
        'work, and retrievable artifact paths. Do not claim checks passed without results.';
    const text =
      instructions + '\n\n<parent-working-state>\n' + parent.text + '\n</parent-working-state>';
    return {
      id: 'S1',
      kind: 'compaction',
      session: 'parent',
      status: step === 10 ? 'prepared' : 'completed',
      input: text,
      bytes: this.bytes(text),
      output:
        step === 11 ? this.at(11, policy).blocks.find((b) => b.id === 'checkpoint').text : null,
      measured: false,
    };
  },
};
