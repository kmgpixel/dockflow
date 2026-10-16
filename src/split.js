// Répartition d'une commande sur plusieurs camions (option A : palettes / colis entiers,
// une ligne de gaines ou le vrac partent en entier dans un seul camion).
import { setState, getState, nameOf, uid, hhmm } from './store'
import { formatPack, ductsOf } from './pack'

const log = (o, action) => ({ ...o, history: [...(o.history || []), { ts: Date.now(), action, by: 'Moi' }] })

// Contenu d'une partie à partir de la répartition saisie
export function partPack(o, p, i, ductOwner, bulkOwner) {
  return {
    pallets: p.pallets, stacked: Math.min(+o.stacked || 0, Math.floor(p.pallets / 2)), parcels: p.parcels,
    ducts: ductsOf(o).filter((_, k) => ductOwner[k] === i).map((g) => ({ ...g })),
    bulk: !!o.bulk && bulkOwner === i, bulkNote: o.bulk && bulkOwner === i ? o.bulkNote || '' : '',
  }
}

// Vérifie que tout est réparti : renvoie la liste des problèmes (vide = OK)
export function checkSplit(o, parts, ductOwner, bulkOwner) {
  const err = []
  const pal = parts.reduce((a, p) => a + p.pallets, 0), col = parts.reduce((a, p) => a + p.parcels, 0)
  if (pal !== (o.pallets || 0)) err.push(pal < (o.pallets || 0) ? 'reste ' + ((o.pallets || 0) - pal) + ' pal. à répartir' : (pal - (o.pallets || 0)) + ' pal. en trop')
  if (col !== (o.parcels || 0)) err.push(col < (o.parcels || 0) ? 'reste ' + ((o.parcels || 0) - col) + ' colis à répartir' : (col - (o.parcels || 0)) + ' colis en trop')
  parts.forEach((p, i) => {
    if (!p.driver) err.push('camion ' + (i + 1) + ' : livreur à choisir')
    if (!formatPack(partPack(o, p, i, ductOwner, bulkOwner))) err.push('camion ' + (i + 1) + ' : vide')
  })
  const drv = parts.map((p) => p.driver).filter(Boolean)
  if (new Set(drv).size !== drv.length) err.push('un même livreur est choisi deux fois')
  return err
}

// Remplace la commande par N parties, chacune chargée dans son camion.
// La 1re partie garde l'identifiant (et l'historique) de la commande d'origine.
export function splitOrder(id, parts, ductOwner, bulkOwner) {
  const s = getState(), o = s.orders.find((x) => x.id === id)
  if (!o || checkSplit(o, parts, ductOwner, bulkOwner).length) return false
  const ts = Date.now(), n = parts.length, g = o.id
  const names = parts.map((p) => nameOf(s.team.drivers, p.driver))
  const made = parts.map((p, i) => {
    const base = i === 0 ? o : { ...o, id: uid(), history: [...(o.history || [])], photos: [...(o.photos || [])], missing: [] }
    const pk = partPack(o, p, i, ductOwner, bulkOwner)
    let x = { ...base, ...pk, part: { i: i + 1, n, g }, driver: p.driver, dock: p.dock || null, status: 'loaded', loadedAt: ts }
    x = log(x, 'Répartie sur ' + n + ' camions (' + names.join(', ') + ')')
    return log(x, 'Partie ' + (i + 1) + '/' + n + ' chargée → ' + names[i] + ' à ' + hhmm(ts) + ' · ' + formatPack(pk))
  })
  setState((st) => {
    const out = []
    st.orders.forEach((x) => { if (x.id === id) out.push(...made); else out.push(x) })
    return { ...st, orders: out }
  })
  return true
}

export const partLabel = (o) => (o.part ? 'Partie ' + o.part.i + '/' + o.part.n : '')
