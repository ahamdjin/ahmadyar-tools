'use client'

import { useMemo, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, RotateCcwIcon } from 'lucide-react'

import { APP_CATALOG, type AppDefinition } from '@/engine/apps'
import {
  analyzeLeadRouting,
  DEFAULT_LEAD_ROUTING_INPUT,
  type AfterHoursRule,
  type ChangeFrequency,
  type ExistingOwnershipRule,
  type LeadRoutingInput,
  type PrimaryRoutingRule,
  type RoutingLevel,
} from '@/engine/lead-routing'

type PageId = 'context' | 'rules' | 'operations' | 'result'

const CRM_APPS = APP_CATALOG.filter((app) => app.category === 'crm')

function AppIcon({ app }: { app: AppDefinition }) {
  if (!app.icon) return <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">{app.name.slice(0, 2).toUpperCase()}</span>
  return <span aria-hidden="true" className="h-8 w-8 shrink-0 rounded-md bg-zinc-100 bg-[length:66%] bg-center bg-no-repeat dark:bg-zinc-900" style={{ backgroundImage: `url(https://cdn.simpleicons.org/${app.icon})` }} />
}

function Select({ value, onChange, children }: { value: string | number; onChange: (value: string) => void; children: React.ReactNode }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100">{children}</select>
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return <div className="grid gap-3 py-4 sm:grid-cols-[230px_1fr] sm:gap-8"><div><p className="text-[15px] font-medium leading-6 text-zinc-950 dark:text-zinc-50">{label}</p>{helper ? <p className="mt-1 max-w-[230px] text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">{helper}</p> : null}</div><div className="self-center">{children}</div></div>
}

function LevelButtons({ value, onChange, labels }: { value: RoutingLevel; onChange: (value: RoutingLevel) => void; labels: [string, string, string, string] }) {
  return <div className="grid gap-2 sm:grid-cols-2">{labels.map((label, index) => <button key={label} type="button" onClick={() => onChange(index as RoutingLevel)} className={`min-h-12 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${value === index ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}>{label}</button>)}</div>
}

function ContextForm({ input, update }: { input: LeadRoutingInput; update: <K extends keyof LeadRoutingInput>(key: K, value: LeadRoutingInput[K]) => void }) {
  return <div className="space-y-5">
    <header className="max-w-2xl"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Start with the routing environment.</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">Where do leads actually become owned?</h2><p className="mt-3 text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">The CRM, team shape, lead volume and routing dimensions determine whether a simple native workflow is enough or whether you are really operating a routing system.</p></header>
    <Field label="CRM / owner system" helper="This should be the source of truth for lead/account identity and owner."><div className="grid gap-2 sm:grid-cols-2">{CRM_APPS.slice(0, 14).map((app) => <button key={app.id} type="button" onClick={() => update('crmId', app.id)} className={`flex min-h-14 items-center gap-3 rounded-lg px-3 py-2 text-left ${input.crmId === app.id ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'}`}><AppIcon app={app} /><span className="min-w-0 flex-1 truncate text-sm font-medium">{app.name}</span>{input.crmId === app.id ? <CheckIcon className="h-4 w-4" /> : null}</button>)}</div></Field>
    <Field label="Inbound leads / month"><Select value={input.monthlyLeads} onChange={(value) => update('monthlyLeads', Number(value))}><option value={50}>Under 100</option><option value={250}>100–500</option><option value={1000}>500–2,000</option><option value={5000}>2,000–10,000</option><option value={20000}>10,000+</option></Select></Field>
    <Field label="People receiving leads"><Select value={input.reps} onChange={(value) => update('reps', Number(value))}><option value={1}>1 rep</option><option value={3}>2–4 reps</option><option value={8}>5–10 reps</option><option value={20}>11–30 reps</option><option value={50}>30+ reps</option></Select></Field>
    <Field label="Routing dimensions" helper="More teams, territories and products increase overlap and precedence risk."><div className="grid grid-cols-3 gap-2"><label className="text-xs text-zinc-500">Teams<input type="number" min={1} max={30} value={input.teams} onChange={(event) => update('teams', Math.max(1, Number(event.target.value)))} className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 bg-transparent px-3 text-sm text-zinc-950 dark:border-zinc-700 dark:text-zinc-50" /></label><label className="text-xs text-zinc-500">Territories<input type="number" min={1} max={100} value={input.territories} onChange={(event) => update('territories', Math.max(1, Number(event.target.value)))} className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 bg-transparent px-3 text-sm text-zinc-950 dark:border-zinc-700 dark:text-zinc-50" /></label><label className="text-xs text-zinc-500">Services<input type="number" min={1} max={50} value={input.serviceLines} onChange={(event) => update('serviceLines', Math.max(1, Number(event.target.value)))} className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 bg-transparent px-3 text-sm text-zinc-950 dark:border-zinc-700 dark:text-zinc-50" /></label></div></Field>
  </div>
}

function RulesForm({ input, update }: { input: LeadRoutingInput; update: <K extends keyof LeadRoutingInput>(key: K, value: LeadRoutingInput[K]) => void }) {
  return <div className="space-y-5"><header className="max-w-2xl"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Now define who is eligible before deciding who is next.</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">What should win when rules collide?</h2></header>
    <Field label="Primary routing shape"><Select value={input.primaryRule} onChange={(value) => update('primaryRule', value as PrimaryRoutingRule)}><option value="round-robin">Round robin</option><option value="territory">Territory / geography</option><option value="service">Product / service specialist</option><option value="segment">Customer segment</option><option value="named-account">Named / strategic accounts</option><option value="score">Qualification / lead score</option><option value="capacity">Capacity / workload</option><option value="hybrid">Hybrid hierarchy</option></Select></Field>
    <Field label="Existing customer / account"><Select value={input.existingOwnership} onChange={(value) => update('existingOwnership', value as ExistingOwnershipRule)}><option value="preserve">Preserve existing owner</option><option value="account-first">Account / opportunity owner wins</option><option value="re-evaluate">Re-evaluate with current rules</option><option value="manual">Send ownership conflict to review</option></Select></Field>
    <Field label="Routing data readiness" helper="Can geography, product, segment and source be trusted before routing?"><LevelButtons value={input.dataReadiness} onChange={(value) => update('dataReadiness', value)} labels={['Mostly free-text / missing','Some standardized fields','Key routing fields controlled','Validated before routing']} /></Field>
    <Field label="Duplicate control"><LevelButtons value={input.duplicateControl} onChange={(value) => update('duplicateControl', value)} labels={['None','Some dedupe after routing','Dedupe before normal assignment','Idempotent identity gate']} /></Field>
    <Field label="Lead-to-account matching"><LevelButtons value={input.accountMatching} onChange={(value) => update('accountMatching', value)} labels={['No matching','Manual / partial','Reliable match before routing','Match + protected relationship rules']} /></Field>
    <Field label="Rule precedence"><LevelButtons value={input.precedenceClarity} onChange={(value) => update('precedenceClarity', value)} labels={['Rules can overlap','Order exists informally','Documented hierarchy','Versioned + tested hierarchy']} /></Field>
    <Field label="Priority / VIP signals"><LevelButtons value={input.prioritySignals} onChange={(value) => update('prioritySignals', value)} labels={['None','A few informal exceptions','Documented priority rules','Protected rules with audit reason']} /></Field>
  </div>
}

function OperationsForm({ input, update }: { input: LeadRoutingInput; update: <K extends keyof LeadRoutingInput>(key: K, value: LeadRoutingInput[K]) => void }) {
  return <div className="space-y-5"><header className="max-w-2xl"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Assignment is only half the system.</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">What happens when normal routing fails?</h2></header>
    <Field label="Availability awareness"><LevelButtons value={input.availabilityAwareness} onChange={(value) => update('availabilityAwareness', value)} labels={['Ignore availability','Manual schedule','Skip unavailable reps','Live eligibility / availability']} /></Field>
    <Field label="Capacity awareness"><LevelButtons value={input.capacityAwareness} onChange={(value) => update('capacityAwareness', value)} labels={['No capacity logic','Managers rebalance manually','Simple workload caps','Capacity is part of eligibility']} /></Field>
    <Field label="Fallback coverage"><LevelButtons value={input.fallbackCoverage} onChange={(value) => update('fallbackCoverage', value)} labels={['Can become unassigned','Generic owner / inbox','Visible fallback queue','Fallback + alert + reason']} /></Field>
    <Field label="Response SLA"><LevelButtons value={input.responseSla} onChange={(value) => update('responseSla', value)} labels={['No measured SLA','Expected informally','SLA timestamps tracked','SLA enforced automatically']} /></Field>
    <Field label="Target first response"><Select value={input.targetResponseMinutes} onChange={(value) => update('targetResponseMinutes', Number(value))}><option value={5}>5 minutes</option><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>1 hour</option><option value={240}>4 hours</option><option value={1440}>1 business day</option></Select></Field>
    <Field label="Escalation / reassignment"><div className="grid gap-3"><LevelButtons value={input.escalation} onChange={(value) => update('escalation', value)} labels={['No escalation','Manager notices manually','Alert on breach','Escalate / reassign by policy']} /><LevelButtons value={input.reassignment} onChange={(value) => update('reassignment', value)} labels={['No reassign policy','Manual only','Documented stale-owner rule','Automated with ownership history']} /></div></Field>
    <Field label="After hours"><Select value={input.afterHours} onChange={(value) => update('afterHours', value as AfterHoursRule)}><option value="acknowledge-queue">Acknowledge + queue</option><option value="queue">Queue for next coverage period</option><option value="on-call-priority">Priority leads to on-call</option><option value="always-live">Always-on eligible pool</option></Select></Field>
    <Field label="Audit trail + monitoring"><div className="grid gap-3"><LevelButtons value={input.auditTrail} onChange={(value) => update('auditTrail', value)} labels={['Cannot explain assignment','Workflow logs only','Reason stored on record','Rule version + full ownership trail']} /><LevelButtons value={input.routingMonitoring} onChange={(value) => update('routingMonitoring', value)} labels={['No monitoring','Occasional checks','Dashboard for routing/SLA','Alerts + routing quality review']} /></div></Field>
    <Field label="Rule changes"><Select value={input.changeFrequency} onChange={(value) => update('changeFrequency', value as ChangeFrequency)}><option value="rarely">A few times per year</option><option value="monthly">Monthly-ish</option><option value="weekly">Weekly / constantly changing</option></Select></Field>
  </div>
}

function Result({ input }: { input: LeadRoutingInput }) {
  const result = useMemo(() => analyzeLeadRouting(input), [input])
  const metrics = Object.entries(result.metrics)
  return <div className="space-y-12 pb-8">
    <header className="grid gap-7 lg:grid-cols-[1fr_260px]"><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Routing health · {result.score}/100</p><h2 className="mt-3 max-w-3xl text-3xl font-medium tracking-[-0.045em] text-zinc-950 sm:text-4xl dark:text-zinc-50">{result.status}</h2><p className="mt-4 max-w-2xl text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">{result.summary}</p><p className="mt-5 max-w-2xl text-sm font-medium text-zinc-950 dark:text-zinc-50">Recommended pattern: {result.recommendedPattern}</p></div><div className="rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-900"><p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Confidence</p><p className="mt-2 text-3xl font-medium tracking-[-0.04em] text-zinc-950 dark:text-zinc-50">{result.confidence}%</p><p className="mt-2 text-xs leading-5 text-zinc-500">Confidence reflects how much of the operating model is known, not certainty theater.</p></div></header>
    <section><h3 className="text-lg font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">Routing sequence</h3><div className="mt-5 grid gap-3 lg:grid-cols-2">{result.rules.map((rule) => <article key={rule.order} className="rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-900"><p className="font-mono text-[10px] text-zinc-500">{String(rule.order).padStart(2,'0')}</p><h4 className="mt-2 text-sm font-medium text-zinc-950 dark:text-zinc-50">{rule.label}</h4><p className="mt-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">When: {rule.condition}</p><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{rule.action}</p><p className="mt-2 text-xs leading-5 text-zinc-500">{rule.reason}</p></article>)}</div></section>
    {result.issues.length ? <section><h3 className="text-lg font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">Risks to fix</h3><div className="mt-5 space-y-3">{result.issues.slice(0,6).map((issue) => <article key={issue.id} className="rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-900"><div className="flex items-start justify-between gap-4"><h4 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{issue.title}</h4><span className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">{issue.severity}</span></div><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{issue.impact}</p><p className="mt-3 text-sm leading-6 text-zinc-800 dark:text-zinc-200">Fix: {issue.fix}</p></article>)}</div></section> : null}
    <section className="grid gap-8 lg:grid-cols-2"><div><h3 className="text-[15px] font-medium text-zinc-950 dark:text-zinc-50">Health dimensions</h3><div className="mt-4 space-y-3">{metrics.map(([name,value]) => <div key={name}><div className="flex justify-between text-xs"><span className="capitalize text-zinc-500">{name.replace(/([A-Z])/g,' $1')}</span><span className="font-mono text-zinc-700 dark:text-zinc-300">{value}/100</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"><div className="h-full bg-zinc-950 dark:bg-zinc-50" style={{width:`${value}%`}} /></div></div>)}</div></div><div><h3 className="text-[15px] font-medium text-zinc-950 dark:text-zinc-50">Architecture</h3><ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{result.architecture.map((item) => <li key={item}>• {item}</li>)}</ul></div></section>
    <section><h3 className="text-[15px] font-medium text-zinc-950 dark:text-zinc-50">Safeguards</h3><ul className="mt-4 grid gap-3 sm:grid-cols-2">{result.safeguards.map((item) => <li key={item} className="rounded-xl bg-zinc-100 p-4 text-sm leading-6 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">{item}</li>)}</ul></section>
    <section><h3 className="text-[15px] font-medium text-zinc-950 dark:text-zinc-50">Pre-launch test cases</h3><div className="mt-4 grid gap-3 lg:grid-cols-2">{result.testCases.map((test) => <article key={test.name} className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-900"><h4 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{test.name}</h4><p className="mt-2 text-xs leading-5 text-zinc-500">Input: {test.input}</p><p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">Expected: {test.expected}</p></article>)}</div></section>
    <section><h3 className="text-[15px] font-medium text-zinc-950 dark:text-zinc-50">Fields worth stamping on every decision</h3><div className="mt-4 flex flex-wrap gap-2">{result.observabilityFields.map((field) => <code key={field} className="rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">{field}</code>)}</div></section>
    {result.nextQuestions.length ? <section><h3 className="text-[15px] font-medium text-zinc-950 dark:text-zinc-50">Questions that would sharpen the design</h3><ol className="mt-4 space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{result.nextQuestions.map((q,index)=><li key={q}><span className="mr-2 font-mono text-[10px] text-zinc-500">{String(index+1).padStart(2,'0')}</span>{q}</li>)}</ol></section> : null}
  </div>
}

export function LeadRoutingBuilder() {
  const [input,setInput] = useState(DEFAULT_LEAD_ROUTING_INPUT)
  const [page,setPage] = useState<PageId>('context')
  const pages: PageId[] = ['context','rules','operations','result']
  const index = pages.indexOf(page)
  const progress = Math.round((index/(pages.length-1))*100)
  const update = <K extends keyof LeadRoutingInput>(key: K,value: LeadRoutingInput[K]) => setInput((current)=>({...current,[key]:value}))
  const canContinue = page !== 'context' || Boolean(input.crmId)
  const next = () => setPage(pages[Math.min(pages.length-1,index+1)])
  const back = () => setPage(pages[Math.max(0,index-1)])
  const reset = () => { setInput(DEFAULT_LEAD_ROUTING_INPUT); setPage('context') }

  return <section className="routing-check grid h-full min-h-0 w-full max-w-[1120px] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
    <div className="pb-3"><div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"><div className="h-full bg-zinc-950 transition-[width] duration-500 dark:bg-zinc-50" style={{width:`${Math.max(7,progress)}%`}} /></div><div className="mt-3 flex items-center justify-between"><span className="text-xs text-zinc-500">{page === 'result' ? 'Routing blueprint complete' : `${progress}% complete`}</span><button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"><RotateCcwIcon className="h-3.5 w-3.5" />Start over</button></div></div>
    <div className="min-h-0 overflow-y-auto pr-1 sm:pr-2">{page === 'context' ? <ContextForm input={input} update={update} /> : null}{page === 'rules' ? <RulesForm input={input} update={update} /> : null}{page === 'operations' ? <OperationsForm input={input} update={update} /> : null}{page === 'result' ? <Result input={input} /> : null}</div>
    <div className="flex items-center justify-between pt-3"><button type="button" onClick={back} disabled={index===0} className="inline-flex min-h-11 items-center gap-2 text-sm text-zinc-600 disabled:invisible dark:text-zinc-400"><ArrowLeftIcon className="h-4 w-4" />Back</button>{page !== 'result' ? <button type="button" onClick={next} disabled={!canContinue} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-zinc-950 px-5 text-sm font-medium text-white disabled:opacity-35 dark:bg-zinc-50 dark:text-zinc-950">Continue<ArrowRightIcon className="h-4 w-4" /></button> : <button type="button" onClick={()=>setPage('context')} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Edit inputs</button>}</div>
  </section>
}
