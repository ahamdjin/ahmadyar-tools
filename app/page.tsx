import Link from 'next/link'
import { ArrowUpRightIcon, SparklesIcon } from 'lucide-react'

import { ToolIcon } from '@/components/tool-icon'
import { SITE } from '@/lib/site'
import { TOOLS } from '@/lib/tools'

const TOOL_META: Record<(typeof TOOLS)[number]['slug'], { eyebrow: string; note: string }> = {
  'automation-architecture-advisor': {
    eyebrow: 'Architecture',
    note: 'Decide whether a workflow belongs in your CRM, Zapier, n8n, or custom software.',
  },
  'crm-automation-health-check': {
    eyebrow: 'CRM',
    note: 'See where leads get lost, duplicated, or forgotten after they reach your CRM.',
  },
  'client-onboarding-automation-planner': {
    eyebrow: 'Onboarding',
    note: 'Plan what happens after a client signs or pays, so delivery can start smoothly.',
  },
  'lead-routing-rules-builder': {
    eyebrow: 'Revenue operations',
    note: 'Decide who gets each new lead, including when the usual owner is unavailable.',
  },
  'automation-roi-calculator': {
    eyebrow: 'Business case',
    note: 'Compare the time you might save with build, software, and maintenance costs.',
  },
  'lead-follow-up-automation-planner': {
    eyebrow: 'Follow-up',
    note: 'Plan when to follow up with a lead—and when to stop or hand over to a person.',
  },
}

const toolsPageUrl = `${SITE.origin}${SITE.toolsPath}`
const toolsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Free Automation Planning Tools',
  url: toolsPageUrl,
  description: 'Free tools for automation architecture, CRM health, client onboarding, lead routing, ROI, and follow-up.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: TOOLS.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.title,
      url: `${toolsPageUrl}/${tool.slug}`,
    })),
  },
  isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.origin },
}

export default function ToolsPage() {
  return (
    <div className="tools-index tool-reveal mx-auto w-full max-w-screen-sm pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toolsJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <section className="max-w-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
          <SparklesIcon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.8} />
          Practical automation tools
        </div>
        <h1 className="mt-5 max-w-lg text-3xl font-medium tracking-[-0.045em] text-zinc-950 sm:text-4xl dark:text-zinc-50">
          Build better automation systems.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
          Six focused tools for the decisions between strategy and implementation — architecture, CRM health, onboarding, routing, ROI and follow-up.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-zinc-500 dark:text-zinc-500">
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">6 tools</span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">Free</span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">No signup</span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">Built for real operating constraints</span>
        </div>
      </section>

      <section className="mt-12 grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Automation tools">
        {TOOLS.map((tool, index) => {
          const meta = TOOL_META[tool.slug]
          return (
            <Link
              key={tool.slug}
              href={`/${tool.slug}`}
              className="tool-index-card group relative flex h-full min-h-[220px] min-w-0 flex-col overflow-hidden rounded-xl bg-zinc-100/70 p-5 transition-colors duration-200 hover:bg-zinc-200/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:bg-zinc-900/80 dark:hover:bg-zinc-800/90"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="tool-index-icon flex h-9 w-9 items-center justify-center rounded-lg bg-white/85 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  <ToolIcon slug={tool.slug} className="h-[18px] w-[18px]" />
                </span>
                <ArrowUpRightIcon aria-hidden="true" className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              </div>

              <div className="mt-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.17em] text-zinc-400 dark:text-zinc-600">
                  {String(index + 1).padStart(2, '0')} · {meta.eyebrow}
                </p>
                <h2 className="mt-2 text-base font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">
                  {tool.shortTitle}
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {meta.note}
                </p>
              </div>


            </Link>
          )
        })}
      </section>

      <section className="mt-12 rounded-[22px] bg-zinc-50 p-5 sm:p-6 dark:bg-zinc-900/55">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600">
          How they are built
        </p>
        <h2 className="mt-3 text-lg font-medium tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">
          Decision logic first. Interface second.
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
          The engines are kept separate from the interface so assumptions, platform rules and scenario tests can improve without turning each tool into a pile of one-off conditions. The goal is a useful answer, not a decorative calculator.
        </p>
        <p className="mt-3 max-w-xl text-xs leading-5 text-zinc-500 dark:text-zinc-500">
          Every tool now shows what its model evaluates, what it refuses to assume, when the methodology was reviewed, and related real work behind the operating patterns.
        </p>
      </section>
    </div>
  )
}
