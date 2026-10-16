import { useSyncExternalStore } from 'react'

// Surlignage bref d'une commande venant d'être ajoutée (décoratif, l'état est déjà à jour)
let cur = null
const subs = new Set()
const emit = () => subs.forEach((f) => f())
export const flashOrder = (id) => { cur = id; emit(); setTimeout(() => { if (cur === id) { cur = null; emit() } }, 1400) }
export const useFlash = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => cur)
