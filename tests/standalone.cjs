const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const file=path.resolve(__dirname,'../downloads/AmeriVerse-Datasphere-Standalone.html');
const results=[];
(async()=>{
 for(const [engine,type,args] of [['Chromium',chromium,{executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']}],['WebKit',webkit,{}]]){
  const browser=await type.launch(args);
  try{for(const [profile,width,height] of [['desktop',1440,1000],['iphone-375',375,812],['iphone-390',390,844],['ipad-portrait',768,1024],['ipad-landscape',1024,768]]){
   const context=await browser.newContext({viewport:{width,height},isMobile:width<1100,hasTouch:width<1100,reducedMotion:'reduce',serviceWorkers:'block'});
   await context.setOffline(true);
   const page=await context.newPage(),errors=[],network=[];
   page.on('pageerror',error=>errors.push(error.message));
   page.on('request',request=>{if(!/^(file:|data:)/.test(request.url()))network.push(request.url());});
   // Render the exported bytes with networking disabled. Managed Chromium blocks
   // file:// navigation, and WebKit's inspector offline flag blocks navigation.
   const loading='Exact exported HTML rendered with networking disabled';
   await page.setContent(fs.readFileSync(file,'utf8'));
   await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('.hub-back').count(),0);
   assert.ok(await page.locator('.logo-card img').evaluate(image=>image.complete&&image.naturalWidth>0&&image.src.startsWith('data:image/svg+xml;base64,')));
   assert.ok(await page.evaluate(()=>document.fonts.check('400 16px "Source Sans 3"')&&document.fonts.check('700 23px "Barlow Condensed"')));
   await page.locator('#search').fill('Cash Collection');
   assert.equal(await page.locator('#nodeName').textContent(),'Cash Collection');
   assert.ok(Number(await page.locator('#nodeCount').textContent())>0);
   await page.locator('#close').click();
   await page.locator('#department').selectOption('Finance');
   assert.equal(await page.evaluate(()=>filter),'Finance');
   await page.locator('#resetBtn').click();
   assert.equal(await page.locator('#search').inputValue(),'');
   assert.equal(await page.locator('#department').inputValue(),'all');
   await page.locator('#storyBtn').click();
   assert.equal(await page.locator('#storyTitle').textContent(),'Field Observation');
   for(let i=1;i<13;i++)await page.locator('#next').click();
   assert.equal(await page.locator('#storyTitle').textContent(),'Executive Dashboard');
   await page.locator('#exit').click();
   assert.ok(await page.locator('#story').isHidden());
   const layout=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
   assert.ok(layout.scroll<=width,JSON.stringify(layout));
   assert.deepEqual(network,[],'Standalone file must not request any external resources');
   assert.deepEqual(errors,[]);
   results.push({engine,profile,status:'passed',loading,layout,externalRequests:network.length});
   console.log('PASS',engine,profile,'standalone with network disabled:',loading);
   await context.close();
  }}finally{await browser.close();}
 }
 fs.mkdirSync('test-results',{recursive:true});
 fs.writeFileSync('test-results/standalone-results.json',JSON.stringify({file,checks:results},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
