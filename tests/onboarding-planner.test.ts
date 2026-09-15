import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { analyzeOnboarding, DEFAULT_ONBOARDING_INPUT, type OnboardingInput } from '../engine/onboarding'

function input(overrides: Partial<OnboardingInput> = {}): OnboardingInput {
  return { ...DEFAULT_ONBOARDING_INPUT, ...overrides }
}

test('strong standardized onboarding scores as ready without invented critical leaks', () => {
  const result = analyzeOnboarding(input({
    crmId: 'hubspot',
    contractAppId: 'docusign',
    billingAppId: 'stripe',
    projectAppId: 'clickup',
    intakeAppId: 'typeform',
    communicationAppId: 'gmail',
    fileAppId: 'google-drive',
    triggerMode: 'compound',
    requireWon: true,
    requireSigned: true,
    requirePaid: true,
    processRepeatability: 3,
    handoffData: 3,
    intakeQuality: 3,
    accessComplexity: 'multi',
    accessTracking: 3,
    workspaceTemplate: 3,
    clientWelcome: 3,
    kickoffScheduling: 3,
    ownerAssignment: 3,
    reminders: 3,
    readinessGate: 3,
    duplicateProtection: 3,
    exceptionHandling: 3,
    monitoring: 3,
  }))

  assert.ok(result.score >= 80)
  assert.match(result.status, /Ready to automate|Good foundation/)
  assert.equal(result.issues.some((issue) => issue.severity === 'critical'), false)
})

test('payment prerequisite without an authoritative billing system is called out', () => {
  const result = analyzeOnboarding(input({
    crmId: 'hubspot',
    triggerMode: 'compound',
    requireWon: true,
    requirePaid: true,
    billingAppId: null,
  }))

  assert.ok(result.issues.some((issue) => issue.id === 'payment-source'))
  assert.ok(result.nextQuestions.some((question) => /payment/i.test(question)))
})

test('variable bespoke onboarding recommends standardization before deeper automation', () => {
  const result = analyzeOnboarding(input({
    crmId: 'salesforce',
    monthlyClients: 40,
    serviceVariants: 12,
    processRepeatability: 0,
    workspaceTemplate: 0,
    readinessGate: 0,
    exceptionHandling: 0,
  }))

  assert.ok(result.issues.some((issue) => issue.id === 'standardize-first'))
  assert.ok(result.score < 65)
})

test('external payment or contract events require duplicate-safe creation', () => {
  const result = analyzeOnboarding(input({
    crmId: 'gohighlevel',
    billingAppId: 'stripe',
    triggerMode: 'payment-received',
    requirePaid: true,
    duplicateProtection: 0,
  }))

  assert.ok(result.issues.some((issue) => issue.id === 'duplicates'))
  assert.ok(result.safeguards.some((item) => /duplicate|retry/i.test(item)))
})

test('onboarding route uses the dedicated planner and crawlable guide inside the portfolio frame', () => {
  const page = readFileSync('app/[slug]/page.tsx', 'utf8')
  const routeFrame = readFileSync('components/route-frame.tsx', 'utf8')
  const css = readFileSync('app/globals.css', 'utf8')
  const guide = readFileSync('components/onboarding-seo-content.tsx', 'utf8')

  assert.match(page, /client-onboarding-automation-planner/)
  assert.match(page, /<OnboardingPlanner \/>/)
  assert.match(page, /<OnboardingSeoContent \/>/)
  assert.match(page, /ONBOARDING_FAQS/)
  assert.match(routeFrame, /max-w-screen-sm/)
  assert.doesNotMatch(routeFrame, /IMMERSIVE_TOOL_PATHS/)
  assert.match(css, /\.onboarding-viewport/)
  assert.match(css, /\.onboarding-workspace > \.onboarding-planner/)
  assert.match(guide, /ready-for-delivery/i)
  assert.match(guide, /idempotent|duplicate protection/i)
})
