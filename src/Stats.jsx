import { addDays, today, nameOf } from './store'
import { Icon } from './ui'

const jl = (d) => new Date(d + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')

function Rows({ rows, unit }) {
  const mx = Math.max(1, ...rows.map((r) => r[1]))
  return rows.map(([n, v]) => (
    <div key={n} className="hrow"><span>{n}</span><i><b style={{ width: (v / mx) * 100 + '%' }} /></i><em>{v}</em></div>))
}

export function Stats({ s, onBack }) {
  const t = today(), days = [6, 5, 4, 3, 2, 1, 0].map((k) => addDays(t, -k))
  const wk = s.orders.filter((o) => o.date >= days[0] && o.date <= t)
  const per = days.map((d) => ({ d, ok: wk.filter((o) => o.date === d && o.status === 'done').length, ko: wk.filter((o) => o.date === d && o.status === 'fail').length }))
  const mx = Math.max(1, ...per.map((p) => p.ok + p.ko))
  const preps = s.team.preps.map((p) => { const os = wk.filter((o) => o.prep === p.id); return [p.name, os.filter((o) => o.err).length, os.reduce((a, o) => a + o.missing.length, 0)] })
  const drv = s.team.drivers.map((d) => [d.name, wk.filter((o) => o.driver === d.id && o.status === 'fail').length])
  const tot = (f) => wk.filter(f).length
  return (
    <div data-stats>
      <div className="top"><button className="back" onClick={onBack} aria-label="Retour"><Icon n="back" />Retour</button><h1>Statistiques</h1>
        <div className="sub">7 derniers jours · {tot(() => true)} commandes (aujourd'hui inclus)</div></div>
      <div className="sec"><span>Livrées / non livrées par jour</span></div>
      <div className="list" style={{ paddingBottom: 0 }}><div className="card">
        <div className="bars">{per.map((p) => (
          <div key={p.d} className="bcol"><em>{p.ok + p.ko}</em>
            <div className="stack" style={{ height: ((p.ok + p.ko) / mx) * 90 }}><i style={{ flex: p.ko, background: 'var(--bad)' }} /><i style={{ flex: p.ok, background: 'var(--ready)' }} /></div>
            <span>{jl(p.d)}</span></div>))}</div>
        <div className="meta"><b className="num">{tot((o) => o.status === 'done')}</b> livrées · <b className="num" style={{ color: 'var(--bad)' }}>{tot((o) => o.status === 'fail')}</b> non livrées</div>
      </div></div>
      <div className="sec"><span>Erreurs de préparation par préparateur</span></div>
      <div className="list" style={{ paddingBottom: 0 }}><div className="card"><Rows rows={preps.map((p) => [p[0], p[1]])} /></div></div>
      <div className="sec"><span>Manquants par préparateur</span></div>
      <div className="list" style={{ paddingBottom: 0 }}><div className="card"><Rows rows={preps.map((p) => [p[0], p[2]])} /></div></div>
      <div className="sec"><span>Non livrées par livreur</span></div>
      <div className="list"><div className="card"><Rows rows={drv} /></div></div>
    </div>
  )
}
