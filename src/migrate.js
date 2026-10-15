// Migration du schéma : ne jamais perdre de données existantes
export const SCHEMA = 3

export function migrate(s) {
  if (!s || !Array.isArray(s.orders)) return s
  const orders = s.orders.map((o) => {
    let client = o.client || '', city = o.city
    if (city === undefined) {
      const i = client.indexOf(' — ')
      if (i > 0 && client.slice(i + 3).trim()) { city = client.slice(0, i).trim(); client = client.slice(i + 3).trim() } else city = ''
    }
    return { ...o, client, city, time: o.time || '', pallets: +o.pallets || 0, parcels: +o.parcels || 0, bulk: !!o.bulk, bulkNote: o.bulkNote || '',
      ducts: Array.isArray(o.ducts) ? o.ducts : [], missing: o.missing || [], photos: o.photos || [], history: o.history || [] }
  })
  const team = s.team && { ...s.team, preps: (s.team.preps || []).map((p) => (p.resp === undefined ? { ...p, resp: /resp/i.test(p.name) || p.id === 'pm' } : p)) }
  return { ...s, orders, team: team || s.team, departs: s.departs || {}, sigs: s.sigs || {}, v: SCHEMA }
}
