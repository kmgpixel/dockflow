import { useEffect, useState } from 'react'
import { useStore, today } from './store'
import { Day } from './Day'
import { Trucks } from './Trucks'
import { Team, Settings } from './Team'
import { AddSheet, ProblemSheet, MenuSheet, PostponeSheet, DetailSheet } from './Sheets'
import { Icon, Toaster } from './ui'
import { Stats } from './Stats'
import { SummarySheet } from './Summary'

export default function App() {
  const s = useStore()
  const [tab, setTab] = useState('day'), [date, setDate] = useState(today())
  const [sum, setSum] = useState(false), [add, setAdd] = useState(false), [detail, setDetail] = useState(null), [prob, setProb] = useState(null), [menu, setMenu] = useState(null), [post, setPost] = useState(null)
  useEffect(() => {
    const r = document.documentElement
    r.classList.toggle('dark', s.theme === 'dark'); r.classList.toggle('light', s.theme === 'light')
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', s.theme === 'dark' ? '#0f1012' : '#f3f1ec')
  }, [s.theme])
  const fresh = (o) => o && s.orders.find((x) => x.id === o.id)
  const tabs = [['day', 'Jour'], ['truck', 'Camions'], ['plus'], ['team', 'Équipe'], ['set', 'Réglages']]
  return (
    <div className="app">
      <div className="scroll">
        {tab === 'day' && <Day s={s} date={date} setDate={setDate} onOpen={setDetail} onProblem={setProb} onMenu={setMenu} onSummary={() => setSum(true)} />}
        {tab === 'truck' && <Trucks s={s} date={date} />}
        {tab === 'team' && <Team s={s} date={date} onStats={() => setTab('stats')} />}
        {tab === 'stats' && <Stats s={s} onBack={() => setTab('team')} />}
        {tab === 'set' && <Settings s={s} date={date} onStats={() => setTab('stats')} onSummary={() => setSum(true)} />}
      </div>
      <nav className="tabbar">
        {tabs.map(([k, l]) => k === 'plus'
          ? <button key={k} className="plus" aria-label="Ajouter une commande" data-add onClick={() => setAdd(true)}>+</button>
          : <button key={k} className={tab === k || (k === 'team' && tab === 'stats') ? 'on' : ''} onClick={() => setTab(k)}><Icon n={k === 'truck' ? 'truck' : k} />{l}</button>)}
      </nav>
      <AddSheet open={add} onClose={() => setAdd(false)} team={s.team} date={date} key={date} />
      <DetailSheet o={fresh(detail)} onClose={() => setDetail(null)} team={s.team} key={detail?.id || 'd'} />
      <ProblemSheet o={fresh(prob)} onClose={() => setProb(null)} />
      <MenuSheet o={fresh(menu)} onClose={() => setMenu(null)} team={s.team} onPostpone={setPost} />
      <PostponeSheet o={fresh(post)} onClose={() => setPost(null)} />
      <SummarySheet open={sum} onClose={() => setSum(false)} s={s} date={date} />
      <Toaster />
    </div>
  )
}
