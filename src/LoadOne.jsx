import { useState } from 'react'
import { Sheet } from './ui'
import { loadTo, lastDock, nameOf } from './store'
import { withUndo } from './undo'
import { where, formatPackUI } from './pack'

// Charger UNE commande depuis sa carte : choix du livreur, quai pré-rempli
export function LoadOne({ o, s, onClose }) {
  const [drv, setDrv] = useState(''), [dock, setDock] = useState('')
  const drivers = s.team.drivers.filter((d) => d.on), docks = s.team.docks.filter((d) => d.on)
  return (
    <Sheet open={!!o} onClose={onClose}>
      <div className="row"><h2>Charger dans…</h2><button className="xbtn" aria-label="Fermer" onClick={onClose}>×</button></div>
      <div className="card"><b>{o?.client}</b><div className="meta">{o && where(o)} · {o?.num}{o && formatPackUI(o) ? ' · ' + formatPackUI(o) : ''}</div></div>
      <div className="lbl">Livreur</div>
      <div className="btns">{drivers.map((d) => <button key={d.id} className={'big' + (drv === d.id ? ' on' : '')} data-driver={d.name} onClick={() => { setDrv(d.id); setDock(lastDock(s, d.id) || '') }}>{d.name}</button>)}</div>
      <div className="lbl">Quai</div>
      <select value={dock} onChange={(e) => setDock(e.target.value)} aria-label="Quai" data-dock><option value="">Non attribué</option>{docks.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
      <button className="btn acc" data-confirm disabled={!drv} onClick={() => { const dn = nameOf(drivers, drv); withUndo('Commande chargée · ' + dn, () => loadTo([o.id], drv, dock || null)); onClose() }}>Charger</button>
      <button className="btn ghost" onClick={onClose}>Annuler</button>
    </Sheet>
  )
}
