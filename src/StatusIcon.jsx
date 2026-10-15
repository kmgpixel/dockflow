import { AnimatePresence, motion } from 'motion/react'

const C = <circle cx="12" cy="12" r="8.5" />
const P = {
  todo: <circle cx="12" cy="12" r="8.5" strokeDasharray="2.6 3.1" />,
  prep: <path d="M4 10v8l8 3 8-3v-8M4 10l3-5 5 2 5-2 3 5-8 3z" />,
  wait: <>{C}<path d="M12 7v5l3 2" /></>,
  ready: <>{C}<path d="M8 12.5l3 3 5-6" /></>,
  loaded: <><path d="M2 6h13v10H2zM15 10h3.5l2.5 3v3h-6" /><path d="M5.5 9.5h6v3.5h-6z" /><path d="M5 19.2a1.4 1.4 0 100-.01M17 19.2a1.4 1.4 0 100-.01" /></>,
  go: <><path d="M8 6h8v10H8zM16 9.5h2.5l2.5 3V16h-5M3 9h3M1.5 12.5H6M3 16h3" /><path d="M11 19.2a1.4 1.4 0 100-.01M18 19.2a1.4 1.4 0 100-.01" /></>,
  done: <><circle cx="12" cy="12" r="9" fill="currentColor" /><path d="M8 12.5l3 3 5-6" stroke="#fff" /></>,
  fail: <>{C}<path d="M9 9l6 6M15 9l-6 6" /></>,
  moved: <><path d="M4 6h14v13H4zM4 10h14M8 3v4M14 3v4" /><path d="M9.5 14.5h6M13.5 12.5l2 2-2 2" /></>,
  cancel: <>{C}<path d="M6 6l12 12" /></>,
  issue: <path d="M12 4l9 16H3zM12 10v4.5M12 17.2v.01" />,
}

export function StatusIcon({ k, size = 16 }) {
  return (
    <svg className="sic" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-sic={k}>
      {P[k] || P.todo}
    </svg>
  )
}

// Icône qui se transforme en douceur quand le statut change
export function StatusIconMorph({ k, size = 16 }) {
  return (
    <span className="sicw" style={{ width: size, height: size }}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span key={k} style={{ display: 'flex' }} initial={{ scale: 0.4, opacity: 0, rotate: -25 }} animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.4, opacity: 0, rotate: 25 }} transition={{ type: 'spring', stiffness: 600, damping: 32 }}>
          <StatusIcon k={k} size={size} />
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
