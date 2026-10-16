import { motion } from 'motion/react'

// Illustrations au trait fin (1.5), couleur --mut
const ART = {
  day: <><rect x="8" y="12" width="40" height="36" rx="5" /><path d="M8 22h40M19 8v8M37 8v8M18 33h8M30 33h8M18 41h8" strokeDasharray="1 5" /></>,
  search: <><circle cx="25" cy="25" r="13" /><path d="M35 35l12 12M19 25h12" /></>,
  truck: <><path d="M6 17h26v22H6zM32 25h9l7 8v6H32" /><circle cx="16" cy="43" r="3.5" /><circle cx="40" cy="43" r="3.5" /></>,
  log: <><rect x="12" y="8" width="32" height="40" rx="5" /><path d="M20 20h16M20 28h16M20 36h9" strokeDasharray="1 5" /></>,
}

export function Empty({ kind, title, text, action, onAction, disabled, ...rest }) {
  return (
    <motion.div className="empty" data-empty={kind} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }} {...rest}>
      <svg viewBox="0 0 56 56" aria-hidden="true">{ART[kind]}</svg>
      <b>{title}</b>
      {text && <p>{text}</p>}
      {action && <button className="btn acc" disabled={disabled} onClick={onAction}>{action}</button>}
    </motion.div>
  )
}
