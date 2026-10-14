import { useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { STATUS, NEXT, nameOf, hasIssue, resolve } from './store'

export function Card({ o, team, onOpen, onProblem, onMenu, onAdvance }) {
  const st = STATUS[o.status]
  const x = useMotionValue(0)
  const bgR = useTransform(x, [0, 100], [0, 1])
  const bgL = useTransform(x, [-100, 0], [1, 0])
  const lp = useRef(null)
  const moved = useRef(false)
  const issue = hasIssue(o)
  const nxt = NEXT[o.status]

  const end = (_, i) => {
    clearTimeout(lp.current)
    if (i.offset.x > 90 && nxt) onAdvance(o)
    else if (i.offset.x < -90) onProblem(o)
    animate(x, 0, { type: 'spring', stiffness: 500, damping: 40 })
  }
  const col = issue ? 'var(--bad)' : st.c
  return (
    <motion.div layout="position" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }} className={'swipe' + (o.status === 'cancel' ? ' cancel' : '')}
      style={{ background: 'var(--card)' }} data-card={o.num}>
      <div className="under">
        <motion.span style={{ opacity: bgR, background: nxt ? STATUS[nxt].c : 'transparent', position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: 20 }}>
          {nxt ? '→ ' + STATUS[nxt].l : ''}
        </motion.span>
        <motion.span style={{ opacity: bgL, background: 'var(--bad)', position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 20 }}>
          Signaler un problème
        </motion.span>
      </div>
      <motion.div className="c" style={{ x, '--s': col }} drag="x" dragDirectionLock dragConstraints={{ left: 0, right: 0 }} dragElastic={0.5}
        onDragStart={() => { moved.current = true; clearTimeout(lp.current) }} onDragEnd={end}
        onPointerDown={() => { moved.current = false; lp.current = setTimeout(() => { if (!moved.current) onMenu(o) }, 550) }}
        onPointerUp={() => clearTimeout(lp.current)} onPointerCancel={() => clearTimeout(lp.current)}
        onClick={() => { if (!moved.current) onOpen(o) }}
        onContextMenu={(e) => e.preventDefault()}>
        <div className="num">{o.num}{o.date && o.status === 'moved' ? ' · → ' + o.date : ''}</div>
        <div className="st">{issue ? 'Problème' : st.l}</div>
        <div className="cli">{o.client}</div>
        <div className="meta">{[nameOf(team.preps, o.prep) === '—' ? 'Sans préparateur' : nameOf(team.preps, o.prep), o.pallets + ' pal.', o.parcels + ' colis', o.dock && nameOf(team.docks, o.dock), o.driver && nameOf(team.drivers, o.driver)].filter(Boolean).join(' · ')}</div>
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
