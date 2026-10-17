'use client'

import { useRef } from 'react'

export function useToolStepNavigation() {
  const rootRef = useRef<HTMLElement>(null)

  const scrollToStart = () => {
    window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
      rootRef.current?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      })
    })
  }

  return { rootRef, scrollToStart }
}
