import puppeteer from 'puppeteer-core'; import fs from 'fs'
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new'})
const p=await b.newPage(); const errs=[]
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); p.on('pageerror',e=>errs.push('PAGE '+e.message))
await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true})
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
const C='/Volumes/KoulèKréyol/workspace/DockFlow/captures/v1.3/'; fs.mkdirSync(C,{recursive:true})
const T='http://localhost:4180/dockflow/'
const st=n=>p.evaluate(n=>{const e=document.querySelector(`[data-card="${n}"] .st`);return e?e.innerText:''},n)
const tapCard=async n=>{const b=await box(n);await sl(250);const b2=await box(n);await p.touchscreen.tap(b2.x+60,b2.y+22);await sl(600)}
await p.emulateMediaFeatures([{name:'prefers-color-scheme',value:'light'}])
await p.goto(T,{waitUntil:'networkidle0'}); await sl(1200)
// 1 icônes
ok('icône SVG dans chaque carte',await p.evaluate(()=>{const c=[...document.querySelectorAll('[data-card]')];return c.length>0&&c.every(e=>e.querySelector('svg'))}))
// 2 en-tête
const dash=await p.evaluate(()=>(document.querySelector('[data-dash]')?.innerText||'').replace(/\u00a0/g,' '))
ok('en-tête : « N sur total »',/\d+\s+sur\s+\d+/.test(dash),dash.replace(/\n/g,'|').slice(0,120))
ok('prochaine livraison affichée',await p.evaluate(()=>/Prochaine/.test(document.querySelector('[data-next]')?.innerText||'')))
await p.screenshot({path:C+'jour-clair.png'})
// 3 carte compacte → dépliée → fiche
const n1=await p.evaluate(()=>[...document.querySelectorAll('[data-card]')].find(e=>/À préparer/.test(e.innerText))?.dataset.card)
const fold=await p.evaluate(n=>!!document.querySelector(`[data-card="${n}"] [data-det]`),n1)
await tapCard(n1)
const open=await p.evaluate(n=>{const d=document.querySelector(`[data-card="${n}"] [data-det]`);return !!d&&d.innerText.includes(n)},n1)
ok('tap → carte dépliée avec n°',!fold&&open)
await p.screenshot({path:C+'carte-depliee.png'})
// 5 action rapide Commencer
await p.evaluate(n=>document.querySelector(`[data-card="${n}"] [data-qmain]`).click(),n1); await sl(600)
ok('« Commencer » → En préparation',/En préparation/.test(await st(n1)),await st(n1))
// Annuler du toast
await p.evaluate(()=>document.querySelector('.toast .undo')?.click()); await sl(600)
ok('Annuler (toast) → retour À préparer',/À préparer/.test(await st(n1)),await st(n1))
// Terminer la préparation → PrepSheet
await p.evaluate(n=>{if(!document.querySelector(`[data-card="${n}"] [data-qmain]`)) return; },n1)
if(!await p.evaluate(n=>!!document.querySelector(`[data-card="${n}"] [data-qmain]`),n1)) await tapCard(n1)
await p.evaluate(n=>document.querySelector(`[data-card="${n}"] [data-qmain]`).click(),n1); await sl(500)
if(!await p.evaluate(n=>!!document.querySelector(`[data-card="${n}"] [data-qmain]`),n1)) await tapCard(n1)
await p.evaluate(n=>document.querySelector(`[data-card="${n}"] [data-qmain]`).click(),n1); await sl(700)
ok('« Terminer la préparation » → fenêtre Fin de préparation',await p.evaluate(()=>/Fin de préparation/.test(document.querySelector('.sheet')?.innerText||'')))
await p.evaluate(()=>document.querySelector('[aria-label="Plus palettes"]').click()); await sl(100)
await p.evaluate(()=>document.querySelector('[data-allok]').click()); await sl(500)
await p.screenshot({path:C+'coche-prete.png'})
await sl(500)
ok('→ Prête',/Prête/.test(await st(n1)),await st(n1))
// Charger… depuis la carte
if(!await p.evaluate(n=>!!document.querySelector(`[data-card="${n}"] [data-qmain]`),n1)) await tapCard(n1)
await p.evaluate(n=>document.querySelector(`[data-card="${n}"] [data-qmain]`).click(),n1); await sl(700)
await p.evaluate(()=>[...document.querySelectorAll('.sheet [data-driver]')].find(b=>b.dataset.driver==='Sofiane').click()); await sl(200)
await p.evaluate(()=>document.querySelector('.sheet [data-confirm]').click()); await sl(700)
ok('« Charger… » depuis la carte → Chargée',/Chargée/.test(await st(n1)),await st(n1))
// 6 dernière carte visible au-dessus de la barre (Jour puis Camions)
const vis=()=>p.evaluate(()=>{const s=document.querySelector('.scroll');s.scrollTop=s.scrollHeight;return new Promise(r=>setTimeout(()=>{const els=[...document.querySelectorAll('.scroll .card,.scroll [data-card]')];const last=els[els.length-1].getBoundingClientRect();const bar=document.querySelector('.tabbar').getBoundingClientRect();r({last:Math.round(last.bottom),bar:Math.round(bar.top)})},500))})
const v1=await vis(); ok('Jour : dernière carte au-dessus de la barre',v1.last<=v1.bar,JSON.stringify(v1))
await tab('Camions'); await sl(400)
const v2=await vis(); ok('Camions : dernière carte au-dessus de la barre',v2.last<=v2.bar,JSON.stringify(v2))
await p.evaluate(()=>document.querySelector('.scroll').scrollTop=0); await sl(300)
await p.screenshot({path:C+'camions-clair.png'})
// sombre
await p.emulateMediaFeatures([{name:'prefers-color-scheme',value:'dark'}]); await sl(400)
await p.screenshot({path:C+'camions-sombre.png'})
await tab('Jour'); await sl(400); await p.evaluate(()=>document.querySelector('.scroll').scrollTop=0); await sl(300)
await p.screenshot({path:C+'jour-sombre.png'})
ok('zéro erreur console',errs.length===0,errs.join(' / '))
console.log(R.join('\n')); await b.close()
