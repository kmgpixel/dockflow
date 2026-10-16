import { useState } from 'react'
import { Sheet, compress, toast } from './ui'
import { duplicateOrder, STATUS, addProblem, upd, setStatus, postpone, nameOf, hhmm, addDays, today, getState } from './store'
import { orderPdf, deliver } from './pdf'
import { formatPack, formatPackUI } from './pack'

const act = (st) => st.preps.filter((p) => p.on)

export function ProblemSheet({ o, onClose }) {
  const [prod, setProd] = useState(''), [q, setQ] = useState('1'), [err, setErr] = useState(false), [note, setNote] = useState(''), [ph, setPh] = useState([])
  const reset = () => { setProd(''); setQ('1'); setErr(false); setNote(''); setPh([]) }
  const can = prod.trim() || err
  return (
    <Sheet open={!!o} onClose={onClose}>
      <h2>Signaler un problème</h2>
      <div className="meta">{o?.client} · {o?.city} · {o?.num}</div>
      <div className="lbl">Produit manquant</div>
      <div className="btns"><input style={{ flex: 3 }} placeholder="Produit" value={prod} onChange={(e) => setProd(e.target.value)} aria-label="Produit" />
        <input style={{ flex: 1, minWidth: 70 }} type="number" inputMode="numeric" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Quantité" /></div>
      <button className={'btn ' + (err ? 'bad' : 'ghost')} onClick={() => setErr(!err)}>{err ? 'Coché · ' : ''}Erreur de préparation</button>
      {err && <textarea placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />}
      <label className="btn ghost" style={{ display: 'grid', placeItems: 'center' }}>Ajouter une photo ({ph.length})
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
        <button className="opt" onClick={() => { setStatus(o.id, 'wait'); close() }}>Attente accord client</button>
        <button className="opt" onClick={() => { onPostpone(o); close() }}>Reporter…</button>
        <button className="opt" data-dup onClick={() => { const n = duplicateOrder(o); toast('Complément créé : ' + n + ' (demain)'); close() }}>Dupliquer (complément)</button>
        <button className="opt" onClick={() => setPick(true)}>Changer de préparateur</button>
        <button className="opt danger" onClick={() => { setStatus(o.id, 'cancel'); close() }}>Annuler la commande</button>
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

export function DetailSheet({ o, onClose, team, onPack, onFinish }) {
  const [edit, setEdit] = useState(null)
  if (!o) return <Sheet open={false} />
  const e = edit || o
  const save = () => { upd(o.id, (x) => ({ ...x, ...edit }), 'Fiche modifiée'); setEdit(null) }
  const set = (k) => (ev) => setEdit({ ...e, [k]: ev.target.value })
  return (
    <Sheet open onClose={() => { setEdit(null); onClose() }}>
      <div className="row"><span className="num">{o.num}</span><span className="st" style={{ '--s': STATUS[o.status].c }}>{STATUS[o.status].l}</span></div>
      <label><span className="flab">Client</span><input value={e.client} onChange={set('client')} aria-label="Client" /></label>
      <div className="btns" style={{ flexWrap: 'nowrap' }}><label style={{ flex: 2 }}><span className="flab">Ville</span><input value={e.city || ''} onChange={set('city')} aria-label="Ville" /></label><label style={{ flex: 1 }}><span className="flab">Heure</span><input type="time" value={e.time || ''} onChange={set('time')} aria-label="Heure" /></label></div>
      <div className="card" data-pack><span className="flab">Conditionnement</span><b>{formatPackUI(o) || 'Pas encore saisi'}</b>
        <div className="btns"><button className="btn ghost" data-editpack onClick={() => { setEdit(null); onClose(); onPack(o) }}>Modifier</button>
          {['prep', 'wait'].includes(o.status) && <button className="btn acc" data-finish onClick={() => { setEdit(null); onClose(); onFinish(o) }}>Fin de préparation</button>}</div></div>
      <span className="flab" style={{ marginBottom: -8 }}>Préparateur</span><select value={e.prep || ''} onChange={set('prep')} aria-label="Préparateur"><option value="">Sans préparateur</option>{act(team).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <textarea placeholder="Commentaire" value={e.comment} onChange={set('comment')} />
      {edit && <button className="btn acc" onClick={save}>Enregistrer</button>}
      {o.from && <div className="meta">Complément de {o.from}</div>}
      {o.photos.length > 0 && <div className="photos">{o.photos.map((p, i) => <img key={i} src={p} alt="" />)}</div>}
      <div className="lbl">Chronologie</div>
      <div className="tl">{[...o.history].reverse().map((h, i) => <div key={i}><b>{hhmm(h.ts)}</b> {h.action} <span className="meta">· {h.by}</span></div>)}</div>
      <button className="btn ghost" onClick={async () => deliver(await orderPdf(getState(), o), 'fiche-' + o.num + '.pdf')}>Exporter la fiche PDF</button>
    </Sheet>
  )
}
