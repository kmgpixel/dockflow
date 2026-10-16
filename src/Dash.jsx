import { motion } from 'motion/react'
import { Count } from './ui'
import { StatusIcon } from './StatusIcon'
import { hasIssue } from './store'
import { fmtH } from './pack'

const SP = { type: 'spring', stiffness: 600, damping: 40 }
const OUT = ['go', 'done', 'fail', 'moved']

// Données réelles uniquement : tout est dérivé des commandes du jour
export function dashStats(os) {
  const all = os.filter((o) => o.status !== 'cancel')
  const n = (f) => all.filter(f).length
  const started = n((o) => OUT.includes(o.status)) > 0
  const nDone = n((o) => o.status === 'done'), nReady = n((o) => ['ready', 'loaded', ...OUT].includes(o.status))
  const next = all.filter((o) => o.time && !['done', 'fail', 'moved'].includes(o.status)).sort((a, b) => a.time.localeCompare(b.time))[0]
  return {
    total: all.length, started, main: started ? nDone : nReady, label: started ? 'livrée' : 'prête', next,
    chips: [['À préparer', n((o) => ['todo', 'prep', 'wait'].includes(o.status)), 'todo'], ['Prête', n((o) => ['ready', 'loaded'].includes(o.status)), 'ready'],
      ['Partie', n((o) => ['go', 'done'].includes(o.status)), 'go'], ['Problème', n(hasIssue), 'issue']].map(([l, v, k]) => [k === 'todo' || v < 2 ? l : l + 's', v, k]),
    seg: [['var(--todo)', n((o) => o.status === 'todo')], ['var(--prep)', n((o) => ['prep', 'wait'].includes(o.status))], ['var(--ready)', n((o) => o.status === 'ready')],
      ['var(--load)', n((o) => o.status === 'loaded')], ['var(--go)', n((o) => o.status === 'go')], ['var(--done)', n((o) => o.status === 'done')]],
  }
}

export function Dash({ os, fs, setFs }) {
  const d = dashStats(os)
  const lab = d.label + (d.main > 1 ? 's' : '')
  return (
    <section className="dash" data-dash>
      <div className="gauge"><strong><Count value={d.main} /></strong><span className="of">sur</span><strong className="tot"><Count value={d.total} /></strong><span className="lab">{lab}</span></div>
      <div className="seg">{d.seg.map(([c, v], i) => <motion.i key={i} initial={false} animate={{ flexGrow: v, opacity: v ? 1 : 0 }} transition={SP} style={{ background: c, flexBasis: 0 }} />)}</div>
      <div className="pills">
        {d.chips.map(([l, v, k]) => {
          const bad = k === 'issue', on = bad && fs === 'issue'
          const body = <><b><Count value={v} /></b><span>{l}</span></>
          return bad
            ? <button key={l} className={'dp bad' + (v ? ' act' : '') + (on ? ' on' : '')} data-issue-chip onClick={() => setFs(on ? null : 'issue')} aria-pressed={on}>{body}</button>
            : <div key={l} className="dp">{body}</div>
        })}
      </div>
      {d.next && <div className="next" data-next><StatusIcon k="go" size={16} /><span>Prochaine : <b>{fmtH(d.next.time)}</b> · {d.next.client}</span></div>}
    </section>
  )
}
