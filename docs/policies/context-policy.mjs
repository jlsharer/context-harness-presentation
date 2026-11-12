// Portable teaching policies. No model calls, SDK dependency or global configuration.
// Anchor presence is a structural check, not proof that a summary preserves meaning.
export function scopeDependencies(edges, root, depth) {
 if (!Number.isInteger(depth) || depth < 0) throw new Error('depth must be a nonnegative integer');
 const graph = new Map();
 for (const [from, to] of edges) {
  if (!graph.has(from)) graph.set(from, []);
  graph.get(from).push(to);
 }
 const distances = new Map([[root, 0]]), queue = [root];
 for (let i = 0; i < queue.length; i++) {
  const node = queue[i], distance = distances.get(node);
  if (distance >= depth) continue;
  for (const next of graph.get(node) || []) {
   if (!distances.has(next)) { distances.set(next, distance + 1); queue.push(next); }
  }
 }
 return {
  exact: [...distances].filter(([, d]) => d === depth).map(([node]) => node),
  within: [...distances.keys()],
  distances: Object.fromEntries(distances)
 };
}
export function buildPacket(files, task, checks, layout = 'task-first') {
 if (!task?.trim()) throw new Error('A nonempty task is required');
 if (!Array.isArray(checks) || !checks.length) throw new Error('Acceptance checks are required');
 const sections = {
  task: '### Task + constraints\n' + task,
  evidence: '### Selected evidence\n' + files.map(f => '<source path=' + JSON.stringify(f.name) + '>\n' + f.text + '\n</source>').join('\n\n'),
  checks: '### Acceptance checks\n' + checks.map((x, i) => (i + 1) + '. ' + x).join('\n')
 };
 const order = { 'task-first': ['task','evidence','checks'], 'evidence-first': ['evidence','task','checks'], 'task-last': ['evidence','checks','task'] }[layout];
 if (!order) throw new Error('Unknown content layout');
 const text = order.map(id => sections[id]).join('\n\n'), bytes = s => new TextEncoder().encode(s).length;
 return { text, bytes: bytes(text), sourceBodyBytes: files.reduce((n, f) => n + bytes(f.text), 0), sourceFiles: files.map(f => f.name), order };
}
export function requireAnchors(text, required) {
 const missing = required.filter(anchor => !text.includes(anchor));
 if (missing.length) throw new Error('Missing required source anchors: ' + missing.join(', '));
 return true;
}
