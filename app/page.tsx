import Link from 'next/link'

import { TOOLS } from '@/lib/tools'

export default function ToolsPage() {
  return (
    <div className="space-y-14 pb-8 tool-reveal">
      <section className="max-w-xl space-y-3">
        <p className="text-xs text-zinc-500 dark:text-zinc-500">Free tools</p>
        <h1 className="text-2xl font-medium tracking-[-0.04em] text-zinc-950 sm:text-3xl dark:text-zinc-50">
          Practical automation tools
        </h1>
        <p className="max-w-lg text-sm leading-7 text-zinc-500 dark:text-zinc-400">
          Tools for deciding what to automate, how to architect it, and where the weak points are before you start wiring systems together.
        </p>
      </section>

      <section className="border-y border-zinc-200 dark:border-zinc-800">
        {TOOLS.map((tool, index) => (
          <Link
            key={tool.slug}
            href={`/${tool.slug}`}
            className={`group grid gap-2 py-5 transition-colors sm:grid-cols-[36px_170px_1fr_18px] sm:items-start ${index > 0 ? 'border-t border-zinc-200 dark:border-zinc-800' : ''}`}
          >
            <span className="font-mono text-[10px] leading-6 text-zinc-400 dark:text-zinc-600">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h2 className="text-sm font-medium leading-6 text-zinc-950 dark:text-zinc-50">{tool.shortTitle}</h2>
              {tool.status === 'advanced' ? <span className="text-[10px] uppercase tracking-[0.14em] text-zinc-400">new engine</span> : null}
            </div>
            <p className="max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">{tool.description}</p>
            <span className="hidden text-sm leading-6 text-zinc-400 transition-transform group-hover:translate-x-0.5 sm:block">→</span>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 border-t border-zinc-200 pt-7 sm:grid-cols-[140px_1fr] dark:border-zinc-800">
        <h2 className="text-xs font-medium text-zinc-950 dark:text-zinc-50">How these are built</h2>
        <p className="max-w-lg text-xs leading-6 text-zinc-500 dark:text-zinc-400">
          The recommendation logic lives separately from the interface, so platform rules, architecture decisions, and scenario tests can improve without turning the UI into a pile of one-off conditions.
        </p>
      </section>
    </div>
  )
}
