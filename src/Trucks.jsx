import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sheet, toast } from './ui'
import { STATUS, loadTo, depart, saveSig, setStatus, postpone, nameOf, hhmm, addDays, getState } from './store'
import { loadPdf, deliver } from './pdf'

function SigPad({ onSave }) {
  const ref = useRef(), drawing = useRef(false), dirty = useRef(false)
  const pos = (e) => { const r = ref.current.getBoundingClientRect(); return [(e.clientX - r.left) * (ref.current.width / r.width), (e.clientY - r.top) * (ref.current.height / r.height)] }
  useEffect(() => { const c = ref.current; c.width = 800; c.height = 320 }, [])
  const ctx = () => { const c = ref.current.getContext('2d'); c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = '#16181b'; return c }
  return (<>
    <canvas ref={ref} className="sig" data-sig
      onPointerDown={(e) => { drawing.current = true; ref.current.setPointerCapture(e.pointerId); const c = ctx(); c.beginPath(); c.moveTo(...pos(e)) }}
      onPointerMove={(e) => { if (!drawing.current) return; const c = ctx(); c.lineTo(...pos(e)); c.stroke(); dirty.current = true }}
      onPointerUp={() => { drawing.current = false }} />
    <div className="btns">
      <button className="btn ghost" onClick={() => { ref.current.getContext('2d').clearRect(0, 0, 800, 320); dirty.current = false }}>Effacer</button>
      <button className="btn acc" data-sigsave onClick={() => { if (!dirty.current) return toast('Signez d’abord'); onSave(ref.current.toDataURL('image/png')) }}>Valider</button>
    </div>
  </>)
}

export function Trucks({ s, date }) {
  const [pickFor, setPickFor] = useState(null), [dock, setDock] = useState(''), [sel, setSel] = useState([])
  const [sigFor, setSigFor] = useState(null), [back, setBack] = useState(null), [leaving, setLeaving] = useState(null)
  const day = s.orders.filter((o) => o.date === date && o.status !== 'cancel')
  const ready = day.filter((o) => o.status === 'ready')
  const drivers = s.team.drivers.filter((d) => d.on)
  const docks = s.team.docks.filter((d) => d.on)
  const go = (dr) => {
    setLeaving(dr.id)
    setTimeout(() => { depart(dr.id, date); setLeaving(null); toast('Départ enregistré · ' + hhmm(Date.now())) }, 700)
  }
  const pdf = async (dr) => deliver(loadPdf(getState(), dr.id, date), 'bon-chargement-' + dr.name.replace(/\W+/g, '') + '.pdf')
  return (
    <div>
      <div className="top"><span className="brand"><i />DOCKFLOW</span><h1>Camions</h1>
        <div className="sub">{ready.length} commande{ready.length > 1 ? 's' : ''} prête{ready.length > 1 ? 's' : ''} à charger</div></div>
      <div className="list" style={{ marginTop: 14 }}>
        <button className="btn acc" data-charger onClick={() => { setPickFor('x'); setSel(ready.map((o) => o.id)) }} disabled={!ready.length} style={{ opacity: ready.length ? 1 : 0.4 }}>Charger dans…</button>
        {drivers.map((dr) => {
          const os = day.filter((o) => o.driver === dr.id)
          if (!os.length) return null
          const loaded = os.filter((o) => o.status === 'loaded'), gone = os.filter((o) => o.status === 'go')
          const dep = s.departs[dr.id + date]
          return (
            <motion.div key={dr.id} layout className="card" data-truck={dr.name}
              animate={leaving === dr.id ? { scale: 0.94, x: [0, 0, 420], opacity: [1, 1, 0] } : { scale: 1, x: 0, opacity: 1 }} transition={{ duration: 0.7, times: [0, 0.4, 1] }}>
              <div className="row"><b style={{ fontSize: 18 }}>{dr.name}</b><span className="num">{nameOf(s.team.docks, os[0].dock)}</span></div>
              <AnimatePresence>{os.map((o) => (
                <motion.div key={o.id} layout className="meta" animate={leaving === dr.id ? { y: -6 } : { y: 0 }} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><b className="num">{o.num}</b> {o.client.split('—').pop()}</span><span style={{ color: STATUS[o.status].c, fontWeight: 700 }}>{STATUS[o.status].l}</span></motion.div>))}</AnimatePresence>
              {dep && <div className="meta">Départ à {hhmm(dep)}{s.sigs[dr.id + date] ? ' · signé ✓' : ''}</div>}
              <div className="btns">
                {loaded.length > 0 && <button className="btn ghost" onClick={() => setSigFor(dr)}>{s.sigs[dr.id + date] ? 'Signature ✓' : 'Signature'}</button>}
                {loaded.length > 0 && <button className="btn" data-depart onClick={() => go(dr)}>Départ</button>}
                {gone.length > 0 && <button className="btn" data-retour onClick={() => setBack(dr)}>Retour</button>}
                <button className="btn ghost" data-pdf onClick={() => pdf(dr)}>Bon PDF</button>
              </div>
            </motion.div>)
        })}
      </div>
      <Sheet open={!!pickFor} onClose={() => setPickFor(null)}>
        <h2>Charger dans…</h2>
        <div className="lbl">Quai</div>
        <select value={dock} onChange={(e) => setDock(e.target.value)} aria-label="Quai"><option value="">Quai (optionnel)</option>{docks.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <div className="lbl">Commandes prêtes</div>
        {ready.map((o) => <button key={o.id} className="opt" onClick={() => setSel(sel.includes(o.id) ? sel.filter((x) => x !== o.id) : [...sel, o.id])}>
          <span><b className="num">{o.num}</b> {o.client}</span><span>{sel.includes(o.id) ? '✓' : '○'}</span></button>)}
        <div className="lbl">Livreur</div>
        {drivers.map((d) => <button key={d.id} className="opt" data-driver={d.name} onClick={() => { if (!sel.length) return; loadTo(sel, d.id, dock || null); toast((sel.length > 1 ? sel.length + ' commandes chargées' : 'Commande chargée') + ' · ' + d.name); setPickFor(null) }}>
          <b>{d.name}</b><span className="meta">{day.filter((o) => o.driver === d.id).length} cmd</span></button>)}
      </Sheet>
      <Sheet open={!!sigFor} onClose={() => setSigFor(null)}>
        <h2>Signature · {sigFor?.name}</h2>
        <SigPad onSave={(d) => { saveSig(sigFor.id, date, d); setSigFor(null); toast('Signature enregistrée') }} />
      </Sheet>
      <Sheet open={!!back} onClose={() => setBack(null)}>
        <h2>Retour · {back?.name}</h2>
        {back && s.orders.filter((o) => o.driver === back.id && o.date === date && o.status === 'go').map((o) => (
          <div key={o.id} className="card"><b><span className="num">{o.num}</span> {o.client}</b>
            <div className="btns">
              <button className="btn" data-close="done" onClick={() => setStatus(o.id, 'done')}>Livrée</button>
              <button className="btn bad" onClick={() => setStatus(o.id, 'fail')}>Non livrée</button>
              <button className="btn ghost" onClick={() => postpone(o.id, addDays(date, 1))}>Reportée +1j</button>
              <button className="btn ghost" onClick={() => setStatus(o.id, 'cancel')}>Annulée</button></div></div>))}
        <button className="btn ghost" onClick={() => setBack(null)}>Fermer</button>
      </Sheet>
    </div>
  )
}
