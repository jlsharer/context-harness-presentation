const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../docs');assert.ok(fs.existsSync(root+'/atlas-workload.js'),'Unified workload model is required');
const c=vm.createContext({TextEncoder});for(const f of ['atlas-evidence.js','atlas-session.js','atlas-workload.js'])vm.runInContext(fs.readFileSync(root+'/'+f,'utf8'),c);
const run=x=>vm.runInContext(x,c),data=JSON.parse(fs.readFileSync(root+'/research/round07/workloads.json'));
assert.deepEqual(JSON.parse(run('JSON.stringify(AtlasWorkload.data)')),data,'Browser budget bundle matches durable assumptions');assert.equal(data.evidence,'modeled-token-budgets');assert.equal(data.measuredSavings,false);
const measured=JSON.parse(fs.readFileSync(root+'/benchmark-data/measured-service.json'));
assert.deepEqual(data.observedRuns.map(r=>r.peakInput),measured.runs.map(r=>r.peakInput));assert.equal(data.measuredSourceSha256,crypto.createHash('sha256').update(fs.readFileSync(root+'/benchmark-data/measured-service.json')).digest('hex'));
for(const preset of ['service','platform','org'])for(let step=0;step<14;step++){
 const a=run(`AtlasWorkload.at(${step},'uncurated','${preset}')`),b=run(`AtlasWorkload.at(${step},'managed','${preset}')`);
 for(const s of [a,b]){assert.equal(s.total,s.layers.reduce((n,l)=>n+l.tokens,0));assert.ok(s.layers.every(l=>Number.isSafeInteger(l.tokens)&&l.tokens>=0));assert.equal(s.measured,false);const d=run(`AtlasWorkload.diff(${step},'${s.path}','${preset}')`);assert.equal(d.net,s.total-(d.before?.total||0));assert.ok(!d.before||d.before.session===s.session);assert.equal(d.rows.filter(r=>r.current>0).reduce((n,r)=>n+r.current,0),s.total);}
 for(const id of ['base','tools','guidance'])assert.equal(a.layers.find(l=>l.id===id)?.tokens,b.layers.find(l=>l.id===id)?.tokens,'Required contracts remain equal');
 if(step===6){assert.equal(run(`AtlasWorkload.diff(6,'managed','${preset}')`).before,null);assert.ok(!b.layers.some(l=>l.id==='history'));}
 if(step===11){assert.ok(a.layers.some(l=>l.id==='checkpoint'));assert.ok(b.layers.some(l=>l.id==='checkpoint'));assert.ok(!a.layers.some(l=>l.id==='evidence'||l.id==='history'));}
}
assert.equal(run("AtlasWorkload.at(0,'managed','platform').layers.find(l=>l.id==='skills').tokens"),700,'Only skill catalog is present before task admission');
assert.equal(run("AtlasWorkload.at(1,'managed','platform').total"),run("AtlasWorkload.at(2,'managed','platform').total"));
assert.ok(run("AtlasWorkload.at(3,'managed','platform').total")>run("AtlasWorkload.at(2,'managed','platform').total"));
assert.equal(run("AtlasWorkload.summary(10,'managed','platform').outputTokens"),null);
assert.ok(run("AtlasWorkload.summary(11,'managed','platform').inputTokens")>run("AtlasWorkload.at(10,'managed','platform').total"));
assert.equal(run("AtlasWorkload.summary(11,'managed','platform').outputTokens"),2000);
assert.equal(run("AtlasWorkload.at('bad','bad','bad').step"),0);
console.log('PASS workload budgets, provenance, mandatory equality, same-session changes, separate child/S1, causal boundaries and shared compaction');
