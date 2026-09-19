import { ArrowRight, CheckCircle2, Clock3, MessageSquareMore, RefreshCw, ShieldCheck, ShoppingBag } from 'lucide-react'
import { formatMoney } from '../data/dashboard'
import { FastnWidgetSlot } from '../components/FastnWidgetSlot'
import { StatusPill } from '../components/StatusPill'

function MetricCard({ label, value, note, tone, icon: Icon }) {
  return <article className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={19} /></div><div className="metric-copy"><span>{label}</span><strong>{value}</strong></div><small>{note}</small></article>
}

function PerformanceChart({ values }) {
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${100 - value}`).join(' ')
  return <div className="chart-wrap"><div className="chart-y-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span></div><svg className="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Fourteen day confirmation-rate trend"><g className="grid-lines"><line x1="0" y1="0" x2="100" y2="0" /><line x1="0" y1="25" x2="100" y2="25" /><line x1="0" y1="50" x2="100" y2="50" /><line x1="0" y1="75" x2="100" y2="75" /></g><polyline className="chart-line-shadow" points={points} /><polyline className="chart-line" points={points} /><circle cx="100" cy={100 - values.at(-1)} r="2.2" className="chart-dot" /></svg><div className="chart-x-labels"><span>6 Sep</span><span>10 Sep</span><span>14 Sep</span><span>Today</span></div></div>
}

export function Overview({ dashboard, dataMode, onOpenOrder, setPage, onRefresh, loading }) {
  const { orders, activity, connections, performanceSeries } = dashboard
  const pending = orders.filter((order) => order.status === 'PENDING').length
  const decided = orders.filter((order) => ['CONFIRMED', 'CANCELLED'].includes(order.status))
  const confirmationRate = decided.length ? Math.round((decided.filter((order) => order.status === 'CONFIRMED').length / decided.length) * 100) : 0
  const protectedValue = orders.filter((order) => order.status === 'CONFIRMED').reduce((sum, order) => sum + order.amount, 0)
  const attention = orders.filter((order) => ['UNVERIFIED', 'EXPIRED', 'PENDING'].includes(order.status)).slice(0, 3)

  return <div className="page-stack">
    <section className="demo-banner operations-banner"><span>{dataMode === 'live' ? 'LIVE DATA' : 'VERIFIED SNAPSHOT'}</span><p><strong>3 connections active.</strong> Card checkout is enabled for the demo; production safety remains tag-only.</p><button onClick={onRefresh} disabled={loading}><RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh</button></section>
    <section className="metrics-grid">
      <MetricCard label="Tracked orders" value={orders.length} note="Current verified workspace snapshot" tone="ink" icon={ShoppingBag} />
      <MetricCard label="Awaiting reply" value={pending} note="Eligible for the 2-minute reminder" tone="amber" icon={Clock3} />
      <MetricCard label="Confirmation rate" value={`${confirmationRate}%`} note="Confirmed ÷ customer decisions" tone="green" icon={CheckCircle2} />
      <MetricCard label="Confirmed value" value={formatMoney(protectedValue, 'USD')} note="Tagged confirmed; never auto-fulfilled" tone="blue" icon={ShieldCheck} />
    </section>

    <section className="overview-grid">
      <article className="panel performance-panel"><div className="panel-head"><div><span className="eyebrow">Performance</span><h2>Confirmation trend</h2><p>Demo-series view; operational totals above use the current snapshot.</p></div><div className="legend"><span /><span>14-day rate</span></div></div><PerformanceChart values={performanceSeries} /></article>
      <article className="panel attention-panel"><div className="panel-head"><div><span className="eyebrow">Action queue</span><h2>Needs attention</h2></div><span className="count-badge">{attention.length}</span></div>{attention.map((order) => <button className="attention-row" key={order.id} onClick={() => onOpenOrder(order)}><span className={`attention-icon ${order.status === 'UNVERIFIED' ? 'red' : order.status === 'EXPIRED' ? 'blue' : 'amber'}`}>{order.status === 'UNVERIFIED' ? '!' : order.status === 'EXPIRED' ? <MessageSquareMore size={14} /> : <Clock3 size={14} />}</span><span><strong>{order.status === 'UNVERIFIED' ? 'Missing phone number' : order.status === 'EXPIRED' ? 'Confirmation window expired' : 'Awaiting customer reply'}</strong><small>{order.shopifyId} · {formatMoney(order.amount, order.currency)}</small></span><ArrowRight size={16} /></button>)}</article>
    </section>

    <section className="panel recent-panel"><div className="panel-head"><div><span className="eyebrow">Order ledger</span><h2>Recent confirmations</h2></div><button className="text-button" onClick={() => setPage('orders')}>View all orders <ArrowRight size={14} /></button></div><div className="table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Payment</th><th>Amount</th><th>Status</th><th>Placed</th><th /></tr></thead><tbody>{orders.slice(0, 5).map((order) => <tr key={order.id} onClick={() => onOpenOrder(order)}><td><strong>{order.shopifyId}</strong><small>{order.id}</small></td><td><div className="customer-cell"><span className="customer-avatar">{order.initials}</span><span><strong>{order.customer}</strong><small>{order.city}</small></span></div></td><td><span className="payment-label">{order.payment}</span></td><td><strong>{formatMoney(order.amount, order.currency)}</strong></td><td><StatusPill status={order.status} /></td><td>{order.placed}</td><td><ArrowRight size={15} /></td></tr>)}</tbody></table></div></section>

    <section className="bottom-grid"><article className="panel integrations-panel"><div className="panel-head"><div><span className="eyebrow">Infrastructure</span><h2>Connection health</h2></div><button className="text-button" onClick={() => setPage('automations')}>View workflows <ArrowRight size={14} /></button></div><div className="compact-integrations">{connections.map((item) => <FastnWidgetSlot key={item.key} integration={item} compact />)}</div></article><article className="panel activity-panel"><div className="panel-head"><div><span className="eyebrow">Audit trail</span><h2>Latest activity</h2></div></div><div className="activity-list">{activity.slice(0, 4).map((item) => <div className="activity-item" key={item.time + item.title}><span className={`activity-dot ${item.tone}`} /><span><strong>{item.title}</strong><small>{item.detail}</small></span><time>{item.time}</time></div>)}</div></article></section>
  </div>
}
