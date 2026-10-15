import { useSyncExternalStore } from 'react'
import { get, set } from 'idb-keyval'

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

export { iso, addDays, today, hhmm, uid, fmtDM } from './dates'
import { today, addDays, hhmm, uid } from './dates'
import { formatPack } from './pack'
import { migrate } from './migrate'
import { seed } from './seed'

let state = null
export let firstRun = false
const subs = new Set()
const emit = () => { subs.forEach((f) => f()); set('dockflow', state).catch(() => {}) }
export const getState = () => state
export function useStore() { return useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => state) }
export async function init() {
  try { state = (await get('dockflow')) || null } catch { state = null }
  const had = state; firstRun = !had; state = state ? migrate(state) : seed()
  if (had && had.v !== state.v) set('dockflow', state).catch(() => {})
  try { navigator.storage?.persist?.() } catch {}
}
export const setState = (fn) => { state = fn(state); emit() }
export const replaceAll = (s) => { state = migrate(s); emit() }
export const resetDemo = () => { state = { ...seed(), orders: [], theme: state.theme }; emit() }
export const loadDemo = () => { state = seed(); emit() }

const log = (o, action, by = 'Moi') => ({ ...o, history: [...o.history, { ts: Date.now(), action, by }] })
export const upd = (id, fn, action) => setState((s) => ({
  ...s, orders: s.orders.map((o) => (o.id === id ? (action ? log(fn(o), action) : fn(o)) : o)),
}))
export const nameOf = (list, id) => list.find((x) => x.id === id)?.name || '—'

export const addOrder = (o) => setState((s) => ({
  ...s, orders: [...s.orders, { id: uid(), num: o.num.trim(), client: o.client.trim(), city: (o.city || '').trim(), time: o.time || '', date: o.date, prep: o.prep || null,
    driver: null, dock: null, pallets: 0, parcels: 0, bulk: false, bulkNote: '', ducts: [], status: 'todo', missing: [], err: false, errNote: '', resolved: false, photos: [], comment: '',
    history: [{ ts: Date.now(), action: 'Commande créée', by: 'Moi' }] }],
}))
export const finishPrep = (id, pk) => {
  const s = getState(), pn = nameOf(s.team.preps, pk.prep).replace(/\s*\(resp\.?\)/i, '')
  upd(id, (x) => ({ ...x, ...pk, prep: pk.prep || x.prep, status: 'ready', packedAt: Date.now() }), 'Préparation terminée · ' + pn + ' · ' + formatPack(pk))
}
export const setPack = (id, pk) => upd(id, (x) => ({ ...x, ...pk }), 'Conditionnement : ' + formatPack(pk))
export const advance = (o) => NEXT[o.status] && upd(o.id, (x) => ({ ...x, status: NEXT[x.status] }), 'Statut → ' + STATUS[NEXT[o.status]].l)
export const setStatus = (id, st, note) => upd(id, (x) => ({ ...x, status: st }), 'Statut → ' + STATUS[st].l + (note ? ' (' + note + ')' : ''))
export const postpone = (id, date) => upd(id, (x) => ({ ...x, status: 'moved', date, driver: null }), 'Reportée au ' + date)
export const addProblem = (id, p) => upd(id, (x) => ({
  ...x, resolved: false, missing: [...x.missing, ...(p.missing || [])], err: x.err || p.err, errNote: p.errNote || x.errNote,
  photos: [...x.photos, ...(p.photos || [])],
}), 'Problème signalé' + (p.missing?.length ? ' : manquants' : '') + (p.err ? ' : erreur de préparation' : ''))
export const resolve = (id) => upd(id, (x) => ({ ...x, resolved: true }), 'Problème résolu')
export const hasIssue = (o) => !o.resolved && (o.missing.length > 0 || o.err)

export const lastDock = (s, driver) => [...s.orders].filter((o) => o.driver === driver && o.dock).sort((a, b) => (b.loadedAt || 0) - (a.loadedAt || 0))[0]?.dock || null
export const loadTo = (ids, driver, dock) => setState((s) => {
  const dk = dock || lastDock(s, driver), ts = Date.now()
  return { ...s, orders: s.orders.map((o) => (ids.includes(o.id) ? log({ ...o, driver, dock: dk, status: 'loaded', loadedAt: ts },
    'Chargée → ' + nameOf(s.team.drivers, driver) + ' à ' + hhmm(ts)) : o)) }
})
// Le départ concerne tout ce qui est chargé pour ce livreur, quel que soit le jour de livraison
export const depart = (driver, date) => setState((s) => {
  const ts = Date.now()
  return { ...s, departs: { ...s.departs, [driver + date]: ts }, orders: s.orders.map((o) =>
    o.driver === driver && o.status === 'loaded' ? log({ ...o, status: 'go', departAt: ts, departedAt: ts }, 'Départ ' + hhmm(ts)) : o) }
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
  setState((st) => ({ ...st, orders: [...st.orders, { id: uid(), num, client: o.client, city: o.city || '', time: o.time || '', date, prep: o.prep || null, driver: null, dock: null,
    pallets: 0, parcels: o.missing.reduce((a, m) => a + m.qte, 0) || 0, bulk: false, bulkNote: '', ducts: [], status: 'todo', missing: [], err: false, errNote: '', resolved: false, photos: [],
    comment: note, from: o.num, history: [{ ts: Date.now(), action: 'Complément de ' + o.num, by: 'Moi' }] }] }))
  return num
}
export const setSettings = (patch) => setState((s) => ({ ...s, settings: { ...(s.settings || {}), ...patch } }))
export const hasRealData = (s) => s.orders.some((o) => o.history.some((h) => h.by !== 'Démo'))
