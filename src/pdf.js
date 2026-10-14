import { jsPDF } from 'jspdf'
import { STATUS, nameOf, hhmm, hasIssue } from './store'

const INK = [22, 24, 27], MUT = [107, 111, 118], LINE = [228, 225, 218], ACC = [255, 90, 31], BAD = [224, 57, 43]
const hex = (h) => (h.startsWith('#') ? [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) : INK)
const W = 210, M = 16

function head(d, title, docType, docNum, sub) {
  d.setFillColor(...ACC); d.rect(M, 17, 3, 3, 'F')
  d.setFont('courier', 'bold'); d.setFontSize(11); d.setTextColor(...INK); d.text('DOCKFLOW', M + 6, 20, { charSpace: 1.5 })
  d.setFont('helvetica', 'bold'); d.setFontSize(8); d.setTextColor(...MUT); d.text(docType.toUpperCase(), W - M, 17, { align: 'right' })
  d.setFont('courier', 'bold'); d.setFontSize(18); d.setTextColor(...INK); d.text(docNum, W - M, 25, { align: 'right' })
  d.setDrawColor(...INK); d.setLineWidth(0.6); d.line(M, 30, W - M, 30)
  d.setFont('helvetica', 'bold'); d.setFontSize(24); d.text(title, M, 44)
  d.setFont('helvetica', 'normal'); d.setFontSize(11); d.setTextColor(...MUT); d.text(sub, M, 51)
  return 58
}
function facts(d, y, items) {
  const w = (W - 2 * M) / items.length
  d.setDrawColor(...LINE); d.setLineWidth(0.3); d.roundedRect(M, y, W - 2 * M, 16, 2.5, 2.5)
  items.forEach(([l, v], i) => {
    const x = M + i * w
    if (i) d.line(x, y, x, y + 16)
    d.setFont('helvetica', 'bold'); d.setFontSize(7); d.setTextColor(...MUT); d.text(l.toUpperCase(), x + 3, y + 5.5)
    d.setFontSize(11); d.setTextColor(...INK); d.text(String(v), x + 3, y + 12)
  })
  return y + 24
}
function sec(d, y, t) { d.setFont('helvetica', 'bold'); d.setFontSize(8); d.setTextColor(...MUT); d.text(t.toUpperCase(), M, y, { charSpace: 0.4 }); return y + 5 }
function foot(d, txt) {
  const n = d.getNumberOfPages()
  for (let i = 1; i <= n; i++) {
    d.setPage(i); d.setDrawColor(...LINE); d.line(M, 284, W - M, 284)
    d.setFont('helvetica', 'normal'); d.setFontSize(8); d.setTextColor(...MUT)
    d.text(txt, M, 289); d.text('Page ' + i + '/' + n, W - M, 289, { align: 'right' })
  }
}
function pill(d, x, y, label, color) {
  d.setFont('helvetica', 'bold'); d.setFontSize(7.5)
  const w = d.getTextWidth(label) + 6
  d.setFillColor(...hex(color)); d.roundedRect(x, y - 3.6, w, 5.2, 2.6, 2.6, 'F'); d.setTextColor(255, 255, 255); d.text(label, x + 3, y)
}
const stColor = (c) => (c.startsWith('var') ? '#16181b' : c)
function row(d, y, cols, o, s) {
  if (y > 262) { d.addPage(); y = 20 }
  d.setFont('courier', 'bold'); d.setFontSize(10); d.setTextColor(...INK); d.text(o.num, cols[0], y)
  d.setFont('helvetica', 'bold'); d.setFontSize(10); d.text(o.client.slice(0, 34), cols[1], y)
  d.setFont('helvetica', 'normal'); d.setFontSize(8.5); d.setTextColor(...MUT)
  d.text(nameOf(s.team.preps, o.prep) + ' · ' + o.pallets + ' pal. · ' + o.parcels + ' colis', cols[1], y + 4.5)
  pill(d, cols[2], y - 0.5, STATUS[o.status].l, stColor(STATUS[o.status].c))
  d.setDrawColor(...LINE); d.line(M, y + 8, W - M, y + 8)
  return y + 12
}
function alerts(d, y, list) {
  list.forEach((o) => {
    if (y > 262) { d.addPage(); y = 20 }
    d.setDrawColor(...BAD); d.setLineWidth(0.5); d.roundedRect(M, y, W - 2 * M, 12, 2.5, 2.5)
    d.setFillColor(...BAD); d.circle(M + 4, y + 6, 1.1, 'F')
    d.setFont('helvetica', 'bold'); d.setFontSize(9); d.setTextColor(...BAD)
    d.text(o.num + ' — ' + [...o.missing.map((m) => m.qte + ' × ' + m.produit), o.err && 'Erreur de préparation' + (o.errNote ? ' : ' + o.errNote : '')].filter(Boolean).join(' ; '), M + 8, y + 7.3)
    y += 15
  })
  return y
}
function photos(d, y, list) {
  let x = M
  list.forEach((p) => {
    if (x + 56 > W - M) { x = M; y += 42 }
    if (y > 240) { d.addPage(); y = 20; x = M }
    try { d.addImage(p, 'JPEG', x, y, 56, 38, undefined, 'FAST') } catch {}
    x += 60
  })
  return y + 44
}
function sigBox(d, y, label, name, img) {
  const w = (W - 2 * M - 6) / 2, x = label === 'resp' ? M + w + 6 : M
  d.setDrawColor(...LINE); d.setLineWidth(0.3); d.roundedRect(x, y, w, 34, 2.5, 2.5)
  d.setFont('helvetica', 'bold'); d.setFontSize(7); d.setTextColor(...MUT); d.text(label === 'resp' ? 'RESPONSABLE' : 'CHAUFFEUR', x + 3, y + 5)
  d.setFontSize(10); d.setTextColor(...INK); d.text(name, x + 3, y + 10)
  if (img) try { d.addImage(img, 'PNG', x + 3, y + 12, 40, 16) } catch {}
  d.setFont('helvetica', 'normal'); d.setFontSize(7.5); d.setTextColor(...MUT); d.text('Bon pour chargement, reçu en bon état', x + 3, y + 31)
}

export function loadPdf(s, driver, date) {
  const d = new jsPDF({ unit: 'mm', format: 'a4' })
  const os = s.orders.filter((o) => o.driver === driver && o.date === date && !['cancel'].includes(o.status))
  const name = nameOf(s.team.drivers, driver), dock = nameOf(s.team.docks, os[0]?.dock)
  let y = head(d, name, 'Bon de chargement', 'BC-' + date.replace(/-/g, '').slice(2) + '-' + driver.toUpperCase(), 'Livraisons du ' + date.split('-').reverse().join('/'))
  y = facts(d, y, [['Quai', dock], ['Commandes', os.length], ['Palettes', os.reduce((a, o) => a + o.pallets, 0)], ['Colis', os.reduce((a, o) => a + o.parcels, 0)]])
  y = sec(d, y, 'Commandes chargées') + 2
  const cols = [M + 2, M + 28, W - M - 40]
  os.forEach((o) => { y = row(d, y, cols, o, s) })
  const bad = os.filter(hasIssue)
  if (bad.length) { y = sec(d, y + 4, 'Alertes manquants') + 1; y = alerts(d, y, bad) }
  const ph = os.flatMap((o) => o.photos)
  if (ph.length) { y = sec(d, y + 4, 'Photos') + 1; y = photos(d, y, ph) }
  if (y > 236) { d.addPage() }
  sigBox(d, 246, 'chauffeur', name, s.sigs[driver + date]); sigBox(d, 246, 'resp', 'Mathieu', null)
  foot(d, 'DockFlow · généré le ' + new Date().toLocaleString('fr-FR'))
  return d.output('blob')
}

export function reportPdf(s, date) {
  const d = new jsPDF({ unit: 'mm', format: 'a4' })
  const os = s.orders.filter((o) => o.date === date)
  const n = (f) => os.filter(f).length
  let y = head(d, 'Rapport du jour', 'Rapport', 'RJ-' + date.replace(/-/g, '').slice(2), date.split('-').reverse().join('/'))
  y = facts(d, y, [['Commandes', os.length], ['Prêtes', n((o) => ['ready', 'loaded'].includes(o.status))], ['Parties', n((o) => ['go', 'done'].includes(o.status))], ['Problèmes', n(hasIssue)]])
  y = sec(d, y, 'Détail') + 2
  const cols = [M + 2, M + 28, W - M - 40]
  os.forEach((o) => { y = row(d, y, cols, o, s) })
  y = sec(d, y + 4, 'Qui a préparé quoi') + 2
  s.team.preps.forEach((p) => {
    const c = os.filter((o) => o.prep === p.id).length
    if (!c) return
    if (y > 270) { d.addPage(); y = 20 }
    d.setFont('helvetica', 'bold'); d.setFontSize(10); d.setTextColor(...INK); d.text(p.name, M + 2, y)
    d.setFont('courier', 'bold'); d.text(c + ' commande' + (c > 1 ? 's' : ''), W - M, y, { align: 'right' }); y += 7
  })
  const bad = os.filter(hasIssue)
  if (bad.length) { y = sec(d, y + 4, 'Alertes') + 1; alerts(d, y, bad) }
  foot(d, 'DockFlow · généré le ' + new Date().toLocaleString('fr-FR'))
  return d.output('blob')
}

export async function orderPdf(s, o) {
  const d = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = head(d, o.client, 'Fiche commande', o.num, 'Livraison le ' + o.date.split('-').reverse().join('/'))
  y = facts(d, y, [['Statut', STATUS[o.status].l], ['Préparateur', nameOf(s.team.preps, o.prep)], ['Palettes', o.pallets], ['Colis', o.parcels]])
  if (hasIssue(o)) y = alerts(d, y, [o])
  y = sec(d, y + 2, 'Chronologie') + 2
  o.history.forEach((h) => {
    if (y > 270) { d.addPage(); y = 20 }
    d.setFont('courier', 'bold'); d.setFontSize(9); d.setTextColor(...MUT); d.text(hhmm(h.ts), M + 2, y)
    d.setFont('helvetica', 'normal'); d.setTextColor(...INK); d.text(h.action + '  ·  ' + h.by, M + 20, y); y += 6
  })
  if (o.photos.length) { y = sec(d, y + 4, 'Photos') + 1; photos(d, y, o.photos) }
  foot(d, 'DockFlow · généré le ' + new Date().toLocaleString('fr-FR'))
  return d.output('blob')
}

export async function deliver(blob, filename) {
  window.__lastPdf = { blob, filename }
  const file = new File([blob], filename, { type: 'application/pdf' })
  try { if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: filename }); return } } catch (e) { if (e.name === 'AbortError') return }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}
