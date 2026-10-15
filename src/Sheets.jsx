import { useState } from 'react'
import { Sheet, compress, toast } from './ui'
import { STATUS, addOrder, addProblem, upd, setStatus, postpone, nameOf, hhmm, addDays, today, getState } from './store'
import { orderPdf, deliver } from './pdf'

const act = (st) => st.preps.filter((p) => p.on)

export function AddSheet({ open, onClose, team, date }) {
  const [f, setF] = useState({ num: '', client: '', date, prep: '' })
  const s = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const ok = f.num.trim() && f.client.trim()
  return (
    <Sheet open={open} onClose={onClose}>
      <h2>Nouvelle commande</h2>
      <input placeholder="N° (ex. C-2420)" value={f.num} onChange={s('num')} aria-label="Numéro" />
      <input placeholder="Client / ville" value={f.client} onChange={s('client')} aria-label="Client" />
      <input type="date" value={f.date} onChange={s('date')} aria-label="Date de livraison" />
      <select value={f.prep} onChange={s('prep')} aria-label="Préparateur"><option value="">Préparateur (optionnel)</option>
        {act({ preps: team.preps }).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <input type="number" inputMode="numeric" placeholder="Palettes (1)" value={f.pallets || ''} onChange={s('pallets')} />
      <button className="btn acc" disabled={!ok} style={{ opacity: ok ? 1 : 0.4 }}
        onClick={() => { addOrder(f); toast('Commande ajoutée'); setF({ num: '', client: '', date, prep: '' }); onClose() }}>Ajouter</button>
    </Sheet>
  )
}

export function ProblemSheet({ o, onClose }) {
  const [prod, setProd] = useState(''), [q, setQ] = useState('1'), [err, setErr] = useState(false), [note, setNote] = useState(''), [ph, setPh] = useState([])
  const reset = () => { setProd(''); setQ('1'); setErr(false); setNote(''); setPh([]) }
  const can = prod.trim() || err
  return (
    <Sheet open={!!o} onClose={onClose}>
      <h2>Signaler un problème</h2>
      <div className="meta">{o?.num} · {o?.client}</div>
      <div className="lbl">Produit manquant</div>
      <div className="btns"><input style={{ flex: 3 }} placeholder="Produit" value={prod} onChange={(e) => setProd(e.target.value)} aria-label="Produit" />
        <input style={{ flex: 1, minWidth: 70 }} type="number" inputMode="numeric" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Quantité" /></div>
      <button className={'btn ' + (err ? 'bad' : 'ghost')} onClick={() => setErr(!err)}>{err ? '✓ ' : ''}Erreur de préparation</button>
      {err && <textarea placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />}
      <label className="btn ghost" style={{ display: 'grid', placeItems: 'center' }}>📷 Ajouter une photo ({ph.length})
        <input type="file" accept="image/*" capture="environment" hidden data-photo
          onChange={async (e) => { const f = e.target.files[0]; if (f) setPh([...ph, await compress(f)]) }} /></label>
      <button className="btn acc" disabled={!can} style={{ opacity: can ? 1 : 0.4 }} onClick={() => {
        addProblem(o.id, { missing: prod.trim() ? [{ produit: prod.trim(), qte: +q || 1 }] : [], err, errNote: note, photos: ph }); reset(); onClose()
      }}>Enregistrer</button>
    </Sheet>
  )
}

export function MenuSheet({ o, onClose, team, onPostpone }) {
  const [pick, setPick] = useState(false)
  const close = () => { setPick(false); onClose() }
  return (
    <Sheet open={!!o} onClose={close}>
      <h2>{o?.num}</h2>
      {!pick ? (<>
        <button className="opt" onClick={() => { setStatus(o.id, 'wait'); close() }}>⏳ Attente accord client</button>
        <button className="opt" onClick={() => { onPostpone(o); close() }}>📅 Reporter…</button>
        <button className="opt" onClick={() => setPick(true)}>👤 Changer de préparateur</button>
        <button className="opt" style={{ color: 'var(--bad)' }} onClick={() => { setStatus(o.id, 'cancel'); close() }}>✕ Annuler la commande</button>
      </>) : act(team).map((p) => <button key={p.id} className="opt" onClick={() => { upd(o.id, (x) => ({ ...x, prep: p.id }), 'Préparateur → ' + p.name); close() }}>{p.name}</button>)}
    </Sheet>
  )
}

export function PostponeSheet({ o, onClose }) {
  const [d, setD] = useState(addDays(today(), 1))
  return (
    <Sheet open={!!o} onClose={onClose}>
      <h2>Reporter {o?.num}</h2>
      <input type="date" value={d} onChange={(e) => setD(e.target.value)} aria-label="Nouvelle date" />
      <button className="btn acc" onClick={() => { postpone(o.id, d); toast('Reportée au ' + d); onClose() }}>Reporter</button>
    </Sheet>
  )
}

export function DetailSheet({ o, onClose, team }) {
  const [edit, setEdit] = useState(null)
  if (!o) return <Sheet open={false} />
  const e = edit || o
  const save = () => { upd(o.id, (x) => ({ ...x, ...edit }), 'Fiche modifiée'); setEdit(null) }
  const set = (k) => (ev) => setEdit({ ...e, [k]: ev.target.value })
  return (
    <Sheet open onClose={() => { setEdit(null); onClose() }}>
      <div className="row"><span className="num">{o.num}</span><span className="st" style={{ '--s': STATUS[o.status].c, padding: '6px 10px', borderRadius: 99, color: '#fff', background: STATUS[o.status].c, fontSize: 12, fontWeight: 700 }}>{STATUS[o.status].l}</span></div>
      <label><span className="flab">Client / ville</span><input value={e.client} onChange={set('client')} aria-label="Client" /></label>
      <div className="btns"><label style={{ flex: 1 }}><span className="flab">Palettes</span><input type="number" inputMode="numeric" value={e.pallets} onChange={set('pallets')} aria-label="Palettes" /></label><label style={{ flex: 1 }}><span className="flab">Colis</span><input type="number" inputMode="numeric" value={e.parcels} onChange={set('parcels')} aria-label="Colis" /></label></div>
      <span className="flab" style={{ marginBottom: -8 }}>Préparateur</span><select value={e.prep || ''} onChange={set('prep')} aria-label="Préparateur"><option value="">Sans préparateur</option>{act(team).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <textarea placeholder="Commentaire" value={e.comment} onChange={set('comment')} />
      {edit && <button className="btn acc" onClick={save}>Enregistrer</button>}
      {o.photos.length > 0 && <div className="photos">{o.photos.map((p, i) => <img key={i} src={p} alt="" />)}</div>}
      <div className="lbl">Chronologie</div>
      <div className="tl">{[...o.history].reverse().map((h, i) => <div key={i}><b>{hhmm(h.ts)}</b> {h.action} <span className="meta">· {h.by}</span></div>)}</div>
      <button className="btn ghost" onClick={async () => deliver(await orderPdf(getState(), o), 'fiche-' + o.num + '.pdf')}>Exporter la fiche PDF</button>
    </Sheet>
  )
}
