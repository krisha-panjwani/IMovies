import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { showsApi } from '../api'
import useFetch from '../hooks/useFetch'
import SeatMap, { SeatLegend } from '../components/SeatMap'
import ShowSummary from '../components/ShowSummary'
import { EmptyState, ErrorState, PageLoader } from '../components/States'
import { formatPrice, priceSelection, TIER_LABELS } from '../utils/format'

const MAX_SEATS = 10

export default function SelectSeats() {
  const { showId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  // Seats can come back from the checkout page ("Change seats") minus any that were taken.
  const [selected, setSelected] = useState(() => location.state?.keepSeats || [])
  const { data: show, loading, error, reload } = useFetch(() => showsApi.get(showId), [showId])

  if (loading) return <PageLoader label="Loading seat map…" />
  if (error) {
    return (
      <div className="container py-5">
        <ErrorState message={error} onRetry={reload} />
      </div>
    )
  }

  if (new Date(show.startTime) <= new Date()) {
    return (
      <div className="container py-5">
        <EmptyState icon="bi-clock-history" title="This show has already started" message="Choose another showtime.">
          <Link to={`/movies/${show.movie._id}`} className="btn btn-primary">
            See other showtimes
          </Link>
        </EmptyState>
      </div>
    )
  }

  const booked = new Set(show.bookedSeats)
  const validSelection = selected.filter((code) => !booked.has(code))
  const seats = priceSelection(show, validSelection)
  const total = seats.reduce((sum, s) => sum + s.price, 0)
  const soldOut = show.bookedSeats.length >= show.totalSeats

  const toggleSeat = (code) => {
    setSelected((current) => {
      if (current.includes(code)) return current.filter((c) => c !== code)
      if (current.length >= MAX_SEATS) {
        toast.error(`You can book up to ${MAX_SEATS} seats at a time`)
        return current
      }
      return [...current, code]
    })
  }

  const proceed = () => {
    const sorted = [...validSelection].sort((x, y) => x[0].localeCompare(y[0]) || Number(x.slice(1)) - Number(y.slice(1)))
    navigate(`/shows/${showId}/checkout?seats=${sorted.join(',')}`)
  }

  const tierCounts = seats.reduce((acc, s) => ({ ...acc, [s.tier]: (acc[s.tier] || 0) + 1 }), {})

  return (
    <>
      <div className="border-bottom" style={{ borderColor: 'var(--im-border)' }}>
        <div className="container py-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <ShowSummary show={show} />
          <button type="button" className="btn btn-ghost btn-sm" onClick={reload}>
            <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
            Refresh seats
          </button>
        </div>
      </div>

      <div className="container py-4">
        <SeatLegend />
        <p className="text-center small text-muted-im mt-2 mb-0">
          Seat availability shown here is IMovies demo data, not the cinema&apos;s live inventory.
        </p>
        {soldOut ? (
          <div className="mt-4">
            <EmptyState icon="bi-emoji-frown" title="This show is sold out" message="Every seat has been booked. Try another time.">
              <Link to={`/movies/${show.movie._id}`} className="btn btn-primary">
                See other showtimes
              </Link>
            </EmptyState>
          </div>
        ) : (
          <div className="mt-4">
            <SeatMap
              layout={show.seatLayout}
              prices={show.prices}
              bookedSeats={show.bookedSeats}
              selected={validSelection}
              onToggle={toggleSeat}
            />
          </div>
        )}
      </div>

      <div className="booking-bar">
        <div className="container py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            {seats.length === 0 ? (
              <span className="text-muted-im">Select up to {MAX_SEATS} seats</span>
            ) : (
              <>
                <div className="fw-semibold">
                  {validSelection.join(', ')}
                </div>
                <div className="small text-muted-im">
                  {Object.entries(tierCounts)
                    .map(([tier, count]) => `${count} × ${TIER_LABELS[tier]}`)
                    .join(' · ')}
                </div>
              </>
            )}
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div className="small text-muted-im">Total</div>
              <div className="h5 mb-0">{formatPrice(total)}</div>
            </div>
            <button type="button" className="btn btn-primary btn-lg px-4" disabled={seats.length === 0} onClick={proceed}>
              Proceed
              <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
