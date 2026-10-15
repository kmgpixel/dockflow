import { STATUS } from './store'

export function GlobalSearch({ s, q, date, onOpen }) {
  if (!q.trim()) return null
  const k = q.toLowerCase()
  const r = s.orders.filter((o) => o.date !== date && (o.num + ' ' + o.client).toLowerCase().includes(k)).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 20)
  return (<>
    <div className="sec"><span>Autres jours</span><span style={{ fontFamily: 'var(--mono)' }}>{r.length}</span></div>
    <div className="list" style={{ paddingBottom: 0 }} data-global>
      {r.map((o) => (
        <button key={o.id} className="alert" onClick={() => onOpen(o)}>
          <span className="num">{o.num}</span><span className="cli2">{o.client.split('—').pop().trim()}</span>
          <span className="why" style={{ color: STATUS[o.status].c }}>{new Date(o.date + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} · {STATUS[o.status].l}</span>
        </button>))}
      {!r.length && <div className="meta" style={{ textAlign: 'center', padding: 10 }}>Aucun résultat sur les autres jours.</div>}
    </div></>)
}
