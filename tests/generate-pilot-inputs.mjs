// Explicit publication of owner-approved fixture inputs; never a generic raw-trace exporter.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const [pilotRoot,releaseRoot,destination]=process.argv.slice(2);
if(![pilotRoot,releaseRoot,destination].every(v=>v&&path.isAbsolute(v)))throw Error('Pass absolute pilot, frozen installed release and output paths');
const hash=s=>createHash('sha256').update(s).digest('hex');
const pilot=JSON.parse(await readFile(path.join(pilotRoot,'pilot.json'),'utf8'));
const report=JSON.parse(await readFile(path.join(pilotRoot,'public.json'),'utf8'));
const refs=['.opencode/skills/delegation-orchestrator/SKILL.md','.opencode/skills/delegation-orchestrator/references/development-workflow.md','.opencode/skills/delegation-orchestrator/references/task-contract-examples.md'];
const protocols=await Promise.all(refs.map(async name=>{const text=await readFile(path.join(releaseRoot,name),'utf8');const displayed=text.replaceAll(releaseRoot,'[RUNTIME_ROOT]');return {name,sha256:hash(text),textSha256:hash(displayed),redaction:'Installed runtime-root paths replaced with [RUNTIME_ROOT]; sha256 covers original bytes and textSha256 covers displayed text.',text:displayed};}));
const {appendDelegationContext}=await import(pathToFileURL(path.join(releaseRoot,'.opencode/plugin-modules/context-budget.js')).href);
const injected=[];appendDelegationContext(injected,{id:'parent'},'global-native');
protocols.unshift({name:'Automatic harness delegation-awareness instructions',sha256:hash(injected[0].text),textSha256:hash(injected[0].text),redaction:'No redaction. Reconstructed from the frozen installed helper; this is not a full native system-prompt capture.',text:injected[0].text});
const criteria={
 'component-feature':['API returns sorted pages and a correct final null cursor; the client follows cursors to collect all three fixture orders.','Input order is unchanged; empty pages terminate; client errors propagate; zero page size is rejected.'],
 'idempotency':['Twelve concurrent requests for one key share one order ID; later duplicate requests reuse it; the successful count is one.','A failed persistence call rejects and is retryable; distinct keys receive distinct IDs; only two successful orders are counted.']
};
await mkdir(destination,{recursive:true});
const evidence=[];
for(const run of pilot.runs){
 const canonical=JSON.parse(await readFile(path.join(run.runRoot,'private/canonical-evidence.json'),'utf8'));
 if(hash(JSON.stringify(run.prompt))!==canonical.bundle.manifest.conditions.instructions)throw Error('Actual launch prompt hash mismatch');
 if(hash(run.task.evaluator)!==run.task.evaluatorHash)throw Error('Evaluator hash mismatch');
 const parts=run.prompt.split(run.task.prompt);if(parts.length!==2)throw Error('Task does not occur exactly once');
 const record={version:1,runId:run.runId,task:run.task.id,prompt:run.prompt,promptSha256:hash(run.prompt),taskPrompt:run.task.prompt,wrapper:parts[0],commonInstructions:parts[1],
 provenance:'Exact launch prompt verified against the measured manifest; protocol files read from the immutable installed release used by this pilot. This is a retrospective publication, not a new run.',
 captureLimits:['The complete native/provider system prompt and every assembled request were not retained. Their exact text cannot be reconstructed from this pilot.','Installed protocol references were available to the parent; this does not prove that every reference was loaded on every call.','Model-generated plans, admission specifications and child prompts are not the initial user prompt and are not reproduced in this input record.'],
 settings:['Model: openai/gpt-6.1-sol, native default variant, subscription authentication.','Fresh task workspace and sessions; natural provider cache, no forced flush.','10-minute workflow bound and 100 observed-request guard; no dollar ceiling.','Installed global profile 0.1.20: per-workflow worker capacity one. No retrospective concurrency change.'],
 treatment:run.arm==='A'?'Single-session: the observer removes harness delegation-awareness injection and the subagent/harness_orchestration tools. Ordinary native instructions and tools remain.':'Orchestrated: automatic harness delegation-awareness injection and managed control/subagent tools are available; the parent is instructed to load the installed protocol and coordinate role work.',
 protocols:run.arm==='A'?[]:protocols,
 acceptance:{criteria:criteria[run.task.id],rule:'External evaluator runs the same fixed tests against each frozen artifact. Both tests must complete with no failures; self-reported success is insufficient. Checks are small screening tests, not exhaustive specification coverage.',evaluatorSha256:run.task.evaluatorHash,evaluatorSource:run.task.evaluator,status:canonical.evaluation.status,managedRule:run.arm==='A'?'Managed orchestration acceptance is not applicable.':'Managed independent-validator acceptance is an additional protocol outcome; the common external evaluator decides the reported task pass/fail.'},
 starterFiles:Object.entries(run.task.files).map(([name,text])=>({name,text}))};
 const text=JSON.stringify(record,null,2)+'\n';if(Buffer.byteLength(text)>200000)throw Error('Input record too large');if(/\/home\/|\/tmp\/|\/mnt\/c\//.test(text))throw Error('Private filesystem path requires publication review');
 const filename=run.runId+'-inputs.json';await writeFile(path.join(destination,filename),text);
 evidence.push({runId:run.runId,href:'benchmark-data/'+filename,sha256:hash(text)});
}
report.evidence=evidence;await writeFile(path.join(destination,'measured-pilot.json'),JSON.stringify(report,null,2)+'\n');
console.log('Published fixture-input records prepared:',evidence.length);
