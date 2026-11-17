'use client'

import { cloneElement, useEffect, useId, useRef, useState, type ReactElement } from 'react'
import { Check, Copy, Download, Play, X } from 'lucide-react'
import { getUtility, type UtilitySlug } from '@/lib/utilities/catalog'
import type { Job, Mapping, Result } from '@/lib/utilities/engine'
import './workbench.css'

export function Field({ label, children, hint }: { label: string; children: ReactElement<{ id?: string; 'aria-describedby'?: string }>; hint?: string }) {
  const id = useId()
  return <div className="utility-field"><label htmlFor={id}>{label}</label>{cloneElement(children, { id, ...(hint ? { 'aria-describedby': `${id}-hint` } : {}) })}{hint && <small id={`${id}-hint`}>{hint}</small>}</div>
}
export function ExportActions({ text, filename, mime = 'application/json', format = 'JSON' }: { text: string; filename: string; mime?: string; format?: string }) {
  const [feedback, setFeedback] = useState('')
  async function copy() {
    try { await navigator.clipboard.writeText(text); setFeedback('Copied') }
    catch { setFeedback('Copy unavailable. Select the output and copy manually.') }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([text], { type: mime }))
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setFeedback('Download started')
  }
  return <div className="utility-actions"><button type="button" onClick={copy}>{feedback === 'Copied' ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}Copy {format}</button><button type="button" onClick={download}><Download size={14} aria-hidden />Download {format}</button><span role="status">{feedback}</span></div>
}

export function UtilityWorkbench({ slug }: { slug: UtilitySlug }) {
  const tool = getUtility(slug)!
  const [input, setInput] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [zone, setZone] = useState('UTC')
  const [compareZone, setCompareZone] = useState('America/New_York')
  const [format, setFormat] = useState<'standard' | 'seconds'>('standard')
  const [start, setStart] = useState('')
  const [target, setTarget] = useState<'javascript' | 'python' | 'n8n'>('javascript')
  const [pattern, setPattern] = useState('[\\w.+-]+@[\\w.-]+\\.[A-Za-z]{2,}')
  const [flags, setFlags] = useState('gi')
  const [batchSize, setBatchSize] = useState(100)
  const [mappings, setMappings] = useState<Mapping[]>([])
  const active = useRef<{ worker: Worker; timer: ReturnType<typeof setTimeout> } | null>(null)
  const output = useRef<HTMLDivElement>(null)
  useEffect(() => () => { if (active.current) { active.current.worker.terminate(); clearTimeout(active.current.timer) } }, [])

  function invalidate() { setResult(null); setError('') }
  function updateInput(value: string) { setInput(value); setMappings([]); invalidate() }
  function stop() {
    if (active.current) { active.current.worker.terminate(); clearTimeout(active.current.timer); active.current = null }
    setBusy(false)
  }
  function run(inspectColumns = false) {
    stop(); invalidate()
    if (input.length > 200_000) { setError('Input is too large. Use at most 200,000 characters.'); return }
    const job: Job = slug === 'json-repair-payload-inspector' ? { kind: 'json', input }
      : slug === 'automation-schedule-builder' ? { kind: 'schedule', input, zone, compareZone, format, start: start || new Date().toISOString() }
      : slug === 'api-request-converter' ? { kind: 'curl', input, target }
      : slug === 'csv-to-api-payload' ? { kind: 'csv', input, batchSize, mappings: !inspectColumns && mappings.length ? mappings : undefined }
      : { kind: 'regex', input, pattern, flags }
    try {
      setBusy(true)
      const worker = new Worker(new URL('../../lib/utilities/utility.worker.ts', import.meta.url))
      const timer = setTimeout(() => { stop(); setError('Processing exceeded 3 seconds and was stopped. Reduce the input or simplify the expression.'); }, 3000)
      active.current = { worker, timer }
      worker.onmessage = ({ data }: MessageEvent<{ result?: Result; error?: string }>) => {
        stop()
        if (data.error) setError(data.error)
        else if (data.result) {
          setResult(data.result)
          if (data.result.columns && (inspectColumns || !mappings.length)) setMappings(data.result.columns.map((column) => ({ column, path: column, type: 'string', empty: 'string' })))
          output.current?.focus({ preventScroll: true })
        }
      }
      worker.onerror = () => { stop(); setError('The local worker could not run. Reload the page and try again. No input was uploaded.') }
      worker.postMessage(job)
    } catch { stop(); setError('Background processing is unavailable in this browser. Try a current browser; no input was uploaded.') }
  }
  const isCron = slug === 'automation-schedule-builder'
  const isCsv = slug === 'csv-to-api-payload'
  const isRegex = slug === 'regex-extraction-workbench'
  const isCurl = slug === 'api-request-converter'
  const extension = isCurl ? (target === 'python' ? 'py' : target === 'javascript' ? 'js' : 'json') : 'json'

  return <div className={`utility-workbench${isCron ? ' utility-compact' : ''}`}>
    {isRegex && <div className="utility-options utility-regex-options mb-5"><Field label="Pattern" hint="JavaScript syntax, without / delimiters."><input value={pattern} disabled={busy} onChange={(e) => { setPattern(e.target.value); invalidate() }} spellCheck={false} /></Field><Field label="Flags"><input value={flags} disabled={busy} onChange={(e) => { setFlags(e.target.value); invalidate() }} spellCheck={false} /></Field></div>}
    <div className="utility-layout">
      <section className="utility-panel" aria-labelledby="utility-input-title">
        <header className="utility-panel-heading"><h2 id="utility-input-title">{isCron ? 'Schedule' : 'Input'}</h2><button type="button" disabled={busy} onClick={() => updateInput(tool.example)}>Load example</button></header>
        <div className="utility-panel-body">
          <Field label={isCron ? 'Cron expression' : isCurl ? 'cURL command' : isCsv ? 'CSV with a header row' : isRegex ? 'Text to search' : 'JSON payload'}>
            {isCron ? <input value={input} disabled={busy} onChange={(e) => updateInput(e.target.value)} placeholder="0 9 * * 1-5" spellCheck={false} maxLength={200} className="font-mono" /> : <textarea value={input} rows={10} disabled={busy} onChange={(e) => updateInput(e.target.value)} placeholder="Paste your input here, or load the example." spellCheck={false} autoCapitalize="off" autoCorrect="off" maxLength={200001} />}
          </Field>
          {!isCron && <div className="utility-input-meta"><span className="tabular-nums">{input.length.toLocaleString()} / 200,000 characters</span><button type="button" disabled={busy || !input} onClick={() => updateInput('')}>Clear input</button></div>}
          {isCron && <>
            <div className="utility-options"><Field label="Cron format"><select disabled={busy} value={format} onChange={(e) => { setFormat(e.target.value as typeof format); invalidate() }}><option value="standard">Standard - 5 fields</option><option value="seconds">6 fields - seconds fixed at 0</option></select></Field><Field label="Start from (ISO date/time)" hint="Leave empty for now. Include Z or an explicit UTC offset."><input disabled={busy} value={start} onChange={(e) => { setStart(e.target.value); invalidate() }} placeholder="2026-11-17T00:00:00Z" /></Field></div>
            <div className="utility-options"><Field label="Schedule time zone"><input disabled={busy} value={zone} onChange={(e) => { setZone(e.target.value); invalidate() }} placeholder="Asia/Karachi" list="utility-timezones" /></Field><Field label="Compare with"><input disabled={busy} value={compareZone} onChange={(e) => { setCompareZone(e.target.value); invalidate() }} list="utility-timezones" /></Field></div>
            <datalist id="utility-timezones">{['UTC', 'Asia/Karachi', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Dubai', 'Asia/Kolkata', 'Australia/Sydney'].map((z) => <option key={z} value={z} />)}</datalist>
            <p className="utility-help">Use numeric fields, lists, ranges and steps. Choose day-of-month or day-of-week, not both. Quartz and AWS formats are not supported.</p>
          </>}
          {isCurl && <Field label="Output language"><select disabled={busy} value={target} onChange={(e) => { setTarget(e.target.value as typeof target); invalidate() }}><option value="javascript">JavaScript fetch (server-side)</option><option value="python">Python requests</option><option value="n8n">n8n HTTP Request node</option></select></Field>}
          {isCsv && <>
            <div className="utility-options"><Field label="Records per batch"><input disabled={busy} type="number" min={1} max={1000} value={batchSize} onChange={(e) => { setBatchSize(Number(e.target.value)); invalidate() }} /></Field><button type="button" className="utility-secondary utility-option-action" disabled={busy || !input.trim()} onClick={() => run(true)}>Inspect columns</button></div>
            {mappings.length > 0 && <fieldset className="utility-mappings"><legend>Field mapping</legend><p className="utility-help">Use contact.email for nested objects. Leave an output path empty to skip that column. Arrays inside paths are not supported.</p>{mappings.map((mapping, i) => <div key={mapping.column} className="utility-mapping"><span>{mapping.column}</span><Field label={`Output path for ${mapping.column}`}><input disabled={busy} value={mapping.path} onChange={(e) => { setMappings((all) => all.map((m, j) => i === j ? { ...m, path: e.target.value } : m)); invalidate() }} /></Field><Field label={`Type for ${mapping.column}`}><select disabled={busy} value={mapping.type} onChange={(e) => { setMappings((all) => all.map((m, j) => i === j ? { ...m, type: e.target.value as Mapping['type'] } : m)); invalidate() }}>{['string', 'number', 'boolean', 'json'].map((t) => <option key={t}>{t}</option>)}</select></Field><Field label={`Empty cells for ${mapping.column}`}><select disabled={busy} value={mapping.empty} onChange={(e) => { setMappings((all) => all.map((m, j) => i === j ? { ...m, empty: e.target.value as Mapping['empty'] } : m)); invalidate() }}><option value="string">Keep empty</option><option value="null">Use null</option><option value="omit">Omit field</option></select></Field></div>)}</fieldset>}
          </>}
          <div className="utility-run-row"><button type="button" className="utility-primary" disabled={busy || !input.trim()} onClick={() => run()}><Play size={14} aria-hidden />{busy ? 'Processing locally...' : tool.action}</button>{busy && <button type="button" onClick={() => { stop(); setError('Processing cancelled.') }}><X size={14} aria-hidden />Cancel</button>}</div>
          {error && <p role="alert" className="utility-error">{error}</p>}
        </div>
      </section>
      <section className="utility-panel utility-output" aria-labelledby="utility-output-title" ref={output} tabIndex={-1}>
        <header className="utility-panel-heading"><h2 id="utility-output-title">{isCron ? 'Upcoming runs' : 'Output'}</h2></header>
        {!result ? <div className="utility-panel-body">{isCron ? <p className="utility-help">Load the example or enter a cron expression, then choose Preview schedule to compare the next eight runs.</p> : <Field label={isCurl ? `Generated ${target}` : 'Result JSON'}><textarea rows={10} readOnly value="" placeholder={busy ? 'Processing...' : ''} spellCheck={false} /></Field>}{busy && <p role="status" className="utility-help">Processing...</p>}</div> : <div className="utility-panel-body">
          {!isCron && <><Field label={isCurl ? `Generated ${target}` : 'Result JSON'}><textarea rows={10} readOnly value={result.text} spellCheck={false} /></Field><ExportActions key={result.text} text={result.text} filename={`${slug}.${extension}`} mime={extension === 'json' ? 'application/json' : 'text/plain'} format={extension === 'json' ? 'JSON' : 'code'} /></>}
          <p className="utility-summary" role="status">{result.summary}</p>
          {result.rows && <div className="utility-table-wrap" tabIndex={0} role="region" aria-label={isCron ? 'Upcoming schedule runs' : 'Extracted matches'}><table><caption>{isCron ? `Next 8 runs: ${zone} and ${compareZone}` : 'Matches and capture groups'}</caption><thead><tr>{(isCron ? ['UTC', zone, compareZone] : ['Index', 'Match', 'Captures', 'Named groups']).map((c, i) => <th key={i} scope="col">{c}</th>)}</tr></thead><tbody>{result.rows.slice(0, 100).map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table>{result.rows.length > 100 && <p className="utility-help">Showing 100 rows. The complete extraction is in the output and downloads.</p>}</div>}
          {isCron && <><ExportActions key={result.text} text={result.text} filename="schedule.json" /><details className="utility-disclosure"><summary>Schedule JSON</summary><pre>{result.text}</pre></details></>}
          {result.csv !== undefined && <ExportActions key={`csv-${result.text}`} text={result.csv} filename="extracted-matches.csv" mime="text/csv;charset=utf-8" format="CSV" />}
          {result.paths && <details className="utility-disclosure"><summary>Field paths <span className="tabular-nums">({result.paths.length})</span></summary><p className="utility-help">Bracket expressions and RFC 6901 JSON Pointers. The root pointer is an empty string.</p><ul className="utility-paths">{result.paths.map((p) => <li key={p.pointer}><code>{p.expression}</code><small>Pointer: {p.pointer || '(root)'}</small><span>{p.value}</span></li>)}</ul></details>}
          <details className="utility-notes"><summary>Notes & limitations</summary><ul>{result.warnings.map((w) => <li key={w}>{w}</li>)}</ul></details>
        </div>}
      </section>
    </div>
  </div>
}
