import Link from 'next/link'

export const AUTOMATION_ROI_FAQS = [
  {
    question: 'How do you calculate automation ROI?',
    answer: 'A useful automation ROI model compares realizable monthly value with build and recurring ownership cost. Start with real case volume and manual handling time, reduce the savings for human review and exception fallback, count only the share of returned capacity the business can actually use, add defensible avoided-error value, then subtract software, maintenance, and one-time build cost.',
  },
  {
    question: 'Is time saved the same as money saved?',
    answer: 'No. Ten hours returned to a team is capacity, not automatically ten hours of cash savings. The economic value depends on whether the time avoids hiring, increases throughput, replaces paid overtime or contractors, reduces backlog, or is redeployed into work the business values. This calculator uses a separate value-capture assumption for that reason.',
  },
  {
    question: 'What is a good payback period for automation?',
    answer: 'There is no universal threshold. A stable, low-risk workflow may justify a longer payback than a fragile process whose rules change every week. The calculator treats twelve-month payback as a useful decision reference and flags very long or negative payback, but reliability, strategic value, compliance, growth, and opportunity cost still matter.',
  },
  {
    question: 'Should maintenance be included in automation ROI?',
    answer: 'Yes. Credentials expire, APIs change, business rules move, exceptions appear, failures need investigation, and workflows require monitoring. Ignoring recurring ownership makes automation look cheaper than it is. Include realistic maintenance hours and the labor cost of whoever will own the system.',
  },
  {
    question: 'How should AI automation ROI be calculated?',
    answer: 'Treat AI as a workflow component, not a guaranteed labor replacement. Include human review, uncertain outputs, exception fallback, model or API cost, error consequences, and the percentage of cases that can actually proceed without intervention. High-impact AI decisions often deserve a pilot and human checkpoint even when the expected ROI is positive.',
  },
  {
    question: 'When should a process not be automated yet?',
    answer: 'Delay deeper automation when the process itself changes constantly, the baseline is mostly guessed, exception rates are high, ownership is unclear, or failure consequences are not controlled. Standardizing or measuring first can produce a better business case than automating a moving target.',
  },
] as const

const stories = [
  {
    title: 'A repetitive enrichment process with boring, strong economics',
    body: 'Imagine 4,000 records a month, six minutes of repetitive lookup and entry per record, controlled source data, and a small exception queue. The automation does not need to eliminate every touch. If it removes most handling, keeps review low, and the team can use the returned capacity, a modest build can repay quickly. This is where automation should feel boring: stable inputs, visible exceptions, measurable throughput, and little architectural drama.',
  },
  {
    title: 'A weekly reporting workflow that looks valuable but should wait',
    body: 'A leadership report may consume many hours and therefore appear to have obvious ROI. But if definitions, data sources and requested cuts change every week, the real cost is not only report production — it is rebuilding automation every time the question moves. Standardize the report contract and source-of-truth definitions first. Otherwise a positive spreadsheet ROI can still create a negative operating system.',
  },
  {
    title: 'A high-value finance or AI workflow that should be piloted',
    body: 'Suppose one automated decision can save meaningful time but a bad result can create a payment, compliance or customer-state problem. Expected ROI may be excellent. That does not justify straight-through execution on day one. A bounded pilot with review, idempotency, failure monitoring and measured exception rates lets the business prove value without pretending risk disappeared.',
  },
]

export function AutomationRoiSeoContent() {
  return (
    <div className="roi-guide pb-16 pt-16 sm:pt-24">
      <article className="space-y-20 text-zinc-700 dark:text-zinc-300">
        <header>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Automation ROI calculator and decision guide</p>
          <h2 className="mt-4 text-3xl font-medium tracking-[-0.045em] text-zinc-950 sm:text-4xl dark:text-zinc-50">A good automation business case asks what value survives after reality shows up.</h2>
          <p className="mt-5 text-base leading-8 text-zinc-600 dark:text-zinc-400">The easy formula is manual hours × hourly cost. The useful formula goes further: how much work is genuinely automatable, how much still needs review, how many cases fall into exceptions, what portion of returned capacity becomes economic value, what errors are actually avoided, and what the system costs to build and own.</p>
        </header>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">The decision model</p>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">Separate capacity, captured value and ownership cost.</h3>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {[
              ['1. Baseline work', 'Measure monthly cases, normal handling time and loaded labor cost. Add error cost only when the business can defend it.'],
              ['2. Straight-through value', 'Reduce the theoretical savings for work that still needs human review or falls back as an exception.'],
              ['3. Value capture', 'Returned hours are capacity. Count only the share that can realistically avoid cost, increase throughput or be redeployed into valuable work.'],
              ['4. Ownership cost', 'Include build, software, hosting and recurring maintenance. A workflow that needs constant babysitting has a different ROI than one that stays quiet.'],
              ['5. Stress case', 'Lower coverage and value capture, increase review, exceptions and cost. A business case that only works under perfect assumptions is not yet a strong business case.'],
              ['6. Process readiness', 'A positive ROI does not override a changing process or critical failure mode. Sometimes the correct recommendation is measure first, standardize first or pilot first.'],
            ].map(([title, body]) => <div key={title} className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/50"><h4 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{title}</h4><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{body}</p></div>)}
          </div>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">The important distinction</p>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">Time saved is not automatically cash saved.</h3>
          <div className="mt-5 space-y-5 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            <p>If automation returns 80 hours a month but the team remains exactly the same size, the company has not necessarily reduced payroll by 80 hours. It has created capacity. That capacity can still be extremely valuable — more customers served, less backlog, faster response, better quality, avoided hiring — but it should be named correctly.</p>
            <p>The value-capture input exists to make that distinction explicit. A business that can avoid a new hire or replace recurring contractor work may capture a high share. A salaried team that simply becomes less busy may capture less immediate financial value, even though the operational benefit is real.</p>
          </div>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Three decision stories</p>
          <div className="mt-6 space-y-8">{stories.map((story) => <div key={story.title}><h3 className="text-lg font-medium tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">{story.title}</h3><p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{story.body}</p></div>)}</div>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">How to use the result</p>
          <div className="mt-5 space-y-6">
            {[
              ['Strong automation candidate', 'The process is stable enough, the baseline has reasonable confidence, and expected payback is attractive. Confirm assumptions, set a build ceiling, then design architecture and safeguards.'],
              ['Pilot before full rollout', 'Economics may work, but failure impact, review, exceptions or uncertainty deserve a limited production-like test before broad deployment.'],
              ['Measure the baseline first', 'Do not spend engineering money to refine a guessed spreadsheet. Measure volume, handling time, exceptions and review effort, then recalculate.'],
              ['Standardize the process first', 'When business rules move weekly or daily, automation often converts operating ambiguity into maintenance burden. Stabilize the process before encoding it.'],
              ['Weak economics right now', 'A process can be automatable without being worth automating. Narrow the scope, lower implementation cost, or wait until volume/value changes.'],
            ].map(([title, body]) => <div key={title}><h3 className="text-base font-medium text-zinc-950 dark:text-zinc-50">{title}</h3><p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{body}</p></div>)}
          </div>
        </section>

        <section className="rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">After ROI passes</p>
          <h3 className="mt-3 text-xl font-medium tracking-[-0.03em] text-zinc-950 dark:text-zinc-50">Do not let a positive business case choose the platform for you.</h3>
          <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">ROI answers whether the opportunity deserves investment. Architecture is a separate question. A process may be valuable to automate and still belong entirely inside HubSpot or GoHighLevel; another may need Zapier, Make, n8n, Trigger.dev, Power Automate, an enterprise integration platform, or custom software.</p>
          <Link href="/automation-architecture-advisor" className="mt-5 inline-flex text-sm font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-zinc-50">Use the Automation Architecture Advisor →</Link>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Frequently asked questions</p>
          <div className="mt-6 space-y-7">{AUTOMATION_ROI_FAQS.map((item) => <div key={item.question}><h3 className="text-base font-medium text-zinc-950 dark:text-zinc-50">{item.question}</h3><p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{item.answer}</p></div>)}</div>
        </section>

        <section className="text-sm leading-7 text-zinc-500">
          <p><strong className="font-medium text-zinc-700 dark:text-zinc-300">Methodology note.</strong> This calculator is a deterministic planning model, not a financial forecast. It deliberately separates theoretical labor capacity from captured value, includes exception/review/maintenance cost, and shows a conservative stress case. Inputs should be replaced with measured operating data as confidence improves.</p>
          <p className="mt-4">If the opportunity is specifically a CRM problem, run the <Link href="/crm-automation-health-check" className="underline underline-offset-4">CRM Automation Health Check</Link>. For sales-to-delivery work, use the <Link href="/client-onboarding-automation-planner" className="underline underline-offset-4">Client Onboarding Automation Planner</Link>.</p>
        </section>
      </article>
    </div>
  )
}
