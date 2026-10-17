import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const read = (file: string) => readFile(path.join(process.cwd(), file), 'utf8')

test('advisor uses a short three-step decision flow with common starting points', async () => {
  const source = await read('components/architecture-advisor.tsx')
  assert.match(source, /Architecture decision, not a platform quiz\./)
  assert.match(source, /About 3 minutes/)
  assert.match(source, /const STEPS: StepId\[\] = \['systems', 'shape', 'ownership', 'result'\]/)
  assert.match(source, /Common starting points/)
  assert.match(source, /CRM \+ sales operations/)
  assert.match(source, /Agency \/ client operations/)
  assert.match(source, /Ecommerce operations/)
  assert.match(source, /Microsoft-first business/)
  assert.match(source, /Product \/ internal software/)
  assert.match(source, /style=\{\{ width: `\$\{progress\}%` \}\}/)
})

test('advisor asks the architecture questions that materially change production fit', async () => {
  const source = await read('components/architecture-advisor.tsx')
  for (const phrase of [
    'Workflow portfolio',
    'Monthly workflow runs',
    'Custom APIs or webhooks',
    'Database / shared state',
    'Human approval gates',
    'Day-to-day owner',
    'Process stability',
    'Worst realistic failure',
    'Sensitive / regulated data',
    'Controlled publishing / governance',
  ]) assert.match(source, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
})

test('advisor result prioritizes a decision, reasons, next actions and uncertainty before raw scores', async () => {
  const source = await read('components/architecture-advisor.tsx')
  assert.match(source, /Why this landed here/)
  assert.match(source, /Do this next/)
  assert.match(source, /Architecture boundary/)
  assert.match(source, /What would change the answer\?/)
  assert.match(source, /Other viable options/)
  assert.match(source, /Technical comparison/)
  assert.match(source, /ToolResultActions/)
  assert.match(source, /Scores are comparative decision signals/)
})
