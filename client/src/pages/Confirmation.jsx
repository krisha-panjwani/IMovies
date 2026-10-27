import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import { downloadTicketPdf } from '../utils/ticketPdf'
import { bookingsApi } from '../api'
import useFetch from '../hooks/useFetch'
import { ErrorState, PageLoader } from '../components/States'
import { formatDate, formatPrice, formatTime } from '../utils/format'
import { paymentLabel } from '../utils/payments'

// The QR holds the ticket details as plain text, so any phone camera can
// read it without the app running. It is clearly marked as a demo ticket.
function qrText(booking) {
  const { show } = booking
  return [
    `IMovies booking ${booking.bookingRef}`,
    show?.movie?.title,
    show && `${show.cinema?.name}, ${show.cinema?.locality}, ${show.cinema?.city}`,
    show && `${formatDate(show.startTime)}, ${formatTime(show.startTime)} - ${show.screenName}`,
    `Seats: ${booking.seats.map((s) => s.code).join(', ')}`,
    `Total: Rs ${booking.totalAmount}`,
    'DEMO TICKET - not valid for cinema entry',
  ]
    .filter(Boolean)
    .join('\n')
}

export default function Confirmation() {
  const { ref } = useParams()
  const { data: booking, loading, error, reload } = useFetch(() => bookingsApi.getByRef(ref), [ref])
  const qrCanvas = useRef(null)
  const [downloading, setDownloading] = useState(false)

  const download = async () => {
    setDownloading(true)
    try {
      await downloadTicketPdf(booking, qrCanvas.current?.toDataURL('image/png'))
      toast.success('Ticket downloaded')
    } catch {
      toast.error('Could not create the PDF. Try "Print ticket" and choose "Save as PDF".')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <PageLoader label="Loading your ticket…" />
  if (error) {
    return (
      <div className="container py-5">
        <ErrorState message={error} onRetry={reload} />
      </div>
    )
  }

  const { show } = booking
  const cancelled = booking.status === 'cancelled'

  return (
    <div className="container py-5">
      <div className="ticket">
        <div className="ticket-head">
          <div className="d-flex align-items-center gap-2 mb-3">
            {cancelled ? (
              <span className="status-badge status-cancelled">
                <i className="bi bi-x-circle me-1" aria-hidden="true" />
                Cancelled
              </span>
            ) : (
              <span className="status-badge status-confirmed">
                <i className="bi bi-check-circle-fill me-1" aria-hidden="true" />
                Booking confirmed
              </span>
            )}
          </div>
          <div className="small text-muted-im mb-1">IMovies - Movie ticket booking made simple</div>
          <h1 className="h3 mb-1">{show?.movie?.title || 'Show removed'}</h1>
          <div className="text-muted-im">
            {[show?.movie?.certificate, show?.language || show?.movie?.language].filter(Boolean).join(' · ')}
          </div>
        </div>

        <div className="ticket-divider" />

        <div className="p-4">
          <dl>
            <div>
              <dt>Date</dt>
              <dd>{show ? formatDate(show.startTime, { weekday: 'long', day: 'numeric', month: 'long' }) : '-'}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{show ? formatTime(show.startTime) : '-'}</dd>
            </div>
            <div>
              <dt>Cinema</dt>
              <dd>
                {show?.cinema?.name}
                <div className="small text-muted-im fw-normal">{show?.cinema?.locality}, {show?.cinema?.city}</div>
              </dd>
            </div>
            <div>
              <dt>Screen</dt>
              <dd>{show?.screenName}</dd>
            </div>
            <div>
              <dt>Seats</dt>
              <dd>{booking.seats.map((s) => s.code).join(', ')}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>
                {formatPrice(booking.totalAmount)}
                <div className="small text-muted-im fw-normal">
                  {booking.paymentMethod ? `Paid via ${paymentLabel(booking.paymentMethod)} (UPI) · demo` : 'Demo checkout'}, no
                  money charged
                </div>
              </dd>
            </div>
            {booking.paymentRef && (
              <div>
                <dt>Transaction ref</dt>
                <dd className="font-monospace small">{booking.paymentRef}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="ticket-divider" />

        <div className="p-4 ticket-qr-row">
          <div className={`ticket-qr ${cancelled ? 'is-void' : ''}`}>
            <QRCodeSVG
              value={qrText(booking)}
              size={148}
              level="M"
              marginSize={2}
              bgColor="#ffffff"
              fgColor="#0b0d12"
              title={`QR code for booking ${booking.bookingRef}`}
            />
            {cancelled && <span className="qr-void-label">Cancelled</span>}
            {/* Same QR drawn on a canvas so it can be embedded in the PDF. */}
            <QRCodeCanvas ref={qrCanvas} value={qrText(booking)} size={256} level="M" marginSize={2} className="d-none" aria-hidden="true" />
          </div>
          <div className="text-center text-sm-start">
            <div className="small text-muted-im mb-1">Booking reference</div>
            <div className="ticket-ref">{booking.bookingRef}</div>
            <div className="small text-muted-im mt-2">
              Scan the QR to read the booking details on any phone.
              <br />
              IMovies demo booking: not a ticket issued by the cinema and not valid for entry.
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap justify-content-center gap-2 mt-4 no-print">
        <Link to="/my-bookings" className="btn btn-primary">
          <i className="bi bi-ticket-perforated me-2" aria-hidden="true" />
          My bookings
        </Link>
        <button type="button" className="btn btn-outline-light" onClick={download} disabled={downloading}>
          <i className="bi bi-download me-2" aria-hidden="true" />
          {downloading ? 'Preparing PDF…' : 'Download ticket (PDF)'}
        </button>
        <button type="button" className="btn btn-outline-light" onClick={() => window.print()}>
          <i className="bi bi-printer me-2" aria-hidden="true" />
          Print ticket
        </button>
        <Link to="/movies" className="btn btn-ghost">
          Browse more movies
        </Link>
      </div>
    </div>
  )
}
