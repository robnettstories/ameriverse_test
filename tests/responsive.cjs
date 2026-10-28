const fs=require('node:fs');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.BASE_URL||'http://127.0.0.1:8001/';
(async()=>{const result=[];for(const [name,type,args] of [['Chromium',chromium,{executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']}],['WebKit',webkit,{}]]){
 const browser=await type.launch(args);
 try{for(const width of [375,390,768,1024,1440]){
  const context=await browser.newContext({viewport:{width,height:900},isMobile:width<1100,hasTouch:width<1100}),page=await context.newPage();
  for(const route of ['executive','executive/cash','executive/actions','jobsite/health','jobsite/people','jobsite/assets','jobsite/vendors','resources','insights','datasphere']){
   await page.goto(base+'#'+route);await page.locator('h1').waitFor();
   const layout=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,short:[...document.querySelectorAll('#main button,#main select,#main input,#main summary')].filter(el=>el.getClientRects().length).map(el=>({text:el.textContent.slice(0,35),w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})).filter(el=>el.w<43.9||el.h<43.9)}));
   if(layout.width<layout.scroll||layout.short.length)throw Error(JSON.stringify({engine:name,width,route,layout}));result.push({engine:name,width,route,status:'passed'});
  }
  await context.close();
 }}finally{await browser.close();}
}fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/responsive-results.json',JSON.stringify(result,null,2));console.log(result.length+' final responsive and 44px-control checks passed.');})().catch(e=>{console.error(e);process.exitCode=1});
