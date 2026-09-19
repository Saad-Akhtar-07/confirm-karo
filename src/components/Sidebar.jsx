import { Activity, Boxes, LayoutDashboard, MessageCircleMore, Settings2, ShoppingBag, Workflow, X } from 'lucide-react'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, count: 8 },
  { id: 'automations', label: 'Automations', icon: Workflow },
  { id: 'activity', label: 'Activity log', icon: Activity },
]

export function Sidebar({ page, setPage, open, onClose }) {
  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand-row">
        <button className="brand" onClick={() => setPage('overview')} aria-label="Go to overview">
          <span className="brand-mark"><MessageCircleMore size={19} strokeWidth={2.4} /></span>
          <span>Confirm<span>Karo</span></span>
        </button>
        <button className="icon-button sidebar-close" onClick={onClose} aria-label="Close menu"><X size={20} /></button>
      </div>

      <div className="workspace-card">
        <span className="workspace-icon"><Boxes size={17} /></span>
        <span><small>Workspace</small><strong>Demo Store PK</strong></span>
        <span className="workspace-chevron">⌄</span>
      </div>

      <nav className="primary-nav" aria-label="Main navigation">
        <span className="nav-label">Operations</span>
        {navItems.map(({ id, label, icon: Icon, count }) => (
          <button key={id} className={page === id ? 'nav-item active' : 'nav-item'} onClick={() => { setPage(id); onClose() }}>
            <Icon size={18} strokeWidth={1.9} />
            <span>{label}</span>
            {count ? <em>{count}</em> : null}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item"><Settings2 size={18} /><span>Settings</span></button>
        <div className="system-state"><span className="pulse-dot" /><span><strong>Demo mode</strong><small>Fastn slots ready</small></span></div>
      </div>
    </aside>
  )
}
