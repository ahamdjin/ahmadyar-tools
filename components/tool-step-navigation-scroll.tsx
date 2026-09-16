'use client'

import { useEffect } from 'react'

const ARCHITECTURE_NAV_LABELS = new Set([
  'Continue',
  'Back',
  'Start over',
  'Edit answers',
  'Edit stack',
  'Edit portfolio',
])

export function ToolStepNavigationScroll() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const button = target.closest('button')
      if (!(button instanceof HTMLButtonElement) || button.disabled) return

      const workspace = button.closest('.advisor-workspace')
      if (!(workspace instanceof HTMLElement)) return

      const label = button.textContent?.trim() ?? ''
      if (!ARCHITECTURE_NAV_LABELS.has(label)) return

      const calculator = workspace.querySelector(':scope > section')
      if (!(calculator instanceof HTMLElement)) return

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
          calculator.scrollIntoView({ behavior, block: 'start' })
        })
      })
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
