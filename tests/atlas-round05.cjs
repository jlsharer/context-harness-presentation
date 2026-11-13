const assert = require('node:assert/strict'),
  fs = require('node:fs/promises'),
  path = require('node:path'),
  http = require('node:http'),
  { chromium } = require('playwright');
const root = path.resolve(__dirname, '../docs'),
  out = path.resolve(__dirname, '../deliverables/round05');
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
    await page.goto(base + '/atlas.html?step=5#system');
    assert.equal(
      await page.locator('[data-context-change=added]').count(),
      1,
      'Show added, retained and removed context explicitly',
    );
    const reviewIssues = [];
    if (
      !(await page.locator('[data-context-change=retained]').textContent()).includes(
        'One committed tenant/key identity',
      )
    )
      reviewIssues.push('Retained column must show the actual retained acceptance constraint');
    await page.locator('button[data-view=attention]').click();
    await page.locator('#researchStudy').selectOption('signal');
    await page.locator('#openStudyPolicy').click();
    if ((await page.locator('#hookPolicy').inputValue()) !== 'postcompact')
      reviewIssues.push('Completed-checkpoint validation must open at postcompact');
    assert.deepEqual(reviewIssues, [], 'Round05 independent-review regressions');
    await page.goto(base + '/atlas.html?step=5#system');

    const step = async (n) =>
      page.locator('#sessionStep').evaluate((e, n) => {
        e.value = n;
        e.dispatchEvent(new Event('input', { bubbles: true }));
      }, n);

    assert.match(
      await page.locator('[data-context-change=added]').textContent(),
      /Read durable|tool|P1/i,
    );
    assert.match(await page.locator('#comparisonReference').textContent(), /P1/);
    await step(6);
    assert.match(await page.locator('#comparisonReference').textContent(), /empty|new child/i);
    assert.match(await page.locator('[data-context-change=removed]').textContent(), /None/);
    await step(11);
    assert.match(
      await page.locator('[data-context-change=removed]').textContent(),
      /source|history|conversation/i,
    );
    await page.locator('#inspectSummary').click();
    assert.match(await page.locator('#fullManifest').textContent(), /S1|checkpoint/i);
    await page.keyboard.press('Escape');
    assert.ok(await page.locator('#inspectSummary').evaluate((e) => e === document.activeElement));
    assert.equal(await page.locator('[data-session-lane=parent]').count(), 1);
    assert.equal(await page.locator('[data-session-lane=child]').count(), 1);
    assert.equal(await page.locator('[data-session-lane=summary]').count(), 1);
    const order = await page
      .locator('.atlas-masthead nav button[data-view]')
      .evaluateAll((ns) => ns.map((e) => e.dataset.view));
    assert.deepEqual(order, ['system', 'attention', 'hooks', 'assembly', 'recipes', 'references']);
    await page.locator('button[data-view=attention]').click();
    assert.match(await page.locator('#contextScope').textContent(), /256K.*1M/);
    assert.match(await page.locator('#contextScope').textContent(), /200/);
    assert.match(
      await page.locator('#bfsExample').textContent(),
      /Journal.*Delivery|Delivery.*Journal/,
    );
    assert.match(await page.locator('[data-axis=x]').textContent(), /model/i);
    assert.match(await page.locator('[data-axis=y]').textContent(), /F1/);
    assert.deepEqual(
      await page
        .locator('[data-score]')
        .evaluateAll((ns) => ns.map((e) => Number(e.dataset.score))),
      [96.2, 71.8, 66.8],
    );
    await page.locator('#openStudyPolicy').click();
    assert.equal(await page.locator('body').getAttribute('data-view'), 'hooks');
    assert.match(await page.locator('#researchPolicyLink').textContent(), /GraphWalks|dependenc/i);
    await page.locator('#openAssemblyPolicy').click();
    assert.equal(await page.locator('body').getAttribute('data-view'), 'assembly');
    assert.match(await page.locator('#sourceExcerpt').textContent(), /STORAGE-2/);
    await page.locator('[data-anchor="API-2"]').click();
    assert.match(await page.locator('#candidateAfter').textContent(), /API-2/);
    await page.locator('button[data-view=recipes]').click();
    const zip = await page.request.get(base + '/policies/workshop.zip');
    assert.equal(zip.status(), 200);
    assert.equal((await zip.body()).subarray(0, 2).toString(), 'PK');
    const pos = JSON.parse(await fs.readFile(root + '/research/round05/position.json'));
    await page.locator('button[data-view=attention]').click();
    await page.locator('#researchStudy').selectOption('position');
    for (const tier of pos.tiers)
      for (const filler of ['worked', 'questions']) {
        await page.locator('#contextTier').selectOption(tier);
        await page.locator('#fillerKind').selectOption(filler);
        assert.deepEqual(
          await page
            .locator('[data-score]')
            .evaluateAll((ns) => ns.map((e) => Number(e.dataset.score))),
          pos.models.flatMap((m) => m[filler][tier]),
        );
      }
    assert.match(await page.locator('#researchCaption').textContent(), /2026/);
    assert.doesNotMatch(
      await page.locator('#atlasCanvas').textContent(),
      /GPT-3.5|Claude 1.3|Llama 3.3/,
    );
    await page.locator('#openStudyPolicy').click();
    await page.locator('#openAssemblyPolicy').click();
    assert.equal(await page.locator('#layoutPolicy').inputValue(), 'task-last');
    await page.locator('button[data-view=attention]').click();
    await page.locator('#researchStudy').selectOption('signal');
    const sig = JSON.parse(await fs.readFile(root + '/research/round05/signal-retention.json'));
    assert.deepEqual(
      await page
        .locator('[data-score]')
        .evaluateAll((ns) => ns.map((e) => Number(e.dataset.score))),
      sig.models.flatMap((m) => [m.naive, m.aware]),
    );
    assert.match(await page.locator('#researchCaption').textContent(), /oracle|ground.truth/i);
    assert.match(await page.locator('[data-axis=y]').textContent(), /percentage points/);
    for (const [w, h] of [
      [1600, 1000],
      [1366, 768],
      [390, 844],
    ]) {
      await page.setViewportSize({ width: w, height: h });
      for (const view of ['system', 'attention', 'hooks', 'assembly', 'recipes', 'references']) {
        await page.locator('button[data-view=' + view + ']').click();
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          'Horizontal overflow ' + view + ' ' + w,
        );
        const small = await page
          .locator('#atlasCanvas p,#atlasCanvas h2,#atlasCanvas h3,#sourceFooter a,.semantic-key')
          .evaluateAll((ns) =>
            ns
              .filter(
                (e) =>
                  e.getClientRects().length && Number.parseFloat(getComputedStyle(e).fontSize) < 14,
              )
              .map((e) => ({ t: e.textContent.slice(0, 50), size: getComputedStyle(e).fontSize })),
          );
        assert.deepEqual(small, [], 'Readable typography ' + view + ' ' + w);
        if (view === 'system' && w > 700) {
          for (let i = 0; i < 14; i++) {
            await step(i);
            const bad = await page
              .locator('.session-panel,.diff-grid,.change-column')
              .evaluateAll((ns) =>
                ns
                  .filter(
                    (e) => e.scrollHeight > e.clientHeight + 3 || e.scrollWidth > e.clientWidth + 3,
                  )
                  .map((e) => ({ n: e.className, h: e.clientHeight, sh: e.scrollHeight })),
              );
            assert.deepEqual(bad, [], 'Session fit step' + i + ' ' + w);
          }
          await step(5);
        }
        if (view === 'attention') {
          for (const study of ['frontier', 'position', 'signal']) {
            await page.locator('#researchStudy').selectOption(study);
            await page.screenshot({
              path: out + '/' + view + '-' + study + '-' + w + '.png',
              fullPage: true,
              animations: 'disabled',
            });
          }
        } else
          await page.screenshot({
            path: out + '/' + view + '-' + w + '.png',
            fullPage: true,
            animations: 'disabled',
          });
      }
    }
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.locator('button[data-view=system]').click();
    await step(5);
    await page.locator('#togglePresentation').click();
    const presentationOverflow = await page
      .locator('.session-panel,.change-column')
      .evaluateAll((ns) =>
        ns.filter((e) => e.scrollHeight > e.clientHeight + 3).map((e) => e.className),
      );
    assert.deepEqual(presentationOverflow, [], 'Readable presentation view');
    assert.ok(await page.locator('body').evaluate((e) => e.classList.contains('is-presenting')));
    await page.keyboard.press('Escape');
    assert.ok(await page.locator('body').evaluate((e) => !e.classList.contains('is-presenting')));
    await page.goto(base + '/atlas.html?step=1.5&study=length#system');
    assert.equal(await page.locator('[data-context-change=added]').count(), 1);
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    console.log(
      'PASS: same-session diff/scopes; S1 inspector; learning path; explicit bar axes and all ' +
        'modern study controls; research→hook→assembly→recipe; readable type; semantic labels; ' +
        'desktop/mobile/offline.',
    );
  } finally {
    await browser?.close();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
