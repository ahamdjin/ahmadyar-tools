'use client'
/* eslint-disable @next/next/no-img-element -- Preview the downloadable local blob itself. */

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Download, ImagePlus } from 'lucide-react'
import styles from './clean-jpeg.module.css'

type Result = {blob:Blob; name:string; width:number; height:number}

async function encode(file:File):Promise<Result> {
    let image:ImageBitmap | undefined
    try {
      if (!['image/png','image/webp'].includes(file.type) || file.size>16*1024*1024) throw Error('Choose a PNG or WebP up to 16 MB.')
      image=await createImageBitmap(file)
      if(image.width*image.height>24000000)throw Error('Choose an image under 24 megapixels.')
      const canvas=document.createElement('canvas')
      canvas.width=image.width;canvas.height=image.height
      const ctx=canvas.getContext('2d');if(!ctx)throw Error()
      ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height)
      ctx.drawImage(image,0,0)
      const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',.94))
      if(!blob || blob.type!=='image/jpeg')throw Error()
      return {blob,name:file.name,width:canvas.width,height:canvas.height}
    } finally {image?.close()}
}

type Item = Result & {url:string}
export function CleanJpeg() {
  const picker=useRef<HTMLInputElement>(null)
  const generation=useRef(0)
  const urls=useRef<string[]>([])
  const [items,setItems]=useState<Item[]>([])
  const [keep,setKeep]=useState(true)
  const [message,setMessage]=useState('')
  const [errors,setErrors]=useState<string[]>([])
  const [packing,setPacking]=useState(false)
  useEffect(()=>()=>{generation.current++;urls.current.forEach(URL.revokeObjectURL)},[])
  async function convert(files:File[]) {
    if(!files.length)return
    if(files.length>10){setErrors(['Choose up to 10 images in one batch.']);return}
    const id=++generation.current
    urls.current.forEach(URL.revokeObjectURL);urls.current=[]
    setItems([]);setErrors([]);setPacking(false)
    const ready:Item[]=[], failed:string[]=[]
    for(const [i,file] of files.entries()){
      setMessage(`Preparing ${i+1} of ${files.length}...`)
      try{
        const result=await encode(file)
        if(id!==generation.current)return
        const url=URL.createObjectURL(result.blob);urls.current.push(url);ready.push({...result,url})
      }catch(error){
        if(id!==generation.current)return
        failed.push(file.name+': '+(error instanceof Error && error.message.startsWith('Choose') ? error.message : 'Could not read this image.'))
      }
    }
    setItems(ready);setErrors(failed);setMessage(`${ready.length} of ${files.length} ready`)
  }
  const used=new Set<string>()
  const names=items.map(({name},i)=>{
    const base=keep ? name.replace(/\.[^.]+$/,'').replace(/[^\p{L}\p{N} ._-]/gu,'_').trim() || 'image' : 'image-'+(i+1)
    let value=base+'.jpg',n=2
    while(used.has(value.toLowerCase()))value=base+'-'+(n++)+'.jpg'
    used.add(value.toLowerCase());return value
  })
  async function downloadAll(){
    const id=generation.current
    setPacking(true)
    try{
      const {zipSync}=await import('fflate')
      const entries:Record<string,Uint8Array>=Object.create(null)
      for(const [i,item] of items.entries())entries[names[i]]=new Uint8Array(await item.blob.arrayBuffer())
      if(id!==generation.current)return
      const href=URL.createObjectURL(new Blob([new Uint8Array(zipSync(entries,{level:0}))],{type:'application/zip'}))
      const a=document.createElement('a');a.href=href;a.download='clean-images.zip';a.click()
      setTimeout(()=>URL.revokeObjectURL(href),30000)
    }catch{if(id===generation.current)setMessage('Could not build ZIP. Download individual JPGs instead.')}
    finally{if(id===generation.current)setPacking(false)}
  }
  return <section className={styles.desk} aria-label="JPG export" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void convert(Array.from(e.dataTransfer.files))}}>
    <div className={styles.preview}>{items.length ? <div className={styles.gallery}>{items.map((item,i)=><a key={item.url} href={item.url} download={names[i]} aria-label={'Download '+names[i]}><img src={item.url} alt=""/><strong>{names[i]}</strong><small>{item.width} × {item.height}</small></a>)}</div> : <button onClick={()=>picker.current?.click()}><ImagePlus size={34}/>Drop your images here<small>Up to 10 PNG or WebP files</small></button>}</div>
    <div className={styles.panel}><small>Batch export</small><h2>JPG copies</h2><p>Export each image without its embedded credentials. Transparent areas become white.</p>
      <input ref={picker} hidden multiple type="file" accept="image/png,image/webp" onChange={e=>{void convert(Array.from(e.target.files??[]));e.target.value=''}}/>
      <button onClick={()=>picker.current?.click()}>{items.length?'Choose another batch':'Choose images'}</button>
      <label><input type="checkbox" checked={keep} onChange={e=>setKeep(e.target.checked)}/> Keep original filenames</label>
      <div role="status">{message}</div>{errors.length>0 && <ul role="alert">{errors.map((err,i)=><li key={i}>{err}</li>)}</ul>}
      {items.length>0 && <><p>Click a thumbnail for its JPG.</p><button className={styles.download} disabled={packing} onClick={downloadAll}><Download size={17}/>{packing?'Preparing ZIP...':'Download all as ZIP'}</button></>}
      <Link href="/content-credentials">Check a file in the inspector</Link>
    </div></section>
}
