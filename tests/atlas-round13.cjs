const assert = require('node:assert/strict'),
  fs = require('node:fs/promises'),
  path = require('node:path'),
  http = require('node:http'),
  { chromium } = require('playwright');
const root = path.resolve(__dirname, '../docs'),
  out = path.resolve(__dirname, '../deliverables/round13');
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
          '.mjs': 'text/javascript',
          '.zip': 'application/zip',
        }[path.extname(f)] || 'text/plain',
      );
      const payload = await fs.readFile(f);
      res.end(
        f.endsWith('atlas.html')
          ? payload
              .toString()
              .replace('</head>', '<script>window.ATLAS_LEGACY13=true</script></head>')
          : payload,
      );
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
        viewport: { width: 1366, height: 768 },
        reducedMotion: 'reduce',
      }),
      errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const base = 'http://127.0.0.1:' + server.address().port + '/atlas.html';
    await page.goto(base + '#qa');
    assert.equal(await page.locator('body').getAttribute('data-view'), 'qa');
    assert.equal(await page.locator('[data-qa-anchor]').count(), 3);
    assert.match(await page.locator('#atlasCanvas').textContent(), /Model|Context|Harness/i);
    await page.locator('[data-show-skill-guide]').click();
    assert.ok(await page.locator('#skillGuideDialog').evaluate((e) => e.open));
    assert.equal(await page.locator('[data-skill-guide-step]').count(), 5);
    assert.match(await page.locator('#skillGuideBody').textContent(), /bootstrap-preview.json/);
    await page.locator('[data-skill-guide-step=audit]').click();
    assert.match(await page.locator('#skillGuideBody').textContent(), /AskUserQuestion/);
    assert.match(await page.locator('#skillGuideBody').textContent(), /no network\/model calls/);
    assert.match(
      await page.locator('#skillGuideBody').textContent(),
      /context-audit-data\/reports/,
    );
    await page.locator('#skillGuideBody details summary').click();
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.locator('[data-copy-skill-snippet=audit]').click();
    assert.match(await page.evaluate(() => navigator.clipboard.readText()), /^\/context-audit\n/);
    await page.locator('[data-skill-guide-step=packages]').click();
    assert.equal(await page.locator('[data-guide-package]').count(), 5);
    await page.locator('[data-skill-guide-step=workflow]').click();
    assert.match(await page.locator('#skillGuideBody').textContent(), /context-audit-evidence/);
    await page.locator('[data-copy-skill-snippet=workflow]').click();
    assert.match(
      await page.evaluate(() => navigator.clipboard.readText()),
      /^\/context-audit workflow\n/,
    );
    await page.locator('#copySkillGuideLink').click();
    assert.match(await page.evaluate(() => navigator.clipboard.readText()), /help=skill/);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#skillGuideDialog').evaluate((e) => e.open), false);
    await page.goto(base + '?help=skill&helpStep=workflow#qa');
    assert.equal(
      await page.locator('#skillGuidePanel').getAttribute('data-guide-step'),
      'workflow',
    );
    await page.keyboard.press('Escape');
    await page.locator('[data-qa-anchor=system]').click();
    assert.equal(await page.locator('#sessionStep').inputValue(), '0');
    assert.equal(new URL(page.url()).searchParams.get('guide'), 'qa');
    assert.ok(await page.locator('#qaGuide').isVisible());
    for (const step of [6, 9, 0]) {
      await page.locator('[data-qa-preset="' + step + '"]').click();
      assert.equal(await page.locator('#sessionStep').inputValue(), String(step));
    }
    await page.reload();
    assert.ok(await page.locator('#qaGuide').isVisible());
    await page.locator('#qaGuide [data-qa-jump=automation]').click();
    assert.equal(await page.locator('[data-automation]').count(), 4);
    for (const id of ['reminders', 'results', 'continuity', 'workflow']) {
      await page.locator('[data-automation=' + id + ']').click();
      assert.equal(
        await page.locator('[data-automation-detail]').getAttribute('data-automation-detail'),
        id,
      );
    }
    assert.equal(await page.locator('[data-workflow-stage]').count(), 4);
    await page.locator('#qaGuide [data-qa-jump=audit]').click();
    assert.match(await page.locator('#atlasCanvas').textContent(), /synthetic/i);
    await page.locator('[data-show-skill-guide]').click();
    assert.match(await page.locator('#skillGuideBody').textContent(), /Node.js 18/);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-audit-finding]').count(), 3);
    assert.equal(await page.locator('[data-audit-metric=requests]').textContent(), '12');
    assert.equal(await page.locator('[data-audit-metric=input]').textContent(), '1,008,000');
    await page.locator('#auditStage-choose').click();
    assert.equal(await page.locator('[data-audit-package]').count(), 5);
    await page.locator('[data-audit-package=evidence]').check();
    await page.locator('#auditStage-preview').click();
    await page.locator('#showAuditPreview').click();
    assert.match(await page.locator('#auditPreviewBody').textContent(), /PostToolUse|evidence/);
    assert.equal(await page.locator('#auditPreviewBody pre').count(), 0);
    await page.keyboard.press('Escape');
    const href = await page.locator('#downloadAuditSelection').getAttribute('href');
    const selection = JSON.parse(decodeURIComponent(href.split(',')[1]));
    assert.ok(selection.packages.includes('evidence'));
    assert.equal(selection.schema, 1);
    assert.equal(
      (await page.request.get(base.replace('atlas.html', 'audit/context-audit.zip'))).status(),
      200,
    );
    await page.locator('#qaGuide [data-qa-jump=qa]').click();
    assert.equal(await page.locator('[data-qa-anchor]').count(), 3);
    await page.locator('#restartAtlas').click();
    assert.equal(await page.locator('body').getAttribute('data-view'), 'welcome');
    assert.equal(new URL(page.url()).search, '');
    await page.goto(base + '?guide=qa#automation');
    await page.locator('#exitQaGuide').click();
    assert.equal(new URL(page.url()).searchParams.has('guide'), false);
    for (const width of [1366, 390, 320]) {
      await page.setViewportSize({ width, height: width === 1366 ? 768 : 844 });
      for (const view of ['qa', 'automation', 'audit']) {
        await page.goto(base + '?present=1#' + view);
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          'horizontal ' + view + '/' + width,
        );
        if (width === 1366)
          assert.ok(
            await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 2),
            'live fit ' + view,
          );
        assert.deepEqual(
          await page
            .locator('#atlasCanvas *')
            .evaluateAll((ns) =>
              ns
                .filter(
                  (e) =>
                    e.getClientRects().length &&
                    ['auto', 'scroll'].includes(getComputedStyle(e).overflowY) &&
                    e.scrollHeight > e.clientHeight + 2,
                )
                .map((e) => e.className),
            ),
          [],
        );
        if (width !== 320)
          await page.screenshot({ path: out + '/' + view + '-' + width + '.png', fullPage: true });
      }
    }
    await page.setViewportSize({ width: 1366, height: 768 });
    for (const url of [
      '?guide=qa&step=0&present=1#system',
      '?guide=qa&step=6&present=1#system',
      '?guide=qa&step=9&present=1#system',
      '?guide=qa&automation=workflow&present=1#automation',
      '?guide=qa&audit=choose&present=1#audit',
      '?guide=qa&audit=preview&present=1#audit',
      '?guide=qa&audit=preview&packages=continuity,results,evidence,workflow,measurement&present=1#audit',
      '?guide=qa&heat=1&step=6&present=1#system',
    ]) {
      await page.goto(base + url);
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 2),
        'guide fit ' + url,
      );
    }
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(base + '#qa');
      await page.locator('[data-show-skill-guide]').click();
      for (const step of ['install', 'audit', 'packages', 'workflow', 'evaluate']) {
        await page.locator('[data-skill-guide-step=' + step + ']').click();
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          'Guide body fit ' + width + '/' + step,
        );
        assert.ok(
          await page
            .locator('#skillGuideDialog')
            .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
          'Guide content fit ' + width + '/' + step,
        );
      }
      await page.keyboard.press('Escape');
    }
    assert.deepEqual(errors, []);
    console.log(
      'PASS R13 QA anchors, guide/presets/reset, automation workflows, real sample accounting, ' +
        'package selection/preview/download, live/mobile layouts.',
    );
  } finally {
    await browser?.close();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
