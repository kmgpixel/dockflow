import { seedPast } from './seedPast'
import { today, addDays, uid } from './dates'
import { SCHEMA } from './migrate'

export function seed() {
  const t = today(), tm = addDays(t, 1)
  const P = ['Karim', 'Julie', 'Théo'], D = ['Express Nord', 'Sofiane', 'Trans Vallée', 'Marc L.', 'Transports Alba', "Rapid'Est"]
  const team = {
    preps: P.map((n, i) => ({ id: 'p' + i, name: n, on: true })).concat([{ id: 'pm', name: 'Mathieu (resp.)', on: true, resp: true }]),
    drivers: D.map((n, i) => ({ id: 'd' + i, name: n, on: true })),
    docks: [1, 2, 4, 5, 6].map((n) => ({ id: 'q' + n, name: 'Quai ' + n, on: true })),
  }
  const mk = (num, client, city, time, date, prep, status, pk, extra = {}) => ({
    id: uid(), num, client, city, time, date, prep, driver: null, dock: null, pallets: 0, parcels: 0, bulk: false, bulkNote: '', ducts: [], ...pk, status,
    missing: [], err: false, errNote: '', resolved: false, photos: [], comment: '',
    history: [{ ts: Date.now() - 36e5, action: 'Commande créée', by: 'Démo' }], ...extra,
  })
  const dc = (d, len, q) => ({ d, len, q })
  const orders = [
    mk('SO-2402', 'Clim Services', 'Valence', '08:00', t, 'p0', 'prep', {}),
    mk('SO-2407', 'Aéro Bât', 'Lyon 7e', '10:00', t, 'p1', 'prep', {}, { missing: [{ produit: 'Coude 90° Ø160', qte: 4 }] }),
    mk('SO-2413', "Ventil'Alpes", 'Grenoble', '14:00', t, 'p2', 'wait', {}, { history: [{ ts: Date.now() - 40 * 36e5, action: 'Commande créée', by: 'Démo' }, { ts: Date.now() - 30 * 36e5, action: 'Statut → Attente client', by: 'Moi' }] }),
    mk('SO-2404', 'Atelier Durand', 'Vienne', '08:00', t, 'p0', 'ready', { pallets: 3, parcels: 18, ducts: [dc(160, 3, 8), dc(250, 2.47, 4)] }),
    mk('SO-2409', 'Thermo Savoie', 'Annecy', '10:00', t, 'p1', 'todo', {}),
    mk('SO-2411', 'Sanitaire Plus', 'Chambéry', '14:00', t, null, 'todo', {}),
    mk('SO-2415', 'Plomberie Ain', 'Bourg', '08:00', tm, 'p2', 'ready', { pallets: 2, parcels: 6, bulk: true, bulkNote: '12 coudes', ducts: [dc(800, 3, 2)] }),
    mk('SO-2416', 'Froid & Co', 'Saint-Étienne', '10:00', tm, 'p0', 'ready', { pallets: 1, ducts: [dc(200, 3, 10), dc(315, 2.47, 6)] }),
    mk('SO-2417', 'Isère Sanitaire', 'Grenoble', '14:00', tm, null, 'todo', {}),
  ]
  orders.push(...seedPast(t, addDays, uid))
  return { orders, team, theme: 'auto', sigs: {}, departs: {}, v: SCHEMA }
}
