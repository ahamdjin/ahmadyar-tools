import Link from 'next/link'

export const LEAD_FOLLOW_UP_FAQS = [
  {
    question: 'How do you automate lead follow-up without annoying prospects?',
    answer: 'Automate state transitions and routine timing, not endless generic messages. Use clear enrollment rules, useful channel-specific touches, hard stops for replies and bookings, consent and suppression controls, one accountable owner, and a defined final outcome when the active cadence ends.',
  },
  {
    question: 'Should an automated lead follow-up sequence stop when someone replies?',
    answer: 'For a normal prospecting cadence, a genuine reply should usually stop or branch the automated sequence and hand control to the lead owner. Otherwise scheduled messages can collide with an active human conversation. The exact implementation depends on the CRM and messaging tools involved.',
  },
  {
    question: 'Should a booked meeting stop lead follow-up automation?',
    answer: 'Yes, prospecting follow-up should normally exit when a qualifying appointment is booked. The contact can then move into appointment confirmation, reminders, preparation, rescheduling, or no-show logic instead of continuing to receive messages asking them to book.',
  },
  {
    question: 'What is the best lead follow-up cadence?',
    answer: 'There is no universal number of touches or days. The cadence should reflect lead intent, sales cycle, channel eligibility, team capacity, buying context, and the cost of over-contact. A useful design concentrates attention early for high-intent inbound leads, then spaces later touches and ends with a clear CRM outcome.',
  },
  {
    question: 'Can HubSpot or GoHighLevel handle lead follow-up without Zapier, Make or n8n?',
    answer: 'Often, yes. If lead state, messaging, ownership and booking already live in one CRM, native workflows or cadences can be the cleanest architecture. Add an external automation layer when the process genuinely crosses systems or needs capabilities the native stack cannot provide reliably.',
  },
  {
    question: 'What should be measured in an automated lead follow-up system?',
    answer: 'Measure more than open rates. Useful operating metrics include time to first meaningful response, eligible-lead enrollment coverage, reply and booked-meeting rates by touch/channel, qualified opportunity rate, opt-outs, owner handoff latency, failed messages, duplicate enrollments, and leads that exhaust the cadence without a defined outcome.',
  },
] as const

const stories = [
  {
    title: 'A service business running GoHighLevel',
    body: 'A lead submits a form at 9:40 PM. The system can acknowledge receipt without pretending a salesperson is awake, assign the right owner, respect the contact window, and queue the first meaningful task for the next coverage period. Once the lead replies or books, the prospecting workflow exits. HighLevel can own much of this natively when conversations, opportunities and calendars already live there.',
  },
  {
    title: 'A HubSpot B2B team with human-first selling',
    body: 'The business does not want an AI or automated email pretending to be a rep. Automation can still create value: normalize the lead, assign the owner, start the response SLA, create the first task, surface context, send only an appropriate acknowledgement, and enroll later follow-up if the owner records no engagement. Automation supports the rep instead of replacing the conversation.',
  },
  {
    title: 'A higher-volume Salesforce sales team',
    body: 'A generic sequence becomes fragile when strategic accounts, existing opportunities and multiple reps are involved. Protect existing ownership first, then use a cadence for eligible prospects. The CRM should know why the person entered, which cadence version they are on, when they replied, who owns the conversation, and why they exited.',
  },
]

export function LeadFollowUpSeoContent() {
  return (
    <div className="followup-guide pb-16 pt-16 sm:pt-24">
      <article className="space-y-20 text-zinc-700 dark:text-zinc-300">
        <header>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Lead follow-up automation guide</p>
          <h2 className="mt-4 text-3xl font-medium tracking-[-0.045em] text-zinc-950 sm:text-4xl dark:text-zinc-50">A good follow-up system knows when to speak, when to wait, and when to get out of the way.</h2>
          <p className="mt-5 text-base leading-8 text-zinc-600 dark:text-zinc-400">Lead follow-up automation is often described as a sequence of emails or texts. That is the least interesting part. The real design problem is state: who owns the lead, whether the contact is eligible for the channel, what counts as engagement, which events stop prospecting, and what happens when the normal path fails.</p>
        </header>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">The operating model</p>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">Think in states, not “seven touches.”</h3>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {[
              ['1. Eligible', 'Identity is clean enough, the lead is not suppressed or already in an active buying state, and the chosen channels are appropriate for that contact.'],
              ['2. Owned', 'One person or team is accountable. A fast automated acknowledgement does not replace ownership.'],
              ['3. Following up', 'The lead receives a bounded cadence that changes the reason to respond and mixes automation with useful human actions.'],
              ['4. Engaged', 'A real reply, booking or other qualifying engagement exits generic prospecting and starts a human or appointment-specific path.'],
              ['5. Outcome', 'The cadence ends as engaged, booked, qualified, disqualified, nurture, recycle/cooldown, or no-response. “Still in workflow” is not an outcome.'],
              ['6. Observable', 'Operations can see blocked enrollment, message failures, SLA breaches, duplicate attempts, opt-outs, handoff latency and exhausted cadences.'],
            ].map(([title, body]) => <div key={title} className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/50"><h4 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{title}</h4><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{body}</p></div>)}
          </div>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">The most important design decision</p>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">Stop conditions matter more than clever copy.</h3>
          <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">A follow-up system should re-evaluate the record before each scheduled touch. A reply, qualifying meeting, opt-out, disqualification, customer state, active opportunity or deliberate human takeover can all make the next prospecting message wrong. If the tool cannot enforce those exits reliably, the cadence is not ready to scale.</p>
          <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">This is also why CRM-native automation can win. HighLevel, for example, exposes a workflow-level stop-on-response behavior, while Salesforce Sales Engagement models outreach as cadences and newer cadence tooling can react to engagement tracks. Capabilities and edition requirements change, so implementation should always be checked against current vendor documentation.</p>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Three realistic patterns</p>
          <div className="mt-6 space-y-8">{stories.map((story) => <div key={story.title}><h3 className="text-base font-medium text-zinc-950 dark:text-zinc-50">{story.title}</h3><p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{story.body}</p></div>)}</div>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Native CRM vs external automation</p>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">Do not add Zapier, Make or n8n just because the process is called automation.</h3>
          <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            <p><strong className="font-medium text-zinc-950 dark:text-zinc-50">Stay native</strong> when the CRM already owns lead identity, owner, messaging, calendar and lifecycle state and can enforce the stop rules. This usually creates fewer synchronization failures and a clearer operating model.</p>
            <p><strong className="font-medium text-zinc-950 dark:text-zinc-50">Add orchestration</strong> when critical enrollment or exit signals live elsewhere, when messages must cross specialist providers, or when the flow needs transformations/retries the CRM cannot safely manage. The external layer should coordinate transitions, not invent a second version of lead state.</p>
            <p><strong className="font-medium text-zinc-950 dark:text-zinc-50">Use software</strong> when the follow-up behavior is part of a customer-facing product, depends on durable state/transactions, or has complex policy that needs application-level testing and deployment. A marketing workflow is not a substitute for product architecture.</p>
          </div>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">A sophisticated cadence is still bounded</p>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">More touches are not automatically more follow-up.</h3>
          <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">A useful cadence normally becomes less aggressive over time unless new intent appears. Early high-intent inbound deserves fast attention. Later touches can add context, proof, a useful resource, a different question, or a final close-the-loop message. The system should then write a clear outcome and either stop, recycle after a deliberate cooldown, or move the person into a genuinely different nurture path.</p>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Channel safety</p>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-950 dark:text-zinc-50">Deliverable does not mean eligible.</h3>
          <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">Email, SMS, WhatsApp and calls have different provider rules, consent expectations and regional requirements. The planner intentionally treats channel eligibility, opt-out and contact windows as system inputs rather than assuming every stored phone number or email address can be used. This is an architecture safeguard, not legal advice; verify the current rules that apply to the markets and providers you use.</p>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Use the tools as one decision path</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            <p>Use the <Link href="/lead-routing-rules-builder" className="font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-zinc-50 dark:decoration-zinc-700">Lead Routing Rules Builder</Link> first when ownership itself is unreliable. A follow-up cadence cannot repair a lead that has no accountable owner.</p>
            <p>Use the <Link href="/automation-roi-calculator" className="font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-zinc-50 dark:decoration-zinc-700">Automation ROI Calculator</Link> when you need to decide whether the opportunity is worth funding, including review, exception and maintenance cost.</p>
            <p>Then use the <Link href="/automation-architecture-advisor" className="font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-zinc-50 dark:decoration-zinc-700">Automation Architecture Advisor</Link> when the process crosses systems and you need to decide what belongs in the CRM, an integration platform, developer orchestration or software.</p>
          </div>
        </section>

        <section>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Frequently asked questions</p>
          <div className="mt-6 space-y-8">{LEAD_FOLLOW_UP_FAQS.map((item) => <div key={item.question}><h3 className="text-base font-medium leading-7 text-zinc-950 dark:text-zinc-50">{item.question}</h3><p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{item.answer}</p></div>)}</div>
        </section>
      </article>
    </div>
  )
}
