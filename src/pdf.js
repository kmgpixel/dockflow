import { jsPDF } from 'jspdf'
import { STATUS, hhmm, hasIssue, iso, fmtDM } from './store'
import { INK, MUT, LINE, BAD, W, M, head, facts, sec, foot, pill, stColor, alerts, photos, sigBox } from './pdfKit'
import { formatPack, packTotals, fmtH, where, ductsOf, ductLine } from './pack'
import { respOf, initials, dockName, prepName } from './people'
import { truckOrders } from './truckSel'

// Document avec collecte du texte (utile pour vérifier le contenu)
function doc() {
  const d = new jsPDF({ unit: 'mm', format: 'a4' }), raw = d.text.bind(d)
  d.__t = []
  d.text = (t, ...r) => { d.__t.push(Array.isArray(t) ? t.join(' ') : String(t)); return raw(t, ...r) }
  return d
}
const done = (d) => { if (typeof window !== 'undefined') window.__pdfText = d.__t.join('\n'); return d.output('blob') }
const fr = (date) => date.split('-').reverse().join('/')

// Ligne de commande : client en gros, ville dessous, conditionnement complet à la ligne
function row(d, y, o, s) {
  const tx = M + 2, right = W - M - 42
  const pk = []
  const base = [o.pallets > 0 && o.pallets + ' pal.', o.parcels > 0 && o.parcels + ' colis'].filter(Boolean).join(' · ')
  if (base) pk.push(base)
  ductsOf(o).forEach((g) => pk.push(ductLine(g)))
  if (o.bulk) pk.push('vrac' + (o.bulkNote?.trim() ? ' (' + o.bulkNote.trim() + ')' : ''))
  d.setFont('helvetica', 'normal'); d.setFontSize(9)
  const lines = pk.length ? d.splitTextToSize(pk.join('  ·  '), W - 2 * M - 4) : []
  const cl = d.splitTextToSize(o.client, right - tx)
  const h = 8 + cl.length * 6 + 6 + 5 + lines.length * 4.4 + 4
  if (y + h > 266) { d.addPage(); y = 20 }
  d.setFont('helvetica', 'bold'); d.setFontSize(14); d.setTextColor(...INK); d.text(cl, tx, y + 4)
  let yy = y + 4 + (cl.length - 1) * 6
  d.setFontSize(11); d.text((o.city || 'Ville non renseignée') + (o.time ? '   ' + fmtH(o.time) : ''), tx, yy + 6)
  pill(d, W - M - 38, y + 3, STATUS[o.status].l, stColor(STATUS[o.status].c))
  d.setFont('courier', 'normal'); d.setFontSize(8); d.setTextColor(...MUT)
  d.text(o.num + (o.part ? '  ·  LIVRAISON PARTIELLE ' + o.part.i + '/' + o.part.n : '') + '  ·  ' + prepName(s.team, o.prep), tx, yy + 11)
  d.setFont('helvetica', 'normal'); d.setFontSize(9); d.setTextColor(...INK)
  if (lines.length) d.text(lines, tx, yy + 16)
  else { d.setTextColor(...MUT); d.text('Conditionnement non saisi', tx, yy + 16) }
  const end = yy + 16 + Math.max(1, lines.length) * 4.4
  d.setDrawColor(...LINE); d.setLineWidth(0.3); d.line(M, end + 1.5, W - M, end + 1.5)
  return end + 5
}

export function loadNumber(s, driver, ld) {
  const day = iso(ld || Date.now()), mins = new Set(truckOrders(s, driver).filter((o) => o.loadedAt && iso(o.loadedAt) === day).map((o) => Math.floor(o.loadedAt / 6e4)))
  return 'BC-' + day.replace(/-/g, '').slice(2) + '-' + initials(s.team.drivers.find((x) => x.id === driver)?.name) + '-' + Math.max(1, mins.size)
}

export function loadPdf(s, driver) {
  const d = doc()
  const os = truckOrders(s, driver).sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  const name = s.team.drivers.find((x) => x.id === driver)?.name || '—', dock = dockName(s.team, os.find((o) => o.dock)?.dock)
  const ld = Math.max(0, ...os.map((o) => o.loadedAt || 0)) || Date.now()
  const dates = [...new Set(os.map((o) => o.date))].sort()
  const sub = 'Chargé le ' + fmtDM(iso(ld)) + ' à ' + hhmm(ld) + ' · Livraison' + (dates.length > 1 ? 's' : '') + ' du ' + dates.map((x) => fmtDM(x)).join(' et ')
  let y = head(d, name, 'Bon de chargement', loadNumber(s, driver, ld), sub)
  const t = packTotals(os)
  y = facts(d, y, [['Quai', dock], ['Commandes', os.length], ['Palettes', t.pal], ['Colis', t.col], ['Gaines', t.duct + ' long.'], ['Vrac', t.bulk ? 'oui (' + t.bulk + ')' : 'non']])
  y = sec(d, y, 'Commandes chargées') + 3
  os.forEach((o) => { y = row(d, y, o, s) })
  const bad = os.filter(hasIssue)
  if (bad.length) { y = sec(d, y + 4, 'Alertes manquants') + 1; y = alerts(d, y, bad) }
  const ph = os.flatMap((o) => o.photos)
  if (ph.length) { y = sec(d, y + 4, 'Photos') + 1; y = photos(d, y, ph) }
  if (y > 236) d.addPage()
  sigBox(d, 246, 'chauffeur', name, s.sigs[driver + dates[0]] || Object.entries(s.sigs).filter(([k]) => k.startsWith(driver)).map(([, v]) => v).pop())
  sigBox(d, 246, 'resp', respOf(s.team) || 'Non défini', null)
  foot(d, 'DockFlow · généré le ' + new Date().toLocaleString('fr-FR'))
  return done(d)
}

export function reportPdf(s, date) {
  const d = doc()
  const os = s.orders.filter((o) => o.date === date).sort((a, b) => (a.time || '99').localeCompare(b.time || '99'))
  const n = (f) => os.filter(f).length
  let y = head(d, 'Rapport du jour', 'Rapport', 'RJ-' + date.replace(/-/g, '').slice(2), fr(date) + ' · responsable ' + (respOf(s.team) || 'non défini'))
  y = facts(d, y, [['Commandes', os.length], ['Prêtes', n((o) => ['ready', 'loaded'].includes(o.status))], ['Parties', n((o) => ['go', 'done'].includes(o.status))], ['Problèmes', n(hasIssue)]])
  y = sec(d, y, 'Détail') + 3
  os.forEach((o) => { y = row(d, y, o, s) })
  y = sec(d, y + 4, 'Qui a préparé quoi') + 2
  s.team.preps.forEach((p) => {
    const c = os.filter((o) => o.prep === p.id).length
    if (!c) return
    if (y > 270) { d.addPage(); y = 20 }
    d.setFont('helvetica', 'bold'); d.setFontSize(10); d.setTextColor(...INK); d.text(prepName(s.team, p.id), M + 2, y)
    d.setFont('courier', 'bold'); d.text(c + ' commande' + (c > 1 ? 's' : ''), W - M, y, { align: 'right' }); y += 7
  })
  const bad = os.filter(hasIssue)
  if (bad.length) { y = sec(d, y + 4, 'Alertes') + 1; alerts(d, y, bad) }
  foot(d, 'DockFlow · généré le ' + new Date().toLocaleString('fr-FR'))
  return done(d)
}

export async function orderPdf(s, o) {
  const d = doc()
  let y = head(d, o.client, 'Fiche commande', o.num, (o.city || '') + (o.time ? ' · ' + fmtH(o.time) : '') + ' · livraison le ' + fr(o.date))
  y = facts(d, y, [['Statut', STATUS[o.status].l], ['Préparateur', prepName(s.team, o.prep)], ['Responsable', respOf(s.team) || '—'], ['Heure', fmtH(o.time) || '—']])
  y = sec(d, y, 'Conditionnement') + 1
  d.setFont('helvetica', 'normal'); d.setFontSize(10); d.setTextColor(...INK)
  const pl = d.splitTextToSize(formatPack(o) || 'Non saisi', W - 2 * M); d.text(pl, M, y + 3); y += pl.length * 5 + 6
  if (hasIssue(o)) y = alerts(d, y, [o])
  y = sec(d, y + 2, 'Chronologie') + 2
  o.history.forEach((h) => {
    if (y > 270) { d.addPage(); y = 20 }
    d.setFont('courier', 'bold'); d.setFontSize(9); d.setTextColor(...MUT); d.text(hhmm(h.ts), M + 2, y)
    d.setFont('helvetica', 'normal'); d.setTextColor(...INK)
    const t = d.splitTextToSize(h.action + '  ·  ' + h.by, W - 2 * M - 20); d.text(t, M + 20, y); y += 6 * t.length
  })
  if (o.photos.length) { y = sec(d, y + 4, 'Photos') + 1; photos(d, y, o.photos) }
  foot(d, 'DockFlow · généré le ' + new Date().toLocaleString('fr-FR'))
  return done(d)
}

export async function deliver(blob, filename) {
  window.__lastPdf = { blob, filename }
  const file = new File([blob], filename, { type: 'application/pdf' })
  try { if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: filename }); return } } catch (e) { if (e.name === 'AbortError') return }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}
