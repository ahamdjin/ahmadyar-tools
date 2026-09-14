import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArchitectureAdvisor } from '@/components/architecture-advisor'
import { LegacyTool } from '@/components/legacy-tool'
import { BackLink } from '@/components/site-shell'
import { SITE } from '@/lib/site'
import { TOOLS, getTool, type ToolSlug } from '@/lib/tools'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tool = getTool(slug)
  if (!tool) return {}
  const canonical = `${SITE.origin}/tools/${tool.slug}`
  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical },
    openGraph: { title: `${tool.title} | Ahmad Yar`, description: tool.description, url: canonical, type: 'website' },
  }
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params
  const tool = getTool(slug)
  if (!tool) notFound()

  const canonical = `${SITE.origin}/tools/${tool.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.title,
    url: canonical,
    description: tool.description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
  }

  return (
    <div className="space-y-12 pb-8 tool-reveal">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <BackLink />
      <section className="max-w-2xl space-y-3">
        <p className="text-xs text-zinc-500 dark:text-zinc-500">Free automation tool</p>
        <h1 className="text-3xl font-medium tracking-[-0.05em] text-zinc-950 sm:text-4xl dark:text-zinc-50">{tool.title}</h1>
        <p className="max-w-xl text-sm leading-7 text-zinc-500 dark:text-zinc-400">{tool.description}</p>
      </section>
      {tool.slug === 'automation-architecture-advisor' ? <ArchitectureAdvisor /> : <LegacyTool tool={tool.slug as Exclude<ToolSlug, 'automation-architecture-advisor'>} />}
    </div>
  )
}
