import { SITE } from '@/lib/site'

const READING_BY_TOOL: Record<string, Array<{ href: string; label: string; note: string }>> = {
  'automation-architecture-advisor': [
    {
      href: '/blog/how-to-choose-an-automation-stack-without-overengineering',
      label: 'How to choose an automation stack without overengineering it',
      note: 'Native CRM, Zapier, Make, n8n, developer orchestration, and software boundaries.',
    },
    {
      href: '/blog/n8n-vs-zapier-business-automation',
      label: 'n8n vs Zapier for business automation',
      note: 'A narrower platform comparison for common business workflows.',
    },
  ],
  'crm-automation-health-check': [
    {
      href: '/blog/crm-automation-health-check-what-to-fix-first',
      label: 'CRM automation health check: what to fix first',
      note: 'A deeper audit of capture, identity, ownership, response, pipeline truth, handoffs, and operations.',
    },
    {
      href: '/blog/what-is-crm-automation-simple-guide-small-business',
      label: 'CRM automation for small business',
      note: 'The simpler foundation: what CRM automation is and where it helps.',
    },
  ],
  'client-onboarding-automation-planner': [
    {
      href: '/blog/client-onboarding-automation-what-to-automate-keep-human',
      label: 'Client onboarding automation: what to automate and keep human',
      note: 'Triggers, readiness, intake, access, project setup, exceptions, and the human relationship.',
    },
    {
      href: '/blog/zapier-automation-examples-practical-workflows-for-business',
      label: 'Practical Zapier automation examples',
      note: 'Simple cross-system patterns for onboarding and other business handoffs.',
    },
  ],
  'lead-routing-rules-builder': [
    {
      href: '/blog/lead-routing-rules-how-to-design-a-system-that-does-not-break',
      label: 'Lead routing rules that do not turn into a house of cards',
      note: 'Existing ownership, eligibility, round robin, capacity, fallbacks, SLAs, and auditability.',
    },
    {
      href: '/blog/what-is-revenue-operations-revops-plain-english',
      label: 'Revenue operations in plain English',
      note: 'Why routing is part of a connected revenue operating system rather than an isolated workflow.',
    },
  ],
  'automation-roi-calculator': [
    {
      href: '/blog/automation-roi-how-to-calculate-payback-without-fooling-yourself',
      label: 'Automation ROI without fooling yourself',
      note: 'Value capture, review, exceptions, maintenance, risk, payback, and conservative assumptions.',
    },
    {
      href: '/blog/when-is-automation-worth-it',
      label: 'When is automation worth it?',
      note: 'A simpler first-pass decision for deciding whether a workflow deserves investment.',
    },
  ],
  'lead-follow-up-automation-planner': [
    {
      href: '/blog/how-to-automate-lead-follow-up-without-losing-human-touch',
      label: 'Automate lead follow-up without losing the human touch',
      note: 'Ownership, response, stop rules, pipeline attention, AI assistance, and human judgement.',
    },
    {
      href: '/blog/from-lead-form-to-crm-to-follow-up-what-i-learned-connecting-the-whole-system',
      label: 'From lead form to CRM to follow-up',
      note: 'The end-to-end system around capture, CRM state, ownership, and follow-up.',
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
