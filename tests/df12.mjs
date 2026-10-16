import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new'})
const p=await b.newPage(); const errs=[]
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); p.on('pageerror',e=>errs.push('PAGE '+e.message))
p.on('dialog',d=>d.accept())
await p.setViewport({width:402,height:874,deviceScaleFactor:2,isMobile:true,hasTouch:true})
const R=[]; const ok=(n,v,x='')=>R.push((v?'PASS ':'FAIL ')+n+' '+x)
const sl=ms=>new Promise(r=>setTimeout(r,ms))
const clickT=(t,sel='button')=>p.evaluate((t,sel)=>{const e=[...document.querySelectorAll(sel)].find(x=>x.innerText.trim().startsWith(t));if(e){e.click();return true}return false},t,sel)
const CAP='/Volumes/KoulèKréyol/workspace/DockFlow/captures/v1.4c/'
const T='http://localhost:4180/dockflow/'
const theme=async m=>{await p.evaluate(m=>{document.documentElement.classList.toggle('dark',m==='dark');document.documentElement.classList.toggle('light',m==='light')},m);await sl(200)}
const shot=async n=>{for(const m of ['light','dark']){await theme(m);await p.screenshot({path:CAP+n+'-'+m+'.png'})}}
await p.goto(T,{waitUntil:'networkidle0'}); await sl(1200)
// ajout
await p.evaluate(()=>document.querySelector('[data-add]').click()); await sl(120); await shot('nouvelle-commande-ouverture'); await sl(400)
const setv=(l,v)=>p.evaluate((l,v)=>{const i=document.querySelector(`[aria-label="${l}"]`);const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(i,v);i.dispatchEvent(new Event('input',{bubbles:true}))},l,v)
await setv('Numéro','SO-9999'); await setv('Client','Atelier Test'); await setv('Ville','Lyon'); await sl(200)
await shot('nouvelle-commande')
await clickT('Ajouter','[data-submit]'); await sl(250)
const r=await p.evaluate(()=>{const e=document.querySelector('[data-card="SO-9999"]');if(!e)return null;const r=e.getBoundingClientRect();return{t:r.top,b:r.bottom,h:innerHeight,hl:e.classList.contains('hl')}})
ok('nouvelle carte créée',!!r,JSON.stringify(r)); await sl(900)
const r2=await p.evaluate(()=>{const e=document.querySelector('[data-card="SO-9999"]');if(!e)return null;const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})
ok('nouvelle carte visible à l\'écran',r2===true)
await shot('liste-apres-ajout')
// résolu
await p.evaluate(()=>document.querySelector('.days button:nth-child(1)').click()); await sl(500)
await p.evaluate(()=>window.scrollTo(0,0)); await p.evaluate(()=>{document.querySelector('.scroll').scrollTop=0}); await sl(300)
const iss=await p.evaluate(()=>{const e=document.querySelector('[data-card] .flag');return e?e.closest('[data-card]').dataset.card:null})
if(iss){ok('carte à problème trouvée',true,iss)
 await p.evaluate(n=>{const e=document.querySelector(`[data-card="${n}"] .flag button`);e.scrollIntoView({block:'center'});e.click()},iss); await sl(700)
 const st=await p.evaluate(n=>{const e=document.querySelector(`[data-card="${n}"]`);return{flag:!!e.querySelector('.flag'),t:e.querySelector('.st').innerText}},iss)
 ok('ligne rouge repliée',!st.flag,st.t); ok('pastille sans « Problème »',!/Problème/.test(st.t),st.t)
} else ok('carte à problème trouvée',false)
// barre d'onglets
await p.evaluate(()=>{document.querySelector('.scroll').scrollTop=0}); await sl(300)
const ty=()=>p.evaluate(()=>{const r=document.querySelector('.tabbar').getBoundingClientRect();return r.top>=innerHeight-5})
ok('barre visible en haut',!(await ty()))
for(let i=1;i<=8;i++){await p.evaluate(i=>{document.querySelector('.scroll').scrollTop=i*50},i);await sl(40)}
await sl(500); ok('barre masquée après 400 px',await ty())
await shot('barre-masquee')
await p.evaluate(()=>{document.querySelector('.scroll').scrollTop=0}); await sl(500)
ok('barre visible après retour en haut',!(await ty()))
await shot('barre-onglets')
// journée complète : recharger la démo, passer tout en prêt via store exposé ? sinon via UI
await p.goto(T,{waitUntil:'networkidle0'}); await sl(1000)
ok('pas complet au départ',await p.evaluate(()=>!document.querySelector('[data-dash]').hasAttribute('data-complete')))
const nb=await p.evaluate(()=>[...document.querySelectorAll('[data-card]')].length)
let guard=0
await p.evaluate(()=>{document.querySelectorAll('[data-card] .flag button').forEach(b=>b.click())}); await sl(500)
while(guard++<30){
 const n=await p.evaluate(()=>{const e=[...document.querySelectorAll('[data-card]')].find(e=>/À préparer|En préparation|Attente/.test(e.querySelector('.st').innerText));return e?e.dataset.card:null})
 if(!n)break
 await p.evaluate(n=>{const e=document.querySelector(`[data-card="${n}"] .c`);e.scrollIntoView({block:'center'});if(!document.querySelector(`[data-card="${n}"] [data-qmain]`))e.click()},n); await sl(500)
 await p.evaluate(n=>document.querySelector(`[data-card="${n}"] [data-qmain]`)?.click(),n); await sl(700)
 if(await p.evaluate(()=>!!document.querySelector('[data-sheet]'))){
  await p.evaluate(()=>{const sh=document.querySelector('[data-sheet]');const bt=[...sh.querySelectorAll('button')].find(x=>x.innerText.trim()==='Karim');bt&&bt.click();const s=sh.querySelector('[aria-label="Plus palettes"]');if(s)s.click()}); await sl(300)
  await p.evaluate(()=>document.querySelector('[data-allok]')?.click()); await sl(900)
  if(await p.evaluate(()=>!!document.querySelector('[data-sheet]')))await p.evaluate(()=>document.querySelector('.ov')?.click())
  await sl(500)
 }
}
await p.evaluate(()=>{document.querySelector('.scroll').scrollTop=0}); await sl(500)
const dc=await p.evaluate(()=>({c:document.querySelector('[data-dash]').hasAttribute('data-complete'),t:document.querySelector('[data-dash]').innerText}))
ok('data-complete présent',dc.c,dc.t.replace(/\n/g,' | ').slice(0,90))
if(dc.c){ok('texte Journée complète',/Journée complète/.test(dc.t)); await shot('journee-complete')}
// recherche vide
await p.goto(T,{waitUntil:'networkidle0'}); await sl(900)
await p.evaluate(()=>{const i=document.querySelector('.search input');const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(i,'zzzz');i.dispatchEvent(new Event('input',{bubbles:true}))}); await sl(600)
const e1=await p.evaluate(()=>document.querySelector('[data-empty]')?.innerText||'')
ok('recherche vide',/Aucune commande ne correspond/.test(e1),e1.replace(/\n/g,' | ')); await shot('recherche-vide')
await clickT('Effacer les filtres'); await sl(600)
ok('liste revenue',await p.evaluate(()=>document.querySelectorAll('[data-card]').length>0))
// jour vide
await clickT('Réglages','nav button'); await sl(500)
await p.evaluate(()=>document.querySelector('[data-clear]').click()); await sl(600)
await clickT('Jour','nav button'); await sl(700)
const e2=await p.evaluate(()=>document.querySelector('[data-empty]')?.innerText||'')
ok('jour vide',/Rien de prévu/.test(e2),e2.replace(/\n/g,' | ')); await shot('jour-vide')
ok('zéro erreur console',errs.length===0,errs.join(' / ').slice(0,200))
console.log(R.join('\n')); await b.close()
