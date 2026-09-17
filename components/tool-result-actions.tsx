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
        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-zinc-300 px-3.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-950 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-100 dark:hover:text-zinc-50"
      >
        {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy result'}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-zinc-300 px-3.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-950 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-100 dark:hover:text-zinc-50"
      >
        <PrinterIcon className="h-3.5 w-3.5" />
        Print / save PDF
      </button>
    </div>
  )
}
