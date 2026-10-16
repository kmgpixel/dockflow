import { setSettings, setTheme, replaceAll, resetDemo, loadDemo, getState } from './store'
import { reportPdf, deliver } from './pdf'
import { toast } from './ui'
import { Row, Section } from './SettingsList'

export function Settings({ s, date, onStats, onSummary, onOnboard }) {
  const backup = async () => {
    const blob = new Blob([JSON.stringify(getState())], { type: 'application/json' })
    const file = new File([blob], 'dockflow-sauvegarde.json', { type: 'application/json' })
    try { if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file] }); return } } catch (e) { if (e.name === 'AbortError') return }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click()
  }
  const restore = async (e) => {
    try { const j = JSON.parse(await e.target.files[0].text()); if (!j.orders || !j.team) throw 0; replaceAll(j); toast('Données restaurées') } catch { toast('Fichier invalide') }
  }
  const dm = !!s.settings?.dockMode, sw = !s.settings?.noSwipe
  return (
    <div>
      <div className="top"><span className="brand"><i />DOCKFLOW</span><h1>Réglages</h1></div>
      <Section title="Apparence">
        <div className="srow" style={{ cursor: 'default' }}><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M12 4v16" /></svg><span className="sl">Thème</span></div>
        <div className="seg3" style={{ borderTop: 0, paddingTop: 0 }}>{[['auto', 'Auto'], ['light', 'Clair'], ['dark', 'Sombre']].map(([k, l]) =>
          <button key={k} className={'chip' + (s.theme === k ? ' on' : '')} onClick={() => setTheme(k)}>{l}</button>)}</div>
        <Row icon="dock" label="Mode au quai" sub="Textes plus grands, boutons larges" sw={dm} data-dockmode aria-pressed={dm} onClick={() => setSettings({ dockMode: !dm })} />
        <Row icon="swipe" label="Glisser les cartes" sub={sw ? "Glisser une carte change son statut" : "Seulement les boutons de la carte dépliée"} sw={sw} data-swipeopt aria-pressed={sw} onClick={() => setSettings({ noSwipe: sw })} />
      </Section>
      <Section title="Rapports">
        <Row icon="sum" label="Résumé du soir" chev data-summary onClick={onSummary} />
        <Row icon="stats" label="Statistiques de la semaine" chev onClick={onStats} />
        <Row icon="pdf" label="Rapport du jour (PDF)" chev data-report onClick={() => deliver(reportPdf(getState(), date), 'rapport-' + date + '.pdf')} />
      </Section>
      <Section title="Sauvegarde">
        <Row icon="save" label="Sauvegarder (.json)" chev data-backup onClick={backup} />
        <label className="srow"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M7 9l5-5 5 5M5 20h14" /></svg><span className="sl">Restaurer…</span><span className="chev" aria-hidden="true">›</span><input type="file" accept="application/json,.json" hidden data-restore onChange={restore} /></label>
      </Section>
      <Section title="Équipe"><Row icon="team" label="Configurer mon équipe" chev data-onboard onClick={onOnboard} /></Section>
      <Section title="Zone de danger">
        <Row icon="demo" label="Recharger les données de démo" onClick={loadDemo} />
        <Row icon="clear" label="Vider les données de démo" danger data-clear onClick={() => { if (confirm('Vider toutes les commandes ?')) { resetDemo(); toast('Données vidées') } }} />
      </Section>
      <Section title="À propos"><div className="abt">DockFlow v1.4 — suivi des livraisons du dépôt. Données stockées uniquement sur cet appareil. Toutes les données de démo sont fictives.</div></Section>
      <div style={{ height: 'var(--sp-6)' }} />
    </div>
  )
}
