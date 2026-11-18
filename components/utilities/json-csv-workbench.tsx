'use client'

import { useState } from 'react'
import { jsonCsv } from '@/lib/utilities/json-csv'
import { Field, ExportActions } from './workbench'
import { ImportFile } from './import-file'

const example = '[\n  {"id":"00123","contact":{"name":"Alex"},"tags":["lead","trial"]},\n  {"id":"00456","contact":{"name":"Sam"},"tags":["customer"]}\n]'
export function JsonCsvWorkbench() {
  const [input,setInput] = useState(example), [flatten,setFlatten] = useState(true), [expand,setExpand] = useState('')
  const [result,setResult] = useState<ReturnType<typeof jsonCsv>|null>(()=>jsonCsv(example))
  const [error,setError] = useState('')
  function convert(src:string,flat:boolean,field:string) {
    try {setResult(jsonCsv(src,flat,field));setError('')}
    catch(e){setExpand('');setResult(null);setError(e instanceof Error ? e.message : 'Conversion failed.')}
  }
  return <div className="utility-workbench utility-layout"><section className="utility-panel">
    <header className="utility-panel-heading"><h2>JSON input</h2><button onClick={()=>{setInput(example);setExpand('');convert(example,flatten,'')}}>Load example</button></header>
    <div className="utility-panel-body"><Field label="Records"><textarea rows={8} spellCheck={false} maxLength={200001} value={input} onChange={e=>{setInput(e.target.value);setExpand('');setError('');setResult(null)}}/></Field>
    <ImportFile format="json" onLoad={text=>{setInput(text);setExpand('');convert(text,flatten,'')}}/>
    <Field label="Nested objects"><select value={flatten?'flatten':'cell'} onChange={e=>{const flat=e.target.value==='flatten';setFlatten(flat);setExpand('');convert(input,flat,'')}}><option value="flatten">Flatten into columns</option><option value="cell">Keep JSON in one cell</option></select></Field>
    <button className="utility-primary" onClick={()=>convert(input,flatten,expand)}>Preview CSV</button>{error && <p role="alert">{error}</p>}</div></section>
    <section className="utility-panel"><header className="utility-panel-heading"><h2>Spreadsheet preview</h2></header><div className="utility-panel-body">
    {result ? <><Field label="Array rows"><select value={expand} onChange={e=>{setExpand(e.target.value);convert(input,flatten,e.target.value)}}><option value="">Keep arrays in one cell</option>{result.arrays.map(k=><option key={k} value={k}>Expand {k}</option>)}</select></Field>
    <div className="utility-table-wrap" tabIndex={0} role="region" aria-label="CSV preview"><table><caption>{result.total} rows, {result.columns.length} columns. Showing the first {result.preview.length} rows.</caption><thead><tr>{result.columns.map(k=><th key={k} scope="col">{k}</th>)}</tr></thead><tbody>{result.preview.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{String(v)}</td>)}</tr>)}</tbody></table></div>
    <ExportActions text={result.csv} mime="text/csv;charset=utf-8" filename="records.csv" format="CSV"/></> : <p>Choose Preview CSV to inspect your records before exporting.</p>}</div></section></div>
}
