import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const page = readFileSync('app/[slug]/page.tsx', 'utf8')
const indexPage = readFileSync('app/page.tsx', 'utf8')
const css = readFileSync('app/globals.css', 'utf8')
const advisorCss = readFileSync('app/advisor-rebuild.css', 'utf8')
const experienceCss = readFileSync('app/experience-pass.css', 'utf8')
const visualCss = readFileSync('app/visual-pass-v4.css', 'utf8')
const layout = readFileSync('app/layout.tsx', 'utf8')
const guide = readFileSync('components/advisor-seo-content.tsx', 'utf8')
const routeFrame = readFileSync('components/route-frame.tsx', 'utf8')
const shell = readFileSync('components/site-shell.tsx', 'utf8')
const roiCalculator = readFileSync('components/automation-roi-calculator.tsx', 'utf8')
const followUp = readFileSync('components/lead-follow-up-planner.tsx', 'utf8')
const toolIcon = readFileSync('components/tool-icon.tsx', 'utf8')
const stepScroll = readFileSync('components/use-step-scroll.ts', 'utf8')

test('tool suite uses normal-flow application stages inside a wide route frame', () => {
  assert.match(page, /className="advisor-workspace"[\s\S]*<ArchitectureAdvisor \/>/)
  assert.match(layout, /<RouteFrame>\{children\}<\/RouteFrame>/)
  assert.match(layout, /import '\.\/experience-pass\.css'/)
  assert.match(layout, /import '\.\/visual-pass-v4\.css'/)
  assert.match(routeFrame, /max-w-none/)
  assert.doesNotMatch(routeFrame, /max-w-screen-sm/)
  assert.match(routeFrame, /site-main min-w-0 w-full flex-1/)
  assert.match(routeFrame, /<SiteHeader \/>/)
  assert.match(routeFrame, /<SiteFooter \/>/)

  assert.match(css, /\.advisor-viewport,[\s\S]*\.followup-viewport\s*\{[^}]*width:\s*100%/)
  assert.doesNotMatch(css, /^\s*left:\s*50%/m)
  assert.doesNotMatch(css, /^\s*translate:\s*-50% 0/m)
  assert.match(css, /\.crm-health-viewport\s*\{\s*max-width:\s*1220px/)
  assert.match(css, /\.onboarding-viewport\s*\{\s*max-width:\s*1240px/)
  assert.match(css, /\.routing-viewport\s*\{\s*max-width:\s*1180px/)
  assert.match(css, /\.roi-viewport\s*\{\s*max-width:\s*1180px/)
  assert.match(css, /\.followup-viewport\s*\{\s*max-width:\s*1220px/)
  assert.match(css, /\.crm-health-workspace > \.crm-health-check\s*\{[^}]*max-width:\s*1060px/)
  assert.match(css, /\.onboarding-workspace > \.onboarding-planner\s*\{[^}]*max-width:\s*1080px/)
  assert.match(css, /\.routing-workspace > \.routing-check\s*\{[^}]*max-width:\s*1020px/)
  assert.match(css, /\.roi-workspace > \.roi-calculator\s*\{[^}]*max-width:\s*1040px/)
  assert.match(css, /\.followup-workspace > \.followup-check\s*\{[^}]*max-width:\s*1060px/)
  assert.match(css, /body\s*\{[^}]*overflow-x:\s*clip/)
})

test('Architecture Advisor keeps its proven centered rebuild without viewport breakout', () => {
  assert.match(advisorCss, /\.advisor-viewport\s*\{[^}]*width:\s*100% !important/)
  assert.match(advisorCss, /\.advisor-viewport\s*\{[^}]*max-width:\s*1600px !important/)
  assert.match(advisorCss, /\.advisor-toolbar\s*\{[^}]*width:\s*min\(100%, 1180px\) !important/)
  assert.match(advisorCss, /\.advisor-workspace\s*\{[^}]*width:\s*min\(100%, 1180px\) !important/)
  assert.match(advisorCss, /\.advisor-workspace > section\s*\{[^}]*max-width:\s*960px !important/)
  assert.match(advisorCss, /grid-template-columns:\s*minmax\(180px, 230px\) minmax\(0, 1fr\)/)
  assert.match(advisorCss, /grid-template-columns:\s*minmax\(0, 1fr\) 180px/)
  assert.match(advisorCss, /@container \(max-width: 720px\)/)
  assert.doesNotMatch(advisorCss, /^\s*left:\s*50%/m)
  assert.doesNotMatch(advisorCss, /^\s*translate:\s*-50% 0/m)
})

test('public tools shell stays centered and the index uses the shared icon library', () => {
  assert.match(shell, /site-header[^"\n]*max-w-screen-sm/)
  assert.match(shell, /site-footer[^"\n]*max-w-screen-sm/)
  assert.match(shell, /assets\/ahmad-profile\.webp/)
  assert.match(indexPage, /tools-index tool-reveal mx-auto w-full max-w-screen-sm/)
  assert.match(indexPage, /tool-index-card/)
  assert.match(indexPage, /rounded-\[22px\] bg-zinc-50/)
  assert.match(indexPage, /<ToolIcon slug=\{tool\.slug\}/)
  assert.match(toolIcon, /WorkflowIcon/)
  assert.match(toolIcon, /HeartPulseIcon/)
  assert.match(toolIcon, /CalculatorIcon/)
  assert.doesNotMatch(indexPage, /border-y/)
  assert.doesNotMatch(indexPage, /divide-y/)
})

test('tool workspaces use one document scroll instead of hidden nested scrolling', () => {
  assert.match(experienceCss, /\.advisor-viewport,[\s\S]*\.followup-viewport\s*\{[^}]*height:\s*auto !important/)
  assert.match(experienceCss, /\.advisor-viewport,[\s\S]*\.followup-viewport\s*\{[^}]*overflow:\s*visible !important/)
  assert.match(experienceCss, /\.advisor-workspace > section > div:nth-child\(2\),[\s\S]*\.followup-check > div:nth-child\(2\)\s*\{[^}]*overflow:\s*visible !important/)
  assert.match(experienceCss, /position:\s*sticky/)
  assert.match(experienceCss, /bottom:\s*max\(12px, env\(safe-area-inset-bottom\)\)/)
  assert.match(visualCss, /floating control/)
})

test('ROI calculator uses short decision steps and returns to the calculator top on navigation', () => {
  assert.match(roiCalculator, /type PageId = 'volume' \| 'baseline' \| 'automation' \| 'risk' \| 'cost' \| 'result'/)
  assert.match(roiCalculator, /pages: PageId\[\] = \['volume', 'baseline', 'automation', 'risk', 'cost', 'result'\]/)
  assert.match(roiCalculator, /Step \$\{index \+ 1\} of \$\{answerStepCount\}/)
  assert.match(roiCalculator, /roi-calculator scroll-mt-6 grid min-h-0 min-w-0/)
  assert.match(roiCalculator, /useStepScroll\(\)/)
  assert.match(roiCalculator, /const goTo = \(nextPage: PageId\) => \{ setPage\(nextPage\); scrollToStart\(\) \}/)
  assert.match(stepScroll, /scrollIntoView\(\{ behavior, block: 'start' \}\)/)
  assert.doesNotMatch(roiCalculator, /overflow-y-auto/)
  assert.match(roiCalculator, /sm:grid-cols-\[210px_minmax\(0,1fr\)\]/)
  assert.match(roiCalculator, /mt-4 grid min-w-0 gap-3 sm:grid-cols-2/)
  assert.match(roiCalculator, /break-words[^"\n]*\[overflow-wrap:anywhere\]/)
  assert.match(roiCalculator, /CircleDollarSignIcon/)
  assert.match(roiCalculator, /ShieldCheckIcon/)
})

test('latest visual pass removes unnecessary question-card chrome across the suite', () => {
  assert.match(visualCss, /\.crm-health-check fieldset\s*\{[^}]*background:\s*transparent !important/)
  assert.match(visualCss, /\.onboarding-planner button\.rounded-xl,[\s\S]*box-shadow:\s*none !important/)
  assert.match(visualCss, /\.routing-check button\.rounded-lg,[\s\S]*box-shadow:\s*none !important/)
  assert.match(visualCss, /\.followup-check > div:nth-child\(2\) \.grid\.py-4\s*\{[^}]*background:\s*transparent !important/)
  assert.match(visualCss, /selected choices and[\s\S]*output cards keep enough shape/)
})

test('follow-up planner reflows fields, channels and navigation instead of clipping', () => {
  assert.match(followUp, /followup-check grid h-full min-h-0 min-w-0/)
  assert.match(followUp, /sm:grid-cols-\[210px_minmax\(0,1fr\)\]/)
  assert.match(followUp, /Channels[\s\S]*grid min-w-0 gap-2 sm:grid-cols-2/)
  assert.match(followUp, /flex min-w-0 flex-wrap items-center justify-between/)
})

test('tool typography cannot exceed the portfolio display ceiling', () => {
  assert.match(css, /font-size:\s*3rem !important/)
})

test('guidance uses a restrained editorial layout instead of large SEO slabs', () => {
  assert.match(page, /<AdvisorSeoContent \/>/)
  assert.ok(page.indexOf('<AdvisorSeoContent />') > page.indexOf('<ArchitectureAdvisor />'))
  assert.match(page, /SoftwareApplication/)
  assert.match(page, /FAQPage/)
  assert.match(page, /BreadcrumbList/)
  assert.match(page, /price:\s*'0'/)
  assert.match(experienceCss, /counter-increment:\s*guide-section/)
  assert.match(experienceCss, /text-wrap:\s*balance/)
  assert.match(experienceCss, /text-wrap:\s*pretty/)
  assert.match(visualCss, /width:\s*min\(100%, 900px\) !important/)
  assert.match(visualCss, /background:\s*transparent !important/)
  assert.match(visualCss, /Cards are reserved for things a reader may want to scan/)
})

test('tool canonicals use the shared singular /tool path', () => {
  assert.match(page, /const canonical = `\$\{SITE\.origin\}\$\{SITE\.toolsPath\}\/\$\{tool\.slug\}`/)
  assert.match(page, /name: 'Tools', item: `\$\{SITE\.origin\}\$\{SITE\.toolsPath\}`/)
  assert.doesNotMatch(page, /SITE\.origin\}\/tools/)
})

test('search and AI guidance covers native, no-code, orchestration, durable jobs, and software', () => {
  for (const term of ['HubSpot', 'GoHighLevel', 'Zapier', 'Make', 'n8n', 'Trigger.dev', 'Power Automate', 'Pipedream', 'Activepieces', 'Workato', 'Tray.ai', 'MuleSoft', 'Custom software']) {
    assert.match(guide, new RegExp(term.replace('.', '\\.'), 'i'), `expected guide to cover ${term}`)
  }
  assert.match(guide, /Five layers that keep automation maintainable/)
  assert.match(guide, /The right answer changes with the shape of the business/)
  assert.match(guide, /Hard constraints first\. Trade-offs second\./)
})
