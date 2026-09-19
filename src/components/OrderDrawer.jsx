import { Check, Clock3, MessageCircle, Phone, ShieldCheck, ShoppingBag, X } from 'lucide-react'
import { formatMoney } from '../data/dashboard'
import { StatusPill } from './StatusPill'

export function OrderDrawer({ order, onClose }) {
  if (!order) return null
  const sent = order.attempts > 0
  const resolved = ['CONFIRMED', 'CANCELLED'].includes(order.status)
  return <div className="drawer-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><aside className="order-drawer" aria-label={`Details for order ${order.shopifyId}`}><div className="drawer-head"><div><span className="eyebrow">Order details</span><h2>{order.shopifyId}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close order details"><X size={20} /></button></div><div className="drawer-status"><StatusPill status={order.status} /><span>Created at {order.placed}</span></div><section className="customer-summary"><span className="customer-avatar large">{order.initials}</span><div><h3>{order.customer}</h3><p><Phone size={14} /> {order.phone}</p><p>{order.city === '—' ? 'City unavailable' : `${order.city}, Pakistan`}</p></div></section>

    <section className="drawer-section"><span className="section-kicker">Order summary</span><div className="summary-row"><span><ShoppingBag size={15} /> Shopify order</span><strong>{order.shopifyId}</strong></div><div className="summary-row"><span>Payment route</span><strong>{order.payment}</strong></div><div className="summary-row"><span>Order total</span><strong>{formatMoney(order.amount, order.currency)}</strong></div><div className="summary-row"><span><MessageCircle size={15} /> WhatsApp attempts</span><strong>{order.attempts}</strong></div></section>

    <section className="drawer-section"><span className="section-kicker">Confirmation journey</span><div className="mini-timeline"><div className="done"><span><Check size={12} /></span><p><strong>Order received</strong><small>{order.placed} · Shopify orders/create</small></p></div><div className={sent ? 'done' : ''}><span>{sent ? <Check size={12} /> : <Clock3 size={12} />}</span><p><strong>Confirmation request</strong><small>{sent ? `${order.messageMode} WhatsApp message` : 'Blocked until a valid phone exists'}</small></p></div><div className={resolved ? 'done' : ''}><span>{resolved ? <Check size={12} /> : <Clock3 size={12} />}</span><p><strong>Customer decision</strong><small>{resolved ? order.reply : order.status === 'EXPIRED' ? 'No reply before cutoff' : 'No final response yet'}</small></p></div></div></section>

    <div className="safety-card"><ShieldCheck size={18} /><div><strong>Safe by design</strong><p>This console is read-only. Fastn updates Shopify tags and the Sheet ledger, but never cancels or fulfills an order.</p></div></div>
  </aside></div>
}
