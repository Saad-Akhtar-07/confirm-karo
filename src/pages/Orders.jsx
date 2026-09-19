import { Search, ShieldCheck } from 'lucide-react'
import { formatMoney } from '../data/dashboard'
import { StatusPill } from '../components/StatusPill'

const filters = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'UNVERIFIED', 'EXPIRED']

export function Orders({ dashboard, dataMode, search, setSearch, statusFilter, setStatusFilter, onOpenOrder }) {
  const { orders } = dashboard
  const query = search.trim().toLowerCase()
  const visible = orders.filter((order) => (statusFilter === 'ALL' || order.status === statusFilter) && (!query || [order.shopifyId, order.id, order.customer, order.phone, order.city, order.payment].some((value) => String(value).toLowerCase().includes(query))))

  return <div className="page-stack">
    <section className="orders-toolbar"><label className="orders-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer, phone, city or payment" /></label><span className="read-only-note"><ShieldCheck size={15} /> Read-only operations view</span><span className="data-mode">{dataMode === 'live' ? 'Live API' : 'Verified snapshot'}</span></section>
    <section className="filter-tabs" aria-label="Order status filters">{filters.map((item) => <button key={item} className={statusFilter === item ? 'active' : ''} onClick={() => setStatusFilter(item)}>{item === 'ALL' ? 'All orders' : item.charAt(0) + item.slice(1).toLowerCase()}<span>{item === 'ALL' ? orders.length : orders.filter((order) => order.status === item).length}</span></button>)}</section>
    <section className="panel orders-panel"><div className="table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Contact</th><th>Payment</th><th>Amount</th><th>Status</th><th>Placed</th></tr></thead><tbody>{visible.map((order) => <tr key={order.id} onClick={() => onOpenOrder(order)}><td><strong>{order.shopifyId}</strong><small>{order.id}</small></td><td><div className="customer-cell"><span className="customer-avatar">{order.initials}</span><span><strong>{order.customer}</strong><small>{order.city}</small></span></div></td><td>{order.phone}</td><td><span className="payment-label">{order.payment}</span></td><td><strong>{formatMoney(order.amount, order.currency)}</strong></td><td><StatusPill status={order.status} /></td><td>{order.placed}</td></tr>)}</tbody></table></div>{!visible.length && <div className="empty-state"><Search size={24} /><h3>No matching orders</h3><p>Try another status or search term.</p></div>}<footer className="table-footer"><span>Showing {visible.length} of {orders.length} orders</span><span>Merchant: {dashboard.meta.merchantId}</span></footer></section>
  </div>
}
