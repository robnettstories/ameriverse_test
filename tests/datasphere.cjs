const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:8001/';
const profiles = [
  {name:'desktop',width:1440,height:1000},
  {name:'iphone-375',width:375,height:812},
  {name:'iphone-390',width:390,height:844},
  {name:'ipad-portrait',width:768,height:1024},
  {name:'ipad-landscape',width:1024,height:768}
];

(async () => {
  const results = [];
  for (const [engine,type,args] of [
    ['Chromium',chromium,{executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']}],
    ['WebKit',webkit,{}]
  ]) {
    if (process.env.ONLY_ENGINE && process.env.ONLY_ENGINE !== engine) continue;
    const browser = await type.launch({...args,...(process.env.LIVE_PROXY ? {proxy:{server:process.env.HTTPS_PROXY || process.env.HTTP_PROXY}} : {})});
    try {
      for (const profile of profiles) {
        const context = await browser.newContext({viewport:{width:profile.width,height:profile.height},isMobile:profile.width<1100,hasTouch:profile.width<1100,reducedMotion:'reduce'});
        const page = await context.newPage(), errors = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('response', response => {if (response.status()>=400) errors.push(`${response.status()} ${response.url()}`);});
        await page.goto(base+'#executive');
        await page.locator('[data-portal="datasphere"]').click();
        await page.waitForURL('**/#datasphere');
        assert.equal(await page.locator('[data-portal="datasphere"]').getAttribute('aria-current'),'page');
        assert.equal(await page.locator('.sidebar nav a').count(),5);
        assert.equal(await page.locator('#portal-name').textContent(),'Datasphere');
        const frame = await (await page.locator('.datasphere-frame').elementHandle()).contentFrame();
        await frame.locator('#search').waitFor();
        assert.equal(await frame.locator('.hub-back').isVisible(),false);

        await frame.locator('#search').fill('Cash Collection');
        assert.equal(await frame.locator('#nodeName').textContent(),'Cash Collection');
        assert.ok(Number(await frame.locator('#nodeCount').textContent())>0);
        await frame.locator('#close').click();
        await frame.locator('#department').selectOption('Finance');
        assert.equal(await frame.evaluate(()=>filter),'Finance');
        await frame.locator('#resetBtn').click();
        assert.equal(await frame.locator('#search').inputValue(),'');
        assert.equal(await frame.locator('#department').inputValue(),'all');

        // Select a visible graph node with a real pointer, then rotate and zoom.
        const node = await frame.evaluate(() => {
          for (const n of nodes) {
            const point=projected(n);
            if (point.y>h*.47 && point.y<h-95 && document.elementFromPoint(point.x,point.y)===canvas) {
              const id=hit(point.x,point.y);
              if (id!==undefined) return {x:point.x,y:point.y,name:nodes[id].name};
            }
          }
        });
        assert.ok(node,'A visible graph node is available');
        await frame.locator('#space').click({position:{x:node.x,y:node.y}});
        assert.equal(await frame.locator('#nodeName').textContent(),node.name);
        await frame.locator('#close').click();
        const rotation=await frame.evaluate(()=>rotY);
        const canvas=await frame.locator('#space').boundingBox();
        await page.mouse.move(canvas.x+canvas.width*.5,canvas.y+canvas.height*.52);
        await page.mouse.down();
        await page.mouse.move(canvas.x+canvas.width*.5+45,canvas.y+canvas.height*.52+15,{steps:5});
        await page.mouse.up();
        assert.ok(Math.abs(await frame.evaluate(()=>rotY)-rotation)>.1);
        const zoom=await frame.evaluate(()=>zoom);
        if (profile.width<1100) {
          // Exercise the graph's pinch handlers; headless emulation is not physical iOS.
          await frame.evaluate(()=>{
            for(const [type,left,right] of [['touchstart',80,180],['touchmove',60,200]]) {
              const event=new Event(type,{bubbles:true});
              Object.defineProperty(event,'touches',{value:[{clientX:left,clientY:200},{clientX:right,clientY:200}]});
              canvas.dispatchEvent(event);
            }
          });
        } else await page.mouse.wheel(0,150);
        await frame.waitForFunction(previous=>zoom!==previous,zoom);

        await frame.locator('#storyBtn').click();
        assert.equal(await frame.locator('#storyTitle').textContent(),'Field Observation');
        assert.ok(await frame.locator('#prev').isDisabled());
        for(let i=1;i<13;i++) await frame.locator('#next').click();
        assert.equal(await frame.locator('#storyTitle').textContent(),'Executive Dashboard');
        await frame.locator('#next').click();
        assert.equal(await frame.locator('#storyTitle').textContent(),'Field Observation');
        await frame.locator('#exit').click();
        assert.ok(await frame.locator('#story').isHidden());
        await frame.locator('#resetBtn').click();

        const layout=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
        assert.ok(layout.scroll<=profile.width,JSON.stringify(layout));
        const navTargets=await page.locator('.sidebar nav a').evaluateAll(links=>links.map(a=>({width:a.getBoundingClientRect().width,height:a.getBoundingClientRect().height})));
        assert.ok(navTargets.every(target=>target.width>=44 && target.height>=44));
        assert.ok(await frame.locator('button,input,select').evaluateAll(controls=>controls.filter(el=>el.getClientRects().length).every(el=>el.getBoundingClientRect().height>=44)));

        if(profile.name==='desktop') {
          const popupPromise=context.waitForEvent('page');
          await page.locator('.datasphere-open[href="connected-enterprise.html"]').click();
          const popup=await popupPromise;
          await popup.locator('.hub-back').waitFor();
          await popup.locator('.hub-back').click();
          await popup.locator('.datasphere-frame').waitFor();
          await popup.close();
        }
        if(engine==='Chromium' && !process.env.LIVE_PROXY) {
          await page.evaluate(()=>navigator.serviceWorker.ready);
          await page.waitForFunction(()=>navigator.serviceWorker.controller);
          await context.setOffline(true);
          await page.reload();
          const offline=page.frameLocator('.datasphere-frame');
          await offline.locator('#search').fill('Cash Collection');
          assert.equal(await offline.locator('#nodeName').textContent(),'Cash Collection');
          await context.setOffline(false);
        }
        await page.locator('[data-portal="executive"]').click();
        await page.locator('h1').filter({hasText:'Clarity across every job.'}).waitFor();
        assert.equal(await page.locator('.datasphere-frame').count(),0);
        assert.deepEqual(errors,[]);
        results.push({engine,profile:profile.name,status:'passed',layout});
        console.log('PASS',engine,profile.name,'datasphere navigation, graph controls, walkthrough and layout');
        await context.close();
      }
    } finally {await browser.close();}
  }
  fs.mkdirSync('test-results',{recursive:true});
  fs.writeFileSync('test-results/datasphere-results.json',JSON.stringify({base,checks:results},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
