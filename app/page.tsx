import Link from 'next/link'

import { TOOLS } from '@/lib/tools'

const TOOL_META: Record<(typeof TOOLS)[number]['slug'], { eyebrow: string; note: string }> = {
  'automation-architecture-advisor': {
    eyebrow: 'Architecture',
    note: 'Choose the operating model before you choose the automation platform.',
  },
  'crm-automation-health-check': {
    eyebrow: 'CRM',
    note: 'Find the leaks between lead capture, ownership, follow-up, data and reporting.',
  },
  'client-onboarding-automation-planner': {
    eyebrow: 'Onboarding',
    note: 'Turn a sold client into a reliable delivery-ready handoff.',
  },
  'lead-routing-rules-builder': {
    eyebrow: 'Revenue operations',
    note: 'Build assignment logic that survives overlap, capacity, SLAs and exceptions.',
  },
  'automation-roi-calculator': {
    eyebrow: 'Business case',
    note: 'Stress-test whether an automation is worth building before the build starts.',
  },
  'lead-follow-up-automation-planner': {
    eyebrow: 'Follow-up',
    note: 'Design a cadence that knows when to continue, stop or hand back to a human.',
  },
}

export default function ToolsPage() {
  return (
    <div className="tools-index tool-reveal mx-auto w-full max-w-screen-sm pb-10">
      <section className="max-w-xl">
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Practical tools for the work between strategy and implementation.
        </p>
        <h1 className="mt-4 max-w-lg text-3xl font-medium tracking-[-0.045em] text-zinc-950 sm:text-4xl dark:text-zinc-50">
          Build better automation systems.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
          Model the decision first. Each tool turns a messy operating question into a clearer architecture, rule set, health check, plan or business case.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-zinc-500 dark:text-zinc-500">
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">6 tools</span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">Free</span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">No signup</span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">Built around real operating constraints</span>
        </div>
      </section>

      <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Automation tools">
        {TOOLS.map((tool, index) => {
          const meta = TOOL_META[tool.slug]
          return (
            <Link
              key={tool.slug}
              href={`/${tool.slug}`}
              className="tool-index-card group relative flex min-h-[250px] flex-col overflow-hidden rounded-2xl bg-zinc-300/30 p-[1px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-zinc-700/35 dark:hover:shadow-[0_18px_55px_rgba(0,0,0,0.25)]"
            >
              <div className="relative flex h-full flex-1 flex-col rounded-[15px] bg-white p-5 dark:bg-zinc-950">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600">
                      {String(index + 1).padStart(2, '0')} · {meta.eyebrow}
                    </p>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm text-zinc-500 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-zinc-950 group-hover:text-white dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:bg-zinc-50 dark:group-hover:text-zinc-950">
                    →
                  </span>
                </div>

                <div className="mt-10">
                  <h2 className="max-w-[15rem] text-lg font-medium tracking-[-0.03em] text-zinc-950 dark:text-zinc-50">
                    {tool.shortTitle}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                    {meta.note}
                  </p>
                </div>

                <p className="mt-auto pt-7 text-xs leading-5 text-zinc-400 transition-colors group-hover:text-zinc-600 dark:text-zinc-600 dark:group-hover:text-zinc-400">
                  {tool.description}
                </p>
              </div>
            </Link>
          )
        })}
      </section>

      <section className="mt-10 rounded-2xl bg-zinc-50 p-5 sm:p-6 dark:bg-zinc-900/55">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600">
          How they are built
        </p>
        <h2 className="mt-3 text-lg font-medium tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">
          Decision logic first. Interface second.
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
          The engines are kept separate from the UI so assumptions, platform rules and scenario tests can improve without turning the interface into a pile of one-off conditions. The goal is a useful answer, not a decorative calculator.
        </p>
      </section>
    </div>
  )
}
