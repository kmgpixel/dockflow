import { useState } from 'react'
import { PeopleList } from './PeopleList'
export { Settings } from './Settings'

export function Team({ s, date, onStats }) {
  const [edit, setEdit] = useState(false)
  const day = s.orders.filter((o) => o.date === date && o.status !== 'cancel')
  return (
    <div>
      <div className="top"><span className="brand"><i />DOCKFLOW</span><h1>Équipe</h1></div>
      <div className="sec"><span>Aujourd'hui</span><button className="edtbtn" data-edit-team aria-pressed={edit} onClick={() => setEdit(!edit)}>{edit ? 'Terminé' : 'Modifier'}</button></div>
      <PeopleList title="Préparateurs" kind="preps" list={s.team.preps} orders={day} edit={edit} />
      <PeopleList title="Livreurs" kind="drivers" list={s.team.drivers} orders={day} edit={edit} />
      <PeopleList title="Quais" kind="docks" list={s.team.docks} orders={day} edit={edit} />
      <div className="list" style={{ marginTop: 'var(--sp-4)' }}><button className="btn ghost" data-stats onClick={onStats}>Statistiques de la semaine</button></div>
    </div>
  )
}
