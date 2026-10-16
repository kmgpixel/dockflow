const I = {
  theme: <><circle cx="12" cy="12" r="8" /><path d="M12 4v16" /></>,
  dock: <><path d="M4 20V8l8-4 8 4v12M9 20v-6h6v6" /></>,
  swipe: <><path d="M4 12h16M15 7l5 5-5 5" /></>,
  sum: <><path d="M6 3h9l4 4v14H6zM9 12h7M9 16h7" /></>,
  stats: <><path d="M5 20V10M12 20V4M19 20v-7" /></>,
  pdf: <><path d="M6 3h9l4 4v14H6zM15 3v4h4" /></>,
  save: <><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></>,
  rest: <><path d="M12 15V4M7 9l5-5 5 5M5 20h14" /></>,
  team: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M16 5a3 3 0 010 6M18 14c2 .6 3 2.6 3 6" /></>,
  demo: <><path d="M4 12a8 8 0 0114-5l2 2M20 4v5h-5M20 12a8 8 0 01-14 5l-2-2M4 20v-5h5" /></>,
  clear: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8h.01" /></>,
}
export const Ic = ({ k }) => <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">{I[k]}</svg>

export function Row({ icon, label, sub, chev, sw, danger, children, ...rest }) {
  return (
    <button type="button" className={'srow' + (danger ? ' danger' : '')} {...rest}>
      <Ic k={icon} /><span className="sl">{label}{sub && <small>{sub}</small>}</span>
      {sw !== undefined ? <i className={'sw' + (sw ? ' on' : '')} /> : chev ? <span className="chev" aria-hidden="true">›</span> : null}{children}
    </button>)
}
export const Section = ({ title, children }) => (<><div className="sec"><span>{title}</span></div><div className="sgroup">{children}</div></>)
