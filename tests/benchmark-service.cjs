const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http'),os=require('node:os');
(async()=>{
 const docs=process.env.BENCHMARK_DOCS||path.join(__dirname,'../docs');
 const output=await fs.mkdtemp(path.join(os.tmpdir(),'service-browser-'));
 const server=http.createServer(async(req,res)=>{try{const name=new URL(req.url,'http://localhost').pathname.slice(1)||'benchmark.html';if(!/^(benchmark(?:-schema|-pilot|-service)?\.(html|js|css)|benchmark-data\/[\w-]+\.(json|zip))$/.test(name)){res.writeHead(404).end();return}const data=await fs.readFile(path.join(docs,name));res.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.zip':'application/zip'}[path.extname(name)]});res.end(data)}catch{res.writeHead(404).end()}});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.TEST_BROWSER||undefined});const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=process.env.BENCHMARK_URL||'http://127.0.0.1:'+server.address().port+'/benchmark.html';
  const report=JSON.parse(await fs.readFile(path.join(docs,'benchmark-data/measured-service.json'),'utf8'));
  assert.equal(report.runs.length,6);assert.equal(report.evidence.length,6);
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   await page.goto(base+'?suite=service&task=holds-invoices&left=A&right=C');
   await page.waitForFunction(()=>document.querySelectorAll('.comparison-card button').length===4);
   assert.equal(await page.locator('#task').inputValue(),'holds-invoices');assert.equal(await page.locator('#rightArm').inputValue(),'C');
   assert.match(await page.locator('#costScope').innerText(),/not subscription charges/);
   for(const run of report.runs){
    await page.locator('#task').selectOption(run.task);await page.locator('#rightArm').selectOption(run.arm);
    assert.equal(await page.locator('#serviceCaveat').isVisible(),run.task==='incident-recovery','artifact-format caveat follows the relevant task');
    const card=page.locator('.comparison-card').nth(1);
    assert.match(await card.innerText(),/gpt-6.1-sol/);
    await card.getByRole('button',{name:'Prompt, protocol and acceptance',exact:true}).click();
    await page.getByRole('heading',{name:'Shared task',exact:true}).waitFor();
    assert.ok((await page.locator('#detailBody').innerText()).includes(run.id));
    assert.equal(await page.locator('#detailBody [data-protocol]').count(),run.arm==='A'?0:4);
    assert.equal(await page.locator('#detailBody summary').filter({hasText:/^Starter file:/}).count(),50);
    await page.getByRole('heading',{name:'External gate results',exact:true}).waitFor();
    assert.ok(await page.locator('#detail').evaluate(el=>el.scrollWidth<=el.clientWidth));
    await page.screenshot({path:path.join(output,run.id+'-'+width+'-modal.png')});
    await page.getByRole('button',{name:'Close',exact:true}).click();
    assert.equal(await page.locator('#detail').evaluate(el=>el.open),false);
    assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Prompt, protocol and acceptance');
    await card.getByRole('button',{name:/Inspect calls/}).click();assert.ok((await page.locator('#detailBody').innerText()).includes(run.attempts+' model attempts'));await page.keyboard.press('Escape');
    assert.equal(await page.locator('#detail').evaluate(el=>el.open),false);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   }
   await page.locator('#task').selectOption('incident-recovery');await page.locator('#rightArm').selectOption('C');await page.screenshot({path:path.join(output,'comparison-'+width+'.png'),fullPage:true});
   await page.goto(new URL('benchmark-service.html',base).href);
   assert.equal(await page.locator('[data-run-id]').count(),6);assert.equal(await page.locator('table').count(),2);
   if(width===390){assert.equal(await page.locator('.table-hint').first().isVisible(),true);assert.ok(await page.locator('.table-wrap').first().evaluate(el=>{el.scrollLeft=el.scrollWidth;return el.scrollLeft>0}));}
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert.match(await page.locator('main').innerText(),/scorer expected strings/);
   await page.screenshot({path:path.join(output,'overview-'+width+'.png'),fullPage:true});
  }
  const zip=await page.request.get(new URL('benchmark-data/service-starters.zip',base).href);assert.equal(zip.status(),200);assert.equal((await zip.body()).subarray(0,2).toString(),'PK');
  assert.deepEqual(errors,[]);console.log('Service browser checks passed; screenshots: '+output);
 }finally{await browser?.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
