// Exact text and ordered prefixes consumed by the offline reference tokenizer.
const fs = require('node:fs'),
  vm = require('node:vm'),
  path = require('node:path');
const root = path.resolve(__dirname, '../docs'),
  ctx = vm.createContext({ TextEncoder });
for (const f of ['atlas-evidence.js', 'atlas-session.js'])
  vm.runInContext(fs.readFileSync(root + '/' + f, 'utf8'), ctx);

const run = (s) => vm.runInContext(s, ctx),
  out = { requests: {}, summaries: {}, candidates: {} };

function ordered(model, blocks) {
  let prefix = '';
  return {
    text: model.text,
    layers: blocks.map((b, i) => {
      prefix += (i ? '\n\n' : '') + '### ' + b.label + '\n' + b.text;
      return { id: b.id, label: b.label, prefix };
    }),
  };
}

for (const policy of ['incident', 'all']) {
  for (let step = 0; step < 14; step++) {
    const m = run(`AtlasSession.at(${step},'${policy}')`);
    out.requests[policy + ':' + step] = ordered(m, m.blocks);
  }
  const q = run(`AtlasSession.summaryRequestAt(11,'${policy}')`);
  out.summaries[policy] = {
    text: q.input,
    output: q.output,
    layers: [
      {
        id: 'summary-instructions',
        label: 'Summary instructions',
        prefix: q.input.split('\n\n<parent-working-state>')[0],
      },
      { id: 'parent-transcript', label: 'Parent transcript + delimiters', prefix: q.input },
    ],
  };
  for (const layout of ['task-first', 'evidence-first', 'task-last']) {
    const m = run(`AtlasSession.candidate('${policy}','${layout}')`);
    out.candidates[policy + ':' + layout] = ordered(m, m.sections);
  }
}
process.stdout.write(JSON.stringify(out));
