const snapshotOrders = [
  { id: '6839086776417', shopifyId: '#1008', customer: 'Demo Card Customer', initials: 'DC', phone: '+92 327 ••• 2033', city: 'Lahore', amount: 699.95, currency: 'USD', status: 'PENDING', placed: '2:40 PM', attempts: 1, payment: 'Card (demo)', messageMode: 'Interactive', reply: 'Awaiting customer', source: 'Shopify' },
  { id: '6839084056673', shopifyId: '#1006', customer: 'Published Demo', initials: 'PD', phone: '+92 327 ••• 2033', city: 'Islamabad', amount: 750, currency: 'USD', status: 'CONFIRMED', placed: '1:53 PM', attempts: 1, payment: 'COD', messageMode: 'Interactive', reply: 'Confirm', source: 'Shopify' },
  { id: '6839083335777', shopifyId: '#1005', customer: 'Notes Demo', initials: 'ND', phone: '+92 327 ••• 2033', city: 'Rawalpindi', amount: 1500, currency: 'USD', status: 'CANCELLED', placed: '1:52 PM', attempts: 1, payment: 'COD', messageMode: 'Interactive', reply: 'Cancel', source: 'Shopify' },
  { id: '6839082713185', shopifyId: '#1004', customer: 'Customer', initials: 'CU', phone: 'No phone number', city: '—', amount: 999, currency: 'USD', status: 'UNVERIFIED', placed: '1:50 PM', attempts: 0, payment: 'COD', messageMode: 'Not sent', reply: 'Missing phone', source: 'Shopify' },
  { id: '6839081697377', shopifyId: '#1003', customer: 'No Phone', initials: 'NP', phone: 'No phone number', city: 'Karachi', amount: 1200, currency: 'USD', status: 'UNVERIFIED', placed: '1:49 PM', attempts: 0, payment: 'COD', messageMode: 'Not sent', reply: 'Missing phone', source: 'Shopify' },
  { id: '6839080779873', shopifyId: '#1002', customer: 'Demo Customer', initials: 'DC', phone: '+92 327 ••• 2033', city: 'Lahore', amount: 3499, currency: 'USD', status: 'EXPIRED', placed: '1:48 PM', attempts: 2, payment: 'COD', messageMode: 'Interactive', reply: 'Cutoff expired', source: 'Shopify' },
]

export const dashboardSnapshot = {
  meta: { merchantId: 'demo-merchant-1', workspace: 'ConfirmKaro Demo Store', environment: 'Test', updatedAt: '2026-09-19T14:40:40+05:00' },
  orders: snapshotOrders,
  performanceSeries: [33, 41, 38, 49, 45, 54, 52, 61, 58, 66, 63, 71, 68, 72],
  connections: [
    { key: 'shopify', name: 'Shopify', purpose: 'Order source and safety tags', color: '#7ab55c', auth: 'API key', status: 'ACTIVE', detail: 'orders/create trigger connected' },
    { key: 'metaWhatsapp', name: 'WhatsApp Business', purpose: 'Confirmation messages and replies', color: '#24a765', auth: 'Bearer token', status: 'ACTIVE', detail: 'Cloud API + signed Worker ingress' },
    { key: 'sheets', name: 'Google Sheets', purpose: 'Operations ledger and audit trail', color: '#4385f5', auth: 'OAuth', status: 'ACTIVE', detail: 'Sheet1 · columns A:M' },
  ],
  workflows: [
    { step: '01', id: 'wf_db9f910b9cd1', version: 'v3', name: 'Order confirmation', description: 'Shopify order → WhatsApp request → Sheet ledger → pending tag', trigger: 'Shopify orders/create', status: 'LIVE' },
    { step: '02', id: 'wf_41e087c038ef', version: 'v1', name: 'Customer response', description: 'WhatsApp button → Sheet status → Shopify safety tag', trigger: 'Cloudflare Worker webhook', status: 'MONITORING' },
    { step: '03', id: 'wf_4162dc5d7a1a', version: 'v1', name: 'Reminder and cutoff', description: '2-minute reminder → 5-minute cutoff → do-not-ship tag', trigger: 'Fastn schedule', status: 'LIVE' },
  ],
  activity: [
    { time: '2:40 PM', title: 'Card demo confirmation sent', detail: 'Order #1008 · interactive WhatsApp message', tone: 'green', source: 'WhatsApp' },
    { time: '2:40 PM', title: 'Order recorded as pending', detail: 'Order #1008 · ledger row created', tone: 'blue', source: 'Sheets' },
    { time: '1:55 PM', title: 'Customer confirmed order', detail: 'Order #1006 · confirmation recorded', tone: 'green', source: 'WhatsApp' },
    { time: '1:55 PM', title: 'Customer cancelled order', detail: 'Order #1005 · tag-only safety update', tone: 'red', source: 'Shopify' },
    { time: '1:50 PM', title: 'Missing phone protected', detail: 'Order #1004 · do-not-ship tag applied', tone: 'amber', source: 'Shopify' },
    { time: '1:48 PM', title: 'Confirmation window expired', detail: 'Order #1002 · no automatic cancellation', tone: 'amber', source: 'Fastn' },
  ],
}

export const formatMoney = (value, currency = 'PKR') => new Intl.NumberFormat('en-PK', {
  style: 'currency', currency, maximumFractionDigits: currency === 'PKR' ? 0 : 2,
}).format(value)

function normalizeDashboard(payload) {
  if (!payload || !Array.isArray(payload.orders)) throw new Error('Dashboard response is missing orders')
  return { ...dashboardSnapshot, ...payload, meta: { ...dashboardSnapshot.meta, ...payload.meta }, connections: payload.connections || dashboardSnapshot.connections, workflows: payload.workflows || dashboardSnapshot.workflows, activity: payload.activity || dashboardSnapshot.activity }
}

export async function loadDashboard() {
  const apiBase = import.meta.env.VITE_CONFIRMKARO_API_URL?.replace(/\/$/, '')
  if (!apiBase) return { dashboard: dashboardSnapshot, mode: 'snapshot' }
  const response = await fetch(`${apiBase}/dashboard`, { headers: { Accept: 'application/json' }, credentials: 'omit' })
  if (!response.ok) throw new Error(`Dashboard API returned ${response.status}`)
  return { dashboard: normalizeDashboard(await response.json()), mode: 'live' }
}
