import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import './globals.css'
import { SiteFooter, SiteHeader } from '@/components/site-shell'
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
          <div className="min-h-screen w-full font-[family-name:var(--font-geist)]">
            <div className="mx-auto flex min-h-screen w-full max-w-screen-sm flex-col px-4 pt-8 sm:px-5 sm:pt-14 md:pt-20">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
