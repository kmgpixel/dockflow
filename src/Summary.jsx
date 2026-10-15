import { useState } from 'react'
import { Sheet, toast } from './ui'
import { buildSummary } from './buildText'

const ID = /((?:SO-L|SO-|C-)[0-9][\w-]*)/

export function SummarySheet({ open, onClose, s, date }) {
  const [txt, setTxt] = useState('')
  const [edit, setEdit] = useState(false)
  const text = open ? (txt || buildSummary(s, date)) : ''
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); toast('Résumé copié') }
    catch { const t = document.querySelector('[data-summary-text]'); t?.select(); document.execCommand?.('copy'); toast('Résumé copié') }
  }
  const share = async () => { try { await navigator.share({ title: 'Résumé du soir', text }) } catch (e) { if (e.name !== 'AbortError') copy() } }
  return (
    <Sheet open={open} onClose={() => { setTxt(''); setEdit(false); onClose() }}>
      <h2>Résumé du soir</h2>
      {!edit ? (
        <div className="sumprev" data-summary-prev onClick={() => setEdit(true)}>
          {text.split('\n').map((l, i) => <div key={i} className={/^[^ ].*:$|^Résumé/.test(l) ? 'h' : ''}>{l.split(ID).map((x, k) => (k % 2 ? <span key={k} className="id">{x}</span> : x.replace(/(\d+) × Ø(\d+) ([\d,]+) m/g, '$1\u00a0×\u00a0Ø$2\u00a0$3\u00a0m')))}</div>)}
        </div>) : null}
      <textarea className="sumtxt" data-summary-text style={edit ? null : { display: 'none' }} ref={(el) => { if (el && edit) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 2 + 'px' } }} value={text} onChange={(e) => setTxt(e.target.value)} aria-label="Texte du résumé" />
      <button className="btn ghost" data-sum-edit onClick={() => setEdit(!edit)}>{edit ? 'Aperçu' : 'Modifier le texte'}</button>
      <div className="btns">
        <button className="btn acc" data-copy onClick={copy}>Copier</button>
        {navigator.share && <button className="btn" data-share onClick={share}>Partager</button>}
      </div>
      <button className="btn ghost" onClick={() => { setTxt(''); onClose() }}>Fermer</button>
    </Sheet>
  )
}
