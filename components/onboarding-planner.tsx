'use client'

import { useMemo, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, RotateCcwIcon } from 'lucide-react'

import { ToolResultActions } from '@/components/tool-result-actions'
import { useToolStepNavigation } from '@/components/use-tool-step-navigation'
import { APP_BY_ID, APP_CATALOG, type AppCategory, type AppDefinition } from '@/engine/apps'
import {
  analyzeOnboarding,
  DEFAULT_ONBOARDING_INPUT,
  type AccessComplexity,
  type OnboardingInput,
  type OnboardingLevel,
  type OnboardingOwner,
  type TriggerMode,
} from '@/engine/onboarding'

type StepId = 'commercial' | 'readiness' | 'delivery' | 'result'
const STEPS: StepId[] = ['commercial', 'readiness', 'delivery', 'result']

type Role = {
  key: keyof Pick<OnboardingInput, 'crmId' | 'contractAppId' | 'billingAppId' | 'projectAppId' | 'intakeAppId' | 'communicationAppId' | 'fileAppId'>
  label: string
  categories: AppCategory[]
  required?: boolean
}

const ROLES: Role[] = [
  { key: 'crmId', label: 'CRM / commercial source of truth', categories: ['crm'], required: true },
  { key: 'contractAppId', label: 'Contract / signature', categories: ['documents'] },
  { key: 'billingAppId', label: 'Payment / billing', categories: ['finance', 'commerce'] },
  { key: 'projectAppId', label: 'Delivery workspace', categories: ['project'] },
  { key: 'intakeAppId', label: 'Client intake', categories: ['forms', 'project', 'crm'] },
  { key: 'communicationAppId', label: 'Client communication', categories: ['communication', 'crm'] },
  { key: 'fileAppId', label: 'Files / assets', categories: ['documents', 'project'] },
]

const LEVELS: Record<string, readonly [string, string, string, string]> = {
  repeatability: ['Different every time','Some common steps','Mostly repeatable','Standardized + governed'],
  handoff: ['Lives in calls / chat','Some fields transfer','Required handoff payload','Validated before start'],
  intake: ['Email / chat','One basic form','Structured by service','Adaptive + validated'],
  access: ['No tracking','Checklist only','Owned + reminders','Verified before ready'],
  welcome: ['Manual each time','Template message','Triggered + personalized','State-aware'],
  reminders: ['Manual chasing','Basic reminders','Missing-item reminders','Age / risk escalation'],
  gate: ['No ready state','People know it','Explicit checklist','System-enforced'],
  template: ['Built from scratch','Copy old project','Service templates','Governed templates'],
  kickoff: ['Booked ad hoc','Scheduling link','After prerequisites','Readiness-aware'],
  owner: ['No clear owner','Informal owner','Assigned owner','Owner + backup + SLA'],
  duplicate: ['Not considered','Manual recovery','Stable key / duplicate check','Idempotent + resumable'],
  exceptions: ['Handled in chat','Manual exception list','Visible queue','Resumable workflow'],
  monitoring: ['People report failures','Logs checked sometimes','Critical alerts','Alerts + reconciliation'],
}

function Select({ value, onChange, children }: { value: string | number; onChange: (value: string) => void; children: React.ReactNode }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100">{children}</select>
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return <div className="grid gap-3 border-b border-zinc-200 py-4 last:border-b-0 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-7 dark:border-zinc-800"><div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{label}</p>{helper ? <p className="mt-1 text-xs leading-5 text-zinc-500">{helper}</p> : null}</div><div className="min-w-0 self-center">{children}</div></div>
}

function Level({ value, onChange, labels }: { value: OnboardingLevel; onChange: (value: OnboardingLevel) => void; labels: readonly [string, string, string, string] }) {
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{labels.map((label, index) => <button key={label} type="button" onClick={() => onChange(index as OnboardingLevel)} className={`min-h-14 rounded-xl px-2.5 py-2 text-left text-xs leading-4 transition-colors ${value === index ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:bg-zinc-900'}`}><span className="block font-mono text-[9px] opacity-60">{index}</span><span className="mt-1 block font-medium">{label}</span></button>)}</div>
}

function StepIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <header className="max-w-2xl"><p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">{eyebrow}</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">{title}</h2><p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">{body}</p></header>
}

function AppIcon({ app }: { app: AppDefinition }) {
  if (!app.icon) return <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[9px] font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">{app.name.slice(0, 2).toUpperCase()}</span>
  return <span aria-hidden="true" className="h-7 w-7 shrink-0 rounded-md bg-zinc-100 bg-[length:66%] bg-center bg-no-repeat dark:bg-zinc-900" style={{ backgroundImage: `url(https://cdn.simpleicons.org/${app.icon})` }} />
}

function SystemSelect({ role, value, onChange }: { role: Role; value: string | null; onChange: (value: string | null) => void }) {
  const apps = APP_CATALOG.filter((app) => role.categories.includes(app.category)).sort((a, b) => b.nativeAutomation - a.nativeAutomation || a.name.localeCompare(b.name))
  const selected = value ? APP_BY_ID.get(value) : null
  return <div className="flex min-w-0 items-center gap-3">{selected ? <AppIcon app={selected} /> : <span className="h-7 w-7 shrink-0 rounded-md bg-zinc-100 dark:bg-zinc-900" />}<Select value={value ?? ''} onChange={(next) => onChange(next || null)}><option value="">{role.required ? 'Choose a system' : 'Not used / not needed'}</option>{apps.map((app) => <option key={app.id} value={app.id}>{app.name}</option>)}</Select></div>
}

function CommercialStep({ input, update }: { input: OnboardingInput; update: <K extends keyof OnboardingInput>(key: K, value: OnboardingInput[K]) => void }) {
  const commercialRoles = ROLES.slice(0, 3)
  return <div className="space-y-8">
    <StepIntro eyebrow="1 · Commercial handoff" title="Define when a sold client is actually allowed to start onboarding." body="A deal being won, a contract being signed and a payment landing are different events. Pick the authoritative start condition so delivery never starts early, late or twice." />
    <section className="border-y border-zinc-200 dark:border-zinc-800">{commercialRoles.map((role) => <Field key={role.key} label={role.label}><SystemSelect role={role} value={input[role.key]} onChange={(value) => update(role.key, value)} /></Field>)}</section>
    <section className="border-y border-zinc-200 dark:border-zinc-800">
      <Field label="Canonical onboarding trigger"><Select value={input.triggerMode} onChange={(value) => update('triggerMode', value as TriggerMode)}><option value="deal-won">Deal marked won</option><option value="contract-signed">Contract signed</option><option value="payment-received">Payment received</option><option value="compound">Several conditions must be true</option><option value="manual">Manual approval</option></Select></Field>
      {input.triggerMode === 'compound' ? <Field label="Required commercial gates" helper="Choose the prerequisites that must all be true."><div className="grid gap-2 sm:grid-cols-3">{([['requireWon','Deal won'],['requireSigned','Signed'],['requirePaid','Paid']] as const).map(([key, label]) => <button key={key} type="button" onClick={() => update(key, !input[key])} className={`min-h-11 rounded-xl px-3 text-xs font-medium ${input[key] ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950' : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400'}`}>{label}</button>)}</div></Field> : null}
      <Field label="Clients / month"><Select value={input.monthlyClients} onChange={(value) => update('monthlyClients', Number(value))}><option value={5}>Under 10</option><option value={15}>10–25</option><option value={40}>25–60</option><option value={100}>60–150</option><option value={250}>150+</option></Select></Field>
      <Field label="Service variants" helper="How many materially different onboarding paths exist?"><Select value={input.serviceVariants} onChange={(value) => update('serviceVariants', Number(value))}><option value={1}>1 standard service</option><option value={3}>2–4 variants</option><option value={6}>5–8 variants</option><option value={12}>9–15 variants</option><option value={20}>15+</option></Select></Field>
      <Field label="Accountable onboarding owner"><Select value={input.owner} onChange={(value) => update('owner', value as OnboardingOwner)}><option value="operations">Operations</option><option value="account-management">Account management</option><option value="delivery">Delivery</option><option value="sales">Sales</option><option value="shared">Shared / unclear</option></Select></Field>
    </section>
  </div>
}

function ReadinessStep({ input, update }: { input: OnboardingInput; update: <K extends keyof OnboardingInput>(key: K, value: OnboardingInput[K]) => void }) {
  return <div className="space-y-8">
    <StepIntro eyebrow="2 · Client readiness" title="Separate “bought” from “ready for delivery.”" body="Most onboarding friction happens between those two states: missing context, incomplete intake, access chasing and reminders that never stop. Make readiness explicit before automating more messages." />
    <section className="border-y border-zinc-200 dark:border-zinc-800">
      <Field label="Process repeatability"><Level value={input.processRepeatability} onChange={(value) => update('processRepeatability', value)} labels={LEVELS.repeatability} /></Field>
      <Field label="Sales-to-delivery handoff"><Level value={input.handoffData} onChange={(value) => update('handoffData', value)} labels={LEVELS.handoff} /></Field>
      <Field label="Client intake"><Level value={input.intakeQuality} onChange={(value) => update('intakeQuality', value)} labels={LEVELS.intake} /></Field>
      <Field label="Access / asset complexity"><Select value={input.accessComplexity} onChange={(value) => update('accessComplexity', value as AccessComplexity)}><option value="none">No meaningful access needed</option><option value="light">A few files / simple access</option><option value="multi">Several accounts, files or permissions</option><option value="sensitive">Sensitive credentials / regulated access</option></Select></Field>
      <Field label="Access tracking"><Level value={input.accessTracking} onChange={(value) => update('accessTracking', value)} labels={LEVELS.access} /></Field>
      <Field label="Welcome communication"><Level value={input.clientWelcome} onChange={(value) => update('clientWelcome', value)} labels={LEVELS.welcome} /></Field>
      <Field label="Missing-item reminders"><Level value={input.reminders} onChange={(value) => update('reminders', value)} labels={LEVELS.reminders} /></Field>
      <Field label="Ready-for-delivery gate"><Level value={input.readinessGate} onChange={(value) => update('readinessGate', value)} labels={LEVELS.gate} /></Field>
    </section>
  </div>
}

function DeliveryStep({ input, update }: { input: OnboardingInput; update: <K extends keyof OnboardingInput>(key: K, value: OnboardingInput[K]) => void }) {
  const deliveryRoles = ROLES.slice(3)
  return <div className="space-y-8">
    <StepIntro eyebrow="3 · Delivery setup" title="Make the stable path automatic and the exceptions visible." body="The goal is not to remove people from onboarding. It is to stop recreating projects, chasing routine prerequisites and discovering integration failures after a paying client is already waiting." />
    <section className="border-y border-zinc-200 dark:border-zinc-800">{deliveryRoles.map((role) => <Field key={role.key} label={role.label}><SystemSelect role={role} value={input[role.key]} onChange={(value) => update(role.key, value)} /></Field>)}</section>
    <section className="border-y border-zinc-200 dark:border-zinc-800">
      <Field label="Delivery template"><Level value={input.workspaceTemplate} onChange={(value) => update('workspaceTemplate', value)} labels={LEVELS.template} /></Field>
      <Field label="Kickoff scheduling"><Level value={input.kickoffScheduling} onChange={(value) => update('kickoffScheduling', value)} labels={LEVELS.kickoff} /></Field>
      <Field label="Owner assignment"><Level value={input.ownerAssignment} onChange={(value) => update('ownerAssignment', value)} labels={LEVELS.owner} /></Field>
      <Field label="Duplicate / retry safety"><Level value={input.duplicateProtection} onChange={(value) => update('duplicateProtection', value)} labels={LEVELS.duplicate} /></Field>
      <Field label="Exception handling"><Level value={input.exceptionHandling} onChange={(value) => update('exceptionHandling', value)} labels={LEVELS.exceptions} /></Field>
      <Field label="Monitoring"><Level value={input.monitoring} onChange={(value) => update('monitoring', value)} labels={LEVELS.monitoring} /></Field>
      <Field label="Target time to ready"><Select value={input.targetDays} onChange={(value) => update('targetDays', Number(value))}><option value={1}>1 business day</option><option value={3}>3 days</option><option value={5}>5 days</option><option value={7}>1 week</option><option value={14}>2 weeks</option><option value={30}>30 days</option></Select></Field>
    </section>
  </div>
}

function Result({ input, onEdit }: { input: OnboardingInput; onEdit: (step: StepId) => void }) {
  const result = useMemo(() => analyzeOnboarding(input), [input])
  const topIssues = result.issues.slice(0, 3)
  const automate = ['Create the delivery workspace from a governed template after readiness.', 'Send routine welcome, intake and missing-item reminders from current state.', 'Write created resource IDs and onboarding status back to the source of truth.', 'Alert an owner when a critical setup step fails or readiness stalls.']
  const keepHuman = ['Resolve unusual scope, commercial or access exceptions.', 'Own the kickoff conversation, expectations and relationship.', 'Approve sensitive exceptions or uncertain client state before irreversible actions.']

  return <div className="space-y-10">
    <section className="rounded-[24px] bg-zinc-950 p-6 text-white sm:p-8 dark:bg-zinc-100 dark:text-zinc-950"><div className="flex flex-wrap items-start justify-between gap-6"><div className="max-w-2xl"><p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-400 dark:text-zinc-600">Onboarding readiness</p><h2 className="mt-2 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">{result.status}</h2><p className="mt-4 text-sm leading-7 text-zinc-300 dark:text-zinc-700">{result.summary}</p></div><div className="text-right"><p className="font-mono text-2xl font-medium">{result.score}/100</p><p className="text-xs text-zinc-400 dark:text-zinc-600">confidence {result.confidence}%</p></div></div><div className="mt-6"><ToolResultActions title={`Client onboarding: ${result.status}`} summary={result.summary} details={topIssues.map((issue) => `${issue.title}: ${issue.fix}`)} /></div></section>

    {topIssues.length ? <section><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Blocking readiness</p><h3 className="mt-2 text-xl font-medium tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">Fix these before adding more automation.</h3></div><button type="button" onClick={() => onEdit('readiness')} className="text-xs font-medium text-zinc-500 underline decoration-zinc-300 underline-offset-4">Edit readiness</button></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{topIssues.map((issue) => <div key={issue.id} className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55"><p className="font-mono text-[10px] uppercase text-zinc-500">{issue.severity} · {issue.owner}</p><h4 className="mt-2 text-sm font-medium text-zinc-950 dark:text-zinc-50">{issue.title}</h4><p className="mt-2 text-xs leading-5 text-zinc-500">{issue.impact}</p><p className="mt-3 text-xs leading-5 text-zinc-700 dark:text-zinc-300"><span className="font-medium">Do:</span> {issue.fix}</p></div>)}</div></section> : null}

    <section><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Target flow</p><h3 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">One visible state transition at a time.</h3><div className="mt-4 border-y border-zinc-200 dark:border-zinc-800">{result.stages.map((stage, index) => <div key={stage.id} className={`grid gap-2 py-4 sm:grid-cols-[36px_160px_1fr] ${index ? 'border-t border-zinc-200 dark:border-zinc-800' : ''}`}><span className="font-mono text-[10px] text-zinc-500">{String(index + 1).padStart(2, '0')}</span><div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{stage.label}</p><p className="mt-1 text-[11px] text-zinc-500">{stage.owner}</p></div><div><p className="text-xs leading-5 text-zinc-700 dark:text-zinc-300">{stage.purpose}</p>{stage.gate ? <p className="mt-1 text-[11px] leading-4 text-zinc-500">Gate: {stage.gate}</p> : null}</div></div>)}</div></section>

    <section className="grid gap-5 sm:grid-cols-2"><div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Automate</p><ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{automate.map((item) => <li key={item}>• {item}</li>)}</ul></div><div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Keep human</p><ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{keepHuman.map((item) => <li key={item}>• {item}</li>)}</ul></div></section>

    <section><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">30-day rollout</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{result.thirtyDayPlan.map((week) => <div key={week.week} className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800"><p className="font-mono text-[10px] uppercase text-zinc-500">{week.week}</p><p className="mt-1 text-sm font-medium text-zinc-950 dark:text-zinc-50">{week.focus}</p><ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{week.actions.map((action) => <li key={action}>• {action}</li>)}</ul></div>)}</div></section>

    <section className="grid gap-5 sm:grid-cols-2"><div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Architecture rules</p><ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{result.architecture.map((item) => <li key={item}>• {item}</li>)}</ul></div><div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Safeguards</p><ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{result.safeguards.map((item) => <li key={item}>• {item}</li>)}</ul></div></section>

    <details className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800"><summary className="cursor-pointer text-sm font-medium text-zinc-950 dark:text-zinc-50">Readiness detail</summary><dl className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(result.metrics).map(([key, value]) => <div key={key} className="flex items-center justify-between border-t border-zinc-200 pt-3 text-xs dark:border-zinc-800"><dt className="capitalize text-zinc-600 dark:text-zinc-400">{key.replace(/([A-Z])/g, ' $1')}</dt><dd className="font-mono text-zinc-500">{value}/100</dd></div>)}</dl></details>
  </div>
}

export function OnboardingPlanner() {
  const [input, setInput] = useState<OnboardingInput>(DEFAULT_ONBOARDING_INPUT)
  const [step, setStep] = useState<StepId>('commercial')
  const { rootRef, scrollToStart } = useToolStepNavigation()
  const index = STEPS.indexOf(step)
  const progress = step === 'result' ? 100 : Math.round(((index + 1) / 3) * 100)
  const canContinue = step !== 'commercial' || Boolean(input.crmId)
  const update = <K extends keyof OnboardingInput>(key: K, value: OnboardingInput[K]) => setInput((current) => ({ ...current, [key]: value }))
  const goTo = (nextStep: StepId) => { setStep(nextStep); scrollToStart() }
  const next = () => goTo(STEPS[Math.min(STEPS.length - 1, index + 1)])
  const back = () => goTo(STEPS[Math.max(0, index - 1)])
  const reset = () => { setInput(DEFAULT_ONBOARDING_INPUT); goTo('commercial') }

  return <section ref={rootRef} className="onboarding-planner mx-auto w-full max-w-5xl scroll-mt-24 sm:scroll-mt-28"><div className="mb-8 rounded-2xl bg-zinc-50 p-4 sm:p-5 dark:bg-zinc-900/55"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Design the readiness state, not a welcome-email sequence.</p><p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500">About 3 minutes. The result gives you the canonical start, blockers, target state flow, what to automate, what to keep human and a 30-day rollout.</p></div><button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"><RotateCcwIcon className="h-3.5 w-3.5" />Start over</button></div><div role="progressbar" aria-label="Tool progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"><div className="h-full rounded-full bg-zinc-950 transition-[width] duration-500 dark:bg-zinc-50" style={{ width: `${progress}%` }} /></div><div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500"><span aria-live="polite">{step === 'result' ? 'Onboarding plan complete' : `Step ${index + 1} of 3`}</span><span>{progress}%</span></div></div>
  <div className="min-h-[500px]">{step === 'commercial' ? <CommercialStep input={input} update={update} /> : null}{step === 'readiness' ? <ReadinessStep input={input} update={update} /> : null}{step === 'delivery' ? <DeliveryStep input={input} update={update} /> : null}{step === 'result' ? <Result input={input} onEdit={goTo} /> : null}</div>
  {step !== 'result' ? <div className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-5 dark:border-zinc-800"><button type="button" onClick={back} disabled={index === 0} className="inline-flex min-h-11 items-center gap-2 px-1 text-sm font-medium text-zinc-600 disabled:invisible dark:text-zinc-400"><ArrowLeftIcon className="h-4 w-4" />Back</button><button type="button" onClick={next} disabled={!canContinue} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-35 dark:bg-zinc-50 dark:text-zinc-950">{step === 'delivery' ? 'See onboarding plan' : 'Continue'}<ArrowRightIcon className="h-4 w-4" /></button></div> : <div className="mt-10 border-t border-zinc-200 pt-5 dark:border-zinc-800"><button type="button" onClick={() => goTo('commercial')} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"><ArrowLeftIcon className="h-4 w-4" />Edit inputs</button></div>}
  </section>
}
