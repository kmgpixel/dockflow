import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { alerts, worst } from './calcAlerts'

const SP = { type: 'spring', stiffness: 600, damping: 42 }

// Une ligne repliée ; le texte des alertes reste dans le DOM (hauteur 0, inerte)
export function Alerts({ s, onOpen }) {
  const [open, setOpen] = useState(false)
  const a = alerts(s)
  if (!a.length) return null
  const sev = worst(a)
  return (
    <section className="alr" data-alerts-section>
      <button className="alr-t" data-alerts-toggle aria-expanded={open} onClick={() => setOpen(!open)}>
        <i className={'sev' + (sev === 'red' ? ' red' : '')} />
        <span><span data-alertcount>{a.length}</span> à relancer</span>
        <motion.span className="chev" animate={{ rotate: open ? 90 : 0 }} transition={SP}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </motion.span>
      </button>
      <motion.div className="alr-b" initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} transition={SP} inert={!open}>
        <div className="list" data-alerts>
          <AnimatePresence initial={false}>{a.map((x) => (
            <motion.button key={x.o.id + x.kind} className="alert" onClick={() => onOpen(x.o)} exit={{ x: 60, opacity: 0, transition: { duration: 0.2 } }}>
              <span className="num">{x.o.num}</span><span className="cli2">{x.o.client + ' · ' + (x.o.city || '')}</span>
              <span className="why"><i className={'sev' + (x.sev === 'red' ? ' red' : '')} />{x.txt}</span>
            </motion.button>))}</AnimatePresence>
        </div>
      </motion.div>
    </section>)
}
