const assert = require('node:assert/strict'),
  fs = require('node:fs/promises'),
  path = require('node:path'),
  http = require('node:http'),
  { chromium } = require('playwright');
const root = path.resolve(__dirname, '../docs'),
  out = path.resolve(__dirname, '../deliverables/round08');
(async () => {
  await fs.mkdir(out, { recursive: true });
  const server = http.createServer(async (req, res) => {
    try {
      const u = new URL(req.url, 'http://localhost'),
        f = path.resolve(root, '.' + (u.pathname === '/' ? '/atlas.html' : u.pathname));
      if (!f.startsWith(root + path.sep)) throw Error('path');
      res.setHeader(
        'Content-Type',
        {
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.html': 'text/html',
          '.json': 'application/json',
          '.png': 'image/png',
          '.zip': 'application/zip',
          '.mjs': 'text/javascript',
        }[path.extname(f)] || 'text/plain',
      );
      res.end(await fs.readFile(f));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.TEST_BROWSER || process.argv[2],
    });
    const page = await browser.newPage({
        viewport: { width: 1600, height: 1000 },
        reducedMotion: 'reduce',
      }),
      errors = [],
      external = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route('**/*', (r) => {
      if (new URL(r.request().url()).hostname !== '127.0.0.1') {
        external.push(r.request().url());
        return r.abort();
      }
      return r.continue();
    });
    const base = 'http://127.0.0.1:' + server.address().port;
    await page.goto(base + '/atlas.html#welcome');
    assert.equal(
      await page.locator('body').getAttribute('data-view'),
      'welcome',
      'Purpose page comes first',
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#nextView').click();
    assert.ok(await page.evaluate(() => scrollY < 3), 'Chapter navigation returns to top');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'viewTitle');
    await page.locator('#previousView').click();
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.locator('button[data-view=contents]').first().click();
    assert.equal(await page.locator('.chapter-map button').count(), 8);
    await page.locator('.chapter-map button[data-view=system]').click();
    assert.equal(await page.locator('[data-policy-lane]').count(), 2);
    assert.equal(
      await page.locator('[data-step="6"]').count(),
      0,
      'No child events in initial single-session comparison',
    );
    assert.ok((await page.locator('[data-policy-lane=managed] .technique-target').count()) > 0);
    assert.match(
      await page.locator('[data-context-path=managed]').textContent(),
      /Inspect Context/,
    );
    await page.locator('[data-context-path=managed]').click();
    assert.match(await page.locator('#fullManifest').textContent(), /scenario|modeled/i);
    await page.keyboard.press('Escape');
    await page.locator('button[data-view=orchestration]').first().click();
    await page.locator('#workerCount').selectOption('3');
    await page.locator('#orchStep').evaluate((e) => {
      e.value = 6;
      e.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.locator('#inspectInvocationLedger').click();
    assert.match(await page.locator('#fullManifest').textContent(), /C1|C2/);
    await page.keyboard.press('Escape');
    await page.locator('button[data-view=loading]').first().click();
    await page.locator('#loadingHarness').selectOption('codex');
    await page.locator('#launchDirectory').selectOption('payments');
    assert.match(await page.locator('.loaded-chain').textContent(), /AGENTS.override/);
    await page.locator('#showWeights').click();
    assert.match(
      await page.locator('#weightBody').textContent(),
      /no fixed percentage|not.*fixed/i,
    );
    assert.equal(await page.locator('#weightBody tbody tr').count(), 5);
    await page.locator('#weightQuery').selectOption('1');
    assert.match(await page.locator('#weightBody tbody').textContent(), /future masked/);
    await page.keyboard.press('Escape');
    await page.locator('button[data-view=cache]').first().click();
    await page.locator('#cacheCase').selectOption('edit');
    assert.match(await page.locator('.cache-read').textContent(), /8,000/);
    assert.match(await page.locator('.cache-full').textContent(), /20,000/);
    await page.locator('button[data-view=attention]').first().click();
    assert.equal(await page.locator('#researchStudy').count(), 0);
    await page.locator('#evidenceMode-mechanism').click();
    assert.equal(
      await page.locator('[data-study]').count(),
      0,
      'No irrelevant study choices on goal-retention page',
    );
    await page.locator('#positionModel').selectOption('0');
    const pos = JSON.parse(await fs.readFile(root + '/research/round05/position.json'));
    assert.deepEqual(
      await page
        .locator('[data-score]')
        .evaluateAll((ns) => ns.map((e) => Number(e.dataset.score))),
      pos.tiers.flatMap((t) => pos.models[0].questions[t]),
    );
    await page.locator('[data-reliability-lever=restore]').click();
    assert.equal(await page.locator('[data-goal-target=checkpoint]').count(), 1);
    await page.locator('button[data-view=hooks]').first().click();
    await page.locator('[data-select-hook=handoff]').click();
    assert.match(await page.locator('.hook-explainer').textContent(), /SubagentHandback/);
    await page.locator('[data-kit=handoff]').click();
    assert.equal(await page.locator('body').getAttribute('data-view'), 'recipes');
    await page.locator('#kitHarness').selectOption('codex');
    assert.match(await page.locator('#installCommand').textContent(), /--harness codex/);
    const choice = page.locator('[data-kit-selection]').first();
    await choice.focus();
    await page.keyboard.press('Space');
    assert.equal(
      await page.evaluate(() => document.activeElement?.getAttribute('data-kit-selection')),
      'focus',
      'Package selection retains keyboard focus',
    );
    await page.locator('#kitHarness').selectOption('claude');
    assert.match(
      await page.locator('.package-card').filter({ hasText: 'Scoped delegation' }).textContent(),
      /2.1.271.*auto|auto.*2.1.271/,
      'Automatic handoff prerequisites visible at choice',
    );
    const zip = await page.request.get(base + '/kits/context-kits.zip');
    assert.equal(zip.status(), 200);
    assert.equal((await zip.body()).subarray(0, 2).toString(), 'PK');
    await page.locator('button[data-view=system]').first().click();
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.locator('#togglePresentation').click();
    for (let i = 0; i < 12; i++) {
      await page.locator('#sessionStep').evaluate((e, i) => {
        e.value = i;
        e.dispatchEvent(new Event('input', { bubbles: true }));
      }, i);
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 2),
        'Live single-session fit ' + i,
      );
      const covered = await page
        .locator('#stepBack,#stepForward,[data-context-path]')
        .evaluateAll((ns) =>
          ns
            .filter((e) => {
              const r = e.getBoundingClientRect();
              return (
                document
                  .elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
                  ?.closest('button') !== e
              );
            })
            .map((e) => e.id || e.dataset.contextPath),
        );
      assert.deepEqual(covered, [], 'Live controls visible ' + i);
    }
    await page.keyboard.press('Escape');
    for (const [w, h] of [
      [1600, 1000],
      [1366, 768],
      [390, 844],
      [320, 640],
    ]) {
      await page.setViewportSize({ width: w, height: h });
      for (const view of [
        'welcome',
        'contents',
        'system',
        'orchestration',
        'loading',
        'cache',
        'attention',
        'hooks',
        'recipes',
        'references',
      ]) {
        await page.locator('.atlas-masthead button[data-view=' + view + ']').click();
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          'Horizontal overflow ' + view + ' ' + w,
        );
        const scroll = await page
          .locator('#atlasCanvas *')
          .evaluateAll((ns) =>
            ns
              .filter(
                (e) =>
                  e.getClientRects().length &&
                  ['auto', 'scroll'].includes(getComputedStyle(e).overflowY) &&
                  e.scrollHeight > e.clientHeight + 2,
              )
              .map((e) => e.id || e.className),
          );
        assert.deepEqual(scroll, [], 'No nested vertical panes ' + view + ' ' + w);
        if (w !== 320)
          await page.screenshot({
            path: out + '/' + view + '-' + w + '.png',
            fullPage: true,
            animations: 'disabled',
          });
      }
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    console.log(
      'PASS round08 ten-view journey, annotated single replay, separate delegation ledger, ' +
        'loading rules, cache, goal retention, weights, lifecycle→kits, responsive/offline.',
    );
  } finally {
    await browser?.close();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
