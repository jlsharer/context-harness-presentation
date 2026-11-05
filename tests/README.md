Presentation browser checks

Requires Node.js and Playwright with Chromium available. From the repository root:

    node tests/presentation.cjs

Set TEST_BROWSER to a Chromium executable if using an existing installation. To test a deployment instead of the temporary local server, set PRESENTATION_URL to its full URL, including the trailing slash.

The check validates all twelve slide layouts at desktop size, horizontal fit on mobile, the worked example totals, both event-modal entry points and all three visual/detail tabs, all six lifecycle modals, Close/Escape/focus/Next navigation, the legacy lifecycle link, and JavaScript/asset errors. Screenshots are saved to an OS temporary directory printed at completion.

Benchmark comparison checks

    node tests/benchmark.cjs

Uses the same Playwright/Chromium dependencies. Set BENCHMARK_URL for live validation. Tests no-data and synthetic states, unavailable approaches, matched pair selection, local import, missing cost, unsafe text rendering, detail Close/focus restoration and mobile layout. The demo is synthetic, uses the deck's 6-call/10-call token inputs, and supports no empirical claim.

The browser validator in docs/benchmark-schema.js is generated from the portable benchmark's public-schema.ts; refresh it with the corresponding harness build when the public contract changes. Local import stays in the browser. No private traces are published.
