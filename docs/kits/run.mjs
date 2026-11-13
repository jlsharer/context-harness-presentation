import fs from 'node:fs';
import path from 'node:path';
import {
  buildPacket,
  boundResult,
  validateHandoff,
  validateCheckpoint,
  auditCache,
} from './core.mjs';
const command = process.argv[2],
  file = process.argv[3];
if (!file) {
  console.log(
    'Usage: node run.mjs packet|handoff|checkpoint|cache INPUT.json\n       node run.mjs ' +
      'bound RESULT.txt MAX_CHARS ARTIFACT_DIR\nValidators check structure, not semantic truth ' +
      'or command execution.',
  );
  process.exit(command ? 1 : 0);
}
try {
  let result;
  if (command === 'bound') {
    const out = boundResult(fs.readFileSync(file, 'utf8'), Number(process.argv[4] || 8000)),
      dir = path.resolve(process.argv[5] || '.context-kit/artifacts');
    fs.mkdirSync(dir, { recursive: true });
    const artifact = path.join(dir, out.sha256 + '.txt');
    if (fs.existsSync(artifact) && fs.readFileSync(artifact, 'utf8') !== out.fullText)
      throw Error('Artifact conflict');
    fs.writeFileSync(artifact, out.fullText);
    result = {
      preview: out.preview,
      artifact,
      sha256: out.sha256,
      originalBytes: out.originalBytes,
      truncated: out.truncated,
    };
  } else {
    const input = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (command === 'packet') result = buildPacket(input);
    else if (command === 'handoff') result = validateHandoff(input);
    else if (command === 'checkpoint') result = validateCheckpoint(input);
    else if (command === 'cache') result = auditCache(input);
    else throw Error('Unknown command');
  }
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
