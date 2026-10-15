import { jsPDF } from 'jspdf'
import { STATUS } from './store'

export const INK = [22, 24, 27], MUT = [107, 111, 118], LINE = [228, 225, 218], ACC = [255, 90, 31], BAD = [224, 57, 43]
export const hex = (h) => (h.startsWith('#') ? [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) : INK)
export const W = 210, M = 16

export function head(d, title, docType, docNum, sub) {
  d.setFillColor(...ACC); d.rect(M, 17, 3, 3, 'F')
  d.setFont('courier', 'bold'); d.setFontSize(11); d.setTextColor(...INK); d.text('DOCKFLOW', M + 6, 20, { charSpace: 1.5 })
  d.setFont('helvetica', 'bold'); d.setFontSize(8); d.setTextColor(...MUT); d.text(docType.toUpperCase(), W - M, 17, { align: 'right' })
  d.setFont('courier', 'bold'); d.setFontSize(18); d.setTextColor(...INK); d.text(docNum, W - M, 25, { align: 'right' })
  d.setDrawColor(...INK); d.setLineWidth(0.6); d.line(M, 30, W - M, 30)
  d.setFont('helvetica', 'bold'); d.setFontSize(24); d.text(title, M, 44)
  d.setFont('helvetica', 'normal'); d.setFontSize(11); d.setTextColor(...MUT); d.text(sub, M, 51)
  return 58
}
export function facts(d, y, items) {
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
export function sec(d, y, t) { d.setFont('helvetica', 'bold'); d.setFontSize(8); d.setTextColor(...MUT); d.text(t.toUpperCase(), M, y, { charSpace: 0.4 }); return y + 5 }
export function foot(d, txt) {
  const n = d.getNumberOfPages()
  for (let i = 1; i <= n; i++) {
    d.setPage(i); d.setDrawColor(...LINE); d.line(M, 284, W - M, 284)
    d.setFont('helvetica', 'normal'); d.setFontSize(8); d.setTextColor(...MUT)
    d.text(txt, M, 289); d.text('Page ' + i + '/' + n, W - M, 289, { align: 'right' })
  }
}
export function pill(d, x, y, label, color) {
  d.setFont('helvetica', 'bold'); d.setFontSize(7.5)
  const w = d.getTextWidth(label) + 6
  d.setFillColor(...hex(color)); d.roundedRect(x, y - 3.6, w, 5.2, 2.6, 2.6, 'F'); d.setTextColor(255, 255, 255); d.text(label, x + 3, y)
}
export const stColor = (c) => (c.startsWith('var') ? '#16181b' : c)
export function alerts(d, y, list) {
  list.forEach((o) => {
    if (y > 262) { d.addPage(); y = 20 }
    d.setDrawColor(...BAD); d.setLineWidth(0.5); d.roundedRect(M, y, W - 2 * M, 12, 2.5, 2.5)
    d.setFillColor(...BAD); d.circle(M + 4, y + 6, 1.1, 'F')
    d.setFont('helvetica', 'bold'); d.setFontSize(9); d.setTextColor(...BAD)
    d.text(o.client + ' ' + o.num + ' — ' + [...o.missing.map((m) => m.qte + ' × ' + m.produit), o.err && 'Erreur de préparation' + (o.errNote ? ' : ' + o.errNote : '')].filter(Boolean).join(' ; '), M + 8, y + 7.3)
    y += 15
  })
  return y
}
export function photos(d, y, list) {
  let x = M
  list.forEach((p) => {
    if (x + 56 > W - M) { x = M; y += 42 }
    if (y > 240) { d.addPage(); y = 20; x = M }
    try { d.addImage(p, 'JPEG', x, y, 56, 38, undefined, 'FAST') } catch {}
    x += 60
  })
  return y + 44
}
export function sigBox(d, y, label, name, img, dateTxt) {
  const w = (W - 2 * M - 6) / 2, x = label === 'resp' ? M + w + 6 : M
  d.setDrawColor(...LINE); d.setLineWidth(0.3); d.roundedRect(x, y, w, 34, 2.5, 2.5)
  d.setFont('helvetica', 'bold'); d.setFontSize(7); d.setTextColor(...MUT); d.text(label === 'resp' ? 'RESPONSABLE' : 'CHAUFFEUR', x + 3, y + 5)
  d.setFontSize(10); d.setTextColor(...INK); d.text(name, x + 3, y + 10)
  if (img) try { d.addImage(img, 'PNG', x + 3, y + 12, 40, 16) } catch {}
  d.setFont('helvetica', 'normal'); d.setFontSize(7.5); d.setTextColor(...MUT); d.text('Bon pour chargement, reçu en bon état', x + 3, y + 31)
}

