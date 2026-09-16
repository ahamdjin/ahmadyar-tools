'use client'

import { useCallback, useRef } from 'react'

export function useStepScroll() {
  const rootRef = useRef<HTMLElement | null>(null)

  const scrollToStart = useCallback(() => {
    if (typeof window === 'undefined') return
    window.requestAnimationFrame(() => {
      const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      rootRef.current?.scrollIntoView({ behavior, block: 'start' })
    })
  }, [])

  return { rootRef, scrollToStart }
}
