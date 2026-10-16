import { useState } from 'react'
import { editTeam, uid } from './store'

const ini = (n) => n.replace(/\(.*?\)/g, '').trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || '?'
const role = (kind, p) => (kind === 'drivers' ? 'Livreur' : kind === 'docks' ? 'Quai' : p.resp ? 'Responsable' : 'Préparateur')

export function PeopleList({ title, kind, list, orders, edit }) {
  const [n, setN] = useState('')
  const count = (p) => (kind === 'preps' ? orders.filter((o) => o.prep === p.id).length : kind === 'drivers' ? orders.filter((o) => o.driver === p.id).length : null)
  return (<>
    <div className="sec"><span>{title}</span></div>
    <div className="list">
      {list.map((p) => edit ? (
        <div key={p.id} className="person edit" style={{ opacity: p.on ? 1 : 0.55 }}>
          <input defaultValue={p.name} aria-label={'Nom ' + p.name} onBlur={(e) => e.target.value.trim() && editTeam(kind, (l) => l.map((x) => (x.id === p.id ? { ...x, name: e.target.value.trim() } : x)))} />
          {kind === 'preps' && <button className={'chip' + (p.resp ? ' on' : '')} data-resp={p.name} onClick={() => editTeam(kind, (l) => l.map((x) => ({ ...x, resp: x.id === p.id ? !x.resp : false })))}>Resp.</button>}
          <button className="chip" onClick={() => editTeam(kind, (l) => l.map((x) => (x.id === p.id ? { ...x, on: !x.on } : x)))}>{p.on ? 'Actif' : 'Inactif'}</button>
        </div>) : (
        <div key={p.id} className={'person' + (p.on ? '' : ' off')}>
          <span className="avatar" aria-hidden="true">{ini(p.name)}</span>
          <div className="pn"><b>{p.name}</b><span>{role(kind, p)}{p.on ? '' : ' · inactif'}</span></div>
          {count(p) !== null && <div className="cnt"><b>{count(p)}</b>aujourd'hui</div>}
        </div>))}
      {edit && <div className="btns"><input placeholder="Ajouter…" value={n} onChange={(e) => setN(e.target.value)} style={{ flex: 3 }} />
        <button className="btn acc" style={{ flex: 1, minWidth: 80 }} onClick={() => { if (n.trim()) { editTeam(kind, (l) => [...l, { id: uid(), name: n.trim(), on: true }]); setN('') } }}>+</button></div>}
    </div></>)
}
