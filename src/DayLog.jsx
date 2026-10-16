import { motion } from 'motion/react'
import { Empty } from './Empty'
import { StatusIcon } from './StatusIcon'
import { hhmm, nameOf } from './store'

// Événements du jour calculés depuis l'historique des commandes (pure, testable)
export function buildLog(s, now = Date.now()) {
  const d0 = new Date(now); d0.setHours(0, 0, 0, 0)
  const g = {}
  s.orders.forEach((o) => {
    if (!o.driver) return
    o.history.forEach((h) => {
      if (h.ts < d0.getTime()) return
      const kind = /^Chargée/.test(h.action) ? 'loaded' : /^Départ/.test(h.action) ? 'go' : /Livrée$/.test(h.action) ? 'done' : /Non livrée/.test(h.action) ? 'fail' : null
      if (!kind) return
      const type = kind === 'done' || kind === 'fail' ? 'back' : kind
      const min = Math.floor(h.ts / 6e4), key = type + '|' + o.driver + '|' + min
      const e = (g[key] = g[key] || { key, type, driver: o.driver, ts: min * 6e4, n: 0, done: 0, fail: 0, dock: null })
      e.n++; if (kind === 'done') e.done++; if (kind === 'fail') e.fail++
      if (type === 'loaded') e.dock = o.dock
    })
  })
  return Object.values(g).sort((a, b) => b.ts - a.ts)
}
const plural = (n, w) => n + ' ' + w + (n > 1 ? 's' : '')

export function DayLog({ s }) {
  const ev = buildLog(s)
  return (<>
    <div className="sec" style={{ padding: '18px 26px 0' }}><span>Journal du jour</span><span style={{ fontFamily: 'var(--mono)' }}>{ev.length}</span></div>
    <div className="list" data-daylog>
      {!ev.length && <Empty kind="log" title="Journal du jour vide" text="Rien pour le moment. Les chargements, départs et retours du jour apparaîtront ici." />}
      <div className="dl">
        {ev.map((e, i) => {
          const who = nameOf(s.team.drivers, e.driver)
          const label = e.type === 'loaded' ? 'Chargement' : e.type === 'go' ? 'Départ' : 'Retour'
          const detail = e.type === 'back' ? plural(e.done, 'livrée') + ', ' + e.fail + ' non livrée' : plural(e.n, 'commande') + (e.dock ? ' (' + nameOf(s.team.docks, e.dock) + ')' : '')
          return (
            <motion.div key={e.key} className="dl-it" data-dl={e.type} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: Math.min(i, 12) * 0.03 }}>
              <span className="dl-t num">{hhmm(e.ts)}</span>
              <span className="dl-i"><StatusIcon k={e.type === 'back' ? (e.fail && !e.done ? 'fail' : 'done') : e.type} size={18} /></span>
              <span className="dl-x"><b>{label}</b> · {who} · {detail}</span>
            </motion.div>)
        })}
      </div>
    </div></>)
}
