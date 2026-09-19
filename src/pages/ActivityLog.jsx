import { Download } from 'lucide-react'

function csvCell(value) { return `"${String(value).replaceAll('"', '""')}"` }

export function ActivityLog({ dashboard, dataMode }) {
  const exportCsv = () => {
    const rows = [['time', 'source', 'event', 'detail'], ...dashboard.activity.map((item) => [item.time, item.source, item.title, item.detail])]
    const blob = new Blob([rows.map((row) => row.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'confirmkaro-activity.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return <section className="panel full-activity"><div className="panel-head"><div><span className="eyebrow">System events · {dataMode === 'live' ? 'live API' : 'verified snapshot'}</span><h2>Activity log</h2><p>Cross-system events are presented as an audit trail; operational writes remain inside Fastn.</p></div><button className="secondary-button" onClick={exportCsv}><Download size={15} /> Export CSV</button></div><div className="activity-table">{dashboard.activity.map((item, index) => <div className="activity-log-row" key={`${item.time}-${index}`}><time>{item.time}</time><span className={`activity-dot ${item.tone}`} /><div><strong>{item.title}</strong><small>{item.detail}</small></div><span className="source-label">{item.source}</span></div>)}</div></section>
}
