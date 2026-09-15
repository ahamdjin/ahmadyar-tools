import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArchitectureAdvisor } from '@/components/architecture-advisor'
import { ADVISOR_FAQS, AdvisorSeoContent } from '@/components/advisor-seo-content'
import { CrmHealthCheck } from '@/components/crm-health-check'
import { CRM_HEALTH_FAQS, CrmHealthSeoContent } from '@/components/crm-health-seo-content'
import { LegacyTool } from '@/components/legacy-tool'
import { OnboardingPlanner } from '@/components/onboarding-planner'
import { ONBOARDING_FAQS, OnboardingSeoContent } from '@/components/onboarding-seo-content'
import { BackLink } from '@/components/site-shell'
import { SITE } from '@/lib/site'
import { TOOLS, getTool, type ToolSlug } from '@/lib/tools'

type Props = { params: Promise<{ slug: string }> }

const ADVISOR_TITLE = 'Automation Architecture Advisor | Choose the Right Stack'
const ADVISOR_DESCRIPTION = 'Compare HubSpot, GoHighLevel, Zapier, Make, n8n, Trigger.dev, Power Automate and more based on your systems, workflows, scale, ownership, reliability, and budget.'
const CRM_HEALTH_TITLE = 'CRM Automation Health Check | Find Revenue Leaks'
const CRM_HEALTH_DESCRIPTION = 'Audit lead capture, CRM data quality, routing, response, follow-up, pipeline hygiene, handoffs, reporting, adoption, and automation reliability. Built for HubSpot, GoHighLevel, Salesforce and other CRMs.'
const ONBOARDING_TITLE = 'Client Onboarding Automation Planner | Build the Right Flow'
const ONBOARDING_DESCRIPTION = 'Design a reliable sales-to-delivery onboarding flow across your CRM, contracts, payments, intake, files, project management, communication, access, and kickoff systems.'

function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }))
}

function dedicatedMetadata(slug: string) {
  if (slug === 'automation-architecture-advisor') return { title: ADVISOR_TITLE, description: ADVISOR_DESCRIPTION }
  if (slug === 'crm-automation-health-check') return { title: CRM_HEALTH_TITLE, description: CRM_HEALTH_DESCRIPTION }
  if (slug === 'client-onboarding-automation-planner') return { title: ONBOARDING_TITLE, description: ONBOARDING_DESCRIPTION }
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tool = getTool(slug)
  if (!tool) return {}
  const canonical = `${SITE.origin}/tools/${tool.slug}`
  const dedicated = dedicatedMetadata(tool.slug)

  if (dedicated) {
    return {
      title: dedicated.title,
      description: dedicated.description,
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
      openGraph: { title: dedicated.title, description: dedicated.description, url: canonical, type: 'website', siteName: SITE.name },
      twitter: { card: 'summary', title: dedicated.title, description: dedicated.description },
    }
  }

  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical },
    openGraph: { title: `${tool.title} | Ahmad Yar`, description: tool.description, url: canonical, type: 'website' },
  }
}

function breadcrumbs(title: string, canonical: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Tools', item: `${SITE.origin}/tools` },
      { '@type': 'ListItem', position: 2, name: title, item: canonical },
    ],
  }
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params
  const tool = getTool(slug)
  if (!tool) notFound()

  const canonical = `${SITE.origin}/tools/${tool.slug}`
  const dedicated = dedicatedMetadata(tool.slug)
  const description = dedicated?.description ?? tool.description
  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.title,
    url: canonical,
    description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Person', name: SITE.name, url: SITE.origin },
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
      mentions: ['HubSpot', 'GoHighLevel', 'Zapier', 'Make', 'n8n', 'Trigger.dev', 'Power Automate', 'Pipedream', 'Activepieces', 'Workato', 'Tray.ai', 'MuleSoft'].map((name) => ({ '@type': 'SoftwareApplication', name })),
      isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.origin },
    }
    const faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: ADVISOR_FAQS.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
    }

    return (
      <>
        <div className="advisor-viewport tool-reveal">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(softwareJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(webpageJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs(tool.title, canonical)) }} />
          <div className="advisor-toolbar">
            <BackLink />
            <div className="min-w-0 text-right">
              <p className="text-[10px] uppercase tracking-[0.13em] text-zinc-400 dark:text-zinc-600">Automation tool</p>
              <h1 className="truncate text-sm font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">{tool.title}</h1>
            </div>
          </div>
          <div className="advisor-workspace"><ArchitectureAdvisor /></div>
        </div>
        <AdvisorSeoContent />
      </>
    )
  }

  if (tool.slug === 'crm-automation-health-check') {
    const webpageJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: CRM_HEALTH_TITLE,
      url: canonical,
      description: CRM_HEALTH_DESCRIPTION,
      dateModified: '2026-09-15',
      about: [
        { '@type': 'Thing', name: 'CRM automation' },
        { '@type': 'Thing', name: 'Lead management' },
        { '@type': 'Thing', name: 'Revenue operations' },
        { '@type': 'Thing', name: 'CRM data quality' },
      ],
      mentions: ['HubSpot', 'GoHighLevel', 'Salesforce', 'Microsoft Dynamics 365', 'Pipedrive', 'Zoho CRM', 'Close', 'Attio'].map((name) => ({ '@type': 'SoftwareApplication', name })),
      isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.origin },
    }
    const faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: CRM_HEALTH_FAQS.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
    }

    return (
      <>
        <div className="crm-health-viewport tool-reveal">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(softwareJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(webpageJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs(tool.title, canonical)) }} />
          <div className="crm-health-toolbar">
            <BackLink />
            <div className="min-w-0 text-right">
              <p className="text-[10px] uppercase tracking-[0.13em] text-zinc-400 dark:text-zinc-600">CRM diagnostic</p>
              <h1 className="truncate text-sm font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">{tool.title}</h1>
            </div>
          </div>
          <div className="crm-health-workspace"><CrmHealthCheck /></div>
        </div>
        <CrmHealthSeoContent />
      </>
    )
  }

  if (tool.slug === 'client-onboarding-automation-planner') {
    const webpageJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: ONBOARDING_TITLE,
      url: canonical,
      description: ONBOARDING_DESCRIPTION,
      dateModified: '2026-09-15',
      about: [
        { '@type': 'Thing', name: 'Client onboarding automation' },
        { '@type': 'Thing', name: 'Sales to delivery handoff' },
        { '@type': 'Thing', name: 'Business process automation' },
        { '@type': 'Thing', name: 'Customer onboarding workflow' },
      ],
      mentions: ['HubSpot', 'GoHighLevel', 'Salesforce', 'Stripe', 'DocuSign', 'Asana', 'ClickUp', 'monday.com', 'Typeform', 'Zapier', 'Make', 'n8n'].map((name) => ({ '@type': 'SoftwareApplication', name })),
      isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.origin },
    }
    const faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: ONBOARDING_FAQS.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
    }

    return (
      <>
        <div className="onboarding-viewport tool-reveal">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(softwareJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(webpageJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs(tool.title, canonical)) }} />
          <div className="onboarding-toolbar">
            <BackLink />
            <div className="min-w-0 text-right">
              <p className="text-[10px] uppercase tracking-[0.13em] text-zinc-400 dark:text-zinc-600">Onboarding planner</p>
              <h1 className="truncate text-sm font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">{tool.title}</h1>
            </div>
          </div>
          <div className="onboarding-workspace"><OnboardingPlanner /></div>
        </div>
        <OnboardingSeoContent />
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
      <LegacyTool tool={tool.slug as Exclude<ToolSlug, 'automation-architecture-advisor' | 'crm-automation-health-check' | 'client-onboarding-automation-planner'>} />
    </div>
  )
}
