import { CalendarDays, Menu, RefreshCw, Search } from 'lucide-react'

export function Topbar({ title, subtitle, onMenu, onSearch, onRefresh, loading, updatedAt }) {
  const updated = new Intl.DateTimeFormat('en-PK', { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' }).format(new Date(updatedAt))
  return (
    <header className="topbar">
      <div className="title-group">
        <button className="icon-button mobile-menu" onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button>
        <div><h1>{title}</h1><p>{subtitle}</p></div>
      </div>
      <div className="topbar-actions">
        <label className="global-search">
          <Search size={16} />
          <input aria-label="Search orders" placeholder="Search orders" onChange={(event) => onSearch(event.target.value)} />
          <kbd>⌘ K</kbd>
        </label>
        <span className="date-button"><CalendarDays size={16} /><span>Updated {updated}</span></span>
        <button className="icon-button" onClick={onRefresh} disabled={loading} aria-label="Refresh dashboard"><RefreshCw size={17} className={loading ? 'spin' : ''} /></button>
        <span className="avatar-button" aria-label="Signed in as Muhammad Saad">MS</span>
      </div>
    </header>
  )
}
