// K means 1,000 tokens. Rates are USD per million tokens.
const example = {
  prompt: 'Fix duplicate order creation. Follow our API rules and prove the fix with tests.',
  windowK: 1000, outputK: 2, prefixK: 40, initialTaskK: 10,
  rates: { input: 2, read: 0.10, write: 2.50, output: 10 },
  calls: [
    { label: 'Orient', inputK: 50, tool: 'Read API spec, source and tests', toolK: 98, executions: 3, generates: 'Three read requests: spec, handler, tests' },
    { label: 'Investigate', inputK: 150, tool: 'Read related code + traces', toolK: 148, executions: 1, generates: 'One search request for related code and traces' },
    { label: 'Plan fix', inputK: 300, tool: 'Inspect dependencies + fixtures', toolK: 198, executions: 1, generates: 'One request to inspect dependencies and fixtures' },
    { label: 'Implement', inputK: 500, tool: 'CLI script: apply patch + unit tests', toolK: 198, executions: 1, generates: 'Patch content + one script request' },
    { label: 'Validate', inputK: 700, tool: 'Run integration suite; inspect saved logs', toolK: 148, executions: 2, generates: 'Two requests: integration tests and log inspection' },
    { label: 'Report', inputK: 850, tool: 'Return result + test evidence', toolK: 0, executions: 0, generates: 'Final explanation + test evidence' }
  ],
  sessions: [
    { name: 'Orchestrator', inputsK: [50, 60], role: 'Dispatch workflow → integrate three reports' },
    { name: 'Research', inputsK: [50, 150], role: 'API spec + source (+98K)' },
    { name: 'Implement', inputsK: [50, 200, 400], role: 'Code + traces (+148K), dependencies (+198K)' },
    { name: 'Validate', inputsK: [50, 250, 400], role: 'Unit-test output (+198K), integration logs (+148K)' }
  ]
};
const sum = values => values.reduce((total, value) => total + value, 0);
const singleInputK = sum(example.calls.map(call => call.inputK));
const singleOutputK = example.calls.length * example.outputK;
const workerInputK = sum(example.sessions.flatMap(session => session.inputsK));
const workerCalls = sum(example.sessions.map(session => session.inputsK.length));
const workerOutputK = workerCalls * example.outputK;
const uncachedCost = (inputK, outputK) =>
  (inputK * example.rates.input + outputK * example.rates.output) / 1000;
const cacheLedger = example.calls.map((call, index) => {
  const row = {
    inputK: call.inputK, uncachedK: call.inputK - example.prefixK,
    writeK: index === 0 ? example.prefixK : 0,
    readK: index === 0 ? 0 : example.prefixK, outputK: example.outputK
  };
  row.cost = (row.uncachedK * example.rates.input +
    row.writeK * example.rates.write + row.readK * example.rates.read +
    row.outputK * example.rates.output) / 1000;
  return row;
});
const money = (value, digits = 2) => '$' + value.toFixed(digits);
