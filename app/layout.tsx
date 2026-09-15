import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import './globals.css'
import { RouteFrame } from '@/components/route-frame'
import { ThemeProvider } from '@/components/theme-provider'
import { SITE } from '@/lib/site'

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
  title: { default: 'Automation Tools | Ahmad Yar', template: '%s | Ahmad Yar' },
  description: 'Practical automation architecture, CRM, onboarding, and lead-routing tools by Ahmad Yar.',
  alternates: { canonical: '/tools' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} bg-white tracking-tight antialiased dark:bg-zinc-950`}>
        <ThemeProvider>
          <RouteFrame>{children}</RouteFrame>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
