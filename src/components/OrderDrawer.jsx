import { Check, Clock3, MessageCircle, Phone, ShoppingBag, X } from 'lucide-react'
import { formatPKR } from '../data/demo'
import { StatusPill } from './StatusPill'

export function OrderDrawer({ order, onClose, onAction }) {
  if (!order) return null
  return (
    <div className="drawer-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="order-drawer" aria-label={`Details for order ${order.shopifyId}`}>
        <div className="drawer-head">
          <div><span className="eyebrow">Order details</span><h2>{order.shopifyId}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close order details"><X size={20} /></button>
        </div>
        <div className="drawer-status"><StatusPill status={order.status} /><span>Created today at {order.placed}</span></div>
        <section className="customer-summary">
          <span className="customer-avatar large">{order.initials}</span>
          <div><h3>{order.customer}</h3><p><Phone size={14} /> {order.phone}</p><p>{order.city}, Pakistan</p></div>
        </section>
        <section className="drawer-section">
          <span className="section-kicker">Order summary</span>
          <div className="summary-row"><span><ShoppingBag size={15} /> Shopify order</span><strong>{order.shopifyId}</strong></div>
          <div className="summary-row"><span>COD total</span><strong>{formatPKR(order.amount)}</strong></div>
          <div className="summary-row"><span><MessageCircle size={15} /> WhatsApp attempts</span><strong>{order.attempts}</strong></div>
        </section>
        <section className="drawer-section">
          <span className="section-kicker">Confirmation journey</span>
          <div className="mini-timeline">
            <div className="done"><span><Check size={12} /></span><p><strong>Order received</strong><small>{order.placed} · Shopify</small></p></div>
            <div className={order.attempts ? 'done' : ''}><span>{order.attempts ? <Check size={12} /> : <Clock3 size={12} />}</span><p><strong>Message sent</strong><small>{order.attempts ? 'WhatsApp request delivered' : 'Waiting for valid phone'}</small></p></div>
            <div className={order.status === 'CONFIRMED' ? 'done' : ''}><span>{order.status === 'CONFIRMED' ? <Check size={12} /> : <Clock3 size={12} />}</span><p><strong>Customer response</strong><small>{order.status === 'CONFIRMED' ? 'Customer replied YES' : 'No final response yet'}</small></p></div>
          </div>
        </section>
        <div className="drawer-actions">
          <button className="secondary-button" onClick={() => onAction(order, 'reminder')} disabled={order.status === 'UNVERIFIED'}>Send reminder</button>
          <button className="primary-button" onClick={() => onAction(order, 'confirmed')}>Mark confirmed</button>
        </div>
      </aside>
    </div>
  )
}
