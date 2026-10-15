import { nameOf } from './store'

// Responsable actif de l'équipe courante (jamais de nom en dur)
export function respOf(team) {
  const ps = (team?.preps || []).filter((p) => p.on)
  const p = ps.find((x) => x.resp) || ps.find((x) => /resp/i.test(x.name)) || (team?.preps || []).find((x) => x.id === 'pm')
  return p ? p.name.replace(/\s*\(resp\.?\)/i, '').trim() : ''
}
export function initials(name) {
  const w = (name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^A-Za-z]+/).filter(Boolean)
  const s = w.length > 1 ? w.slice(0, 3).map((x) => x[0]).join('') : (w[0] || 'XX').slice(0, 2)
  return s.toUpperCase()
}
export const dockName = (team, id) => (id ? nameOf(team.docks, id) : 'Non attribué')
export const prepName = (team, id) => (id ? nameOf(team.preps, id).replace(/\s*\(resp\.?\)/i, '') : 'Sans préparateur')
