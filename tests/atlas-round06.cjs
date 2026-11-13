const assert = require('node:assert/strict'),
  fs = require('node:fs/promises'),
  path = require('node:path'),
  http = require('node:http'),
  { chromium } = require('playwright');
const root = path.resolve(__dirname, '../docs'),
  out = path.resolve(__dirname, '../deliverables/round06');
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
      await page.locator('[data-token-stack=current]').count(),
      1,
      'Current input must be a proportional ordered token stack',
    );
    const counts = JSON.parse(await fs.readFile(root + '/research/round06/token-counts.json'));

    const step = async (n) =>
      page.locator('#sessionStep').evaluate((e, n) => {
        e.value = n;
        e.dispatchEvent(new Event('input', { bubbles: true }));
      }, n);

    for (let i = 0; i < 14; i++) {
      await step(i);
      assert.equal(
        Number(await page.locator('#contextSize').getAttribute('data-tokens')),
        counts.requests['incident:' + i].tokens,
      );
      assert.deepEqual(
        await page
          .locator('[data-token-stack=current] [data-layer]')
          .evaluateAll((ns) => ns.map((e) => e.dataset.layer)),
        counts.requests['incident:' + i].layers.map((l) => l.id),
      );
    }
    await step(6);
    assert.match(await page.locator('#comparisonReference').textContent(), /empty/);
    await step(11);
    assert.match(await page.locator('#boundaryTransform').textContent(), /S1|checkpoint/);
    await page.locator('#inspectSummary').click();
    assert.match(await page.locator('#summaryText').textContent(), /S1/);
    await page.keyboard.press('Escape');
    await page.locator('button[data-view=attention]').click();
    assert.match(await page.locator('[data-axis=x]').textContent(), /context/i);
    assert.deepEqual(
      await page
        .locator('[data-score]')
        .evaluateAll((ns) => ns.map((e) => Number(e.dataset.score))),
      [98.7, 71.8],
    );
    assert.match(await page.locator('#contextScope').textContent(), /128K/);
    await page.locator('#researchModel').selectOption('argon');
    assert.deepEqual(
      await page
        .locator('[data-score]')
        .evaluateAll((ns) => ns.map((e) => Number(e.dataset.score))),
      [99.7, 84.2],
    );
    await page.locator('#openStudyPolicy').click();
    assert.equal(await page.locator('#hookPolicy').inputValue(), 'dispatch');
    assert.match(await page.locator('#hookTransformation').textContent(), /packet/i);
    await page.locator('#openAssemblyPolicy').click();
    await page.locator('#inspectManifest').click();
    assert.match(await page.locator('#fullManifest').textContent(), /STORAGE-2/);
    await page.keyboard.press('Escape');
    await page.locator('button[data-view=attention]').click();
    await page.locator('#researchStudy').selectOption('position');
    assert.equal(await page.locator('[data-score]').count(), 6);
    assert.match(await page.locator('[data-axis=x]').textContent(), /8K.*32K.*64K|context/i);
    await page.locator('#positionModel').selectOption('1');
    await page.locator('#fillerKind').selectOption('questions');
    assert.deepEqual(
      await page
        .locator('[data-score]')
        .evaluateAll((ns) => ns.map((e) => Number(e.dataset.score))),
      [100, 44, 94, 50, 84, 30],
    );
    await page.locator('#showResearchData').click();
    assert.match(await page.locator('#researchDataTable').textContent(), /8K.*32K.*64K/);
    await page.keyboard.press('Escape');
    await page.locator('#researchStudy').selectOption('signal');
    await page.locator('#openStudyPolicy').click();
    assert.equal(await page.locator('#hookPolicy').inputValue(), 'postcompact');
    // Checkpoint policy must demonstrate the checkpoint transformation, not generic layout.
    await page.locator('#openAssemblyPolicy').click();
    assert.equal(await page.locator('body').getAttribute('data-view'), 'system');
    assert.equal(await page.locator('#sessionStep').inputValue(), '11');
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.locator('#togglePresentation').click();
    assert.match(await page.locator('.paired-stacks').textContent(), /native.*differ/i);
    assert.match(await page.locator('.paired-stacks').textContent(), /not capacity/i);
    const covered = await page
      .locator('.live-event-track button,#stepBack,#stepForward')
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
          .map((e) => e.textContent),
      );
    assert.deepEqual(covered, [], 'Live timeline controls must not overlap inspector controls');
    await page.locator('#stepForward').click();
    assert.equal(await page.locator('#sessionStep').inputValue(), '12');
    assert.equal(await page.locator('body').getAttribute('data-view'), 'system');
    await step(11);
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 2),
      'Live replay fits laptop viewport',
    );
    for (const width of [1024, 768]) {
      await page.setViewportSize({ width, height: 900 });
      const blocked = await page
        .locator('.live-event-track button,#stepBack,#stepForward')
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
            .map((e) => e.textContent),
        );
      assert.deepEqual(blocked, [], 'Unobstructed live controls at ' + width);
      await page.locator('#stepForward').click();
      assert.equal(await page.locator('#sessionStep').inputValue(), '12');
      await step(11);
    }
    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.locator('#togglePresentation').click();
    for (let i = 0; i < 14; i++) {
      await step(i);
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 2),
        'Live replay fit step ' + i,
      );
    }
    await page.keyboard.press('Escape');
    await step(10);
    await page.locator('#inspectSummary').click();
    assert.match(await page.locator('#summaryGraphic').textContent(), /pending|not.*produced/i);
    await page.keyboard.press('Escape');
    assert.ok(await page.locator('#inspectSummary').evaluate((e) => document.activeElement === e));
    await page.locator('button[data-view=assembly]').click();
    await page.locator('#sourcePolicy').selectOption('all');
    await page.locator('#layoutPolicy').selectOption('task-last');
    assert.match(
      await page.locator('#candidateAfter').textContent(),
      new RegExp(counts.candidates['all:task-last'].tokens.toLocaleString()),
    );
    await page.locator('[data-anchor="API-2"]').click();
    await page.locator('#inspectSource').click();
    assert.match(await page.locator('#fullManifest').textContent(), /API-2/);
    await page.keyboard.press('Escape');
    await page.locator('button[data-view=attention]').click();
    await page.locator('#researchStudy').selectOption('frontier');
    const bands = JSON.parse(await fs.readFile(root + '/research/round06/bfs-context-bands.json'));
    for (const m of bands.models) {
      await page.locator('#researchModel').selectOption(m.id);
      assert.deepEqual(
        await page
          .locator('[data-score]')
          .evaluateAll((ns) => ns.map((e) => Number(e.dataset.score))),
        m.values,
      );
    }
    await page.locator('#researchStudy').selectOption('position');
    const pos = JSON.parse(await fs.readFile(root + '/research/round05/position.json'));
    for (let i = 0; i < pos.models.length; i++)
      for (const f of ['questions', 'worked']) {
        await page.locator('#positionModel').selectOption(String(i));
        await page.locator('#fillerKind').selectOption(f);
        assert.deepEqual(
          await page
            .locator('[data-score]')
            .evaluateAll((ns) => ns.map((e) => Number(e.dataset.score))),
          pos.tiers.flatMap((t) => pos.models[i][f][t]),
        );
      }
    await page.reload();
    assert.equal(await page.locator('#positionModel').inputValue(), '3');
    assert.equal(await page.locator('#fillerKind').inputValue(), 'worked');
    await page.locator('button[data-view=recipes]').click();
    await page.locator('#inspectPolicy').click();
    assert.match(
      await page.locator('#fullManifest').textContent(),
      /buildPacket|requireAnchors|scopeDependencies/,
    );
    await page.keyboard.press('Escape');
    const zip = await page.request.get(base + '/policies/workshop.zip');
    assert.equal(zip.status(), 200);
    assert.equal((await zip.body()).subarray(0, 2).toString(), 'PK');
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
              .map((e) => ({ name: e.id || e.className, h: e.clientHeight, sh: e.scrollHeight })),
          );
        assert.deepEqual(scroll, [], 'No nested vertical scrolling in main view ' + view + ' ' + w);
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
      'PASS round06: ordered token stacks; scope boundaries; context-range BFS and position ' +
        'charts; actionable hooks; no nested main scroll; desktop/mobile/offline.',
    );
  } finally {
    await browser?.close();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
