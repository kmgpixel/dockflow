import { withUndo } from './undo'
import { advance, setStatus } from './store'

const stop = { onClick: (e) => e.stopPropagation(), onPointerDown: (e) => e.stopPropagation() }

// Gros bouton principal selon le statut + 3 actions secondaires
export function QuickActions({ o, onFinish, onProblem, onMenu, onLoad, onTrucks, onDetail }) {
  const main = {
    todo: ['Commencer', () => withUndo('Préparation commencée', () => advance(o))],
    prep: ['Terminer la préparation', () => onFinish(o)],
    wait: ['Accord reçu', () => withUndo('Accord client reçu', () => setStatus(o.id, 'prep'))],
    ready: ['Charger…', () => onLoad(o)],
    loaded: ['Voir le camion', onTrucks],
    go: ['Voir le camion', onTrucks],
  }[o.status]
  return (
    <div className="qa" {...stop}>
      {main && <button className="btn acc qmain" data-qmain onClick={main[1]}>{main[0]}</button>}
      <div className="q2">
        <button className="btn ghost" data-qprob onClick={() => onProblem(o)}>Problème</button>
        <button className="btn ghost" data-qmore onClick={() => onMenu(o)}>Plus…</button>
        <button className="btn ghost" data-qfiche onClick={() => onDetail(o)}>Fiche</button>
      </div>
    </div>
  )
}
