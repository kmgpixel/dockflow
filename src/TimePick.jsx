import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const QT = ['08:00', '10:00', '14:00']
const SLOTS = Array.from({ length: 13 }, (_, i) => String(i + 6).padStart(2, '0') + ':00')
const lab = (t) => +t.slice(0, 2) + 'h' + t.slice(3)

// Heure : trois raccourcis + « Autre… » qui déplie une grille de créneaux pile
export function TimePick({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const custom = value && !QT.includes(value)
  return (
    <div><span className="flab">Heure de livraison</span>
      <div className="strip">
        {QT.map((t) => <button key={t} type="button" className={'big' + (value === t ? ' on' : '')} data-time={t} onClick={() => { setOpen(false); onChange(value === t ? '' : t) }}>{lab(t)}</button>)}
        <button type="button" className={'big' + (custom || open ? ' on' : '')} data-time-other aria-expanded={open} onClick={() => setOpen(!open)}>{custom ? lab(value) : 'Autre…'}</button>
      </div>
      <AnimatePresence initial={false}>{open && (
        <motion.div className="slots" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 600, damping: 40 }}>
          <div className="slots-in">{SLOTS.map((t) => <button key={t} type="button" className={'chip' + (value === t ? ' on' : '')} data-slot={t} onClick={() => { onChange(t); setOpen(false) }}>{lab(t)}</button>)}</div>
        </motion.div>)}
      </AnimatePresence>
      <input type="time" className="strip-date off" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Heure libre" />
    </div>
  )
}
