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
const C='/Volumes/KoulèKréyol/workspace/DockFlow/captures/v1.4/'; fs.mkdirSync(C,{recursive:true})
const T='http://localhost:4180/dockflow/'
const hue=c=>{const m=c.match(/\d+(\.\d+)?/g).map(Number);let[r,g,b]=m.slice(0,3).map(x=>x/255);const M=Math.max(r,g,b),n=Math.min(r,g,b),d=M-n;if(!d)return -1;let h=M===r?((g-b)/d)%6:M===g?(b-r)/d+2:(r-g)/d+4;h*=60;return h<0?h+360:h}
for(const th of ['light','dark']){
await p.emulateMediaFeatures([{name:'prefers-color-scheme',value:th}])
await p.goto(T,{waitUntil:'networkidle0'}); await sl(1200)
if(th==='light'){
 const h0=await p.evaluate(()=>{const e=document.querySelector('[data-alerts-section]');return e?Math.round(e.getBoundingClientRect().height):-1})
 ok('À relancer replié (< 80 px)',h0>=0&&h0<80,'h='+h0)
 await p.evaluate(()=>document.querySelector('[data-alerts-toggle]').click()); await sl(700)
 const h1=await p.evaluate(()=>Math.round(document.querySelector('[data-alerts-section]').getBoundingClientRect().height))
 ok('À relancer déplié au toucher',h1>h0+80,'h='+h1)
 await p.screenshot({path:C+'alertes-'+th+'.png'})
 await p.evaluate(()=>document.querySelector('[data-alerts-toggle]').click()); await sl(500)
 const lc=await p.evaluate(()=>[...document.querySelectorAll('.lnk')].map(e=>getComputedStyle(e).color))
 const acc=await p.evaluate(()=>getComputedStyle(document.querySelector('.tabbar .plus')).backgroundColor)
 ok('liens d\'en-tête pas en orange',lc.length>0&&lc.every(c=>c!==acc&&Math.abs(hue(c)-hue(acc))>12||hue(c)<0),lc.join(' ')+' vs '+acc)
 const wait=await p.evaluate(()=>{const e=[...document.querySelectorAll('[data-card] .st')].find(x=>/Attente/.test(x.innerText));return e?getComputedStyle(e).color:''})
 ok('pastille Attente client ambre (30–50°)',wait&&hue(wait)>=28&&hue(wait)<=52,wait+' h='+Math.round(hue(wait)))
 const small=await p.evaluate(()=>{const out=[];document.querySelectorAll('body *').forEach(e=>{if(!e.childNodes.length)return;const t=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());if(!t)return;const r=e.getBoundingClientRect();if(!r.width||!r.height)return;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||+cs.opacity===0)return;const fs=parseFloat(cs.fontSize);if(fs<11)out.push(e.className+':'+fs+':'+e.textContent.trim().slice(0,15))});return out})
 ok('aucun texte visible < 11 px',!small.length,small.slice(0,5).join(' | '))
 await p.screenshot({path:C+'jour-'+th+'.png'})
 await p.evaluate(()=>{document.querySelector('.scroll').scrollTop=600}); await sl(700)
 const top=await p.evaluate(()=>Math.round(document.querySelector('.stick').getBoundingClientRect().top))
 ok('en-tête collant en haut après défilement',top>=0&&top<70,'top='+top)
 await p.screenshot({path:C+'jour-defile-'+th+'.png'})
 await p.evaluate(()=>{document.querySelector('.scroll').scrollTop=0})
 await tab('Réglages'); await p.evaluate(()=>document.querySelector('[data-clear]').scrollIntoView({block:'center'})); await sl(400)
 const bg=await p.evaluate(()=>getComputedStyle(document.querySelector('[data-clear]')).backgroundColor)
 ok('« Vider » non rempli',/rgba\(\d+, \d+, \d+, 0\)|transparent/.test(bg),bg)
 await p.screenshot({path:C+'reglages-'+th+'.png'})
 await tab('Camions'); await p.screenshot({path:C+'camions-'+th+'.png'})
}else{
 const col=await p.evaluate(()=>getComputedStyle(document.querySelector('h1')).color)
 ok('sombre : texte principal pas blanc pur',col!=='rgb(255, 255, 255)',col)
 await p.screenshot({path:C+'jour-'+th+'.png'})
 await p.evaluate(()=>{document.querySelector('.scroll').scrollTop=600}); await sl(700); await p.screenshot({path:C+'jour-defile-'+th+'.png'})
 await p.evaluate(()=>{document.querySelector('.scroll').scrollTop=0})
 await tab('Réglages'); await p.screenshot({path:C+'reglages-'+th+'.png'})
 await tab('Camions'); await p.screenshot({path:C+'camions-'+th+'.png'})
}}
ok('zéro erreur console',errs.length===0,errs.join(' / '))
console.log(R.join('\n')); await b.close()
