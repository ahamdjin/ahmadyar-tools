import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('Fazier launch badge is owned by the tools index, not the shared frame', () => {
  const frame = readFileSync('components/route-frame.tsx', 'utf8')
  const index = readFileSync('app/page.tsx', 'utf8')
  assert.doesNotMatch(frame, /PreFooterLaunchBadge/)
  assert.equal(index.match(/<PreFooterLaunchBadge\s*\/>/g)?.length, 1)
})

test('utility panels share aligned headers without promotional privacy copy', () => {
  const source = readFileSync('components/utilities/workbench.tsx', 'utf8')
  const css = readFileSync('components/utilities/workbench.css', 'utf8')
  assert.doesNotMatch(source, /Processed on your device|No API key|Your result belongs here|utility-local-label/)
  assert.match(css, /align-items:stretch/)
  assert.match(css, /utility-panel-heading[^}]*min-height:64px/)
  assert.match(css, /utility-options[^}]*align-items:start/)
  assert.match(css, /utility-field :is\(input,select\)[^}]*height:44px/)
  assert.match(source, /utility-secondary utility-option-action/)
  assert.match(css, /utility-option-action[^}]*align-self:end; height:44px/)
})
