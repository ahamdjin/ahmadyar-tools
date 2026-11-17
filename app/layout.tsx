import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import './globals.css'
import './advisor-rebuild.css'
import './tool-polish.css'
import './crm-polish-v2.css'
import './onboarding-polish-v2.css'
import './routing-polish-v2.css'
import './roi-polish.css'
import './followup-polish.css'
import './experience-pass.css'
import './visual-pass-v4.css'
import { RouteFrame } from '@/components/route-frame'
import { ThemeProvider } from '@/components/theme-provider'
import { ToolStepNavigationScroll } from '@/components/tool-step-navigation-scroll'
import { SITE } from '@/lib/site'
import { toolImage } from '@/lib/tools-seo'

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE.origin),
  title: { default: 'Free Automation & Browser Tools | Ahmad Yar', template: '%s | Ahmad Yar' },
  description: 'Free browser tools for JSON repair, cron schedules, API requests, CSV mapping and regex extraction, alongside six automation planning tools.',
  alternates: { canonical: SITE.toolsPath },
  icons: {
    icon: `${SITE.origin}/favicon-light.png?v=4`,
    apple: `${SITE.origin}/favicon-light.png?v=4`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'Free Automation & Browser Tools | Ahmad Yar',
    description: 'JSON repair, cron schedules, API requests, CSV mapping and regex extraction, plus practical automation planning tools.',
    url: `${SITE.origin}${SITE.toolsPath}`,
    siteName: SITE.name,
    type: 'website',
    images: [toolImage()],
  },
  twitter: {
    card: 'summary_large_image',
    images: [toolImage()],
    title: 'Free Automation & Browser Tools | Ahmad Yar',
    description: 'JSON repair, cron schedules, API requests, CSV mapping and regex extraction, plus practical automation planning tools.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} bg-white tracking-tight antialiased dark:bg-zinc-950`}>
        <ThemeProvider>
          <ToolStepNavigationScroll />
          <RouteFrame>{children}</RouteFrame>
        </ThemeProvider>
        {process.env.VERCEL === '1' ? <Analytics /> : null}
      </body>
    </html>
  )
}
