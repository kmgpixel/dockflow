import { nameOf, addDays } from './store'
import { alerts } from './calcAlerts'
import { formatPack } from './pack'

const line = (o) => '  - ' + o.client + ' (' + (o.city || '?') + (o.time ? ' ' + o.time.replace(':', 'h') : '') + ') ' + o.num + (formatPack(o) ? ' — ' + formatPack(o) : '')
const block = (t, l) => (l.length ? t + ' (' + l.length + ') :\n' + l.map(line).join('\n') : t + ' : aucune')

export function buildSummary(s, date) {
  const day = s.orders.filter((o) => o.date === date && o.status !== 'cancel')
  const of = (st) => day.filter((o) => o.status === st)
  const moved = s.orders.filter((o) => o.status === 'moved' && o.date === date)
  const pb = day.filter((o) => !o.resolved && (o.missing.length || o.err))
  const open = day.filter((o) => ['todo', 'prep', 'wait', 'ready', 'loaded', 'go'].includes(o.status))
  const tm = s.orders.filter((o) => o.date === addDays(date, 1) && o.status !== 'cancel')
  const al = alerts(s)
  const d = new Date(date + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const L = ['Résumé du soir — ' + d, '', block('Livrées', of('done')), '', block('Non livrées', of('fail').map((o) => ({ ...o, client: o.client + (o.driver ? ' [' + nameOf(s.team.drivers, o.driver) + ']' : '') }))), '', block('Reportées', moved), '', 'Problèmes en cours' + (pb.length ? ' (' + pb.length + ') :' : ' : aucun')]
  pb.forEach((o) => L.push('  - ' + o.client + ' ' + o.num + ' : ' + [...o.missing.map((m) => m.qte + ' × ' + m.produit + ' manquant'), o.err && 'erreur de préparation'].filter(Boolean).join(', ')))
  L.push('', block('Encore en cours ce soir', open), '', 'À suivre demain :', '  - ' + tm.length + ' commande' + (tm.length > 1 ? 's' : '') + ' prévue' + (tm.length > 1 ? 's' : '') + (tm.length ? ' (' + tm.map((o) => o.num).join(', ') + ')' : ''))
  al.forEach((a) => L.push('  - À relancer : ' + a.o.client + ' ' + a.o.num + ' — ' + a.txt))
  return L.join('\n')
}
