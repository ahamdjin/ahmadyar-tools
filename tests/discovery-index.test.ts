import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import test from 'node:test'
import { GET } from '../app/llms.txt/route'
import { UTILITIES } from '../lib/utilities/catalog'
import { TOOLS } from '../lib/tools'

test('generated tools reading index lists all tools and is not shadowed by an obsolete public file', async () => {
  assert.equal(existsSync('public/llms.txt'), false)
  const response = GET()
  assert.equal(response.headers.get('content-type'), 'text/plain; charset=utf-8')
  const content = await response.text()
  for (const tool of [...UTILITIES, ...TOOLS]) assert(content.includes(`/tool/${tool.slug}`), tool.slug)
  for (const path of ['/tool/sitemap.xml', '/integrations/llms.txt', '/blog', '/news/latest']) assert(content.includes(path), path)
})
