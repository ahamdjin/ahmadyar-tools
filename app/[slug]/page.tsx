import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArchitectureAdvisor } from '@/components/architecture-advisor'
import { ADVISOR_FAQS, AdvisorSeoContent } from '@/components/advisor-seo-content'
import { LegacyTool } from '@/components/legacy-tool'
import { BackLink } from '@/components/site-shell'
import { SITE } from '@/lib/site'
import { TOOLS, getTool, type ToolSlug } from '@/lib/tools'

type Props = { params: Promise<{ slug: string }> }

const ADVISOR_TITLE = 'Automation Architecture Advisor | Choose the Right Stack'
const ADVISOR_DESCRIPTION = 'Compare HubSpot, GoHighLevel, Zapier, Make, n8n, Trigger.dev, Power Automate and more based on your systems, workflows, scale, ownership, reliability, and budget.'

function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tool = getTool(slug)
  if (!tool) return {}
  const canonical = `${SITE.origin}/tools/${tool.slug}`

  if (tool.slug === 'automation-architecture-advisor') {
    return {
      title: ADVISOR_TITLE,
      description: ADVISOR_DESCRIPTION,
      alternates: { canonical },
      category: 'Business automation',
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      },
      openGraph: {
        title: ADVISOR_TITLE,
        description: ADVISOR_DESCRIPTION,
        url: canonical,
        type: 'website',
        siteName: SITE.name,
      },
      twitter: {
        card: 'summary',
        title: ADVISOR_TITLE,
        description: ADVISOR_DESCRIPTION,
      },
    }
  }

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
  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.title,
    url: canonical,
    description: tool.slug === 'automation-architecture-advisor' ? ADVISOR_DESCRIPTION : tool.description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: SITE.name,
      url: SITE.origin,
    },
  }

  if (tool.slug === 'automation-architecture-advisor') {
    const webpageJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: ADVISOR_TITLE,
      url: canonical,
      description: ADVISOR_DESCRIPTION,
      dateModified: '2026-09-15',
      about: [
        { '@type': 'Thing', name: 'Automation architecture' },
        { '@type': 'Thing', name: 'Workflow automation' },
        { '@type': 'Thing', name: 'Business process automation' },
      ],
      mentions: [
        'HubSpot',
        'GoHighLevel',
        'Zapier',
        'Make',
        'n8n',
        'Trigger.dev',
        'Power Automate',
        'Pipedream',
        'Activepieces',
        'Workato',
        'Tray.ai',
        'MuleSoft',
      ].map((name) => ({ '@type': 'SoftwareApplication', name })),
      isPartOf: {
        '@type': 'WebSite',
        name: SITE.name,
        url: SITE.origin,
      },
    }

    const faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: ADVISOR_FAQS.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    }

    const breadcrumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Tools',
          item: `${SITE.origin}/tools`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: tool.title,
          item: canonical,
        },
      ],
    }

    return (
      <>
        <div className="advisor-viewport tool-reveal">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(softwareJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(webpageJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd) }} />
          <div className="advisor-toolbar">
            <BackLink />
            <div className="min-w-0 text-right">
              <p className="text-[10px] uppercase tracking-[0.13em] text-zinc-400 dark:text-zinc-600">Automation tool</p>
              <h1 className="truncate text-sm font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">{tool.title}</h1>
            </div>
          </div>
          <div className="advisor-workspace">
            <ArchitectureAdvisor />
          </div>
        </div>
        <AdvisorSeoContent />
      </>
    )
  }

  return (
    <div className="space-y-12 pb-8 tool-reveal">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(softwareJsonLd) }} />
      <BackLink />
      <section className="max-w-2xl space-y-3">
        <p className="text-xs text-zinc-500 dark:text-zinc-500">Free automation tool</p>
        <h1 className="text-3xl font-medium tracking-[-0.05em] text-zinc-950 sm:text-4xl dark:text-zinc-50">{tool.title}</h1>
        <p className="max-w-xl text-sm leading-7 text-zinc-500 dark:text-zinc-400">{tool.description}</p>
      </section>
      <LegacyTool tool={tool.slug as Exclude<ToolSlug, 'automation-architecture-advisor'>} />
    </div>
  )
}
