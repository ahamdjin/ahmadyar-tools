'use client'
import {useState} from 'react'
import Link from 'next/link'

export default function ToolSearch({entries}:{entries:{name:string;slug:string;keywords:string}[]}) {
  const [query,setQuery]=useState('')
  const hits=entries.filter(t=>query.trim().toLowerCase().split(/\s+/).every(word=>(t.name+' '+t.slug+' '+t.keywords).toLowerCase().includes(word)))
  return <details className="mt-5 rounded-xl border border-zinc-400/40 p-4"><summary className="cursor-pointer font-medium">Search tools</summary>
    <input type="search" aria-label="Search by tool or task" placeholder="Try C2PA, CSV or lead routing" value={query} onChange={e=>setQuery(e.target.value)} className="mt-4 w-full rounded-lg border border-zinc-400/40 bg-transparent p-3"/>
    {query.trim() && <><p role="status" className="my-3 text-sm">{hits.length ? hits.length+(hits.length===1?' matching tool':' matching tools') : 'No matching tools. Try another keyword.'}</p><ul>{hits.map(t=><li key={t.slug}><Link className="inline-block py-2 underline" href={'/'+t.slug}>{t.name}</Link></li>)}</ul></>}
  </details>
}
