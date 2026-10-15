import { motion } from 'motion/react'
import { formatPackUI } from './pack'
import { prepName } from './people'
import { QuickActions } from './QuickActions'

// Zone dépliable : n°, préparateur, conditionnement, quai, livreur + actions rapides
export function Details({ o, team, qa }) {
  const dock = o.dock && team.docks.find((d) => d.id === o.dock)?.name, drv = o.driver && team.drivers.find((d) => d.id === o.driver)?.name
  const rows = [['N°', o.num + (o.part ? ' · Partie ' + o.part.i + '/' + o.part.n : ''), 1], ['Préparateur', prepName(team, o.prep)], ['Conditionnement', formatPackUI(o)], ['Quai', dock], ['Livreur', drv]].filter((r) => r[1])
  return (
    <motion.div className="det" data-det initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 600, damping: 45 }} style={{ overflow: 'hidden' }}>
      <dl>{rows.map(([k, v, m]) => <div key={k}><dt>{k}</dt><dd className={m ? 'num' : ''}>{v}</dd></div>)}</dl>
      <QuickActions o={o} {...qa} />
    </motion.div>
  )
}
