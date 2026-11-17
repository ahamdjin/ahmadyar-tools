import { ImageResponse } from 'next/og'
import { UTILITIES } from '@/lib/utilities/catalog'
import { TOOLS } from '@/lib/tools'

export const runtime = 'nodejs'
export function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get('tool')
  const tool = [...UTILITIES, ...TOOLS].find((item) => item.slug === slug)
  if (slug !== null && !tool) return new Response('Unknown tool', { status: 404 })
  return new ImageResponse(<div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', padding: 72, background: '#09090b', color: '#fafafa', fontFamily: 'sans-serif' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, color: '#a1a1aa' }}><span>Ahmad Yar</span><span>Tools</span></div>
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}><div style={{ display: 'flex', fontSize: 60, lineHeight: 1.15 }}>{tool?.title || 'Automation & browser tools'}</div><div style={{ display: 'flex', fontSize: 28, color: '#a1a1aa', marginTop: 28 }}>{tool ? 'A practical tool for your next workflow.' : 'JSON, schedules, API requests, CSV and text.'}</div></div>
    <div style={{ display: 'flex', fontSize: 24, color: '#a1a1aa' }}>ahmadyar.co/tool</div>
  </div>, { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=3600' } })
}
