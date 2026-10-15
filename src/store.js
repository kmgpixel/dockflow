import { useSyncExternalStore } from 'react'
import { get, set } from 'idb-keyval'
import { seedPast } from './seedPast'

export const STATUS = {
  todo: { l: 'À préparer', c: '#9a9ea6', p: 0 },
  prep: { l: 'En préparation', c: '#2f6fdb', p: 1 },
  wait: { l: 'Attente client', c: '#b26be0', p: 1 },
  ready: { l: 'Prête', c: '#1f9d6b', p: 3 },
  loaded: { l: 'Chargée', c: '#0e8f9a', p: 4 },
  go: { l: 'En livraison', c: 'var(--go)', p: 5 },
  done: { l: 'Livrée', c: '#117a52', p: 5 },
  fail: { l: 'Non livrée', c: '#e0392b', p: 5 },
  moved: { l: 'Reportée', c: '#b26be0', p: 5 },
  cancel: { l: 'Annulée', c: '#9a9ea6', p: 0 },
}
export const NEXT = { todo: 'prep', prep: 'ready', wait: 'ready', ready: 'loaded' }

export const iso = (d) => {
  const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10)
}
export const addDays = (s, n) => { const d = new Date(s + 'T12:00'); d.setDate(d.getDate() + n); return iso(d) }
export const today = () => iso(new Date())
export const hhmm = (ts) => new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
export const uid = () => Math.random().toString(36).slice(2, 9)

function seed() {
  const t = today(), tm = addDays(t, 1)
  const P = ['Karim', 'Julie', 'Théo'], D = ['Express Nord', 'Sofiane', 'Trans Vallée', 'Marc L.', 'Transports Alba', "Rapid'Est"]
  const team = {
    preps: P.map((n, i) => ({ id: 'p' + i, name: n, on: true })).concat([{ id: 'pm', name: 'Mathieu (resp.)', on: true }]),
    drivers: D.map((n, i) => ({ id: 'd' + i, name: n, on: true })),
    docks: [1, 2, 4, 5, 6].map((n) => ({ id: 'q' + n, name: 'Quai ' + n, on: true })),
  }
  const mk = (num, client, date, prep, status, pal, col, extra = {}) => ({
    id: uid(), num, client, date, prep, driver: null, dock: null, pallets: pal, parcels: col, status,
    missing: [], err: false, errNote: '', resolved: false, photos: [], comment: '',
    history: [{ ts: Date.now() - 36e5, action: 'Commande créée', by: 'Démo' }], ...extra,
  })
  const orders = [
    mk('C-2402', 'Valence — Clim Services', t, 'p0', 'prep', 2, 14),
    mk('C-2407', 'Lyon 7e — Aéro Bât', t, 'p1', 'prep', 1, 6, { missing: [{ produit: 'Coude 90° Ø160', qte: 4 }] }),
    mk('C-2413', "Grenoble — Ventil'Alpes", t, 'p2', 'wait', 3, 22, { history: [{ ts: Date.now() - 40 * 36e5, action: 'Commande créée', by: 'Démo' }, { ts: Date.now() - 30 * 36e5, action: 'Statut → Attente client', by: 'Moi' }] }),
    mk('C-2404', 'Vienne — Atelier Durand', t, 'p0', 'ready', 3, 18),
    mk('C-2409', 'Annecy — Thermo Savoie', t, 'p1', 'todo', 2, 9),
    mk('C-2411', 'Chambéry — Sanitaire Plus', t, null, 'todo', 1, 4),
    mk('C-2415', 'Bourg — Plomberie Ain', tm, 'p2', 'todo', 4, 30),
    mk('C-2416', 'Saint-Étienne — Froid & Co', tm, null, 'todo', 2, 11),
  ]
  orders.push(...seedPast(t, addDays, uid))
  return { orders, team, theme: 'auto', sigs: {}, departs: {}, v: 2 }
}

let state = null
const subs = new Set()
const emit = () => { subs.forEach((f) => f()); set('dockflow', state).catch(() => {}) }
export const getState = () => state
export function useStore() { return useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => state) }
export async function init() {
  try { state = (await get('dockflow')) || null } catch { state = null }
  if (!state) state = seed()
  try { navigator.storage?.persist?.() } catch {}
}
export const setState = (fn) => { state = fn(state); emit() }
export const replaceAll = (s) => { state = s; emit() }
export const resetDemo = () => { state = { ...seed(), orders: [], theme: state.theme }; emit() }
export const loadDemo = () => { state = seed(); emit() }

const log = (o, action, by = 'Moi') => ({ ...o, history: [...o.history, { ts: Date.now(), action, by }] })
export const upd = (id, fn, action) => setState((s) => ({
  ...s, orders: s.orders.map((o) => (o.id === id ? (action ? log(fn(o), action) : fn(o)) : o)),
}))
export const nameOf = (list, id) => list.find((x) => x.id === id)?.name || '—'

export const addOrder = (o) => setState((s) => ({
  ...s, orders: [...s.orders, { id: uid(), num: o.num, client: o.client, date: o.date, prep: o.prep || null, driver: null, dock: null,
    pallets: +o.pallets || 1, parcels: +o.parcels || 0, status: 'todo', missing: [], err: false, errNote: '', resolved: false, photos: [], comment: '',
    history: [{ ts: Date.now(), action: 'Commande créée', by: 'Moi' }] }],
}))
export const advance = (o) => NEXT[o.status] && upd(o.id, (x) => ({ ...x, status: NEXT[x.status] }), 'Statut → ' + STATUS[NEXT[o.status]].l)
export const setStatus = (id, st, note) => upd(id, (x) => ({ ...x, status: st }), 'Statut → ' + STATUS[st].l + (note ? ' (' + note + ')' : ''))
export const postpone = (id, date) => upd(id, (x) => ({ ...x, status: 'moved', date, driver: null }), 'Reportée au ' + date)
export const addProblem = (id, p) => upd(id, (x) => ({
  ...x, resolved: false, missing: [...x.missing, ...(p.missing || [])], err: x.err || p.err, errNote: p.errNote || x.errNote,
  photos: [...x.photos, ...(p.photos || [])],
}), 'Problème signalé' + (p.missing?.length ? ' : manquants' : '') + (p.err ? ' : erreur de préparation' : ''))
export const resolve = (id) => upd(id, (x) => ({ ...x, resolved: true }), 'Problème résolu')
export const hasIssue = (o) => !o.resolved && (o.missing.length > 0 || o.err)

export const loadTo = (ids, driver, dock) => setState((s) => ({
  ...s, orders: s.orders.map((o) => (ids.includes(o.id) ? log({ ...o, driver, dock, status: 'loaded', loadedAt: Date.now() },
    'Chargée → ' + nameOf(s.team.drivers, driver) + ' à ' + hhmm(Date.now())) : o)),
}))
export const depart = (driver, date) => setState((s) => {
  const ts = Date.now()
  return { ...s, departs: { ...s.departs, [driver + date]: ts }, orders: s.orders.map((o) =>
    o.driver === driver && o.date === date && o.status === 'loaded' ? log({ ...o, status: 'go', departedAt: ts }, 'Départ ' + hhmm(ts)) : o) }
})
export const saveSig = (driver, date, data) => setState((s) => ({ ...s, sigs: { ...s.sigs, [driver + date]: data } }))
export const setTheme = (theme) => setState((s) => ({ ...s, theme }))
export const editTeam = (kind, fn) => setState((s) => ({ ...s, team: { ...s.team, [kind]: fn(s.team[kind]) } }))

export function duplicateOrder(o) {
  const s = getState()
  let num = o.num + '-C', k = 2
  while (s.orders.some((x) => x.num === num)) num = o.num + '-C' + k++
  const date = addDays(today(), 1)
  const note = o.missing.length ? 'Manquants : ' + o.missing.map((m) => m.qte + ' × ' + m.produit).join(', ') : ''
  setState((st) => ({ ...st, orders: [...st.orders, { id: uid(), num, client: o.client, date, prep: o.prep || null, driver: null, dock: null,
    pallets: 1, parcels: o.missing.reduce((a, m) => a + m.qte, 0) || 1, status: 'todo', missing: [], err: false, errNote: '', resolved: false, photos: [],
    comment: note, from: o.num, history: [{ ts: Date.now(), action: 'Complément de ' + o.num, by: 'Moi' }] }] }))
  return num
}
