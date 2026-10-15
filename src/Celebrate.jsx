import { motion, useReducedMotion } from 'motion/react'

export const buzz = (p = 18) => { try { navigator.vibrate?.(p) } catch {} }

// Coche dont le tracé se dessine (pathLength 0 -> 1)
export function Tick({ size = 28, color = '#1f9d6b', delay = 0 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" data-tick>
      <motion.circle cx="12" cy="12" r="9.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.22, delay }} />
      <motion.path d="M7.5 12.5l3 3 6-7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.2, delay: delay + 0.12 }} />
    </svg>
  )
}

// Léger pulse vert + coche sur la carte qui vient de réussir
export function CardFlash() {
  const rm = useReducedMotion()
  return (
    <motion.div className="flash" data-flash initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: rm ? 0.4 : 1.1, times: [0, 0.12, 0.7, 1] }}>
      <motion.i initial={{ opacity: 0 }} animate={{ opacity: [0, 0.22, 0] }} transition={{ duration: 0.7 }} />
      <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 600, damping: 26 }}><Tick size={34} /></motion.span>
    </motion.div>
  )
}
