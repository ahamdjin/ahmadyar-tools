import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const read = (file: string) => readFile(path.join(process.cwd(), file), 'utf8')

test('advisor is a guided form with a single progress line instead of step tabs', async () => {
  const source = await read('components/architecture-advisor.tsx')
  assert.match(source, /style=\{\{ width: `\$\{progress\}%` \}\}/)
  assert.match(source, /Search HubSpot, Slack, Stripe, PostgreSQL/)
  assert.match(source, /Something missing\?/)
  assert.match(source, /Preliminary read/)
  assert.match(source, /Stress-test the recommendation/)
  assert.match(source, /Do not force every workflow onto one platform/)
  assert.doesNotMatch(source, /const STEPS/)
})

test('advisor exposes systems, portfolio, ownership, economics, workflow depth, and reliability inputs', async () => {
  const source = await read('components/architecture-advisor.tsx')
  for (const phrase of [
    'Which systems are in your world?',
    'Expected in 12–24 months',
    'Strongest day-to-day owner',
    'Automation software budget',
    'What makes the harder workflows hard?',
    'What happens when it breaks?',
    'Running an important action twice could cause damage',
    'Usage economics',
  ]) assert.match(source, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
})
