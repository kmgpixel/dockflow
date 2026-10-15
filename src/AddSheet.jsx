import { useState } from 'react'
import { Sheet, toast } from './ui'
import { addOrder, addDays, today } from './store'

const mk = () => ({ num: 'SO-L', client: '', city: '', date: addDays(today(), 1), time: '', prep: '' })
const QT = ['08:00', '10:00', '14:00']

export function AddSheet({ open, onClose, team }) {
  const [f, setF] = useState(mk)
  const s = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const ok = f.num.trim().length > 0 && f.num.trim() !== 'SO-L' && f.client.trim() && f.city.trim() && f.date
  const endCur = (e) => { const el = e.target; setTimeout(() => el.setSelectionRange(el.value.length, el.value.length), 0) }
  return (
    <Sheet open={open} onClose={onClose}>
      <h2>Nouvelle commande</h2>
      <label><span className="flab">N° de commande</span><input value={f.num} onChange={s('num')} onFocus={endCur} aria-label="Numéro" autoCapitalize="characters" /></label>
      <label><span className="flab">Client</span><input placeholder="Nom du client" value={f.client} onChange={s('client')} aria-label="Client" /></label>
      <label><span className="flab">Ville</span><input placeholder="Ville de livraison" value={f.city} onChange={s('city')} aria-label="Ville" /></label>
      <label><span className="flab">Date de livraison</span><input type="date" value={f.date} onChange={s('date')} aria-label="Date de livraison" /></label>
      <div><span className="flab">Heure de livraison</span>
        <div className="btns" style={{ flexWrap: 'nowrap' }}>
          {QT.map((t) => <button key={t} type="button" className={'big' + (f.time === t ? ' on' : '')} data-time={t} onClick={() => setF({ ...f, time: f.time === t ? '' : t })}>{+t.slice(0, 2) + 'h00'}</button>)}
          <input type="time" value={f.time} onChange={s('time')} aria-label="Heure libre" style={{ flex: 1.3, minHeight: 52 }} />
        </div></div>
      <label><span className="flab">Préparateur (optionnel)</span><select value={f.prep} onChange={s('prep')} aria-label="Préparateur"><option value="">Aucun pour l'instant</option>
        {team.preps.filter((p) => p.on).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <button className="btn acc" disabled={!ok} data-submit onClick={() => { addOrder(f); toast('Commande ajoutée'); setF(mk()); onClose() }}>Ajouter</button>
    </Sheet>
  )
}
