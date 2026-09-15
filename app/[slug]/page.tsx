import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArchitectureAdvisor } from '@/components/architecture-advisor'
import { ADVISOR_FAQS, AdvisorSeoContent } from '@/components/advisor-seo-content'
import { AutomationRoiCalculator } from '@/components/automation-roi-calculator'
import { AUTOMATION_ROI_FAQS, AutomationRoiSeoContent } from '@/components/automation-roi-seo-content'
import { CrmHealthCheck } from '@/components/crm-health-check'
import { CRM_HEALTH_FAQS, CrmHealthSeoContent } from '@/components/crm-health-seo-content'
import { LeadRoutingBuilder } from '@/components/lead-routing-builder'
import { LEAD_ROUTING_FAQS, LeadRoutingSeoContent } from '@/components/lead-routing-seo-content'
import { OnboardingPlanner } from '@/components/onboarding-planner'
import { ONBOARDING_FAQS, OnboardingSeoContent } from '@/components/onboarding-seo-content'
import { BackLink } from '@/components/site-shell'
import { SITE } from '@/lib/site'
import { TOOLS, getTool } from '@/lib/tools'

type Props = { params: Promise<{ slug: string }> }

const ADVISOR_TITLE = 'Automation Architecture Advisor | Choose the Right Stack'
const ADVISOR_DESCRIPTION = 'Compare HubSpot, GoHighLevel, Zapier, Make, n8n, Trigger.dev, Power Automate and more based on your systems, workflows, scale, ownership, reliability, and budget.'
const CRM_HEALTH_TITLE = 'CRM Automation Health Check | Find Revenue Leaks'
const CRM_HEALTH_DESCRIPTION = 'Audit lead capture, CRM data quality, routing, response, follow-up, pipeline hygiene, handoffs, reporting, adoption, and automation reliability. Built for HubSpot, GoHighLevel, Salesforce and other CRMs.'
const ONBOARDING_TITLE = 'Client Onboarding Automation Planner | Build the Right Flow'
const ONBOARDING_DESCRIPTION = 'Design a reliable sales-to-delivery onboarding flow across your CRM, contracts, payments, intake, files, project management, communication, access, and kickoff systems.'
const LEAD_ROUTING_TITLE = 'Lead Routing Rules Builder | Design Reliable Assignment Logic'
const LEAD_ROUTING_DESCRIPTION = 'Build and test lead-routing logic for existing accounts, duplicates, territories, products, round robin, capacity, availability, fallbacks, response SLAs, reassignment, and auditability.'
const AUTOMATION_ROI_TITLE = 'Automation ROI Calculator | Payback, Savings & Build Decision'
const AUTOMATION_ROI_DESCRIPTION = 'Calculate automation ROI using real volume, handling time, human review, exceptions, value capture, error cost, build cost, software, maintenance, payback, break-even volume and a conservative stress case.'

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
  if (slug === 'lead-routing-rules-builder') return { title: LEAD_ROUTING_TITLE, description: LEAD_ROUTING_DESCRIPTION }
  if (slug === 'automation-roi-calculator') return { title: AUTOMATION_ROI_TITLE, description: AUTOMATION_ROI_DESCRIPTION }
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

  return {}
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

function faqJsonLd(items: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
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

    return (
      <>
        <div className="advisor-viewport tool-reveal">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(softwareJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(webpageJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(ADVISOR_FAQS)) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs(tool.title, canonical)) }} />
          <div className="advisor-toolbar">
            <BackLink />
            <div className="min-w-0 text-right"><p className="text-[10px] uppercase tracking-[0.13em] text-zinc-400 dark:text-zinc-600">Automation tool</p><h1 className="truncate text-sm font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">{tool.title}</h1></div>
          </div>
          <div className="advisor-workspace"><ArchitectureAdvisor /></div>
        </div>
        <AdvisorSeoContent />
      </>
    )
  }

  if (tool.slug === 'crm-automation-health-check') {
    const webpageJsonLd = {
      '@context': 'https://schema.org', '@type': 'WebPage', name: CRM_HEALTH_TITLE, url: canonical, description: CRM_HEALTH_DESCRIPTION, dateModified: '2026-09-15',
      about: [{ '@type': 'Thing', name: 'CRM automation' }, { '@type': 'Thing', name: 'Lead management' }, { '@type': 'Thing', name: 'Revenue operations' }, { '@type': 'Thing', name: 'CRM data quality' }],
      mentions: ['HubSpot', 'GoHighLevel', 'Salesforce', 'Microsoft Dynamics 365', 'Pipedrive', 'Zoho CRM', 'Close', 'Attio'].map((name) => ({ '@type': 'SoftwareApplication', name })),
      isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.origin },
    }
    return <><div className="crm-health-viewport tool-reveal"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(softwareJsonLd) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(webpageJsonLd) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(CRM_HEALTH_FAQS)) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs(tool.title, canonical)) }} /><div className="crm-health-toolbar"><BackLink /><div className="min-w-0 text-right"><p className="text-[10px] uppercase tracking-[0.13em] text-zinc-400 dark:text-zinc-600">CRM diagnostic</p><h1 className="truncate text-sm font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">{tool.title}</h1></div></div><div className="crm-health-workspace"><CrmHealthCheck /></div></div><CrmHealthSeoContent /></>
  }

  if (tool.slug === 'client-onboarding-automation-planner') {
    const webpageJsonLd = {
      '@context': 'https://schema.org', '@type': 'WebPage', name: ONBOARDING_TITLE, url: canonical, description: ONBOARDING_DESCRIPTION, dateModified: '2026-09-15',
      about: [{ '@type': 'Thing', name: 'Client onboarding automation' }, { '@type': 'Thing', name: 'Sales to delivery handoff' }, { '@type': 'Thing', name: 'Business process automation' }, { '@type': 'Thing', name: 'Customer onboarding workflow' }],
      mentions: ['HubSpot', 'GoHighLevel', 'Salesforce', 'Stripe', 'DocuSign', 'Asana', 'ClickUp', 'monday.com', 'Typeform', 'Zapier', 'Make', 'n8n'].map((name) => ({ '@type': 'SoftwareApplication', name })),
      isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.origin },
    }
    return <><div className="onboarding-viewport tool-reveal"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(softwareJsonLd) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(webpageJsonLd) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(ONBOARDING_FAQS)) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs(tool.title, canonical)) }} /><div className="onboarding-toolbar"><BackLink /><div className="min-w-0 text-right"><p className="text-[10px] uppercase tracking-[0.13em] text-zinc-400 dark:text-zinc-600">Onboarding planner</p><h1 className="truncate text-sm font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">{tool.title}</h1></div></div><div className="onboarding-workspace"><OnboardingPlanner /></div></div><OnboardingSeoContent /></>
  }

  if (tool.slug === 'lead-routing-rules-builder') {
    const webpageJsonLd = {
      '@context': 'https://schema.org', '@type': 'WebPage', name: LEAD_ROUTING_TITLE, url: canonical, description: LEAD_ROUTING_DESCRIPTION, dateModified: '2026-09-15',
      about: [{ '@type': 'Thing', name: 'Lead routing' }, { '@type': 'Thing', name: 'Lead assignment' }, { '@type': 'Thing', name: 'Revenue operations' }, { '@type': 'Thing', name: 'Sales automation' }],
      mentions: ['HubSpot', 'Salesforce', 'GoHighLevel', 'Microsoft Dynamics 365', 'Pipedrive', 'Zoho CRM'].map((name) => ({ '@type': 'SoftwareApplication', name })),
      isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.origin },
    }
    return <><div className="routing-viewport tool-reveal"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(softwareJsonLd) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(webpageJsonLd) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(LEAD_ROUTING_FAQS)) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs(tool.title, canonical)) }} /><div className="routing-toolbar"><BackLink /><div className="min-w-0 text-right"><p className="text-[10px] uppercase tracking-[0.13em] text-zinc-400 dark:text-zinc-600">Lead routing builder</p><h1 className="truncate text-sm font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">{tool.title}</h1></div></div><div className="routing-workspace"><LeadRoutingBuilder /></div></div><LeadRoutingSeoContent /></>
  }

  if (tool.slug === 'automation-roi-calculator') {
    const webpageJsonLd = {
      '@context': 'https://schema.org', '@type': 'WebPage', name: AUTOMATION_ROI_TITLE, url: canonical, description: AUTOMATION_ROI_DESCRIPTION, dateModified: '2026-09-15',
      about: [{ '@type': 'Thing', name: 'Automation ROI' }, { '@type': 'Thing', name: 'Business process automation' }, { '@type': 'Thing', name: 'Automation payback period' }, { '@type': 'Thing', name: 'Automation business case' }],
      isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.origin },
    }
    return <><div className="roi-viewport tool-reveal"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(softwareJsonLd) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(webpageJsonLd) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(AUTOMATION_ROI_FAQS)) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs(tool.title, canonical)) }} /><div className="roi-toolbar"><BackLink /><div className="min-w-0 text-right"><p className="text-[10px] uppercase tracking-[0.13em] text-zinc-400 dark:text-zinc-600">ROI calculator</p><h1 className="truncate text-sm font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">{tool.title}</h1></div></div><div className="roi-workspace"><AutomationRoiCalculator /></div></div><AutomationRoiSeoContent /></>
  }

  notFound()
}
