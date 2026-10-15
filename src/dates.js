export const iso = (d) => {
  const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10)
}
export const addDays = (s, n) => { const d = new Date(s + 'T12:00'); d.setDate(d.getDate() + n); return iso(d) }
export const today = () => iso(new Date())
export const hhmm = (ts) => new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
export const uid = () => Math.random().toString(36).slice(2, 9)
export const fmtDM = (d) => d.slice(8, 10) + '/' + d.slice(5, 7)
