import { hasIssue, today } from './store'

const H24 = 864e5
const lastTs = (o, re) => { const h = [...(o.history || [])].reverse().find((x) => re.test(x.action)); return h ? h.ts : null }
const age = (ms) => { const h = Math.floor(ms / 36e5); return h >= 48 ? Math.floor(h / 24) + ' jours' : h + ' h' }

// Alertes calculées à partir de l'historique horodaté
export function alerts(s, now = Date.now()) {
  const t = today(), out = []
  for (const o of s.orders) {
    if (o.status === 'cancel') continue
    if (o.status === 'wait') {
      const ts = lastTs(o, /Attente client/) ?? o.history?.[0]?.ts
      if (ts && now - ts > H24) out.push({ o, kind: 'wait', txt: 'Attente accord client depuis ' + age(now - ts) })
    }
    if (o.status === 'ready' && o.date < t) out.push({ o, kind: 'ready', txt: 'Prête mais non chargée (prévue le ' + o.date.slice(8) + '/' + o.date.slice(5, 7) + ')' })
    if (hasIssue(o) && o.missing.length) {
      const ts = lastTs(o, /^Problème signalé/)
      if (ts && now - ts > H24) out.push({ o, kind: 'miss', txt: 'Manquant non résolu depuis ' + age(now - ts) })
    }
  }
  return out
}
