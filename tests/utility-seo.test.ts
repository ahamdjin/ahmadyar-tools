import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { UTILITIES } from '../lib/utilities/catalog'
import { UTILITY_SEO, toolImage, utilityMetadata } from '../lib/tools-seo'
import sitemap from '../app/sitemap'

test('each browser utility has unique metadata and matching canonical/social URLs', () => {
  const titles = new Set<string>()
  const descriptions = new Set<string>()
  for (const tool of UTILITIES) {
    const seo = UTILITY_SEO[tool.slug]
    titles.add(seo.title); descriptions.add(seo.description)
    assert(seo.title.length + ' | Ahmad Yar'.length <= 70)
    assert(seo.description.length >= 100 && seo.description.length <= 175)
    const metadata = utilityMetadata(tool.slug)
    const url = `https://www.ahmadyar.co/tool/${tool.slug}`
    assert.equal(metadata.alternates?.canonical, url)
    assert.equal(metadata.openGraph?.url, url)
    assert(metadata.twitter && 'card' in metadata.twitter && metadata.twitter.card === 'summary_large_image')
    assert.equal(toolImage(tool.slug).width, 1200)
    assert.equal(toolImage(tool.slug).height, 630)
    assert(toolImage(tool.slug).url.startsWith('https://www.ahmadyar.co/tool/share-image?tool='))
    assert(toolImage(tool.slug).alt.includes(tool.title))
    assert(sitemap().some((item) => item.url === url))
  }
  assert.equal(titles.size, 7); assert.equal(descriptions.size, 7)
  assert.equal(sitemap().length, 14)
  assert(!sitemap().some((entry) => entry.url.includes('share-image')))
})

test('utility schema stays factual and processing/limitations remain discoverable', () => {
  const page = readFileSync('components/utilities/utility-page.tsx', 'utf8')
  assert.match(page, /WebApplication/)
  assert.match(page, /BreadcrumbList/)
  assert.doesNotMatch(page, /aggregateRating|ratingValue|reviewCount/)
  assert.match(page, /Supported formats & limits/)
  assert.match(page, /Data handling/)
  assert.match(page, /Related tools/)
  assert.match(page, /UTILITY_SEO/)
})
