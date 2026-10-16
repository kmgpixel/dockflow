import { hasIssue } from './store'
import { today, addDays } from './dates'

const H24 = 864e5
const lastTs = (o, re) => { const h = [...(o.history || [])].reverse().find((x) => re.test(x.action)); return h ? h.ts : null }
const age = (ms) => { const h = Math.floor(ms / 36e5); return h >= 48 ? Math.floor(h / 24) + ' jours' : h + ' h' }

// Alertes calculées à partir de l'historique horodaté
export function alerts(s, now = Date.now()) {
  const t = today(), tm = addDays(t, 1), out = [], after15 = new Date(now).getHours() >= 15
  for (const o of s.orders) {
    if (o.status === 'cancel') continue
    if (o.status === 'wait') {
      const ts = lastTs(o, /Attente client/) ?? o.history?.[0]?.ts
      if (ts && now - ts > H24) out.push({ o, sev: 'amber', kind: 'wait', txt: 'Attente accord client depuis ' + age(now - ts) })
    }
    if (o.status === 'ready' && o.date < t) out.push({ o, sev: 'red', kind: 'ready', txt: 'Prête mais non chargée (prévue le ' + o.date.slice(8) + '/' + o.date.slice(5, 7) + ')' })
    if (after15 && o.date === tm) {
      if (['todo', 'prep', 'wait'].includes(o.status)) out.push({ o, sev: 'amber', kind: 'tm-np', txt: 'Livraison demain non prête' })
      if (o.status === 'ready') out.push({ o, sev: 'amber', kind: 'tm-nl', txt: 'Livraison demain prête mais non chargée' })
    }
    // Livraison partielle : une partie non livrée alors qu'une autre l'est
    if (o.part && o.status === 'fail' && s.orders.some((x) => x.part?.g === o.part.g && x.status === 'done'))
      out.push({ o, sev: 'red', kind: 'part', txt: 'Livraison partielle : partie ' + o.part.i + '/' + o.part.n + ' non livrée' })
    if (hasIssue(o) && o.missing.length) {
      const ts = lastTs(o, /^Problème signalé/)
      if (ts && now - ts > H24) out.push({ o, sev: 'red', kind: 'miss', txt: 'Manquant non résolu depuis ' + age(now - ts) })
    }
  }
  return out
}

export const worst = (a) => (a.some((x) => x.sev === 'red') ? 'red' : 'amber')
// gravité max par commande (id -> 'red' | 'amber')
export const sevMap = (a) => { const m = {}; for (const x of a) if (m[x.o.id] !== 'red') m[x.o.id] = x.sev; return m }
