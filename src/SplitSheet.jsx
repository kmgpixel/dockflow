import { useEffect, useState } from 'react'
import { Sheet, toast } from './ui'
import { lastDock, getState } from './store'
import { ductsOf, ductLine, formatPack } from './pack'
import { Stepper } from './DuctRows'
import { checkSplit, splitOrder } from './split'
import { withUndo } from './undo'

const blank = () => ({ driver: '', dock: '', pallets: 0, parcels: 0 })

// Répartir une commande prête sur 2 ou 3 camions (palettes / colis entiers, gaines et vrac non coupés)
export function SplitSheet({ o, onClose, team }) {
  const [parts, setParts] = useState([blank(), blank()])
  const [ductOwner, setDuctOwner] = useState([])
  const [bulkOwner, setBulkOwner] = useState(0)
  useEffect(() => {
    if (!o) return
    setParts([{ ...blank(), pallets: o.pallets || 0, parcels: o.parcels || 0 }, blank()])
    setDuctOwner(ductsOf(o).map(() => 0)); setBulkOwner(0)
  }, [o?.id])
  if (!o) return <Sheet open={false} />
  const drivers = team.drivers.filter((d) => d.on), docks = team.docks.filter((d) => d.on)
  const up = (i, p) => setParts(parts.map((x, k) => (k === i ? { ...x, ...p } : x)))
  const err = checkSplit(o, parts, ductOwner, bulkOwner)
  const ducts = ductsOf(o)
  const go = () => {
    withUndo('Commande répartie sur ' + parts.length + ' camions', () => splitOrder(o.id, parts, ductOwner, bulkOwner))
    onClose()
  }
  return (
    <Sheet open onClose={onClose}>
      <div className="row"><h2>Répartir</h2><button className="xbtn" aria-label="Fermer" onClick={onClose}>×</button></div>
      <div className="meta"><b>{o.client}</b> · {o.city} · <span className="num">{o.num}</span></div>
      <div className="card meta">À répartir : {formatPack(o) || 'conditionnement non saisi'}</div>
      {parts.map((p, i) => (
        <div className="card" key={i} data-part={i + 1} style={{ gap: 8, display: 'flex', flexDirection: 'column' }}>
          <div className="row"><b>Camion {i + 1}</b>
            {parts.length > 2 && <button className="xbtn" aria-label={'Retirer le camion ' + (i + 1)} onClick={() => setParts(parts.filter((_, k) => k !== i))}>×</button>}</div>
          <div className="btns">{drivers.map((d) => (
            <button key={d.id} type="button" className={'big' + (p.driver === d.id ? ' on' : '')} data-part-driver={d.name}
              onClick={() => up(i, { driver: d.id, dock: p.dock || lastDock(getState(), d.id) || '' })}>{d.name}</button>))}</div>
          <select value={p.dock} onChange={(e) => up(i, { dock: e.target.value })} aria-label={'Quai camion ' + (i + 1)}>
            <option value="">Quai non attribué</option>{docks.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
          {(o.pallets || 0) > 0 && (<><span className="flab">Palettes</span><Stepper v={p.pallets} set={(v) => up(i, { pallets: v })} label={'palettes ' + (i + 1)} /></>)}
          {(o.parcels || 0) > 0 && (<><span className="flab">Colis</span><Stepper v={p.parcels} set={(v) => up(i, { parcels: v })} label={'colis ' + (i + 1)} /></>)}
        </div>))}
      {parts.length < 3 && <button className="btn ghost" data-add-truck onClick={() => setParts([...parts, blank()])}>+ Ajouter un 3e camion</button>}
      {ducts.length > 0 && <div className="lbl">Gaines (jamais coupées) : dans quel camion ?</div>}
      {ducts.map((g, k) => (
        <div key={k} className="opt" style={{ flexWrap: 'wrap', gap: 6 }} data-duct-line={k}><span className="num">{ductLine(g)}</span>
          <span className="btns split-c">{parts.map((_, i) => (
            <button key={i} type="button" className={'big' + (ductOwner[k] === i ? ' on' : '')} 
              onClick={() => setDuctOwner(ductOwner.map((x, j) => (j === k ? i : x)))}>C{i + 1}</button>))}</span></div>))}
      {o.bulk && (<>
        <div className="lbl">Vrac : dans quel camion ?</div>
        <div className="btns">{parts.map((_, i) => <button key={i} type="button" className={'big' + (bulkOwner === i ? ' on' : '')} onClick={() => setBulkOwner(i)}>Camion {i + 1}</button>)}</div></>)}
      {err.length > 0 && <div className="meta" data-split-err style={{ color: 'var(--bad)', fontWeight: 600 }}>{err.join(' · ')}</div>}
      <button className="btn acc" data-split-ok disabled={err.length > 0} onClick={go}>Charger dans {parts.length} camions</button>
      <button className="btn ghost" onClick={() => { toast('Répartition annulée'); onClose() }}>Annuler</button>
    </Sheet>
  )
}
