import type { MetadataRoute } from 'next'

import { SITE } from '@/lib/site'
import { TOOLS } from '@/lib/tools'
import { UTILITIES } from '@/lib/utilities/catalog'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE.origin}${SITE.toolsPath}`,
      lastModified: new Date('2026-11-17T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...TOOLS.map((tool) => ({
      url: `${SITE.origin}${SITE.toolsPath}/${tool.slug}`,
      lastModified: new Date('2026-11-17T00:00:00Z'),
      changeFrequency: 'monthly' as const,
      priority: tool.slug === 'automation-architecture-advisor' ? 0.9 : 0.8,
    })),
    ...UTILITIES.map((tool) => ({ url: `${SITE.origin}${SITE.toolsPath}/${tool.slug}`, lastModified: new Date('2026-11-17T00:00:00Z') })),
  ]
}
