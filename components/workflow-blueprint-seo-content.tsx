import Link from 'next/link'

export const WORKFLOW_BLUEPRINT_FAQS = [
  {
    question: 'How do I design an automation workflow before building it?',
    answer: 'Start with the business event, source of truth, required input contract and intended outcome. Then define validation, duplicate/idempotency handling, business rules, side effects, writeback, retries, exceptions and observability. Choose the automation platform after the workflow requirements are clear.',
  },
  {
    question: 'What is an automation workflow blueprint?',
    answer: 'A workflow blueprint is an implementation-independent design for one process. It describes the trigger, systems, data contract, rules, state, side effects, reliability model, monitoring and test cases so the same business design can be implemented in native CRM automation, Zapier, Make, n8n, Pipedream, Trigger.dev or software.',
  },
  {
    question: 'When should I use Zapier for a workflow?',
    answer: 'Zapier is often a strong fit for common SaaS handoffs with modest branching and transformations, especially when non-technical ownership and fast implementation matter. High-volume bursts, deep loops, custom APIs, durable state or complex reliability requirements can justify a different architecture.',
  },
  {
    question: 'When is Make better than Zapier?',
    answer: 'Make becomes more compelling when a workflow genuinely needs routers, iteration, heavier transformations or a visual multi-step orchestration model. A simple two-app handoff should not become more complex just to use a more flexible platform.',
  },
  {
    question: 'When should I use n8n, Pipedream or Trigger.dev?',
    answer: 'n8n fits deeper API/data orchestration with technical ownership; Pipedream is strong for developer-owned API and event integration; Trigger.dev is a strong code-first option when durable jobs, retries, waits, concurrency or long-running work are core requirements. The exact choice still depends on systems, volume, ownership and hard constraints.',
  },
  {
    question: 'Why is idempotency important in workflow automation?',
    answer: 'Webhooks, retries, polling and provider failures can cause the same business event to be processed more than once. Idempotency makes repeated delivery safe by tying an operation to a stable key and preventing a retry from double-creating, double-charging, double-messaging or otherwise repeating an irreversible effect.',
  },
] as const

const examples = [
  {
    title: 'Typeform → HubSpot → Slack: simple SaaS handoff',
    body: 'A form submission validates contact data, creates or updates the HubSpot record, records the source, then notifies the correct team. If the business team owns the workflow and logic is modest, Zapier or native HubSpot automation may be better than introducing a developer-oriented runtime. The important blueprint detail is still duplicate-safe contact handling and writing the final CRM record ID back into the run context.',
  },
  {
    title: 'Shopify → data transform → fulfillment systems: visual orchestration',
    body: 'An order event may branch by product or location, iterate line items, transform payloads and update several systems. That is a workflow shape where Make can earn its extra flexibility. The design should still bound concurrency, preserve the Shopify order ID as a business key and make each downstream write independently recoverable.',
  },
  {
    title: 'API event → database → multiple services: technical orchestration',
    body: 'When the workflow reads custom APIs, maintains database state and has a developer owner, n8n or Pipedream can be stronger candidates than a simple connector-first tool. The source-of-truth state and retry/idempotency contract matter more than the visual diagram.',
  },
  {
    title: 'Long-running media or AI job: durable execution',
    body: 'A job that can run for minutes, wait for approval, fan out work, retry transient failures and resume later is not just a normal app-to-app handoff. A durable code-first runtime such as Trigger.dev can be the better lane when developers own it. The workflow needs persisted run state, bounded concurrency and a deterministic fallback for invalid AI output.',
  },
  {
    title: 'Payment/inventory/access state: software boundary',
    body: 'If the automation itself owns money movement, inventory consistency, permissions or another transactional customer-facing state, the core belongs in application/software architecture. Automation platforms can still handle replaceable notifications and integrations around that core without becoming the system of record.',
  },
]

export function WorkflowBlueprintSeoContent() {
  return (
    <div className="blueprint-guide pb-16 pt-16 sm:pt-24">
      <article className="space-y-20 text-zinc-700 dark:text-zinc-300">
        <header>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Workflow automation blueprint guide</p>
          <h2 className="mt-4 text-3xl font-medium tracking-[-0.045em] text-zinc-950 sm:text-4xl dark:text-zinc-50">The platform is not the architecture.</h2>
          <p className="mt-5 text-base leading-8 text-zinc-600 dark:text-zinc-400">A useful automation workflow design should still make sense if you replace Zapier with Make, n8n with Pipedream, or a no-code flow with software. The durable part is the business contract: what starts the work, which state is authoritative, which rules apply, which effects are allowed, how duplicates and retries behave, and how somebody operates the system when reality stops following the happy path.</p>
        </header>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">A stronger workflow model</p>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">Trigger → validate → identity → context → rules → effects → writeback → recovery → observability.</h3>
          <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            <p><strong className="font-medium text-zinc-950 dark:text-zinc-50">Trigger.</strong> Start from one authoritative event, webhook, polling cursor, schedule, batch or manual approval. Do not let three different entry points independently perform the same business action.</p>
            <p><strong className="font-medium text-zinc-950 dark:text-zinc-50">Validate and identify.</strong> Normalize data and establish a stable business key before downstream actions. If retries or duplicate delivery can cause harm, create the idempotency gate before the irreversible effect.</p>
            <p><strong className="font-medium text-zinc-950 dark:text-zinc-50">Load current context.</strong> A webhook payload can be stale by the time it runs. For important decisions, re-read the source-of-truth state so an old event cannot reverse a newer business outcome.</p>
            <p><strong className="font-medium text-zinc-950 dark:text-zinc-50">Rules and effects.</strong> Keep decision logic explicit, then perform side effects only after eligibility and state are known. Capture created resource IDs so a partial success can be resumed rather than repeated.</p>
            <p><strong className="font-medium text-zinc-950 dark:text-zinc-50">Recovery and observability.</strong> Retry transient failures with a bounded policy, surface permanent exceptions, and record enough business context to explain what happened without reconstructing random execution logs.</p>
          </div>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Workflow automation examples</p>
          <div className="mt-6 space-y-8">{examples.map((example) => <div key={example.title}><h3 className="text-base font-medium text-zinc-950 dark:text-zinc-50">{example.title}</h3><p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{example.body}</p></div>)}</div>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Choosing the implementation lane</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {[
              ['Native automation', 'Use the system of record itself when the workflow mostly lives there and native rules can safely cover the state transitions. This is often the cleanest architecture for CRM- or commerce-contained work.'],
              ['Lightweight integration', 'Use a connector-first tool for common SaaS handoffs with modest branching and a business/automation owner. Zapier often wins here because simplicity is a feature, not a limitation.'],
              ['Visual orchestration', 'When routers, iteration and transformation are truly part of the workflow, a platform such as Make can earn the additional modeling depth.'],
              ['Technical orchestration', 'Custom APIs, databases, deep transformations and technical ownership can move the workflow toward n8n or Pipedream.'],
              ['Durable code-first jobs', 'Long-running work, waits, retries, concurrency and developer ownership can justify Trigger.dev or application jobs rather than a standard integration flow.'],
              ['Software/application core', 'Transactional or customer-facing state belongs in software with explicit data consistency, testing, deployments and observability. Automations can surround the core without owning it.'],
            ].map(([title, body]) => <div key={title} className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/50"><h4 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{title}</h4><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{body}</p></div>)}
          </div>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Why idempotency belongs in the blueprint</p>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">“The webhook only fires once” is not a reliability strategy.</h3>
          <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">Real integrations can retry, poll the same record, deliver events late, hit rate limits or partially succeed before a later step fails. Zapier documents trigger deduplication for polling but also notes that duplicate behavior at actions depends on the destination app. Make documents per-webhook queues, ordered processing options and retry/incomplete-execution behavior. Code-first runtimes such as Trigger.dev expose concurrency and retry controls directly. Those platform capabilities help, but the business operation still needs an idempotency key and a known resume rule when repeating a side effect would be unsafe.</p>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Volume vs burstiness</p>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">Ten thousand runs per month can be easy—or arrive in ten ugly minutes.</h3>
          <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">Average monthly volume does not describe the load shape. Webhook and API providers can throttle bursts even when monthly usage is modest. Model peak arrival rate, concurrency, queue depth, rate limits and the age of the oldest queued item separately. This is one reason a queue or durable runtime can become necessary even when the business logic itself looks simple.</p>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Use the tools as one path</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            <p>Use the <Link href="/automation-roi-calculator" className="font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-zinc-50 dark:decoration-zinc-700">Automation ROI Calculator</Link> first when the question is whether the workflow is worth funding at all.</p>
            <p>Use this Blueprint Builder when you already have one real workflow and need the implementation contract. Then use the <Link href="/automation-architecture-advisor" className="font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-zinc-50 dark:decoration-zinc-700">Automation Architecture Advisor</Link> when you need to decide the broader platform portfolio for many workflows.</p>
            <p>If the workflow begins with inbound demand, the <Link href="/lead-routing-rules-builder" className="font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-zinc-50 dark:decoration-zinc-700">Lead Routing Rules Builder</Link> and <Link href="/lead-follow-up-automation-planner" className="font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-zinc-50 dark:decoration-zinc-700">Lead Follow-Up Automation Planner</Link> define the ownership and engagement rules before you encode them into a general-purpose automation platform.</p>
          </div>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Frequently asked questions</p>
          <div className="mt-6 space-y-8">{WORKFLOW_BLUEPRINT_FAQS.map((item) => <div key={item.question}><h3 className="text-base font-medium leading-7 text-zinc-950 dark:text-zinc-50">{item.question}</h3><p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{item.answer}</p></div>)}</div>
        </section>
      </article>
    </div>
  )
}
