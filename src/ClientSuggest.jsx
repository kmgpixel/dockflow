import { getState } from './store'

// Jusqu'à 4 clients déjà connus (plus récents d'abord, sans doublons)
export function knownClients(q) {
  const seen = new Set(), out = []
  const os = [...getState().orders].map((o, i) => [o, i]).sort((a, b) => (b[0].date || '').localeCompare(a[0].date || '') || b[1] - a[1])
  const n = q.trim().toLowerCase()
  for (const [o] of os) {
    const k = (o.client || '').trim().toLowerCase()
    if (!k || seen.has(k) || k === n || (n && !k.includes(n))) continue
    seen.add(k); out.push({ client: o.client.trim(), city: (o.city || '').trim() })
    if (out.length === 4) break
  }
  return out
}

export function ClientSuggest({ q, onPick }) {
  const list = knownClients(q)
  if (!list.length) return null
  return (
    <div className="suggest" role="listbox" aria-label="Clients connus">
      {list.map((c) => <button key={c.client} type="button" role="option" className="chip" data-suggest={c.client} onClick={() => onPick(c)}>{c.client}{c.city ? <small> · {c.city}</small> : null}</button>)}
    </div>
  )
}
