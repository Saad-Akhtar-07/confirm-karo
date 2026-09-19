import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { OrderDrawer } from './components/OrderDrawer'
import { Overview } from './pages/Overview'
import { Orders } from './pages/Orders'
import { Automations } from './pages/Automations'
import { ActivityLog } from './pages/ActivityLog'
import { dashboardSnapshot, loadDashboard } from './data/dashboard'

const pageCopy = {
  overview: ['Operations overview', 'Confirm orders before dispatch—without touching fulfillment.'],
  orders: ['Order confirmations', 'One audit trail across Shopify, WhatsApp and Google Sheets.'],
  automations: ['Connections & workflows', 'The integration layer currently running this demo.'],
  activity: ['Activity log', 'A traceable history of every automated transition.'],
}

export default function App() {
  const [page, setPage] = useState('overview')
  const [dashboard, setDashboard] = useState(dashboardSnapshot)
  const [dataMode, setDataMode] = useState('snapshot')
  const [loading, setLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [title, subtitle] = pageCopy[page]

  const refreshDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await loadDashboard()
      setDashboard(result.dashboard)
      setDataMode(result.mode)
      setToast(result.mode === 'live' ? 'Live dashboard refreshed' : 'Demo snapshot refreshed')
    } catch (loadError) {
      setError(loadError.message)
      setDashboard(dashboardSnapshot)
      setDataMode('snapshot')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    loadDashboard().then((result) => {
      if (!active) return
      setDashboard(result.dashboard)
      setDataMode(result.mode)
    }).catch((loadError) => {
      if (!active) return
      setError(loadError.message)
      setDashboard(dashboardSnapshot)
      setDataMode('snapshot')
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const handler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPage('orders')
        setTimeout(() => document.querySelector('.orders-search input')?.focus(), 0)
      }
      if (event.key === 'Escape') setSelectedOrder(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const content = useMemo(() => {
    const common = { dashboard, dataMode }
    if (page === 'orders') return <Orders {...common} search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onOpenOrder={setSelectedOrder} />
    if (page === 'automations') return <Automations {...common} />
    if (page === 'activity') return <ActivityLog {...common} />
    return <Overview {...common} onOpenOrder={setSelectedOrder} setPage={setPage} onRefresh={refreshDashboard} loading={loading} />
  }, [dashboard, dataMode, loading, page, search, statusFilter])

  const handleGlobalSearch = (value) => {
    setSearch(value)
    if (value) setPage('orders')
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} orderCount={dashboard.orders.length} environment={dashboard.meta.environment} />
      {mobileNavOpen && <button className="mobile-overlay" onClick={() => setMobileNavOpen(false)} aria-label="Close menu overlay" />}
      <main className="main-shell">
        <Topbar title={title} subtitle={subtitle} onMenu={() => setMobileNavOpen(true)} onSearch={handleGlobalSearch} onRefresh={refreshDashboard} loading={loading} updatedAt={dashboard.meta.updatedAt} />
        {error && <div className="global-alert"><AlertTriangle size={16} /> Live endpoint unavailable; showing the verified demo snapshot. {error}</div>}
        <div className="page-content">{content}</div>
      </main>
      <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      {toast && <div className="toast"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  )
}
