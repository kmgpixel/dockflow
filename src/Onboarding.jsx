import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { setState, hasRealData, uid } from './store'

const sp = { duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }
function Chips({ list, setList, ph, kind }) {
  const [n, setN] = useState('')
  const add = () => { const v = n.trim(); if (v && !list.some((x) => x.name === v)) setList([...list, { id: uid(), name: v, on: true }]); setN('') }
  return (<>
    <div className="ob-chips" data-ob-list={kind}>
      <AnimatePresence initial={false}>{list.map((p) => (
        <motion.button key={p.id} layout className="ob-chip" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.18 }}
          aria-label={'Retirer ' + p.name} onClick={() => setList(list.filter((x) => x.id !== p.id))}>{p.name}<span aria-hidden="true">×</span></motion.button>))}</AnimatePresence>
    </div>
    <div className="btns" style={{ flexWrap: 'nowrap' }}>
      <input placeholder={ph} value={n} data-ob-input={kind} onChange={(e) => setN(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} style={{ flex: 3 }} />
      <button className="btn acc" style={{ flex: 1, minWidth: 70 }} aria-label="Ajouter" onClick={add}>+</button>
    </div></>)
}

export function Onboarding({ s, onDone }) {
  const [step, setStep] = useState(0), [dir, setDir] = useState(1)
  const [name, setName] = useState(s.settings?.manager || '')
  const [preps, setPreps] = useState(s.team.preps.filter((p) => p.on).map((p) => ({ ...p })))
  const [drivers, setDrivers] = useState(s.team.drivers.filter((p) => p.on).map((p) => ({ ...p })))
  const [docks, setDocks] = useState(s.team.docks.filter((p) => p.on).map((p) => ({ ...p })))
  const [mode, setMode] = useState('demo')
  const go = (d) => { setDir(d); setStep((x) => x + d) }
  const finish = () => {
    setState((st) => ({ ...st, settings: { ...(st.settings || {}), manager: name.trim() },
      team: { preps, drivers, docks }, orders: mode === 'empty' && !hasRealData(st) ? [] : st.orders }))
    onDone()
  }
  const steps = [
    (<><h1>Bienvenue</h1><p className="meta">DockFlow suit vos livraisons du dépôt. Trois étapes rapides.</p>
      <div className="lbl">Votre prénom</div><input value={name} data-ob-name placeholder="Prénom" onChange={(e) => setName(e.target.value)} /></>),
    (<><h1>Votre équipe</h1><div className="lbl">Préparateurs</div><Chips list={preps} setList={setPreps} ph="Ajouter un préparateur" kind="preps" />
      <div className="lbl">Livreurs</div><Chips list={drivers} setList={setDrivers} ph="Ajouter un livreur" kind="drivers" /></>),
    (<><h1>Vos quais</h1><Chips list={docks} setList={setDocks} ph="Ajouter un quai" kind="docks" />
      <div className="lbl">Pour commencer</div>
      <div className="btns">{[['demo', 'Commencer avec des exemples'], ['empty', 'Commencer vide']].map(([k, l]) =>
        <button key={k} className={'big' + (mode === k ? ' on' : '')} data-ob-mode={k} onClick={() => setMode(k)}>{l}</button>)}</div></>),
  ]
  return (
    <motion.div className="ob" data-onboarding initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <div className="ob-body">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div key={step} custom={dir} variants={{ in: (d) => ({ x: 60 * d, opacity: 0 }), on: { x: 0, opacity: 1 }, out: (d) => ({ x: -60 * d, opacity: 0 }) }}
            initial="in" animate="on" exit="out" transition={sp} className="ob-step" data-ob-step={step + 1}>{steps[step]}</motion.div>
        </AnimatePresence>
      </div>
      <div className="ob-foot">
        <div className="ob-dots">{[0, 1, 2].map((i) => <motion.i key={i} animate={{ width: i === step ? 22 : 8, opacity: i <= step ? 1 : 0.35 }} transition={{ duration: 0.2 }} />)}</div>
        <div className="btns" style={{ flexWrap: 'nowrap' }}>
          {step === 0 ? <button className="btn ghost" data-ob-skip onClick={onDone}>Plus tard</button> : <button className="btn ghost" data-ob-back onClick={() => go(-1)}>Retour</button>}
          {step < 2 ? <button className="btn acc" data-ob-next onClick={() => go(1)}>Suivant</button> : <button className="btn acc" data-ob-finish onClick={finish}>Terminer</button>}
        </div>
      </div>
    </motion.div>)
}
