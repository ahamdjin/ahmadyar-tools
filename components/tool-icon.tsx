import type { LucideIcon } from 'lucide-react'
import {
  CalculatorIcon,
  GitBranchIcon,
  HeartPulseIcon,
  MessageCircleIcon,
  UserCheckIcon,
  WorkflowIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  'automation-architecture-advisor': WorkflowIcon,
  'crm-automation-health-check': HeartPulseIcon,
  'client-onboarding-automation-planner': UserCheckIcon,
  'lead-routing-rules-builder': GitBranchIcon,
  'automation-roi-calculator': CalculatorIcon,
  'lead-follow-up-automation-planner': MessageCircleIcon,
}

export function ToolIcon({ slug, className = 'h-4 w-4' }: { slug: string; className?: string }) {
  const Icon = ICONS[slug] ?? WorkflowIcon
  return <Icon aria-hidden="true" className={className} strokeWidth={1.8} />
}
