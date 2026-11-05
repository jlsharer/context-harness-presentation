Presentation browser checks

Requires Node.js and Playwright with Chromium available. From the repository root:

    node tests/presentation.cjs

Set TEST_BROWSER to a Chromium executable if using an existing installation. To test a deployment instead of the temporary local server, set PRESENTATION_URL to its full URL, including the trailing slash.

The check validates all twelve slide layouts at desktop size, horizontal fit on mobile, the worked example totals, both event-modal entry points, all six lifecycle modals, Close/Escape/focus/Next navigation, the legacy lifecycle link, and JavaScript/asset errors. Screenshots are saved to an OS temporary directory printed at completion.
