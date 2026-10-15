import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sheet, toast } from './ui'
import { STATUS, loadTo, depart, saveSig, setStatus, postpone, nameOf, hhmm, addDays, today, lastDock, fmtDM, getState } from './store'
import { truckOrders, toLoad } from './truckSel'
import { formatPack, fmtH, formatPackUI } from './pack'
import { dockName } from './people'
import { loadPdf, deliver } from './pdf'
import { withUndo } from './undo'
import { SplitSheet } from './SplitSheet'
import { partLabel } from './split'

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

export function Trucks({ s }) {
  const t0 = today(), tm = addDays(t0, 1), date = t0
  const [pickFor, setPickFor] = useState(null), [dock, setDock] = useState(''), [sel, setSel] = useState([]), [drv, setDrv] = useState('')
  const [splitFor, setSplitFor] = useState(null)
  const [sigFor, setSigFor] = useState(null), [back, setBack] = useState(null), [leaving, setLeaving] = useState(null)
  const ready = toLoad(s, t0, tm)
  const day = s.orders.filter((o) => o.status !== 'cancel')
  const drivers = s.team.drivers.filter((d) => d.on)
  const docks = s.team.docks.filter((d) => d.on)
  const go = (dr) => {
    setLeaving(dr.id); setTimeout(() => setLeaving(null), 260)
    depart(dr.id, date); toast('Départ enregistré · ' + hhmm(Date.now()))
  }
  const pdf = async (dr) => deliver(loadPdf(getState(), dr.id), 'bon-chargement-' + dr.name.replace(/\W+/g, '') + '.pdf')
  return (
    <div>
      <div className="top"><span className="brand"><i />DOCKFLOW</span><h1>Camions</h1>
        <div className="sub">{ready.length} commande{ready.length > 1 ? 's' : ''} prête{ready.length > 1 ? 's' : ''} à charger (aujourd'hui et demain)</div></div>
      <div className="list" style={{ marginTop: 14 }}>
        <button className="btn acc" data-charger onClick={() => { setPickFor('x'); setSel(ready.filter((o) => o.date === t0).map((o) => o.id)); setDock(''); setDrv('') }} disabled={!ready.length} style={{ opacity: ready.length ? 1 : 0.4 }}>Charger dans…</button>
        {[[t0, 'Livraison aujourd\'hui'], [tm, 'Livraison demain']].map(([d, l]) => { const g = ready.filter((o) => o.date === d); return g.length ? (
          <div key={d} data-ready-group={d}><div className="grp">{l} · {g.length}</div>
            {g.map((o) => <div key={o.id} className="card" style={{ marginTop: 8 }}><div className="row"><b>{o.client}</b><span className="num">{fmtH(o.time)}</span></div>
              <div className="meta">{o.city} · {o.num} · {formatPackUI(o)}</div>
              <button className="linkbtn" data-split={o.num} onClick={() => setSplitFor(o)}>Répartir sur plusieurs camions →</button></div>)}</div>) : null })}
        {!day.some((o) => o.driver && ['loaded', 'go'].includes(o.status)) && (<>
          <div className="sec" style={{ padding: '14px 6px 0' }}><span>Aucun camion chargé · livreurs actifs</span></div>
          {drivers.map((dr) => { const last = lastDock(s, dr.id)
            return <div key={dr.id} className="card" data-empty-driver style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <b>{dr.name}</b><span className="meta">{last ? 'Dernier quai : ' + nameOf(s.team.docks, last) : 'Quai libre'}</span></div> })}
          <div className="meta" style={{ textAlign: 'center' }}>Marquez des commandes Prêtes, puis touchez « Charger dans… ».</div></>)}
        {drivers.map((dr) => {
          const os = truckOrders(s, dr.id)
          if (!os.length) return null
          const dates = [...new Set(os.map((o) => o.date))].sort()
          const ld = Math.max(...os.map((o) => o.loadedAt || 0))
          const loaded = os.filter((o) => o.status === 'loaded'), gone = os.filter((o) => o.status === 'go')
          const dep = Math.max(0, ...os.map((o) => o.departAt || 0)) || null
          return (
            <motion.div key={dr.id} layout className="card" data-truck={dr.name}
              animate={leaving === dr.id ? { x: 40, opacity: 0.4 } : { x: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
              <div className="row"><b style={{ fontSize: 18 }}>{dr.name}</b><span className="num">{dockName(s.team, os.find((o) => o.dock)?.dock)}</span></div>
              <div className="meta">{ld ? 'Chargé le ' + fmtDM(new Date(ld).toISOString().slice(0, 10)) + ' à ' + hhmm(ld) + ' · ' : ''}Livraisons du {dates.map(fmtDM).join(', ')}</div>
              <AnimatePresence>{os.map((o) => (
                <motion.div key={o.id} layout className="meta" animate={leaving === dr.id ? { y: -6 } : { y: 0 }} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><b>{o.client}</b> · {o.city} {fmtH(o.time)} <span className="num">{o.num}{o.part ? ' · ' + partLabel(o) : ''}</span></span><span style={{ color: STATUS[o.status].c, fontWeight: 700 }}>{STATUS[o.status].l}</span></motion.div>))}</AnimatePresence>
              {dep && <div className="meta">Départ à {hhmm(dep)}{s.sigs[dr.id + date] ? ' · signé' : ''}</div>}
              <div className="btns">
                {loaded.length > 0 && <button className="btn ghost" onClick={() => setSigFor(dr)}>{s.sigs[dr.id + date] ? 'Signature faite' : 'Signature'}</button>}
                {loaded.length > 0 && <button className="btn" data-depart onClick={() => go(dr)}>Départ</button>}
                {gone.length > 0 && <button className="btn" data-retour onClick={() => setBack(dr)}>Retour</button>}
                <button className="btn ghost" data-pdf onClick={() => pdf(dr)}>Bon PDF</button>
              </div>
            </motion.div>)
        })}
      </div>
      <Sheet open={!!pickFor} onClose={() => setPickFor(null)}>
        <div className="row"><h2>Charger dans…</h2><button className="xbtn" aria-label="Fermer" onClick={() => setPickFor(null)}>×</button></div>
        <div className="lbl">Commandes prêtes (aujourd'hui et demain)</div>
        {[[t0, "Livraison aujourd'hui"], [tm, 'Livraison demain']].map(([d, l]) => { const g = ready.filter((o) => o.date === d); return g.length ? <div key={d}><div className="grp">{l}</div>
          {g.map((o) => <button key={o.id} className="opt sel-it" style={{ marginTop: 8 }} data-sel={o.num} onClick={() => setSel(sel.includes(o.id) ? sel.filter((x) => x !== o.id) : [...sel, o.id])}>
            <span><b>{o.client}</b> · {o.city} {fmtH(o.time)}<br /><span className="num">{o.num}</span></span><span>{sel.includes(o.id) ? 'Choisie' : 'Choisir'}</span></button>)}</div> : null })}
        <div className="lbl">Livreur</div>
        <div className="btns">{drivers.map((d) => <button key={d.id} className={'big' + (drv === d.id ? ' on' : '')} data-driver={d.name} onClick={() => { setDrv(d.id); setDock(lastDock(s, d.id) || '') }}>{d.name}</button>)}</div>
        <div className="lbl">Quai</div>
        <select value={dock} onChange={(e) => setDock(e.target.value)} aria-label="Quai" data-dock><option value="">Non attribué</option>{docks.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <button className="btn acc" data-confirm disabled={!sel.length || !drv} onClick={() => { const dn = nameOf(drivers, drv); withUndo((sel.length > 1 ? sel.length + ' commandes chargées' : 'Commande chargée') + ' · ' + dn, () => loadTo(sel, drv, dock || null)); setPickFor(null) }}>Charger{sel.length ? ' (' + sel.length + ')' : ''}</button>
        <button className="btn ghost" data-cancel onClick={() => setPickFor(null)}>Annuler</button>
      </Sheet>
      <SplitSheet o={splitFor ? s.orders.find((x) => x.id === splitFor.id) : null} onClose={() => setSplitFor(null)} team={s.team} key={'sp' + (splitFor?.id || '')} />
      <Sheet open={!!sigFor} onClose={() => setSigFor(null)}>
        <h2>Signature · {sigFor?.name}</h2>
        <SigPad onSave={(d) => { saveSig(sigFor.id, date, d); setSigFor(null); toast('Signature enregistrée') }} />
      </Sheet>
      <Sheet open={!!back} onClose={() => setBack(null)}>
        <h2>Retour · {back?.name}</h2>
        {back && s.orders.filter((o) => o.driver === back.id && o.status === 'go').map((o) => (
          <div key={o.id} className="card"><b>{o.client} · {o.city} <span className="num">{o.num}</span></b>
            <div className="btns">
              <button className="btn" data-close="done" onClick={() => withUndo('Livrée · ' + o.num, () => setStatus(o.id, 'done'))}>Livrée</button>
              <button className="btn bad" onClick={() => withUndo('Non livrée · ' + o.num, () => setStatus(o.id, 'fail'))}>Non livrée</button>
              <button className="btn ghost" onClick={() => withUndo('Reportée · ' + o.num, () => postpone(o.id, addDays(date, 1)))}>Reportée +1j</button>
              <button className="btn ghost" onClick={() => withUndo('Annulée · ' + o.num, () => setStatus(o.id, 'cancel'))}>Annulée</button></div></div>))}
        <button className="btn ghost" onClick={() => setBack(null)}>Fermer</button>
      </Sheet>
    </div>
  )
}
