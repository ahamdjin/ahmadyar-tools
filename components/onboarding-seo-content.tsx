import Link from 'next/link'

export const ONBOARDING_FAQS = [
  {
    question: 'What should trigger client onboarding automation?',
    answer: 'Use the earliest event that is both authoritative and operationally safe. For some businesses that is a closed-won deal, for others it is a signed contract, cleared payment, or a compound gate requiring several conditions. The important part is having one canonical readiness state rather than several competing triggers.',
  },
  {
    question: 'Should onboarding start when a deal is marked won?',
    answer: 'Only when won genuinely means delivery may begin. If signature, payment, compliance, deposit, or internal approval must happen first, a won stage alone is too early. Model those prerequisites explicitly and separate sold from ready-for-onboarding.',
  },
  {
    question: 'What parts of client onboarding should be automated?',
    answer: 'Automate repeatable transitions: owner assignment, welcome messages, structured intake, reminders, project creation from templates, folder creation, status updates, kickoff scheduling, and failure alerts. Keep judgment-heavy scope decisions and unusual exceptions visible to humans.',
  },
  {
    question: 'How do you avoid duplicate onboarding projects?',
    answer: 'Use a stable client or deal identifier, check whether the resource already exists before creating it, store created project and folder IDs back on the source record, and make retry behavior idempotent. External events and webhooks should be assumed capable of arriving more than once.',
  },
  {
    question: 'Do I need Zapier, Make, n8n or custom code for onboarding?',
    answer: 'Not necessarily. Keep simple CRM-native work inside the CRM when possible. Add an orchestration platform when the onboarding crosses multiple systems, needs transformations, retries, branching, monitoring, or API work. Product-critical or highly stateful logic may justify custom software.',
  },
  {
    question: 'What is a ready-for-delivery gate?',
    answer: 'It is the explicit state that means delivery can safely start. Typical requirements include commercial readiness, required intake, access and assets, an assigned owner, a created delivery workspace, and any service-specific prerequisites. This prevents teams from treating sold as the same thing as operationally ready.',
  },
] as const

const scenarios = [
  {
    title: 'Agency with HubSpot, Stripe, Typeform and ClickUp',
    body: 'A deal is not enough if the agency requires a deposit and client inputs before work starts. Use the CRM as the commercial source of truth, payment as a prerequisite, a structured intake for delivery data, and ClickUp templates for execution. The automation should record the created project back on the CRM record and wait for missing prerequisites rather than creating duplicate projects.',
  },
  {
    title: 'GoHighLevel service business with simple fulfillment',
    body: 'If the whole journey already lives inside GoHighLevel and delivery setup is light, keep more of the workflow native. Use opportunity status, forms, calendars, conversations and internal tasks before adding another automation layer. External tooling should solve a real cross-system problem, not exist because it is fashionable.',
  },
  {
    title: 'B2B consultancy with DocuSign, Xero and Asana',
    body: 'A consultancy may need both signature and payment before onboarding. Model that as a compound gate, then create the Asana project from a service template with roles and relative dates. If either prerequisite is missing, keep the client in a visible waiting state with one accountable owner.',
  },
]

export function OnboardingSeoContent() {
  return (
    <div className="onboarding-guide pb-16 pt-16 sm:pt-24">
      <article className="space-y-20 text-zinc-700 dark:text-zinc-300">
        <header className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Client onboarding automation guide</p>
          <h2 className="mt-4 text-3xl font-medium tracking-[-0.045em] text-zinc-950 sm:text-4xl dark:text-zinc-50">Automate the handoff without hiding the work that makes a client ready.</h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-600 dark:text-zinc-400">The best onboarding automation is not a chain of notifications. It is a state model: one authoritative start condition, explicit prerequisites, a repeatable setup path, clear ownership, and a final gate that says delivery can begin.</p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Decision framework</p>
            <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">Four states are usually enough to expose a messy onboarding process.</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['1. Sold', 'The commercial commitment exists, but delivery may still be blocked by signature, payment, approval, or missing data.'],
              ['2. Onboarding', 'The client has an owner and is actively completing intake, access, assets, scheduling, and setup.'],
              ['3. Ready', 'Required commercial, client-input, access and workspace checks have passed.'],
              ['4. Delivery', 'The delivery team owns execution and onboarding status is written back to the source of truth.'],
            ].map(([title, body]) => <div key={title} className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/50"><h4 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{title}</h4><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{body}</p></div>)}
          </div>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">What the automation should own</p>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {[
              ['Commercial gate', 'Use the actual event that means onboarding may begin. Closed-won, signed, paid, or a compound requirement should be explicit rather than inferred.'],
              ['Client readiness', 'Collect missing information, assets, access and approvals as visible states with owners and reminders. Do not bury readiness in inboxes.'],
              ['Delivery setup', 'Instantiate projects from governed templates, assign roles, create standard folders and tasks, and write created resource IDs back to the source record.'],
            ].map(([title, body]) => <div key={title}><h3 className="text-base font-medium text-zinc-950 dark:text-zinc-50">{title}</h3><p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{body}</p></div>)}
          </div>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Real decision stories</p>
          <h3 className="mt-3 max-w-2xl text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">The right onboarding architecture changes with the systems and the commercial model.</h3>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {scenarios.map((scenario) => <article key={scenario.title} className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/50"><h4 className="text-sm font-medium leading-6 text-zinc-950 dark:text-zinc-50">{scenario.title}</h4><p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{scenario.body}</p></article>)}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Reliability</p>
            <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">A workflow is not finished when the happy path works.</h3>
            <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">Payment events can retry, signatures can arrive late, project creation can fail, and clients can submit incomplete intake. A serious onboarding system needs duplicate protection, visible exceptions, safe retries, monitoring, and a way to resume from the correct state.</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Standardization</p>
            <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">Templates should contain the operating model, not just a task list.</h3>
            <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">A useful delivery template includes roles, dependencies, relative dates, required fields, milestone definitions and service-specific work. If every client requires a completely different structure, standardize the service families before automating them deeply.</p>
          </div>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Methodology</p>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">The planner scores operating readiness, not the number of automations you have.</h3>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">The assessment looks at trigger authority, handoff quality, intake and access readiness, workspace standardization, ownership, duplicate safety, exception handling and observability. Higher volume and more service variants increase the cost of weak controls. A strong result can still recommend keeping simple work native rather than adding an external orchestration platform.</p>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Frequently asked questions</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {ONBOARDING_FAQS.map((item) => <div key={item.question}><h3 className="text-sm font-medium leading-6 text-zinc-950 dark:text-zinc-50">{item.question}</h3><p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{item.answer}</p></div>)}
          </div>
        </section>

        <section className="rounded-2xl bg-zinc-100 p-6 sm:p-8 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Related tools</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Link href="/automation-architecture-advisor" className="text-sm font-medium text-zinc-950 hover:opacity-70 dark:text-zinc-50">Choose the automation architecture →</Link>
            <Link href="/crm-automation-health-check" className="text-sm font-medium text-zinc-950 hover:opacity-70 dark:text-zinc-50">Audit CRM automation →</Link>
            <Link href="/lead-routing-rules-builder" className="text-sm font-medium text-zinc-950 hover:opacity-70 dark:text-zinc-50">Build lead routing rules →</Link>
          </div>
        </section>
      </article>
    </div>
  )
}
