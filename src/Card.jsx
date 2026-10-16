import { memo, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from 'motion/react'
import { STATUS, NEXT, hasIssue, resolve } from './store'
import { where, formatPack } from './pack'
import { fmtDM } from './dates'
import { StatusIconMorph } from './StatusIcon'
import { CardFlash, buzz } from './Celebrate'
import { Details } from './Details'

const SNAP = { type: 'spring', stiffness: 900, damping: 50 }
const GOOD = (prev, cur) => cur === 'done' || (cur === 'ready' && ['prep', 'wait'].includes(prev))

function CardBase({ o, team, open, hint, noSwipe, onToggle, onOpen, onProblem, onMenu, onAdvance, qa }) {
  const st = STATUS[o.status]
  const x = useMotionValue(0)
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
  // Glissement maison : verrouillage d'axe strict, seuil ~45 % de la carte, pas de déclenchement « coup sec ».
  const g = useRef(null)
  const [armed, setArmed] = useState(0)
  const swipeOn = !noSwipe
  const down = (e) => {
    moved.current = false; start.current = [e.clientX, e.clientY]
    lp.current = setTimeout(() => { if (!moved.current) onMenu(o) }, 450)
    if (swipeOn) g.current = { x0: e.clientX, y0: e.clientY, lock: null, w: e.currentTarget.offsetWidth, id: e.pointerId }
  }
  const move = (e) => {
    const dx = e.clientX - start.current[0], dy = e.clientY - start.current[1]
    if (Math.hypot(dx, dy) > 8) { stop(); moved.current = true }
    const s = g.current; if (!s) return
    if (!s.lock) {
      if (Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) { g.current = null; return } // défilement vertical : on laisse faire
      if (Math.abs(dx) > 16 && Math.abs(dx) > 1.8 * Math.abs(dy)) { s.lock = 'x'; dragging.current = true; try { e.currentTarget.setPointerCapture(s.id) } catch {} }
      else return
    }
    const lim = s.w * 0.42
    let v = dx - Math.sign(dx) * 16
    if (v > 0 && !nxt) v = v * 0.25
    x.set(Math.max(-s.w * 0.7, Math.min(s.w * 0.7, v)))
    const a = v > lim ? 1 : v < -lim ? -1 : 0
    if (a !== armed) { setArmed(a); if (a) buzz(10) }
  }
  const up = () => {
    stop(); const s = g.current; g.current = null
    if (s?.lock) {
      const v = x.get(), lim = s.w * 0.42
      if (v > lim && nxt) onAdvance(o)
      else if (v < -lim) onProblem(o)
      setTimeout(() => { dragging.current = false }, 0)
    }
    setArmed(0); animate(x, 0, SNAP)
  }
  const bgR = useTransform(x, (v) => (v > 0 ? Math.min(1, v / 60) * (armed === 1 ? 1 : 0.55) : 0))
  const bgL = useTransform(x, (v) => (v < 0 ? Math.min(1, -v / 60) * (armed === -1 ? 1 : 0.55) : 0))
  const col = issue ? 'var(--bad)' : st.c
  return (
    <motion.div layout={dragging.current ? false : 'position'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.14 }}
      className={'swipe' + (o.status === 'cancel' ? ' cancel' : '') + (open ? ' open' : '')} style={{ background: "var(--card)" }} data-card={o.num} data-pack={formatPack(o)} title={o.num}>
      <div className="under">
        <motion.span style={{ opacity: bgR, background: nxt ? STATUS[nxt].c : 'transparent', position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: 20 }}>
          {nxt ? (armed === 1 ? 'Relâcher : ' : '→ ') + (nxt === 'ready' ? 'Fin de préparation' : STATUS[nxt].l) : ''}
        </motion.span>
        <motion.span style={{ opacity: bgL, background: 'var(--bad)', position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 20 }}>
          {armed === -1 ? 'Relâcher : problème' : 'Signaler un problème'}
        </motion.span>
      </div>
      <motion.div className="c" style={{ x, '--s': col }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
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
