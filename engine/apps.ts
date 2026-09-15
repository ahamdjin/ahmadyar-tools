export type AppCategory =
  | 'crm'
  | 'marketing'
  | 'forms'
  | 'communication'
  | 'project'
  | 'finance'
  | 'commerce'
  | 'data'
  | 'developer'
  | 'support'
  | 'ads'
  | 'web'
  | 'ai'
  | 'hr'
  | 'calendar'
  | 'documents'
  | 'automation'
  | 'erp'

export type ConnectivityClass = 'mainstream' | 'api-first' | 'enterprise' | 'limited' | 'native-heavy' | 'microsoft'

export type AppDefinition = {
  id: string
  name: string
  category: AppCategory
  icon: string | null
  vendor: string
  connectivity: ConnectivityClass
  nativeAutomation: number
}

type AppRow = readonly [string, string, AppCategory, string, string, ConnectivityClass]

const RAW_APPS: readonly AppRow[] = [
  ['hubspot', 'HubSpot', 'crm', 'hubspot', 'hubspot', 'native-heavy'],
  ['salesforce', 'Salesforce', 'crm', 'salesforce', 'salesforce', 'native-heavy'],
  ['gohighlevel', 'GoHighLevel', 'crm', '', 'gohighlevel', 'native-heavy'],
  ['pipedrive', 'Pipedrive', 'crm', 'pipedrive', 'pipedrive', 'mainstream'],
  ['zoho-crm', 'Zoho CRM', 'crm', 'zoho', 'zoho', 'native-heavy'],
  ['close', 'Close', 'crm', 'close', 'close', 'mainstream'],
  ['activecampaign', 'ActiveCampaign', 'crm', 'activecampaign', 'activecampaign', 'native-heavy'],
  ['keap', 'Keap', 'crm', 'keap', 'keap', 'native-heavy'],
  ['copper', 'Copper', 'crm', '', 'copper', 'mainstream'],
  ['freshsales', 'Freshsales', 'crm', 'freshworks', 'freshworks', 'native-heavy'],
  ['dynamics-365', 'Microsoft Dynamics 365', 'crm', 'dynamics365', 'microsoft', 'microsoft'],
  ['attio', 'Attio', 'crm', 'attio', 'attio', 'api-first'],
  ['insightly', 'Insightly', 'crm', '', 'insightly', 'mainstream'],
  ['nutshell', 'Nutshell', 'crm', '', 'nutshell', 'mainstream'],

  ['mailchimp', 'Mailchimp', 'marketing', 'mailchimp', 'intuit', 'mainstream'],
  ['klaviyo', 'Klaviyo', 'marketing', 'klaviyo', 'klaviyo', 'api-first'],
  ['brevo', 'Brevo', 'marketing', 'brevo', 'brevo', 'mainstream'],
  ['kit', 'Kit', 'marketing', 'convertkit', 'kit', 'mainstream'],
  ['marketo', 'Adobe Marketo', 'marketing', 'marketo', 'adobe', 'enterprise'],
  ['pardot', 'Salesforce Account Engagement', 'marketing', 'salesforce', 'salesforce', 'enterprise'],
  ['customerio', 'Customer.io', 'marketing', 'customerio', 'customerio', 'api-first'],
  ['braze', 'Braze', 'marketing', 'braze', 'braze', 'enterprise'],
  ['iterable', 'Iterable', 'marketing', 'iterable', 'iterable', 'enterprise'],
  ['constant-contact', 'Constant Contact', 'marketing', 'constantcontact', 'constantcontact', 'mainstream'],

  ['typeform', 'Typeform', 'forms', 'typeform', 'typeform', 'mainstream'],
  ['jotform', 'Jotform', 'forms', 'jotform', 'jotform', 'mainstream'],
  ['tally', 'Tally', 'forms', 'tally', 'tally', 'mainstream'],
  ['google-forms', 'Google Forms', 'forms', 'googleforms', 'google', 'mainstream'],
  ['microsoft-forms', 'Microsoft Forms', 'forms', 'microsoft', 'microsoft', 'microsoft'],
  ['gravity-forms', 'Gravity Forms', 'forms', 'gravityforms', 'wordpress', 'mainstream'],
  ['wufoo', 'Wufoo', 'forms', 'wufoo', 'survey-monkey', 'mainstream'],

  ['slack', 'Slack', 'communication', 'slack', 'salesforce', 'mainstream'],
  ['microsoft-teams', 'Microsoft Teams', 'communication', 'microsoftteams', 'microsoft', 'microsoft'],
  ['discord', 'Discord', 'communication', 'discord', 'discord', 'mainstream'],
  ['gmail', 'Gmail', 'communication', 'gmail', 'google', 'mainstream'],
  ['outlook', 'Microsoft Outlook', 'communication', 'microsoftoutlook', 'microsoft', 'microsoft'],
  ['twilio', 'Twilio', 'communication', 'twilio', 'twilio', 'api-first'],
  ['whatsapp', 'WhatsApp Business', 'communication', 'whatsapp', 'meta', 'api-first'],
  ['telegram', 'Telegram', 'communication', 'telegram', 'telegram', 'api-first'],
  ['zoom', 'Zoom', 'communication', 'zoom', 'zoom', 'mainstream'],
  ['ringcentral', 'RingCentral', 'communication', 'ringcentral', 'ringcentral', 'mainstream'],
  ['aircall', 'Aircall', 'communication', 'aircall', 'aircall', 'mainstream'],

  ['clickup', 'ClickUp', 'project', 'clickup', 'clickup', 'mainstream'],
  ['asana', 'Asana', 'project', 'asana', 'asana', 'mainstream'],
  ['monday', 'monday.com', 'project', 'monday', 'monday', 'mainstream'],
  ['trello', 'Trello', 'project', 'trello', 'atlassian', 'mainstream'],
  ['notion', 'Notion', 'project', 'notion', 'notion', 'api-first'],
  ['airtable', 'Airtable', 'project', 'airtable', 'airtable', 'api-first'],
  ['linear', 'Linear', 'project', 'linear', 'linear', 'api-first'],
  ['jira', 'Jira', 'project', 'jira', 'atlassian', 'enterprise'],
  ['basecamp', 'Basecamp', 'project', 'basecamp', '37signals', 'mainstream'],
  ['smartsheet', 'Smartsheet', 'project', 'smartsheet', 'smartsheet', 'enterprise'],

  ['stripe', 'Stripe', 'finance', 'stripe', 'stripe', 'api-first'],
  ['quickbooks', 'QuickBooks Online', 'finance', 'quickbooks', 'intuit', 'mainstream'],
  ['xero', 'Xero', 'finance', 'xero', 'xero', 'mainstream'],
  ['chargebee', 'Chargebee', 'finance', 'chargebee', 'chargebee', 'api-first'],
  ['paddle', 'Paddle', 'finance', 'paddle', 'paddle', 'api-first'],
  ['paypal', 'PayPal', 'finance', 'paypal', 'paypal', 'mainstream'],
  ['square', 'Square', 'finance', 'square', 'block', 'api-first'],
  ['freshbooks', 'FreshBooks', 'finance', 'freshbooks', 'freshbooks', 'mainstream'],
  ['bill', 'BILL', 'finance', '', 'bill', 'enterprise'],
  ['wise', 'Wise Business', 'finance', 'wise', 'wise', 'api-first'],

  ['shopify', 'Shopify', 'commerce', 'shopify', 'shopify', 'native-heavy'],
  ['woocommerce', 'WooCommerce', 'commerce', 'woocommerce', 'automattic', 'mainstream'],
  ['bigcommerce', 'BigCommerce', 'commerce', 'bigcommerce', 'bigcommerce', 'api-first'],
  ['adobe-commerce', 'Adobe Commerce / Magento', 'commerce', 'magento', 'adobe', 'enterprise'],
  ['etsy', 'Etsy', 'commerce', 'etsy', 'etsy', 'mainstream'],
  ['amazon-seller', 'Amazon Seller Central', 'commerce', 'amazon', 'amazon', 'enterprise'],
  ['shipstation', 'ShipStation', 'commerce', 'shipstation', 'shipstation', 'mainstream'],

  ['google-sheets', 'Google Sheets', 'data', 'googlesheets', 'google', 'mainstream'],
  ['excel', 'Microsoft Excel', 'data', 'microsoftexcel', 'microsoft', 'microsoft'],
  ['postgresql', 'PostgreSQL', 'data', 'postgresql', 'open-source', 'api-first'],
  ['mysql', 'MySQL', 'data', 'mysql', 'open-source', 'api-first'],
  ['supabase', 'Supabase', 'data', 'supabase', 'supabase', 'api-first'],
  ['firebase', 'Firebase', 'data', 'firebase', 'google', 'api-first'],
  ['snowflake', 'Snowflake', 'data', 'snowflake', 'snowflake', 'enterprise'],
  ['bigquery', 'Google BigQuery', 'data', 'googlebigquery', 'google', 'enterprise'],
  ['mongodb', 'MongoDB', 'data', 'mongodb', 'mongodb', 'api-first'],
  ['redis', 'Redis', 'data', 'redis', 'redis', 'api-first'],
  ['sql-server', 'Microsoft SQL Server', 'data', 'microsoftsqlserver', 'microsoft', 'microsoft'],
  ['s3', 'Amazon S3', 'data', 'amazons3', 'amazon', 'api-first'],

  ['github', 'GitHub', 'developer', 'github', 'github', 'api-first'],
  ['gitlab', 'GitLab', 'developer', 'gitlab', 'gitlab', 'api-first'],
  ['bitbucket', 'Bitbucket', 'developer', 'bitbucket', 'atlassian', 'api-first'],
  ['vercel', 'Vercel', 'developer', 'vercel', 'vercel', 'api-first'],
  ['cloudflare', 'Cloudflare', 'developer', 'cloudflare', 'cloudflare', 'api-first'],
  ['aws', 'AWS', 'developer', 'amazonwebservices', 'amazon', 'enterprise'],
  ['azure', 'Microsoft Azure', 'developer', 'microsoftazure', 'microsoft', 'microsoft'],
  ['google-cloud', 'Google Cloud', 'developer', 'googlecloud', 'google', 'enterprise'],
  ['sentry', 'Sentry', 'developer', 'sentry', 'sentry', 'api-first'],
  ['postman', 'Postman', 'developer', 'postman', 'postman', 'api-first'],

  ['zendesk', 'Zendesk', 'support', 'zendesk', 'zendesk', 'mainstream'],
  ['freshdesk', 'Freshdesk', 'support', 'freshworks', 'freshworks', 'mainstream'],
  ['intercom', 'Intercom', 'support', 'intercom', 'intercom', 'api-first'],
  ['helpscout', 'Help Scout', 'support', 'helpscout', 'helpscout', 'mainstream'],
  ['gorgias', 'Gorgias', 'support', 'gorgias', 'gorgias', 'mainstream'],

  ['facebook-leads', 'Facebook Lead Ads', 'ads', 'facebook', 'meta', 'mainstream'],
  ['meta-ads', 'Meta Ads', 'ads', 'meta', 'meta', 'mainstream'],
  ['google-ads', 'Google Ads', 'ads', 'googleads', 'google', 'mainstream'],
  ['linkedin-ads', 'LinkedIn Ads', 'ads', 'linkedin', 'linkedin', 'mainstream'],
  ['tiktok-ads', 'TikTok Ads', 'ads', 'tiktok', 'tiktok', 'mainstream'],
  ['instagram', 'Instagram', 'ads', 'instagram', 'meta', 'mainstream'],
  ['linkedin', 'LinkedIn', 'ads', 'linkedin', 'linkedin', 'limited'],
  ['youtube', 'YouTube', 'ads', 'youtube', 'google', 'mainstream'],

  ['wordpress', 'WordPress', 'web', 'wordpress', 'automattic', 'mainstream'],
  ['webflow', 'Webflow', 'web', 'webflow', 'webflow', 'api-first'],
  ['squarespace', 'Squarespace', 'web', 'squarespace', 'squarespace', 'limited'],
  ['wix', 'Wix', 'web', 'wixstudio', 'wix', 'mainstream'],
  ['contentful', 'Contentful', 'web', 'contentful', 'contentful', 'api-first'],
  ['sanity', 'Sanity', 'web', 'sanity', 'sanity', 'api-first'],
  ['ghost', 'Ghost', 'web', 'ghost', 'ghost', 'api-first'],

  ['openai', 'OpenAI', 'ai', 'openai', 'openai', 'api-first'],
  ['anthropic', 'Anthropic Claude', 'ai', 'anthropic', 'anthropic', 'api-first'],
  ['gemini', 'Google Gemini', 'ai', 'googlegemini', 'google', 'api-first'],
  ['perplexity', 'Perplexity', 'ai', 'perplexity', 'perplexity', 'api-first'],
  ['cohere', 'Cohere', 'ai', 'cohere', 'cohere', 'api-first'],
  ['pinecone', 'Pinecone', 'ai', 'pinecone', 'pinecone', 'api-first'],
  ['weaviate', 'Weaviate', 'ai', 'weaviate', 'weaviate', 'api-first'],

  ['bamboohr', 'BambooHR', 'hr', 'bamboo', 'bamboohr', 'mainstream'],
  ['workday', 'Workday', 'hr', 'workday', 'workday', 'enterprise'],
  ['rippling', 'Rippling', 'hr', 'rippling', 'rippling', 'enterprise'],
  ['deel', 'Deel', 'hr', 'deel', 'deel', 'api-first'],
  ['gusto', 'Gusto', 'hr', 'gusto', 'gusto', 'mainstream'],
  ['greenhouse', 'Greenhouse', 'hr', 'greenhouse', 'greenhouse', 'enterprise'],

  ['calendly', 'Calendly', 'calendar', 'calendly', 'calendly', 'mainstream'],
  ['cal-com', 'Cal.com', 'calendar', 'caldotcom', 'cal', 'api-first'],
  ['acuity', 'Acuity Scheduling', 'calendar', 'acuityscheduling', 'squarespace', 'mainstream'],
  ['google-calendar', 'Google Calendar', 'calendar', 'googlecalendar', 'google', 'mainstream'],
  ['outlook-calendar', 'Outlook Calendar', 'calendar', 'microsoftoutlook', 'microsoft', 'microsoft'],

  ['docusign', 'DocuSign', 'documents', 'docusign', 'docusign', 'enterprise'],
  ['pandadoc', 'PandaDoc', 'documents', 'pandadoc', 'pandadoc', 'mainstream'],
  ['google-drive', 'Google Drive', 'documents', 'googledrive', 'google', 'mainstream'],
  ['dropbox', 'Dropbox', 'documents', 'dropbox', 'dropbox', 'mainstream'],
  ['onedrive', 'Microsoft OneDrive', 'documents', 'microsoftonedrive', 'microsoft', 'microsoft'],
  ['sharepoint', 'Microsoft SharePoint', 'documents', 'microsoftsharepoint', 'microsoft', 'microsoft'],
  ['box', 'Box', 'documents', 'box', 'box', 'enterprise'],

  ['zapier', 'Zapier', 'automation', 'zapier', 'zapier', 'native-heavy'],
  ['make', 'Make', 'automation', 'make', 'make', 'native-heavy'],
  ['n8n', 'n8n', 'automation', 'n8n', 'n8n', 'api-first'],
  ['power-automate', 'Power Automate', 'automation', 'powerautomate', 'microsoft', 'microsoft'],
  ['activepieces', 'Activepieces', 'automation', '', 'activepieces', 'api-first'],
  ['pipedream', 'Pipedream', 'automation', 'pipedream', 'pipedream', 'api-first'],
  ['workato', 'Workato', 'automation', 'workato', 'workato', 'enterprise'],
  ['tray', 'Tray.ai', 'automation', '', 'tray', 'enterprise'],

  ['netsuite', 'Oracle NetSuite', 'erp', 'oracle', 'oracle', 'enterprise'],
  ['sap', 'SAP', 'erp', 'sap', 'sap', 'enterprise'],
  ['odoo', 'Odoo', 'erp', 'odoo', 'odoo', 'api-first'],
  ['business-central', 'Microsoft Dynamics 365 Business Central', 'erp', 'microsoft', 'microsoft', 'microsoft'],
] as const

const NATIVE_AUTOMATION: Record<string, number> = {
  hubspot: 92,
  salesforce: 94,
  gohighlevel: 94,
  'zoho-crm': 86,
  activecampaign: 90,
  keap: 84,
  freshsales: 82,
  'dynamics-365': 94,
  shopify: 76,
  zapier: 100,
  make: 100,
  n8n: 100,
  'power-automate': 100,
  activepieces: 100,
  pipedream: 100,
  workato: 100,
  tray: 100,
}

export const APP_CATALOG: AppDefinition[] = RAW_APPS.map(([id, name, category, icon, vendor, connectivity]) => ({
  id,
  name,
  category,
  icon: icon || null,
  vendor,
  connectivity,
  nativeAutomation: NATIVE_AUTOMATION[id] ?? (connectivity === 'native-heavy' ? 72 : 28),
}))

export const APP_BY_ID = new Map(APP_CATALOG.map((app) => [app.id, app]))

export const POPULAR_APP_IDS = [
  'hubspot',
  'salesforce',
  'gohighlevel',
  'slack',
  'gmail',
  'microsoft-teams',
  'google-sheets',
  'airtable',
  'notion',
  'clickup',
  'stripe',
  'quickbooks',
  'shopify',
  'typeform',
  'calendly',
  'openai',
  'postgresql',
  'zapier',
  'make',
  'n8n',
  'power-automate',
] as const

export const APP_CATEGORY_LABELS: Record<AppCategory, string> = {
  crm: 'CRM',
  marketing: 'Marketing',
  forms: 'Forms',
  communication: 'Communication',
  project: 'Project / Ops',
  finance: 'Finance',
  commerce: 'Commerce',
  data: 'Data',
  developer: 'Developer',
  support: 'Support',
  ads: 'Ads / Social',
  web: 'Web / CMS',
  ai: 'AI',
  hr: 'HR',
  calendar: 'Scheduling',
  documents: 'Documents',
  automation: 'Automation',
  erp: 'ERP',
}

export function getApps(ids: string[]) {
  return ids.map((id) => APP_BY_ID.get(id)).filter((app): app is AppDefinition => Boolean(app))
}
