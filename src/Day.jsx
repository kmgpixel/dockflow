import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Card } from './Card'
import { Icon } from './ui'
import { Dash } from './Dash'
import { StatusIcon } from './StatusIcon'
import { Alerts } from './Alerts'
import { StickHead } from './StickHead'
import { alerts, sevMap } from './calcAlerts'
import { GlobalSearch } from './GlobalSearch'
import { VoiceSearch } from './VoiceSearch'
import { setSettings } from './store'
import { withUndo } from './undo'
import { STATUS, NEXT, today, addDays, hasIssue, advance } from './store'

const fmt = (d) => new Date(d + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

export function Day({ s, date, setDate, onOpen, onProblem, onMenu, onSummary, onFinish, onLoad, onTrucks }) {
  const [q, setQ] = useState(''), [fs, setFs] = useState(null), [fp, setFp] = useState(null), [openId, setOpenId] = useState(null)
  const toggle = useCallback((id) => setOpenId((c) => (c === id ? null : id)), [])
  const hint = useMemo(() => { try { return !localStorage.getItem('df-swipe-hint') } catch { return false } }, [])
  useEffect(() => { if (hint) try { localStorage.setItem('df-swipe-hint', '1') } catch {} }, [hint])
  const t = today()
  const sevs = useMemo(() => sevMap(alerts(s)), [s])
  const list = useMemo(() => s.orders.filter((o) => o.date === date && (!fs || (fs === 'issue' ? hasIssue(o) : o.status === fs)) && (!fp || o.prep === fp) &&
    (!q || (o.num + o.client + (o.city || '')).toLowerCase().includes(q.toLowerCase()))).sort((a, b) => (a.time || '99').localeCompare(b.time || '99')), [s.orders, date, fs, fp, q])
  const all = s.orders.filter((o) => o.date === date && o.status !== 'cancel')
  const days = [[t, 'Auj.'], [addDays(t, 1), 'Demain'], [addDays(t, 2), 'J+2']]
  const custom = !days.some((d) => d[0] === date)
  const advanceCard = useCallback((o) => (NEXT[o.status] === 'ready' ? onFinish(o) : withUndo('Statut mis à jour', () => advance(o))), [onFinish])
  const qa = useMemo(() => ({ onFinish, onProblem, onMenu, onLoad, onTrucks }), [onFinish, onProblem, onMenu, onLoad, onTrucks])
  const [x0, setX0] = useState(null)
  const sw = (dx) => { if (Math.abs(dx) > 70) setDate(addDays(date, dx < 0 ? 1 : -1)) }
  return (
    <div onTouchStart={(e) => setX0(e.target.closest('[data-card],.filters') ? null : [e.touches[0].clientX, e.touches[0].clientY])}
      onTouchEnd={(e) => { if (x0 && Math.abs(e.changedTouches[0].clientY - x0[1]) < 40) sw(e.changedTouches[0].clientX - x0[0]) }}>
      <div className="top">
        <div className="row"><span className="brand"><i />DOCKFLOW</span><span><button className="lnk" data-dockshort onClick={() => setSettings({ dockMode: !s.settings?.dockMode })}>{s.settings?.dockMode ? 'Mode quai : oui' : 'Au quai'}</button> <button className="lnk" data-summary onClick={onSummary}>Résumé du soir</button></span></div>
        <h1>{date === t ? "Aujourd'hui" : date === addDays(t, 1) ? 'Demain' : 'Livraisons'}</h1>
        <div className="sub">{fmt(date)} · {all.length} commande{all.length > 1 ? 's' : ''}</div>
        <div className="days">
          {days.map(([d, l]) => <button key={d} className={d === date ? 'on' : ''} onClick={() => setDate(d)}>{l}</button>)}
          <label className="days-cal" style={{ flex: 1, position: 'relative' }}>
            <span className={'calbtn' + (custom ? ' on' : '')}><Icon n="cal" />{custom ? date.slice(5) : ''}</span>
            <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0 }} aria-label="Calendrier" />
          </label>
        </div>
      </div>
      <Dash os={all} fs={fs} setFs={setFs} />
      {!q && date === t && <Alerts s={s} onOpen={onOpen} />}
      <StickHead title={date === t ? "Aujourd'hui" : date === addDays(t, 1) ? 'Demain' : 'Livraisons'} sub={all.length + ' commande' + (all.length > 1 ? 's' : '')}>
      <div className="search"><VoiceSearch q={q} setQ={setQ} /></div>
      <div className="filters">
        {Object.entries(STATUS).slice(0, 5).map(([k2, v]) => <button key={k2} className={'chip' + (fs === k2 ? ' on' : '')} onClick={() => setFs(fs === k2 ? null : k2)}><StatusIcon k={k2} size={15} />{v.l}</button>)}
        {s.team.preps.filter((p) => p.on).map((p) => <button key={p.id} className={'chip' + (fp === p.id ? ' on' : '')} onClick={() => setFp(fp === p.id ? null : p.id)}>{p.name.split(' ')[0]}</button>)}
      </div>
      </StickHead>
      <div className="sec"><span>Commandes</span><span>{list.length}</span></div>
      <div className="list">
        <AnimatePresence initial={false} mode="popLayout">
          {list.map((o, i) => <Card key={o.id} o={o} sev={sevs[o.id]} team={s.team} open={openId === o.id} hint={hint && i === 0 && !s.settings?.noSwipe} noSwipe={!!s.settings?.noSwipe} onToggle={toggle} qa={qa} onOpen={onOpen} onProblem={onProblem} onMenu={onMenu} onAdvance={advanceCard} />)}
        </AnimatePresence>
        {!list.length && <div className="meta" style={{ textAlign: 'center', padding: 30 }}>Aucune commande. Touchez + pour en ajouter.</div>}
      </div>
      <GlobalSearch s={s} q={q} date={date} onOpen={onOpen} />
    </div>
  )
}
