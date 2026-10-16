import { useState } from 'react'
import { STATUS } from './store'
import { fmtH, ductsOf, ductLine } from './pack'
import { StatusIcon } from './StatusIcon'

// Ligne principale « 3 pal. · 18 colis », détail gaines/vrac en secondaire (repliable)
export function PackLine({ o }) {
  const [open, setOpen] = useState(false)
  const main = [o.pallets > 0 && o.pallets + ' pal.', o.parcels > 0 && o.parcels + ' colis'].filter(Boolean).join(' · ')
  const d = ductsOf(o).map(ductLine), more = [...d, o.bulk && 'vrac' + (o.bulkNote?.trim() ? ' (' + o.bulkNote.trim() + ')' : '')].filter(Boolean)
  if (!main && !more.length) return null
  const fold = d.length > 1
  return (<span className="pk">
    {main && <span className="pk-main">{main}</span>}
    {more.length > 0 && (!fold || open) && <div className="pk-more">{more.join(' · ')}</div>}
    {fold && <div className="pk-more"><button type="button" onClick={(e) => { e.stopPropagation(); setOpen(!open) }}>{open ? 'Masquer le détail' : 'Détail (' + more.length + ' lignes)'}</button></div>}
  </span>)
}

// Anatomie commune : client / ville · heure / pastille statut
export function OrderRow({ o, inner, children, pack = true, ...rest }) {
  const st = STATUS[o.status]
  return (
    <div className={'orow' + (inner ? ' in' : '')} {...rest}>
      <div className="cli">{o.client}</div>
      <div className="where">{[o.city, fmtH(o.time)].filter(Boolean).join(' · ')} <span className="num">{o.num}</span></div>
      <span className="st" style={{ '--s': st.c }}><StatusIcon k={o.status} size={16} /><span>{st.l}</span></span>
      {pack && <PackLine o={o} />}
      {children}
    </div>)
}
