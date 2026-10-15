import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, animate } from 'motion/react'

export const spring = { type: 'spring', stiffness: 380, damping: 36 }

export function Sheet({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="ov" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div className="sheet" role="dialog" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={spring}
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }} dragListener={false}
            onDragEnd={(e, i) => { if (i.offset.y > 120 || i.velocity.y > 600) onClose() }}
            dragControls={undefined} data-sheet>
            <SheetGrab onClose={onClose} />
            <div className="sb">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// La poignée permet de glisser vers le bas pour fermer
function SheetGrab({ onClose }) {
  const y0 = useRef(null)
  return (
    <div className="grab" onClick={onClose}
      onPointerDown={(e) => { y0.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId) }}
      onPointerUp={(e) => { if (y0.current != null && e.clientY - y0.current > 60) onClose(); y0.current = null }}>
      <i />
    </div>
  )
}

export function Count({ value }) {
  const [v, setV] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const c = animate(prev.current, value, { duration: 0.6, onUpdate: (x) => setV(Math.round(x)) })
    prev.current = value
    return () => c.stop()
  }, [value])
  return <>{v}</>
}

let toastFn = () => {}
export const toast = (m, undo) => toastFn(m, undo)
export function Toaster() {
  const [m, setM] = useState(null)
  const tm = useRef(null)
  useEffect(() => { toastFn = (x, undo) => { clearTimeout(tm.current); setM({ x, undo }); tm.current = setTimeout(() => setM(null), undo ? 5000 : 2200) } }, [])
  return <AnimatePresence>{m && <motion.div key={m.x} className="toast" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>
    <span>{m.x}</span>{m.undo && <button className="undo" data-undo onClick={() => { clearTimeout(tm.current); setM(null); m.undo() }}>Annuler</button>}</motion.div>}</AnimatePresence>
}

export const Icon = ({ n }) => {
  const p = {
    day: 'M4 5h16v15H4zM4 10h16M9 3v4M15 3v4',
    truck: 'M2 6h12v10H2zM14 10h4l3 3v3h-7M6 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z',
    team: 'M9 11a3 3 0 100-6 3 3 0 000 6zM3 20c0-3 3-5 6-5s6 2 6 5M17 8a3 3 0 010 6M21 20c0-2-1-4-3-4.5',
    cal: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4M8 14h2M12 14h2M16 14h.01',
    back: 'M15 5l-7 7 7 7',
    stats: 'M5 20V11M12 20V4M19 20v-6',
    set: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12l2-1-2-4-2 1-2-1-1-2H9L8 7 6 8 4 7l-2 4 2 1v2l-2 1 2 4 2-1 2 1 1 2h4l1-2 2-1 2 1 2-4-2-1z',
  }[n]
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={p} /></svg>
}

export async function compress(file) {
  const url = await new Promise((r) => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(file) })
  const img = await new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = j; i.src = url })
  const k = Math.min(1, 1280 / Math.max(img.width, img.height))
  const c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.7)
}
