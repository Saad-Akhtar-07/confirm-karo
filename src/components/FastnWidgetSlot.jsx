import { CheckCircle2, PlugZap } from 'lucide-react'

export function FastnWidgetSlot({ integration, compact = false }) {
  return (
    <article className={`integration-card ${compact ? 'compact' : ''}`}>
      <div className="integration-head">
        <span className="integration-logo" style={{ '--brand-color': integration.color }}>{integration.name.slice(0, 1)}</span>
        <span><strong>{integration.name}</strong><small>{integration.purpose}</small></span>
        <span className="connection-state active"><span /> Active</span>
      </div>
      {!compact && (
        <div className="integration-body">
          <div className="integration-line"><PlugZap size={16} /><span>{integration.auth} authentication</span><CheckCircle2 size={15} /></div>
          <p>{integration.detail}</p>
          <div className="integration-note">Credentials are managed outside the browser and are never shipped with this frontend.</div>
        </div>
      )}
    </article>
  )
}
