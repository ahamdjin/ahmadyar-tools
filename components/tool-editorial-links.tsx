import { SITE } from '@/lib/site'

const READING_BY_TOOL: Record<string, Array<{ href: string; label: string; note: string }>> = {
  'automation-architecture-advisor': [
    {
      href: '/blog/when-should-you-stop-using-zapier-or-n8n',
      label: 'When should you stop using Zapier or n8n?',
      note: 'A practical boundary between workflow automation and a custom software build.',
    },
    {
      href: '/blog/how-to-choose-an-automation-stack-without-overengineering',
      label: 'How to choose an automation stack without overengineering it',
      note: 'Native CRM, Zapier, Make, n8n, developer orchestration, and software boundaries.',
    },
  ],
  'crm-automation-health-check': [
    {
      href: '/blog/how-to-clean-up-a-messy-crm',
      label: 'How to clean up a messy CRM',
      note: 'Stop new bad data first, then fix duplicates, ownership, fields, pipeline state, and monitoring.',
    },
    {
      href: '/blog/crm-automation-health-check-what-to-fix-first',
      label: 'CRM automation health check: what to fix first',
      note: 'A deeper audit of capture, identity, ownership, response, pipeline truth, handoffs, and operations.',
    },
  ],
  'client-onboarding-automation-planner': [
    {
      href: '/blog/what-should-happen-after-a-client-signs',
      label: 'What should happen after a client signs?',
      note: 'A simple path from signed deal to a delivery-ready client without the access and intake chase.',
    },
    {
      href: '/blog/client-onboarding-automation-what-to-automate-keep-human',
      label: 'Client onboarding automation: what to automate and keep human',
      note: 'Triggers, readiness, intake, access, project setup, exceptions, and the human relationship.',
    },
  ],
  'lead-routing-rules-builder': [
    {
      href: '/blog/should-you-use-round-robin-lead-routing',
      label: 'Should you use round robin lead routing?',
      note: 'When simple rotation works, when it breaks, and which eligibility rules should run first.',
    },
    {
      href: '/blog/lead-routing-rules-how-to-design-a-system-that-does-not-break',
      label: 'Lead routing rules that do not turn into a house of cards',
      note: 'Existing ownership, eligibility, round robin, capacity, fallbacks, SLAs, and auditability.',
    },
  ],
  'automation-roi-calculator': [
    {
      href: '/blog/does-time-saved-count-as-automation-roi',
      label: 'Does time saved count as automation ROI?',
      note: 'Separate returned capacity from financial value before calling saved hours a return.',
    },
    {
      href: '/blog/automation-roi-how-to-calculate-payback-without-fooling-yourself',
      label: 'Automation ROI without fooling yourself',
      note: 'Value capture, review, exceptions, maintenance, risk, payback, and conservative assumptions.',
    },
  ],
  'lead-follow-up-automation-planner': [
    {
      href: '/blog/how-fast-should-you-follow-up-with-a-new-lead',
      label: 'How fast should you follow up with a new lead?',
      note: 'Set a realistic response SLA and separate instant acknowledgement from meaningful human response.',
    },
    {
      href: '/blog/how-to-automate-lead-follow-up-without-losing-human-touch',
      label: 'Automate lead follow-up without losing the human touch',
      note: 'Ownership, response, stop rules, pipeline attention, AI assistance, and human judgement.',
    },
  ],
}

export function ToolEditorialLinks({ slug }: { slug: string }) {
  const links = READING_BY_TOOL[slug]
  if (!links?.length) return null

  return (
    <aside className="advisor-guide pb-16 pt-4 sm:pb-24" aria-label="Related reading">
      <div className="rounded-2xl bg-zinc-50 p-6 sm:p-8 dark:bg-zinc-900/50">
        <p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">Related reading</p>
        <h2 className="mt-3 text-xl font-medium tracking-[-0.03em] text-zinc-950 sm:text-2xl dark:text-zinc-50">
          Read the operating logic behind the tool.
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {links.map((item) => (
            <a key={item.href} href={`${SITE.origin}${item.href}`} className="group block">
              <span className="text-sm font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4 transition-opacity group-hover:opacity-70 dark:text-zinc-50 dark:decoration-zinc-700">
                {item.label} →
              </span>
              <span className="mt-2 block text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.note}</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}
