import { Link } from 'react-router-dom'
import { bookingsApi, cinemasApi, moviesApi, showsApi } from '../../api'
import useFetch from '../../hooks/useFetch'
import { ErrorState, PageLoader } from '../../components/States'
import { AdminHeader } from './AdminLayout'
import { formatDateTime, formatPrice } from '../../utils/format'

export default function AdminDashboard() {
  const { data, loading, error, reload } = useFetch(() =>
    Promise.all([moviesApi.list(), cinemasApi.list(), showsApi.list(), bookingsApi.all()]),
  )

  if (loading) return <PageLoader />
  if (error) return <ErrorState message={error} onRetry={reload} />

  const [movies, cinemas, shows, bookings] = data
  const confirmed = bookings.filter((b) => b.status === 'confirmed')
  const revenue = confirmed.reduce((sum, b) => sum + b.totalAmount, 0)
  const ticketsSold = confirmed.reduce((sum, b) => sum + b.seats.length, 0)

  const stats = [
    { label: 'Active movies', value: movies.length, icon: 'bi-film' },
    { label: 'Cinemas', value: cinemas.length, icon: 'bi-building' },
    { label: 'Upcoming shows', value: shows.length, icon: 'bi-calendar-week' },
    { label: 'Tickets sold', value: ticketsSold, icon: 'bi-ticket-perforated' },
    { label: 'Demo revenue', value: formatPrice(revenue), icon: 'bi-currency-rupee' },
  ]

  return (
    <>
      <AdminHeader title="Dashboard" subtitle="Live figures from bookings made in IMovies. Revenue is from demo payments: no real money is involved." />
      <div className="row g-3 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="col-6 col-xl">
            <div className="surface stat-card h-100">
              <i className={`bi ${s.icon}`} aria-hidden="true" />
              <div className="value mt-1">{s.value}</div>
              <div className="label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="surface p-3">
        <div className="d-flex justify-content-between align-items-center mb-2 px-1">
          <h2 className="h6 mb-0">Latest bookings</h2>
          <Link to="/admin/bookings" className="btn btn-ghost btn-sm">
            View all
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Customer</th>
                <th>Movie</th>
                <th>Show</th>
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 8).map((b) => (
                <tr key={b._id}>
                  <td className="font-monospace small">{b.bookingRef}</td>
                  <td className="small">{b.user?.name}</td>
                  <td>{b.show?.movie?.title || '-'}</td>
                  <td className="small text-muted-im">{b.show ? formatDateTime(b.show.startTime) : '-'}</td>
                  <td className="text-end">{formatPrice(b.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
