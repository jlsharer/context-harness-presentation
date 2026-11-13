const assert = require('node:assert/strict'),
  fs = require('node:fs/promises'),
  path = require('node:path'),
  http = require('node:http'),
  { chromium } = require('playwright');
const root = path.resolve(__dirname, '../docs'),
  out = path.resolve(__dirname, '../deliverables/round07');
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
      await page.locator('[data-policy-lane]').count(),
      2,
      'Two integrated workload lanes required',
    );

    const step = async (n) =>
      page.locator('#sessionStep').evaluate((e, n) => {
        e.value = n;
        e.dispatchEvent(new Event('input', { bubbles: true }));
      }, n);

    assert.match(await page.locator('#scenarioDisclosure').textContent(), /scenario|modeled/i);
    assert.equal(
      (await page.locator('[data-policy-lane=managed] [data-transition-row]').count()) > 0,
      true,
    );
    await step(11);
    assert.equal(await page.locator('[data-policy-lane=managed] [data-change=removed]').count(), 2);
    assert.match(await page.locator('#boundaryTransform').textContent(), /checkpoint|compaction/i);
    await page.locator('#inspectWorkload').click();
    assert.match(await page.locator('#fullManifest').textContent(), /26783|26,783/);
    assert.match(await page.locator('#fullManifest').textContent(), /not.*measured|modeled/i);
    await page.keyboard.press('Escape');
    await page.locator('button[data-view=attention]').click();
    assert.equal(
      await page.locator('[data-evidence-mode=walkthrough][aria-pressed=true]').count(),
      1,
    );
    await page.locator('[data-bfs-hop="2"]').click();
    assert.match(await page.locator('#bfsFrontier').textContent(), /Journal.*Delivery/);
    await page.locator('[data-bfs-answer="missing"]').click();
    assert.match(await page.locator('#bfsF1').textContent(), /66.7/);
    await page.locator('#evidenceMode-results').click();
    assert.deepEqual(
      await page
        .locator('[data-score]')
        .evaluateAll((ns) => ns.map((e) => Number(e.dataset.score))),
      [99.7, 98.7, 90.6, 84.2, 71.8, 66.8],
    );
    await page.locator('#evidenceMode-mechanism').click();
    assert.match(await page.locator('#causalAccess').textContent(), /not.*weights|structural/i);
    await page.locator('#attentionQuery').selectOption('3');
    assert.equal(await page.locator('[data-key-access=allowed]').count(), 4);
    assert.equal(await page.locator('[data-key-access=masked]').count(), 4);
    await page.locator('button[data-view=system]').click();
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.locator('#togglePresentation').click();
    for (let i = 0; i < 14; i++) {
      await step(i);
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 2),
        'Live comparison fit at event ' + i,
      );
      const covered = await page
        .locator('#stepBack,#stepForward,#inspectWorkload,#inspectHook')
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
            .map((e) => e.id),
        );
      assert.deepEqual(covered, [], 'Controls unobstructed at ' + i);
      const spilled = await page.locator('.policy-lane').evaluateAll((ns) =>
        ns
          .filter((e) => {
            const r = e.getBoundingClientRect(),
              t = e.querySelector('[data-current-total]').getBoundingClientRect();
            return t.right > r.right - 3;
          })
          .map((e) => e.dataset.policyLane),
      );
      assert.deepEqual(spilled, [], 'Lane totals stay contained at ' + i);
    }
    await page.keyboard.press('Escape');
    for (const profile of ['service', 'platform', 'org']) {
      await page.locator('#workloadProfile').selectOption(profile);
      await step(6);
      assert.equal(await page.locator('[data-previous-total=managed]').textContent(), '0');
      await step(10);
      await page.locator('#inspectWorkloadSummary').click();
      assert.match(await page.locator('#fullManifest').textContent(), /"outputTokens": null/);
      assert.ok(
        JSON.parse(await page.locator('#fullManifest').textContent()).every(
          (x) => x.parentAfter === null,
        ),
        'Prepared S1 must not expose a completed parent state',
      );
      await page.keyboard.press('Escape');
      await step(12);
      assert.equal(
        await page
          .locator('[data-policy-lane=managed] [data-transition-row=evidence]')
          .getAttribute('data-change'),
        'added',
      );
      await page.reload();
      assert.equal(await page.locator('#workloadProfile').inputValue(), profile);
    }
    await page.locator('button[data-view=attention]').click();
    await page.locator('#evidenceMode-walkthrough').click();
    await page.locator('.custom-answer summary').click();
    await page.locator('[data-bfs-answer=empty]').click();
    assert.match(await page.locator('#bfsF1').textContent(), /^0.0/);
    await page.locator('[data-bfs-answer=ancestors]').click();
    assert.match(await page.locator('#bfsF1').textContent(), /66.7/);
    await page.locator('#evidenceMode-results').click();
    const pos = JSON.parse(await fs.readFile(root + '/research/round05/position.json'));
    await page.locator('#researchStudy').selectOption('position');
    for (let i = 0; i < pos.models.length; i++)
      for (const filler of ['questions', 'worked']) {
        await page.locator('#positionModel').selectOption(String(i));
        await page.locator('#fillerKind').selectOption(filler);
        assert.deepEqual(
          await page
            .locator('[data-score]')
            .evaluateAll((ns) => ns.map((e) => Number(e.dataset.score))),
          pos.tiers.flatMap((t) => pos.models[i][filler][t]),
        );
      }
    await page.locator('#researchStudy').selectOption('signal');
    const sig = JSON.parse(await fs.readFile(root + '/research/round05/signal-retention.json'));
    assert.deepEqual(
      await page
        .locator('[data-score]')
        .evaluateAll((ns) => ns.map((e) => Number(e.dataset.score))),
      sig.models.flatMap((m) => [m.naive, m.aware]),
    );
    await page.locator('#openStudyPolicy').click();
    assert.equal(await page.locator('#hookPolicy').inputValue(), 'postcompact');
    await page.locator('#openAssemblyPolicy').click();
    assert.equal(await page.locator('#sessionStep').inputValue(), '11');
    await page.locator('button[data-view=attention]').click();
    await page.locator('#researchStudy').selectOption('frontier');
    await page.locator('#evidenceMode-mechanism').click();
    await page.locator('#showMechanism').click();
    await page.locator('#showLogits').click();
    await page.keyboard.press('Escape');
    assert.ok(await page.locator('#showLogits').evaluate((e) => e === document.activeElement));
    await page.keyboard.press('Escape');
    assert.ok(await page.locator('#showMechanism').evaluate((e) => e === document.activeElement));
    await page.locator('button[data-view=assembly]').click();
    await page.locator('#sourcePolicy').selectOption('all');
    await page.locator('#layoutPolicy').selectOption('task-last');
    await page.locator('#inspectManifest').click();
    assert.match(await page.locator('#fullManifest').textContent(), /STORAGE-2/);
    await page.keyboard.press('Escape');
    const zip = await page.request.get(base + '/policies/workshop.zip');
    assert.equal(zip.status(), 200);
    assert.equal((await zip.body()).subarray(0, 2).toString(), 'PK');
    await page.locator('button[data-view=attention]').click();
    await page.locator('#evidenceMode-walkthrough').click();
    await page.locator('#bfsAnswer-correct').click();
    await page.setViewportSize({ width: 320, height: 640 });
    for (const presenting of [false, true]) {
      if (presenting) await page.locator('#togglePresentation').click();
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        'BFS score fits 320px ' + (presenting ? 'live' : 'normal'),
      );
      const metric = await page.locator('#bfsF1').boundingBox(),
        card = await page.locator('.answer-lab').boundingBox();
      assert.ok(metric.x + metric.width <= card.x + card.width, 'Set-F1 stays inside its card');
    }
    await page.keyboard.press('Escape');
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
        assert.deepEqual(scroll, [], 'No nested vertical scrolling ' + view + ' ' + w);
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
      'PASS round07 integrated lanes, transition tombstones, budget provenance, BFS/F1 ' +
        'teaching, provider comparison, causal access, desktop/mobile/offline',
    );
  } finally {
    await browser?.close();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
