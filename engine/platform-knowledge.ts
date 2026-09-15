import type { PlatformId } from './types'

export type PlatformKnowledge = {
  strengths: string[]
  tradeoffs: string[]
  winsWhen: string[]
  strongWith: string[]
}

export const PRIMARY_NATIVE_PLATFORM_BY_APP: Partial<Record<string, PlatformId>> = {
  hubspot: 'hubspot-native',
  gohighlevel: 'gohighlevel-native',
  salesforce: 'salesforce-flow',
  shopify: 'shopify-flow',
}

export const PLATFORM_KNOWLEDGE: Record<PlatformId, PlatformKnowledge> = {
  'crm-native': {
    strengths: ['Keeps simple lifecycle logic close to the system of record.', 'Usually creates the least maintenance and the fewest moving parts.'],
    tradeoffs: ['Connector breadth and advanced cross-system logic depend on the CRM.', 'Can become awkward when the CRM is no longer the real center of the workflow.'],
    winsWhen: ['One CRM owns the process and the workflow is mostly lifecycle, routing, follow-up, or record updates.'],
    strongWith: ['zoho-crm', 'activecampaign', 'keap', 'freshsales', 'pipedrive', 'close'],
  },
  'hubspot-native': {
    strengths: ['Strong CRM-centered workflow automation, branching, lifecycle actions, and native customer data context.', 'Keeps sales, marketing, service, and CRM state together when HubSpot already owns the process.'],
    tradeoffs: ['Advanced cross-system orchestration and unusual APIs can justify a separate layer.', 'Capability depends on the HubSpot subscription and feature set in use.'],
    winsWhen: ['HubSpot is the source of truth and most automation is CRM, lifecycle, marketing, service, routing, or follow-up work.'],
    strongWith: ['hubspot', 'slack', 'gmail', 'google-sheets', 'typeform', 'calendly'],
  },
  'gohighlevel-native': {
    strengths: ['Very strong fit for lead capture, follow-up, appointments, pipeline, messaging, and agency-style CRM workflows.', 'Can extend native workflows with webhooks and custom code before another orchestration layer is necessary.'],
    tradeoffs: ['A large estate of unrelated business systems can outgrow a CRM-centered workflow model.', 'Complex data pipelines, product logic, or deep engineering workflows are better owned elsewhere.'],
    winsWhen: ['GoHighLevel is the operational CRM and most workflows revolve around leads, conversations, appointments, opportunities, and follow-up.'],
    strongWith: ['gohighlevel', 'facebook-leads', 'meta-ads', 'gmail', 'google-calendar', 'stripe'],
  },
  'salesforce-flow': {
    strengths: ['Strong native fit when Salesforce owns records, approvals, enterprise process state, and governed CRM automation.', 'Avoids copying core CRM business rules into a separate automation product.'],
    tradeoffs: ['Cross-system integration programs can still justify an iPaaS or API layer.', 'Administration and governance can be heavier than small-team automation tools.'],
    winsWhen: ['Salesforce is the source of truth and the company needs governed CRM process automation more than a lightweight connector tool.'],
    strongWith: ['salesforce', 'slack', 'tableau', 'docusign', 'workday'],
  },
  'shopify-flow': {
    strengths: ['Keeps straightforward commerce events and store operations inside Shopify.', 'Good fit when order, customer, inventory, merchandising, and store events are the center of gravity.'],
    tradeoffs: ['Broad back-office integration or complex data transformation can need an external platform.', 'Not a replacement for application code when commerce logic becomes stateful or transactional outside Shopify.'],
    winsWhen: ['Shopify is the central system and workflows mostly react to store events with simple operational actions.'],
    strongWith: ['shopify', 'klaviyo', 'gorgias', 'shipstation', 'google-sheets'],
  },
  zapier: {
    strengths: ['Excellent connector breadth for common SaaS tools.', 'Very approachable for business users and fast to ship for straightforward handoffs.'],
    tradeoffs: ['Long multi-step or high-volume workflows can create usage-cost pressure.', 'Less attractive when deep code, infrastructure control, or complex orchestration dominates.'],
    winsWhen: ['The team is nontechnical or lightly technical and the job is mainly connecting mainstream SaaS products quickly.'],
    strongWith: ['hubspot', 'typeform', 'slack', 'google-sheets', 'calendly', 'gmail', 'notion', 'airtable', 'mailchimp'],
  },
  make: {
    strengths: ['Strong visual control for routers, filters, transformations, loops, and multi-step operations.', 'Balances advanced workflow design with a visual operating model.'],
    tradeoffs: ['More workflow machinery than simple business handoffs need.', 'Credit usage grows with module activity, loops, polling, and record-heavy scenarios.'],
    winsWhen: ['A visual builder is important and workflows have meaningful branching, transformations, routers, or batching.'],
    strongWith: ['airtable', 'shopify', 'google-sheets', 'slack', 'quickbooks', 'notion', 'woocommerce'],
  },
  'n8n-cloud': {
    strengths: ['Deep API and transformation flexibility without having to operate the runtime.', 'Strong for technical automation, AI workflows, reusable orchestration, and data-heavy logic.'],
    tradeoffs: ['Can be unnecessary complexity for basic SaaS handoffs.', 'Still needs a capable owner who can debug APIs, data, credentials, and workflow logic.'],
    winsWhen: ['API-heavy orchestration matters and an automation specialist or developer is available, but managed hosting is preferred.'],
    strongWith: ['postgresql', 'supabase', 'openai', 'github', 'hubspot', 'slack', 'stripe'],
  },
  'n8n-self-hosted': {
    strengths: ['Deep orchestration plus control over runtime and infrastructure.', 'Attractive when high-volume execution, APIs, and self-hosting are genuine requirements.'],
    tradeoffs: ['The team owns upgrades, monitoring, backups, scaling, credentials, and incident recovery.', 'A poor fit when no technical owner exists.'],
    winsWhen: ['Self-hosting is required or strongly valued and a technical team can own a complex automation runtime.'],
    strongWith: ['postgresql', 'supabase', 'openai', 'github', 'aws', 'cloudflare', 'redis'],
  },
  'power-automate': {
    strengths: ['Strongest natural fit for Microsoft 365, Dynamics, SharePoint, Teams, Azure, and governed business automation.', 'Enterprise identity, approvals, desktop automation, and Microsoft governance can outweigh generic connector breadth.'],
    tradeoffs: ['Licensing and connector context can be complex.', 'Less compelling when the company is not Microsoft-centered.'],
    winsWhen: ['Microsoft is an environment constraint rather than merely another app in the stack.'],
    strongWith: ['dynamics-365', 'microsoft-teams', 'sharepoint', 'onedrive', 'excel', 'outlook', 'azure', 'business-central'],
  },
  activepieces: {
    strengths: ['Open-source, self-hostable automation with a visual/no-code orientation.', 'Can be a better ownership compromise than deeper developer-centric self-hosted tools.'],
    tradeoffs: ['Connector depth must be checked for the exact systems involved.', 'Self-hosting still creates infrastructure responsibility.'],
    winsWhen: ['Self-hosting/control matters, the workflows are not extremely code-heavy, and an automation-capable owner wants a visual platform.'],
    strongWith: ['google-sheets', 'slack', 'openai', 'postgresql', 'github', 'hubspot'],
  },
  pipedream: {
    strengths: ['Developer-friendly event workflows with code and API flexibility.', 'Good bridge between integration components and normal application code.'],
    tradeoffs: ['Not designed primarily for nontechnical business ownership.', 'Less purpose-built than durable job systems when long-running task orchestration is the main problem.'],
    winsWhen: ['Developers own event/API integrations and want code-first control without building the entire integration runtime themselves.'],
    strongWith: ['github', 'vercel', 'stripe', 'openai', 'postgresql', 'supabase', 'cloudflare'],
  },
  'trigger-dev': {
    strengths: ['Purpose-built for durable TypeScript background jobs, queues, retries, schedules, long-running work, and production observability.', 'Strong fit for AI agents and application-owned async work that belongs in the codebase.'],
    tradeoffs: ['Developer-first rather than a business-user visual automation tool.', 'It is not the right choice when the real need is simply connecting many SaaS apps with prebuilt actions.'],
    winsWhen: ['A TypeScript/developer team needs durable background jobs, queues, retries, long-running AI/application tasks, or controlled concurrency.'],
    strongWith: ['vercel', 'github', 'openai', 'anthropic', 'stripe', 'postgresql', 'supabase', 'sentry'],
  },
  workato: {
    strengths: ['Strong enterprise integration, governance, lifecycle controls, and cross-functional automation.', 'Fits broad portfolios spanning finance, HR, ERP, CRM, and operations.'],
    tradeoffs: ['Enterprise procurement and cost are difficult to justify for small automation estates.', 'Can be excessive when a smaller self-serve platform solves the actual problem.'],
    winsWhen: ['A large multi-department automation program needs enterprise governance and broad business-system connectivity.'],
    strongWith: ['salesforce', 'netsuite', 'workday', 'sap', 'snowflake', 'quickbooks', 'jira'],
  },
  tray: {
    strengths: ['Composable enterprise integration with strong API and reusable-service orientation.', 'Useful for technical integration teams building shared capabilities across departments or products.'],
    tradeoffs: ['Enterprise procurement and technical ownership are significant.', 'Overkill for straightforward departmental automations.'],
    winsWhen: ['An enterprise integration team needs reusable API-led automation and composable services across many systems.'],
    strongWith: ['salesforce', 'snowflake', 'netsuite', 'postgresql', 'github', 'stripe'],
  },
  mulesoft: {
    strengths: ['Deep enterprise API management, governed integration architecture, and legacy/ERP connectivity.', 'Appropriate when APIs and integration architecture are strategic infrastructure.'],
    tradeoffs: ['High implementation and operating overhead.', 'Not appropriate for ordinary small-business or departmental workflow automation.'],
    winsWhen: ['The organization is solving enterprise API architecture, legacy integration, and governance at scale rather than a collection of simple workflows.'],
    strongWith: ['salesforce', 'sap', 'netsuite', 'workday', 'aws', 'azure', 'snowflake'],
  },
  'custom-code': {
    strengths: ['Owns stateful, transactional, latency-sensitive, or customer-facing domain logic cleanly.', 'Maximum control over data models, interfaces, testing, performance, and reliability boundaries.'],
    tradeoffs: ['Creates engineering, testing, observability, deployment, and on-call ownership.', 'Wasteful when standard platforms already solve the process safely.'],
    winsWhen: ['The core has become software: persistent state, transactions, bespoke UI, product behavior, or domain logic that should be tested and versioned as an application.'],
    strongWith: ['postgresql', 'redis', 'stripe', 'github', 'sentry', 'vercel', 'aws'],
  },
}

export function getPlatformKnowledge(id: PlatformId) {
  return PLATFORM_KNOWLEDGE[id]
}

export function appAffinityBonus(id: PlatformId, selectedApps: string[]) {
  const knowledge = PLATFORM_KNOWLEDGE[id]
  const matches = knowledge.strongWith.filter((app) => selectedApps.includes(app)).length
  return Math.min(8, matches * 2)
}
