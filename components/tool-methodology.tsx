import { SITE } from '@/lib/site'
import { TOOL_METHODOLOGY } from '@/lib/tool-methodology'
import type { ToolSlug } from '@/lib/tools'

export function ToolMethodology({ slug }: { slug: ToolSlug }) {
  const method = TOOL_METHODOLOGY[slug]

  return (
    <section className="advisor-guide pt-10 sm:pt-14" aria-labelledby={`${slug}-methodology`}>
      <div className="rounded-2xl bg-zinc-50 p-6 sm:p-8 dark:bg-zinc-900/50">
        <div className="max-w-3xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-600">
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

        <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-xs font-medium text-zinc-950 dark:text-zinc-50">What it evaluates</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {method.evaluates.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-zinc-950 dark:text-zinc-50">What it does not assume</p>
            <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{method.doesNot}</p>
            <p className="mt-3 text-xs leading-5 text-zinc-500">
              Same inputs produce the same result. Vendor capabilities, pricing and policy can change, so implementation details should still be checked before a production build.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <p className="text-xs font-medium text-zinc-950 dark:text-zinc-50">Related real work</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {method.relatedWork.map((item) => (
              <a key={item.href} href={`${SITE.origin}${item.href}`} className="group block">
                <span className="text-sm font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4 transition-opacity group-hover:opacity-70 dark:text-zinc-50 dark:decoration-zinc-700">
                  {item.label} →
                </span>
                <span className="mt-1.5 block text-xs leading-5 text-zinc-500 dark:text-zinc-500">
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
