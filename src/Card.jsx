import { memo, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { STATUS, NEXT, hasIssue, resolve } from './store'
import { formatPack, where, formatPackUI } from './pack'
import { prepName } from './people'
import { fmtDM } from './dates'

const SNAP = { type: 'spring', stiffness: 900, damping: 50 }

function CardBase({ o, team, onOpen, onProblem, onMenu, onAdvance }) {
  const st = STATUS[o.status]
  const x = useMotionValue(0)
  const bgR = useTransform(x, [0, 70], [0, 1])
  const bgL = useTransform(x, [-70, 0], [1, 0])
  const lp = useRef(null), moved = useRef(false), start = useRef([0, 0]), dragging = useRef(false)
  const issue = hasIssue(o), nxt = NEXT[o.status]
  const stop = () => clearTimeout(lp.current)
  const end = (_, i) => {
    stop(); dragging.current = false
    if ((i.offset.x > 70 || i.velocity.x > 500) && i.offset.x > 10 && nxt) onAdvance(o)
    else if ((i.offset.x < -70 || i.velocity.x < -500) && i.offset.x < -10) onProblem(o)
    animate(x, 0, SNAP)
  }
  const pack = formatPackUI(o)
  const col = issue ? 'var(--bad)' : st.c
  return (
    <motion.div layout={dragging.current ? false : 'position'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.14 }}
      className={'swipe' + (o.status === 'cancel' ? ' cancel' : '')} style={{ background: 'var(--card)' }} data-card={o.num}>
      <div className="under">
        <motion.span style={{ opacity: bgR, background: nxt ? STATUS[nxt].c : 'transparent', position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: 20 }}>
          {nxt ? '→ ' + (nxt === 'ready' ? 'Fin de préparation' : STATUS[nxt].l) : ''}
        </motion.span>
        <motion.span style={{ opacity: bgL, background: 'var(--bad)', position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 20 }}>
          Signaler un problème
        </motion.span>
      </div>
      <motion.div className="c" style={{ x, '--s': col }} drag="x" dragDirectionLock dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12} dragMomentum={false}
        onDragStart={() => { moved.current = true; dragging.current = true; stop() }} onDragEnd={end}
        onPointerDown={(e) => { moved.current = false; start.current = [e.clientX, e.clientY]; lp.current = setTimeout(() => { if (!moved.current) onMenu(o) }, 450) }}
        onPointerMove={(e) => { if (Math.hypot(e.clientX - start.current[0], e.clientY - start.current[1]) > 8) stop() }}
        onPointerUp={stop} onPointerCancel={stop}
        onClick={() => { if (!moved.current) onOpen(o) }} onContextMenu={(e) => e.preventDefault()}>
        <div className="cli">{o.client}</div>
        <div className="st">{issue ? 'Problème' : st.l}</div>
        <div className="where">{where(o) || 'Ville non renseignée'}{o.status === 'moved' ? ' · → ' + fmtDM(o.date) : ''}</div>
        <div className="num">{o.num}</div>
        <div className="meta">{[prepName(team, o.prep), pack, o.dock && team.docks.find((d) => d.id === o.dock)?.name, o.driver && team.drivers.find((d) => d.id === o.driver)?.name].filter(Boolean).join(' · ')}</div>
        {issue ? (
          <div className="flag">
            <span>{[...o.missing.map((m) => m.qte + ' × ' + m.produit + ' manquant'), o.err && 'Erreur de préparation'].filter(Boolean).join(' · ')}</span>
            <button onClick={(e) => { e.stopPropagation(); resolve(o.id) }} onPointerDown={(e) => e.stopPropagation()}>Résolu</button>
          </div>
        ) : (
          <div className="prog">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < st.p ? 'f' : ''} />)}</div>
        )}
      </motion.div>
    </motion.div>
  )
}
export const Card = memo(CardBase)
