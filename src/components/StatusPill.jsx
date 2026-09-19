const labels = {
  PENDING: 'Awaiting reply',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  REMINDED: 'Reminder sent',
  UNVERIFIED: 'Needs review',
}

export function StatusPill({ status }) {
  return <span className={`status-pill status-${status.toLowerCase()}`}><span />{labels[status] ?? status}</span>
}
