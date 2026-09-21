type EvidenceItem = { label: string; href: string; note: string }

const EVIDENCE_BY_TOOL: Record<string, EvidenceItem[]> = {
  'automation-architecture-advisor': [
    { label: 'n8n — idempotency and retry safety', href: 'https://blog.n8n.io/idempotency-api/', note: 'Supports the tool’s emphasis on deduplication, bounded retries, and safe recovery for higher-impact workflows.' },
    { label: 'Zapier — business automation patterns', href: 'https://zapier.com/automations/business-owners', note: 'Shows the common owner problems the advisor models: handoffs, follow-up, disconnected systems, approvals, and onboarding.' },
  ],
  'crm-automation-health-check': [
    { label: 'HubSpot — CRM data management', href: 'https://blog.hubspot.com/marketing/keep-customer-data-up-to-date-everywhere', note: 'Supports prevention-first checks for duplicate detection, validation, clean records, and documented data standards.' },
    { label: 'HubSpot — CRM data governance', href: 'https://blog.hubspot.com/marketing/data-governance', note: 'Supports ownership, access control, sensitive-data handling, and governance checks in the diagnostic.' },
  ],
  'client-onboarding-automation-planner': [
    { label: 'Zapier — client onboarding workflow management', href: 'https://zapier.com/automations/customer-service-success/customer-onboarding/onboarding-workflow-management/create-onboarding-tasks-and-checklist-row-for-new-clients', note: 'Supports explicit onboarding tasks, status visibility, and automatic work creation after client intake.' },
    { label: 'Zapier — new client intake', href: 'https://zapier.com/templates/details/new-client-intake-form/', note: 'Supports structured intake and visible onboarding status rather than relying on ad-hoc email chasing.' },
  ],
  'lead-routing-rules-builder': [
    { label: 'Zapier — lead routing automation', href: 'https://zapier.com/automations/marketing/lead-management/lead-routing', note: 'Supports source-aware intake, owner assignment, CRM matching, round robin, alerts, and routing audit trails.' },
    { label: 'HubSpot — automated territory assignment', href: 'https://blog.hubspot.com/sales/automated-territory-assignment', note: 'Supports territory rules, owner rotation, capacity-aware distribution, and fast assignment as practical routing concerns.' },
  ],
  'automation-roi-calculator': [
    { label: 'Zapier — business automation patterns', href: 'https://zapier.com/automations/business-owners', note: 'Grounds the calculator in repetitive operational work such as routing, reminders, record updates, payments, and onboarding.' },
    { label: 'AhmadYar — ROI model assumptions', href: 'https://github.com/ahamdjin/ahmadyar-tools/blob/main/docs/research/roi-model-assumptions.md', note: 'Documents the calculator’s own assumptions so the result can be audited instead of treated as a universal benchmark.' },
  ],
  'lead-follow-up-automation-planner': [
    { label: 'HubSpot — lead follow-up automation', href: 'https://www.hubspot.com/automate-lead-follow-up-nurturing', note: 'Supports systematic follow-up, consistent timing, and keeping leads from falling through manual gaps.' },
    { label: 'Zapier — dropped-lead survey', href: 'https://zapier.com/blog/dropped-leads-survey/', note: 'Supports the planner’s focus on handoff gaps, repeated follow-up, routing, and connected systems; survey claims are not used as scoring constants.' },
  ],
}

export function ToolEvidence({ slug }: { slug: string }) {
  const items = EVIDENCE_BY_TOOL[slug]
  if (!items?.length) return null

  return (
    <aside className="advisor-guide pb-10 pt-2 sm:pb-14" aria-label="Research and evidence">
      <div className="rounded-2xl border border-zinc-200/80 p-6 sm:p-8 dark:border-zinc-800">
        <p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">Research & evidence</p>
        <h2 className="mt-3 text-xl font-medium tracking-[-0.03em] text-zinc-950 sm:text-2xl dark:text-zinc-50">What informed this tool</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">Reviewed 21 September 2026. These sources support the operating concerns the tool asks about; vendor claims and survey statistics are not silently converted into scoring rules.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {items.map((item) => (
            <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="group block">
              <span className="text-sm font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4 transition-opacity group-hover:opacity-70 dark:text-zinc-50 dark:decoration-zinc-700">{item.label} ↗</span>
              <span className="mt-2 block text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.note}</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}
