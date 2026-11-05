const {chromium}=require('playwright');const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http');
(async()=>{
 const docs=process.env.BENCHMARK_DOCS||path.join(__dirname,'../docs');
 const server=http.createServer(async(req,res)=>{try{let name=new URL(req.url,'http://localhost').pathname.slice(1);if(name==='benchmark-data/measured-service.json')name='benchmark-data/measured-pilot.json';if(!/^(benchmark(?:-schema)?\.(html|js|css)|benchmark-data\/[\w-]+\.json)$/.test(name)){res.writeHead(404).end();return}res.setHeader('Content-Type',{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'}[path.extname(name)]);res.end(await fs.readFile(path.join(docs,name)))}catch{res.writeHead(404).end()}});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.TEST_BROWSER||undefined});const page=await browser.newPage();
  await page.goto('http://127.0.0.1:'+server.address().port+'/benchmark.html?suite=service&task=idempotency&left=B&right=C');
  await page.waitForFunction(()=>document.querySelectorAll('.comparison-card button').length===4);
  assert.equal(await page.locator('#task').inputValue(),'idempotency','requested task survives initial rendering');
  assert.equal(await page.locator('#leftArm').inputValue(),'B');assert.equal(await page.locator('#rightArm').inputValue(),'C');
  assert.equal(new URL(page.url()).searchParams.get('suite'),'service','share URL retains dataset');
  await page.reload();await page.waitForFunction(()=>document.querySelectorAll('.comparison-card button').length===4);
  assert.equal(await page.locator('#task').inputValue(),'idempotency');
  await page.getByRole('button',{name:'Load measured pilot',exact:true}).click();
  await page.waitForFunction(()=>new URL(location.href).searchParams.get('suite')==='pilot');
  await page.reload();await page.waitForFunction(()=>document.querySelectorAll('.comparison-card button').length===4);
  await page.getByRole('button',{name:'Load synthetic demonstration',exact:true}).click();
  await page.waitForFunction(()=>new URL(location.href).searchParams.get('suite')==='demo');await page.reload();
  await page.getByText('Synthetic demonstration — not measured results.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Load measured pilot',exact:true}).click();
  await page.getByText('Imported evidence — verify the producer and conditions.',{exact:true}).waitFor();
  let release,seen;const blocked=new Promise(resolve=>release=resolve),started=new Promise(resolve=>seen=resolve);
  await page.route('**/benchmark-data/measured-service.json',async route=>{seen();await blocked;await route.continue()});
  await page.getByRole('button',{name:'Load service benchmarks',exact:true}).click();await started;
  await page.getByRole('button',{name:'Load synthetic demonstration',exact:true}).click();
  await page.getByText('Synthetic demonstration — not measured results.',{exact:true}).waitFor();
  release();await page.waitForLoadState('networkidle');
  assert.equal(new URL(page.url()).searchParams.get('suite'),'demo','a stale dataset response cannot replace the latest selection');
  console.log('Hosted dataset links preserve task, arms, reload state and latest selection');
 }finally{await browser?.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
