import { Link } from 'react-router-dom'
import { formatTime } from '../utils/format'

// Showtime buttons. Colour shows availability: green = available,
// amber = under 25% of seats left, struck through = sold out.
export default function ShowtimePills({ shows, showLanguage = false }) {
  return (
    <div className="d-flex flex-wrap gap-2">
      {shows.map((show) => {
        const ratioLeft = show.seatsLeft / show.totalSeats
        const state = show.seatsLeft === 0 ? 'soldout' : ratioLeft < 0.25 ? 'filling' : ''
        const detail =
          state === 'soldout' ? 'Sold out' : state === 'filling' ? `${show.seatsLeft} left` : showLanguage ? show.language : show.screenName
        return (
          <Link
            key={show._id}
            to={`/shows/${show._id}/seats`}
            className={`time-pill ${state}`}
            aria-disabled={state === 'soldout'}
            aria-label={`${formatTime(show.startTime)}, ${show.language || ''}, ${show.screenName}, ${show.seatsLeft} seats left`}
          >
            {formatTime(show.startTime)}
            <small>{detail}</small>
          </Link>
        )
      })}
    </div>
  )
}
