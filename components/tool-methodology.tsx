import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Eye,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react'

import { SITE } from '@/lib/site'
import { TOOL_METHODOLOGY } from '@/lib/tool-methodology'
import type { ToolSlug } from '@/lib/tools'

const steps = [
  { title: 'Add your situation', icon: SlidersHorizontal },
  { title: 'Review the result', icon: ClipboardList },
  { title: 'Check the risks', icon: ShieldAlert },
  { title: 'Choose the next step', icon: Eye },
] as const

export function ToolMethodology({ slug }: { slug: ToolSlug }) {
  const method = TOOL_METHODOLOGY[slug]

  return (
    <section className="advisor-guide pt-10 sm:pt-14" aria-labelledby={`${slug}-methodology`}>
      <div className="space-y-8">
        <div className="max-w-3xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
            Decision model · reviewed {method.reviewedAt}
          </p>
          <h2
            id={`${slug}-methodology`}
            className="mt-3 text-xl font-medium tracking-[-0.03em] text-zinc-950 sm:text-2xl dark:text-zinc-50"
          >
            What this tool uses — and what it refuses to guess.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            {method.principle}
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-zinc-950 dark:text-zinc-50">
            How to use the result
          </h3>
          <ol aria-label="Four steps to interpret your result" className="grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-4">
            {steps.map(({ title, icon: Icon }, index) => (
              <li
                key={title}
                className="flex min-h-24 flex-col items-start justify-between gap-3 rounded-lg bg-zinc-100/75 p-3 dark:bg-zinc-900/80"
              >
                <span className="flex w-full items-center justify-between">
                  <Icon aria-hidden="true" strokeWidth={1.7} className="h-[18px] w-[18px] text-zinc-700 dark:text-zinc-300" />
                  <span className="text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </span>
                <span className="text-xs font-medium leading-5 text-zinc-900 dark:text-zinc-100">
                  {title}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-zinc-950 dark:text-zinc-50">
            What it evaluates
          </h3>
          <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {method.evaluates.map((item, index) => (
              <div key={item} className="flex h-full min-w-0 flex-col items-start rounded-xl bg-zinc-100/70 p-4 dark:bg-zinc-900/80">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/85 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  <CheckCircle2 aria-hidden="true" strokeWidth={1.6} className="h-[18px] w-[18px]" />
                </span>
                <p className="mt-4 text-sm font-medium leading-6 text-zinc-950 dark:text-zinc-50">
                  {item}
                </p>
                <p className="mt-auto pt-3 text-[10px] tabular-nums text-zinc-500 dark:text-zinc-500">
                  {String(index + 1).padStart(2, '0')}
                </p>
              </div>
            ))}
            <div className="flex h-full min-w-0 flex-col items-start rounded-xl bg-zinc-100/70 p-4 dark:bg-zinc-900/80">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/85 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                <ShieldAlert aria-hidden="true" strokeWidth={1.6} className="h-[18px] w-[18px]" />
              </span>
              <h3 className="mt-4 text-sm font-medium leading-6 text-zinc-950 dark:text-zinc-50">
                What it does not assume
              </h3>
              <p className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                {method.doesNot}
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-6 text-zinc-500 dark:text-zinc-400">
            Same inputs produce the same result. Vendor capabilities, pricing, and
            policies can change. Check implementation details before a production build.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-zinc-950 dark:text-zinc-50">
            Related real work
          </h3>
          <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2">
            {method.relatedWork.map((item) => (
              <a
                key={item.href}
                href={`${SITE.origin}${item.href}`}
                className="group flex h-full min-w-0 flex-col items-start rounded-xl bg-zinc-100/70 p-4 transition-colors hover:bg-zinc-200/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:bg-zinc-900/80 dark:hover:bg-zinc-800/80"
              >
                <span className="flex w-full items-start justify-between gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/85 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    <Eye aria-hidden="true" strokeWidth={1.6} className="h-[18px] w-[18px]" />
                  </span>
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
                </span>
                <span className="mt-4 text-sm font-medium leading-6 text-zinc-950 dark:text-zinc-50">
                  {item.label}
                </span>
                <span className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {item.note}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
