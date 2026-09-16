import { SITE } from '@/lib/site'

export const ADVISOR_FAQS = [
  {
    question: 'What is an automation architecture?',
    answer:
      'Automation architecture is the way native app workflows, integration platforms, orchestration tools, durable background jobs, data stores, and custom software are divided so each part of a process runs in the right place. The goal is not to pick one winner for every workflow; it is to keep each responsibility in the simplest reliable layer that can own it.',
  },
  {
    question: 'Is Zapier better than Make or n8n?',
    answer:
      'Not universally. Zapier is often the strongest choice for common SaaS handoffs and non-technical ownership. Make becomes more attractive when visual branching, transformations, routers, or record-heavy operations matter. n8n becomes more attractive when APIs, reusable technical logic, AI workflows, data shaping, execution economics, or infrastructure control justify a deeper orchestration layer.',
  },
  {
    question: 'When should I keep automation inside HubSpot or GoHighLevel?',
    answer:
      'Keep a workflow native when the CRM already owns the business state and can perform the lifecycle, routing, follow-up, messaging, appointment, or pipeline action cleanly. An external platform should earn its place by solving a real cross-system, reliability, API, scale, or maintainability problem.',
  },
  {
    question: 'When does Trigger.dev make more sense than a no-code automation platform?',
    answer:
      'Trigger.dev is a stronger candidate when developers own the system and the work behaves like durable background jobs: queues, retries, concurrency, long-running tasks, scheduled jobs, AI jobs, or application-side workflows that need to survive deploys and transient failures.',
  },
  {
    question: 'When should an automation become custom software?',
    answer:
      'When the core process becomes stateful, transactional, customer-facing, latency-sensitive, or tightly coupled to a product domain model, custom software can be safer and easier to reason about than one giant workflow. Automation platforms can still handle replaceable integrations around that core.',
  },
  {
    question: 'Can one company use several automation platforms?',
    answer:
      'Yes. A healthy architecture can keep simple CRM workflows native, use Zapier for ordinary app handoffs, use Make or n8n for deeper orchestration, use Trigger.dev for developer-owned durable jobs, and reserve custom code for application logic. Standardization matters, but forcing every workload onto one tool can create unnecessary complexity.',
  },
] as const

const decisionLayers = [
  {
    title: '1. Native first',
    body: 'If HubSpot, GoHighLevel, Salesforce, Shopify, Microsoft, or another system of record already owns the data and can perform the workflow safely, keep the logic close to that source of truth.',
  },
  {
    title: '2. Integration when the work is simple',
    body: 'Use connector-led automation for predictable SaaS-to-SaaS handoffs. This is where Zapier, Make, Power Automate, and similar tools often compete on ownership, connector depth, workflow shape, and economics.',
  },
  {
    title: '3. Orchestrate when complexity is real',
    body: 'APIs, branching, transformations, AI steps, databases, batching, retries, and cross-system recovery can justify n8n, Make, Pipedream, Workato, Tray.ai, MuleSoft, or another orchestration layer.',
  },
  {
    title: '4. Use durable jobs for application-side work',
    body: 'Developer-owned queues, long-running tasks, concurrency control, scheduled jobs, and retryable background work may belong in Trigger.dev or a similar durable job runtime instead of a business automation canvas.',
  },
  {
    title: '5. Build software when the workflow becomes the product',
    body: 'Persistent state, transactions, customer-facing behavior, low-latency rules, or core domain logic are signals that the center of the system should be tested and operated like software.',
  },
] as const

const stories = [
  {
    eyebrow: 'Agency stack',
    title: 'GoHighLevel should sometimes win outright.',
    body: 'Imagine an agency using GoHighLevel for leads, pipelines, appointments, SMS, email, and follow-up, with only a few simple handoffs to Slack and accounting. Moving every lead event into an external orchestrator would create credentials, failure modes, and maintenance without adding much capability. The cleaner plan can be GoHighLevel for the customer journey, plus a small integration layer only where data actually leaves the CRM.',
  },
  {
    eyebrow: 'Revenue operations',
    title: 'HubSpot can be the architecture, not just a connector.',
    body: 'A HubSpot-centered RevOps team may keep lifecycle stages, ownership, pipeline movement, tasks, and simple follow-up native. If forms, enrichment, Slack, finance, and internal APIs enter the picture, the answer can become layered: HubSpot remains the source of truth while Zapier handles simple handoffs and n8n or another orchestrator owns the genuinely technical workflows.',
  },
  {
    eyebrow: 'Product engineering',
    title: 'The best answer may not be an automation platform.',
    body: 'A SaaS product that runs AI processing jobs, waits on external APIs, retries failures, limits concurrency, updates a database, and affects customer-visible state has crossed into application infrastructure. Trigger.dev can be a strong fit for durable background work, while transactional domain logic may still belong in custom code. Using Zapier or Make for the core would optimize for the wrong problem.',
  },
] as const

const platformGuidance = [
  ['HubSpot', 'CRM-centered lifecycle, routing, pipeline, service, and marketing workflows where HubSpot owns the record.'],
  ['GoHighLevel', 'Agency and local-business lead journeys, messaging, appointments, opportunities, and follow-up that already live in HighLevel.'],
  ['Zapier', 'Common SaaS handoffs, broad connector coverage, fast implementation, and teams that value simple non-technical ownership.'],
  ['Make', 'Visual multi-step operations, routers, branching, transformations, batching, and workflows that benefit from seeing the full flow.'],
  ['n8n', 'API-heavy orchestration, reusable technical logic, AI/data workflows, advanced control, and teams that can own a more technical platform.'],
  ['Power Automate', 'Microsoft 365, Dynamics, Azure, approvals, identity, desktop automation, and governed Microsoft environments.'],
  ['Trigger.dev', 'Developer-owned durable background jobs, queues, retries, long-running tasks, schedules, concurrency, and application-side automation.'],
  ['Pipedream', 'Developer-oriented event and API workflows where code and hosted integrations are more natural than a business-user canvas.'],
  ['Activepieces', 'Open-source-friendly automation when self-hosting or control matters and the required connectors are strong enough.'],
  ['Workato / Tray.ai / MuleSoft', 'Larger cross-team integration programs where governance, reuse, enterprise systems, APIs, and operating discipline justify enterprise tooling.'],
  ['Custom software', 'Stateful, transactional, customer-facing, low-latency, or product-critical logic that should be tested and operated as software.'],
] as const

export function AdvisorSeoContent() {
  return (
    <article className="advisor-guide pb-24 pt-20 sm:pt-28">
      <header className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Automation architecture guide</p>
        <h2 className="mt-4 text-3xl font-medium tracking-[-0.045em] text-zinc-950 sm:text-5xl dark:text-zinc-50">
          Choose an automation stack by architecture, not hype.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-600 dark:text-zinc-400">
          The useful question is not “Which automation tool is best?” It is “Where should each part of this process live?” This advisor compares native automation, integration platforms, orchestration, durable jobs, enterprise integration, and custom software against the systems, ownership, volume, reliability, budget, and growth you describe.
        </p>
        <p className="mt-4 text-sm text-zinc-500">Methodology reviewed September 2026. The recommendation engine is deterministic; no vendor pays to rank higher.</p>
      </header>

      <section className="mt-20" aria-labelledby="architecture-layers">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Decision framework</p>
          <h2 id="architecture-layers" className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">Five layers that keep automation maintainable.</h2>
          <p className="mt-4 text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">A strong architecture uses the lightest layer that can safely own the work, then adds complexity only when the process earns it.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decisionLayers.map((item) => (
            <div key={item.title} className="rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-900/70">
              <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24" aria-labelledby="architecture-stories">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Architecture stories</p>
          <h2 id="architecture-stories" className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">The right answer changes with the shape of the business.</h2>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {stories.map((story) => (
            <article key={story.title} className="rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-900/70">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">{story.eyebrow}</p>
              <h3 className="mt-3 text-lg font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">{story.title}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{story.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-24" aria-labelledby="platform-fit">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Platform fit</p>
          <h2 id="platform-fit" className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">Where the major automation options tend to win.</h2>
          <p className="mt-4 text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">These are not fixed rankings. They are the operating conditions each option is naturally suited to. The advisor changes the ranking when your actual stack, workflow shape, ownership, scale, or reliability requirements change.</p>
        </div>
        <dl className="mt-8 grid gap-3 sm:grid-cols-2">
          {platformGuidance.map(([name, guidance]) => (
            <div key={name} className="rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-900/70">
              <dt className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{name}</dt>
              <dd className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{guidance}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-24 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16" aria-labelledby="methodology">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">How the advisor decides</p>
          <h2 id="methodology" className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">Hard constraints first. Trade-offs second.</h2>
        </div>
        <div className="space-y-5 text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">
          <p>The engine starts with the systems you already use because that removes generic advice quickly. It then measures workflow count now and later, execution volume, typical workflow size, API pressure, branching, batching, databases, AI, human approval, process stability, failure consequences, duplicate safety, retries, sensitive data, hosting requirements, governance, budget, and who has to maintain the system.</p>
          <p>Some answers act as constraints rather than tiny score modifiers. Mandatory self-hosting can eliminate managed-only platforms. Product-like transactional logic can move the core into software. A Microsoft-first environment can make identity and governance more important than connector count. A simple CRM-contained workflow can make an external platform unnecessary.</p>
          <p>After those constraints, the engine compares ownership fit, simplicity, integration support, workflow complexity, scale, reliability, control, ecosystem fit, and economics. Close results lower confidence instead of pretending that a one-point difference is certainty.</p>
        </div>
      </section>

      <section className="mt-24" aria-labelledby="faq">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Frequently asked questions</p>
          <h2 id="faq" className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">Questions people usually ask before choosing a platform.</h2>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {ADVISOR_FAQS.map((item) => (
            <section key={item.question} className="rounded-2xl bg-zinc-100 p-5 sm:p-6 dark:bg-zinc-900/70">
              <h3 className="text-base font-medium tracking-[-0.015em] text-zinc-950 dark:text-zinc-50">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{item.answer}</p>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-24 rounded-3xl bg-zinc-950 px-6 py-8 text-white sm:px-8 sm:py-10 dark:bg-zinc-100 dark:text-zinc-950">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">Keep going</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-medium tracking-[-0.035em] sm:text-3xl">Use the result as an architecture hypothesis, then validate the workflows that matter most.</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 dark:text-zinc-600">For deeper reading, start with the architecture guide, compare the trade-offs between n8n and Zapier, or review the CRM layer underneath the workflows.</p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
          <a href={`${SITE.origin}/blog/how-to-choose-an-automation-stack-without-overengineering`} className="transition-opacity hover:opacity-70">Architecture guide →</a>
          <a href={`${SITE.origin}/blog/n8n-vs-zapier-business-automation`} className="transition-opacity hover:opacity-70">n8n vs Zapier →</a>
          <a href={`${SITE.origin}/ai-automation/crm`} className="transition-opacity hover:opacity-70">CRM automation →</a>
          <a href={`${SITE.origin}/ai-automation`} className="transition-opacity hover:opacity-70">AI automation →</a>
        </div>
      </section>
    </article>
  )
}
