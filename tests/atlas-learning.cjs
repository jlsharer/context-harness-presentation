const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const file=path.resolve(__dirname,'../docs/atlas-learning.js');assert.ok(fs.existsSync(file),'BFS and causal-access learning model required');const c=vm.createContext({});vm.runInContext(fs.readFileSync(file,'utf8'),c);const run=x=>vm.runInContext(x,c);
assert.deepEqual(Array.from(run('AtlasLearning.hop(0)')),['api']);assert.deepEqual(Array.from(run('AtlasLearning.hop(1)')),['service']);assert.deepEqual(Array.from(run('AtlasLearning.hop(2)')),['journal','delivery']);
assert.equal(run("AtlasLearning.score(['journal','delivery','journal']).f1"),100);assert.equal(run('AtlasLearning.score([]).f1'),0);assert.ok(Math.abs(run("AtlasLearning.score(['journal']).f1")-200/3)<1e-9);assert.equal(run("AtlasLearning.score(['journal','delivery','ui']).f1"),80);assert.ok(run("AtlasLearning.score(['journal','delivery','api','service']).f1")<100);
for(let q=0;q<8;q++)assert.deepEqual(Array.from(run('AtlasLearning.allowed('+q+')')),Array.from({length:q+1},(_,i)=>i));
console.log('PASS exactly-two-hop exercise, unique/empty/missing/extra-node F1, causal diagonal and future exclusion');
