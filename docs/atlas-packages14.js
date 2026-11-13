'use strict';
const AtlasCatalog14 = {
  categories: [
    ['bundles', 'Bundled'],
    ['hooks', 'Hooks'],
    ['workflows', 'Commands / Workflows'],
    ['protocols', 'Protocols'],
    ['helpers', 'Helpers / Guidance'],
    ['routing', 'Agents / Routing'],
  ],

  previewButton(kind, id, label = 'Preview files') {
    return `<button class="preview-files14" data-package-preview="${kind}:${id}">${label} ↗</button>`;
  },

  capability(s, t) {
    if (t.skill)
      return s.kitHarness === 'claude'
        ? 'Claude entry: /' + t.skill
        : s.kitHarness === 'codex'
          ? 'Codex entry: $' + t.skill
          : s.kitHarness === 'opencode'
            ? t.category === 'workflows'
              ? 'OpenCode command: /' + t.skill
              : 'OpenCode: named skill discovery'
            : 'Portable: read the complete skill and run its supplied helpers';
    if (s.kitHarness === 'claude' && t.category === 'hooks')
      return 'Claude: selected native event integration; verify installed runtime';
    if (s.kitHarness === 'claude' && t.id === 'model-routing')
      return 'Claude: scoped read-only native agents; routing remains a coordinator decision';
    if (s.kitHarness === 'opencode' && ['goal-reminder', 'compaction-checkpoint'].includes(t.id))
      return 'OpenCode: paired native continuity adapter when both are selected; otherwise protocol';
    return 'This target: portable protocol/helper; no unsupported automatic native hook is claimed';
  },

  standalone(s, t) {
    return `<article class="catalog-item14" data-catalog-item="${t.id}">
      <header>
      <label>
      <input type="checkbox" id="techniqueChoice-${t.id}" data-technique-selection="${t.id}" ${s.selectedTechniques.includes(t.id) ? 'checked' : ''}>
      <strong>${AtlasContent.esc(t.name)}</strong>
      </label>
      <span>${t.category === 'skills' ? 'Standalone skill' : t.category === 'workflows' ? 'Workflow entry' : 'Standalone technique'}</span>
      </header>
      <p>${AtlasContent.esc(t.purpose)}</p>
      <small>${AtlasContent.esc(t.mechanism)}</small><p class="package-capability14">${AtlasContent.esc(this.capability(s, t))}</p>${t.requires.length ? `<p class="dependency-note14">Includes: ${t.requires.map((id) => AtlasContent.esc(atlasTechniques14.find((x) => x.id === id).name)).join(' · ')}</p>` : ''}<footer>${this.previewButton('technique', t.id)}<button data-mapping-detail="${t.id}">How it works ↗</button>
      </footer>
      </article>`;
  },

  render(s) {
    const category = s.catalogCategory || 'bundles',
      kind = s.catalogKind || 'workflows',
      selected = s.selectedTechniques,
      harnessName = {
        claude: 'Claude Code',
        opencode: 'OpenCode',
        codex: 'Codex',
        portable: 'portable',
      }[s.kitHarness];
    const command = selected.length
      ? `node install.mjs --harness ${s.kitHarness} --techniques ${selected.join(',')} --target /path/to/project`
      : 'Choose a bundle or standalone item.';
    const cards =
      category === 'bundles'
        ? atlasKits08
            .map((b) => {
              const count = b.techniques.filter((id) => selected.includes(id)).length;
              return `<section class="bundle-card14" data-bundle-card="${b.id}">
      <header>
      <label>
      <input type="checkbox" id="bundleChoice-${b.id}" data-bundle-selection="${b.id}" ${count === b.techniques.length ? 'checked' : ''} data-mixed="${count > 0 && count < b.techniques.length}">
      <strong>${AtlasContent.esc(b.name)}</strong>
      </label>
      <span>Bundle · ${count}/${b.techniques.length} selected</span>
      </header>
      <p>${AtlasContent.esc(b.purpose)}</p>
      <div class="standalone-list14">${b.techniques
        .map((id) => {
          const t = atlasTechniques14.find((t) => t.id === id);
          return `<div class="standalone14 ${s.focusTechnique === id ? 'focused14' : ''}" id="technique-${id}">
      <label>
      <input type="checkbox" id="techniqueChoice-${id}" data-technique-selection="${id}" ${selected.includes(id) ? 'checked' : ''}>
      <span>${AtlasContent.esc(t.name)}<small>${AtlasContent.esc(t.mechanism)}</small>
      </span>
      </label>${this.previewButton('technique', id, 'Files')}</div>`;
        })
        .join(
          '',
        )}</div>${this.previewButton('bundle', b.id, 'Preview bundle directory')}</section>`;
            })
            .join('')
        : atlasTechniques14
            .filter((t) => t.category === (category === 'workflows' ? kind : category))
            .map((t) => this.standalone(s, t))
            .join('');
    return `<div class="packages14">
      <div class="catalog-welcome14">
      <div>
      <strong>Take a working pattern back to your harness.</strong>
      <p>Browse complete workflow and skill files, select a bundle or its parts, then preview the local install. Native hooks, protocols and helpers are labeled separately. Skills include operating references, templates and validators.</p>
      </div>
      <label>Download + preview target<select id="kitHarness">${[
        ['claude', 'Claude Code'],
        ['opencode', 'OpenCode'],
        ['codex', 'Codex'],
        ['portable', 'Portable helpers'],
      ]
        .map(
          ([id, label]) =>
            `<option value="${id}" ${s.kitHarness === id ? 'selected' : ''}>${label}</option>`,
        )
        .join('')}</select>
      </label>
      </div>
      <nav class="catalog-categories14" aria-label="Package categories">${this.categories.map(([id, label]) => `<button data-catalog-category="${id}" aria-pressed="${category === id}">${label}</button>`).join('')}</nav>${
        category === 'workflows'
          ? `<nav class="catalog-subcategories14" aria-label="Workflow and skill types">
      <button data-catalog-kind="workflows" aria-pressed="${kind === 'workflows'}">Complete workflows</button>
      <button data-catalog-kind="skills" aria-pressed="${kind === 'skills'}">Skills · select independently</button>
      <span>Modern SKILL.md entries create slash commands where supported; inspect the contained skills in Preview files.</span>
      </nav>`
          : ''
      }<div class="bundle-grid14">${cards}</div>
      <section class="install-panel14">
      <strong>${selected.length} techniques / workflows / skills selected</strong>
      <code id="installCommand">${AtlasContent.esc(command)}</code>
      <p>Download → extract → run the preview command → review local files → repeat with <code>--apply</code> when authorized. Parent checkboxes select a whole bundle; mixed means partial. Dependencies are included; removing one also removes dependent workflows. Legacy <code>--kits</code> commands still work.</p>
      <div>
      <a href="kits/context-kits.zip" download="context-kits-${s.kitHarness}.zip">Download ${harnessName} install kit ↓</a>
      <button id="copyInstallCommand" ${!selected.length ? 'disabled' : ''}>Copy selected preview command</button>
      <button id="inspectPackageFiles14">Selection + support ↗</button>
      <button data-view="audit">Global Claude usage audit →</button>
      </div>
      <p>The shared archive includes the installer and all package sources. The selected target controls the native paths in Preview files and the install command. Claude Code installs skills under <code>.claude/skills/</code>, selected agents/hooks under <code>.claude/</code>, and selected project guidance in <code>CLAUDE.md</code>.</p>
      <p>Claude: selected supported hooks/agents. OpenCode: paired continuity adapter or portable guidance. Codex: skills/protocols/helpers here. No permissions or telemetry export changes. The global audit package keeps its private local-report defaults.</p>
      </section>
      <p class="package-authoring14">Authoring basis: <a href="kits/qa/references/provenance.md" target="_blank" rel="noopener noreferrer">published practices and source examples ↗</a> · <a href="kits/README.md" target="_blank" rel="noopener noreferrer">installation and operating guide ↗</a>. Validate native behavior and accepted-task results in your own environment.</p>
      </div>`;
  },

  inline(text) {
    let safe = AtlasContent.esc(text);
    safe = safe
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return safe.replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (_, label, target) => {
      if (/^https?:\/\//.test(target))
        return (
          '<a href="' + target + '" target="_blank" rel="noopener noreferrer">' + label + ' ↗</a>'
        );
      if (/^[A-Za-z0-9_./#-]+$/.test(target))
        return (
          '<button class="markdown-file-link14" data-preview-relative="' +
          target +
          '">' +
          label +
          '</button>'
        );
      return label;
    });
  },

  markdown(text) {
    const lines = text.split('\n'),
      out = [];
    let code = null,
      list = null,
      paragraph = [];

    const flush = () => {
      if (paragraph.length) {
        out.push('<p>' + paragraph.map((l) => this.inline(l)).join(' ') + '</p>');
        paragraph = [];
      }
    };

    const closeList = () => {
      if (list) {
        out.push('</' + list + '>');
        list = null;
      }
    };

    let offset = 0;
    if (lines[0] === '---') {
      const end = lines.indexOf('---', 1);
      if (end > 0) {
        out.push(
          '<details class="frontmatter14"><summary>Skill metadata / frontmatter</summary><pre><code>' +
            AtlasContent.esc(lines.slice(1, end).join('\n')) +
            '</code></pre></details>',
        );
        offset = end + 1;
      }
    }
    const body = lines.slice(offset);
    for (let index = 0; index < body.length; index++) {
      const line = body[index];
      if (line.startsWith('```')) {
        flush();
        closeList();
        if (code !== null) {
          out.push('<pre><code>' + AtlasContent.esc(code.join('\n')) + '</code></pre>');
          code = null;
        } else code = [];
        continue;
      }
      if (code !== null) {
        code.push(line);
        continue;
      }
      if (
        line.includes('|') &&
        /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(body[index + 1] || '')
      ) {
        flush();
        closeList();

        const cells = (row) =>
          row
            .trim()
            .replace(/^\||\|$/g, '')
            .split('|')
            .map((cell) => this.inline(cell.trim()));

        out.push(
          '<table><thead><tr>' +
            cells(line)
              .map((cell) => '<th>' + cell + '</th>')
              .join('') +
            '</tr></thead><tbody>',
        );
        index += 2;
        while (index < body.length && body[index].includes('|') && body[index].trim()) {
          out.push(
            '<tr>' +
              cells(body[index])
                .map((cell) => '<td>' + cell + '</td>')
                .join('') +
              '</tr>',
          );
          index++;
        }
        index--;
        out.push('</tbody></table>');
        continue;
      }
      const heading = line.match(/^(#{1,6})\s+(.+)$/),
        item = line.match(/^\s*(?:([-*])|\d+\.)\s+(.+)$/);
      if (heading) {
        flush();
        closeList();
        const n = Math.min(heading[1].length, 4);
        out.push('<h' + n + '>' + this.inline(heading[2]) + '</h' + n + '>');
      } else if (item) {
        flush();
        const type = item[1] ? 'ul' : 'ol';
        if (list !== type) {
          closeList();
          out.push('<' + type + '>');
          list = type;
        }
        out.push('<li>' + this.inline(item[2]) + '</li>');
      } else if (!line.trim()) {
        flush();
        closeList();
      } else {
        closeList();
        paragraph.push(line);
      }
    }
    flush();
    closeList();
    if (code !== null)
      out.push('<pre><code>' + AtlasContent.esc(code.join('\n')) + '</code></pre>');
    return out.join('\n');
  },

  fileTree(manifest, selectedPath, collapsed) {
    const root = new Map();
    for (const file of manifest) {
      const parts = file.path.split('/');
      let children = root;
      parts.forEach((name, depth) => {
        if (depth === parts.length - 1) children.set(name, { name, file, depth });
        else {
          if (!children.has(name))
            children.set(name, {
              name,
              path: parts.slice(0, depth + 1).join('/'),
              depth,
              children: new Map(),
            });
          children = children.get(name).children;
        }
      });
    }

    const render = (children) =>
      [...children.values()]
        .sort(
          (a, b) =>
            Number(Boolean(b.children)) - Number(Boolean(a.children)) ||
            a.name.localeCompare(b.name),
        )
        .map((node) =>
          node.children
            ? `<details data-preview-directory="${AtlasContent.esc(node.path)}" ${collapsed.has(node.path) ? '' : 'open'}>
        <summary class="explorer-folder14" style="--depth:${node.depth}">${AtlasContent.esc(node.name)}/</summary>
        ${render(node.children)}</details>`
            : `<button style="--depth:${node.depth}" data-preview-file="${AtlasContent.esc(node.file.path)}" aria-current="${node.file.path === selectedPath ? 'page' : 'false'}">
        <span>${node.file.markdown ? 'M↓' : '{}'}</span>${AtlasContent.esc(node.name)}</button>`,
        )
        .join('');

    return render(root);
  },

  preview(s, key, requestedFile, mode = 'read', collapsed = new Set()) {
    const manifest = atlasPackageFiles14.manifests[s.kitHarness + ':' + key];
    if (!manifest) return '<p>No preview is available for this selection.</p>';
    const [kind, id] = key.split(':');
    const item = kind === 'technique' ? atlasTechniques14.find((t) => t.id === id) : null;
    const selected =
      manifest.find((f) => f.path === requestedFile) ||
      (item?.skill
        ? manifest.find((f) => f.path.endsWith('/' + item.skill + '/SKILL.md'))
        : null) ||
      manifest.find((f) => f.path.endsWith('/PROTOCOLS.md')) ||
      manifest[0];
    const tree = this.fileTree(manifest, selected.path, collapsed);
    const source = atlasPackageFiles14.contents[selected.hash];
    return `<div class="file-explorer14" data-preview-harness="${s.kitHarness}" data-preview-key="${key}" data-preview-path="${AtlasContent.esc(selected.path)}" data-preview-mode="${mode}">
      <p class="explorer-scope14">Fresh-install example · ${AtlasContent.esc(s.kitHarness)} · this package + dependencies. <code>&lt;PROJECT&gt;</code> is a placeholder. Your existing private settings are merged locally and are never read by this browser.</p>
      <div class="explorer-layout14">
      <nav class="explorer-tree14" aria-label="Installed file solution explorer">
      <h3>PROJECT / SOLUTION EXPLORER</h3>
      <div class="explorer-actions14"><button data-preview-expand-all>Expand all</button><button data-preview-collapse-all>Collapse all</button></div>${tree}</nav>
      <section class="explorer-editor14">
      <header>
      <strong>${AtlasContent.esc(selected.path)}</strong>
      <div>${
        selected.markdown
          ? `<button data-preview-mode="read" aria-pressed="${mode === 'read'}">Rendered Markdown</button>
      <button data-preview-mode="source" aria-pressed="${mode === 'source'}">Markdown source</button>`
          : '<span>Complete source</span>'
      }<button id="copyPreviewFile14">Copy file</button>
      <a href="data:text/plain;charset=utf-8,${encodeURIComponent(source)}" download="${AtlasContent.esc(selected.path.split('/').at(-1))}">Download file ↓</a>
      </div>
      </header>
      <article class="markdown-preview14">${selected.markdown && mode === 'read' ? this.markdown(source) : '<pre><code>' + AtlasContent.esc(source) + '</code></pre>'}</article>
      </section>
      </div>
      </div>`;
  },
};
const recipesBeforeCatalog14 = AtlasContent.recipes;

AtlasContent.recipes = function (s) {
  return s.legacy ? recipesBeforeCatalog14.call(this, s) : AtlasCatalog14.render(s);
};
