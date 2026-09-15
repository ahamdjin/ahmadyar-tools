import Link from 'next/link'

export const CRM_HEALTH_FAQS = [
  {
    question: 'What does a CRM automation health check measure?',
    answer: 'It measures whether lead capture, identity, ownership, response, follow-up, pipeline state, handoffs, reporting, monitoring, and CRM adoption work together as one dependable revenue process.',
  },
  {
    question: 'Is a high number of CRM automations always better?',
    answer: 'No. More workflows can create duplicate logic, hidden failure paths, and maintenance cost. Healthy CRM automation keeps normal business state native to the CRM and adds external automation only where it solves a real cross-system problem.',
  },
  {
    question: 'Should HubSpot, GoHighLevel, or Salesforce automation stay native?',
    answer: 'Usually, core ownership, lifecycle, pipeline, and standard follow-up should stay native when the CRM handles them cleanly. External tools are most valuable for cross-system orchestration, unusual APIs, transformations, or reliability needs that exceed the CRM.',
  },
  {
    question: 'What should I fix first in a weak CRM?',
    answer: 'Fix the highest-consequence leak first. In many teams that is incomplete lead capture, unassigned leads, slow first response, duplicates, or pipeline state that cannot be trusted. Adding more dashboards or workflows before those controls are reliable usually compounds the problem.',
  },
]

const checks = [
  ['Capture', 'Do all important lead sources create or update the right CRM record with enough context?'],
  ['Identity', 'Can duplicates split history, ownership, attribution, or follow-up?'],
  ['Routing', 'Does every eligible lead receive a deterministic owner and a visible fallback?'],
  ['Response', 'Is speed-to-lead measured, and are missed response targets visible?'],
  ['Follow-up', 'Does normal follow-up happen reliably and stop when the lead replies, books, converts, or disqualifies?'],
  ['Pipeline', 'Do stages have a consistent meaning, and are stale opportunities surfaced before reporting becomes fiction?'],
  ['Handoff', 'Does closed-won context survive the move from sales into onboarding or delivery?'],
  ['Reporting', 'Can the team trust source, owner, stage, response, conversion, and outcome without spreadsheet cleanup?'],
  ['Operations', 'Who owns failures, workflow changes, retries, recovery, and routine cleanup?'],
]

export function CrmHealthSeoContent() {
  return (
    <article className="advisor-guide space-y-20 py-20 sm:py-28">
      <section className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">CRM automation health guide</p>
        <h2 className="mt-3 text-3xl font-medium tracking-[-0.045em] text-zinc-950 sm:text-4xl dark:text-zinc-50">A CRM is healthy when the process is trustworthy, not when it has lots of workflows.</h2>
        <p className="mt-5 text-[15px] leading-8 text-zinc-600 dark:text-zinc-400">A useful CRM should answer simple operating questions without archaeology: where did this lead come from, who owns it, what happens next, how long has it been waiting, what did we promise, and what happened in the end? Automation should make those answers more reliable. If it creates duplicate records, hidden side systems, stale stages, or workflows nobody owns, the automation count is going up while the system gets weaker.</p>
      </section>

      <section>
        <p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">The nine checks</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {checks.map(([title, body]) => <div key={title} className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/50"><h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{body}</p></div>)}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">Story: the CRM looks automated</p>
          <h2 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">Twenty workflows can still hide a basic ownership problem.</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">Imagine an agency with lead ads, a form, calendar bookings, a CRM, Slack, and a few Zapier or Make workflows. Leads are entering automatically, so the setup feels mature. But routing has no fallback, duplicate contacts are common, reps use a side spreadsheet, and nobody watches failed runs. The right first project is not another workflow. It is to make capture, identity, ownership, response, and pipeline state dependable enough that automation can safely build on them.</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">Story: native wins</p>
          <h2 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">Sometimes the best automation tool is the CRM you already pay for.</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">If the process is mostly lead capture, ownership, lifecycle movement, pipeline tasks, standard follow-up, and stage-based reminders, adding a second automation layer can create needless infrastructure. HubSpot, GoHighLevel, Salesforce, Dynamics and other mature CRMs can own a lot of the normal path. Use external automation when work genuinely crosses systems or needs logic the CRM cannot express cleanly.</p>
        </div>
      </section>

      <section className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">How to decide what to repair</p>
        <h2 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">Fix consequence before convenience.</h2>
        <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
          <p><strong className="font-medium text-zinc-950 dark:text-zinc-50">First:</strong> prevent lost or duplicated revenue events—missing leads, no owner, double outreach, bad customer state, broken won-deal handoffs.</p>
          <p><strong className="font-medium text-zinc-950 dark:text-zinc-50">Second:</strong> make the CRM trustworthy—stage definitions, required data, source tracking, stale-deal controls, CRM adoption, and removal of duplicate trackers.</p>
          <p><strong className="font-medium text-zinc-950 dark:text-zinc-50">Third:</strong> improve operating leverage—follow-up automation, reporting, monitoring, recovery, and selective orchestration across other systems.</p>
        </div>
      </section>

      <section className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">Method</p>
        <h2 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">The score is weighted by operational risk, not by feature count.</h2>
        <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">The diagnostic gives more weight to ownership, response, capture, data quality, and pipeline truth than to cosmetic automation maturity. It also changes risk based on monthly lead volume, number of sales users, connected systems, unknown/custom systems, shadow tools, and the number of automation platforms in the stack. A manual routing process for one founder handling twenty leads is not the same risk as manual routing for twenty reps handling five thousand leads.</p>
      </section>

      <section className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">FAQ</p>
        <div className="mt-5 space-y-7">{CRM_HEALTH_FAQS.map((item) => <div key={item.question}><h3 className="text-base font-medium text-zinc-950 dark:text-zinc-50">{item.question}</h3><p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{item.answer}</p></div>)}</div>
      </section>

      <section className="rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-900/50 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">When the problem is bigger than CRM health</p>
        <h2 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">If you are choosing the whole automation stack, use the Architecture Advisor.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">The health check assumes the CRM remains an important system of record. If the real question is whether work belongs in the CRM, Zapier, Make, n8n, Trigger.dev, an enterprise integration platform, or custom software, model the architecture separately.</p>
        <Link href="/automation-architecture-advisor" className="mt-5 inline-flex text-sm font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-zinc-50">Open Automation Architecture Advisor →</Link>
      </section>
    </article>
  )
}
