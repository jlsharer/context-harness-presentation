const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const {chromium} = require('playwright');
const os = require('node:os');
const root = process.argv[2] || path.resolve(__dirname, '../docs');
let output;
const cases=[
 ['Retrieve','Which API rule applies to this failure?','idempotency key','MCP','same order'],
 ['Prune','What does the next call need from the log?','One assertion failed','full log','retention policy'],
 ['Compact','How does the agent resume after compaction?','failing test ID','SessionStart','rerun it'],
 ['Cache','How can repeated reviews reuse their setup?','tool definitions','changing diff last','cache-read tokens'],
 ['Checkpoint','What should survive an interrupted run?','Integration tests','commit SHA','Rerun stale tests'],
 ['Isolate','How can a reviewer inspect a change safely?','security review','read-only permissions','validates the findings']
];
(async()=>{
 output = await fs.mkdtemp(path.join(os.tmpdir(), 'context-presentation-'));
 const server=http.createServer(async(req,res)=>{
   try{const prefix='/context-harness/',url=new URL(req.url,'http://localhost');
   if(!url.pathname.startsWith(prefix)){res.writeHead(404).end();return}
   const p=url.pathname.slice(prefix.length)||'index.html';
   if(!/^(?:index\.html|slides\.js|diagrams\.js|example\.js|presentation\.(?:js|css)|slides\/slide-\d\d\.png)$/.test(p)){res.writeHead(404).end();return}
   const body=await fs.readFile(path.join(root,p));
   res.writeHead(200,{'Content-Type':{'.css':'text/css','.html':'text/html','.js':'text/javascript','.png':'image/png'}[path.extname(p)]});res.end(body);
   }catch{res.writeHead(404).end()}
 });
 await new Promise((res,rej)=>{server.once('error',rej);server.listen(0,'127.0.0.1',res)});
 let browser;
 try{
 browser=await chromium.launch({executablePath:process.env.TEST_BROWSER||undefined});
 console.log('Browser:',browser.version());
 const page=await browser.newPage({viewport:{width:1366,height:768}});
 const errors=[];page.on('pageerror',err=>errors.push(err.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url())});
 const base=process.env.PRESENTATION_URL || 'http://127.0.0.1:'+server.address().port+'/context-harness/';
 await page.goto(base);
 assert.equal(await page.locator('#jump option').count(),12);
 const ledger=await page.evaluate(()=>({calls:example.calls.length,tools:example.calls.reduce((n,c)=>n+c.executions,0),input:singleInputK,output:singleOutputK,workerInput:workerInputK,workerOutput:workerOutputK,workerCalls,cachedMilli:Math.round(cacheLedger.reduce((n,r)=>n+r.cost,0)*1000)}));
 assert.deepEqual(ledger,{calls:6,tools:8,input:2550,output:12,workerInput:1660,workerOutput:20,workerCalls:10,cachedMilli:4860});
 await page.goto(base+'#slide-15');await page.waitForURL('**/#slide-8');

 for(let i=1;i<=12;i++){await page.locator('#jump').selectOption(String(i));await page.waitForFunction(n=>document.querySelector('#jump').value===String(n)&&document.querySelector('#status').textContent.startsWith('Slide '+n+' of'),i);if(await page.locator('#figure').isVisible()) await page.locator('#figure').evaluate(el=>el.decode());
 await page.screenshot({path:path.join(output,'slide-'+i+'.png')});
 const box=await page.locator('.stage').evaluate(el=>({h:el.clientHeight,sh:el.scrollHeight,w:el.clientWidth,sw:el.scrollWidth}));assert.ok(box.sh<=box.h+2 && box.sw<=box.w+2,'Slide '+i+' overflow '+JSON.stringify(box));}
 for(const [width,height] of [[1366,768],[390,844]]){
  await page.setViewportSize({width,height});
 for(const n of [2,3]) {
  await page.goto(base+'#slide-'+n);
  const eventButton=page.getByRole('button',{name:'Explore the 16 events',exact:true});
  assert.equal(await eventButton.count(),1,'Slide '+n+' must expose the event breakdown');
  await eventButton.click();
  const modal=page.getByRole('dialog',{name:'Inside one pass through the loop',exact:true});
  await modal.waitFor();
  const requestTab=modal.getByRole('tab',{name:'Request contents',exact:true});
  assert.equal(await requestTab.count(),1,'Event modal needs request and delegation visuals');
  assert.equal(await requestTab.getAttribute('aria-selected'),'true');
  assert.ok(await modal.getByRole('tabpanel',{name:'Request contents',exact:true}).isVisible());
  await modal.getByRole('tab',{name:'Worker delegation',exact:true}).click();
  assert.ok(await modal.getByRole('tabpanel',{name:'Worker delegation',exact:true}).isVisible());
  assert.equal(await modal.getByRole('tabpanel',{name:'Request contents',exact:true}).isVisible(),false);
  await page.screenshot({path:path.join(output,'delegation-modal-'+width+'-'+n+'.png')});
  await modal.locator('#delegationPanel .request-caveat').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(output,'delegation-bottom-'+width+'-'+n+'.png')});
  assert.ok(await modal.evaluate(e=>e.scrollWidth<=e.clientWidth+2));
  await modal.getByRole('tab',{name:'Worker delegation',exact:true}).focus();
  await page.keyboard.press('ArrowRight');
  assert.ok(await modal.getByRole('tabpanel',{name:'16 events',exact:true}).isVisible());
  await page.keyboard.press('Home');
  assert.equal(await requestTab.getAttribute('aria-selected'),'true');
  await page.screenshot({path:path.join(output,'request-modal-'+width+'-'+n+'.png')});
  await modal.locator('#requestPanel .request-caveat').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(output,'request-bottom-'+width+'-'+n+'.png')});
  assert.ok(await modal.evaluate(e=>e.scrollWidth<=e.clientWidth+2));
  await modal.getByRole('tab',{name:'16 events',exact:true}).click();
  await page.screenshot({path:path.join(output,'event-modal-'+width+'-'+n+'.png')});
  assert.equal(await modal.locator('dt').count(),16);
  await modal.locator('dt').last().scrollIntoViewIfNeeded();
  assert.ok(await page.getByRole('button',{name:'Close ×'}).isVisible());
  const bounds=await modal.evaluate(e=>({w:e.clientWidth,sw:e.scrollWidth}));assert.ok(bounds.sw<=bounds.w+2);
  await page.keyboard.press('ArrowRight'); assert.equal(await page.locator('#jump').inputValue(),String(n));
  await page.getByRole('button',{name:'Close ×'}).click();
  assert.ok(await eventButton.evaluate(b=>b===document.activeElement));
  assert.ok(page.url().endsWith('#slide-'+n));
  await eventButton.press('Enter');await modal.waitFor();assert.equal(await requestTab.getAttribute('aria-selected'),'true');await page.keyboard.press('Escape');
  await modal.waitFor({state:'hidden'});
  await page.locator('#next').click();await page.waitForURL('**/#slide-'+(n+1));
  console.log(width,'event details on',n,'→ Close + focus → Next',n+1);
 }

  if(width===390){for(let i=1;i<=12;i++){await page.locator('#jump').selectOption(String(i));await page.waitForFunction(n=>document.querySelector('#jump').value===String(n),i);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile overflow '+i);}}
  if(width===390)for(const n of [2,3,7]) {await page.goto(base+'#slide-'+n);await page.screenshot({path:path.join(output,'mobile-slide-'+n+'.png'),fullPage:true});}
  await page.goto(base+'#slide-8');
  for(const [name,title,...keywords] of cases){
   const button=page.getByRole('button',{name,exact:true});
   await button.click();
   const d=page.getByRole('dialog',{name:title,exact:true});
   await d.waitFor(); assert.equal(await d.locator('#controlName').textContent(),'LIFECYCLE CONTROL  /  '+name.toUpperCase());
   assert.equal(await d.getByRole('tablist').count(),0);
   const parts=await d.locator('dd').allTextContents();assert.equal(parts.length,3);
   keywords.forEach((word,j)=>assert.ok(parts[j].includes(word),word));
   await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#jump').inputValue(),'8');
   if(name==='Compact'&&width===1366)await page.screenshot({path:path.join(output,'compact-modal.png')});
   await page.getByRole('button',{name:'Close ×'}).click();
   assert.equal(await page.locator('dialog[open]').count(),0);assert.ok(page.url().endsWith('#slide-8'));
   assert.ok(await button.evaluate(b=>document.activeElement===b));
   if(name==='Retrieve'&&width===1366)await page.screenshot({path:path.join(output,'lifecycle.png')});
   await page.locator('#next').click();await page.waitForURL('**/#slide-9');
   assert.ok((await page.title()).startsWith('How the harness assembles a model request'));assert.ok(await page.locator('#diagram').isVisible());
   await page.locator('#previous').click();await page.waitForURL('**/#slide-8');
   console.log(width,name,'→ correct example → Close 8 + focus → Next 9');
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await page.getByRole('button',{name:'Retrieve',exact:true}).focus();await page.keyboard.press('Enter');
 await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
 assert.equal(await page.locator('#jump').inputValue(),'8');assert.deepEqual(errors,[]);
 console.log('12 slides loaded; both viewports passed; keyboard and runtime checks passed. Screenshots:',output);
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
