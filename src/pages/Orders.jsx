import { Filter, Search, SlidersHorizontal } from 'lucide-react'
import { formatPKR } from '../data/demo'
import { StatusPill } from '../components/StatusPill'

const filters = ['ALL', 'PENDING', 'CONFIRMED', 'REMINDED', 'CANCELLED', 'UNVERIFIED']

export function Orders({ orders, search, setSearch, statusFilter, setStatusFilter, onOpenOrder }) {
  const query = search.trim().toLowerCase()
  const visible = orders.filter((order) => (statusFilter === 'ALL' || order.status === statusFilter) && (!query || [order.shopifyId, order.customer, order.phone, order.city].some((value) => value.toLowerCase().includes(query))))
  return (
    <div className="page-stack">
      <section className="orders-toolbar">
        <label className="orders-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, order, phone or city" /></label>
        <button className="secondary-button"><SlidersHorizontal size={16} /> Columns</button>
        <button className="secondary-button"><Filter size={16} /> More filters</button>
      </section>
      <section className="filter-tabs" aria-label="Order status filters">{filters.map((item) => <button key={item} className={statusFilter === item ? 'active' : ''} onClick={() => setStatusFilter(item)}>{item === 'ALL' ? 'All orders' : item.charAt(0) + item.slice(1).toLowerCase()}<span>{item === 'ALL' ? orders.length : orders.filter((order) => order.status === item).length}</span></button>)}</section>
      <section className="panel orders-panel">
        <div className="table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Contact</th><th>City</th><th>COD total</th><th>Status</th><th>Placed</th></tr></thead><tbody>{visible.map((order) => <tr key={order.id} onClick={() => onOpenOrder(order)}><td><strong>{order.shopifyId}</strong><small>{order.id}</small></td><td><div className="customer-cell"><span className="customer-avatar">{order.initials}</span><strong>{order.customer}</strong></div></td><td>{order.phone}</td><td>{order.city}</td><td><strong>{formatPKR(order.amount)}</strong></td><td><StatusPill status={order.status} /></td><td>{order.placed}</td></tr>)}</tbody></table></div>
        {!visible.length && <div className="empty-state"><Search size={24} /><h3>No matching orders</h3><p>Try a different status or search term.</p></div>}
        <footer className="table-footer"><span>Showing {visible.length} of {orders.length} demo orders</span><div><button disabled>Previous</button><button disabled>Next</button></div></footer>
      </section>
    </div>
  )
}
