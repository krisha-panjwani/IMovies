import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import toast from 'react-hot-toast'
import { bookingsApi, showsApi } from '../api'
import { getErrorMessage } from '../api/http'
import useFetch from '../hooks/useFetch'
import ShowSummary from '../components/ShowSummary'
import { ErrorState, PageLoader } from '../components/States'
import { formatDate, formatPrice, formatTime, priceSelection, TIER_LABELS } from '../utils/format'
import { UPI_APPS } from '../utils/payments'

function UpiIcon({ app, size = 40 }) {
  return (
    <span className="upi-icon" style={{ '--upi': app.color, width: size, height: size }} aria-hidden="true">
      {app.initials}
    </span>
  )
}

export default function Checkout() {
  const { showId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [method, setMethod] = useState('')
  const [paying, setPaying] = useState(false) // demo payment window open
  const [submitting, setSubmitting] = useState(false)
  const { data: show, loading, error, reload } = useFetch(() => showsApi.get(showId), [showId])

  const seatCodes = (params.get('seats') || '').split(',').filter(Boolean)

  if (loading) return <PageLoader />
  if (error) {
    return (
      <div className="container py-5">
        <ErrorState message={error} onRetry={reload} />
      </div>
    )
  }

  const seats = priceSelection(show, seatCodes).filter((s) => s.tier)
  const total = seats.reduce((sum, s) => sum + s.price, 0)
  const app = UPI_APPS.find((a) => a.id === method)
  const backToSeats = (keepSeats = seatCodes) => navigate(`/shows/${showId}/seats`, { state: { keepSeats } })

  if (seats.length === 0) {
    return (
      <div className="container py-5">
        <ErrorState message="No seats selected. Please choose your seats first." onRetry={() => backToSeats([])} />
      </div>
    )
  }

  const startPayment = () => {
    if (!method) {
      toast.error('Choose PhonePe, Google Pay or Paytm to pay')
      return
    }
    setPaying(true)
  }

  // Called when the user confirms the simulated payment. The server re-checks
  // the seats and price, so this is the moment the seats are actually reserved.
  const completeBooking = async () => {
    setSubmitting(true)
    try {
      const booking = await bookingsApi.create(showId, seatCodes, method)
      toast.success('Booking confirmed!')
      navigate(`/bookings/${booking.bookingRef}`, { replace: true })
    } catch (err) {
      setPaying(false)
      setSubmitting(false)
      toast.error(getErrorMessage(err), { duration: 5000 })
      // Someone else took a seat: go back to the seat map, keeping the seats that are still free.
      if (err.response?.status === 409) {
        const taken = err.response.data.errors?.takenSeats || []
        backToSeats(seatCodes.filter((c) => !taken.includes(c)))
      }
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 820 }}>
      <Link to={`/shows/${showId}/seats`} state={{ keepSeats: seatCodes }} className="btn btn-ghost btn-sm mb-3">
        <i className="bi bi-arrow-left me-1" aria-hidden="true" />
        Change seats
      </Link>
      <h1 className="h3 mb-4">Review and pay</h1>

      <div className="surface p-4 mb-3">
        <ShowSummary show={show} />
      </div>

      <div className="surface p-4 mb-3">
        <h2 className="h6 text-muted-im text-uppercase small mb-3">Tickets</h2>
        <table className="table mb-0">
          <tbody>
            {seats.map((seat) => (
              <tr key={seat.code}>
                <td>
                  <i className="bi bi-person-square me-2 text-muted-im" aria-hidden="true" />
                  Seat {seat.code}
                </td>
                <td className="text-muted-im">{TIER_LABELS[seat.tier]}</td>
                <td className="text-end">{formatPrice(seat.price)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={2} className="pt-3 border-0">
                Total ({seats.length} {seats.length === 1 ? 'ticket' : 'tickets'})
              </th>
              <th className="text-end pt-3 border-0 h5">{formatPrice(total)}</th>
            </tr>
          </tfoot>
        </table>
      </div>

      <section className="surface p-4 mb-3" aria-labelledby="pay-heading">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h2 id="pay-heading" className="h6 text-muted-im text-uppercase small mb-0">
            Pay with UPI
          </h2>
          <span className="badge text-bg-warning">Demo payment</span>
        </div>
        <div className="upi-grid" role="radiogroup" aria-label="Choose a UPI app">
          {UPI_APPS.map((option) => (
            <label key={option.id} className={`upi-option ${method === option.id ? 'active' : ''}`} style={{ '--upi': option.color }}>
              <input
                type="radio"
                name="upi"
                value={option.id}
                checked={method === option.id}
                onChange={() => setMethod(option.id)}
                aria-label={`${option.name} (demo UPI)`}
                className="visually-hidden"
              />
              <UpiIcon app={option} />
              <span className="fw-semibold">{option.name}</span>
              <i className={`bi ${method === option.id ? 'bi-check-circle-fill' : 'bi-circle'} ms-auto`} aria-hidden="true" />
            </label>
          ))}
        </div>
      </section>

      <div className="demo-banner mb-4">
        <i className="bi bi-info-circle-fill mt-1" aria-hidden="true" />
        <div>
          <strong>Demo payment.</strong> IMovies is a student project and is not connected to PhonePe, Google Pay, Paytm
          or any bank. No UPI request is sent and no money is charged. Confirming reserves these seats in IMovies&apos;
          own demo schedule. It does not buy a real ticket at the cinema.
        </div>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="small text-muted-im">
          {formatDate(show.startTime)}, {formatTime(show.startTime)} · Free cancellation up to 2 hours before the show
        </div>
        <button type="button" className="btn btn-primary btn-lg px-5" onClick={startPayment}>
          {app ? `Pay ${formatPrice(total)} with ${app.name}` : `Pay ${formatPrice(total)}`}
        </button>
      </div>

      <Modal show={paying} onHide={() => !submitting && setPaying(false)} centered backdrop="static">
        <Modal.Header closeButton={!submitting}>
          <Modal.Title className="h5">Demo UPI payment</Modal.Title>
        </Modal.Header>
        {app && (
          <Modal.Body className="text-center py-4">
            <UpiIcon app={app} size={64} />
            <div className="h3 mt-3 mb-1">{formatPrice(total)}</div>
            <div className="text-muted-im mb-3">
              to IMovies via {app.name} · {seats.length} {seats.length === 1 ? 'ticket' : 'tickets'}
            </div>
            <p className="small text-muted-im mb-0">
              In a real app, you would now approve this request in the {app.name} app. This is a{' '}
              <strong className="text-white">simulation</strong>: nothing is sent to {app.name} and no money is charged.
            </p>
          </Modal.Body>
        )}
        <Modal.Footer className="justify-content-between">
          <button type="button" className="btn btn-ghost" onClick={() => setPaying(false)} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={completeBooking} disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2 text-white" aria-hidden="true" />
                Confirming booking…
              </>
            ) : (
              'Simulate successful payment'
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
