'use client'

import { useMemo, useState } from 'react'
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, RotateCcwIcon } from 'lucide-react'

import { analyzeArchitecture, DEFAULT_ASSESSMENT, type AssessmentInput, type Priority } from '@/engine'

const STEPS = [
  { id: 'scale', label: 'Scale' },
  { id: 'ownership', label: 'Ownership' },
  { id: 'shape', label: 'Workflow' },
  { id: 'risk', label: 'Reliability' },
  { id: 'constraints', label: 'Constraints' },
  { id: 'result', label: 'Architecture' },
] as const

const PRIORITIES: Array<{ id: Priority; label: string; detail: string }> = [
  { id: 'ease', label: 'Easy to own', detail: 'Keep day-to-day maintenance simple.' },
  { id: 'speed', label: 'Fast to build', detail: 'Get useful workflows live quickly.' },
  { id: 'cost', label: 'Cost efficiency', detail: 'Avoid expensive usage patterns as volume grows.' },
  { id: 'reliability', label: 'Reliability', detail: 'Failure handling matters more than convenience.' },
  { id: 'control', label: 'Control', detail: 'APIs, hosting, and implementation freedom matter.' },
  { id: 'scale', label: 'Scale', detail: 'Plan for a larger workflow portfolio and higher volume.' },
]

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 border-b border-zinc-200 py-4 last:border-b-0 sm:grid-cols-[210px_1fr] sm:gap-7 dark:border-zinc-800">
      <span>
        <span className="block text-sm font-medium text-zinc-950 dark:text-zinc-50">{label}</span>
        {helper ? <span className="mt-1 block text-xs leading-5 text-zinc-500 dark:text-zinc-500">{helper}</span> : null}
      </span>
      <span className="self-center">{children}</span>
    </label>
  )
}

function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
    >
      {children}
    </select>
  )
}

function NumberInput({ value, min = 0, max = 1000000, onChange }: { value: number; min?: number; max?: number; onChange: (value: number) => void }) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(event) => onChange(Math.max(min, Math.min(max, Number(event.target.value) || 0)))}
      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
    />
  )
}

function Toggle({ active, label, detail, onClick }: { active: boolean; label: string; detail?: string; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className="flex w-full items-start justify-between gap-4 border-b border-zinc-200 py-3.5 text-left last:border-b-0 dark:border-zinc-800">
      <span>
        <span className="block text-sm text-zinc-900 dark:text-zinc-100">{label}</span>
        {detail ? <span className="mt-1 block text-xs leading-5 text-zinc-500 dark:text-zinc-500">{detail}</span> : null}
      </span>
      <span className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${active ? 'bg-zinc-950 dark:bg-zinc-50' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
        <span className={`h-4 w-4 rounded-full bg-white transition-transform dark:bg-zinc-950 ${active ? 'translate-x-4' : 'translate-x-0'}`} />
      </span>
    </button>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-t border-zinc-200 py-3 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="text-zinc-500 dark:text-zinc-500">{label}</span>
        <span className="font-mono text-zinc-900 dark:text-zinc-100">{value}/100</span>
      </div>
      <div className="mt-2 h-px bg-zinc-200 dark:bg-zinc-800">
        <div className="h-px bg-zinc-950 transition-[width] duration-500 dark:bg-zinc-50" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function ArchitectureResult({ input }: { input: AssessmentInput }) {
  const result = useMemo(() => analyzeArchitecture(input), [input])
  const mix = result.platformMix.map((id) => result.ranking.find((item) => item.id === id)?.name ?? id)

  return (
    <div className="space-y-10 tool-reveal">
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Recommended architecture</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-zinc-950 sm:text-3xl dark:text-zinc-50">{result.primary.name}</h2>
          </div>
          <div className="text-right">
            <span className="block font-mono text-xl text-zinc-950 dark:text-zinc-50">{result.metrics.confidence}%</span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-zinc-400">confidence</span>
          </div>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-zinc-500 dark:text-zinc-400">{result.summary}</p>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-600 dark:text-zinc-300">
          {mix.map((name, index) => (
            <span key={name} className="contents">
              {index > 0 ? <span className="text-zinc-300 dark:text-zinc-700">→</span> : null}
              <span className="border-b border-zinc-300 pb-0.5 dark:border-zinc-700">{name}</span>
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-x-8 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-zinc-950 dark:text-zinc-50">Architecture profile</p>
          <Metric label="Automation potential" value={result.metrics.automationPotential} />
          <Metric label="Workflow complexity" value={result.metrics.complexity} />
          <Metric label="Scale pressure" value={result.metrics.scale} />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-zinc-950 dark:text-zinc-50">Operational profile</p>
          <Metric label="Reliability risk" value={result.metrics.reliabilityRisk} />
          <Metric label="Maintenance burden" value={result.metrics.maintenanceBurden} />
          <Metric label="Recommendation confidence" value={result.metrics.confidence} />
        </div>
      </section>

      <section className="border-y border-zinc-200 dark:border-zinc-800">
        <div className="grid gap-3 py-5 sm:grid-cols-[150px_1fr]">
          <p className="text-xs font-medium text-zinc-950 dark:text-zinc-50">Architecture type</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{result.kindLabel}</p>
        </div>
        <div className="grid gap-3 border-t border-zinc-200 py-5 sm:grid-cols-[150px_1fr] dark:border-zinc-800">
          <p className="text-xs font-medium text-zinc-950 dark:text-zinc-50">Keep native</p>
          <ul className="space-y-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {result.keepNative.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>
        <div className="grid gap-3 border-t border-zinc-200 py-5 sm:grid-cols-[150px_1fr] dark:border-zinc-800">
          <p className="text-xs font-medium text-zinc-950 dark:text-zinc-50">Orchestration layer</p>
          <ul className="space-y-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {result.orchestrationResponsibilities.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>
      </section>

      <section className="grid gap-8 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Safeguards</h3>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {result.safeguards.map((item) => <li key={item} className="border-t border-zinc-200 pt-3 first:border-t-0 first:pt-0 dark:border-zinc-800">{item}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Human checkpoints</h3>
          {result.humanCheckpoints.length ? (
            <ul className="mt-3 space-y-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {result.humanCheckpoints.map((item) => <li key={item} className="border-t border-zinc-200 pt-3 first:border-t-0 first:pt-0 dark:border-zinc-800">{item}</li>)}
            </ul>
          ) : <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">No mandatory human checkpoint was detected from the answers you gave.</p>}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Platform ranking</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">Hard constraints are applied before scores are compared.</p>
          </div>
        </div>
        <div className="mt-4 border-y border-zinc-200 dark:border-zinc-800">
          {result.ranking.map((platform, index) => (
            <div key={platform.id} className={`grid gap-2 py-4 sm:grid-cols-[32px_160px_52px_1fr] ${index > 0 ? 'border-t border-zinc-200 dark:border-zinc-800' : ''}`}>
              <span className="font-mono text-[10px] text-zinc-400">{String(index + 1).padStart(2, '0')}</span>
              <span className={`text-sm font-medium ${platform.eligible ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 line-through dark:text-zinc-600'}`}>{platform.name}</span>
              <span className="font-mono text-xs text-zinc-500">{platform.score}</span>
              <span className="text-xs leading-5 text-zinc-500 dark:text-zinc-500">{platform.reasons[0] ?? platform.cautions[0] ?? 'Viable depending on implementation details.'}</span>
            </div>
          ))}
        </div>
      </section>

      {result.nextQuestions.length ? (
        <section className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Questions I would ask before signing off</h3>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {result.nextQuestions.map((question, index) => <li key={question}><span className="mr-2 font-mono text-[10px] text-zinc-400">{String(index + 1).padStart(2, '0')}</span>{question}</li>)}
          </ol>
        </section>
      ) : null}
    </div>
  )
}

export function ArchitectureAdvisor() {
  const [input, setInput] = useState<AssessmentInput>(DEFAULT_ASSESSMENT)
  const [step, setStep] = useState(0)

  const update = <K extends keyof AssessmentInput>(key: K, value: AssessmentInput[K]) => setInput((current) => ({ ...current, [key]: value }))
  const togglePriority = (priority: Priority) => update('priorities', input.priorities.includes(priority) ? input.priorities.filter((item) => item !== priority) : [...input.priorities, priority].slice(-3))

  const reset = () => { setInput(DEFAULT_ASSESSMENT); setStep(0) }
  const isResult = step === STEPS.length - 1

  return (
    <section className="relative left-1/2 w-[min(94vw,920px)] -translate-x-1/2">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {STEPS.map((item, index) => (
            <button key={item.id} type="button" onClick={() => setStep(index)} className={`text-xs transition-colors ${step === index ? 'font-medium text-zinc-950 dark:text-zinc-50' : index < step ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-600'}`}>
              <span className="mr-1.5 font-mono text-[9px]">{String(index + 1).padStart(2, '0')}</span>{item.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"><RotateCcwIcon className="h-3 w-3" />Reset</button>
      </div>

      <div className="min-h-[430px]">
        {step === 0 ? (
          <div className="tool-reveal">
            <div className="mb-6"><h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">How big is the automation environment?</h2><p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">Current scale matters, but the platform should also survive where you expect to be in a year or two.</p></div>
            <div className="border-y border-zinc-200 dark:border-zinc-800">
              <Field label="Workflows today" helper="Production automations, not one-off experiments."><NumberInput value={input.currentWorkflows} max={500} onChange={(value) => update('currentWorkflows', value)} /></Field>
              <Field label="Expected workflows in 12–24 months" helper="This affects governance, reuse, and maintenance."><NumberInput value={input.futureWorkflows} max={1000} onChange={(value) => update('futureWorkflows', value)} /></Field>
              <Field label="Monthly workflow runs" helper="Approximate is fine. Use the whole portfolio if you know it."><NumberInput value={input.monthlyRuns} max={10000000} onChange={(value) => update('monthlyRuns', value)} /></Field>
              <Field label="Apps per typical workflow"><NumberInput value={input.appsPerWorkflow} min={1} max={50} onChange={(value) => update('appsPerWorkflow', value)} /></Field>
              <Field label="Steps per typical workflow"><NumberInput value={input.typicalSteps} min={1} max={100} onChange={(value) => update('typicalSteps', value)} /></Field>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="tool-reveal">
            <div className="mb-6"><h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">Who owns this after launch?</h2><p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">A technically perfect platform is a bad recommendation if nobody can safely maintain it.</p></div>
            <div className="border-y border-zinc-200 dark:border-zinc-800">
              <Field label="Primary builders"><Select value={input.team} onChange={(value) => update('team', value as AssessmentInput['team'])}><option value="business">Business / operations users</option><option value="automation">Automation specialists</option><option value="developer">Developers</option><option value="mixed">Mixed team</option></Select></Field>
              <Field label="Maintenance capacity"><Select value={input.maintenance} onChange={(value) => update('maintenance', value as AssessmentInput['maintenance'])}><option value="low">Low — it should mostly look after itself</option><option value="medium">Medium — someone can monitor and debug</option><option value="high">High — technical ownership is available</option></Select></Field>
              <Field label="Process stability" helper="Automating a process that changes every week often locks in the wrong process."><Select value={input.processStability} onChange={(value) => update('processStability', value as AssessmentInput['processStability'])}><option value="changing">Still changing</option><option value="mostly-stable">Mostly stable</option><option value="stable">Stable and understood</option></Select></Field>
              <Field label="Integration pattern"><Select value={input.integrationNeed} onChange={(value) => update('integrationNeed', value as AssessmentInput['integrationNeed'])}><option value="standard">Mostly common SaaS integrations</option><option value="broad">Many different SaaS integrations</option><option value="custom">Custom APIs / internal systems are common</option></Select></Field>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="tool-reveal">
            <div className="mb-6"><h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">What do the workflows actually do?</h2><p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">Only switch on complexity that really exists. Multiple filters and branching are optional, not assumed.</p></div>
            <div className="border-y border-zinc-200 dark:border-zinc-800">
              <Field label="Branching / filters"><Select value={input.branching} onChange={(value) => update('branching', value as AssessmentInput['branching'])}><option value="none">None — mostly linear workflows</option><option value="simple">A few simple conditions</option><option value="advanced">Multiple paths, conditions, or decision trees</option></Select></Field>
              <Toggle active={input.loopsOrBatching} label="Loops or batching" detail="Process lists of records, repeat steps, or chunk larger jobs." onClick={() => update('loopsOrBatching', !input.loopsOrBatching)} />
              <Toggle active={input.customApi} label="Custom APIs or webhooks" detail="The workflow needs more than prebuilt connector actions." onClick={() => update('customApi', !input.customApi)} />
              <Toggle active={input.aiSteps} label="AI steps" detail="Classification, extraction, enrichment, generation, or agentic decisions." onClick={() => update('aiSteps', !input.aiSteps)} />
              <Toggle active={input.humanApprovals} label="Human approvals" detail="A person must approve or review before important actions continue." onClick={() => update('humanApprovals', !input.humanApprovals)} />
              <Toggle active={input.filesOrDocuments} label="Files or documents" detail="PDFs, uploads, contracts, images, or document extraction are part of the flow." onClick={() => update('filesOrDocuments', !input.filesOrDocuments)} />
              <Toggle active={input.databaseWork} label="Database work" detail="The workflow reads or writes structured data beyond normal SaaS records." onClick={() => update('databaseWork', !input.databaseWork)} />
              <Toggle active={input.realtime} label="Near-real-time response" detail="Waiting several minutes would materially hurt the workflow." onClick={() => update('realtime', !input.realtime)} />
              <Toggle active={input.productLogic} label="This is becoming product / app logic" detail="Customer-facing state, transactions, or a custom interface depend on this logic." onClick={() => update('productLogic', !input.productLogic)} />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="tool-reveal">
            <div className="mb-6"><h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">What happens when it fails?</h2><p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">The cost of failure should influence architecture more than a feature checklist does.</p></div>
            <div className="border-y border-zinc-200 dark:border-zinc-800">
              <Field label="Failure impact"><Select value={input.failureImpact} onChange={(value) => update('failureImpact', value as AssessmentInput['failureImpact'])}><option value="low">Low — annoying, but easy to recover</option><option value="medium">Medium — someone may need to fix it</option><option value="high">High — customer, lead, or delivery impact</option><option value="critical">Critical — money, data integrity, or operations can be wrong</option></Select></Field>
              <Toggle active={input.duplicateUnsafe} label="Some actions must never happen twice" detail="Payments, duplicate opportunities, messages, or other irreversible actions." onClick={() => update('duplicateUnsafe', !input.duplicateUnsafe)} />
              <Toggle active={input.retriesRequired} label="Automatic retries are required" detail="Temporary API failures should recover without losing work." onClick={() => update('retriesRequired', !input.retriesRequired)} />
              <Toggle active={input.sensitiveData} label="Sensitive or regulated data" detail="PII, financial, health, contractual, or other restricted information moves through the workflow." onClick={() => update('sensitiveData', !input.sensitiveData)} />
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="tool-reveal">
            <div className="mb-6"><h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">What constraints actually matter?</h2><p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">Hard constraints eliminate platforms. Preferences only change the ranking.</p></div>
            <div className="border-y border-zinc-200 dark:border-zinc-800">
              <Field label="Self-hosting"><Select value={input.selfHosting} onChange={(value) => update('selfHosting', value as AssessmentInput['selfHosting'])}><option value="none">Not needed</option><option value="preferred">Preferred, but not mandatory</option><option value="required">Required — managed-only platforms are not acceptable</option></Select></Field>
              <Toggle active={input.crmCentered} label="Most workflows live around one CRM" detail="Contacts, pipelines, lifecycle, and ownership are the center of the system." onClick={() => update('crmCentered', !input.crmCentered)} />
              <Toggle active={input.microsoftFirst} label="Microsoft-first environment" detail="Microsoft 365, Dynamics, Azure, SharePoint, Teams, or desktop automation are central." onClick={() => update('microsoftFirst', !input.microsoftFirst)} />
              <Toggle active={input.governance} label="Formal governance matters" detail="Permissions, environments, auditability, and controlled publishing matter." onClick={() => update('governance', !input.governance)} />
            </div>
            <div className="mt-8">
              <div className="mb-3"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">What matters most?</p><p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">Choose up to three. The engine still applies hard constraints first.</p></div>
              <div className="grid gap-x-5 sm:grid-cols-2">
                {PRIORITIES.map((item) => {
                  const active = input.priorities.includes(item.id)
                  return <button key={item.id} type="button" onClick={() => togglePriority(item.id)} className="flex items-start gap-3 border-t border-zinc-200 py-3 text-left dark:border-zinc-800"><span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border ${active ? 'border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950' : 'border-zinc-300 dark:border-zinc-700'}`}>{active ? <CheckIcon className="h-2.5 w-2.5" /> : null}</span><span><span className="block text-sm text-zinc-900 dark:text-zinc-100">{item.label}</span><span className="mt-1 block text-xs leading-5 text-zinc-500 dark:text-zinc-500">{item.detail}</span></span></button>
                })}
              </div>
            </div>
          </div>
        ) : null}

        {isResult ? <ArchitectureResult input={input} /> : null}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <button type="button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-950 disabled:opacity-25 dark:hover:text-zinc-50"><ChevronLeftIcon className="h-4 w-4" />Back</button>
        {!isResult ? <button type="button" onClick={() => setStep((current) => Math.min(STEPS.length - 1, current + 1))} className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-zinc-50 dark:text-zinc-950">{step === STEPS.length - 2 ? 'Analyze architecture' : 'Continue'}<ChevronRightIcon className="h-4 w-4" /></button> : <button type="button" onClick={() => setStep(0)} className="text-sm text-zinc-500 transition-colors hover:text-zinc-950 dark:hover:text-zinc-50">Edit inputs</button>}
      </div>
    </section>
  )
}
