/* Chromium smoke: valida canvas, eventos, botões e captura evidências.
 * Executar no GitHub Actions (Playwright precisa estar instalado):
 * python3 -m http.server 4173 & node tests/browser-smoke.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const BASE=process.env.TEST_BASE_URL||'http://127.0.0.1:4173';
const OUT=path.join(__dirname,'..','artifacts','browser');
const modes=['attack','heal','guard','finisher','enemy','skills'];
(async()=>{
 fs.mkdirSync(OUT,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1100,height:850},deviceScaleFactor:1});
 const uncaught=[];
 page.on('pageerror',e=>uncaught.push(e.message));
 try{
  await page.goto(BASE+'/tactical-lab.html',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>{
   const c=document.querySelector('#game canvas'),t=document.querySelector('#info')?.textContent||'';
   return !!window.Phaser&&!!c&&c.width>0&&t.includes('Turno');
  },null,{timeout:45000});
  const canvas=page.locator('#game canvas');
  const bounds=await canvas.boundingBox();
  assert.ok(bounds?.width>100&&bounds?.height>100,'canvas should be visible');
  const coordinate=(x,y)=>({x:x*bounds.width/420,y:y*bounds.height/460});
  for(const mode of modes){
   await page.selectOption('#demoType',mode);
   const baseline=await canvas.screenshot();
   await page.click('#demo');
   await page.waitForTimeout(570);
   assert.equal(await page.locator('#demo').isDisabled(),true,'popup should lock buttons: '+mode);
   const visual=await canvas.screenshot({path:path.join(OUT,mode+'.png')});
   assert.ok(!visual.equals(baseline),'cinematic canvas did not change: '+mode);
   await canvas.click({position:coordinate(mode==='skills'?91:335,390),timeout:10000});
   await page.waitForFunction(()=>!document.querySelector('#demo').disabled,null,{timeout:10000});
   assert.match(await page.locator('#info').textContent(),/Turno/);
   console.log('PASS browser cinematic '+mode);
  }
  assert.deepEqual(uncaught,[],'no uncaught page errors');
  await page.goto(BASE+'/index.html',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#stage',{timeout:10000});
  assert.ok(await page.locator('#stage').isVisible(),'campaign entry should render');
  console.log('PASS browser campaign entry');
 }catch(error){
  await page.screenshot({path:path.join(OUT,'failure.png'),fullPage:true}).catch(()=>{});
  throw error;
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});
