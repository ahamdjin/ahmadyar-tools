'use client'

import { useMemo, useState } from 'react'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react'

import {
  analyzeArchitecture,
  APP_BY_ID,
  APP_CATALOG,
  APP_CATEGORY_LABELS,
  DEFAULT_ASSESSMENT,
  getQuestionPlan,
  inferEnvironment,
  POPULAR_APP_IDS,
  recommendOperatingModel,
  stressTestArchitecture,
  type AppCategory,
  type AppDefinition,
  type AssessmentInput,
  type BudgetBand,
  type ChangeFrequency,
  type FailureImpact,
  type PortfolioShape,
  type Priority,
  type SelfHostingNeed,
  type TechnicalOwner,
} from '@/engine'

type PageId = 'systems' | 'scale' | 'ownership' | 'workflow' | 'risk' | 'result'

const PRIORITIES: Array<{ id: Priority; label: string; detail: string }> = [
  { id: 'ease', label: 'Easy to own', detail: 'The team should be able to maintain it without a specialist.' },
  { id: 'speed', label: 'Fast to build', detail: 'Get useful workflows live with minimal setup.' },
  { id: 'cost', label: 'Cost efficiency', detail: 'Keep usage and operating cost sensible as volume grows.' },
  { id: 'reliability', label: 'Reliability', detail: 'Failure handling matters more than convenience.' },
  { id: 'control', label: 'Control', detail: 'APIs, hosting, code, and infrastructure freedom matter.' },
  { id: 'scale', label: 'Scale', detail: 'Plan around a much larger workflow portfolio or run volume.' },
]

const number = new Intl.NumberFormat('en-US')

function Field({
  label,
  helper,
  children,
}: {
  label: string
  helper?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-3 border-b border-zinc-300 py-5 last:border-b-0 sm:grid-cols-[230px_1fr] sm:gap-8 dark:border-zinc-700">
      <div>
        <p className="text-[15px] font-medium leading-6 text-zinc-950 dark:text-zinc-50">{label}</p>
        {helper ? <p className="mt-1 max-w-[220px] text-[13px] leading-5 text-zinc-600 dark:text-zinc-400">{helper}</p> : null}
      </div>
      <div className="self-center">{children}</div>
    </div>
  )
}

function Select({ value, onChange, children }: { value: string | number; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-12 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-[15px] font-medium text-zinc-950 outline-none transition-colors focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100"
    >
      {children}
    </select>
  )
}

function CheckRow({
  checked,
  label,
  detail,
  onChange,
}: {
  checked: boolean
  label: string
  detail?: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border-b border-zinc-200 py-3.5 last:border-b-0 dark:border-zinc-800">
      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-zinc-400 bg-white dark:border-zinc-600 dark:bg-zinc-950">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="absolute inset-0 cursor-pointer opacity-0" />
        {checked ? <CheckIcon className="h-3.5 w-3.5 text-zinc-950 dark:text-zinc-50" /> : null}
      </span>
      <span>
        <span className="block text-[15px] font-medium leading-5 text-zinc-950 dark:text-zinc-50">{label}</span>
        {detail ? <span className="mt-1 block text-[13px] leading-5 text-zinc-600 dark:text-zinc-400">{detail}</span> : null}
      </span>
    </label>
  )
}

function AppIcon({ app, size = 'md' }: { app: AppDefinition; size?: 'sm' | 'md' }) {
  const dimension = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'
  if (!app.icon) {
    return (
      <span className={`${dimension} flex shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300`}>
        {app.name.slice(0, 2).toUpperCase()}
      </span>
    )
  }
  return (
    <span
      aria-hidden="true"
      className={`${dimension} shrink-0 rounded-md bg-zinc-100 bg-[length:66%] bg-center bg-no-repeat dark:bg-zinc-900`}
      style={{ backgroundImage: `url(https://cdn.simpleicons.org/${app.icon})` }}
    />
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-t border-zinc-300 py-3.5 dark:border-zinc-700">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
        <span className="font-mono text-xs font-medium text-zinc-950 dark:text-zinc-50">{value}/100</span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div className="h-full rounded-full bg-zinc-950 transition-[width] duration-500 dark:bg-zinc-50" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function ownerDefaults(owner: TechnicalOwner): Pick<AssessmentInput, 'team' | 'maintenance'> {
  if (owner === 'developer') return { team: 'developer', maintenance: 'high' }
  if (owner === 'automation-specialist') return { team: 'automation', maintenance: 'high' }
  if (owner === 'power-user') return { team: 'business', maintenance: 'medium' }
  return { team: 'business', maintenance: 'low' }
}

function SystemsForm({ input, setInput }: { input: AssessmentInput; setInput: React.Dispatch<React.SetStateAction<AssessmentInput>> }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | AppCategory>('all')
  const [customName, setCustomName] = useState('')
  const discovery = useMemo(() => inferEnvironment(input), [input])
  const signal = useMemo(() => analyzeArchitecture(input), [input])
  const plan = useMemo(() => getQuestionPlan(input), [input])

  const selected = input.selectedApps.map((id) => APP_BY_ID.get(id)).filter((app): app is AppDefinition => Boolean(app))
  const popularOrder = new Map(POPULAR_APP_IDS.map((id, index) => [id, index]))
  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    return APP_CATALOG
      .filter((app) => category === 'all' || app.category === category)
      .filter((app) => !term || `${app.name} ${app.category} ${app.vendor}`.toLowerCase().includes(term))
      .sort((a, b) => {
        if (term) return a.name.localeCompare(b.name)
        return (popularOrder.get(a.id) ?? 999) - (popularOrder.get(b.id) ?? 999) || a.name.localeCompare(b.name)
      })
      .slice(0, term || category !== 'all' ? 36 : 24)
  }, [category, query, popularOrder])

  const toggleApp = (id: string) => {
    setInput((current) => {
      const exists = current.selectedApps.includes(id)
      const selectedApps = exists ? current.selectedApps.filter((item) => item !== id) : [...current.selectedApps, id]
      const primarySystemId = exists && current.primarySystemId === id ? null : current.primarySystemId
      const total = selectedApps.length + current.customSystems.length + current.otherSystemsCount
      return {
        ...current,
        selectedApps,
        primarySystemId,
        appsPerWorkflow: Math.max(2, Math.min(8, Math.round(Math.max(2, total) * 0.62))),
      }
    })
  }

  const addCustom = () => {
    const name = customName.trim()
    if (!name) return
    setInput((current) => current.customSystems.some((item) => item.toLowerCase() === name.toLowerCase()) ? current : { ...current, customSystems: [...current.customSystems, name] })
    setCustomName('')
  }

  return (
    <div className="space-y-9">
      <header className="max-w-2xl">
        <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Start with what you actually use.</p>
        <h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">Which systems are in your world?</h2>
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">Choose the apps your workflows touch today or are very likely to touch. This lets the engine remove a lot of generic questions immediately.</p>
      </header>

      {selected.length ? (
        <section>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Selected · {selected.length}</p>
          <div className="flex flex-wrap gap-2">
            {selected.map((app) => (
              <button key={app.id} type="button" onClick={() => toggleApp(app.id)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-zinc-300 bg-white py-1.5 pl-2 pr-3 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-100">
                <AppIcon app={app} size="sm" />
                {app.name}
                <XIcon className="h-3.5 w-3.5 text-zinc-500" />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-y border-zinc-300 py-5 dark:border-zinc-700">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <label className="relative block">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search HubSpot, Slack, Stripe, PostgreSQL…"
              className="min-h-12 w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-3 text-[15px] text-zinc-950 outline-none placeholder:text-zinc-500 focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100"
            />
          </label>
          <Select value={category} onChange={(value) => setCategory(value as 'all' | AppCategory)}>
            <option value="all">All categories</option>
            {Object.entries(APP_CATEGORY_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </Select>
        </div>

        <div className="mt-5 grid gap-x-7 sm:grid-cols-2">
          {results.map((app) => {
            const active = input.selectedApps.includes(app.id)
            return (
              <button key={app.id} type="button" onClick={() => toggleApp(app.id)} className="flex min-h-14 items-center gap-3 border-b border-zinc-200 py-2.5 text-left transition-colors hover:text-black dark:border-zinc-800 dark:hover:text-white">
                <AppIcon app={app} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-zinc-950 dark:text-zinc-50">{app.name}</span>
                  <span className="block text-xs text-zinc-500">{APP_CATEGORY_LABELS[app.category]}</span>
                </span>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? 'border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950' : 'border-zinc-300 dark:border-zinc-700'}`}>
                  {active ? <CheckIcon className="h-3 w-3" /> : null}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-[15px] font-medium text-zinc-950 dark:text-zinc-50">Something missing?</h3>
          <p className="mt-1 text-[13px] leading-5 text-zinc-600 dark:text-zinc-400">Add an internal, legacy, niche, or custom system. Unknown systems matter because they can force API work.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={customName}
            onChange={(event) => setCustomName(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCustom() } }}
            placeholder="e.g. Internal quoting system"
            className="min-h-12 min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3.5 text-[15px] text-zinc-950 outline-none placeholder:text-zinc-500 focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100"
          />
          <button type="button" onClick={addCustom} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950"><PlusIcon className="h-4 w-4" />Add</button>
        </div>
        {input.customSystems.length ? (
          <div className="flex flex-wrap gap-2">
            {input.customSystems.map((name) => (
              <button key={name} type="button" onClick={() => setInput((current) => ({ ...current, customSystems: current.customSystems.filter((item) => item !== name) }))} className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:text-zinc-200">{name}<XIcon className="h-3.5 w-3.5" /></button>
            ))}
          </div>
        ) : null}

        <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <Field label="Other systems not listed" helper="Rough count is enough. This increases integration uncertainty.">
            <Select value={input.otherSystemsCount} onChange={(value) => setInput((current) => ({ ...current, otherSystemsCount: Number(value) }))}>
              <option value={0}>None</option>
              <option value={1}>1 other system</option>
              <option value={3}>2–3 other systems</option>
              <option value={7}>4–7 other systems</option>
              <option value={12}>8+ other systems</option>
            </Select>
          </Field>
          {discovery.unknownSystems > 0 || plan.needsApiQuestion ? (
            <CheckRow
              checked={input.unknownSystemsRequireApi}
              onChange={(checked) => setInput((current) => ({ ...current, unknownSystemsRequireApi: checked }))}
              label="Some of these systems need direct API or webhook work"
              detail="Turn this on if there is no normal connector, or you already know custom integration work is required."
            />
          ) : null}
        </div>
      </section>

      {plan.needsPrimarySystem ? (
        <section className="border-y border-zinc-300 dark:border-zinc-700">
          <Field label="Primary CRM / source of truth" helper="When systems disagree, which one should own the customer record?">
            <Select value={input.primarySystemId ?? ''} onChange={(value) => setInput((current) => ({ ...current, primarySystemId: value || null }))}>
              <option value="">Not sure yet</option>
              {discovery.crmApps.map((app) => <option key={app.id} value={app.id}>{app.name}</option>)}
            </Select>
          </Field>
        </section>
      ) : null}

      {input.selectedApps.length || input.customSystems.length ? (
        <section className="border-t-2 border-zinc-950 pt-5 dark:border-zinc-50">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Preliminary read</p>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-xl font-medium tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">{signal.primary.name}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{signal.kindLabel}</p>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">This is only the systems signal. Volume, ownership, budget, workflow shape, and reliability can still change the answer.</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span>{discovery.knownApps} known systems</span>
            <span>{discovery.unknownSystems} unknown/custom</span>
            <span>Integration difficulty {discovery.integrationDifficulty}/100</span>
          </div>
        </section>
      ) : null}
    </div>
  )
}

function ScaleForm({ input, update }: { input: AssessmentInput; update: <K extends keyof AssessmentInput>(key: K, value: AssessmentInput[K]) => void }) {
  return (
    <div>
      <header className="mb-7 max-w-2xl">
        <h2 className="text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">How big is this becoming?</h2>
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">A stack that is perfect for four workflows can be a mess at eighty. Use realistic ranges; exact numbers are not required.</p>
      </header>
      <div className="border-y border-zinc-300 dark:border-zinc-700">
        <Field label="Workflows today" helper="Production automations, not one-off experiments.">
          <Select value={input.currentWorkflows} onChange={(value) => update('currentWorkflows', Number(value))}>
            <option value={3}>0–5 workflows</option>
            <option value={10}>6–15 workflows</option>
            <option value={22}>16–30 workflows</option>
            <option value={45}>31–60 workflows</option>
            <option value={80}>61–100 workflows</option>
            <option value={150}>100+ workflows</option>
          </Select>
        </Field>
        <Field label="Expected in 12–24 months" helper="This changes governance, reuse, platform economics, and ownership.">
          <Select value={input.futureWorkflows} onChange={(value) => update('futureWorkflows', Number(value))}>
            <option value={6}>Under 10</option>
            <option value={18}>10–25</option>
            <option value={40}>26–50</option>
            <option value={75}>51–100</option>
            <option value={150}>101–200</option>
            <option value={300}>200+</option>
          </Select>
        </Field>
        <Field label="Monthly workflow runs" helper="How often the workflows actually execute. A rough range is enough.">
          <Select value={input.monthlyRuns} onChange={(value) => update('monthlyRuns', Number(value))}>
            <option value={500}>Under 1,000</option>
            <option value={5000}>1,000–10,000</option>
            <option value={25000}>10,000–50,000</option>
            <option value={100000}>50,000–250,000</option>
            <option value={500000}>250,000–1M</option>
            <option value={2000000}>1M+</option>
          </Select>
        </Field>
        <Field label="Portfolio shape" helper="Think about the majority of workflows, not the single hardest one.">
          <Select value={input.portfolioShape} onChange={(value) => { const shape = value as PortfolioShape; update('portfolioShape', shape); if (shape === 'product-like') update('productLogic', true) }}>
            <option value="mostly-simple">Mostly simple — triggers, updates, notifications</option>
            <option value="mixed">Mixed — simple flows plus some multi-step logic</option>
            <option value="advanced">Advanced — APIs, branching, transformations, AI</option>
            <option value="product-like">Product-like — state, transactions, customer-facing logic</option>
          </Select>
        </Field>
        <Field label="Teams / departments involved" helper="More owners increase governance and handoff pressure.">
          <Select value={input.departments} onChange={(value) => update('departments', Number(value))}>
            <option value={1}>One team</option>
            <option value={2}>Two teams</option>
            <option value={4}>3–5 teams</option>
            <option value={7}>6+ teams</option>
          </Select>
        </Field>
        <Field label="How often processes change" helper="Automating unstable processes can create expensive rework.">
          <Select value={input.changeFrequency} onChange={(value) => update('changeFrequency', value as ChangeFrequency)}>
            <option value="rare">Rarely</option>
            <option value="monthly">Every few months / monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Constantly / daily</option>
          </Select>
        </Field>
        <Field label="Process stability" helper="Is the business process itself settled enough to automate?">
          <Select value={input.processStability} onChange={(value) => update('processStability', value as AssessmentInput['processStability'])}>
            <option value="stable">Stable and well understood</option>
            <option value="mostly-stable">Mostly stable with some exceptions</option>
            <option value="changing">Still changing significantly</option>
          </Select>
        </Field>
      </div>
    </div>
  )
}

function OwnershipForm({ input, setInput, update }: { input: AssessmentInput; setInput: React.Dispatch<React.SetStateAction<AssessmentInput>>; update: <K extends keyof AssessmentInput>(key: K, value: AssessmentInput[K]) => void }) {
  const plan = getQuestionPlan(input)
  const setOwner = (owner: TechnicalOwner) => setInput((current) => ({ ...current, technicalOwner: owner, ...ownerDefaults(owner) }))
  const togglePriority = (priority: Priority) => {
    const exists = input.priorities.includes(priority)
    const next = exists ? input.priorities.filter((item) => item !== priority) : [...input.priorities, priority]
    update('priorities', next.slice(-3))
  }

  return (
    <div>
      <header className="mb-7 max-w-2xl">
        <h2 className="text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">Who has to live with this after launch?</h2>
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">Capability is not enough. A technically powerful platform is a bad recommendation if nobody can safely own it.</p>
      </header>
      <div className="border-y border-zinc-300 dark:border-zinc-700">
        <Field label="Strongest day-to-day owner" helper="Who will debug failures and change workflows six months from now?">
          <Select value={input.technicalOwner} onChange={(value) => setOwner(value as TechnicalOwner)}>
            <option value="none">Business team — no technical automation owner</option>
            <option value="power-user">Power user / operations generalist</option>
            <option value="automation-specialist">Automation / RevOps specialist</option>
            <option value="developer">Developer or engineering team</option>
          </Select>
        </Field>
        <Field label="Automation software budget" helper="Monthly platform budget only. Self-hosting still has engineering and infrastructure cost.">
          <Select value={input.budget} onChange={(value) => update('budget', value as BudgetBand)}>
            <option value="under-100">Under $100 / month</option>
            <option value="100-300">$100–$300 / month</option>
            <option value="300-1000">$300–$1,000 / month</option>
            <option value="1000-5000">$1,000–$5,000 / month</option>
            <option value="flexible">Flexible / enterprise budget</option>
          </Select>
        </Field>
        <Field label="Hosting preference" helper="Self-hosting gives control, but someone must own uptime, upgrades, backups, secrets, and recovery.">
          <Select value={input.selfHosting} onChange={(value) => update('selfHosting', value as SelfHostingNeed)}>
            <option value="none">Managed cloud is fine</option>
            <option value="preferred">Prefer self-hosting if it makes sense</option>
            <option value="required">Self-hosting is mandatory</option>
          </Select>
        </Field>
      </div>

      {plan.needsGovernance ? (
        <div className="mt-6 border-y border-zinc-300 dark:border-zinc-700">
          <CheckRow checked={input.governance} onChange={(checked) => update('governance', checked)} label="We need controlled publishing / governance" detail="Examples: environments, change review, role controls, auditability, shared credentials, or approvals before production changes." />
        </div>
      ) : null}

      <section className="mt-8">
        <h3 className="text-[15px] font-medium text-zinc-950 dark:text-zinc-50">What matters most? <span className="font-normal text-zinc-500">Pick up to 3.</span></h3>
        <div className="mt-3 grid gap-x-8 sm:grid-cols-2">
          {PRIORITIES.map((priority) => (
            <CheckRow key={priority.id} checked={input.priorities.includes(priority.id)} onChange={() => togglePriority(priority.id)} label={priority.label} detail={priority.detail} />
          ))}
        </div>
      </section>
    </div>
  )
}

function WorkflowForm({ input, update }: { input: AssessmentInput; update: <K extends keyof AssessmentInput>(key: K, value: AssessmentInput[K]) => void }) {
  const plan = getQuestionPlan(input)
  return (
    <div>
      <header className="mb-7 max-w-2xl">
        <h2 className="text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">What makes the harder workflows hard?</h2>
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">We already know your systems. These questions determine whether common connector automation is enough or a deeper orchestration layer is justified.</p>
      </header>
      <div className="border-y border-zinc-300 dark:border-zinc-700">
        <Field label="Systems in a typical workflow" helper="Not your total stack — how many systems one normal workflow crosses.">
          <Select value={input.appsPerWorkflow} onChange={(value) => update('appsPerWorkflow', Number(value))}>
            <option value={2}>1–2 systems</option>
            <option value={4}>3–4 systems</option>
            <option value={6}>5–6 systems</option>
            <option value={9}>7–10 systems</option>
            <option value={12}>10+ systems</option>
          </Select>
        </Field>
        <Field label="Typical workflow size" helper="Count meaningful trigger/action/logic steps, not tiny UI details.">
          <Select value={input.typicalSteps} onChange={(value) => update('typicalSteps', Number(value))}>
            <option value={3}>2–4 steps</option>
            <option value={6}>5–8 steps</option>
            <option value={10}>9–12 steps</option>
            <option value={16}>13–20 steps</option>
            <option value={25}>20+ steps</option>
          </Select>
        </Field>
        <Field label="Decision logic" helper="How much branching is normal in the workflows that matter?">
          <Select value={input.branching} onChange={(value) => update('branching', value as AssessmentInput['branching'])}>
            <option value="none">Mostly straight-line workflows</option>
            <option value="simple">A few conditions / routes</option>
            <option value="advanced">Many branches, routes, or reusable rules</option>
          </Select>
        </Field>
      </div>

      <section className="mt-6 border-y border-zinc-300 dark:border-zinc-700">
        {plan.needsApiQuestion ? <CheckRow checked={input.customApi} onChange={(checked) => update('customApi', checked)} label="Important workflows need custom API calls" detail="HTTP requests, custom authentication, niche APIs, or systems without a normal connector." /> : null}
        <CheckRow checked={input.loopsOrBatching} onChange={(checked) => update('loopsOrBatching', checked)} label="We loop through or batch many records" detail="Examples: process every invoice, enrich a list, sync many records, or paginate through an API." />
        {plan.needsAiQuestion ? <CheckRow checked={input.aiSteps} onChange={(checked) => update('aiSteps', checked)} label="AI influences a workflow decision" detail="Classification, extraction, enrichment, scoring, drafting, or agent behavior that affects downstream actions." /> : null}
        {plan.needsDataQuestion ? <CheckRow checked={input.databaseWork} onChange={(checked) => update('databaseWork', checked)} label="Workflows read/write a database or shared data layer" detail="This usually increases state, consistency, replay, and synchronization requirements." /> : null}
        {plan.needsApprovalQuestion ? <CheckRow checked={input.humanApprovals} onChange={(checked) => update('humanApprovals', checked)} label="Some decisions require human approval" detail="Useful when money, compliance, exceptions, or uncertain AI decisions should not be fully automatic." /> : null}
        <CheckRow checked={input.realtime} onChange={(checked) => update('realtime', checked)} label="Some workflows must respond almost immediately" detail="Seconds matter — for webhooks, customer-facing behavior, routing, or transactional events." />
        {input.portfolioShape === 'product-like' || input.databaseWork ? <CheckRow checked={input.productLogic} onChange={(checked) => update('productLogic', checked)} label="This includes real application / product logic" detail="Persistent state, transactions, customer-facing behavior, or rules that would be painful to express as one giant workflow." /> : null}
      </section>
    </div>
  )
}

function RiskForm({ input, update }: { input: AssessmentInput; update: <K extends keyof AssessmentInput>(key: K, value: AssessmentInput[K]) => void }) {
  return (
    <div>
      <header className="mb-7 max-w-2xl">
        <h2 className="text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">What happens when it breaks?</h2>
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">Reliability changes architecture. A missed Slack message and a duplicated payment should not be designed the same way.</p>
      </header>
      <div className="border-y border-zinc-300 dark:border-zinc-700">
        <Field label="Worst realistic failure" helper="Choose the business consequence, not how scary the technical error looks.">
          <Select value={input.failureImpact} onChange={(value) => update('failureImpact', value as FailureImpact)}>
            <option value="low">Low — inconvenience, easy to recover</option>
            <option value="medium">Medium — manual work or delayed customer response</option>
            <option value="high">High — lost lead/order, wrong customer state, major disruption</option>
            <option value="critical">Critical — money, legal/compliance, or core operations can be wrong</option>
          </Select>
        </Field>
      </div>
      <section className="mt-6 border-y border-zinc-300 dark:border-zinc-700">
        <CheckRow checked={input.duplicateUnsafe} onChange={(checked) => update('duplicateUnsafe', checked)} label="Running an important action twice could cause damage" detail="Examples: duplicate charge, duplicate order, duplicate contract, duplicate opportunity, or repeated irreversible update." />
        <CheckRow checked={input.retriesRequired} onChange={(checked) => update('retriesRequired', checked)} label="Failed work must retry or enter a recovery queue" detail="Use this when silently dropping an event is not acceptable." />
        <CheckRow checked={input.sensitiveData} onChange={(checked) => update('sensitiveData', checked)} label="Sensitive or regulated data crosses the automation layer" detail="Customer PII, financial data, health data, employee information, credentials, or regulated records." />
      </section>
    </div>
  )
}

function Result({ input, onEdit }: { input: AssessmentInput; onEdit: (page: PageId) => void }) {
  const result = useMemo(() => analyzeArchitecture(input), [input])
  const operating = useMemo(() => recommendOperatingModel(input), [input])
  const stress = useMemo(() => stressTestArchitecture(input), [input])
  const discovery = useMemo(() => inferEnvironment(input), [input])
  const selectedApps = input.selectedApps.map((id) => APP_BY_ID.get(id)).filter((app): app is AppDefinition => Boolean(app))

  return (
    <div className="space-y-12">
      <section>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">Recommended architecture</p>
            <h2 className="mt-2 text-3xl font-medium tracking-[-0.045em] text-zinc-950 sm:text-4xl dark:text-zinc-50">{result.primary.name}</h2>
            <p className="mt-3 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">{result.summary}</p>
          </div>
          <div className="min-w-24 border-l border-zinc-300 pl-4 text-right dark:border-zinc-700">
            <span className="block font-mono text-2xl font-medium text-zinc-950 dark:text-zinc-50">{result.metrics.confidence}%</span>
            <span className="text-xs text-zinc-500">confidence</span>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          {result.platformMix.map((id, index) => {
            const platform = result.ranking.find((item) => item.id === id)
            return platform ? <span key={id} className="contents">{index > 0 ? <span className="text-zinc-400">+</span> : null}<span className="border-b border-zinc-400 pb-0.5 font-medium">{platform.name}</span></span> : null
          })}
        </div>
      </section>

      <section className="border-y border-zinc-300 dark:border-zinc-700">
        <div className="grid gap-5 py-5 sm:grid-cols-4">
          <div><p className="text-xs text-zinc-500">Systems</p><p className="mt-1 text-lg font-medium text-zinc-950 dark:text-zinc-50">{discovery.knownApps + discovery.unknownSystems}</p></div>
          <div><p className="text-xs text-zinc-500">Workflows</p><p className="mt-1 text-lg font-medium text-zinc-950 dark:text-zinc-50">{input.currentWorkflows} → {input.futureWorkflows}</p></div>
          <div><p className="text-xs text-zinc-500">Runs / month</p><p className="mt-1 text-lg font-medium text-zinc-950 dark:text-zinc-50">{number.format(result.usage.estimatedExecutionsPerMonth)}</p></div>
          <div><p className="text-xs text-zinc-500">Est. actions</p><p className="mt-1 text-lg font-medium text-zinc-950 dark:text-zinc-50">{number.format(result.usage.estimatedActionsPerMonth)}</p></div>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Portfolio architecture</p>
            <h3 className="mt-2 text-xl font-medium tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">Do not force every workflow onto one platform.</h3>
          </div>
          <button type="button" onClick={() => onEdit('scale')} className="text-sm font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50">Edit portfolio</button>
        </div>
        <div className="mt-5 border-y border-zinc-300 dark:border-zinc-700">
          {result.portfolioPlan.map((lane, index) => (
            <div key={lane.id} className={`grid gap-3 py-5 sm:grid-cols-[170px_190px_1fr] ${index > 0 ? 'border-t border-zinc-300 dark:border-zinc-700' : ''}`}>
              <div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{lane.label}</p><p className="mt-1 text-xs text-zinc-500">{lane.useWhen}</p></div>
              <p className="text-[15px] font-medium text-zinc-950 dark:text-zinc-50">{lane.platformName}</p>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{lane.purpose}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-x-10 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium text-zinc-950 dark:text-zinc-50">Architecture profile</p>
          <Metric label="Automation potential" value={result.metrics.automationPotential} />
          <Metric label="Workflow complexity" value={result.metrics.complexity} />
          <Metric label="Integration difficulty" value={result.metrics.integrationDifficulty} />
          <Metric label="Scale pressure" value={result.metrics.scale} />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-zinc-950 dark:text-zinc-50">Operating profile</p>
          <Metric label="Reliability risk" value={result.metrics.reliabilityRisk} />
          <Metric label="Ownership risk" value={result.metrics.ownershipRisk} />
          <Metric label="Maintenance burden" value={result.metrics.maintenanceBurden} />
          <Metric label="Cost pressure" value={result.metrics.costPressure} />
        </div>
      </section>

      <section className="border-y border-zinc-300 py-6 dark:border-zinc-700">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Usage economics</p>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">{result.usage.billingInsight}</p>
        <p className="mt-2 text-sm text-zinc-500">Workload signal: <span className="font-medium text-zinc-800 dark:text-zinc-200">{result.usage.workloadBand.replace('-', ' ')}</span>. This is a comparative architecture signal, not a vendor quote.</p>
      </section>

      <section>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">What changes the answer?</p>
        <h3 className="mt-2 text-xl font-medium tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">Stress-test the recommendation.</h3>
        <div className="mt-5 border-y border-zinc-300 dark:border-zinc-700">
          {stress.map((scenario, index) => (
            <div key={scenario.id} className={`grid gap-2 py-4 sm:grid-cols-[210px_1fr_190px] sm:items-center ${index > 0 ? 'border-t border-zinc-300 dark:border-zinc-700' : ''}`}>
              <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{scenario.label}</p>
              <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">{scenario.note}</p>
              <p className={`text-sm font-medium ${scenario.changedRecommendation ? 'text-zinc-950 dark:text-zinc-50' : 'text-zinc-500'}`}>{scenario.changedRecommendation ? `Changes → ${scenario.primaryName}` : `Stays → ${scenario.primaryName}`}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-10 sm:grid-cols-2">
        <div>
          <h3 className="text-[15px] font-medium text-zinc-950 dark:text-zinc-50">Keep native</h3>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{result.keepNative.map((item) => <li key={item} className="border-t border-zinc-200 pt-3 first:border-t-0 first:pt-0 dark:border-zinc-800">{item}</li>)}</ul>
        </div>
        <div>
          <h3 className="text-[15px] font-medium text-zinc-950 dark:text-zinc-50">Orchestration should own</h3>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{result.orchestrationResponsibilities.map((item) => <li key={item} className="border-t border-zinc-200 pt-3 first:border-t-0 first:pt-0 dark:border-zinc-800">{item}</li>)}</ul>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Platform ranking</p><h3 className="mt-2 text-xl font-medium tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">Every major option is scored against this setup.</h3></div></div>
        <div className="mt-5 border-y border-zinc-300 dark:border-zinc-700">
          {result.ranking.slice(0, 6).map((platform, index) => (
            <div key={platform.id} className={`grid gap-2 py-4 sm:grid-cols-[34px_180px_60px_80px_1fr] sm:items-start ${index > 0 ? 'border-t border-zinc-300 dark:border-zinc-700' : ''}`}>
              <span className="font-mono text-[10px] text-zinc-500">{String(index + 1).padStart(2, '0')}</span>
              <span className={`text-sm font-medium ${platform.eligible ? 'text-zinc-950 dark:text-zinc-50' : 'text-zinc-400 line-through'}`}>{platform.name}</span>
              <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">{platform.score}/100</span>
              <span className="text-xs text-zinc-500">support {platform.supportFit}</span>
              <span className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">{platform.reasons[0] ?? platform.cautions[0] ?? 'Viable depending on implementation details.'}</span>
            </div>
          ))}
        </div>
        <details className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          <summary className="cursor-pointer py-2 font-medium text-zinc-800 dark:text-zinc-200">See all {result.ranking.length} ranked options</summary>
          <div className="border-y border-zinc-200 dark:border-zinc-800">
            {result.ranking.slice(6).map((platform) => <div key={platform.id} className="flex items-center justify-between gap-4 border-b border-zinc-200 py-3 last:border-b-0 dark:border-zinc-800"><span>{platform.name}</span><span className="font-mono text-xs">{platform.score}/100</span></div>)}
          </div>
        </details>
      </section>

      <section className="grid gap-10 sm:grid-cols-2">
        <div>
          <h3 className="text-[15px] font-medium text-zinc-950 dark:text-zinc-50">Safeguards</h3>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{result.safeguards.map((item) => <li key={item} className="border-t border-zinc-200 pt-3 first:border-t-0 first:pt-0 dark:border-zinc-800">{item}</li>)}</ul>
        </div>
        <div>
          <h3 className="text-[15px] font-medium text-zinc-950 dark:text-zinc-50">Operating model</h3>
          <p className="mt-3 text-base font-medium text-zinc-950 dark:text-zinc-50">{operating.label}</p>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{operating.summary}</p>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-500">{operating.practices.slice(0, 4).map((item) => <li key={item}>• {item}</li>)}</ul>
        </div>
      </section>

      {result.nextQuestions.length ? (
        <section className="border-t-2 border-zinc-950 pt-6 dark:border-zinc-50">
          <h3 className="text-lg font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">Questions that would increase confidence</h3>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{result.nextQuestions.map((question, index) => <li key={question}><span className="mr-2 font-mono text-[10px] text-zinc-500">{String(index + 1).padStart(2, '0')}</span>{question}</li>)}</ol>
        </section>
      ) : null}

      {selectedApps.length ? (
        <section className="border-t border-zinc-300 pt-5 dark:border-zinc-700">
          <div className="flex flex-wrap items-center gap-3">{selectedApps.slice(0, 12).map((app) => <span key={app.id} className="inline-flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400"><AppIcon app={app} size="sm" />{app.name}</span>)}{selectedApps.length > 12 ? <span className="text-xs text-zinc-500">+{selectedApps.length - 12} more</span> : null}</div>
        </section>
      ) : null}
    </div>
  )
}

export function ArchitectureAdvisor() {
  const [input, setInput] = useState<AssessmentInput>(DEFAULT_ASSESSMENT)
  const [page, setPage] = useState<PageId>('systems')
  const questionPlan = useMemo(() => getQuestionPlan(input), [input])
  const pages = useMemo<PageId[]>(() => [
    'systems',
    'scale',
    'ownership',
    ...(questionPlan.needsWorkflowDepth ? ['workflow' as const] : []),
    ...(questionPlan.needsReliability ? ['risk' as const] : []),
    'result',
  ], [questionPlan.needsReliability, questionPlan.needsWorkflowDepth])
  const currentPage = pages.includes(page) ? page : 'systems'
  const index = pages.indexOf(currentPage)
  const progress = pages.length <= 1 ? 100 : Math.max(7, Math.round((index / (pages.length - 1)) * 100))
  const canContinue = currentPage !== 'systems' || input.selectedApps.length + input.customSystems.length + input.otherSystemsCount > 0

  const update = <K extends keyof AssessmentInput>(key: K, value: AssessmentInput[K]) => setInput((current) => ({ ...current, [key]: value }))
  const goNext = () => setPage(pages[Math.min(pages.length - 1, index + 1)])
  const goBack = () => setPage(pages[Math.max(0, index - 1)])
  const reset = () => { setInput(DEFAULT_ASSESSMENT); setPage('systems') }

  return (
    <section className="relative left-1/2 w-[min(94vw,960px)] -translate-x-1/2">
      <div className="mb-10">
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-zinc-950 transition-[width] duration-500 dark:bg-zinc-50" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{currentPage === 'result' ? 'Analysis complete' : `${progress}% complete`}</span>
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"><RotateCcwIcon className="h-3.5 w-3.5" />Start over</button>
        </div>
      </div>

      <div className="min-h-[520px]">
        {currentPage === 'systems' ? <SystemsForm input={input} setInput={setInput} /> : null}
        {currentPage === 'scale' ? <ScaleForm input={input} update={update} /> : null}
        {currentPage === 'ownership' ? <OwnershipForm input={input} setInput={setInput} update={update} /> : null}
        {currentPage === 'workflow' ? <WorkflowForm input={input} update={update} /> : null}
        {currentPage === 'risk' ? <RiskForm input={input} update={update} /> : null}
        {currentPage === 'result' ? <Result input={input} onEdit={setPage} /> : null}
      </div>

      {currentPage !== 'result' ? (
        <div className="mt-10 flex items-center justify-between border-t border-zinc-300 pt-5 dark:border-zinc-700">
          <button type="button" onClick={goBack} disabled={index === 0} className="inline-flex min-h-11 items-center gap-2 px-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 disabled:invisible dark:text-zinc-400 dark:hover:text-zinc-50"><ArrowLeftIcon className="h-4 w-4" />Back</button>
          <button type="button" onClick={goNext} disabled={!canContinue} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-zinc-950 px-5 text-sm font-medium text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35 dark:bg-zinc-50 dark:text-zinc-950">Continue<ArrowRightIcon className="h-4 w-4" /></button>
        </div>
      ) : (
        <div className="mt-10 border-t border-zinc-300 pt-5 dark:border-zinc-700">
          <button type="button" onClick={() => setPage('systems')} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"><ArrowLeftIcon className="h-4 w-4" />Edit answers</button>
        </div>
      )}
    </section>
  )
}
