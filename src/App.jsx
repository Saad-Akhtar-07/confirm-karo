import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { OrderDrawer } from './components/OrderDrawer'
import { Overview } from './pages/Overview'
import { Orders } from './pages/Orders'
import { Automations } from './pages/Automations'
import { ActivityLog } from './pages/ActivityLog'
import { orders as initialOrders } from './data/demo'

const pageCopy = {
  overview: ['Good morning, Saad', 'Here is what needs attention before today’s dispatch.'],
  orders: ['COD orders', 'Track every confirmation from checkout to dispatch.'],
  automations: ['Connections & workflows', 'Prepared for your Fastn-powered integration layer.'],
  activity: ['Activity log', 'A clear audit trail across every connected system.'],
}

export default function App() {
  const [page, setPage] = useState('overview')
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [toast, setToast] = useState('')
  const [title, subtitle] = pageCopy[page]

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
    const timeout = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const content = useMemo(() => {
    if (page === 'orders') return <Orders orders={orders} search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onOpenOrder={setSelectedOrder} />
    if (page === 'automations') return <Automations />
    if (page === 'activity') return <ActivityLog />
    return <Overview orders={orders} onOpenOrder={setSelectedOrder} setPage={setPage} />
  }, [orders, page, search, statusFilter])

  const handleGlobalSearch = (value) => {
    setSearch(value)
    if (value) setPage('orders')
  }

  const handleOrderAction = (order, action) => {
    const nextStatus = action === 'confirmed' ? 'CONFIRMED' : 'REMINDED'
    setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: nextStatus, attempts: action === 'reminder' ? item.attempts + 1 : item.attempts } : item))
    setSelectedOrder((current) => ({ ...current, status: nextStatus }))
    setToast(action === 'confirmed' ? `${order.shopifyId} marked confirmed` : `Demo reminder queued for ${order.shopifyId}`)
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      {mobileNavOpen && <button className="mobile-overlay" onClick={() => setMobileNavOpen(false)} aria-label="Close menu overlay" />}
      <main className="main-shell">
        <Topbar title={title} subtitle={subtitle} onMenu={() => setMobileNavOpen(true)} onSearch={handleGlobalSearch} />
        <div className="page-content">{content}</div>
      </main>
      <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} onAction={handleOrderAction} />
      {toast && <div className="toast"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  )
}
