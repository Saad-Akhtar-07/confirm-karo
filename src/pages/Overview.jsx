import { ArrowDownRight, ArrowRight, ArrowUpRight, CheckCircle2, Clock3, MessageSquareMore, ShieldCheck, ShoppingBag } from 'lucide-react'
import { activity, chartData, formatPKR, integrations } from '../data/demo'
import { FastnWidgetSlot } from '../components/FastnWidgetSlot'
import { StatusPill } from '../components/StatusPill'

function MetricCard({ label, value, note, tone, icon: Icon, trend }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}><Icon size={19} /></div>
      <div className="metric-copy"><span>{label}</span><strong>{value}</strong></div>
      <span className={`metric-trend ${trend < 0 ? 'down' : ''}`}>{trend < 0 ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}{Math.abs(trend)}%</span>
      <small>{note}</small>
    </article>
  )
}

function PerformanceChart() {
  const points = chartData.map((value, index) => `${(index / (chartData.length - 1)) * 100},${100 - value}`).join(' ')
  return (
    <div className="chart-wrap">
      <div className="chart-y-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span></div>
      <svg className="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Fourteen day confirmation rate trend">
        <g className="grid-lines"><line x1="0" y1="0" x2="100" y2="0" /><line x1="0" y1="25" x2="100" y2="25" /><line x1="0" y1="50" x2="100" y2="50" /><line x1="0" y1="75" x2="100" y2="75" /></g>
        <polyline className="chart-line-shadow" points={points} />
        <polyline className="chart-line" points={points} />
        <circle cx="100" cy="16" r="2.2" className="chart-dot" />
      </svg>
      <div className="chart-x-labels"><span>6 Sep</span><span>10 Sep</span><span>14 Sep</span><span>Today</span></div>
    </div>
  )
}

export function Overview({ orders, onOpenOrder, setPage }) {
  return (
    <div className="page-stack">
      <section className="demo-banner"><span>DEMO DATA</span><p>Connections are pending. This workspace is showing a realistic operating preview.</p><button onClick={() => setPage('automations')}>Review connection slots <ArrowRight size={14} /></button></section>
      <section className="metrics-grid">
        <MetricCard label="COD orders today" value="24" note="Compared with yesterday" tone="ink" icon={ShoppingBag} trend={14} />
        <MetricCard label="Awaiting confirmation" value="8" note="3 need attention soon" tone="amber" icon={Clock3} trend={-6} />
        <MetricCard label="Confirmation rate" value="71%" note="Past 7 days" tone="green" icon={CheckCircle2} trend={8} />
        <MetricCard label="Protected revenue" value="Rs 184.5k" note="Confirmed before dispatch" tone="blue" icon={ShieldCheck} trend={21} />
      </section>

      <section className="overview-grid">
        <article className="panel performance-panel">
          <div className="panel-head"><div><span className="eyebrow">Performance</span><h2>Confirmation rate</h2></div><div className="legend"><span /><span>14-day rate</span></div></div>
          <PerformanceChart />
        </article>
        <article className="panel attention-panel">
          <div className="panel-head"><div><span className="eyebrow">Action queue</span><h2>Needs attention</h2></div><span className="count-badge">3</span></div>
          <button className="attention-row" onClick={() => onOpenOrder(orders.find((order) => order.status === 'UNVERIFIED'))}><span className="attention-icon red">!</span><span><strong>Missing phone number</strong><small>Order #1289 · Rs 6,175</small></span><ArrowRight size={16} /></button>
          <button className="attention-row" onClick={() => onOpenOrder(orders.find((order) => order.status === 'REMINDED'))}><span className="attention-icon amber"><Clock3 size={14} /></span><span><strong>Second reminder due</strong><small>Order #1292 · waiting 44 min</small></span><ArrowRight size={16} /></button>
          <button className="attention-row" onClick={() => onOpenOrder(orders.find((order) => order.status === 'CANCELLED'))}><span className="attention-icon blue"><MessageSquareMore size={14} /></span><span><strong>Shopify tag pending</strong><small>Order #1291 · cancelled</small></span><ArrowRight size={16} /></button>
        </article>
      </section>

      <section className="panel recent-panel">
        <div className="panel-head"><div><span className="eyebrow">Live queue</span><h2>Recent COD orders</h2></div><button className="text-button" onClick={() => setPage('orders')}>View all orders <ArrowRight size={14} /></button></div>
        <div className="table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>City</th><th>Amount</th><th>Status</th><th>Placed</th><th /></tr></thead><tbody>
          {orders.slice(0, 5).map((order) => <tr key={order.id} onClick={() => onOpenOrder(order)}><td><strong>{order.shopifyId}</strong><small>{order.id}</small></td><td><div className="customer-cell"><span className="customer-avatar">{order.initials}</span><span><strong>{order.customer}</strong><small>{order.phone}</small></span></div></td><td>{order.city}</td><td><strong>{formatPKR(order.amount)}</strong></td><td><StatusPill status={order.status} /></td><td>{order.placed}</td><td><ArrowRight size={15} /></td></tr>)}
        </tbody></table></div>
      </section>

      <section className="bottom-grid">
        <article className="panel integrations-panel"><div className="panel-head"><div><span className="eyebrow">Infrastructure</span><h2>Connection readiness</h2></div><button className="text-button" onClick={() => setPage('automations')}>Manage <ArrowRight size={14} /></button></div><div className="compact-integrations">{integrations.map((item) => <FastnWidgetSlot key={item.key} integration={item} compact />)}</div></article>
        <article className="panel activity-panel"><div className="panel-head"><div><span className="eyebrow">Audit trail</span><h2>Latest activity</h2></div></div><div className="activity-list">{activity.slice(0, 4).map((item) => <div className="activity-item" key={item.time + item.title}><span className={`activity-dot ${item.tone}`} /><span><strong>{item.title}</strong><small>{item.detail}</small></span><time>{item.time}</time></div>)}</div></article>
      </section>
    </div>
  )
}
