// Development fixture generator. No model calls; all events and acceptance are synthetic.
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const harness=path.resolve(process.argv[2]||'../opencode-harness');
const {materializeEvidence,buildReport}=await import(pathToFileURL(path.join(harness,'.opencode/benchmark/report.js')));
const {exportPublicReport}=await import(pathToFileURL(path.join(harness,'.opencode/benchmark/export.js')));
const base=JSON.parse(await readFile(path.join(harness,'.opencode/evaluation/portable/example/manifest.json'),'utf8'));
const baseCoverage=JSON.parse(await readFile(path.join(harness,'.opencode/evaluation/portable/example/coverage.json'),'utf8'));
const example=vm.runInNewContext((await readFile(new URL('../docs/example.js',import.meta.url),'utf8'))+'\nexample');
const runs=[];
for(const arm of ['A','B']){
 const m={...base,runId:'demo-'+arm,taskId:'duplicate-orders',arm,harness:{name:'Example harness',version:'synthetic-v1',adapter:'illustration',adapterVersion:'1'},models:[{role:'primary',provider:'illustrative',model:'Same illustrative model',variant:'fixed'}]};
 const coverage={...baseCoverage,runId:m.runId};const events=[];let seq=0,clock=0;
 const emit=(kind,spanId,sessionId,parentSessionId,extras={})=>events.push({version:1,eventId:'e-'+(++seq),runId:m.runId,source:'synthetic',sequence:seq,occurredAt:new Date(Date.UTC(2026,10,5)+clock).toISOString(),observedAt:new Date(Date.UTC(2026,10,5)+clock).toISOString(),clock:'simulated',monotonicMs:clock,kind,spanId,sessionId,parentSessionId,role:parentSessionId?'worker':'primary',...extras});
 const call=(sid,i,input)=>{const parent=sid==='root'?null:'root',id=sid+'-'+i,meta={generationId:id,operation:'primary',model:{provider:'illustrative',model:'Same illustrative model',variant:'fixed'}};emit('inference.start',id,sid,parent,meta);clock+=5000;emit('inference.end',id,sid,parent,{...meta,status:'completed',nativeId:null,usage:{scope:'attempt',revision:1,input:input*1000,output:2000,reasoning:0,cacheRead:i?40000:0,cacheWrite:i?0:40000,inputBasis:'total',outputIncludesReasoning:true,reportedUsd:null,source:'harness'}});};
 const tool=(sid,id)=>{const parent=sid==='root'?null:'root';emit('tool.start',id,sid,parent,{tool:'fixture-tool'});clock+=2000;emit('tool.end',id,sid,parent,{tool:'fixture-tool',status:'completed'});};
 emit('workflow.start','workflow','root',null);
 if(arm==='A')example.calls.forEach((c,i)=>{call('root',i,c.inputK);for(let j=0;j<c.executions;j++)tool('root','tool-'+i+'-'+j)});
 else {call('root',0,50);for(const session of example.sessions.slice(1)){const sid=session.name.toLowerCase();emit('tool.start','delegate-'+sid,'root',null,{tool:'delegate'});emit('delegation.start','worker-'+sid,sid,'root');session.inputsK.forEach((input,i)=>{call(sid,i,input);if(i<session.inputsK.length-1){for(let j=0;j<(sid==='research'?3:1);j++)tool(sid,'tool-'+sid+'-'+i+'-'+j)}});emit('delegation.end','worker-'+sid,sid,'root',{status:'completed'});emit('tool.end','delegate-'+sid,'root',null,{tool:'delegate',status:'completed'});}call('root',1,60);}
 clock+=5000;emit('workflow.end','workflow','root',null,{status:'completed'});
 const pricing={version:1,asOf:'2026-11-05',sources:['https://example.com/hypothetical-rates'],entries:[{provider:'illustrative',model:'Same illustrative model',variant:'fixed',serviceTier:'standard',tiers:[{aboveInputTokens:0,input:example.rates.input,cacheRead:example.rates.read,cacheWrite:example.rates.write,output:example.rates.output}]}]};
 runs.push(materializeEvidence({bundle:{manifest:m,coverage,events},pricing,evaluation:{accepted:true,evaluatorHash:m.conditions.evaluator,artifactHash:'9'.repeat(64),status:'accepted',externalMs:3000}}));
}
const report=exportPublicReport(buildReport(runs),[]);
assert.deepEqual(report.runs.map(r=>[r.attempts,r.cumulativeInput,r.estimatedModelUsd]),[[6,2550000,4.86],[10,1660000,3.144]]);assert.equal(report.runs[0].tools,8);
await writeFile(new URL('../docs/benchmark-data/demo.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log('Generated synthetic demonstration; no empirical claims.');
