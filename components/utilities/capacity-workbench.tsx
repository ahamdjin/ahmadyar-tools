'use client'

import { useState } from 'react'
import { assess, scenarios, type Scenario } from '@/lib/utilities/capacity'
import { Field, ExportActions } from './workbench'

export function CapacityWorkbench({slug}: {slug: Scenario}) {
  const fields = scenarios[slug]
  const [values,setValues] = useState<string[]>(() => fields.map(([,n]) => String(n)))
  let report, error
  try { report = assess(slug,values.map(v => v.trim() ? Number(v) : NaN)) }
  catch (e) { error = e instanceof Error ? e.message : 'Check the scenario values.' }
  const retry = slug === 'retry-budget-calculator'
  return <div className={retry ? 'utility-workbench utility-compact retry-workbench' : 'utility-workbench utility-compact'}><div className="utility-layout">
    <section className="utility-panel"><header className="utility-panel-heading"><h2>Scenario</h2><button onClick={() => setValues(fields.map(([,n]) => String(n)))}>Reset example</button></header>
      <div className="utility-panel-body"><div className="utility-options">{fields.map(([label],i) => <Field key={label} label={label}><input type="number" min="0" step="any" value={values[i]} onChange={e => setValues(values.map((v,j) => i===j ? e.target.value : v))}/></Field>)}</div></div>
    </section>
    <section className="utility-panel"><header className="utility-panel-heading"><h2>Forecast</h2></header><div className="utility-panel-body">
      <p role="status" className={error ? 'utility-error' : retry ? 'retry-verdict' : undefined}>{error || report?.verdict}</p>
      {report && <><dl className="space-y-3">{report.rows.map(([key,value]) => <div key={key} className="flex flex-wrap justify-between gap-2"><dt>{key}</dt><dd className="font-medium tabular-nums">{value}</dd></div>)}</dl>
      {retry ? <details className="utility-notes"><summary>Waits between attempts</summary><ul>{report.detail.map(line => <li key={line}>{line}</li>)}</ul></details> : <ul className="utility-help">{report.detail.map(line => <li key={line}>{line}</li>)}</ul>}
      <details className="utility-notes"><summary>How this is calculated</summary>
        {slug === 'retry-budget-calculator' ? <p>Each retry doubles the previous wait window until the cap. Full jitter picks a delay uniformly between zero and that window, so the mean wait is half its size. The deadline check reserves the full window and full timeout for each attempt. Separately, the downstream ceiling is attempts raised to the number of retrying layers.</p> : <p>Throughput is the lower of worker capacity and the downstream cap. Excess arrivals accumulate during the burst. Afterward, only throughput left over after normal arrivals can clear that backlog. The staffing estimate recalculates both phases: it must handle normal traffic and process all arrivals across the burst and recovery window.</p>}
      </details>
      <ExportActions text={JSON.stringify({inputs:Object.fromEntries(fields.map(([label],i)=>[label,Number(values[i])])),...report},null,2)} filename={slug+'.json'}/></>}
    </div></section>
  </div></div>
}
