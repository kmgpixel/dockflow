import { motion } from 'motion/react'
import { packTotals } from './pack'
import { editTeam } from './store'

export const CAPS = { '20m3': 8, semi: 33 }
export const capOf = (dr) => CAPS[dr?.truck] || CAPS['20m3']

export function TruckType({ dr }) {
  const cur = dr?.truck === 'semi' ? 'semi' : '20m3'
  return (
    <div className="seg2" role="group" aria-label="Type de camion">
      {[['20m3', '20 m³'], ['semi', 'Semi']].map(([k, l]) => (
        <button key={k} type="button" className={'chip' + (cur === k ? ' on' : '')} data-trucktype={k} aria-pressed={cur === k}
          onClick={() => editTeam('drivers', (ls) => ls.map((x) => (x.id === dr.id ? { ...x, truck: k } : x)))}>{l}</button>))}
    </div>)
}

export function TruckGauge({ orders, dr }) {
  const cap = capOf(dr)
  const t = packTotals(orders), pal = t.floor, all = t.pal, n = orders.length
  const cells = Math.max(cap, pal)
  return (
    <div className="gauge" data-gauge>
      <div className="gauge-bar" role="img" aria-label={pal + ' places au sol sur ' + cap}>
        {Array.from({ length: cells }, (_, i) => (
          <motion.i key={i} className={i < pal ? (i >= cap ? 'f over' : 'f') : ''} initial={{ scaleX: 0.2, opacity: 0.4 }} animate={{ scaleX: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 600, damping: 35, delay: Math.min(i, 12) * 0.012 }} />))}
      </div>
      <div className="gauge-t"><b>{pal} / {cap} places</b> · {all} pal.{all > pal ? ' (' + (all - pal) + ' gerbée' + (all - pal > 1 ? 's' : '') + ')' : ''} · {n} commande{n > 1 ? 's' : ''}{pal > cap && <b className="ovr"> · Dépassement +{pal - cap} place{pal - cap > 1 ? 's' : ''}</b>}</div>
    </div>)
}
