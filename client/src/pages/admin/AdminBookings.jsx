import { useState } from 'react'
import { bookingsApi } from '../../api'
import useFetch from '../../hooks/useFetch'
import { EmptyState, ErrorState, PageLoader } from '../../components/States'
import { AdminHeader } from './AdminLayout'
import { formatDateTime, formatPrice } from '../../utils/format'
import { paymentLabel } from '../../utils/payments'

export default function AdminBookings() {
  const { data, loading, error, reload } = useFetch(() => bookingsApi.all())
  const [status, setStatus] = useState('')
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const bookings = (data || []).filter(
    (b) =>
      (!status || b.status === status) &&
      (!q ||
        b.bookingRef.toLowerCase().includes(q) ||
        b.user?.email.toLowerCase().includes(q) ||
        b.show?.movie?.title.toLowerCase().includes(q)),
  )

  return (
    <>
      <AdminHeader title="Bookings" subtitle="The latest 300 bookings across all cinemas." />

      <div className="row g-2 mb-3">
        <div className="col-md-8">
          <input
            type="search"
            className="form-control"
            placeholder="Search by reference, email or movie"
            aria-label="Search bookings"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select className="form-select" aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : bookings.length === 0 ? (
        <EmptyState icon="bi-ticket-perforated" title="No bookings found" />
      ) : (
        <div className="surface p-2 table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Customer</th>
                <th>Movie · Show</th>
                <th>Seats</th>
                <th>Paid via (demo)</th>
                <th>Status</th>
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td className="font-monospace small">{b.bookingRef}</td>
                  <td className="small">
                    {b.user?.name}
                    <div className="text-muted-im">{b.user?.email}</div>
                  </td>
                  <td className="small">
                    {b.show?.movie?.title || 'Show removed'}
                    {b.show && <div className="text-muted-im">{formatDateTime(b.show.startTime)} · {b.show.cinema?.name}</div>}
                  </td>
                  <td className="small">{b.seats.map((s) => s.code).join(', ')}</td>
                  <td className="small">{b.paymentMethod ? paymentLabel(b.paymentMethod) : '-'}</td>
                  <td>
                    <span className={`status-badge status-${b.status}`}>{b.status}</span>
                  </td>
                  <td className="text-end">{formatPrice(b.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
