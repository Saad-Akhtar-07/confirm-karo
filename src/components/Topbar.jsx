import { Bell, CalendarDays, Menu, Search } from 'lucide-react'

export function Topbar({ title, subtitle, onMenu, onSearch }) {
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
        <button className="date-button"><CalendarDays size={16} /><span>Today, 19 Sep</span></button>
        <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><span /></button>
        <button className="avatar-button" aria-label="Account menu">MS</button>
      </div>
    </header>
  )
}
