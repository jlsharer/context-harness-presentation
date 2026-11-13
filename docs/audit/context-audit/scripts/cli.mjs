import fs from 'node:fs';
import path from 'node:path';
import { analyze, discover } from './analyze.mjs';
import { planInstall, applyPlan, rollback } from './install.mjs';
import { checkContract } from './contracts.mjs';
import { localOutput, writePrivate } from './local-data.mjs';
import { reducedSummary } from './summary.mjs';

const args = process.argv.slice(2),
  cmd = args.shift(),
  get = (k, f) => (args.includes(k) ? args[args.indexOf(k) + 1] : f),
  all = (k) => args.flatMap((x, i) => (x === k ? [args[i + 1]] : [])),
  json = (f) => JSON.parse(fs.readFileSync(f, 'utf8')),
  emit = (value, kind) => {
    const text = JSON.stringify(value, null, 2) + '\n',
      out = get('--out') || (kind ? localOutput(get('--claude-home'), kind) : null);
    if (out) {
      writePrivate(out, text);
      console.log('Wrote ' + out);
    } else console.log(text);
  };

try {
  if (cmd === 'discover')
    emit(discover(get('--claude-home'), Number(get('--limit', 20))), 'discovery');
  else if (cmd === 'analyze')
    emit(
      await analyze({
        claudeHome: get('--claude-home'),
        files: all('--transcript'),
        events: get('--events'),
        discover: args.includes('--discover'),
        limit: Number(get('--limit', 20)),
        since: get('--since'),
      }),
      'reports',
    );
  else if (cmd === 'summary') {
    const reportFile = get('--report');
    const value = reducedSummary(json(reportFile));
    if (args.includes('--print')) {
      if (get('--out')) throw Error('Choose --print or --out, not both');
      console.log(JSON.stringify(value, null, 2));
    } else {
      writePrivate(
        get(
          '--out',
          path.join(path.dirname(path.resolve(reportFile)), 'summary-' + path.basename(reportFile)),
        ),
        JSON.stringify(value, null, 2) + '\n',
      );
      console.log(
        'Wrote ' +
          path.resolve(
            get(
              '--out',
              path.join(
                path.dirname(path.resolve(reportFile)),
                'summary-' + path.basename(reportFile),
              ),
            ),
          ),
      );
    }
  } else if (cmd === 'install') {
    const s = get('--selection'),
      selection = s ? json(s) : null;
    if (selection && (selection.schema !== 1 || !Array.isArray(selection.packages)))
      throw Error('Selection needs schema1 and packages array');
    const plan = planInstall({
      claudeHome: get('--claude-home'),
      selected: selection ? selection.packages : get('--selected', '').split(',').filter(Boolean),
    });
    if (args.includes('--apply')) emit(applyPlan(plan));
    else emit(plan, 'previews');
  } else if (cmd === 'apply') {
    const p = json(get('--plan'));
    if (p.schema !== 1 || !p.root || !Array.isArray(p.files) || !Array.isArray(p.selected))
      throw Error('Invalid preview plan');
    emit(applyPlan(p));
  } else if (cmd === 'rollback') emit(rollback(get('--manifest')));
  else if (cmd === 'validate') emit(checkContract(get('--kind'), json(get('--file'))));
  else
    console.log(
      'Context audit · Node18+ · local analyzer (no model/network calls)\nCommands: discover --claude-home DIR [--limit 20]; ' +
        'analyze --claude-home DIR [--transcript FILE ...] [--events JSONL] [--discover] ' +
        '[--since ISO] [--out report.json]; install --claude-home DIR [--selected ' +
        'continuity,evidence] [--selection selection.json] [--out preview.json]; apply --plan ' +
        'preview.json; summary --report FILE [--out FILE | --print]; rollback --manifest FILE; validate --kind checkpoint|report --file FILE.\n' +
        'Install without selected packages bootstraps only /context-audit. Preview before apply. ' +
        ('Reports, discovery and previews default to local files. Summary --print explicitly ' +
          'emits reduced data. No automatic telemetry exporter setup.'),
    );
} catch (e) {
  console.error(
    e instanceof SyntaxError
      ? 'Invalid JSON in local input; inspect the file in a local editor.'
      : e.message,
  );
  process.exitCode = 1;
}
