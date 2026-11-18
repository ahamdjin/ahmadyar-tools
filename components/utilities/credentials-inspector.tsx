'use client'
/* eslint-disable @next/next/no-img-element -- Preview the original local blob, without a server image optimizer. */

import { useEffect, useRef, useState } from 'react'
import { ScanLine, Plus, Minus, FileImage } from 'lucide-react'
import styles from './credentials.module.css'

const formats = ['image/jpeg', 'image/png', 'image/webp']
const object = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' ? value as Record<string, unknown> : {}
const string = (value: unknown) => typeof value === 'string' ? value : ''

function actions(data: unknown) {
  const {actions: list, softwareAgents} = object(data)
  return (Array.isArray(list) ? list : []).map(item => {
    const a = object(item)
    const agent = a.softwareAgent ?? (Array.isArray(softwareAgents) && typeof a.softwareAgentIndex === 'number' ? softwareAgents[a.softwareAgentIndex] : undefined)
    const source = string(a.digitalSourceType)
    const ai = /^(https?:\/\/cv\.iptc\.org\/newscodes\/digitalsourcetype\/)(trainedAlgorithmicMedia|compositeWithTrainedAlgorithmicMedia)$/.test(source)
    return {action:string(a.action).replace(/^c2pa\./,''), tool:string(agent) || string(object(agent).name), ai, source:source.split('/').pop()}
  })
}

function ImageCanvas({url}:{url:string}) {
  const [scale,setScale] = useState(1)
  const [pan,setPan] = useState({x:0,y:0})
  const drag = useRef<{id:number;x:number;y:number} | null>(null)
  return <div className={styles.canvas}>
    <div className={styles.viewport} tabIndex={0} role="group" aria-label="Image preview. Drag or use arrow keys to move."
      onKeyDown={e=>{
        const step:Record<string,[number,number]>={ArrowLeft:[-24,0],ArrowRight:[24,0],ArrowUp:[0,-24],ArrowDown:[0,24]}
        const offset=step[e.key]; if(offset){e.preventDefault();setPan(p=>({x:p.x+offset[0],y:p.y+offset[1]}))}
      }}
      onPointerDown={e=>{if(!e.isPrimary || e.button!==0)return; e.currentTarget.setPointerCapture(e.pointerId); drag.current={id:e.pointerId,x:e.clientX-pan.x,y:e.clientY-pan.y}}}
      onPointerMove={e=>{const d=drag.current;if(d?.id===e.pointerId)setPan({x:e.clientX-d.x,y:e.clientY-d.y})}}
      onLostPointerCapture={()=>{drag.current=null}}>
      <img draggable={false} src={url} alt="Original image on inspection canvas" style={{transform:`translate(${pan.x}px,${pan.y}px) scale(${scale})`}}/>
    </div>
    <div className={styles.controls}><button aria-label="Zoom out" disabled={scale<=0.5} onClick={()=>setScale(scale-.25)}><Minus size={16}/></button>
      <button title="Center image and reset zoom" onClick={()=>{setPan({x:0,y:0});setScale(1)}}>Fit</button>
      <button aria-label="Zoom in" disabled={scale>=3} onClick={()=>setScale(scale+.25)}><Plus size={16}/></button></div>
  </div>
}

export function CredentialsInspector() {
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('Waiting for an original')
  const [report, setReport] = useState<{signer:string; events:ReturnType<typeof actions>; valid:boolean} | null>(null)
  const [inputError,setInputError] = useState('')
  const picker = useRef<HTMLInputElement>(null)
  function choose(f?: File) {
    if (!f) return
    if (!formats.includes(f.type) || f.size > 32 * 1024 * 1024) {
      setInputError('Choose a JPEG, PNG or WebP image up to 32 MB.'); return
    }
    setInputError(''); setReport(null); setStatus('Checking credential...'); setFile(f)
  }
  useEffect(() => {
    if (!file) return
    let live = true
    let dispose: (() => void) | undefined
    const preview = URL.createObjectURL(file)
    setUrl(preview)
    async function inspect(f: File) {
      const { createC2pa, Context, Reader } = await import('@contentauth/c2pa-web')
      const sdk = await createC2pa({wasmSrc:new URL('@contentauth/c2pa-web/resources/c2pa.wasm', import.meta.url).href})
      if (!live) { sdk.dispose(); return }
      dispose = sdk.dispose
      try {
        const reader = await Reader.fromBlob(sdk,f.type,f,new Context({verify:{verifyAfterReading:true,remoteManifestFetch:false,ocspFetch:false,verifyTrust:false}}))
        if (!live) return
        if (!reader) {setStatus('No embedded credential found'); return}
        const store = await reader.manifestStore()
        if (!live) return
        const m = store.manifests?.[store.active_manifest ?? '']
        if (!m) {setStatus('Active credential unavailable'); return}
        const valid = store.validation_state === 'Valid' || store.validation_state === 'Trusted'
        setStatus(valid ? 'Integrity check passed' : store.validation_state === 'Invalid' ? 'Credential failed validation' : 'Integrity not established')
        setReport({valid,signer:m.signature_info?.issuer || m.signature_info?.common_name || 'Not recorded', events:(m.assertions ?? []).filter(a => /^c2pa\.actions(?:\.v\d+)?$/.test(a.label)).flatMap(a => actions(a.data))})
      } finally { if (live) {sdk.dispose(); dispose = undefined} }
    }
    inspect(file).catch(() => {if (live) setStatus('Could not inspect this file. Try the original export.')})
    return () => {live=false; dispose?.(); URL.revokeObjectURL(preview)}
  },[file])
  const made = report?.events.find(e=>e.ai && e.action==='created' && e.source==='trainedAlgorithmicMedia')
  const ai = made ?? report?.events.find(e=>e.ai)
  const unsigned = status==='No embedded credential found'
  const title = report ? !report.valid ? 'Origin unverified' : made ? 'Made with AI' : ai ? 'AI was involved' : 'No AI use declared' : unsigned ? 'Origin unknown' : status
  const labels:Record<string,string> = {created:'Image created',converted:'Format converted','watermarked.unbound':'Watermark recorded'}
  return <section className={styles.desk} aria-label="Credential workspace" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();choose(e.dataTransfer.files[0])}}>
    <header className={styles.bar}><span><ScanLine size={17}/> Inspection workspace</span>
      <button onClick={()=>picker.current?.click()}>{file ? 'Replace image' : 'Choose image'}</button>
      <input hidden ref={picker} type="file" accept={formats.join(',')} onChange={e=>{choose(e.target.files?.[0]);e.target.value=''}} />
    </header>
    {inputError && <p className={styles.error} role="alert">{inputError}</p>}
    {url ? <ImageCanvas key={url} url={url}/> : <div className={styles.empty}><FileImage size={32}/><h2>Drop your original here</h2><p>JPEG, PNG or WebP · up to 32 MB</p></div>}
    <aside className={styles.record} aria-live="polite">
      <div className={styles.verdict} data-tone={report?.valid && ai ? 'ai' : report && !report.valid ? 'warning' : 'neutral'}>
        <small>Origin report</small>
        <h2>{title}</h2>
        {report?.valid && ai ? <p>{ai.tool ? <>{made ? 'Creation tool' : 'Recorded tool'}: <b>{ai.tool}</b></> : 'The credential records AI use without naming the tool.'}</p>
          : unsigned ? <p>🤷 No embedded credentials. This could be human-made or AI-generated.</p>
          : report && <p>{report.valid ? 'The recorded steps do not mention AI. That does not rule it out.' : 'The credential could not be validated. Its claims are not reliable.'}</p>}
      </div>
      {file && <div className={styles.sourceRow}>{url && <img src={url} alt=""/>}<div><small>Inspected file</small><p>{file.name}</p></div></div>}
      {report && <><section><h3>How it was made</h3><ol>{report.events.map((e,i)=><li key={i}><strong>{labels[e.action] ?? (e.action || 'Action recorded')}</strong>{e.tool && <p>{e.tool}</p>}{e.source && <p>{e.source==='trainedAlgorithmicMedia' ? 'AI-generated media' : e.source==='compositeWithTrainedAlgorithmicMedia' ? 'Includes AI-generated media' : e.source.replace(/([a-z])([A-Z])/g,'$1 $2')}</p>}</li>)}</ol>{!report.events.length && <p>No steps recorded.</p>}</section>
      <section><h3>Credential details</h3><strong>{status}</strong><p>Recorded signer: {report.signer}</p><p>Signer identity is not checked against a trust list.</p></section></>}
    </aside>
  </section>
}
