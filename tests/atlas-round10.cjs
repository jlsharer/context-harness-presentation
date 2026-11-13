const assert = require('node:assert/strict'),
  fs = require('node:fs/promises'),
  path = require('node:path'),
  http = require('node:http'),
  { chromium } = require('playwright');
const root = path.resolve(__dirname, '../docs'),
  out = path.resolve(__dirname, '../deliverables/round10');
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
    assert.equal(await page.locator('#sessionStep').inputValue(), '0', 'Fresh replay starts at0');
    assert.match(await page.locator('.current-event').textContent(), /Turn 0/);
    assert.equal(
      await page.locator('[data-walkthrough-view]').count(),
      0,
      'No separate attention view',
    );
    assert.equal(
      await page.locator('[data-heat-weight]').count(),
      0,
      'No task/query before task admission',
    );
    await page.locator('#stepForward').click();
    await page.locator('#stepForward').click();
    assert.ok((await page.locator('[data-heat-weight]').count()) > 0);
    const heatBefore = await page
      .locator('[data-heat-weight]')
      .evaluateAll((ns) => ns.map((e) => e.dataset.heatWeight));
    await page.locator('#stepForward').click();
    await page.locator('#stepForward').click();
    assert.notDeepEqual(
      await page
        .locator('[data-heat-weight]')
        .evaluateAll((ns) => ns.map((e) => e.dataset.heatWeight)),
      heatBefore,
      'Rows respond to accrued context',
    );
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
    assert.equal(await page.locator('[data-worker-window]').count(), 3);
    assert.equal(await page.locator('[data-worker-window] .mini-layer09').count(), 21);
    const toolPackets = await page
      .locator('[data-worker-window] [data-mini-layer=tools] b')
      .allTextContents();
    assert.equal(new Set(toolPackets).size, 3);
    assert.ok(toolPackets.every((t) => Number(t.replaceAll(',', '')) < 6500));
    assert.equal(await page.locator('[data-flow-phase]').count(), 3);
    await page.locator('#inspectBaseInstructions').click();
    assert.match(
      await page.locator('#fullManifest').textContent(),
      /not model parameters|weights\/training|weights\/training|weights.*training/i,
    );
    await page.keyboard.press('Escape');
    const nativeBefore = await page.locator('.native-readout10').textContent();
    await page.locator('[data-native-target=claude]').click();
    assert.notEqual(await page.locator('.native-readout10').textContent(), nativeBefore);
    await page.locator('#inspectNativeEvidence').click();
    assert.match(await page.locator('#fullManifest').textContent(), /./);
    await page.keyboard.press('Escape');
    assert.match(await page.locator('[data-accrued-input=delegated]').textContent(), /[0-9]/);
    await page.locator('#inspectInvocationLedger').click();
    assert.match(await page.locator('#fullManifest').textContent(), /C1|C2/);
    await page.keyboard.press('Escape');
    await page.locator('button[data-view=loading]').first().click();
    await page.locator('#loadingHarness').selectOption('codex');
    await page.locator('#launchDirectory').selectOption('payments');
    assert.match(await page.locator('.loaded-chain').textContent(), /AGENTS.override/);
    await page.locator('#showNativeOrder').click();
    for (const h of ['opencode', 'claude', 'codex', 'cursor']) {
      await page.locator('[data-native-harness=' + h + ']').click();
      assert.match(
        await page.locator('#nativeOrder').textContent(),
        /guidance|context|instructions|prompt/i,
      );
    }
    await page.keyboard.press('Escape');
    await page.locator('#showWeights').click();
    assert.equal(
      await page.locator('[data-weight-query="0"]').getAttribute('aria-pressed'),
      'true',
      'Modal starts at first query',
    );
    await page.locator('[data-weight-stage="2"]').click();
    assert.match(
      await page.locator('#weightBody').textContent(),
      /no fixed percentage|not.*fixed/i,
    );
    assert.equal(await page.locator('#weightBody tbody tr').count(), 5);
    assert.equal(await page.locator('#weightBody .attention-bar09').count(), 5);
    assert.equal(
      await page.locator('#weightBody [data-weight-cell]').count(),
      25,
      'All query positions visible without dropdown',
    );
    assert.match(await page.locator('#weightBody').textContent(), /Relative weight.*%/s);
    await page.locator('#weightBody [data-weight-query="1"]').click();
    assert.equal(
      await page.locator('#weightBody [data-current-query]').getAttribute('data-current-query'),
      '1',
    );
    assert.match(await page.locator('#weightBody').textContent(), /masked/);
    await page.locator('#weightBody [data-weight-stage="1"]').click();
    assert.match(
      await page.locator('#weightBody .normalization09').textContent(),
      /denominator|sum/i,
    );
    await page.locator('#weightBody .advanced-attention09 summary').click();
    const weightsBefore = await page
      .locator('#weightBody [data-bar-weight]')
      .evaluateAll((ns) => ns.map((e) => e.dataset.barWeight));
    await page.locator('#weightHead').selectOption('1');
    assert.equal(await page.locator('#weightHead').inputValue(), '1');
    assert.equal(await page.locator('.advanced-attention09').getAttribute('open'), '');
    assert.notDeepEqual(
      await page
        .locator('#weightBody [data-bar-weight]')
        .evaluateAll((ns) => ns.map((e) => e.dataset.barWeight)),
      weightsBefore,
    );
    await page.locator('#showLogits').click();
    assert.match(await page.locator('#researchDialog').textContent(), /columns.*key|key.*columns/i);
    assert.match(
      await page.locator('#researchDialog').textContent(),
      /logits.*percent|percent.*logits/is,
    );
    await page.keyboard.press('Escape');
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
    await page.locator('[data-native-target=claude]').click();
    assert.match(await page.locator('.hook-explainer').textContent(), /SubagentHandback/);
    const tops = await page
      .locator('[data-select-hook]')
      .evaluateAll((ns) => ns.map((e) => e.getBoundingClientRect().top));
    assert.ok(
      tops.every((y, i) => !i || y > tops[i - 1]),
      'Vertical lifecycle sequence',
    );
    await page.locator('[data-native-target=codex]').click();
    await page.locator('[data-select-hook=dispatch]').click();
    assert.match(await page.locator('.hook-explainer').textContent(), /diagnostic|observ/i);
    assert.match(await page.locator('.hook-explainer>.role-policy').textContent(), /POLICY GOAL/);
    assert.match(await page.locator('.hook-explainer>.role-policy').textContent(), /Policy target/);
    assert.match(
      await page.locator('.hook-explainer [data-kit]').textContent(),
      /portable/i,
      'Bundled Codex action identifies portable integration',
    );
    await page.locator('[data-hook-example=dispatch]').click();
    assert.ok(
      await page.locator('#manifestLinks a[href="https://learn.chatgpt.com/docs/hooks"]').count(),
      'Selected Codex example cites its native reference',
    );
    await page.keyboard.press('Escape');
    await page.locator('[data-select-hook=handoff]').click();
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
      const spills = await page
        .locator(
          '.system10 .transition-row .current-amount,.system10 .transition-row .previous-amount',
        )
        .evaluateAll((ns) =>
          ns
            .filter((e) => {
              const r = document.createRange();
              r.selectNodeContents(e);
              return r.getBoundingClientRect().width > e.getBoundingClientRect().width + 1;
            })
            .map((e) => e.textContent),
        );
      assert.deepEqual(spills, [], 'Token values fit beside heat ' + i);
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
    await page.goto(base + '/atlas.html?workers=3&orch=3&present=1#orchestration');
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 2),
      'Three-worker comparison fits live presentation',
    );
    await page.goto(base + '/atlas.html?present=1#hooks');
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 2),
      'Vertical lifecycle fits live presentation',
    );
    await page.keyboard.press('Escape');
    for (let n = 1; n <= 3; n++)
      for (let step = 0; step < 7; step++) {
        await page.goto(
          base + '/atlas.html?workers=' + n + '&orch=' + step + '&present=1#orchestration',
        );
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 2),
          'Every delegation state fits live ' + n + '/' + step,
        );
        assert.ok(
          await page.locator('.delegation-scope09').isVisible(),
          'Comparison caveat remains visible live',
        );
        assert.match(
          await page.locator('.delegation-scope09').textContent(),
          /scoping|authored|snapshots/,
        );
        assert.equal(await page.locator('[data-worker-window]').count(), step ? n : 0);
        const metrics = await page.locator('.delegation-metrics09').count();
        assert.equal(metrics, 2, 'Each lane owns a metric group');
        assert.ok(
          await page.evaluate(() =>
            [...document.querySelectorAll('.delegation-metrics09')].every((e) =>
              e.parentElement.classList.contains('delegation-lane09'),
            ),
          ),
          'Metrics outside the context family grid',
        );
      }
    await page.goto(base + '/atlas.html#hooks');
    for (const h of ['opencode', 'claude', 'codex']) {
      await page.locator('[data-native-target=' + h + ']').click();
      for (const id of [
        'start',
        'prompt',
        'dispatch',
        'pretool',
        'posttool',
        'child',
        'handoff',
        'precompact',
        'postcompact',
      ]) {
        await page.locator('[data-select-hook=' + id + ']').click();
        assert.ok((await page.locator('.native-event09').textContent()).length);
        assert.equal(await page.evaluate(() => document.activeElement?.id), 'hookNode-' + id);
      }
    }
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
    await page.setViewportSize({ width: 1366, height: 768 });
    for (const h of ['opencode', 'claude', 'codex'])
      for (const id of [
        'start',
        'prompt',
        'dispatch',
        'pretool',
        'posttool',
        'child',
        'handoff',
        'precompact',
        'postcompact',
      ]) {
        await page.goto(base + '/atlas.html?harness=' + h + '&hook=' + id + '&present=1#hooks');
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 2),
          'Every native lifecycle fits live ' + h + '/' + id,
        );
      }
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(base + '/atlas.html#loading');
      await page.locator('#showWeights').click();
      await page.locator('[data-weight-stage="2"]').click();
      for (let q = 0; q < 5; q++) {
        await page.locator('[data-weight-query="' + q + '"]').click();
        const collisions = await page.locator('.weight-chart09').evaluate((chart) => {
          const labels = [...chart.querySelectorAll('.attention-bar09>strong')].map((e) =>
              e.getBoundingClientRect(),
            ),
            result = [];
          for (let i = 0; i < labels.length; i++)
            for (let j = i + 1; j < labels.length; j++) {
              const a = labels[i],
                b = labels[j];
              if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top)
                result.push([i, j]);
            }
          const caption = chart.querySelector('.chart-axis09').getBoundingClientRect();
          if (
            [...chart.querySelectorAll('.key-label09')].some(
              (e) => e.getBoundingClientRect().bottom > caption.top,
            )
          )
            result.push('axis');
          return result;
        });
        assert.deepEqual(collisions, [], 'Readable attention labels at' + width + ' query' + q);
      }
      await page.keyboard.press('Escape');
    }
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.goto(
      base + '/atlas.html?step=7&orch=6&cache=edit&hook=handoff&harness=claude#system',
    );
    assert.equal(
      await page.locator('#sessionStep').inputValue(),
      '7',
      'Explicit deep links stay intentional',
    );
    await page.locator('#restartAtlas').click();
    assert.equal(await page.locator('body').getAttribute('data-view'), 'welcome');
    assert.equal(new URL(page.url()).search, '');
    await page.locator('[data-view=system]').first().click();
    assert.equal(await page.locator('#sessionStep').inputValue(), '0');
    await page.locator('[data-view=orchestration]').first().click();
    assert.equal(await page.locator('#orchStep').inputValue(), '0');
    await page.locator('[data-view=hooks]').first().click();
    assert.equal(
      await page.locator('[data-select-hook=start]').getAttribute('aria-pressed'),
      'true',
    );
    await page.locator('[data-view=cache]').first().click();
    assert.equal(await page.locator('#cacheCase').inputValue(), 'cold');
    await page.goto(base + '/atlas.html?learn=mechanism#attention');
    assert.equal(await page.locator('#positionModel').inputValue(), '0');
    await page.goto(base + '/atlas.html?inside=attention&calc=2#system');
    assert.equal(await page.locator('[data-walkthrough-view]').count(), 0);
    assert.equal(
      new URL(page.url()).searchParams.has('inside'),
      false,
      'Obsolete separate-view state removed',
    );
    for (const width of [320, 390, 1366, 1600]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(base + '/atlas.html?step=6&workload=org#system');
      const spills = await page
        .locator(
          '.system10 .transition-row .current-amount,.system10 .transition-row .previous-amount',
        )
        .evaluateAll((ns) =>
          ns
            .filter((e) => {
              const r = document.createRange();
              r.selectNodeContents(e);
              return r.getBoundingClientRect().width > e.getBoundingClientRect().width + 1;
            })
            .map((e) => e.textContent),
        );
      assert.deepEqual(spills, [], 'Large-repository tokens fit at' + width);
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    console.log(
      'PASS round10 integrated heat/scoped delegation/first-step journey, annotated single ' +
        'replay, separate delegation ledger, loading rules, cache, goal retention, weights, ' +
        'lifecycle→kits, responsive/offline.',
    );
  } finally {
    await browser?.close();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
