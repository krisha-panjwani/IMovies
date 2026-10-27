import { NavLink, Outlet } from 'react-router-dom'

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: 'bi-speedometer2', end: true },
  { to: '/admin/movies', label: 'Movies', icon: 'bi-film' },
  { to: '/admin/cinemas', label: 'Cinemas', icon: 'bi-building' },
  { to: '/admin/shows', label: 'Shows', icon: 'bi-calendar-week' },
  { to: '/admin/bookings', label: 'Bookings', icon: 'bi-ticket-perforated' },
]

export default function AdminLayout() {
  return (
    <div className="container py-4">
      <div className="admin-layout">
        <nav className="surface admin-nav" aria-label="Admin">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              <i className={`bi ${link.icon}`} aria-hidden="true" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export function AdminHeader({ title, subtitle, children }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
      <div>
        <span className="eyebrow">Admin</span>
        <h1 className="h3 mb-0">{title}</h1>
        {subtitle && <p className="text-muted-im small mb-0 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
