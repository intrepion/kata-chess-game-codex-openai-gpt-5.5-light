'use strict';
const {chromium}=require('playwright');const {mkdir,readFile,writeFile}=require('node:fs/promises');const {createHash}=require('node:crypto');const path=require('node:path');
(async()=>{const output=process.env.CAPTURE_OUTPUT||'/tmp/chess-captures',site=process.env.CAPTURE_SITE||'capture-site';await mkdir(output,{recursive:true});const inputs={};for(const f of ['index.html','styles.css','game.js','chess-rules.js','vendor/chess-vendor.js'])inputs[f]=createHash('sha256').update(await readFile(path.join(site,f))).digest('hex');const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:1000},deviceScaleFactor:1,locale:'en-US',reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4179/',{waitUntil:'domcontentloaded'});
 async function move(from,to){await page.locator(`[data-square="${from}"]`).click();await page.locator(`[data-square="${to}"]`).click();}
 await move('e2','e4');await move('e7','e5');await page.locator('main.shell').screenshot({path:path.join(output,'chess-01.png'),animations:'disabled'});
 await move('g1','f3');await move('b8','c6');await move('f1','c4');await move('g8','f6');await page.locator('main.shell').screenshot({path:path.join(output,'chess-02.png'),animations:'disabled'});
 await writeFile(path.join(output,'capture.json'),JSON.stringify({schemaVersion:1,workflowCommit:process.env.GITHUB_SHA||null,sourceCommit:process.env.GAME_SOURCE_COMMIT||null,runId:process.env.GITHUB_RUN_ID||null,url:'http://127.0.0.1:4179/',inputs,browser:browser.version(),viewport:{width:1280,height:1000},screenshots:['chess-01.png','chess-02.png']},null,2)+'\n');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
