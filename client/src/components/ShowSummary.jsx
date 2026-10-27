import Poster from './Poster'
import { formatDate, formatDuration, formatTime } from '../utils/format'

// Compact "what you're booking" header used on the seat and checkout pages.
export default function ShowSummary({ show }) {
  const { movie, cinema } = show
  return (
    <div className="d-flex gap-3 align-items-center min-w-0">
      <div className="flex-shrink-0" style={{ width: 56, fontSize: 5 }}>
        <Poster movie={movie} />
      </div>
      <div className="min-w-0">
        <h1 className="h5 mb-1 text-truncate">{movie.title}</h1>
        <div className="small text-muted-im">
          {[movie.certificate, show.language || movie.language, formatDuration(movie.durationMins)].filter(Boolean).join(' · ')}
        </div>
        <div className="small text-muted-im">
          <i className="bi bi-geo-alt me-1" aria-hidden="true" />
          {cinema.name}, {cinema.locality} · {show.screenName}
        </div>
        <div className="small fw-semibold text-white">
          <i className="bi bi-calendar-event me-1" aria-hidden="true" />
          {formatDate(show.startTime, { weekday: 'long', day: 'numeric', month: 'short' })}, {formatTime(show.startTime)}
        </div>
      </div>
    </div>
  )
}
