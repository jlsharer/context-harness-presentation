import { createHash } from 'node:crypto';

const text = (value, name, max = 20000) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max)
    throw Error(name + ' must be a nonempty string ≤ ' + max + ' characters');
  return value;
};

const strings = (value, name, nonempty = true) => {
  if (!Array.isArray(value) || (nonempty && !value.length) || value.length > 50)
    throw Error(name + ' must be an array' + (nonempty ? ' with entries' : ''));
  return value.map((v) => text(v, name, 2000));
};

export function buildPacket(input) {
  text(input.goal, 'goal');
  const constraints = strings(input.constraints, 'constraints'),
    checks = strings(input.checks, 'checks');
  if (!Array.isArray(input.sources) || !input.sources.length) throw Error('sources required');
  const body = [
    '# Current goal\n' + input.goal,
    '# Constraints\n' + constraints.join('\n'),
    '# Selected sources\n' +
      input.sources
        .map(
          (s) =>
            '## ' + text(s.path, 'source path', 500) + '\n' + text(s.text, 'source body', 1000000),
        )
        .join('\n\n'),
    '# Acceptance checks\n' + checks.join('\n'),
  ].join('\n\n');
  return {
    text: body,
    bytes: Buffer.byteLength(body),
    scope: 'Complete supplied text; byte count is not native tokens.',
  };
}

export function validateHandoff(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw Error('handoff object required');
  const allowed = ['task_id', 'summary', 'source_anchors', 'findings', 'checks', 'open_questions'];
  if (Object.keys(input).some((k) => !allowed.includes(k))) throw Error('Unknown handoff field');
  if (Buffer.byteLength(JSON.stringify(input), 'utf8') > 12000)
    throw Error('Handoff exceeds 12000 serialized UTF-8 bytes');
  text(input.task_id, 'task_id', 200);
  text(input.summary, 'summary', 2000);
  strings(input.source_anchors, 'source_anchors');
  strings(input.findings, 'findings');
  strings(input.open_questions, 'open_questions', false);
  if (!Array.isArray(input.checks) || !input.checks.length || input.checks.length > 30)
    throw Error('checks required');
  for (const c of input.checks) {
    if (
      !c ||
      typeof c !== 'object' ||
      Array.isArray(c) ||
      Object.keys(c).some((k) => !['command', 'status'].includes(k))
    )
      throw Error('Unknown check field');
    text(c.command, 'check command', 500);
    if (!['passed', 'failed', 'not-run'].includes(c.status))
      throw Error('check status must be passed, failed or not-run');
  }
  return input;
}

export function validateCheckpoint(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw Error('checkpoint required');
  if (
    Object.keys(input).some(
      (key) =>
        !['goal', 'constraints', 'source_anchors', 'open_work', 'acceptance_checks'].includes(key),
    )
  )
    throw Error('Unknown checkpoint field');
  text(input.goal, 'goal');
  for (const key of ['constraints', 'source_anchors', 'acceptance_checks'])
    strings(input[key], key);
  strings(input.open_work, 'open_work', false);
  return input;
}

export function boundResult(value, maxChars = 8000) {
  if (typeof value !== 'string') throw Error('text string required');
  if (!Number.isInteger(maxChars) || maxChars < 1 || maxChars > 1000000)
    throw Error('maxChars must be 1–1000000');
  return {
    preview: value.slice(0, maxChars),
    fullText: value,
    sha256: createHash('sha256').update(value).digest('hex'),
    originalBytes: Buffer.byteLength(value),
    truncated: value.length > maxChars,
  };
}

export function auditCache({ provider, usage = {}, before = '', now = '', observedTotal = null }) {
  const num = (v) => (Number.isFinite(v) && v >= 0 ? v : null);

  let total = null,
    read = null,
    write = null,
    fresh = null;
  if (provider === 'openai') {
    total = num(usage.input_tokens);
    read = num(usage.input_tokens_details?.cached_tokens);
    write = num(usage.input_tokens_details?.cache_write_tokens);
    if (total !== null && read !== null && write !== null) fresh = total - read - write;
  } else if (provider === 'anthropic') {
    fresh = num(usage.input_tokens);
    read = num(usage.cache_read_input_tokens);
    write = num(usage.cache_creation_input_tokens);
    if ([fresh, read, write].every((v) => v !== null)) total = fresh + read + write;
  } else if (provider === 'gemini') {
    total = num(observedTotal);
    read = num(usage.total_cached_tokens);
  } else throw Error('provider must be openai, anthropic or gemini');
  if (fresh !== null && fresh < 0) throw Error('Inconsistent usage partitions');
  let common = 0;
  while (common < Math.min(before.length, now.length) && before[common] === now[common]) common++;
  return {
    provider,
    total,
    read,
    write,
    fresh,
    identicalPrefixCharacters: common,
    prefixBeforeSha256: createHash('sha256').update(before).digest('hex'),
    prefixNowSha256: createHash('sha256').update(now).digest('hex'),
    scope:
      'Missing fields stay unknown (null). Character prefix is not a cache-token count or guaranteed hit. Read tokens remain included input.',
  };
}
