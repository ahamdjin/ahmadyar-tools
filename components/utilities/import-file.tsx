'use client'

import { useId, useState } from 'react'

export function ImportFile({format, onLoad, disabled}: {format:'csv'|'json'; onLoad:(text:string)=>void; disabled?:boolean}) {
  const id = useId()
  const [status,setStatus] = useState('')
  const [reading,setReading] = useState(false)
  async function open(file:File) {
    if (file.size > 800000) {setStatus('File too large. Choose a file with at most 200,000 characters.'); return}
    setReading(true)
    try {
      const text = new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer())
      if (!text.trim() || text.length>200000) throw Error('Choose a nonempty file with at most 200,000 characters.')
      onLoad(text); setStatus('Loaded '+file.name)
    } catch (err) {setStatus(err instanceof TypeError ? 'Use a UTF-8 text file.' : err instanceof Error ? err.message : 'Could not read this file.')}
    finally {setReading(false)}
  }
  return <div className="utility-field"><label htmlFor={id}>Open {format.toUpperCase()} file</label>
    <input id={id} disabled={disabled || reading} type="file" accept={format==='csv'?'.csv,text/csv':'.json,application/json'} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file) void open(file)}}/>
    {status && <small role="status">{status}</small>}
  </div>
}
