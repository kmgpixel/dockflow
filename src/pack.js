// Conditionnement : un seul formateur pour carte, bon, résumé et fiche
export const DIAMS = [80, 100, 125, 150, 160, 180, 200, 224, 250, 280, 300, 315, 355, 400, 450, 500, 560, 630, 710, 800]
export const QUICK = [125, 160, 200, 250, 315, 400]
export const LENS = [3, 2.47]
export const fmtLen = (l) => String(l).replace('.', ',') + ' m'
export const fmtH = (t) => { if (!t || !t.includes(':')) return ''; const [h, m] = t.split(':'); return +h + 'h' + m }
export const ductsOf = (o) => (o.ducts || []).filter((g) => g.q > 0)
export const ductLine = (g) => g.q + ' × Ø' + g.d + ' ' + fmtLen(g.len)

export function formatPack(o) {
  const p = []
  if (o.pallets > 0) p.push(o.pallets + ' pal.')
  if (o.parcels > 0) p.push(o.parcels + ' colis')
  ductsOf(o).forEach((g) => p.push(ductLine(g)))
  if (o.bulk) p.push('vrac' + (o.bulkNote?.trim() ? ' (' + o.bulkNote.trim() + ')' : ''))
  return p.join(' · ')
}
export const packTotals = (os) => ({
  pal: os.reduce((a, o) => a + (+o.pallets || 0), 0),
  col: os.reduce((a, o) => a + (+o.parcels || 0), 0),
  duct: os.reduce((a, o) => a + ductsOf(o).reduce((b, g) => b + g.q, 0), 0),
  bulk: os.filter((o) => o.bulk).length,
})
export const where = (o) => [o.city, fmtH(o.time)].filter(Boolean).join(' · ')
