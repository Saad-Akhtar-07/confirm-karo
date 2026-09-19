import { activity } from '../data/demo'

export function ActivityLog() {
  const repeated = [...activity, ...activity.map((item, index) => ({ ...item, time: `${8 - index}:2${index} AM`, title: index % 2 ? 'Order imported from Shopify' : item.title, detail: index % 2 ? `Order #${1286 - index} · COD detected` : item.detail }))]
  return <section className="panel full-activity"><div className="panel-head"><div><span className="eyebrow">System events</span><h2>Activity log</h2><p>Every order transition will remain traceable here.</p></div><button className="secondary-button">Export CSV</button></div><div className="activity-table">{repeated.map((item, index) => <div className="activity-log-row" key={`${item.time}-${index}`}><time>{item.time}</time><span className={`activity-dot ${item.tone}`} /><div><strong>{item.title}</strong><small>{item.detail}</small></div><span className="source-label">{index % 3 === 0 ? 'WhatsApp' : index % 3 === 1 ? 'Shopify' : 'Sheets'}</span></div>)}</div></section>
}
