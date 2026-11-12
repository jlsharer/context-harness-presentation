const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const p=require('node:path').resolve(__dirname,'../docs');
assert.ok(fs.existsSync(p+'/research/round06/token-counts.json'),'offline reference token manifest is required');
const d=JSON.parse(fs.readFileSync(p+'/research/round06/token-counts.json'));
assert.equal(d.encoding,'o200k_base');assert.equal(d.tokenizerVersion,'0.12.0');assert.equal(d.nativeUsage,false);
const ctx=vm.createContext({TextEncoder});for(const f of ['atlas-evidence.js','atlas-session.js'])vm.runInContext(fs.readFileSync(p+'/'+f,'utf8'),ctx);
let seen=0;for(const policy of ['incident','all'])for(let step=0;step<14;step++){
const model=vm.runInContext(`AtlasSession.at(${step},'${policy}')`,ctx),r=d.requests[policy+':'+step];
assert.equal(r.sha256,crypto.createHash('sha256').update(model.text).digest('hex'));
assert.equal(r.layers.reduce((n,l)=>n+l.tokens,0),r.tokens);assert.ok(r.tokens>0);
assert.deepEqual(r.layers.map(l=>l.id),Array.from(model.blocks,b=>b.id));seen++;
}
assert.equal(seen,28);assert.equal(Object.keys(d.candidates).length,6);assert.equal(Object.keys(d.summaries).length,2);
assert.equal(d.scale,Math.max(...Object.values(d.requests).map(r=>r.tokens)));
console.log('PASS exact replay hashes, ordered token allocation, 28 snapshots / 2 summaries / 6 candidates');
