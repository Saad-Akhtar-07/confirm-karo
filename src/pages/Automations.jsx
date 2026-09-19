import { Check, CircleDot, Cloud, LockKeyhole, ShieldCheck, Workflow } from 'lucide-react'
import { FastnWidgetSlot } from '../components/FastnWidgetSlot'

export function Automations({ dashboard }) {
  const widgetUrl = import.meta.env.VITE_FASTN_WIDGET_URL
  return <div className="page-stack">
    <section className="automation-intro"><div className="automation-icon"><Workflow size={25} /></div><div><span className="eyebrow">Fastn integration layer</span><h2>Three connections. Three published workflows. One safe operating model.</h2><p>Shopify creates the work, WhatsApp captures the decision, and Google Sheets remains the shared audit ledger. ConfirmKaro applies tags only—never automatic cancellation or fulfillment.</p></div><span className="secure-note"><LockKeyhole size={14} /> Credentials stay in Fastn and Cloudflare</span></section>

    <section className="integration-grid">{dashboard.connections.map((item) => <FastnWidgetSlot key={item.key} integration={item} />)}</section>

    <section className="panel workflow-panel"><div className="panel-head"><div><span className="eyebrow">Published automation</span><h2>Workflow topology</h2><p>Running in the Fastn test environment for merchant <code>{dashboard.meta.merchantId}</code>.</p></div><span className="count-badge muted">3 workflows</span></div><div className="workflow-list">{dashboard.workflows.map((workflow) => <article className="workflow-row" key={workflow.id}><span className="workflow-number">{workflow.step}</span><div><strong>{workflow.name}</strong><p>{workflow.description}</p><small className="workflow-trigger">{workflow.trigger}</small></div><span className="milestone-tag">{workflow.version}</span><div className={`workflow-state ${workflow.status === 'MONITORING' ? 'monitoring' : ''}`}>{workflow.status === 'LIVE' ? <><Check size={14} /> Live</> : <><CircleDot size={14} /> Monitoring</>}</div><span className="workflow-id">{workflow.id.replace('wf_', '')}</span></article>)}</div></section>

    <section className="system-grid"><article className="panel system-card"><span className="system-icon"><Cloud size={18} /></span><div><span className="eyebrow">Webhook ingress</span><h3>Cloudflare Worker deployed</h3><p>Meta signatures are verified before the raw webhook envelope is forwarded to WF-02.</p><code>confirmkaro-whatsapp-ingress.confirmkaro.workers.dev</code></div></article><article className="panel system-card"><span className="system-icon safe"><ShieldCheck size={18} /></span><div><span className="eyebrow">Safety contract</span><h3>Tags and do-not-ship only</h3><p>Customer replies update the ledger and Shopify tags. No workflow cancels or fulfills an order.</p></div></article></section>

    {widgetUrl ? <section className="panel embedded-widget-shell"><div className="panel-head"><div><span className="eyebrow">Configuration</span><h2>Fastn control widget</h2></div></div><iframe src={widgetUrl} title="ConfirmKaro Fastn configuration" allow="clipboard-write" /></section> : <section className="widget-ready"><Check size={16} /><span><strong>Unified widget ready.</strong> Set <code>VITE_FASTN_WIDGET_URL</code> when an authenticated embed URL is available; no provider secret is exposed to the browser.</span></section>}
  </div>
}
