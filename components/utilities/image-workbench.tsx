'use client'

/* eslint-disable @next/next/no-img-element -- Blob previews must display the exact local bytes, without an image optimizer. */

import { useEffect, useState } from 'react'
import { rgbFile, iconFile } from '@/lib/utilities/raster-export'
import { displayBlob } from '@/lib/utilities/image-import'
import { Field } from './workbench'

const types = ['image/jpeg','image/png','image/webp']
const extra=['image/bmp','image/tiff','image/x-icon','image/x-portable-pixmap']
const opaque=(t:string)=>[types[0],extra[0],extra[1],extra[3]].includes(t)
const ext = (type:string) => type.split('/')[1].replace('jpeg','jpg').replace('x-icon','ico').replace('x-portable-pixmap','ppm')
const bytes = (size:number) => size >= 1e6 ? (size/1e6).toFixed(2)+' MB' : size >= 1000 ? (size/1000).toFixed(1)+' KB' : size+' bytes'
function encode(c:HTMLCanvasElement,type:string,quality:number) {
  return new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?.type===type ? resolve(b) : reject(Error('This browser cannot export that format. Try PNG.')),type,quality))
}
async function sample() {
  const c=document.createElement('canvas'); c.width=1000;c.height=600
  const g=c.getContext('2d')!
  const sky=g.createLinearGradient(0,0,0,600); sky.addColorStop(0,'#225975');sky.addColorStop(.65,'#f6d2aa');sky.addColorStop(1,'#f28d73')
  g.fillStyle=sky;g.fillRect(0,0,1000,600);g.fillStyle='#fff1ba';g.beginPath();g.arc(720,205,68,0,2*Math.PI);g.fill()
  for(const [n,col] of ['#989198','#667985','#385969','#163f4b'].entries()){
    g.fillStyle=col;g.beginPath();g.moveTo(0,600)
    for(let x=0;x<=1000;x+=2)g.lineTo(x,305+n*54+45*Math.sin(x/(87+n*12)+n*4)+19*Math.sin(x/49+n))
    g.lineTo(1000,600);g.fill()
  }
  return new File([await encode(c,'image/png',1)],'ridge-study.png',{type:'image/png'})
}
type Output={file:File;src:string;dest:string;preview:string;blob:Blob;w:number;h:number;ow:number;oh:number}
export function ImageWorkbench({compress=false}:{compress?:boolean}={}){
  const [target,setTarget]=useState('25')
  const [run,setRun]=useState(0)
  const [files,setFiles]=useState<File[]>([]),[type,setType]=useState('image/webp'),[width,setWidth]=useState(''),[quality,setQuality]=useState(compress?21:80),[bg,setBg]=useState('#ffffff')
  const [custom,setCustom]=useState(false),[packing,setPacking]=useState(false)
  const [out,setOut]=useState<Output[]>([]),[index,setIndex]=useState(0),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false)
  useEffect(()=>{let live=true;sample().then(f=>{if(live)setFiles(prev=>prev.length?prev:[f])}).catch(()=>{if(live)setNotice('Choose an image to start.')});return()=>{live=false}},[])
  function load(list:File[]){
    if(!list.length)return
    if(list.length>10 || list.some(f=>(![...types,...extra].includes(f.type)&&!(/\.(jpe?g|png|webp|bmp|tiff?|ico|ppm)$/i.test(f.name)))||f.size>10_000_000)){setNotice('Choose up to ten supported image files, each under 10 MB.');return}
    setNotice('');setIndex(0);setFiles(list)
  }
  useEffect(()=>{
    let live=true;const urls:string[]=[]
    const url=(blob:Blob)=>{const u=URL.createObjectURL(blob);urls.push(u);return u}
    setOut([]);setError('');setBusy(!!files.length)
    const timer=setTimeout(async()=>{
      try {
        const limit=width === '' ? Infinity : Number(width)
        if(width !== '' && (!Number.isInteger(limit)||limit<1||limit>4096))throw Error('Choose a maximum width from 1 to 4,096 pixels.')
        const budget=Number(target)*1000
        if(compress && (!Number.isFinite(budget)||budget<1000||budget>10000000))throw Error('Choose a target between 1 and 10,000 KB.')
        const results:Output[]=[]
        for(const file of files){
          const decoded=await displayBlob(file);if(!live)return
          const src=url(decoded), img=new Image();img.src=src;await img.decode();if(!live)return
          const ow=img.naturalWidth,oh=img.naturalHeight
          const scale=Math.min(1,limit/ow,...(type===extra[2]?[256/ow,256/oh]:[]))
          const w=Math.max(1,Math.round(ow*scale)),h=Math.max(1,Math.round(oh*scale))
          if(ow*oh>24_000_000 || h>16384)throw Error(file.name+' is too large. Use a smaller source image.')
          const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d')!
          if(opaque(type)){g.fillStyle=bg;g.fillRect(0,0,w,h)}
          g.imageSmoothingQuality='high';g.drawImage(img,0,0,w,h)
          const native=types.includes(type)
          const initialQuality=compress?(101-quality)/100:quality/100
          let rendered=await encode(c,native?type:'image/png',initialQuality)
          if(compress)for(const q of [0.85,0.75,0.65,0.55,0.45].filter(q=>q<initialQuality)){
            if(!live)return
            if(rendered.size<=budget)break
            const next=await encode(c,type,q)
            if(next.size<rendered.size)rendered=next
          }
          if(!live)return
          if(!native && type!==extra[2] && results.reduce((s,r)=>s+r.blob.size,0)+w*h*3>120_000_000)throw Error('Uncompressed batch exceeds 120 MB. Reduce the width or choose fewer files.')
          const blob=native?rendered:type===extra[2]?iconFile(rendered,w,h):rgbFile(type,w,h,g.getImageData(0,0,w,h).data)
          c.width=0;const dest=url(blob);const preview=native?dest:url(rendered)
          results.push({file,src,dest,preview,blob,w,h,ow,oh})
        }
        setOut(results)
      }catch(e){if(live)setError(e instanceof Error?e.message:'Image could not be converted.')}
      finally{if(live)setBusy(false)}
    },150)
    return()=>{live=false;clearTimeout(timer);urls.forEach(u=>URL.revokeObjectURL(u))}
  },[files,type,width,quality,bg,compress,target,run])
  async function downloadAll(){
    setPacking(true)
    try{
      const {zipSync}=await import('fflate')
      const entries:Record<string,Uint8Array>={}
      for(const [i,r] of out.entries())entries[String(i+1).padStart(2,'0')+'-'+r.file.name.replace(/\.[^.]+$/,'').replace(/[^a-zA-Z0-9_.-]/g,'_')+'-'+r.w+'.'+ext(r.blob.type)]=new Uint8Array(await r.blob.arrayBuffer())
      const blob=new Blob([new Uint8Array(zipSync(entries,{level:0}))],{type:'application/zip'})
      const href=URL.createObjectURL(blob),a=document.createElement('a');a.href=href;a.download='converted-images.zip';a.click();setTimeout(()=>URL.revokeObjectURL(href),30000)
    }catch{setNotice('Archive could not be created. Download images individually.')}finally{setPacking(false)}
  }
  useEffect(()=>{
    function paste(e:ClipboardEvent){
      const list=Array.from(e.clipboardData?.files??[])
      if(!list.length)for(const it of Array.from(e.clipboardData?.items??[])){const f=it.getAsFile();if(f)list.push(f)}
      if(list.length){e.preventDefault();load(list)}
    }
    window.addEventListener('paste',paste);return()=>window.removeEventListener('paste',paste)
  },[])
  const item=out[index]
  return <section className="utility-workbench utility-panel image-workspace" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();load(Array.from(e.dataTransfer.files))}}>
    <header className="utility-panel-heading"><h2>{compress?'Compression workspace':'Image workspace'}</h2><span className="utility-help">Paste or drop up to 10 images</span></header>
    <div className="utility-panel-body"><Field label="Choose images"><input type="file" multiple accept=".jpg,.jpeg,.png,.webp,.bmp,.tif,.tiff,.ico,.ppm" onChange={e=>{load(Array.from(e.target.files??[]));e.target.value=''}}/></Field>
    <div className="grid gap-4 sm:grid-cols-3"><Field label="Output format"><select value={type} onChange={e=>setType(e.target.value)}>{(compress?[types[2],types[0]]:[...types,...extra]).map(t=><option key={t} value={t}>{ext(t).toUpperCase()}</option>)}</select></Field>
    <Field label="Maximum width"><select value={custom?'custom':'original'} onChange={e=>{const on=e.target.value==='custom';setCustom(on);setWidth(on?'800':'')}}><option value="original">Original</option><option value="custom">Custom width</option></select></Field>
    {custom&&<Field label="Custom width (px)"><input type="number" min={1} max={4096} placeholder="Original width" value={width} onChange={e=>setWidth(e.target.value)}/></Field>}
    {compress&&<Field label="Target size per image (KB)"><input type="number" min={1} max={10000} value={target} onChange={e=>setTarget(e.target.value)}/></Field>}
    {(type==='image/jpeg'||type==='image/webp')&&<Field label={(compress?'Compression strength':'Encoder quality')+' · '+quality+'%'} hint={compress?'Higher strength favors a smaller file over detail. The KB target may require extra compression.':'Higher values favor image detail over file size.'}><input type="range" min={1} max={100} value={quality} aria-valuetext={quality+' percent'} onChange={e=>setQuality(Number(e.target.value))}/></Field>}
    {opaque(type)&&<Field label="Background color"><input type="color" value={bg} onChange={e=>setBg(e.target.value)}/></Field>}</div>
    {type===extra[2]&&<p className="utility-help">ICO fits within 256 × 256 pixels, even at Original width.</p>}
    {extra.includes(type)&&<p className="utility-help">Preview shows the rendered pixels; the download uses the selected file format.</p>}
    {out.length>0&&<section aria-label="Converted images"><h3 className="mb-2 text-sm font-medium">Click an image to download</h3><div className="flex flex-wrap gap-3">{out.map((r,i)=>{
      const name=r.file.name.replace(/\.[^.]+$/,'')+'-'+r.w+'.'+ext(r.blob.type)
      return <a className="w-20 rounded-md focus-visible:outline-2" href={r.dest} download={name} key={i} aria-label={'Download '+name} title={name}><img className="aspect-square w-full rounded-md bg-zinc-200 object-contain dark:bg-zinc-800" src={r.preview} alt=""/><span className="mt-1 block truncate text-xs">{name}</span></a>
    })}</div></section>}
    {files.length>1&&<Field label="Compare one image"><select value={index} onChange={e=>setIndex(Number(e.target.value))}>{files.map((f,i)=><option key={i} value={i}>{f.name}</option>)}</select></Field>}
    <div className="utility-run-row"><button type="button" className="utility-primary" disabled={busy||!files.length} onClick={()=>setRun(n=>n+1)}>{busy?'Processing…':compress?'Compress all images':'Convert all images'}</button></div>
    {notice&&<p role="alert">{notice}</p>}{error&&<p role="alert">{error}</p>}{busy&&<p role="status">Rendering preview…</p>}
    {!item&&<div className="utility-actions"><button disabled>Download selected image</button><button disabled>Download all as ZIP</button></div>}
    {item&&<><div className="grid gap-4 sm:grid-cols-2">{[false,true].map(converted=><figure key={String(converted)} className="min-w-0"><img className="aspect-[5/3] w-full rounded-lg bg-zinc-200 object-contain dark:bg-zinc-800" src={converted?item.preview:item.src} alt={(converted?'Converted':'Original')+' preview of '+item.file.name}/><figcaption className="mt-2 text-sm"><strong>{converted?ext(type).toUpperCase()+' output':'Original'}</strong><br/>{converted?item.w:item.ow} × {converted?item.h:item.oh} · {bytes(converted?item.blob.size:item.file.size)}</figcaption></figure>)}</div>
    {compress&&<p role="status">{item.blob.size<=Number(target)*1000?'Target met.':'Target not met. Try a smaller custom width or a larger target.'} {item.file.size<=Number(target)*1000?'Your original already fits. ':''}<button onClick={()=>{const u=URL.createObjectURL(item.file),a=document.createElement('a');a.href=u;a.download=item.file.name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}}>Download untouched original</button></p>}
    <p role="status">{item.blob.size===item.file.size?'Same file size':bytes(Math.abs(item.blob.size-item.file.size))+(item.blob.size<item.file.size?' smaller':' larger')}</p>
    <a className="self-start rounded-lg bg-zinc-900 px-4 py-3 text-sm text-white dark:bg-zinc-100 dark:text-zinc-950" href={item.dest} download={item.file.name.replace(/\.[^.]+$/,'')+'-'+item.w+'.'+ext(type)}>Download {ext(type).toUpperCase()}</a>{out.length>0&&<button className="self-start" disabled={packing} onClick={downloadAll}>{packing?'Preparing ZIP…':'Download all as ZIP ('+out.length+')'}</button>}</>}
    </div></section>
}
