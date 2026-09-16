import { SITE } from '@/lib/site'

export const LEAD_ROUTING_FAQS = [
  {
    question: 'What is lead routing?',
    answer: 'Lead routing is the controlled process that decides who should own a new lead or account, why that person is eligible, what happens when the normal rules cannot assign safely, and how quickly the owner must respond. A good router protects existing relationships, handles duplicates, records its reason, and has a visible fallback path.',
  },
  {
    question: 'Is round robin the best lead routing method?',
    answer: 'Round robin is useful when a pool of reps is genuinely interchangeable. It is not enough when territory, product expertise, named accounts, existing ownership, availability, capacity, customer segment, or priority changes who is eligible. In those cases, build the eligible pool first and use round robin only inside that pool.',
  },
  {
    question: 'Should lead routing stay inside the CRM?',
    answer: 'Usually, if the CRM can express the rule hierarchy, matching, assignment, fallback, and reporting cleanly. Keeping initial ownership close to the CRM reduces split-brain assignment. An external router should earn its place through advanced matching, capacity, edition limitations, cross-system context, or complexity that native automation cannot operate safely.',
  },
  {
    question: 'How should duplicate leads affect routing?',
    answer: 'Duplicate and identity checks should happen before a normal ownership change. The router should identify an existing contact or account, apply the existing-relationship policy, and make retries idempotent so one inbound event cannot create multiple conflicting assignments.',
  },
  {
    question: 'What should happen when no routing rule matches?',
    answer: 'Use a visible fallback queue or owner, store the failure reason, and alert the operations owner. The fallback should be measurable because frequent fallback use usually means missing data, an incomplete rule hierarchy, or stale ownership configuration.',
  },
  {
    question: 'How do you measure lead routing quality?',
    answer: 'Measure more than assignment volume. Track routing reason, fallback rate, time to assignment, first-response SLA, reassignment rate, owner changes, duplicate conflicts, distribution by eligible pool, and the share of leads that required manual intervention.',
  },
] as const

const stories = [
  {
    eyebrow: 'Small inbound team',
    title: 'Round robin can be exactly right.',
    body: 'A five-person team selling the same service in one market may only need CRM-native deduplication, an existing-owner check, a single eligible pool, round robin, and an SLA fallback. Adding a dedicated routing platform would create more moving parts than value.',
  },
  {
    eyebrow: 'Multi-product / territory sales',
    title: 'Eligibility should come before fairness.',
    body: 'If geography, product expertise and strategic accounts all matter, a global round robin is wrong. Protect named/existing ownership first, resolve territory and specialist eligibility, then distribute fairly inside the qualified pool.',
  },
  {
    eyebrow: 'High-volume RevOps',
    title: 'Routing becomes an operated system.',
    body: 'At thousands of leads per month, the router needs idempotency, fallback monitoring, rule versioning, SLA timestamps, ownership history, load/availability controls and regression tests. The question stops being “which workflow?” and becomes “how do we operate the decision service?”',
  },
] as const

export function LeadRoutingSeoContent() {
  return <article className="routing-guide pb-24 pt-20 sm:pt-28">
    <header className="max-w-3xl"><p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Lead routing guide</p><h2 className="mt-4 text-3xl font-medium tracking-[-0.045em] text-zinc-950 sm:text-5xl dark:text-zinc-50">Build a routing system that can explain every owner.</h2><p className="mt-5 max-w-2xl text-base leading-8 text-zinc-600 dark:text-zinc-400">The goal is not to move leads around quickly. It is to protect existing relationships, decide eligibility consistently, distribute work fairly, catch every failure path, and make response accountability measurable.</p><p className="mt-4 text-sm text-zinc-500">Methodology reviewed September 2026. The builder is deterministic and vendor-neutral.</p></header>

    <section className="mt-20 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16"><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Decision order</p><h2 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">Normalize → protect → qualify → distribute → enforce SLA.</h2></div><div className="space-y-5 text-[15px] leading-7 text-zinc-600 dark:text-zinc-400"><p>Routing should not begin with round robin. First normalize the fields used by the rules and identify duplicates. Then protect existing account or opportunity ownership. Apply named-account, customer-segment, territory, product, or qualification rules to build the eligible pool. Only after that should fairness, workload, availability, or round robin decide which eligible owner receives the lead.</p><p>A final fallback path is mandatory. Missing geography, a disabled rep, a new service line, a malformed form value, or an empty pool should never make a lead disappear. Stamp the failure reason, assign to a visible queue/owner, and make fallback usage part of operations reporting.</p></div></section>

    <section className="mt-24"><div className="max-w-2xl"><p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Real routing shapes</p><h2 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">The correct router changes with the sales motion.</h2></div><div className="mt-8 grid gap-5 lg:grid-cols-3">{stories.map((story) => <article key={story.title} className="rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-900/70"><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">{story.eyebrow}</p><h3 className="mt-3 text-lg font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">{story.title}</h3><p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{story.body}</p></article>)}</div></section>

    <section className="mt-24"><div className="max-w-3xl"><p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">What to record</p><h2 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">If the router cannot explain itself, operations cannot trust it.</h2><p className="mt-4 text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">Store routing rule/version, routing reason, eligible pool, prior owner, assigned owner, routed timestamp, SLA deadline, first response timestamp, fallback reason and any manual override reason. These fields turn routing from opaque workflow history into an auditable operating system.</p></div></section>

    <section className="mt-24"><div className="max-w-2xl"><p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Frequently asked questions</p><h2 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">Questions to settle before changing ownership automatically.</h2></div><div className="mt-8 grid gap-4 lg:grid-cols-2">{LEAD_ROUTING_FAQS.map((item)=><section key={item.question} className="rounded-2xl bg-zinc-100 p-5 sm:p-6 dark:bg-zinc-900/70"><h3 className="text-base font-medium tracking-[-0.015em] text-zinc-950 dark:text-zinc-50">{item.question}</h3><p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{item.answer}</p></section>)}</div></section>

    <section className="mt-24 rounded-3xl bg-zinc-950 px-6 py-8 text-white sm:px-8 sm:py-10 dark:bg-zinc-100 dark:text-zinc-950"><p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">Architecture check</p><h2 className="mt-3 max-w-2xl text-2xl font-medium tracking-[-0.035em] sm:text-3xl">If routing complexity is only one part of a larger automation stack, validate the whole architecture too.</h2><div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium"><a href={`${SITE.origin}${SITE.toolsPath}/automation-architecture-advisor`} className="transition-opacity hover:opacity-70">Automation Architecture Advisor →</a><a href={`${SITE.origin}${SITE.toolsPath}/crm-automation-health-check`} className="transition-opacity hover:opacity-70">CRM Automation Health Check →</a><a href={`${SITE.origin}/ai-automation/crm`} className="transition-opacity hover:opacity-70">CRM automation guide →</a></div></section>
  </article>
}
