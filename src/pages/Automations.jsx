import { ArrowRight, Check, CircleDot, LockKeyhole, Workflow } from 'lucide-react'
import { integrations } from '../data/demo'
import { FastnWidgetSlot } from '../components/FastnWidgetSlot'

const workflows = [
  { step: '01', name: 'Order confirmation', description: 'New Shopify COD order → WhatsApp request → Sheet row', milestone: 'M2' },
  { step: '02', name: 'Customer response', description: 'WhatsApp reply → Shopify tag → Sheet status update', milestone: 'M3' },
  { step: '03', name: 'Reminder protection', description: 'No reply → reminder → do-not-ship flag', milestone: 'M4' },
]

export function Automations() {
  return (
    <div className="page-stack">
      <section className="automation-intro"><div className="automation-icon"><Workflow size={25} /></div><div><span className="eyebrow">Fastn integration layer</span><h2>Connect once. Keep operations visible.</h2><p>These boundaries stay stable while your team builds the workflows. Add each Fastn widget URL to the environment file when it is ready.</p></div><span className="secure-note"><LockKeyhole size={14} /> No credentials in frontend code</span></section>
      <section className="integration-grid">{integrations.map((item) => <FastnWidgetSlot key={item.key} integration={item} />)}</section>
      <section className="panel workflow-panel"><div className="panel-head"><div><span className="eyebrow">Delivery map</span><h2>Workflow rollout</h2></div><span className="count-badge muted">3 planned</span></div><div className="workflow-list">{workflows.map((workflow, index) => <article className="workflow-row" key={workflow.step}><span className="workflow-number">{workflow.step}</span><div><strong>{workflow.name}</strong><p>{workflow.description}</p></div><span className="milestone-tag">{workflow.milestone}</span><div className="workflow-state">{index === 0 ? <><CircleDot size={14} /> Ready to build</> : <><Check size={14} /> Planned</>}</div><ArrowRight size={17} /></article>)}</div></section>
    </div>
  )
}
