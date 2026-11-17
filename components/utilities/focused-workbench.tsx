'use client'

import { useEffect, useRef, useState } from 'react'
import { Field, ExportActions } from './workbench'
import type { Job, Result } from '@/lib/utilities/engine'
import './workbench.css'

// Both focused tools share the same bounded worker lifecycle and result controls.
function useLocalJob() {
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const active = useRef<{ worker: Worker; timer: ReturnType<typeof setTimeout> } | null>(null)
  function stop() {
    if (active.current) { active.current.worker.terminate(); clearTimeout(active.current.timer); active.current = null }
    setBusy(false)
  }
  useEffect(() => () => { if (active.current) { active.current.worker.terminate(); clearTimeout(active.current.timer) } }, [])
  function reset() { setResult(null); setError('') }
  function run(job: Job) {
    stop(); reset(); setBusy(true)
    try {
      const worker = new Worker(new URL('../../lib/utilities/utility.worker.ts', import.meta.url))
      const timer = setTimeout(() => { stop(); setError('Processing exceeded 3 seconds. Reduce the input and try again.') }, 3000)
      active.current = { worker, timer }
      worker.onmessage = ({ data }: MessageEvent<{ result?: Result; error?: string }>) => {
        stop(); if (data.error) setError(data.error); else if (data.result) setResult(data.result)
      }
      worker.onerror = () => { stop(); setError('Background processing could not run. Reload the page and try again.') }
      worker.postMessage(job)
    } catch { stop(); setError('Background processing is unavailable in this browser.') }
  }
  return { result, error, busy, reset, run, cancel: () => { stop(); setError('Processing cancelled.') } }
}

function Report({ result, filename }: { result: Result; filename: string }) {
  return <><ExportActions key={result.text} text={result.text} filename={filename} /><details className="utility-disclosure"><summary>Report JSON</summary><pre>{result.text}</pre></details><details className="utility-notes"><summary>Notes & limitations</summary><ul>{result.warnings.map((w) => <li key={w}>{w}</li>)}</ul></details></>
}

export function FocusedWorkbench({ compare }: { compare: boolean }) {
  const [input, setInput] = useState('')
  const [updated, setUpdated] = useState('')
  const [format, setFormat] = useState<'seconds' | 'milliseconds' | 'iso'>('seconds')
  const [zone, setZone] = useState('UTC')
  const { result, error, busy, reset, run, cancel } = useLocalJob()
  const disabled = busy || !input.trim() || (compare && !updated.trim())
  function example() {
    if (compare) { setInput('{\n  "name": "Alex",\n  "active": false,\n  "plan": "starter"\n}'); setUpdated('{\n  "name": "Alex",\n  "active": true,\n  "seats": 3\n}') }
    else { setInput('1794906000'); setFormat('seconds') }
    reset()
  }
  return <div className={`utility-workbench${compare ? '' : ' utility-compact'}`}>
    <div className="mb-4 flex justify-end"><button type="button" disabled={busy} onClick={example}>Load example</button></div>
    <div className="utility-layout">
      <section className="utility-panel" aria-labelledby="focused-input-title">
        <header className="utility-panel-heading"><h2 id="focused-input-title">{compare ? 'Original' : 'Timestamp'}</h2></header>
        <div className="utility-panel-body">
          {!compare && <Field label="Input format"><select value={format} disabled={busy} onChange={(e) => { setFormat(e.target.value as typeof format); reset() }}><option value="seconds">Unix seconds</option><option value="milliseconds">Unix milliseconds</option><option value="iso">ISO 8601 with UTC offset</option></select></Field>}
          <Field label={compare ? 'Original JSON' : 'Value'}>{compare ? <textarea rows={12} value={input} disabled={busy} maxLength={200001} spellCheck={false} onChange={(e) => { setInput(e.target.value); reset() }} placeholder={'{\n  "active": false\n}'} /> : <input value={input} disabled={busy} maxLength={100} spellCheck={false} onChange={(e) => { setInput(e.target.value); reset() }} placeholder={format === 'iso' ? '2026-11-17T09:00:00Z' : '1794906000'} />}</Field>
          {!compare && <><Field label="Display time zone" hint="IANA zone, such as America/New_York."><input value={zone} disabled={busy} onChange={(e) => { setZone(e.target.value); reset() }} /></Field><button type="button" className="utility-secondary self-start" disabled={busy} onClick={() => { setInput(new Date().toISOString()); setFormat('iso'); reset() }}>Use current time</button></>}
          {!compare && <><div className="utility-run-row"><button type="button" className="utility-primary" disabled={disabled} onClick={() => run({ kind: 'timestamp', input, format, zone })}>{busy ? 'Processing...' : 'Convert timestamp'}</button>{busy && <button type="button" onClick={cancel}>Cancel</button>}</div>{error && <p role="alert" className="utility-error">{error}</p>}</>}
        </div>
      </section>
      <section className="utility-panel" aria-labelledby="focused-second-title">
        <header className="utility-panel-heading"><h2 id="focused-second-title">{compare ? 'Updated' : 'Converted time'}</h2></header>
        <div className="utility-panel-body">
          {compare ? <Field label="Updated JSON"><textarea rows={12} value={updated} disabled={busy} maxLength={200001} spellCheck={false} onChange={(e) => { setUpdated(e.target.value); reset() }} placeholder={'{\n  "active": true\n}'} /></Field> : result ? <><p className="utility-summary" role="status">{result.summary}</p><dl className="utility-values">{result.rows?.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><Report result={result} filename="timestamp.json" /></> : <p className="utility-help">Enter a value and choose Convert timestamp, or load the example.</p>}
        </div>
      </section>
    </div>
    {compare && <><div className="utility-run-row mt-5"><button type="button" className="utility-primary" disabled={disabled} onClick={() => run({ kind: 'compare', input, updated })}>{busy ? 'Processing...' : 'Compare JSON'}</button>{busy && <button type="button" onClick={cancel}>Cancel</button>}</div>{error && <p role="alert" className="utility-error mt-4">{error}</p>}</>}
    {compare && <p className="utility-help mt-3">Object key order is ignored. Arrays are compared by position. Up to 200,000 characters per document.</p>}
    {compare && result && <section className="utility-panel utility-comparison-result" aria-labelledby="comparison-title"><header className="utility-panel-heading"><h2 id="comparison-title">Changes</h2></header><div className="utility-panel-body"><p role="status" className="utility-summary">{result.summary}</p>{!!result.rows?.length && <div className="utility-table-wrap" tabIndex={0} role="region" aria-label="JSON changes"><table><caption>Original to updated</caption><thead><tr>{['Change', 'JSON Pointer', 'Before', 'After'].map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{result.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}><code>{cell}</code></td>)}</tr>)}</tbody></table></div>}<Report key={result.text} result={result} filename="json-comparison.json" /></div></section>}
  </div>
}
