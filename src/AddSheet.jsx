import { useState } from 'react'
import { Sheet, toast } from './ui'
import { addOrder, addDays, today } from './store'
import { DateStrip } from './DateStrip'
import { TimePick } from './TimePick'
import { ClientSuggest } from './ClientSuggest'

const mk = () => ({ num: 'SO-L', client: '', city: '', date: addDays(today(), 1), time: '', prep: '' })

export function AddSheet({ open, onClose, team }) {
  const [f, setF] = useState(mk)
  const s = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const miss = [(!f.num.trim() || f.num.trim() === 'SO-L') && 'numéro', !f.client.trim() && 'client', !f.city.trim() && 'ville', !f.date && 'date'].filter(Boolean)
  const ok = miss.length === 0
  const endCur = (e) => { const el = e.target; setTimeout(() => el.setSelectionRange(el.value.length, el.value.length), 0) }
  return (
    <Sheet open={open} onClose={onClose}>
      <h2>Nouvelle commande</h2>
      <label><span className="flab">N° de commande</span><input value={f.num} onChange={s('num')} onFocus={endCur} aria-label="Numéro" autoCapitalize="characters" /></label>
      <div><label><span className="flab">Client</span><input placeholder="Nom du client" value={f.client} onChange={s('client')} aria-label="Client" /></label>
        <ClientSuggest q={f.client} onPick={(c) => setF({ ...f, client: c.client, city: c.city || f.city })} /></div>
      <label><span className="flab">Ville</span><input placeholder="Ville de livraison" value={f.city} onChange={s('city')} aria-label="Ville" /></label>
      <DateStrip value={f.date} onChange={(d) => setF({ ...f, date: d })} />
      <TimePick value={f.time} onChange={(t) => setF({ ...f, time: t })} />
      <label><span className="flab">Préparateur (optionnel)</span><select value={f.prep} onChange={s('prep')} aria-label="Préparateur"><option value="">Aucun pour l'instant</option>
        {team.preps.filter((p) => p.on).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <button className="btn acc" disabled={!ok} data-submit onClick={() => { addOrder(f); toast('Commande ajoutée'); setF(mk()); onClose() }}>{ok ? 'Ajouter' : 'Il manque : ' + miss.join(', ')}</button>
    </Sheet>
  )
}
