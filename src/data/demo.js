export const orders = [
  { id: 'CK-1048', shopifyId: '#1294', customer: 'Areeba Khan', initials: 'AK', phone: '+92 300 ••• 1842', city: 'Lahore', amount: 4850, status: 'PENDING', placed: '10:42 AM', attempts: 1 },
  { id: 'CK-1047', shopifyId: '#1293', customer: 'Hamza Siddiqui', initials: 'HS', phone: '+92 321 ••• 7250', city: 'Karachi', amount: 7290, status: 'CONFIRMED', placed: '10:18 AM', attempts: 1 },
  { id: 'CK-1046', shopifyId: '#1292', customer: 'Zoya Ahmed', initials: 'ZA', phone: '+92 333 ••• 9011', city: 'Islamabad', amount: 2399, status: 'REMINDED', placed: '9:56 AM', attempts: 2 },
  { id: 'CK-1045', shopifyId: '#1291', customer: 'Bilal Raza', initials: 'BR', phone: '+92 302 ••• 4690', city: 'Rawalpindi', amount: 11850, status: 'CANCELLED', placed: '9:31 AM', attempts: 1 },
  { id: 'CK-1044', shopifyId: '#1290', customer: 'Maham Ali', initials: 'MA', phone: '+92 312 ••• 3385', city: 'Faisalabad', amount: 3640, status: 'CONFIRMED', placed: '9:12 AM', attempts: 1 },
  { id: 'CK-1043', shopifyId: '#1289', customer: 'Usman Tariq', initials: 'UT', phone: 'No phone number', city: 'Multan', amount: 6175, status: 'UNVERIFIED', placed: '8:47 AM', attempts: 0 },
  { id: 'CK-1042', shopifyId: '#1288', customer: 'Sara Noor', initials: 'SN', phone: '+92 310 ••• 5521', city: 'Sialkot', amount: 1990, status: 'PENDING', placed: '8:29 AM', attempts: 1 },
  { id: 'CK-1041', shopifyId: '#1287', customer: 'Daniyal Shah', initials: 'DS', phone: '+92 345 ••• 0719', city: 'Peshawar', amount: 8950, status: 'CONFIRMED', placed: '8:04 AM', attempts: 1 },
]

export const activity = [
  { time: '10:44 AM', title: 'Confirmation request queued', detail: 'Order #1294 · Areeba Khan', tone: 'amber' },
  { time: '10:21 AM', title: 'Customer confirmed order', detail: 'Order #1293 · WhatsApp reply received', tone: 'green' },
  { time: '10:01 AM', title: 'Reminder sent', detail: 'Order #1292 · Attempt 2 of 2', tone: 'blue' },
  { time: '9:37 AM', title: 'Customer cancelled order', detail: 'Order #1291 · Shopify tag pending', tone: 'red' },
  { time: '9:15 AM', title: 'Sheet row updated', detail: 'Order #1290 · Status: CONFIRMED', tone: 'green' },
]

export const chartData = [28, 34, 30, 46, 41, 52, 48, 64, 58, 72, 67, 78, 73, 84]

export const integrations = [
  { key: 'shopify', name: 'Shopify', purpose: 'Order source', color: '#7ab55c', env: 'VITE_FASTN_SHOPIFY_WIDGET_URL' },
  { key: 'metaWhatsapp', name: 'WhatsApp Business', purpose: 'Meta Cloud API messaging', color: '#24a765', env: 'VITE_FASTN_META_WHATSAPP_WIDGET_URL' },
  { key: 'sheets', name: 'Google Sheets', purpose: 'Operations log', color: '#4385f5', env: 'VITE_FASTN_SHEETS_WIDGET_URL' },
]

export const formatPKR = (value) => `Rs ${new Intl.NumberFormat('en-PK').format(value)}`
