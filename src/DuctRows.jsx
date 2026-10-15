import { DIAMS, QUICK, LENS, fmtLen } from './pack'

export function Stepper({ v, set, min = 0, label }) {
  return (
    <div className="step">
      <button type="button" aria-label={'Moins ' + label} onClick={() => set(Math.max(min, v - 1))}>−</button>
      <b data-v={label}>{v}</b>
      <button type="button" aria-label={'Plus ' + label} onClick={() => set(v + 1)}>+</button>
    </div>
  )
}

export function DuctRows({ ducts, setDucts }) {
  const up = (i, p) => setDucts(ducts.map((g, k) => (k === i ? { ...g, ...p } : g)))
  return (<>
    {ducts.map((g, i) => (
      <div className="duct" key={i} data-duct>
        <div className="btns" style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
          {QUICK.map((d) => <button key={d} type="button" className={'big' + (g.d === d ? ' on' : '')} data-d={d} onClick={() => up(i, { d })}>Ø{d}</button>)}
        </div>
        <select value={g.d} onChange={(e) => up(i, { d: +e.target.value })} aria-label="Diamètre">{DIAMS.map((d) => <option key={d} value={d}>Ø{d} mm</option>)}</select>
        <div className="btns" style={{ flexWrap: 'nowrap' }}>
          {LENS.map((l) => <button key={l} type="button" className={'big' + (g.len === l ? ' on' : '')} data-len={l} onClick={() => up(i, { len: l })}>{fmtLen(l)}</button>)}
        </div>
        <Stepper v={g.q} set={(q) => up(i, { q })} min={1} label="longueurs" />
        <button type="button" className="x" onClick={() => setDucts(ducts.filter((_, k) => k !== i))}>Retirer cette ligne</button>
      </div>))}
    <button type="button" className="btn ghost" data-adduct onClick={() => setDucts([...ducts, { d: 160, len: 3, q: 1 }])}>+ ajouter un diamètre</button>
  </>)
}
