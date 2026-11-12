import { readFile } from 'node:fs/promises';
import { buildPacket, scopeDependencies, requireAnchors } from './context-policy.mjs';
const fixture = JSON.parse(await readFile(new URL('./fixture.json', import.meta.url), 'utf8'));
const graph = [['API','Service'], ['Service','Journal'], ['Service','Delivery']];
const scoped = scopeDependencies(graph, 'API', 2);
// This fixture's first8 sources are the incident bundle; choose real mappings for your repo.
const packet = buildPacket(fixture.files.slice(0, 8), fixture.task, fixture.criteria, 'task-first');
requireAnchors(packet.text, ['API-2','STORAGE-2','INCIDENT-2']);
console.log(JSON.stringify({ exactDepth2: scoped.exact, withinDepth2: scoped.within, files: packet.sourceFiles, exampleBytes: packet.bytes }, null, 2));
console.log('Offline teaching example; UTF-8 bytes are not model tokens. Anchor presence does not prove semantic preservation.');
