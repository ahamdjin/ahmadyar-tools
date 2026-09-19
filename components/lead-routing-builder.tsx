'use client'

import { useMemo, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, RotateCcwIcon } from 'lucide-react'

import { ToolResultActions } from '@/components/tool-result-actions'
import { useToolStepNavigation } from '@/components/use-tool-step-navigation'
import { APP_CATALOG, type AppDefinition } from '@/engine/apps'
import {
  analyzeLeadRouting,
  DEFAULT_LEAD_ROUTING_INPUT,
  type AfterHoursRule,
  type ExistingOwnershipRule,
  type LeadRoutingInput,
  type PrimaryRoutingRule,
  type RoutingLevel,
} from '@/engine/lead-routing'

type StepId = 'context' | 'logic' | 'recovery' | 'result'
const STEPS: StepId[] = ['context', 'logic', 'recovery', 'result']
const CRM_APPS = APP_CATALOG.filter((app) => app.category === 'crm')

function AppIcon({ app }: { app: AppDefinition }) {
  if (!app.icon) return <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[9px] font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">{app.name.slice(0, 2).toUpperCase()}</span>
  return <span aria-hidden="true" className="h-7 w-7 shrink-0 rounded-md bg-zinc-100 bg-[length:66%] bg-center bg-no-repeat dark:bg-zinc-900" style={{ backgroundImage: `url(https://cdn.simpleicons.org/${app.icon})` }} />
}

function Select({ value, onChange, children }: { value: string | number; onChange: (value: string) => void; children: React.ReactNode }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100">{children}</select>
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return <div className="grid gap-3 border-b border-zinc-200 py-4 last:border-b-0 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-7 dark:border-zinc-800"><div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{label}</p>{helper ? <p className="mt-1 text-xs leading-5 text-zinc-500">{helper}</p> : null}</div><div className="min-w-0 self-center">{children}</div></div>
}

function Level({ value, onChange, labels }: { value: RoutingLevel; onChange: (value: RoutingLevel) => void; labels: readonly [string, string, string, string] }) {
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{labels.map((label, index) => <button key={label} type="button" onClick={() => onChange(index as RoutingLevel)} className={`min-h-14 rounded-xl px-2.5 py-2 text-left text-xs leading-4 transition-colors ${value === index ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:bg-zinc-900'}`}><span className="block font-mono text-[9px] opacity-60">{index}</span><span className="mt-1 block font-medium">{label}</span></button>)}</div>
}

function StepIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <header className="max-w-2xl"><p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">{eyebrow}</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">{title}</h2><p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">{body}</p></header>
}

function ContextStep({ input, update }: { input: LeadRoutingInput; update: <K extends keyof LeadRoutingInput>(key: K, value: LeadRoutingInput[K]) => void }) {
  return <div className="space-y-8">
    <StepIntro eyebrow="1 · Routing environment" title="Who can legitimately own a new lead?" body="Round robin is only the final distribution method. First define the source of truth, the eligible team and the business dimensions that make one owner more appropriate than another." />
    <section><p className="text-xs font-medium text-zinc-500">CRM / owner system</p><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{CRM_APPS.map((app) => { const active = input.crmId === app.id; return <button key={app.id} type="button" onClick={() => update('crmId', app.id)} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${active ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950' : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-900'}`}><AppIcon app={app} /><span className="min-w-0 truncate text-sm font-medium">{app.name}</span>{active ? <CheckIcon className="ml-auto h-3.5 w-3.5" /> : null}</button> })}</div></section>
    <section className="border-y border-zinc-200 dark:border-zinc-800">
      <Field label="Inbound leads / month"><Select value={input.monthlyLeads} onChange={(value) => update('monthlyLeads', Number(value))}><option value={50}>Under 100</option><option value={250}>100–500</option><option value={1000}>500–2,000</option><option value={5000}>2,000–10,000</option><option value={20000}>10,000+</option></Select></Field>
      <Field label="People receiving leads"><Select value={input.reps} onChange={(value) => update('reps', Number(value))}><option value={1}>1</option><option value={3}>2–4</option><option value={8}>5–10</option><option value={20}>11–30</option><option value={50}>30+</option></Select></Field>
      <Field label="Routing dimensions" helper="How many distinct teams, territories and service lines can affect eligibility?"><div className="grid grid-cols-3 gap-2"><label className="text-[10px] text-zinc-500">Teams<input type="number" min={1} max={30} value={input.teams} onChange={(event) => update('teams', Math.max(1, Number(event.target.value)))} className="mt-1 min-h-11 w-full rounded-xl border border-zinc-300 bg-transparent px-3 text-sm text-zinc-950 dark:border-zinc-700 dark:text-zinc-50" /></label><label className="text-[10px] text-zinc-500">Territories<input type="number" min={1} max={100} value={input.territories} onChange={(event) => update('territories', Math.max(1, Number(event.target.value)))} className="mt-1 min-h-11 w-full rounded-xl border border-zinc-300 bg-transparent px-3 text-sm text-zinc-950 dark:border-zinc-700 dark:text-zinc-50" /></label><label className="text-[10px] text-zinc-500">Services<input type="number" min={1} max={50} value={input.serviceLines} onChange={(event) => update('serviceLines', Math.max(1, Number(event.target.value)))} className="mt-1 min-h-11 w-full rounded-xl border border-zinc-300 bg-transparent px-3 text-sm text-zinc-950 dark:border-zinc-700 dark:text-zinc-50" /></label></div></Field>
    </section>
  </div>
}

function LogicStep({ input, update }: { input: LeadRoutingInput; update: <K extends keyof LeadRoutingInput>(key: K, value: LeadRoutingInput[K]) => void }) {
  return <div className="space-y-8">
    <StepIntro eyebrow="2 · Eligibility + precedence" title="Decide what wins before you decide who is next." body="The safest router protects identity and existing relationships, applies protected rules, builds an eligible pool, then distributes inside that pool. This avoids using round robin as a substitute for business logic." />
    <section className="border-y border-zinc-200 dark:border-zinc-800">
      <Field label="Primary distribution rule"><Select value={input.primaryRule} onChange={(value) => update('primaryRule', value as PrimaryRoutingRule)}><option value="round-robin">Round robin inside eligible pool</option><option value="territory">Territory / geography</option><option value="service">Product / service specialist</option><option value="segment">Customer segment</option><option value="named-account">Named / strategic account</option><option value="score">Qualification / priority score</option><option value="capacity">Capacity / workload</option><option value="hybrid">Hybrid hierarchy</option></Select></Field>
      <Field label="Existing customer / account"><Select value={input.existingOwnership} onChange={(value) => update('existingOwnership', value as ExistingOwnershipRule)}><option value="preserve">Preserve existing owner</option><option value="account-first">Account / opportunity owner wins</option><option value="re-evaluate">Re-evaluate with current rules</option><option value="manual">Send conflict to review</option></Select></Field>
      <Field label="Routing data readiness" helper="Can territory, product, segment and source be trusted before assignment?"><Level value={input.dataReadiness} onChange={(value) => update('dataReadiness', value)} labels={['Missing / free-text','Some standards','Key fields controlled','Validated before route']} /></Field>
      <Field label="Duplicate control"><Level value={input.duplicateControl} onChange={(value) => update('duplicateControl', value)} labels={['None','Clean after route','Dedupe before route','Identity gate + idempotency']} /></Field>
      <Field label="Lead-to-account matching"><Level value={input.accountMatching} onChange={(value) => update('accountMatching', value)} labels={['No matching','Manual / partial','Reliable match first','Protected relationship rules']} /></Field>
      <Field label="Rule precedence"><Level value={input.precedenceClarity} onChange={(value) => update('precedenceClarity', value)} labels={['Rules overlap','Informal order','Documented hierarchy','Versioned + tested']} /></Field>
      <Field label="Priority exceptions"><Level value={input.prioritySignals} onChange={(value) => update('prioritySignals', value)} labels={['None','Informal exceptions','Documented priority','Protected + auditable']} /></Field>
      <Field label="Manual override control"><Level value={input.overrideControl} onChange={(value) => update('overrideControl', value)} labels={['Anyone can override','Some convention','Reason required','Controlled + audited']} /></Field>
    </section>
  </div>
}

function RecoveryStep({ input, update }: { input: LeadRoutingInput; update: <K extends keyof LeadRoutingInput>(key: K, value: LeadRoutingInput[K]) => void }) {
  return <div className="space-y-8">
    <StepIntro eyebrow="3 · Failure handling" title="A router is only real when the unmatched lead still has a path." body="Eligibility changes, people go offline, data arrives incomplete and response promises get missed. Design the fallback, SLA and audit trail before launch instead of debugging orphaned leads later." />
    <section className="border-y border-zinc-200 dark:border-zinc-800">
      <Field label="Availability awareness"><Level value={input.availabilityAwareness} onChange={(value) => update('availabilityAwareness', value)} labels={['Ignore availability','Manual schedule','Skip unavailable','Live eligibility']} /></Field>
      <Field label="Capacity awareness"><Level value={input.capacityAwareness} onChange={(value) => update('capacityAwareness', value)} labels={['None','Manager balances','Simple caps','Capacity in eligibility']} /></Field>
      <Field label="Catch-all fallback"><Level value={input.fallbackCoverage} onChange={(value) => update('fallbackCoverage', value)} labels={['Can be unassigned','Generic inbox','Visible fallback queue','Queue + alert + reason']} /></Field>
      <Field label="Response SLA"><div className="grid gap-2 sm:grid-cols-2"><Select value={input.targetResponseMinutes} onChange={(value) => update('targetResponseMinutes', Number(value))}><option value={5}>5 min target</option><option value={15}>15 min target</option><option value={30}>30 min target</option><option value={60}>1 hour target</option><option value={240}>4 hour target</option><option value={1440}>1 business day</option></Select><Select value={input.responseSla} onChange={(value) => update('responseSla', Number(value) as RoutingLevel)}><option value={0}>Not measured</option><option value={1}>Expected informally</option><option value={2}>Timestamps tracked</option><option value={3}>Enforced automatically</option></Select></div></Field>
      <Field label="Escalation"><Level value={input.escalation} onChange={(value) => update('escalation', value)} labels={['None','Manager notices','Alert on breach','Escalate / reassign']} /></Field>
      <Field label="Reassignment"><Level value={input.reassignment} onChange={(value) => update('reassignment', value)} labels={['No policy','Manual only','Documented rule','Automated + history']} /></Field>
      <Field label="After hours"><Select value={input.afterHours} onChange={(value) => update('afterHours', value as AfterHoursRule)}><option value="acknowledge-queue">Acknowledge + queue</option><option value="queue">Queue for next coverage period</option><option value="on-call-priority">Priority leads to on-call</option><option value="always-live">Always-on eligible pool</option></Select></Field>
      <Field label="Audit trail"><Level value={input.auditTrail} onChange={(value) => update('auditTrail', value)} labels={['Cannot explain route','Workflow logs only','Reason on record','Rule version + history']} /></Field>
      <Field label="Monitoring"><Level value={input.routingMonitoring} onChange={(value) => update('routingMonitoring', value)} labels={['None','Occasional checks','Routing / SLA dashboard','Alerts + quality review']} /></Field>
    </section>
  </div>
}

function Result({ input, onEdit }: { input: LeadRoutingInput; onEdit: (step: StepId) => void }) {
  const result = useMemo(() => analyzeLeadRouting(input), [input])
  const topIssues = result.issues.slice(0, 3)
  return <div className="space-y-10 pb-8">
    <section className="rounded-[24px] bg-zinc-950 p-6 text-white sm:p-8 dark:bg-zinc-100 dark:text-zinc-950"><div className="flex flex-wrap items-start justify-between gap-6"><div className="max-w-2xl"><p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-400 dark:text-zinc-600">Routing recommendation</p><h2 className="mt-2 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">{result.status}</h2><p className="mt-3 text-sm font-medium text-zinc-200 dark:text-zinc-800">{result.recommendedPattern}</p><p className="mt-4 text-sm leading-7 text-zinc-300 dark:text-zinc-700">{result.summary}</p></div><div className="text-right"><p className="font-mono text-2xl font-medium">{result.score}/100</p><p className="text-xs text-zinc-400 dark:text-zinc-600">confidence {result.confidence}%</p></div></div><div className="mt-6"><ToolResultActions title={`Lead routing: ${result.status}`} summary={result.summary} details={result.rules.map((rule) => `${rule.order}. ${rule.label}: ${rule.action}`)} /></div></section>

    <section><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Rule order</p><h3 className="mt-2 text-xl font-medium tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">Run these checks in this sequence.</h3></div><button type="button" onClick={() => onEdit('logic')} className="text-xs font-medium text-zinc-500 underline decoration-zinc-300 underline-offset-4">Edit logic</button></div><div className="mt-5 border-y border-zinc-200 dark:border-zinc-800">{result.rules.map((rule, index) => <div key={rule.order} className={`grid gap-2 py-4 sm:grid-cols-[36px_190px_1fr] ${index ? 'border-t border-zinc-200 dark:border-zinc-800' : ''}`}><span className="font-mono text-[10px] text-zinc-500">{String(rule.order).padStart(2, '0')}</span><div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{rule.label}</p><p className="mt-1 text-[11px] leading-4 text-zinc-500">{rule.condition}</p></div><div><p className="text-xs leading-5 text-zinc-700 dark:text-zinc-300">{rule.action}</p><p className="mt-1 text-[11px] leading-4 text-zinc-500">{rule.reason}</p></div></div>)}</div></section>

    {topIssues.length ? <section><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Fix before launch</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{topIssues.map((issue) => <div key={issue.id} className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55"><p className="font-mono text-[10px] uppercase text-zinc-500">{issue.severity}</p><h4 className="mt-2 text-sm font-medium text-zinc-950 dark:text-zinc-50">{issue.title}</h4><p className="mt-2 text-xs leading-5 text-zinc-500">{issue.impact}</p><p className="mt-3 text-xs leading-5 text-zinc-700 dark:text-zinc-300"><span className="font-medium">Fix:</span> {issue.fix}</p></div>)}</div></section> : null}

    <section><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Pre-launch tests</p><h3 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">Test ugly cases, not only the happy path.</h3><div className="mt-4 space-y-2">{result.testCases.slice(0, 8).map((testCase) => <div key={testCase.name} className="grid gap-2 rounded-xl border border-zinc-200 p-4 sm:grid-cols-[170px_1fr_1fr] dark:border-zinc-800"><p className="text-xs font-medium text-zinc-950 dark:text-zinc-50">{testCase.name}</p><p className="text-[11px] leading-4 text-zinc-500">Input: {testCase.input}</p><p className="text-[11px] leading-4 text-zinc-700 dark:text-zinc-300">Expected: {testCase.expected}</p></div>)}</div></section>

    <section className="grid gap-5 sm:grid-cols-2"><div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Safeguards</p><ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{result.safeguards.slice(0, 6).map((item) => <li key={item}>• {item}</li>)}</ul></div><div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Fields worth storing</p><ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{result.observabilityFields.slice(0, 8).map((item) => <li key={item}>• {item}</li>)}</ul></div></section>

    <details className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800"><summary className="cursor-pointer text-sm font-medium text-zinc-950 dark:text-zinc-50">Routing health detail</summary><dl className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(result.metrics).map(([key, value]) => <div key={key} className="flex items-center justify-between border-t border-zinc-200 pt-3 text-xs dark:border-zinc-800"><dt className="capitalize text-zinc-600 dark:text-zinc-400">{key.replace(/([A-Z])/g, ' $1')}</dt><dd className="font-mono text-zinc-500">{value}/100</dd></div>)}</dl></details>
  </div>
}

export function LeadRoutingBuilder() {
  const [input, setInput] = useState<LeadRoutingInput>(DEFAULT_LEAD_ROUTING_INPUT)
  const [step, setStep] = useState<StepId>('context')
  const { rootRef, scrollToStart } = useToolStepNavigation()
  const index = STEPS.indexOf(step)
  const progress = step === 'result' ? 100 : Math.round(((index + 1) / 3) * 100)
  const canContinue = step !== 'context' || Boolean(input.crmId)
  const update = <K extends keyof LeadRoutingInput>(key: K, value: LeadRoutingInput[K]) => setInput((current) => ({ ...current, [key]: value }))
  const goTo = (nextStep: StepId) => { setStep(nextStep); scrollToStart() }
  const next = () => goTo(STEPS[Math.min(STEPS.length - 1, index + 1)])
  const back = () => goTo(STEPS[Math.max(0, index - 1)])
  const reset = () => { setInput(DEFAULT_LEAD_ROUTING_INPUT); goTo('context') }

  return <section ref={rootRef} className="mx-auto w-full max-w-5xl scroll-mt-24 sm:scroll-mt-28"><div className="mb-8 rounded-2xl bg-zinc-50 p-4 sm:p-5 dark:bg-zinc-900/55"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Build the routing logic before the automation.</p><p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500">About 3 minutes. The result gives you rule order, fallback behavior, test cases and the fields needed to explain every assignment.</p></div><button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"><RotateCcwIcon className="h-3.5 w-3.5" />Start over</button></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"><div className="h-full rounded-full bg-zinc-950 transition-[width] duration-500 dark:bg-zinc-50" style={{ width: `${progress}%` }} /></div><div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500"><span>{step === 'result' ? 'Routing plan complete' : `Step ${index + 1} of 3`}</span><span>{progress}%</span></div></div>
  <div className="min-h-[500px]">{step === 'context' ? <ContextStep input={input} update={update} /> : null}{step === 'logic' ? <LogicStep input={input} update={update} /> : null}{step === 'recovery' ? <RecoveryStep input={input} update={update} /> : null}{step === 'result' ? <Result input={input} onEdit={goTo} /> : null}</div>
  {step !== 'result' ? <div className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-5 dark:border-zinc-800"><button type="button" onClick={back} disabled={index === 0} className="inline-flex min-h-11 items-center gap-2 px-1 text-sm font-medium text-zinc-600 disabled:invisible dark:text-zinc-400"><ArrowLeftIcon className="h-4 w-4" />Back</button><button type="button" onClick={next} disabled={!canContinue} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-35 dark:bg-zinc-50 dark:text-zinc-950">{step === 'recovery' ? 'See routing plan' : 'Continue'}<ArrowRightIcon className="h-4 w-4" /></button></div> : <div className="mt-10 border-t border-zinc-200 pt-5 dark:border-zinc-800"><button type="button" onClick={() => goTo('context')} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"><ArrowLeftIcon className="h-4 w-4" />Edit inputs</button></div>}
  </section>
}
