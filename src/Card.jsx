import { memo, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from 'motion/react'
import { STATUS, NEXT, hasIssue, resolve } from './store'
import { where } from './pack'
import { fmtDM } from './dates'
import { StatusIconMorph } from './StatusIcon'
import { CardFlash, buzz } from './Celebrate'
import { Details } from './Details'

const SNAP = { type: 'spring', stiffness: 900, damping: 50 }
const GOOD = (prev, cur) => cur === 'done' || (cur === 'ready' && ['prep', 'wait'].includes(prev))

function CardBase({ o, team, open, hint, onToggle, onOpen, onProblem, onMenu, onAdvance, qa }) {
  const st = STATUS[o.status]
  const x = useMotionValue(0)
  const bgR = useTransform(x, [0, 70], [0, 1])
  const bgL = useTransform(x, [-70, 0], [1, 0])
  const lp = useRef(null), moved = useRef(false), start = useRef([0, 0]), dragging = useRef(false), prev = useRef(o.status)
  const [flash, setFlash] = useState(0)
  const issue = hasIssue(o), nxt = NEXT[o.status]
  useEffect(() => {
    if (prev.current !== o.status && GOOD(prev.current, o.status)) { setFlash((n) => n + 1); buzz([18]); setTimeout(() => setFlash(0), 1200) }
    prev.current = o.status
  }, [o.status])
  useEffect(() => { // démo de glissement, une seule fois
    if (!hint) return
    const a = animate(x, [0, 46, 0], { duration: 0.9, delay: 0.7, ease: 'easeInOut' })
    return () => a.stop()
  }, [hint, x])
  const stop = () => clearTimeout(lp.current)
  const end = (_, i) => {
    stop(); dragging.current = false
    if ((i.offset.x > 70 || i.velocity.x > 500) && i.offset.x > 10 && nxt) onAdvance(o)
    else if ((i.offset.x < -70 || i.velocity.x < -500) && i.offset.x < -10) onProblem(o)
    animate(x, 0, SNAP)
  }
  const col = issue ? 'var(--bad)' : st.c
  return (
    <motion.div layout={dragging.current ? false : 'position'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.14 }}
      className={'swipe' + (o.status === 'cancel' ? ' cancel' : '') + (open ? ' open' : '')} style={{ background: 'var(--card)' }} data-card={o.num}>
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
        onClick={() => { if (!moved.current) onToggle(o.id) }} onContextMenu={(e) => e.preventDefault()} aria-expanded={open}>
        <div className="cli">{o.client}</div>
        <div className="st"><StatusIconMorph k={issue ? 'issue' : o.status} size={16} /><span>{issue ? 'Problème' : st.l}</span></div>
        <div className="where">{where(o) || 'Ville non renseignée'}{o.status === 'moved' ? ' · → ' + fmtDM(o.date) : ''}</div>
        {issue ? (
          <div className="flag">
            <span>{[...o.missing.map((m) => m.qte + ' × ' + m.produit + ' manquant'), o.err && 'Erreur de préparation'].filter(Boolean).join(' · ')}</span>
            <button onClick={(e) => { e.stopPropagation(); resolve(o.id) }} onPointerDown={(e) => e.stopPropagation()}>Résolu</button>
          </div>
        ) : (
          <div className="prog">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < st.p ? 'f' : ''} />)}</div>
        )}
        <AnimatePresence initial={false}>{open && <Details o={o} team={team} qa={{ ...qa, onDetail: onOpen }} />}</AnimatePresence>
      </motion.div>
      <AnimatePresence>{flash > 0 && <CardFlash key={flash} />}</AnimatePresence>
    </motion.div>
  )
}
export const Card = memo(CardBase)
