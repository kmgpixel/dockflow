import { useState } from 'react'
import { Sheet, toast } from './ui'
import { buildSummary } from './buildText'

export function SummarySheet({ open, onClose, s, date }) {
  const [txt, setTxt] = useState('')
  const text = open ? (txt || buildSummary(s, date)) : ''
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); toast('Résumé copié') }
    catch { const t = document.querySelector('[data-summary-text]'); t?.select(); document.execCommand?.('copy'); toast('Résumé copié') }
  }
  const share = async () => { try { await navigator.share({ title: 'Résumé du soir', text }) } catch (e) { if (e.name !== 'AbortError') copy() } }
  return (
    <Sheet open={open} onClose={() => { setTxt(''); onClose() }}>
      <h2>Résumé du soir</h2>
      <textarea className="sumtxt" data-summary-text value={text} onChange={(e) => setTxt(e.target.value)} aria-label="Texte du résumé" />
      <div className="btns">
        <button className="btn acc" data-copy onClick={copy}>Copier</button>
        {navigator.share && <button className="btn" data-share onClick={share}>Partager</button>}
      </div>
      <button className="btn ghost" onClick={() => { setTxt(''); onClose() }}>Fermer</button>
    </Sheet>
  )
}
