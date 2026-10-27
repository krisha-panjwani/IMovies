import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { cinemasApi, showsApi } from '../api'
import useFetch from '../hooks/useFetch'
import Poster from '../components/Poster'
import DateStrip from '../components/DateStrip'
import ShowtimePills from '../components/ShowtimePills'
import DemoNotice from '../components/DemoNotice'
import { EmptyState, ErrorState, PageLoader } from '../components/States'
import { dateKey, formatDuration, formatPrice } from '../utils/format'

// Groups a flat list of shows into one entry per movie.
function groupByMovie(shows) {
  const groups = new Map()
  for (const show of shows) {
    const id = show.movie._id
    if (!groups.has(id)) groups.set(id, { movie: show.movie, shows: [] })
    groups.get(id).shows.push(show)
  }
  return [...groups.values()]
}

export default function CinemaDetails() {
  const { id } = useParams()
  const [date, setDate] = useState(dateKey())
  const cinema = useFetch(() => cinemasApi.get(id), [id])
  const shows = useFetch(() => showsApi.list({ cinema: id, date }), [id, date])

  if (cinema.loading) return <PageLoader />
  if (cinema.error) {
    return (
      <div className="container py-5">
        <ErrorState message={cinema.error} onRetry={cinema.reload} />
      </div>
    )
  }

  const c = cinema.data
  return (
    <>
      <section className="cinema-hero">
        <div className="container py-5">
          <Link to="/cinemas" className="btn btn-ghost btn-sm mb-3">
            <i className="bi bi-arrow-left me-1" aria-hidden="true" />
            All cinemas
          </Link>
          <span className={`brand-badge brand-${(c.brand || 'other').toLowerCase()} ms-2`}>{c.brand}</span>
          <h1 className="h2 mt-2 mb-1">{c.name}</h1>
          <p className="text-muted-im mb-2">
            <i className="bi bi-geo-alt me-1" aria-hidden="true" />
            {c.address}
          </p>
          <div className="d-flex flex-wrap gap-1">
            {c.amenities.map((a) => (
              <span key={a} className="amenity">
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="container py-4">
        <DateStrip value={date} onChange={setDate} />
        <DemoNotice className="my-3" />

        {shows.loading ? (
          <PageLoader label="Finding shows…" />
        ) : shows.error ? (
          <ErrorState message={shows.error} onRetry={shows.reload} />
        ) : shows.data.length === 0 ? (
          <EmptyState icon="bi-calendar-x" title="No shows on this day" message="Try another date." />
        ) : (
          <div className="d-grid gap-3">
            {groupByMovie(shows.data).map(({ movie, shows: movieShows }) => (
              <div key={movie._id} className="surface cinema-movie">
                <Link to={`/movies/${movie._id}`} className="cinema-movie-poster" aria-label={`${movie.title} details`}>
                  <Poster movie={movie} />
                </Link>
                <div className="min-w-0">
                  <h2 className="h6 mb-1">
                    <Link to={`/movies/${movie._id}`} className="text-white text-decoration-none">
                      {movie.title}
                    </Link>
                  </h2>
                  <div className="small text-muted-im mb-3">
                    {[movie.certificate, formatDuration(movie.durationMins)].filter(Boolean).join(' · ')} · from{' '}
                    {formatPrice(Math.min(...movieShows.map((s) => s.prices.classic)))}
                  </div>
                  <ShowtimePills shows={movieShows} showLanguage />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
