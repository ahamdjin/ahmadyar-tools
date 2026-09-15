import type { MetadataRoute } from 'next'

import { SITE } from '@/lib/site'
import { TOOLS } from '@/lib/tools'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date('2026-09-16T00:00:00.000Z')
  return [
    {
      url: `${SITE.origin}${SITE.toolsPath}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...TOOLS.map((tool) => ({
      url: `${SITE.origin}${SITE.toolsPath}/${tool.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: tool.slug === 'automation-architecture-advisor' ? 0.9 : 0.8,
    })),
  ]
}
