import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { moviesApi, showsApi } from '../api'
import useFetch from '../hooks/useFetch'
import Poster from '../components/Poster'
import DateStrip from '../components/DateStrip'
import ShowtimePills from '../components/ShowtimePills'
import DemoNotice from '../components/DemoNotice'
import FavoriteButton from '../components/FavoriteButton'
import { EmptyState, ErrorState, PageLoader } from '../components/States'
import { dateKey, formatDuration, formatPrice, formatReleaseDate, isReleased } from '../utils/format'
import { CITY } from '../utils/city'

function groupByCinema(shows) {
  const groups = new Map()
  for (const show of shows) {
    const id = show.cinema._id
    if (!groups.has(id)) groups.set(id, { cinema: show.cinema, shows: [] })
    groups.get(id).shows.push(show)
  }
  return [...groups.values()]
}

// Booking steps: 1 cinema -> 2 date -> 3 showtime. All upcoming shows for this
// movie in the city are loaded once, then filtered here, so every option
// shown is a real show record.
function Showtimes({ movie }) {
  const { data: shows, loading, error, reload } = useFetch(
    () => showsApi.list({ movie: movie._id, city: CITY.name }),
    [movie._id],
  )
  const [cinemaId, setCinemaId] = useState('')
  const [date, setDate] = useState(dateKey())

  if (loading) return <PageLoader label="Finding shows in Indore…" />
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (shows.length === 0) {
    return (
      <EmptyState
        icon="bi-calendar-x"
        title={`No upcoming shows in ${CITY.name}`}
        message="This movie has no shows scheduled at Indore cinemas right now."
      />
    )
  }

  const cinemas = groupByCinema(shows).map((g) => g.cinema)
  const forCinema = cinemaId ? shows.filter((s) => s.cinema._id === cinemaId) : shows
  const datesWithShows = new Set(forCinema.map((s) => dateKey(s.startTime)))
  const forDate = forCinema.filter((s) => dateKey(s.startTime) === date)

  return (
    <>
      <div className="booking-step">
        <span className="step-badge">1</span>
        <h3 className="h6 mb-0">Choose a cinema</h3>
      </div>
      <div className="chip-row flex-lg-wrap mb-4">
        <button type="button" className={`chip ${cinemaId === '' ? 'active' : ''}`} onClick={() => setCinemaId('')}>
          All cinemas ({cinemas.length})
        </button>
        {cinemas.map((c) => (
          <button
            key={c._id}
            type="button"
            className={`chip ${cinemaId === c._id ? 'active' : ''}`}
            onClick={() => setCinemaId(c._id)}
          >
            {c.name} <span className="opacity-75">· {c.locality}</span>
          </button>
        ))}
      </div>

      <div className="booking-step">
        <span className="step-badge">2</span>
        <h3 className="h6 mb-0">Choose a date</h3>
      </div>
      <div className="mb-4">
        <DateStrip value={date} onChange={setDate} available={datesWithShows} />
      </div>

      <div className="booking-step">
        <span className="step-badge">3</span>
        <h3 className="h6 mb-0">Choose a showtime</h3>
      </div>
      <DemoNotice className="mb-3" />
      {forDate.length === 0 ? (
        <EmptyState icon="bi-calendar-x" title="No shows on this day" message="Pick another date or cinema." />
      ) : (
        <div className="d-grid gap-3">
          {groupByCinema(forDate).map(({ cinema, shows: cinemaShows }) => (
            <div key={cinema._id} className="surface cinema-card">
              <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
                <div>
                  <h4 className="h6 mb-1">
                    <Link to={`/cinemas/${cinema._id}`} className="text-white text-decoration-none">
                      {cinema.name}
                    </Link>
                  </h4>
                  <div className="small text-muted-im">
                    <i className="bi bi-geo-alt me-1" aria-hidden="true" />
                    {cinema.locality}, {cinema.city}
                  </div>
                </div>
                <div className="small text-muted-im align-self-center">
                  From {formatPrice(Math.min(...cinemaShows.map((s) => s.prices.classic)))}
                </div>
              </div>
              <ShowtimePills shows={cinemaShows} showLanguage />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default function MovieDetails() {
  const { id } = useParams()
  const { data: movie, loading, error, reload } = useFetch(() => moviesApi.get(id), [id])

  if (loading) return <PageLoader />
  if (error) {
    return (
      <div className="container py-5">
        <ErrorState message={error} onRetry={reload} />
      </div>
    )
  }

  const released = isReleased(movie)

  return (
    <>
      <section className="details-hero">
        {movie.posterUrl && (
          <div className="hero-backdrop" style={{ backgroundImage: `url("${movie.posterUrl}")` }} aria-hidden="true" />
        )}
        <div className="container position-relative py-5">
          <div className="row g-4 g-lg-5 align-items-end">
            <div className="col-6 col-sm-4 col-lg-3">
              <Poster movie={movie} className="details-poster" eager />
            </div>
            <div className="col-sm-8 col-lg-9">
              {!released && <span className="badge bg-primary mb-2">Releases {formatReleaseDate(movie.releaseDate)}</span>}
              <h1 className="display-6 fw-bold mb-3">{movie.title}</h1>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {movie.genres.map((g) => (
                  <Link key={g} to={`/movies?genre=${encodeURIComponent(g)}`} className="genre-tag text-decoration-none">
                    {g}
                  </Link>
                ))}
              </div>
              <div className="meta-list mb-3">
                {movie.certificate && (
                  <span>
                    <i className="bi bi-shield-check" aria-hidden="true" />
                    {movie.certificate}
                  </span>
                )}
                <span>
                  <i className="bi bi-clock" aria-hidden="true" />
                  {formatDuration(movie.durationMins)}
                </span>
                <span>
                  <i className="bi bi-translate" aria-hidden="true" />
                  {movie.language}
                </span>
                <span>
                  <i className="bi bi-calendar3" aria-hidden="true" />
                  {formatReleaseDate(movie.releaseDate)}
                </span>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {released && (
                  <a href="#showtimes" className="btn btn-primary btn-lg px-4">
                    <i className="bi bi-ticket-perforated me-2" aria-hidden="true" />
                    Book tickets
                  </a>
                )}
                <FavoriteButton movie={movie} variant="full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-4">
        <div className="row g-4">
          <div className="col-lg-8">
            <h2 className="h5">About the movie</h2>
            <p className="text-muted-im" style={{ lineHeight: 1.75 }}>
              {movie.synopsis}
            </p>
          </div>
          <div className="col-lg-4">
            <dl className="credits surface p-3 mb-0">
              {movie.director && (
                <>
                  <dt>Director</dt>
                  <dd>{movie.director}</dd>
                </>
              )}
              {movie.cast?.length > 0 && (
                <>
                  <dt>Cast</dt>
                  <dd>{movie.cast.join(', ')}</dd>
                </>
              )}
              {movie.sourceUrl && (
                <>
                  <dt>Source</dt>
                  <dd>
                    <a href={movie.sourceUrl} target="_blank" rel="noreferrer">
                      Details and poster: {movie.sourceName || 'source'}
                      <i className="bi bi-box-arrow-up-right ms-1 small" aria-hidden="true" />
                    </a>
                  </dd>
                </>
              )}
            </dl>
          </div>
        </div>

        <section id="showtimes" className="mt-5" aria-labelledby="showtimes-heading">
          <h2 id="showtimes-heading" className="h4 mb-3">
            Showtimes in {CITY.name}
          </h2>
          {released ? (
            <Showtimes movie={movie} />
          ) : (
            <EmptyState
              icon="bi-hourglass-split"
              title="Bookings open closer to release"
              message={`${movie.title} is scheduled for release on ${formatReleaseDate(movie.releaseDate)}.`}
            />
          )}
        </section>
      </div>
    </>
  )
}
