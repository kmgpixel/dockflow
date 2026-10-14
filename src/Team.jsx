import { useState } from 'react'
import { editTeam, setTheme, replaceAll, resetDemo, loadDemo, getState, uid } from './store'
import { reportPdf, deliver } from './pdf'
import { toast } from './ui'

function Group({ title, kind, list }) {
  const [n, setN] = useState('')
  return (<>
    <div className="sec"><span>{title}</span></div>
    <div className="list">
      {list.map((p) => (
        <div key={p.id} className="card" style={{ flexDirection: 'row', alignItems: 'center', opacity: p.on ? 1 : 0.5 }}>
          <input defaultValue={p.name} aria-label={'Nom ' + p.name} onBlur={(e) => e.target.value.trim() && editTeam(kind, (l) => l.map((x) => (x.id === p.id ? { ...x, name: e.target.value.trim() } : x)))} />
          <button className="chip" onClick={() => editTeam(kind, (l) => l.map((x) => (x.id === p.id ? { ...x, on: !x.on } : x)))}>{p.on ? 'Actif' : 'Inactif'}</button>
        </div>))}
      <div className="btns"><input placeholder="Ajouter…" value={n} onChange={(e) => setN(e.target.value)} style={{ flex: 3 }} />
        <button className="btn acc" style={{ flex: 1, minWidth: 80 }} onClick={() => { if (n.trim()) { editTeam(kind, (l) => [...l, { id: uid(), name: n.trim(), on: true }]); setN('') } }}>+</button></div>
    </div></>)
}

export function Team({ s, date }) {
  const day = s.orders.filter((o) => o.date === date)
  return (
    <div>
      <div className="top"><span className="brand"><i />DOCKFLOW</span><h1>Équipe</h1></div>
      <div className="sec"><span>Qui a préparé quoi</span></div>
      <div className="list"><div className="card">
        {s.team.preps.filter((p) => p.on).map((p) => { const os = day.filter((o) => o.prep === p.id); return (
          <div key={p.id} className="row"><b>{p.name}</b><span className="meta">{os.length ? os.map((o) => o.num).join(', ') : '—'}</span></div>) })}
      </div></div>
      <Group title="Préparateurs" kind="preps" list={s.team.preps} />
      <Group title="Livreurs" kind="drivers" list={s.team.drivers} />
      <Group title="Quais" kind="docks" list={s.team.docks} />
    </div>
  )
}

export function Settings({ s, date }) {
  const backup = async () => {
    const blob = new Blob([JSON.stringify(getState())], { type: 'application/json' })
    const file = new File([blob], 'dockflow-sauvegarde.json', { type: 'application/json' })
    try { if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file] }); return } } catch (e) { if (e.name === 'AbortError') return }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click()
  }
  const restore = async (e) => {
    try { const j = JSON.parse(await e.target.files[0].text()); if (!j.orders || !j.team) throw 0; replaceAll(j); toast('Données restaurées') } catch { toast('Fichier invalide') }
  }
  return (
    <div>
      <div className="top"><span className="brand"><i />DOCKFLOW</span><h1>Réglages</h1></div>
      <div className="sec"><span>Thème</span></div>
      <div className="list"><div className="btns">{[['auto', 'Auto'], ['light', 'Clair'], ['dark', 'Sombre']].map(([k, l]) =>
        <button key={k} className={'chip' + (s.theme === k ? ' on' : '')} style={{ flex: 1 }} onClick={() => setTheme(k)}>{l}</button>)}</div></div>
      <div className="sec"><span>Données</span></div>
      <div className="list">
        <button className="btn" data-backup onClick={backup}>Sauvegarder (.json)</button>
        <label className="btn ghost" style={{ display: 'grid', placeItems: 'center' }}>Restaurer…<input type="file" accept="application/json,.json" hidden data-restore onChange={restore} /></label>
        <button className="btn ghost" data-report onClick={() => deliver(reportPdf(getState(), date), 'rapport-' + date + '.pdf')}>Rapport du jour (PDF)</button>
        <button className="btn ghost" onClick={loadDemo}>Recharger les données de démo</button>
        <button className="btn bad" data-clear onClick={() => { if (confirm('Vider toutes les commandes ?')) { resetDemo(); toast('Données vidées') } }}>Vider les données de démo</button>
      </div>
      <div className="sec"><span>À propos</span></div>
      <div className="list"><div className="card meta">DockFlow v1.0 — suivi des livraisons du dépôt. Données stockées uniquement sur cet appareil. Toutes les données de démo sont fictives.</div></div>
    </div>
  )
}
