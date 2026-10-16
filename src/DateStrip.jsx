import { useState } from 'react'
import { addDays, today } from './store'

const LABELS = ['Auj.', 'Demain']
const dm = (d) => d.slice(8, 10) + '/' + d.slice(5, 7)

// Ruban de dates : Auj., Demain, J+2, J+3, Autre… (champ natif conservé, replié)
export function DateStrip({ value, onChange }) {
  const t = today()
  const opts = [0, 1, 2, 3].map((n) => ({ d: addDays(t, n), l: LABELS[n] || 'J+' + n }))
  const known = opts.some((o) => o.d === value)
  const [other, setOther] = useState(false)
  const showOther = other || !known
  return (
    <div>
      <span className="flab">Date de livraison</span>
      <div className="strip" role="group" aria-label="Choix de la date">
        {opts.map((o) => (
          <button key={o.d} type="button" className={'big' + (value === o.d && !other ? ' on' : '')} data-date={o.d}
            onClick={() => { setOther(false); onChange(o.d) }}>
            <span>{o.l}</span><small>{dm(o.d)}</small>
          </button>))}
        <button type="button" className={'big' + (showOther ? ' on' : '')} data-date-other onClick={() => setOther(true)}>
          <span>Autre…</span>{!known && <small>{dm(value)}</small>}
        </button>
      </div>
      <input type="date" className={showOther ? 'strip-date' : 'strip-date off'} value={value} onChange={(e) => e.target.value && onChange(e.target.value)} aria-label="Date de livraison" />
    </div>
  )
}
