import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import toast from 'react-hot-toast'
import { bookingsApi } from '../api'
import { getErrorMessage } from '../api/http'
import useFetch from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import Poster from '../components/Poster'
import { EmptyState, ErrorState, PageLoader } from '../components/States'
import { formatDate, formatPrice, formatTime } from '../utils/format'
import { paymentLabel } from '../utils/payments'

const CANCEL_CUTOFF_MS = 2 * 60 * 60 * 1000

const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'cancelled', label: 'Cancelled' },
]

function categorize(booking) {
  if (booking.status === 'cancelled') return 'cancelled'
  if (!booking.show || new Date(booking.show.startTime) <= new Date()) return 'past'
  return 'upcoming'
}

export default function MyBookings() {
  const { user } = useAuth()
  const [tab, setTab] = useState('upcoming')
  const [toCancel, setToCancel] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const { data, loading, error, reload } = useFetch(() => bookingsApi.mine())

  const confirmCancel = async () => {
    setCancelling(true)
    try {
      await bookingsApi.cancel(toCancel._id)
      toast.success('Booking cancelled and seats released')
      setToCancel(null)
      reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCancelling(false)
    }
  }

  const bookings = (data || []).filter((b) => categorize(b) === tab)
  if (tab === 'upcoming') bookings.sort((a, b) => new Date(a.show.startTime) - new Date(b.show.startTime))

  return (
    <div className="container py-5" style={{ maxWidth: 920 }}>
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
        <div>
          <span className="eyebrow">Hi, {user.name.split(' ')[0]}</span>
          <h1 className="h2 mb-0">My bookings</h1>
        </div>
        <div className="chip-row" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`chip ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {data && <span className="opacity-75">({data.filter((b) => categorize(b) === t.id).length})</span>}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="bi-ticket-perforated"
          title={tab === 'upcoming' ? 'No upcoming bookings' : `No ${tab} bookings`}
          message={tab === 'upcoming' ? 'Find a movie you like and book your seats in a few clicks.' : undefined}
        >
          {tab === 'upcoming' && (
            <Link to="/movies" className="btn btn-primary">
              Browse movies
            </Link>
          )}
        </EmptyState>
      ) : (
        <div className="d-grid gap-3">
          {bookings.map((booking) => {
            const { show } = booking
            const movie = show?.movie || { title: 'Show removed', genres: [] }
            const canCancel =
              booking.status === 'confirmed' && show && new Date(show.startTime) - Date.now() >= CANCEL_CUTOFF_MS
            const category = categorize(booking)
            return (
              <article key={booking._id} className="surface booking-card">
                <Poster movie={movie} />
                <div className="min-w-0">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h2 className="h6 mb-0 text-truncate">{movie.title}</h2>
                    <span className={`status-badge status-${category === 'past' ? 'past' : booking.status}`}>
                      {category === 'past' ? 'Watched' : booking.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}
                    </span>
                  </div>
                  {show && (
                    <div className="small text-muted-im">
                      {formatDate(show.startTime)}, {formatTime(show.startTime)} · {show.cinema?.name}, {show.cinema?.locality} ·{' '}
                      {show.screenName}
                      {show.language && <> · {show.language}</>}
                    </div>
                  )}
                  <div className="small mt-1">
                    Seats <strong>{booking.seats.map((s) => s.code).join(', ')}</strong> · {formatPrice(booking.totalAmount)}
                    <span className="text-muted-im">
                      {booking.paymentMethod && <> · {paymentLabel(booking.paymentMethod)} (demo)</>} · Ref {booking.bookingRef}
                    </span>
                  </div>
                </div>
                <div className="booking-actions d-flex gap-2">
                  <Link to={`/bookings/${booking.bookingRef}`} className="btn btn-outline-light btn-sm">
                    View ticket
                  </Link>
                  {canCancel && (
                    <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={() => setToCancel(booking)}>
                      Cancel
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <p className="small text-muted-im mt-4">
        <i className="bi bi-info-circle me-1" aria-hidden="true" />
        Cancellation policy: bookings can be cancelled free of charge up to 2 hours before the show starts.
      </p>

      <Modal show={Boolean(toCancel)} onHide={() => setToCancel(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5">Cancel this booking?</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-muted-im">
          {toCancel && (
            <>
              Seats <strong className="text-white">{toCancel.seats.map((s) => s.code).join(', ')}</strong> for{' '}
              <strong className="text-white">{toCancel.show?.movie?.title}</strong> will be released for other people
              to book. This cannot be undone.
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-ghost" onClick={() => setToCancel(null)}>
            Keep booking
          </button>
          <button type="button" className="btn btn-primary" onClick={confirmCancel} disabled={cancelling}>
            {cancelling ? 'Cancelling…' : 'Yes, cancel'}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
