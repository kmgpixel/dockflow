import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Card } from './Card'
import { Count } from './ui'
import { STATUS, today, addDays, hasIssue, advance } from './store'

const fmt = (d) => new Date(d + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

export function Day({ s, date, setDate, onOpen, onProblem, onMenu }) {
  const [q, setQ] = useState(''), [fs, setFs] = useState(null), [fp, setFp] = useState(null)
  const t = today()
  const list = useMemo(() => s.orders.filter((o) => o.date === date && (!fs || o.status === fs) && (!fp || o.prep === fp) &&
    (!q || (o.num + o.client).toLowerCase().includes(q.toLowerCase()))), [s.orders, date, fs, fp, q])
  const all = s.orders.filter((o) => o.date === date && o.status !== 'cancel')
  const n = (f) => all.filter(f).length
  const k = [['À préparer', n((o) => ['todo', 'prep', 'wait'].includes(o.status))], ['Prêtes', n((o) => ['ready', 'loaded'].includes(o.status))],
    ['Parties', n((o) => ['go', 'done'].includes(o.status))], ['Problèmes', n(hasIssue)]]
  const seg = [['#9a9ea6', n((o) => o.status === 'todo')], ['#2f6fdb', n((o) => ['prep', 'wait'].includes(o.status))], ['#1f9d6b', n((o) => o.status === 'ready')], ['#0e8f9a', n((o) => o.status === 'loaded')], ['#16181b', n((o) => ['go', 'done'].includes(o.status))]]
  const days = [[t, 'Auj.'], [addDays(t, 1), 'Demain'], [addDays(t, 2), 'J+2']]
  const custom = !days.some((d) => d[0] === date)
  const [x0, setX0] = useState(null)
  const sw = (dx) => { if (Math.abs(dx) > 70) setDate(addDays(date, dx < 0 ? 1 : -1)) }
  return (
    <div onTouchStart={(e) => setX0([e.touches[0].clientX, e.touches[0].clientY])}
      onTouchEnd={(e) => { if (x0 && Math.abs(e.changedTouches[0].clientY - x0[1]) < 40) sw(e.changedTouches[0].clientX - x0[0]) }}>
      <div className="top">
        <div className="row"><span className="brand"><i />DOCKFLOW</span></div>
        <h1>{date === t ? "Aujourd'hui" : date === addDays(t, 1) ? 'Demain' : 'Livraisons'}</h1>
        <div className="sub" style={{ textTransform: 'capitalize' }}>{fmt(date)} · {all.length} commande{all.length > 1 ? 's' : ''}</div>
        <div className="days">
          {days.map(([d, l]) => <button key={d} className={d === date ? 'on' : ''} onClick={() => setDate(d)}>{l}</button>)}
          <label className={'days-cal'} style={{ flex: 1, position: 'relative' }}>
            <span style={{ display: 'grid', placeItems: 'center', minHeight: 44, borderRadius: 12, fontSize: 13, fontWeight: 600, border: '1px solid var(--line)', background: custom ? 'var(--ink)' : 'var(--card)', color: custom ? 'var(--bg)' : 'var(--mut)' }}>📅 {custom ? date.slice(5) : ''}</span>
            <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0 }} aria-label="Calendrier" />
          </label>
        </div>
      </div>
      <div className="kpi">{k.map(([l, v], i) => <div key={l} className={i === 3 && v ? 'bad' : ''}><strong><Count value={v} /></strong><span>{l}</span></div>)}</div>
      <div className="bar">{seg.map(([c, v], i) => <i key={i} style={{ flex: v, background: c }} />)}</div>
      <div className="search"><input placeholder="Rechercher n° ou client" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="filters">
        {Object.entries(STATUS).slice(0, 5).map(([k2, v]) => <button key={k2} className={'chip' + (fs === k2 ? ' on' : '')} onClick={() => setFs(fs === k2 ? null : k2)}>{v.l}</button>)}
        {s.team.preps.filter((p) => p.on).map((p) => <button key={p.id} className={'chip' + (fp === p.id ? ' on' : '')} onClick={() => setFp(fp === p.id ? null : p.id)}>{p.name.split(' ')[0]}</button>)}
      </div>
      <div className="sec"><span>Commandes</span><span style={{ fontFamily: 'var(--mono)' }}>{list.length}</span></div>
      <div className="list">
        <AnimatePresence initial={false} mode="popLayout">
          {list.map((o) => <Card key={o.id} o={o} team={s.team} onOpen={onOpen} onProblem={onProblem} onMenu={onMenu} onAdvance={advance} />)}
        </AnimatePresence>
        {!list.length && <motion.div className="meta" style={{ textAlign: 'center', padding: 30 }}>Aucune commande. Touchez + pour en ajouter.</motion.div>}
      </div>
    </div>
  )
}
