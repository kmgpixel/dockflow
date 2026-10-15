// Données de démo fictives : 7 jours passés (statistiques)
const CL = [['Valence', 'Clim Services'], ['Lyon 3e', 'Thermique Rhône'], ['Annecy', 'Alpes Confort'], ['Grenoble', 'Isère Sanitaire'], ['Vienne', 'Atelier Durand'],
  ['Chambéry', 'Savoie Froid'], ['Bourg', 'Plomberie Ain'], ['Romans', 'Drôme Ventilation'], ['Villeurbanne', 'Aéro Bât'], ['Saint-Étienne', 'Loire Climat'], ['Gap', 'Hautes-Alpes Chauffage'], ['Voiron', 'Atelier Chartreuse']]
const PR = ['Coude 90° Ø160', 'Collier Ø200', 'Gaine souple Ø125', 'Té réduit 160/125', 'Grille de soufflage', 'Manchon Ø100']
const DR = ['d0', 'd1', 'd2', 'd3', 'd4', 'd5']

export function seedPast(t, addDays, uid) {
  let r = 7
  const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647 }
  const pick = (a) => a[Math.floor(rnd() * a.length)]
  const out = []
  let n = 2300
  for (let k = 7; k >= 1; k--) {
    const date = addDays(t, -k), base = new Date(date + 'T08:00').getTime()
    const cnt = 4 + Math.floor(rnd() * 3)
    for (let i = 0; i < cnt; i++) {
      const c = pick(CL), prep = pick(['p0', 'p1', 'p2', 'pm']), driver = pick(DR)
      const fail = rnd() < 0.18
      const miss = rnd() < 0.22, err = rnd() < 0.12
      const special = k === 2 && i === 0, pending = k === 1 && i === 0
      const missing = miss || special ? [{ produit: pick(PR), qte: 1 + Math.floor(rnd() * 5) }] : []
      const h = [{ ts: base - 18e5 * 20, action: 'Commande créée', by: 'Démo' }]
      if (missing.length || err) h.push({ ts: base + 36e5, action: 'Problème signalé' + (missing.length ? ' : manquants' : '') + (err ? ' : erreur de préparation' : ''), by: 'Moi' })
      let status = fail ? 'fail' : 'done'
      if (pending) status = 'ready'
      else { h.push({ ts: base + 72e5, action: 'Chargée', by: 'Moi' }, { ts: base + 108e5, action: 'Départ', by: 'Moi' }, { ts: base + 18e6, action: 'Statut → ' + (fail ? 'Non livrée' : 'Livrée'), by: 'Moi' }) }
      if (pending) h.push({ ts: base + 5e6, action: 'Statut → Prête', by: 'Moi' })
      out.push({ id: uid(), num: 'SO-' + n++, client: c[1], city: c[0], time: pick(['08:00', '10:00', '14:00']), date, prep, driver: pending ? null : driver, dock: pending ? null : 'q' + [1, 2, 4, 5, 6][DR.indexOf(driver) % 5],
        pallets: 1 + Math.floor(rnd() * 4), parcels: 3 + Math.floor(rnd() * 25), bulk: false, bulkNote: '', ducts: rnd() < 0.3 ? [{ d: pick([160, 200, 250]), len: 3, q: 2 + Math.floor(rnd() * 8) }] : [], status, missing, err, errNote: '', resolved: !special && (missing.length > 0 || err), photos: [], comment: '', history: h })
    }
  }
  return out
}
