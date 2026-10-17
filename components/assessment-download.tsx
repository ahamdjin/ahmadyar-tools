'use client'

import { DownloadIcon } from 'lucide-react'

import { assessmentExportFilename, createAssessmentExport, serializeAssessmentExport } from '@/lib/assessment-export'
import type { ToolSlug } from '@/lib/tools'

type Props = {
  slug: ToolSlug
  input: unknown
  analysis: unknown
}

/**
 * Client-only export: answers and analysis never leave the browser.
 * Export deliberately includes the complete model output, not just visible
 * top-six issue summaries, so an implementer can inspect the full decision.
 */
export function AssessmentDownload({ slug, input, analysis }: Props) {
  const download = () => {
    const now = new Date()
    const payload = createAssessmentExport(slug, input, analysis, now)
    const blob = new Blob([serializeAssessmentExport(payload)], { type: 'application/json;charset=utf-8' })
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = assessmentExportFilename(slug, now)
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
      <p className="max-w-xl text-xs leading-5 text-zinc-600 dark:text-zinc-400">
        Save the full assessment, including your answers, assumptions, and recommendations. The JSON file is created on your device; review it before sharing.
      </p>
      <button
        type="button"
        onClick={download}
        className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-zinc-100 dark:text-zinc-950"
      >
        <DownloadIcon aria-hidden="true" className="h-4 w-4" />
        Download assessment
      </button>
    </div>
  )
}
