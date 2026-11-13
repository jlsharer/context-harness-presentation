const metricKeys = [
  'requests',
  'sessions',
  'totalInput',
  'knownInputSubtotal',
  'peakInput',
  'outputTokens',
  'knownOutput',
  'knownCost',
  'totalCost',
  'compactions',
  'largeResults',
];
const packages = ['continuity', 'results', 'evidence', 'workflow', 'measurement'];

const numeric = (value) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;

export function reducedSummary(report) {
  if (report?.schema !== 1 || !report.metrics || !report.coverage)
    throw Error('Expected a schema 1 audit report');
  return {
    schema: 1,
    kind: 'reduced-context-audit-summary',
    scope:
      'Selected records only. Numeric aggregates may still be sensitive; review before ' +
      'sharing. Not proof of savings, attention or instruction compliance.',
    metrics: Object.fromEntries(metricKeys.map((key) => [key, numeric(report.metrics[key])])),
    coverage: {
      usageSource: ['native', 'otel', 'none'].includes(report.coverage.usageSource)
        ? report.coverage.usageSource
        : 'unknown',
      malformedLines: numeric(report.coverage.malformedLines),
      oversizedLines: numeric(report.coverage.oversizedLines),
      deduplicated: numeric(report.coverage.deduplicated),
      excludedNativeRequests: numeric(report.coverage.excludedNativeRequests),
      caveat:
        'Missing fields remain unknown. Known subtotals are partial. Peak input covers fully ' +
        'reported selected requests only. Accrued input is summed across calls, not current ' +
        'resident context. Date filtering retains undated records. Native formats and streaming ' +
        'coverage may vary.',
    },
    candidatePackages: [
      ...new Set(
        (Array.isArray(report.findings) ? report.findings : [])
          .map((f) => f?.package)
          .filter((id) => packages.includes(id)),
      ),
    ],
    interpretation:
      'Candidate packages are heuristic signals for review, not proven inefficiencies. Compare ' +
      'accepted-task quality, cost and latency before adopting changes. The private full ' +
      'report retains source provenance; this summary omits paths, identifiers, raw text and ' +
      'per-request records.',
  };
}
