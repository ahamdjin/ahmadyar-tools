import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const layout = readFileSync('app/layout.tsx', 'utf8')
const bridge = readFileSync('components/tool-step-navigation-scroll.tsx', 'utf8')

test('Architecture Advisor step navigation returns to the calculator top', () => {
  assert.match(layout, /<ToolStepNavigationScroll \/>/)
  assert.match(bridge, /button\.closest\('\.advisor-workspace'\)/)
  assert.match(bridge, /ARCHITECTURE_NAV_LABELS/)
  assert.match(bridge, /'Continue'/)
  assert.match(bridge, /querySelector\(':scope > section'\)/)
  assert.match(bridge, /scrollIntoView\(\{ behavior, block: 'start' \}\)/)
})
