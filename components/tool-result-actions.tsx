'use client'

import { CheckIcon, CopyIcon, PrinterIcon } from 'lucide-react'
import { useState } from 'react'

type ToolResultActionsProps = {
  title: string
  summary: string
  details?: readonly string[]
}

export function ToolResultActions({ title, summary, details = [] }: ToolResultActionsProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const text = [title, summary, ...details].filter(Boolean).join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/30 px-3.5 text-xs font-medium text-white transition-[border-color,background-color,opacity] hover:border-white/70 hover:bg-white/10 dark:border-zinc-400 dark:text-zinc-800 dark:hover:border-zinc-950 dark:hover:bg-zinc-950/5 dark:hover:text-zinc-950"
      >
        {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy result'}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/30 px-3.5 text-xs font-medium text-white transition-[border-color,background-color,opacity] hover:border-white/70 hover:bg-white/10 dark:border-zinc-400 dark:text-zinc-800 dark:hover:border-zinc-950 dark:hover:bg-zinc-950/5 dark:hover:text-zinc-950"
      >
        <PrinterIcon className="h-3.5 w-3.5" />
        Print / save PDF
      </button>
    </div>
  )
}
