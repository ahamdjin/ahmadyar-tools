'use client'

import { useMemo, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, RotateCcwIcon } from 'lucide-react'

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

type PageId = 'context' | 'cadence' | 'safety' | 'result'

const CRM_APPS = APP_CATALOG.filter((app) => app.category === 'crm')
const pages: PageId[] = ['context', 'cadence', 'safety', 'result']

function AppIcon({ app }: { app: AppDefinition }) {
  if (!app.icon) return <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">{app.name.slice(0, 2).toUpperCase()}</span>
  return <span aria-hidden="true" className="h-8 w-8 shrink-0 rounded-md bg-zinc-100 bg-[length:66%] bg-center bg-no-repeat dark:bg-zinc-900" style={{ backgroundImage: `url(https://cdn.simpleicons.org/${app.icon})` }} />
}

function Select({ value, onChange, children }: { value: string | number; onChange: (value: string) => void; children: React.ReactNode }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 min-w-0 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100">{children}</select>
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return <div className="grid min-w-0 gap-3 py-4 sm:grid-cols-[210px_minmax(0,1fr)] sm:gap-7"><div><p className="text-[15px] font-medium leading-6 text-zinc-950 dark:text-zinc-50">{label}</p>{helper ? <p className="mt-1 max-w-[220px] text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">{helper}</p> : null}</div><div className="min-w-0 self-center">{children}</div></div>
}

function LevelButtons({ value, onChange, labels }: { value: FollowUpLevel; onChange: (value: FollowUpLevel) => void; labels: [string, string, string, string] }) {
  return <div className="grid min-w-0 gap-2 sm:grid-cols-2">{labels.map((label, index) => <button key={label} type="button" onClick={() => onChange(index as FollowUpLevel)} className={`min-h-12 min-w-0 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${value === index ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}>{label}</button>)}</div>
}

function ContextForm({ input, update }: { input: LeadFollowUpInput; update: <K extends keyof LeadFollowUpInput>(key: K, value: LeadFollowUpInput[K]) => void }) {
  return <div className="min-w-0 space-y-5">
    <header><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Start with the operating reality.</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">How fast should a new lead become a real conversation?</h2><p className="mt-3 text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">The planner separates fast acknowledgement from useful follow-up. The goal is not maximum message volume; it is reliable ownership, timely response and clean exits when the lead engages.</p></header>
    <Field label="CRM / lead system" helper="The system that should own lead state, owner and outcome."><div className="grid min-w-0 gap-2 sm:grid-cols-2">{CRM_APPS.slice(0, 12).map((app) => <button key={app.id} type="button" onClick={() => update('crmId', app.id)} className={`flex min-h-14 min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-left ${input.crmId === app.id ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'}`}><AppIcon app={app} /><span className="min-w-0 flex-1 truncate text-sm font-medium">{app.name}</span>{input.crmId === app.id ? <CheckIcon className="h-4 w-4 shrink-0" /> : null}</button>)}</div></Field>
    <Field label="Inbound leads / month"><Select value={input.monthlyLeads} onChange={(value) => update('monthlyLeads', Number(value))}><option value={50}>Under 100</option><option value={250}>100–500</option><option value={1000}>500–2,000</option><option value={5000}>2,000–10,000</option><option value={20000}>10,000+</option></Select></Field>
    <Field label="People receiving leads"><Select value={input.reps} onChange={(value) => update('reps', Number(value))}><option value={1}>1 person</option><option value={3}>2–4 people</option><option value={8}>5–10 people</option><option value={20}>11–30 people</option><option value={50}>30+ people</option></Select></Field>
    <Field label="Target first response" helper="Use the target you genuinely intend to operate, not a marketing claim."><Select value={input.targetResponseMinutes} onChange={(value) => update('targetResponseMinutes', Number(value))}><option value={5}>5 minutes</option><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>1 hour</option><option value={240}>4 hours</option><option value={1440}>1 business day</option></Select></Field>
    <Field label="First response model"><Select value={input.firstResponseMode} onChange={(value) => update('firstResponseMode', value as FirstResponseMode)}><option value="human">Human first response</option><option value="hybrid">Automated acknowledgement + human owner</option><option value="automated">Automated first response</option></Select></Field>
    <Field label="After-hours behavior"><Select value={input.afterHours} onChange={(value) => update('afterHours', value as AfterHoursMode)}><option value="wait">Wait for the next contact window</option><option value="acknowledge">Acknowledge, then queue for owner</option><option value="on-call-priority">Priority leads can reach on-call</option><option value="always-on">Always-on eligible team</option></Select></Field>
  </div>
}

function CadenceForm({ input, update }: { input: LeadFollowUpInput; update: <K extends keyof LeadFollowUpInput>(key: K, value: LeadFollowUpInput[K]) => void }) {
  const toggleChannel = (channel: FollowUpChannel) => update('channels', input.channels.includes(channel) ? input.channels.filter((item) => item !== channel) : [...input.channels, channel])
  return <div className="min-w-0 space-y-5">
    <header><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Now shape the cadence.</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">How should follow-up change when the lead does nothing?</h2><p className="mt-3 text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">A cadence should change the reason to respond and mix human judgment with automation. Repeating the same generic message seven times is not a strategy.</p></header>
    <Field label="Channels" helper="Only select channels you can operate with appropriate eligibility, sender setup and response handling."><div className="grid min-w-0 gap-2 sm:grid-cols-2">{(['email','sms','call','whatsapp'] as FollowUpChannel[]).map((channel) => <button key={channel} type="button" onClick={() => toggleChannel(channel)} className={`min-h-12 min-w-0 rounded-lg px-3 text-left text-sm font-medium capitalize ${input.channels.includes(channel) ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'}`}>{channel === 'sms' ? 'SMS' : channel === 'whatsapp' ? 'WhatsApp' : channel}</button>)}</div></Field>
    <Field label="Cadence style"><Select value={input.cadenceStyle} onChange={(value) => update('cadenceStyle', value as CadenceStyle)}><option value="light">Light — fewer, spaced touches</option><option value="balanced">Balanced — active early, then spaced</option><option value="fast">Fast — concentrated first 48 hours</option></Select></Field>
    <Field label="Active cadence length"><Select value={input.cadenceDays} onChange={(value) => update('cadenceDays', Number(value))}><option value={3}>3 days</option><option value={7}>7 days</option><option value={10}>10 days</option><option value={14}>14 days</option><option value={21}>21 days</option><option value={30}>30 days</option></Select></Field>
    <Field label="Planned touches"><Select value={input.plannedTouches} onChange={(value) => update('plannedTouches', Number(value))}><option value={3}>3 touches</option><option value={5}>5 touches</option><option value={7}>7 touches</option><option value={9}>9 touches</option><option value={12}>12 touches</option><option value={15}>15+ touches</option></Select></Field>
    <Field label="Personalization / context"><LevelButtons value={input.personalization} onChange={(value) => update('personalization', value)} labels={['Generic message','Basic name/source','Segment + lead context','Context changes message/next action']} /></Field>
    <Field label="Re-entry policy" helper="A repeated form submit should not automatically mean a second simultaneous cadence."><Select value={input.reentryPolicy} onChange={(value) => update('reentryPolicy', value as ReentryPolicy)}><option value="never">Never automatically re-enter</option><option value="new-opportunity">Only for a genuine new opportunity</option><option value="cooldown">Allow after a defined cooldown</option><option value="manual">Manual re-entry only</option></Select></Field>
  </div>
}

function SafetyForm({ input, update }: { input: LeadFollowUpInput; update: <K extends keyof LeadFollowUpInput>(key: K, value: LeadFollowUpInput[K]) => void }) {
  return <div className="min-w-0 space-y-5">
    <header><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">The important part is knowing when to stop.</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">Can the system tell engagement from silence?</h2><p className="mt-3 text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">These controls prevent the classic failure: a lead replies, books or becomes a customer while the old automation keeps talking at them.</p></header>
    <Field label="Reply detection"><LevelButtons value={input.replyDetection} onChange={(value) => update('replyDetection', value)} labels={['No reliable stop','Some channels stop','Replies stop active cadence','Cross-channel reply + owner handoff']} /></Field>
    <Field label="Booking detection"><LevelButtons value={input.bookingDetection} onChange={(value) => update('bookingDetection', value)} labels={['No booking stop','Manual cleanup','Booking stops cadence','Booking changes lifecycle + next flow']} /></Field>
    <Field label="Lifecycle stop rules"><LevelButtons value={input.lifecycleStopRules} onChange={(value) => update('lifecycleStopRules', value)} labels={['Sequence runs regardless','A few manual exclusions','CRM states stop/switch cadence','State checked before every touch']} /></Field>
    <Field label="Consent / channel eligibility"><LevelButtons value={input.consentControl} onChange={(value) => update('consentControl', value)} labels={['Not tracked','Assumed / inconsistent','Stored eligibility checked','Channel-specific eligibility + audit trail']} /></Field>
    <Field label="Opt-out / suppression"><LevelButtons value={input.optOutControl} onChange={(value) => update('optOutControl', value)} labels={['Not centralized','Workflow-specific only','Central suppression used','Immediate global stop + auditable reason']} /></Field>
    <Field label="Timezone / contact windows"><LevelButtons value={input.timezoneControl} onChange={(value) => update('timezoneControl', value)} labels={['Ignored','Account timezone only','Lead timezone when known','Timezone + safe fallback window']} /></Field>
    <Field label="Duplicate enrollment"><LevelButtons value={input.duplicateControl} onChange={(value) => update('duplicateControl', value)} labels={['Can duplicate','Cleanup later','Dedupe before enrollment','Idempotent enrollment + opportunity key']} /></Field>
    <Field label="Owner assignment"><LevelButtons value={input.ownerAssignment} onChange={(value) => update('ownerAssignment', value)} labels={['Can be unowned','Manual assignment','Owner before/with first touch','Owner + fallback + SLA']} /></Field>
    <Field label="Human handoff"><LevelButtons value={input.humanHandoff} onChange={(value) => update('humanHandoff', value)} labels={['No explicit handoff','Rep notices manually','Reply creates owner task/alert','Conversation context + automation stops']} /></Field>
    <Field label="Stale lead outcome"><LevelButtons value={input.staleLeadHandling} onChange={(value) => update('staleLeadHandling', value)} labels={['No final state','Old leads remain active','Cadence ends with outcome','Recycle/nurture/cooldown is explicit']} /></Field>
    <Field label="Monitoring"><LevelButtons value={input.monitoring} onChange={(value) => update('monitoring', value)} labels={['No monitoring','Spot checks','Coverage + reply/booking dashboard','Failure alerts + weekly quality review']} /></Field>
  </div>
}

function Result({ input }: { input: LeadFollowUpInput }) {
  const result = useMemo(() => analyzeLeadFollowUp(input), [input])
  return <div className="min-w-0 space-y-12 pb-8">
    <header><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Follow-up system · {result.score}/100 · {result.confidence}% confidence</p><h2 className="mt-3 text-3xl font-medium tracking-[-0.045em] text-zinc-950 sm:text-4xl dark:text-zinc-50">{result.status}</h2><p className="mt-4 text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">{result.summary}</p><p className="mt-5 text-sm font-medium leading-6 text-zinc-950 dark:text-zinc-50">Recommended pattern: {result.recommendedPattern}</p></header>

    <section><h3 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">Follow-up state model</h3><div className="mt-5 space-y-3">{result.stages.map((stage) => <article key={stage.order} className="min-w-0 rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-900"><div className="flex min-w-0 flex-wrap items-start justify-between gap-4"><div className="min-w-0"><p className="font-mono text-[10px] text-zinc-500">{String(stage.order).padStart(2,'0')} · {stage.timing}</p><h4 className="mt-2 text-sm font-medium text-zinc-950 dark:text-zinc-50">{stage.label}</h4></div><span className="text-right text-xs text-zinc-500">{stage.owner}</span></div><p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{stage.action}</p><p className="mt-2 text-xs leading-5 text-zinc-500">Exit: {stage.exit}</p></article>)}</div></section>

    {result.issues.length ? <section><h3 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">Risks to fix first</h3><div className="mt-5 space-y-3">{result.issues.slice(0,6).map((issue) => <article key={issue.id} className="min-w-0 rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-900"><p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">{issue.severity}</p><h4 className="mt-2 text-sm font-medium text-zinc-950 dark:text-zinc-50">{issue.title}</h4><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{issue.impact}</p><p className="mt-3 text-sm font-medium leading-6 text-zinc-950 dark:text-zinc-50">Fix: {issue.fix}</p></article>)}</div></section> : null}

    <section className="grid min-w-0 gap-7 sm:grid-cols-2"><div className="min-w-0"><h3 className="text-base font-medium text-zinc-950 dark:text-zinc-50">Hard stop rules</h3><div className="mt-4 space-y-3">{result.stopRules.map((item) => <p key={item} className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">• {item}</p>)}</div></div><div className="min-w-0"><h3 className="text-base font-medium text-zinc-950 dark:text-zinc-50">Safeguards</h3><div className="mt-4 space-y-3">{result.safeguards.map((item) => <p key={item} className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">• {item}</p>)}</div></div></section>

    <section><h3 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">Architecture</h3><div className="mt-4 space-y-3">{result.architecture.map((item) => <p key={item} className="rounded-xl bg-zinc-100 px-4 py-3 text-sm leading-6 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">{item}</p>)}</div></section>

    <section><h3 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">Pre-launch tests</h3><div className="mt-5 space-y-4">{result.testCases.map((testCase) => <div key={testCase.name}><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{testCase.name}</p><p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{testCase.scenario}</p><p className="mt-1 text-xs leading-5 text-zinc-500">Expected: {testCase.expected}</p></div>)}</div></section>

    <section><h3 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">Measure the system</h3><div className="mt-4 flex min-w-0 flex-wrap gap-2">{result.measurement.map((metric) => <span key={metric} className="max-w-full break-words rounded-md bg-zinc-100 px-2.5 py-1.5 font-mono text-[10px] text-zinc-600 [overflow-wrap:anywhere] dark:bg-zinc-900 dark:text-zinc-400">{metric}</span>)}</div></section>

    {result.nextQuestions.length ? <section><h3 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">Questions still worth answering</h3><div className="mt-4 space-y-3">{result.nextQuestions.map((question) => <p key={question} className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">→ {question}</p>)}</div></section> : null}
  </div>
}

export function LeadFollowUpPlanner() {
  const [input, setInput] = useState<LeadFollowUpInput>(DEFAULT_LEAD_FOLLOW_UP_INPUT)
  const [page, setPage] = useState<PageId>('context')
  const pageIndex = pages.indexOf(page)
  const progress = ((pageIndex + 1) / pages.length) * 100
  const update = <K extends keyof LeadFollowUpInput>(key: K, value: LeadFollowUpInput[K]) => setInput((current) => ({ ...current, [key]: value }))

  const previous = () => setPage(pages[Math.max(0, pageIndex - 1)] ?? 'context')
  const next = () => setPage(pages[Math.min(pages.length - 1, pageIndex + 1)] ?? 'result')
  const reset = () => { setInput(DEFAULT_LEAD_FOLLOW_UP_INPUT); setPage('context') }

  return <div className="followup-check grid h-full min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
    <div className="h-0.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900"><div className="h-full bg-zinc-950 transition-[width] duration-300 dark:bg-zinc-50" style={{ width: `${progress}%` }} /></div>
    <div className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto py-6 pr-1 sm:py-8">{page === 'context' ? <ContextForm input={input} update={update} /> : page === 'cadence' ? <CadenceForm input={input} update={update} /> : page === 'safety' ? <SafetyForm input={input} update={update} /> : <Result input={input} />}</div>
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-3"><button type="button" onClick={page === 'context' ? reset : previous} className="inline-flex min-h-10 items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-950 dark:hover:text-zinc-50">{page === 'context' ? <><RotateCcwIcon className="h-4 w-4" />Reset</> : <><ArrowLeftIcon className="h-4 w-4" />Back</>}</button>{page !== 'result' ? <button type="button" onClick={next} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950">{page === 'safety' ? 'Build follow-up plan' : 'Continue'}<ArrowRightIcon className="h-4 w-4" /></button> : <button type="button" onClick={reset} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950"><RotateCcwIcon className="h-4 w-4" />Run another</button>}</div>
  </div>
}
