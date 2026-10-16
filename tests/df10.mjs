import puppeteer from 'puppeteer-core'; import fs from 'fs'
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new'})
const p=await b.newPage(); const errs=[]
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); p.on('pageerror',e=>errs.push('PAGE '+e.message))
await p.setViewport({width:402,height:874,deviceScaleFactor:2,isMobile:true,hasTouch:true})
const R=[]; const ok=(n,v,x='')=>R.push((v?'PASS ':'FAIL ')+n+' '+x)
const sl=ms=>new Promise(r=>setTimeout(r,ms))
const txt=()=>p.evaluate(()=>document.body.innerText.replace(/\u00a0/g,' '))
const clickT=(t,sel='button')=>p.evaluate((t,sel)=>{const e=[...document.querySelectorAll(sel)].find(x=>x.innerText.trim().startsWith(t));if(e){e.click();return true}return false},t,sel)
const tab=async t=>{await clickT(t,'nav button');await sl(500)}
const C='/Volumes/KoulèKréyol/workspace/DockFlow/captures/v1.4b/'
const iso=d=>{const x=new Date(d);x.setMinutes(x.getMinutes()-x.getTimezoneOffset());return x.toISOString().slice(0,10)}
for(const th of ['light','dark']){
await p.emulateMediaFeatures([{name:'prefers-color-scheme',value:th}])
await p.goto('http://localhost:4180/dockflow/',{waitUntil:'networkidle0'}); await sl(1200)
await p.evaluate(()=>document.querySelector('.fab,[aria-label="Nouvelle commande"],[data-add]')?.click())
await sl(500)
if(th==='light'){
 if(!await p.$('[data-date]')){ await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^\+$|Nouvelle/.test(x.innerText.trim()||x.ariaLabel||''));b?.click()}); await sl(500)}
 ok('ruban de dates',await p.evaluate(()=>document.querySelectorAll('[data-date]').length===4))
 ok('Demain par défaut',await p.evaluate(d=>document.querySelector('[data-date].on')?.dataset.date===d,iso(Date.now()+864e5)))
 await p.click('[data-time-other]'); await sl(400); await p.click('[data-slot="15:00"]'); await sl(300)
 ok('créneau 15h00',await p.evaluate(()=>document.querySelector('input[aria-label="Heure libre"]').value==='15:00'))
 const known=await p.evaluate(()=>document.querySelector('[data-suggest]')?.dataset.suggest)
 ok('autocomplétion propose un client',!!known,known)
 await p.type('input[aria-label=Client]',(known||'a').slice(0,2)); await sl(300)
 const sg=await p.evaluate(()=>{const e=document.querySelector('[data-suggest]');const n=e?.dataset.suggest;e?.click();return n})
 await sl(300)
 ok('toucher remplit client+ville',await p.evaluate(n=>document.querySelector('input[aria-label=Client]').value===n&&document.querySelector('input[aria-label=Ville]').value.length>0,sg),sg)
 await p.evaluate(()=>{const i=document.querySelector('input[aria-label=Ville]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,'');i.dispatchEvent(new Event('input',{bubbles:true}))}); await sl(200)
 ok('Ajouter indique ce qui manque',await p.evaluate(()=>/Il manque : .*ville/.test(document.querySelector('[data-submit]').innerText)&&document.querySelector('[data-submit]').disabled))
}
await p.screenshot({path:C+'nouvelle-commande-'+th+'.png'})
await p.reload({waitUntil:'networkidle0'}); await sl(1000)
await tab('Camions')
if(th==='light'){
 await p.click('[data-charger]'); await sl(600)
 await p.evaluate(()=>document.querySelector('[data-driver]').click()); await sl(200)
 ok('type de camion dans le sheet',await p.evaluate(()=>!!document.querySelector('.sheet [data-trucktype]')))
 await p.click('[data-confirm]'); await sl(1200)
 const t=await txt(); ok('jauge « / 8 pal. »',/\/ 8 places/.test(t),(t.match(/\d+ \/ \d+ places/)||[''])[0])
 await p.evaluate(()=>document.querySelector('[data-trucktype="semi"]').click()); await sl(500)
 ok('semi → / 33 pal.',/\/ 33 places/.test(await txt()))
 await p.evaluate(()=>document.querySelector('[data-trucktype="20m3"]').click()); await sl(400)
}
await p.screenshot({path:C+'camions-'+th+'.png'})
await tab('Équipe')
if(th==='light') ok('Équipe : initiales',await p.evaluate(()=>document.querySelectorAll('.avatar').length>0&&/^[A-ZÉ?]{1,2}$/.test(document.querySelector('.avatar').innerText)))
await p.screenshot({path:C+'equipe-'+th+'.png'})
await tab('Réglages')
if(th==='light') ok('Réglages ≥4 sections dont Zone de danger',await p.evaluate(()=>document.querySelectorAll('.sgroup').length>=4&&/Zone de danger/i.test(document.body.innerText)))
await p.screenshot({path:C+'reglages-'+th+'.png'})
}
ok('zéro erreur console',errs.length===0,errs.join('|').slice(0,200))
console.log(R.join('\n')); await b.close()
