import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
export const techniques = JSON.parse(
  fs.readFileSync(fileURLToPath(new URL('./techniques.json', import.meta.url)), 'utf8'),
);
export const bundles = JSON.parse(
  fs.readFileSync(fileURLToPath(new URL('./catalog.json', import.meta.url)), 'utf8'),
);

export function resolveSelection({ kits = [], techniques: chosen = [] } = {}) {
  if (!Array.isArray(kits) || !Array.isArray(chosen)) throw Error('Selection arrays required');
  const selected = new Set();

  const visit = (id) => {
    const item = techniques.find((t) => t.id === id);
    if (!item) throw Error('Choose known techniques');
    if (selected.has(id)) return;
    selected.add(id);
    for (const dependency of item.requires) visit(dependency);
  };

  for (const id of kits) {
    const bundle = bundles.find((b) => b.id === id);
    if (!bundle) throw Error('Choose known packages');
    for (const child of bundle.techniques) visit(child);
  }
  for (const id of chosen) visit(id);
  return [...selected].sort();
}
