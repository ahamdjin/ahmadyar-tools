import Link from 'next/link'
import { ArrowUpRightIcon } from 'lucide-react'

import { ToolIcon } from '@/components/tool-icon'
import { SITE } from '@/lib/site'
import { TOOLS } from '@/lib/tools'
import { UTILITIES } from '@/lib/utilities/catalog'
import { UTILITY_ICONS } from '@/components/utilities/utility-page'
import { PreFooterLaunchBadge } from '@/components/site-shell'

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
  name: 'Free Automation & Browser Tools',
  url: toolsPageUrl,
  description: 'Free browser utilities for JSON, cron, API requests, CSV and regex, with six automation planning tools.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [...TOOLS, ...UTILITIES].map((tool, index) => ({
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
        <h1 className="max-w-lg text-balance text-3xl font-medium text-zinc-950 dark:text-zinc-50">
          Automation tools
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
          Work with JSON, schedules, API requests, CSV and text. Or plan the systems behind your workflows.
        </p>
        <nav aria-label="Tool categories" className="mt-5 flex flex-wrap gap-6 text-xs text-zinc-500"><a className="inline-flex min-h-11 items-center hover:text-zinc-950 dark:hover:text-zinc-50" href="#utilities-heading">Browser utilities <span className="ml-2 tabular-nums text-zinc-400">{UTILITIES.length}</span></a><a className="inline-flex min-h-11 items-center hover:text-zinc-950 dark:hover:text-zinc-50" href="#planning-heading">Planning tools <span className="ml-2 tabular-nums text-zinc-400">{TOOLS.length}</span></a></nav>
      </section>

      <section className="mt-12" aria-labelledby="utilities-heading">
        <h2 id="utilities-heading" className="mb-5 text-balance text-lg font-medium">Browser utilities</h2>
        <div className="grid auto-rows-fr gap-3">
          {UTILITIES.map((tool) => {
            const Icon = UTILITY_ICONS[tool.slug]
            return <Link key={tool.slug} href={`/${tool.slug}`} className="group grid min-w-0 grid-cols-[24px_minmax(0,1fr)_16px] items-start gap-4 rounded-xl bg-zinc-100/70 p-5 hover:bg-zinc-200/65 focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-zinc-900/80 dark:hover:bg-zinc-800">
              <Icon size={18} className="mt-1" aria-hidden />
              <div><h3 className="text-balance text-base font-medium">{tool.shortTitle}</h3><p className="mt-2 text-pretty text-sm leading-6 text-zinc-600 dark:text-zinc-400">{tool.description}</p></div>
              <ArrowUpRightIcon size={16} className="mt-1" aria-hidden />
            </Link>
          })}
        </div>
      </section>
      <h2 id="planning-heading" className="mt-12 text-balance text-lg font-medium">Planning & decisions</h2>
      <section className="mt-5 grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Automation tools">
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
                <h3 className="mt-2 text-balance text-base font-medium text-zinc-950 dark:text-zinc-50">
                  {tool.shortTitle}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {meta.note}
                </p>
              </div>


            </Link>
          )
        })}
      </section>

      <details className="mt-12 rounded-xl bg-zinc-50 p-5 sm:p-6 dark:bg-zinc-900/55">
        <summary className="min-h-11 cursor-pointer content-center text-sm font-medium text-zinc-950 dark:text-zinc-50">Methods & limitations</summary>
        <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
          The engines are kept separate from the interface so assumptions, platform rules and scenario tests can improve without turning each tool into a pile of one-off conditions. The goal is a useful answer, not a decorative calculator.
        </p>
        <p className="mt-3 max-w-xl text-xs leading-5 text-zinc-500 dark:text-zinc-500">
          Every tool now shows what its model evaluates, what it refuses to assume, when the methodology was reviewed, and related real work behind the operating patterns.
        </p>
      </details>
      <PreFooterLaunchBadge />
    </div>
  )
}
