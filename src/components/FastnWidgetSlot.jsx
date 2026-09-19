import { useState } from 'react'
import { ArrowUpRight, CheckCircle2, ChevronUp, PlugZap } from 'lucide-react'

const widgetUrls = {
  shopify: import.meta.env.VITE_FASTN_SHOPIFY_WIDGET_URL,
  metaWhatsapp: import.meta.env.VITE_FASTN_META_WHATSAPP_WIDGET_URL,
  sheets: import.meta.env.VITE_FASTN_SHEETS_WIDGET_URL,
}

export function FastnWidgetSlot({ integration, compact = false }) {
  const [notesOpen, setNotesOpen] = useState(false)
  const widgetUrl = widgetUrls[integration.key]

  if (widgetUrl) {
    return (
      <section className="embedded-widget" aria-label={`${integration.name} Fastn widget`}>
        <iframe src={widgetUrl} title={`${integration.name} setup`} allow="clipboard-write" />
      </section>
    )
  }

  return (
    <article className={`integration-card ${compact ? 'compact' : ''}`}>
      <div className="integration-head">
        <span className="integration-logo" style={{ '--brand-color': integration.color }}>{integration.name.slice(0, 1)}</span>
        <span><strong>{integration.name}</strong><small>{integration.purpose}</small></span>
        <span className="connection-state"><span /> Awaiting connection</span>
      </div>
      {!compact && (
        <div className="integration-body">
          <div className="integration-line"><PlugZap size={16} /><span>Fastn widget slot prepared</span><CheckCircle2 size={15} /></div>
          <p>Add the widget URL to <code>{integration.env}</code> when the connection is ready.</p>
          <button className="text-button" onClick={() => setNotesOpen((current) => !current)} aria-expanded={notesOpen}>
            {notesOpen ? 'Hide setup notes' : 'View setup notes'} {notesOpen ? <ChevronUp size={14} /> : <ArrowUpRight size={14} />}
          </button>
          {notesOpen && <div className="integration-note">Use an HTTPS Fastn embed URL. Keep provider credentials and tokens in Fastn Secrets—never in this frontend environment file.</div>}
        </div>
      )}
    </article>
  )
}
