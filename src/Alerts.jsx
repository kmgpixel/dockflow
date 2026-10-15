import { alerts } from './calcAlerts'

export function Alerts({ s, onOpen }) {
  const a = alerts(s)
  if (!a.length) return null
  return (<>
    <div className="sec"><span>À relancer</span><span className="badge" data-alertcount>{a.length}</span></div>
    <div className="list" style={{ paddingBottom: 0 }} data-alerts>
      {a.map((x, i) => (
        <button key={x.o.id + x.kind} className="alert" onClick={() => onOpen(x.o)}>
          <span className="num">{x.o.num}</span><span className="cli2">{x.o.client.split('—').pop().trim()}</span>
          <span className="why">{x.txt}</span>
        </button>))}
    </div></>)
}
