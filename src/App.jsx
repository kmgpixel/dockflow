import { useEffect, useRef, useState } from 'react'
import { useScroll, useMotionValueEvent } from 'motion/react'
import { Tabbar } from './Tabbar'
import { useStore, today, firstRun, hasRealData } from './store'
import { Day } from './Day'
import { Trucks } from './Trucks'
import { Team, Settings } from './Team'
import { AddSheet } from './AddSheet'
import { PrepSheet } from './PrepSheet'
import { ProblemSheet, MenuSheet, PostponeSheet, DetailSheet } from './Sheets'
import { AnimatePresence } from 'motion/react'
import { Icon, Toaster, hideToast } from './ui'
import { Stats } from './Stats'
import { LoadOne } from './LoadOne'
import { Onboarding } from './Onboarding'
import { SummarySheet } from './Summary'

export default function App() {
  const s = useStore()
  const [tab, setTab0] = useState('day'), [date, setDate] = useState(today())
  const setTab = (t) => { hideToast(); setTab0(t) }
  const [onb, setOnb] = useState(() => { try { return /[?&]onboarding/.test(location.search) || (firstRun && !navigator.webdriver && !hasRealData(s)) } catch { return false } })
  const [sum, setSum] = useState(false), [add, setAdd] = useState(false), [detail, setDetail] = useState(null), [prob, setProb] = useState(null), [menu, setMenu] = useState(null), [post, setPost] = useState(null), [fin, setFin] = useState(null), [pk, setPk] = useState(null), [ld, setLd] = useState(null)
  useEffect(() => {
    const r = document.documentElement
    r.classList.toggle('dark', s.theme === 'dark'); r.classList.toggle('light', s.theme === 'light')
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', s.theme === 'dark' ? '#0f1012' : '#f3f1ec')
  }, [s.theme])
  useEffect(() => { document.documentElement.classList.toggle('dock-mode', !!s.settings?.dockMode) }, [s.settings?.dockMode])
  const scrollRef = useRef(null), [hid, setHid] = useState(false), anchor = useRef(0), last = useRef(0)
  const { scrollY } = useScroll({ container: scrollRef })
  useMotionValueEvent(scrollY, 'change', (v) => {
    if (v <= 10 || v < last.current) { setHid(false); anchor.current = v } else if (v - anchor.current > 40) setHid(true)
    last.current = v
  })
  const anySheet = !!(add || detail || prob || menu || post || fin || pk || ld || sum || onb)
  const fresh = (o) => o && s.orders.find((x) => x.id === o.id)
  const tabs = [['day', 'Jour'], ['truck', 'Camions'], ['plus'], ['team', 'Équipe'], ['set', 'Réglages']]
  return (
    <div className="app">
      <div className="scroll" ref={scrollRef}>
        {tab === 'day' && <Day onAdd={() => setAdd(true)} s={s} date={date} setDate={setDate} onOpen={setDetail} onProblem={setProb} onMenu={setMenu} onSummary={() => setSum(true)} onFinish={setFin} onLoad={setLd} onTrucks={() => setTab('truck')} />}
        {tab === 'truck' && <Trucks s={s} />}
        {tab === 'team' && <Team s={s} date={date} onStats={() => setTab('stats')} />}
        {tab === 'stats' && <Stats s={s} onBack={() => setTab('team')} />}
        {tab === 'set' && <Settings s={s} date={date} onStats={() => setTab('stats')} onSummary={() => setSum(true)} onOnboard={() => setOnb(true)} />}
      </div>
      <Tabbar tab={tab} setTab={setTab} onAdd={() => setAdd(true)} hidden={hid && !anySheet} />
      <AddSheet open={add} onClose={() => setAdd(false)} team={s.team} onAdded={(d) => { setTab0('day'); setDate(d) }} />
      <DetailSheet o={fresh(detail)} onClose={() => setDetail(null)} team={s.team} key={detail?.id || 'd'} onPack={setPk} onFinish={setFin} />
      <PrepSheet o={fresh(fin)} onClose={() => setFin(null)} team={s.team} onMissing={setProb} key={'f' + (fin?.id || '')} />
      <PrepSheet o={fresh(pk)} onClose={() => setPk(null)} team={s.team} edit key={'p' + (pk?.id || '')} />
      <LoadOne o={fresh(ld)} s={s} onClose={() => setLd(null)} key={'l' + (ld?.id || '')} />
      <ProblemSheet o={fresh(prob)} onClose={() => setProb(null)} />
      <MenuSheet o={fresh(menu)} onClose={() => setMenu(null)} team={s.team} onPostpone={setPost} />
      <PostponeSheet o={fresh(post)} onClose={() => setPost(null)} />
      <SummarySheet open={sum} onClose={() => setSum(false)} s={s} date={date} />
      <AnimatePresence>{onb && <Onboarding s={s} onDone={() => setOnb(false)} key="onb" />}</AnimatePresence>
      <Toaster />
    </div>
  )
}
