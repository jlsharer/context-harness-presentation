const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../docs');
(async () => {
  const server = http.createServer(async (req, res) => {
    try {
      const u = new URL(req.url, 'http://localhost'),
        file = path.resolve(root, '.' + u.pathname);
      if (!file.startsWith(root + path.sep)) throw Error('path');
      res.setHeader(
        'Content-Type',
        file.endsWith('.js')
          ? 'text/javascript'
          : file.endsWith('.css')
            ? 'text/css'
            : file.endsWith('.html')
              ? 'text/html'
              : 'text/plain',
      );
      res.end(await fs.readFile(file));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.TEST_BROWSER });
    const page = await browser.newPage({
        viewport: { width: 1366, height: 768 },
        reducedMotion: 'reduce',
      }),
      errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const base = 'http://127.0.0.1:' + server.address().port + '/atlas.html';
    await page.goto(base + '#contents');
    assert.equal(await page.locator('.central-chapters14>button').count(), 2);
    await page.locator('.central-chapters14 [data-view=system]').click();
    assert.equal(await page.locator('#sessionStep').inputValue(), '0');
    assert.equal(await page.locator('[data-phase-step]').count(), 6);
    const arrow = await page.locator('#stepForward').boundingBox();
    for (const step of [4, 9, 12, 17, 21]) {
      await page.locator(`[data-phase-step="${step}"]`).click();
      assert.equal(await page.locator('#sessionStep').inputValue(), String(step));
      const next = await page.locator('#stepForward').boundingBox();
      assert.ok(Math.abs(next.x - arrow.x) < 0.5);
      assert.ok(Math.abs(next.y - arrow.y) < 0.5);
      assert.ok(
        (await page.locator('[data-session-lane=managed] [data-affected-layer]').count()) > 0,
      );
    }
    await page.locator('[data-session-lane=managed] [data-context14=base]').click();
    assert.equal(await page.locator('#contextDetails pre').count(), 0);
    assert.match(await page.locator('#contextDetails').textContent(), /6,000/);
    await page.keyboard.press('Escape');
    await page.goto(base + '?orch=20#orchestration');
    assert.equal(await page.locator('[data-actor-card]').count(), 5);
    assert.equal(await page.locator('[data-return-count]').getAttribute('data-return-count'), '3');
    await page.locator('#orchForward').click();
    assert.equal(await page.locator('[data-return-count]').getAttribute('data-return-count'), '4');
    await page.locator('[data-agent-route=W1]').click();
    await page.locator('#routeProvider').selectOption('openai');
    await page.locator('#routeModel').selectOption('luna');
    assert.match(await page.locator('#routingBody').textContent(), /Reprice/);
    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(base + '?orch=21#orchestration');
    assert.deepEqual(
      await page
        .locator('.average-parts14 small')
        .evaluateAll((nodes) =>
          nodes
            .filter(
              (e) =>
                e.getBoundingClientRect().width > e.parentElement.getBoundingClientRect().width + 1,
            )
            .map((e) => e.textContent),
        ),
      [],
      'Every worker billing label fits its column',
    );
    await page.locator('#inspectInvocation14').click();
    assert.match(await page.locator('#ledgerBody').textContent(), /compaction summary/);
    await page.keyboard.press('Escape');
    await page.goto(base + '#automation');
    assert.equal(await page.locator('[data-manual-map]').count(), 9);
    assert.match(await page.locator('#atlasCanvas').textContent(), /native auto-compaction/i);
    await page.locator('[data-manual-map=model-routing] [data-technique-link]').click();
    assert.equal(await page.locator('body').getAttribute('data-view'), 'recipes');
    assert.equal(await page.locator('[data-technique-selection=model-routing]').isChecked(), true);
    assert.equal(await page.locator('[data-technique-selection=scoped-worker]').isChecked(), true);
    assert.equal(
      await page.locator('[data-technique-selection=report-contract]').isChecked(),
      true,
    );
    assert.equal(
      await page.locator('[data-bundle-selection=handoff]').evaluate((e) => e.indeterminate),
      true,
    );
    await page.locator('[data-bundle-selection=handoff]').check();
    assert.equal(
      await page.locator('[data-technique-selection=workflow-coordinator]').isChecked(),
      true,
    );
    await page.locator('[data-technique-selection=report-contract]').uncheck();
    assert.equal(await page.locator('[data-technique-selection=model-routing]').isChecked(), false);
    while (await page.locator('[data-technique-selection]:checked').count()) {
      const id = await page
        .locator('[data-technique-selection]:checked')
        .first()
        .getAttribute('data-technique-selection');
      await page.locator(`[data-technique-selection="${id}"]`).uncheck();
    }
    await page.reload();
    assert.equal(
      await page.locator('[data-technique-selection]:checked').count(),
      0,
      'Empty package selection survives refresh',
    );
    await page.goto(base + '#recipes');
    assert.equal(await page.locator('#kitHarness').inputValue(), 'claude');
    assert.match(await page.locator('#installCommand').textContent(), /--techniques/);
    const kitDownload = page.locator('a[href="kits/claude-native.zip"]');
    assert.match(await kitDownload.textContent(), /Claude Code/);
    const downloaded = page.waitForEvent('download');
    await kitDownload.click();
    const archive = await downloaded;
    assert.equal(archive.suggestedFilename(), 'claude-native.zip');
    assert.deepEqual(
      await fs.readFile(await archive.path()),
      await fs.readFile(path.join(root, 'kits/claude-native.zip')),
    );
    await page.locator('#kitHarness').selectOption('opencode');
    assert.match(await page.locator('#installCommand').textContent(), /--harness opencode/);
    await page.locator('[data-package-preview="bundle:focus"]').click();
    await page.locator('[data-preview-dependencies]').click();
    assert.ok(await page.locator('[data-preview-directory=".opencode"]').count());
    assert.equal(await page.locator('[data-preview-directory=".claude"]').count(), 0);
    await page.keyboard.press('Escape');
    await page.locator('#kitHarness').selectOption('claude');
    assert.equal(
      await page.locator('[data-technique-selection=workflow-coordinator]').isChecked(),
      false,
    );
    assert.match(await page.locator('#installCommand').textContent(), /--techniques/);
    assert.doesNotMatch(await page.locator('#installCommand').textContent(), /--apply/);
    await page.reload();
    assert.equal(await page.locator('[data-technique-selection=model-routing]').isChecked(), false);
    await page.locator('[data-catalog-category=workflows]').click();
    assert.equal(await page.locator('[data-catalog-item]').count(), 3);
    await page.locator('[data-package-preview="technique:workflow-coordinator"]').click();
    assert.equal(
      await page.locator('.file-explorer14').getAttribute('data-preview-path'),
      'skills/context-workflow/SKILL.md',
    );
    assert.equal(
      await page.locator('[data-preview-file="skills/qa-failure-triage/SKILL.md"]').count(),
      0,
      'Default preview focuses on the selected workflow',
    );
    assert.match(await page.locator('.explorer-loading14').textContent(), /on use|invoked/);
    await page.locator('[data-preview-dependencies]').click();
    assert.equal(
      await page.locator('[data-preview-file="skills/qa-failure-triage/SKILL.md"]').count(),
      1,
      'Required workflow dependencies remain inspectable',
    );
    await page.locator('[data-preview-dependencies]').click();
    const referencesFolder = page.locator(
      'details[data-preview-directory="skills/context-workflow/references"]',
    );
    assert.equal(await referencesFolder.count(), 1, 'Preview directories are interactive');
    await referencesFolder.locator(':scope > summary').click();
    assert.equal(await referencesFolder.getAttribute('open'), null);
    assert.equal(
      await page
        .locator('[data-preview-file="skills/context-workflow/references/repository-setup.md"]')
        .isVisible(),
      false,
    );
    await page.locator('[data-preview-mode=source]').click();
    assert.equal(
      await referencesFolder.getAttribute('open'),
      null,
      'Collapsed folders survive file/mode changes',
    );
    await page.locator('[data-preview-expand-all]').click();
    assert.equal(await page.locator('details[data-preview-directory]:not([open])').count(), 0);
    await page.locator('[data-preview-collapse-all]').click();
    assert.equal(await page.locator('details[data-preview-directory][open]').count(), 0);
    const claudeFolder = page.locator('details[data-preview-directory="skills"]');
    await claudeFolder.locator(':scope > summary').focus();
    await page.keyboard.press('Enter');
    assert.notEqual(
      await claudeFolder.getAttribute('open'),
      null,
      'Directory can be expanded with keyboard',
    );
    await page.locator('[data-preview-expand-all]').click();
    await page.locator('[data-preview-mode=read]').click();
    assert.ok(
      (await page.locator('.file-explorer14').getAttribute('data-preview-path')).endsWith(
        '/context-workflow/SKILL.md',
      ),
    );
    assert.match(await page.locator('.markdown-preview14').textContent(), /Stage contracts/);
    await page.locator('[data-preview-mode=source]').click();
    assert.match(
      await page.locator('.markdown-preview14 pre code').textContent(),
      /^---\nname: context-workflow/,
    );
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.locator('#copyPreviewFile14').click();
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      await page.locator('.markdown-preview14 pre code').textContent(),
    );
    await page.locator('[data-preview-mode=read]').click();
    await referencesFolder.locator(':scope > summary').click();
    await page.locator('[data-preview-relative="references/repository-setup.md"]').click();
    assert.notEqual(
      await referencesFolder.getAttribute('open'),
      null,
      'Following a reference reveals its containing folder',
    );
    assert.match(
      await page.locator('.file-explorer14').getAttribute('data-preview-path'),
      /references\/repository-setup.md$/,
    );
    await page.keyboard.press('Escape');
    await page.locator('[data-catalog-kind=skills]').click();
    assert.equal(await page.locator('[data-catalog-item]').count(), 4);
    for (const category of ['hooks', 'protocols', 'helpers', 'routing']) {
      await page.locator(`[data-catalog-category="${category}"]`).click();
      const cards = await page.locator('[data-catalog-item]').count();
      assert.equal(await page.locator('[data-catalog-item] [data-package-preview]').count(), cards);
    }
    await page.locator('[data-catalog-category=hooks]').click();
    const reminderCard = page.locator('[data-catalog-item="goal-reminder"]');
    const reminderDownload = page.waitForEvent('download');
    await reminderCard.locator('a[href="kits/claude/technique-goal-reminder.zip"]').click();
    const reminderArchive = await reminderDownload;
    assert.deepEqual(
      await fs.readFile(await reminderArchive.path()),
      await fs.readFile(path.join(root, 'kits/claude/technique-goal-reminder.zip')),
    );
    await reminderCard.locator('[data-package-preview]').click();
    assert.equal(
      await page.locator('.file-explorer14').getAttribute('data-preview-path'),
      'hooks/goal-reminder.mjs',
    );
    assert.equal(
      await page.locator('[data-preview-file]').count(),
      2,
      'Reminder preview has only its hook and settings entry',
    );
    assert.match(await page.locator('.explorer-scope14').textContent(), /~\/.claude/);
    assert.match(await page.locator('.explorer-loading14').textContent(), /UserPromptSubmit/);
    await page.keyboard.press('Escape');
    await page.goto(base + '?orch=22#orchestration');
    assert.equal(await page.locator('[data-average-actor]').count(), 5);
    await page.locator('[data-average-actor=parent]').click();
    assert.match(await page.locator('#ledgerBody').textContent(), /billed tokens\/call/);
    assert.match(await page.locator('.cost-equation14').textContent(), /calls ×/);
    await page.keyboard.press('Escape');
    for (const view of ['system', 'orchestration', 'automation'])
      for (const step of view === 'automation' ? [0] : [0, 3, 8, 15, 16, 20, 22]) {
        await page.goto(
          base + `?present=1&${view === 'orchestration' ? 'orch' : 'step'}=${step}#${view}`,
        );
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `horizontal ${view}/${step}`,
        );
        if (await page.evaluate(() => document.documentElement.scrollHeight > innerHeight + 2))
          console.log(
            await page
              .locator('.atlas-shell>*, .journey14>*, .session-lane14:first-child>*')
              .evaluateAll((nodes) =>
                nodes.map((e) => ({
                  name: e.id || e.className,
                  height: e.getBoundingClientRect().height,
                  top: e.getBoundingClientRect().top,
                })),
              ),
            await page.locator('#atlasCanvas').evaluate((e) => ({
              height: e.getBoundingClientRect().height,
              css: getComputedStyle(e).cssText,
              padding: getComputedStyle(e).padding,
              font: getComputedStyle(e).fontSize,
              minHeight: getComputedStyle(e).minHeight,
            })),
          );
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 2),
          `live fit ${view}/${step}: ${await page.evaluate(() => document.documentElement.scrollHeight)}`,
        );
        assert.deepEqual(
          await page
            .locator('#atlasCanvas *')
            .evaluateAll((nodes) =>
              nodes
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
      }
    await fs.mkdir(path.resolve(__dirname, '../deliverables/round14'), { recursive: true });
    for (const view of ['system', 'orchestration', 'automation', 'recipes']) {
      await page.goto(base + `?step=16&orch=21#${view}`);
      await page.screenshot({
        path: path.resolve(__dirname, `../deliverables/round14/${view}-1366.png`),
        fullPage: true,
      });
    }
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      for (const view of ['system', 'orchestration', 'automation', 'recipes', 'qa']) {
        await page.goto(base + `?step=16&orch=21#${view}`);
        if (view === 'recipes') {
          await page.locator('[data-package-preview="bundle:qa"]').click();
          assert.ok(
            await page
              .locator('#packageFilesDialog')
              .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
            'Mobile file preview fits',
          );
          await page.locator('[data-preview-collapse-all]').click();
          assert.equal(await page.locator('details[data-preview-directory][open]').count(), 0);
          await page.keyboard.press('Escape');
        }
        if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1))
          console.log(
            await page.locator('body *').evaluateAll((nodes) =>
              nodes
                .filter(
                  (e) =>
                    e.getClientRects().length &&
                    e.getBoundingClientRect().right > innerWidth + 1 &&
                    (e.children.length === 0 || e.tagName === 'BUTTON'),
                )
                .slice(0, 20)
                .map((e) => ({
                  name: e.className || e.id,
                  text: e.textContent.slice(0, 60),
                  width: e.getBoundingClientRect().width,
                  right: e.getBoundingClientRect().right,
                })),
            ),
          );
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `mobile ${view}/${width}`,
        );
      }
    }
    await page.goto(base + '#system');
    await page.locator('#restartAtlas').click();
    assert.equal(await page.locator('body').getAttribute('data-view'), 'welcome');
    await page.goto(base + '#system');
    assert.equal(await page.locator('#sessionStep').inputValue(), '0');
    assert.deepEqual(errors, []);
    console.log(
      'PASS R14 browser: central QA replay, phases/fixed arrows, row impacts/details, routed ' +
        'workers/returns, costs, mapping, granular selection, live/mobile/reset.',
    );
  } finally {
    await browser?.close();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
