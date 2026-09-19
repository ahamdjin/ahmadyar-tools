'use client'

import { useMemo, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, RotateCcwIcon } from 'lucide-react'

import { ToolResultActions } from '@/components/tool-result-actions'
import { useToolStepNavigation } from '@/components/use-tool-step-navigation'
import { APP_CATALOG, type AppDefinition } from '@/engine/apps'
import {
  analyzeLeadFollowUp,
  DEFAULT_LEAD_FOLLOW_UP_INPUT,
  type AfterHoursMode,
  type CadenceStyle,
  type FirstResponseMode,
  type FollowUpChannel,
  type FollowUpLevel,
  type LeadFollowUpInput,
  type ReentryPolicy,
} from '@/engine/lead-follow-up'

type StepId = 'response' | 'cadence' | 'stops' | 'result'
const STEPS: StepId[] = ['response', 'cadence', 'stops', 'result']
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

function Level({ value, onChange, labels }: { value: FollowUpLevel; onChange: (value: FollowUpLevel) => void; labels: readonly [string, string, string, string] }) {
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{labels.map((label, index) => <button key={label} type="button" onClick={() => onChange(index as FollowUpLevel)} className={`min-h-14 rounded-xl px-2.5 py-2 text-left text-xs leading-4 transition-colors ${value === index ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:bg-zinc-900'}`}><span className="block font-mono text-[9px] opacity-60">{index}</span><span className="mt-1 block font-medium">{label}</span></button>)}</div>
}

function StepIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <header className="max-w-2xl"><p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">{eyebrow}</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">{title}</h2><p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">{body}</p></header>
}

function ResponseStep({ input, update }: { input: LeadFollowUpInput; update: <K extends keyof LeadFollowUpInput>(key: K, value: LeadFollowUpInput[K]) => void }) {
  return <div className="space-y-8">
    <StepIntro eyebrow="1 · Response" title="Make ownership and response time visible before adding a cadence." body="The common failure is not a lack of messages. It is a lead entering the CRM without one accountable owner, one response target and a clear after-hours path." />
    <section><p className="text-xs font-medium text-zinc-500">CRM / lead source of truth</p><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{CRM_APPS.map((app) => { const active = input.crmId === app.id; return <button key={app.id} type="button" onClick={() => update('crmId', app.id)} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${active ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950' : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-900'}`}><AppIcon app={app} /><span className="min-w-0 truncate text-sm font-medium">{app.name}</span>{active ? <CheckIcon className="ml-auto h-3.5 w-3.5" /> : null}</button> })}</div></section>
    <section className="border-y border-zinc-200 dark:border-zinc-800">
      <Field label="Inbound leads / month"><Select value={input.monthlyLeads} onChange={(value) => update('monthlyLeads', Number(value))}><option value={50}>Under 100</option><option value={250}>100–500</option><option value={1000}>500–2,000</option><option value={5000}>2,000–10,000</option><option value={20000}>10,000+</option></Select></Field>
      <Field label="People receiving leads"><Select value={input.reps} onChange={(value) => update('reps', Number(value))}><option value={1}>1 person</option><option value={3}>2–4 people</option><option value={8}>5–10 people</option><option value={20}>11–30 people</option><option value={50}>30+</option></Select></Field>
      <Field label="Target first response" helper="Use the operating target you can actually staff, not a generic internet benchmark."><Select value={input.targetResponseMinutes} onChange={(value) => update('targetResponseMinutes', Number(value))}><option value={5}>5 minutes</option><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>1 hour</option><option value={240}>4 hours</option><option value={1440}>1 business day</option></Select></Field>
      <Field label="First response model"><Select value={input.firstResponseMode} onChange={(value) => update('firstResponseMode', value as FirstResponseMode)}><option value="human">Human first response</option><option value="hybrid">Brief acknowledgement + human owner</option><option value="automated">Automated first response</option></Select></Field>
      <Field label="After hours"><Select value={input.afterHours} onChange={(value) => update('afterHours', value as AfterHoursMode)}><option value="wait">Wait for next contact window</option><option value="acknowledge">Acknowledge + queue for owner</option><option value="on-call-priority">Priority leads reach on-call</option><option value="always-on">Always-on eligible team</option></Select></Field>
      <Field label="Owner assignment"><Level value={input.ownerAssignment} onChange={(value) => update('ownerAssignment', value)} labels={['Can be unowned','Manual assignment','Owner before first touch','Owner + fallback + SLA']} /></Field>
    </section>
  </div>
}

function CadenceStep({ input, update }: { input: LeadFollowUpInput; update: <K extends keyof LeadFollowUpInput>(key: K, value: LeadFollowUpInput[K]) => void }) {
  const toggleChannel = (channel: FollowUpChannel) => update('channels', input.channels.includes(channel) ? input.channels.filter((item) => item !== channel) : [...input.channels, channel])
  return <div className="space-y-8">
    <StepIntro eyebrow="2 · Cadence" title="Change the reason to respond, not just the wording." body="A good follow-up plan starts active, then becomes more selective. The cadence should create a useful next action for the owner, not turn every lead into an endless generic drip." />
    <section className="border-y border-zinc-200 dark:border-zinc-800">
      <Field label="Channels" helper="Only select channels you can operate safely with the right eligibility, sender setup and response handling."><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(['email','sms','call','whatsapp'] as FollowUpChannel[]).map((channel) => <button key={channel} type="button" onClick={() => toggleChannel(channel)} className={`min-h-11 rounded-xl px-3 text-left text-xs font-medium capitalize ${input.channels.includes(channel) ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950' : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400'}`}>{channel === 'sms' ? 'SMS' : channel === 'whatsapp' ? 'WhatsApp' : channel}</button>)}</div></Field>
      <Field label="Cadence style"><Select value={input.cadenceStyle} onChange={(value) => update('cadenceStyle', value as CadenceStyle)}><option value="light">Light — fewer, spaced touches</option><option value="balanced">Balanced — active early, then spaced</option><option value="fast">Fast — concentrated first 48 hours</option></Select></Field>
      <Field label="Length + planned touches"><div className="grid gap-2 sm:grid-cols-2"><Select value={input.cadenceDays} onChange={(value) => update('cadenceDays', Number(value))}><option value={3}>3 days</option><option value={7}>7 days</option><option value={10}>10 days</option><option value={14}>14 days</option><option value={21}>21 days</option><option value={30}>30 days</option></Select><Select value={input.plannedTouches} onChange={(value) => update('plannedTouches', Number(value))}><option value={3}>3 touches</option><option value={5}>5 touches</option><option value={7}>7 touches</option><option value={9}>9 touches</option><option value={12}>12 touches</option><option value={15}>15+ touches</option></Select></div></Field>
      <Field label="Personalization"><Level value={input.personalization} onChange={(value) => update('personalization', value)} labels={['Generic','Name / source','Segment + context','Context changes next action']} /></Field>
      <Field label="Re-entry policy" helper="A repeated form submission should not create a second simultaneous cadence."><Select value={input.reentryPolicy} onChange={(value) => update('reentryPolicy', value as ReentryPolicy)}><option value="never">Never automatically re-enter</option><option value="new-opportunity">Only for a genuine new opportunity</option><option value="cooldown">Allow after a defined cooldown</option><option value="manual">Manual re-entry only</option></Select></Field>
    </section>
  </div>
}

function StopsStep({ input, update }: { input: LeadFollowUpInput; update: <K extends keyof LeadFollowUpInput>(key: K, value: LeadFollowUpInput[K]) => void }) {
  return <div className="space-y-8">
    <StepIntro eyebrow="3 · Stop + handoff" title="A follow-up system is defined by its exits." body="Every scheduled touch should ask whether the lead has replied, booked, opted out, changed lifecycle state or been taken over by a person. If the answer changed, the cadence must change too." />
    <section className="border-y border-zinc-200 dark:border-zinc-800">
      <Field label="Reply detection"><Level value={input.replyDetection} onChange={(value) => update('replyDetection', value)} labels={['No reliable stop','Some channels stop','Reply stops cadence','Cross-channel stop + handoff']} /></Field>
      <Field label="Booking detection"><Level value={input.bookingDetection} onChange={(value) => update('bookingDetection', value)} labels={['No booking stop','Manual cleanup','Booking stops cadence','Booking changes next flow']} /></Field>
      <Field label="Lifecycle stop rules"><Level value={input.lifecycleStopRules} onChange={(value) => update('lifecycleStopRules', value)} labels={['Runs regardless','Some exclusions','CRM states stop / switch','State checked before touch']} /></Field>
      <Field label="Consent / channel eligibility"><Level value={input.consentControl} onChange={(value) => update('consentControl', value)} labels={['Not tracked','Assumed / inconsistent','Eligibility checked','Channel-specific + audited']} /></Field>
      <Field label="Opt-out / suppression"><Level value={input.optOutControl} onChange={(value) => update('optOutControl', value)} labels={['Not centralized','Workflow-only','Central suppression','Immediate global stop']} /></Field>
      <Field label="Timezone / contact windows"><Level value={input.timezoneControl} onChange={(value) => update('timezoneControl', value)} labels={['Ignored','Account timezone','Lead timezone','Timezone + safe fallback']} /></Field>
      <Field label="Duplicate enrollment"><Level value={input.duplicateControl} onChange={(value) => update('duplicateControl', value)} labels={['Can duplicate','Cleanup later','Dedupe first','Idempotent + opportunity key']} /></Field>
      <Field label="Human handoff"><Level value={input.humanHandoff} onChange={(value) => update('humanHandoff', value)} labels={['No explicit handoff','Rep notices','Owner task / alert','Context + automation stops']} /></Field>
      <Field label="Stale lead outcome"><Level value={input.staleLeadHandling} onChange={(value) => update('staleLeadHandling', value)} labels={['No final state','Old leads stay active','Cadence ends with outcome','Nurture / recycle explicit']} /></Field>
      <Field label="Monitoring"><Level value={input.monitoring} onChange={(value) => update('monitoring', value)} labels={['None','Spot checks','Coverage dashboard','Failure alerts + review']} /></Field>
    </section>
  </div>
}

function Result({ input, onEdit }: { input: LeadFollowUpInput; onEdit: (step: StepId) => void }) {
  const result = useMemo(() => analyzeLeadFollowUp(input), [input])
  const topIssues = result.issues.slice(0, 3)
  return <div className="space-y-10 pb-8">
    <section className="rounded-[24px] bg-zinc-950 p-6 text-white sm:p-8 dark:bg-zinc-100 dark:text-zinc-950"><div className="flex flex-wrap items-start justify-between gap-6"><div className="max-w-2xl"><p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-400 dark:text-zinc-600">Follow-up recommendation</p><h2 className="mt-2 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">{result.status}</h2><p className="mt-3 text-sm font-medium text-zinc-200 dark:text-zinc-800">{result.recommendedPattern}</p><p className="mt-4 text-sm leading-7 text-zinc-300 dark:text-zinc-700">{result.summary}</p></div><div className="text-right"><p className="font-mono text-2xl font-medium">{result.score}/100</p><p className="text-xs text-zinc-400 dark:text-zinc-600">confidence {result.confidence}%</p></div></div><div className="mt-6"><ToolResultActions title={`Lead follow-up: ${result.status}`} summary={result.summary} details={result.stages.map((stage) => `${stage.order}. ${stage.label}: ${stage.action}`)} /></div></section>

    {topIssues.length ? <section><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Fix first</p><h3 className="mt-2 text-xl font-medium tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">Protect the exits before adding more touches.</h3></div><button type="button" onClick={() => onEdit('stops')} className="text-xs font-medium text-zinc-500 underline decoration-zinc-300 underline-offset-4">Edit stop rules</button></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{topIssues.map((issue) => <div key={issue.id} className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55"><p className="font-mono text-[10px] uppercase text-zinc-500">{issue.severity}</p><h4 className="mt-2 text-sm font-medium text-zinc-950 dark:text-zinc-50">{issue.title}</h4><p className="mt-2 text-xs leading-5 text-zinc-500">{issue.impact}</p><p className="mt-3 text-xs leading-5 text-zinc-700 dark:text-zinc-300"><span className="font-medium">Fix:</span> {issue.fix}</p></div>)}</div></section> : null}

    <section><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">State model</p><h3 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">Every stage has an exit.</h3><div className="mt-4 border-y border-zinc-200 dark:border-zinc-800">{result.stages.map((stage, index) => <div key={stage.order} className={`grid gap-2 py-4 sm:grid-cols-[36px_150px_1fr] ${index ? 'border-t border-zinc-200 dark:border-zinc-800' : ''}`}><span className="font-mono text-[10px] text-zinc-500">{String(stage.order).padStart(2, '0')}</span><div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{stage.label}</p><p className="mt-1 text-[11px] text-zinc-500">{stage.timing} · {stage.owner}</p></div><div><p className="text-xs leading-5 text-zinc-700 dark:text-zinc-300">{stage.action}</p><p className="mt-1 text-[11px] leading-4 text-zinc-500">Exit: {stage.exit}</p></div></div>)}</div></section>

    <section className="grid gap-5 sm:grid-cols-2"><div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Hard stop rules</p><ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{result.stopRules.map((rule) => <li key={rule}>• {rule}</li>)}</ul></div><div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Safeguards</p><ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{result.safeguards.slice(0, 6).map((rule) => <li key={rule}>• {rule}</li>)}</ul></div></section>

    <section><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Pre-launch tests</p><div className="mt-4 space-y-2">{result.testCases.slice(0, 8).map((test) => <div key={test.name} className="grid gap-2 rounded-xl border border-zinc-200 p-4 sm:grid-cols-[170px_1fr_1fr] dark:border-zinc-800"><p className="text-xs font-medium text-zinc-950 dark:text-zinc-50">{test.name}</p><p className="text-[11px] leading-4 text-zinc-500">Scenario: {test.scenario}</p><p className="text-[11px] leading-4 text-zinc-700 dark:text-zinc-300">Expected: {test.expected}</p></div>)}</div></section>

    <section className="grid gap-5 sm:grid-cols-2"><div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Measure this</p><ul className="mt-3 grid gap-2 text-xs text-zinc-600 dark:text-zinc-400">{result.measurement.map((item) => <li key={item} className="font-mono text-[10px]">{item}</li>)}</ul></div><div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Architecture notes</p><ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{result.architecture.map((item) => <li key={item}>• {item}</li>)}</ul></div></section>

    <details className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800"><summary className="cursor-pointer text-sm font-medium text-zinc-950 dark:text-zinc-50">Follow-up health detail</summary><dl className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(result.metrics).map(([key, value]) => <div key={key} className="flex items-center justify-between border-t border-zinc-200 pt-3 text-xs dark:border-zinc-800"><dt className="capitalize text-zinc-600 dark:text-zinc-400">{key.replace(/([A-Z])/g, ' $1')}</dt><dd className="font-mono text-zinc-500">{value}/100</dd></div>)}</dl></details>
  </div>
}

export function LeadFollowUpPlanner() {
  const [input, setInput] = useState<LeadFollowUpInput>(DEFAULT_LEAD_FOLLOW_UP_INPUT)
  const [step, setStep] = useState<StepId>('response')
  const { rootRef, scrollToStart } = useToolStepNavigation()
  const index = STEPS.indexOf(step)
  const progress = step === 'result' ? 100 : Math.round(((index + 1) / 3) * 100)
  const canContinue = step !== 'response' || Boolean(input.crmId)
  const update = <K extends keyof LeadFollowUpInput>(key: K, value: LeadFollowUpInput[K]) => setInput((current) => ({ ...current, [key]: value }))
  const goTo = (nextStep: StepId) => { setStep(nextStep); scrollToStart() }
  const next = () => goTo(STEPS[Math.min(STEPS.length - 1, index + 1)])
  const back = () => goTo(STEPS[Math.max(0, index - 1)])
  const reset = () => { setInput(DEFAULT_LEAD_FOLLOW_UP_INPUT); goTo('response') }

  return <section ref={rootRef} className="mx-auto w-full max-w-5xl scroll-mt-24 sm:scroll-mt-28"><div className="mb-8 rounded-2xl bg-zinc-50 p-4 sm:p-5 dark:bg-zinc-900/55"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Design a state machine, not a drip sequence.</p><p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500">About 3 minutes. The result gives you response ownership, cadence states, hard stop rules, safety checks, measurement and pre-launch tests.</p></div><button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"><RotateCcwIcon className="h-3.5 w-3.5" />Start over</button></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"><div className="h-full rounded-full bg-zinc-950 transition-[width] duration-500 dark:bg-zinc-50" style={{ width: `${progress}%` }} /></div><div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500"><span>{step === 'result' ? 'Follow-up plan complete' : `Step ${index + 1} of 3`}</span><span>{progress}%</span></div></div>
  <div className="min-h-[500px]">{step === 'response' ? <ResponseStep input={input} update={update} /> : null}{step === 'cadence' ? <CadenceStep input={input} update={update} /> : null}{step === 'stops' ? <StopsStep input={input} update={update} /> : null}{step === 'result' ? <Result input={input} onEdit={goTo} /> : null}</div>
  {step !== 'result' ? <div className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-5 dark:border-zinc-800"><button type="button" onClick={back} disabled={index === 0} className="inline-flex min-h-11 items-center gap-2 px-1 text-sm font-medium text-zinc-600 disabled:invisible dark:text-zinc-400"><ArrowLeftIcon className="h-4 w-4" />Back</button><button type="button" onClick={next} disabled={!canContinue} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-35 dark:bg-zinc-50 dark:text-zinc-950">{step === 'stops' ? 'See follow-up plan' : 'Continue'}<ArrowRightIcon className="h-4 w-4" /></button></div> : <div className="mt-10 border-t border-zinc-200 pt-5 dark:border-zinc-800"><button type="button" onClick={() => goTo('response')} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"><ArrowLeftIcon className="h-4 w-4" />Edit inputs</button></div>}
  </section>
}
