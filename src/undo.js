import { getState, replaceAll } from './store'
import { toast } from './ui'

// Exécute une action et propose de l'annuler pendant 5 s (restaure l'état précédent)
export function withUndo(msg, fn) {
  const prev = getState()
  fn()
  toast(msg, () => { replaceAll({ ...prev, theme: getState().theme }); toast('Action annulée') })
}
