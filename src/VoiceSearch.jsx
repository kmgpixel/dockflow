import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

// Normalise une dictée : « so l 1003 » -> « SO-L1003 » ; renvoie { v, num }
export function normVoice(raw) {
  const t = String(raw || '').trim()
  const c = t.replace(/[\s.\-_]+/g, '').toUpperCase()
  const m = c.match(/^(SO)([A-Z]?\d{2,})$/)
  if (m) return { v: 'SO-' + m[2], num: true }
  if (/^\d{3,}$/.test(c)) return { v: c, num: true }
  return { v: t, num: false }
}
if (typeof window !== 'undefined') window.__normVoice = (x) => normVoice(x).v

const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

export function VoiceSearch({ q, setQ }) {
  const [on, setOn] = useState(false), [help, setHelp] = useState(false)
  const inp = useRef(), rec = useRef()
  const start = () => {
    if (on) { rec.current?.stop(); return }
    if (!SR) { setHelp(true); inp.current?.focus(); setTimeout(() => setHelp(false), 5000); return }
    try {
      const r = new SR(); rec.current = r; r.lang = 'fr-FR'; r.interimResults = false; r.maxAlternatives = 1
      r.onresult = (e) => setQ(normVoice(e.results[0][0].transcript).v)
      r.onend = () => setOn(false)
      r.onerror = () => { setOn(false); setHelp(true); inp.current?.focus(); setTimeout(() => setHelp(false), 5000) }
      r.start(); setOn(true)
    } catch { setOn(false); setHelp(true); inp.current?.focus() }
  }
  return (<>
    <div className="vs">
      <input ref={inp} inputMode="search" enterKeyHint="search" placeholder="Rechercher n°, client ou ville" value={q} onChange={(e) => setQ(e.target.value)}
        onBlur={(e) => { const n = normVoice(e.target.value); if (n.num && n.v !== e.target.value) setQ(n.v) }} />
      <button className={'mic' + (on ? ' on' : '')} data-voice aria-label="Recherche vocale" onClick={start}>
        {on && <span className="mic-ring" />}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" /></svg>
      </button>
    </div>
    <AnimatePresence>{help && <motion.div className="meta vs-help" data-voice-help initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>Touchez le micro du clavier pour dicter</motion.div>}</AnimatePresence>
  </>)
}
