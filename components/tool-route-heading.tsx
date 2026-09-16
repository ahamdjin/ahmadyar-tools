import { ToolIcon } from '@/components/tool-icon'

export function ToolRouteHeading({ slug, label, title }: { slug: string; label: string; title: string }) {
  return (
    <div className="tool-route-heading flex min-w-0 items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-[transform,background-color,color] duration-200 hover:-rotate-2 hover:bg-zinc-950 hover:text-white dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-50 dark:hover:text-zinc-950">
        <ToolIcon slug={slug} className="h-4 w-4" />
      </span>
      <div className="min-w-0 text-right">
        <p className="text-[10px] uppercase tracking-[0.13em] text-zinc-400 dark:text-zinc-600">{label}</p>
        <h1 className="max-w-[min(60vw,360px)] truncate text-sm font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">{title}</h1>
      </div>
    </div>
  )
}
