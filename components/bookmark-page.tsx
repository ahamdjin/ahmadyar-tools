'use client'

import { Bookmark } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import './bookmark-page.css'

export function BookmarkPage(){
  const dialog=useRef<HTMLDialogElement>(null), title=useId()
  const [hint,setHint]=useState(''),[copied,setCopied]=useState('')
  function open(){
    const ua=navigator.userAgent
    const ios=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1)
    const message=ios?'Open your browser menu or Share menu and choose Add Bookmark or Add to Favorites.':/Android/.test(ua)?'Open the browser menu and tap the bookmark star or Add bookmark.':/Mac/.test(ua)?'Press ⌘ + D to bookmark this page.':'Press Ctrl + D to bookmark this page.'
    setHint(message);setCopied('')
    if(typeof dialog.current?.showModal==='function') dialog.current.showModal()
    else window.alert(message+' You can also copy the address from the address bar.')
  }
  return <div className="ml-auto shrink-0 pl-2">
    <button type="button" className="bookmark-trigger" aria-haspopup="dialog" onClick={open}><Bookmark size={16} fill="currentColor" aria-hidden/>Bookmark</button>
    <dialog ref={dialog} aria-labelledby={title} className="bookmark-dialog fixed m-auto rounded-2xl bg-white p-6 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <h2 id={title} className="text-lg font-medium">Bookmark this page</h2>
      <p className="my-4 text-sm leading-6">{hint}</p>
      <div className="flex flex-wrap gap-3"><button type="button" className="min-h-11 rounded-full border px-4 text-sm" onClick={async()=>{try{await navigator.clipboard.writeText(location.href);setCopied('Link copied.')}catch{setCopied('Copy the URL from your address bar.')}}}>Copy link</button>
      <button type="button" className="min-h-11 px-3 text-sm underline" onClick={()=>dialog.current?.close()}>Close</button></div>
      <p role="status" className="text-sm">{copied}</p>
    </dialog>
  </div>
}
