import { motion } from 'motion/react'
import { Icon } from './ui'

const SP = { type: 'spring', stiffness: 600, damping: 40 }
const TABS = [['day', 'Jour'], ['truck', 'Camions'], ['plus'], ['team', 'Équipe'], ['set', 'Réglages']]

export function Tabbar({ tab, setTab, onAdd, hidden }) {
  return (
    <motion.nav className="tabbar" initial={false} animate={{ y: hidden ? 130 : 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
      {TABS.map(([k, l]) => {
        if (k === 'plus') return <button key={k} className="plus" aria-label="Ajouter une commande" data-add onClick={onAdd}>+</button>
        const on = tab === k || (k === 'team' && tab === 'stats')
        return (
          <button key={k} className={on ? 'on' : ''} onClick={() => setTab(k)}>
            {on && <motion.i layoutId="tabdot" className="tabdot" transition={SP} />}
            <Icon n={k} />{l}
          </button>)
      })}
    </motion.nav>)
}
