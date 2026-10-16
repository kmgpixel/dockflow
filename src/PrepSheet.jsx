import { useEffect, useState } from 'react'
import { Sheet, toast } from './ui'
import { finishPrep, setPack } from './store'
import { formatPack } from './pack'
import { prepName } from './people'
import { Stepper, DuctRows } from './DuctRows'

const init = (o) => ({ prep: o?.prep || '', pallets: o?.pallets || 0, stacked: o?.stacked || 0, parcels: o?.parcels || 0, bulk: !!o?.bulk, bulkNote: o?.bulkNote || '', ducts: o?.ducts?.length ? o.ducts.map((g) => ({ ...g })) : [] })

// edit = true : simple modification du conditionnement (fiche), sans changer le statut
export function PrepSheet({ o, onClose, team, onMissing, edit }) {
  const [f, setF] = useState(init(o))
  useEffect(() => { if (o) setF(init(o)) }, [o?.id])
  if (!o) return <Sheet open={false} />
  const set = (p) => setF({ ...f, ...p })
  const pack = { pallets: f.pallets, stacked: Math.min(f.stacked || 0, Math.floor(f.pallets / 2)), parcels: f.parcels, bulk: f.bulk, bulkNote: f.bulk ? f.bulkNote : '', ducts: f.ducts.filter((g) => g.q > 0) }
  const ok = f.pallets > 0 || f.parcels > 0 || f.bulk || pack.ducts.length > 0
  const done = (miss) => {
    if (edit) { setPack(o.id, pack); toast('Conditionnement enregistré'); onClose(); return }
    finishPrep(o.id, { ...pack, prep: f.prep }); toast('Prête · ' + formatPack(pack)); onClose()
    if (miss) onMissing(o)
  }
  return (
    <Sheet open onClose={onClose}>
      <h2>{edit ? 'Conditionnement' : 'Fin de préparation'}</h2>
      <div className="meta">{o.client} · {o.city} · <span className="num">{o.num}</span></div>
      {!edit && (<>
        <div className="lbl">Préparateur</div>
        <div className="btns">{team.preps.filter((p) => p.on).map((p) => <button key={p.id} type="button" data-prep={p.id} className={'big' + (f.prep === p.id ? ' on' : '')} onClick={() => set({ prep: p.id })}>{prepName(team, p.id)}</button>)}</div></>)}
      <div className="lbl">Palettes</div><Stepper v={f.pallets} set={(v) => set({ pallets: v, stacked: Math.min(f.stacked || 0, Math.floor(v / 2)) })} label="palettes" />
      {f.pallets >= 2 && (<><div className="lbl">Dont gerbées (2 l'une sur l'autre)</div>
        <Stepper v={Math.min(f.stacked || 0, Math.floor(f.pallets / 2))} set={(v) => set({ stacked: Math.min(v, Math.floor(f.pallets / 2)) })} label="gerbées" />
        <div className="meta" data-floor>{f.pallets - Math.min(f.stacked || 0, Math.floor(f.pallets / 2))} place{f.pallets - Math.min(f.stacked || 0, Math.floor(f.pallets / 2)) > 1 ? 's' : ''} au sol</div></>)}
      <div className="lbl">Colis</div><Stepper v={f.parcels} set={(v) => set({ parcels: v })} label="colis" />
      <div className="lbl">Vrac</div>
      <button type="button" className="opt" data-bulk aria-pressed={f.bulk} onClick={() => set({ bulk: !f.bulk })}><span>En vrac</span><span className={'sw' + (f.bulk ? ' on' : '')}><i /></span></button>
      {f.bulk && <input placeholder="Description courte (ex. 12 coudes)" value={f.bulkNote} onChange={(e) => set({ bulkNote: e.target.value })} aria-label="Description du vrac" />}
      <div className="lbl">Gaines galva circulaires</div>
      <DuctRows ducts={f.ducts} setDucts={(ducts) => set({ ducts })} />
      {ok && <div className="card meta" data-packprev>{formatPack(pack)}</div>}
      {edit ? <button className="btn acc" disabled={!ok} data-pack-ok onClick={() => done(false)}>Enregistrer</button> : (<>
        <button className="btn acc" disabled={!ok} data-allok onClick={() => done(false)}>Tout est OK → Prête</button>
        <button className="btn ghost" disabled={!ok} data-miss onClick={() => done(true)}>Il manque quelque chose</button></>)}
    </Sheet>
  )
}
