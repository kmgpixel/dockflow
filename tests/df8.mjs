import puppeteer from 'puppeteer-core'; import fs from 'fs'
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new'})
const p=await b.newPage(); const errs=[]
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); p.on('pageerror',e=>errs.push('PAGE '+e.message))
await p.setViewport({width:402,height:874,deviceScaleFactor:2,isMobile:true,hasTouch:true})
const R=[]; const ok=(n,v,x='')=>R.push((v?'PASS ':'FAIL ')+n+' '+x)
const cardAll=n=>p.evaluate(n=>{const e=document.querySelector(`[data-card="${n}"]`);return e?(e.innerText+' '+e.dataset.card+' '+(e.dataset.pack||'')).replace(/\u00a0/g,' '):''},n)
const sl=ms=>new Promise(r=>setTimeout(r,ms))
const txt=()=>p.evaluate(()=>document.body.innerText.replace(/\u00a0/g,' '))
const clickT=(t,sel='button')=>p.evaluate((t,sel)=>{const e=[...document.querySelectorAll(sel)].find(x=>x.innerText.trim().startsWith(t));if(e){e.click();return true}return false},t,sel)
const box=async n=>p.evaluate(n=>{const e=document.querySelector(`[data-card="${n}"] .c`);e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}},n)
const swipe=async(n,dx)=>{await sl(300);const bx=await box(n);await sl(200);const sx=dx>0?bx.x+40:bx.x+bx.w-40,y=bx.y+30
 await p.touchscreen.touchStart(sx,y);for(let i=1;i<=12;i++){await p.touchscreen.touchMove(sx+dx/12*i,y);await sl(16)}await p.touchscreen.touchEnd();await sl(600)}
const day=k=>p.evaluate(k=>document.querySelector(`.days button:nth-child(${k})`).click(),k)
const tab=async t=>{await clickT(t,'nav button');await sl(500)}
const C='/Volumes/KoulèKréyol/workspace/DockFlow/captures/v1.3.1/'; fs.mkdirSync(C,{recursive:true})
const T='http://localhost:4180/dockflow/'
const st=n=>p.evaluate(n=>document.querySelector(`[data-card="${n}"] .st`)?.innerText||'',n)
const gesture=async(n,dx,dy,steps=12,ms=16)=>{const bx=await box(n);await sl(250);const b2=await box(n);const sx=b2.x+b2.w/2-(dx>0?60:-60),y=b2.y+30
 await p.touchscreen.touchStart(sx,y);for(let i=1;i<=steps;i++){await p.touchscreen.touchMove(sx+dx/steps*i,y+dy/steps*i);await sl(ms)}await p.touchscreen.touchEnd();await sl(700)}
await p.goto(T,{waitUntil:'networkidle0'}); await sl(1200)
const n=await p.evaluate(()=>[...document.querySelectorAll('[data-card]')].find(e=>/À préparer/.test(e.innerText))?.dataset.card)
await gesture(n,90,0,3,8); ok('petit coup sec (90 px) : pas de changement',/À préparer/.test(await st(n)),await st(n))
await gesture(n,140,110); ok('geste en diagonale : pas de changement',/À préparer/.test(await st(n)),await st(n))
await gesture(n,0,-200); ok('défilement vertical : pas de changement',/À préparer/.test(await st(n)),await st(n))
await gesture(n,260,6); ok('vrai glissement (> 45 %) : statut suivant',/En préparation/.test(await st(n)),await st(n))
// dimensions : aucun débordement horizontal
const ov=async()=>p.evaluate(()=>{const W=document.documentElement.clientWidth;const bad=[...document.querySelectorAll('.c,.card,.btn,.big,.opt,.sheet,.dash,.top *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>W+1||r.left<-1)&&!e.closest('.filters,.days,.under,.swipe .under')});return {W,sw:document.documentElement.scrollWidth,bad:bad.slice(0,5).map(e=>e.className+':'+Math.round(e.getBoundingClientRect().right))}})
let o1=await ov(); ok('Jour : rien ne dépasse (402 px)',o1.sw<=o1.W&&!o1.bad.length,JSON.stringify(o1))
await p.screenshot({path:C+'jour.png'})
await tab('Camions'); let o2=await ov(); ok('Camions : rien ne dépasse',o2.sw<=o2.W&&!o2.bad.length,JSON.stringify(o2)); await p.screenshot({path:C+'camions.png'})
await tab('Équipe'); let o3=await ov(); ok('Équipe : rien ne dépasse',o3.sw<=o3.W&&!o3.bad.length,JSON.stringify(o3))
await tab('Réglages'); let o4=await ov(); ok('Réglages : rien ne dépasse',o4.sw<=o4.W&&!o4.bad.length,JSON.stringify(o4))
// désactiver le glissement
await p.click('[data-swipeopt]'); await sl(300); await tab('Jour')
const n2=await p.evaluate(()=>[...document.querySelectorAll('[data-card]')].find(e=>/À préparer/.test(e.innerText))?.dataset.card)
await gesture(n2,280,4); ok('glissement désactivé : aucun effet',/À préparer/.test(await st(n2)),await st(n2))
// mode au quai + gros texte iOS simulé
await p.evaluate(()=>{document.documentElement.style.fontSize='120%';document.body.style.zoom='1.15'}); await sl(400)
let o5=await ov(); await p.screenshot({path:C+'jour-texte-agrandi.png'}); ok('texte agrandi : rien ne dépasse',o5.sw<=o5.W+2,JSON.stringify(o5))
ok('zéro erreur console',errs.length===0,errs.join(' / '))
console.log(R.join('\n')); await b.close()
