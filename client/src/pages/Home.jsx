import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cinemasApi, cinemoodApi, moviesApi } from '../api'
import useFetch from '../hooks/useFetch'
import MovieCard from '../components/MovieCard'
import Poster from '../components/Poster'
import CinemaCard from '../components/CinemaCard'
import { ErrorState, MovieGridSkeleton } from '../components/States'
import { formatDate, formatDuration, formatTime } from '../utils/format'
import { CITY } from '../utils/city'

const FEATURED_GENRES = ['Action', 'Comedy', 'Drama', 'Thriller', 'Horror', 'Biography', 'Crime', 'Spy']

const STEPS = [
  { icon: 'bi-film', title: 'Choose a movie', text: 'Browse what is showing in Indore, or let CineMood suggest one.' },
  { icon: 'bi-building', title: 'Pick a cinema', text: 'PVR, INOX and more, with the area shown for each.' },
  { icon: 'bi-calendar-event', title: 'Date and showtime', text: 'See every show for the next few days at a glance.' },
  { icon: 'bi-grid-3x3-gap', title: 'Select seats', text: 'Choose seats on the seat map and get your booking reference instantly.' },
]

function Hero({ featured, onSearch }) {
  const [query, setQuery] = useState('')
  const submit = (e) => {
    e.preventDefault()
    onSearch(query.trim())
  }

  return (
    <section className="hero">
      {featured?.posterUrl && (
        <div className="hero-backdrop" style={{ backgroundImage: `url("${featured.posterUrl}")` }} aria-hidden="true" />
      )}
      <div className="container position-relative py-5">
        <div className="row align-items-center g-5 py-lg-4">
          <div className="col-lg-7">
            <span className="city-pill">
              <i className="bi bi-geo-alt-fill" aria-hidden="true" />
              Now showing in {CITY.name}, {CITY.state}
            </span>
            <h1 className="hero-title">
              <span className="text-brand">IMovies</span> - Movie ticket booking made simple
            </h1>
            <p className="hero-lead">
              Find what&apos;s playing across Indore&apos;s cinemas, choose your show and pick your seats in a few taps.
            </p>
            <form className="search-hero" role="search" onSubmit={submit}>
              <i className="bi bi-search align-self-center text-muted-im" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search movies in Indore"
                aria-label="Search movies"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn btn-primary px-4" type="submit">
                Search
              </button>
            </form>
          </div>

          <div className="col-lg-5">
            {featured ? <FeaturedMovie movie={featured} /> : <div className="featured-card skeleton" style={{ height: 260 }} />}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturedMovie({ movie }) {
  const { inCity } = movie
  return (
    <article className="featured-card">
      <Link to={`/movies/${movie._id}`} className="featured-poster" aria-label={`${movie.title} details`}>
        <Poster movie={movie} eager />
      </Link>
      <div className="featured-body">
        <span className="eyebrow">Playing at the most Indore cinemas</span>
        <h2 className="h4 mt-1 mb-2">{movie.title}</h2>
        <div className="small text-muted-im mb-2">
          {[movie.certificate, movie.language, formatDuration(movie.durationMins)].filter(Boolean).join(' · ')}
        </div>
        <div className="d-flex flex-wrap gap-1 mb-3">
          {movie.genres.map((g) => (
            <span key={g} className="genre-tag">
              {g}
            </span>
          ))}
        </div>
        {inCity && (
          <p className="small mb-3">
            <i className="bi bi-geo-alt-fill text-brand me-1" aria-hidden="true" />
            {inCity.shows} shows at {inCity.cinemas} {inCity.cinemas === 1 ? 'cinema' : 'cinemas'} · next at{' '}
            {formatDate(inCity.nextShow)}, {formatTime(inCity.nextShow)}
          </p>
        )}
        <Link to={`/movies/${movie._id}`} className="btn btn-primary">
          <i className="bi bi-ticket-perforated me-2" aria-hidden="true" />
          Book tickets
        </Link>
      </div>
    </article>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const nowShowing = useFetch(() => moviesApi.list({ status: 'now', city: CITY.name }))
  const upcoming = useFetch(() => moviesApi.list({ status: 'upcoming' }))
  const cinemas = useFetch(() => cinemasApi.list({ city: CITY.name }))
  const moods = useFetch(() => cinemoodApi.moods())

  const featured = nowShowing.data?.[0] || null
  const onSearch = (q) => navigate(q ? `/movies?search=${encodeURIComponent(q)}` : '/movies')

  return (
    <>
      <Hero featured={featured} onSearch={onSearch} />

      <section className="container pt-4">
        <div className="chip-row">
          {FEATURED_GENRES.map((genre) => (
            <Link key={genre} to={`/movies?genre=${encodeURIComponent(genre)}`} className="chip">
              {genre}
            </Link>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-title">
          <div>
            <span className="eyebrow">In cinemas</span>
            <h2>Now showing in {CITY.name}</h2>
          </div>
          <Link to="/movies?status=now" className="btn btn-ghost btn-sm">
            View all <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
          </Link>
        </div>
        {nowShowing.loading ? (
          <MovieGridSkeleton count={6} />
        ) : nowShowing.error ? (
          <ErrorState message={nowShowing.error} onRetry={nowShowing.reload} />
        ) : nowShowing.data.length === 0 ? (
          <p className="text-muted-im">No shows are scheduled in {CITY.name} right now.</p>
        ) : (
          <div className="movie-grid">
            {nowShowing.data.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      <section className="container">
        <div className="section-title">
          <div>
            <span className="eyebrow">Venues</span>
            <h2>Cinemas in {CITY.name}</h2>
          </div>
          <Link to="/cinemas" className="btn btn-ghost btn-sm">
            All cinemas <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
          </Link>
        </div>
        {cinemas.error ? (
          <ErrorState message={cinemas.error} onRetry={cinemas.reload} />
        ) : (
          <div className="cinema-row">
            {(cinemas.data || []).map((cinema) => (
              <CinemaCard key={cinema._id} cinema={cinema} compact />
            ))}
          </div>
        )}
      </section>

      <section className="section container">
        <div className="cinemood-banner">
          <div className="row align-items-center g-4">
            <div className="col-lg-5">
              <span className="eyebrow" style={{ color: 'var(--im-violet-soft)' }}>
                <i className="bi bi-stars me-1" aria-hidden="true" />
                CineMood
              </span>
              <h2 className="mt-2 mb-2">
                Discover by mood. <span>Book smarter.</span>
              </h2>
              <p className="text-muted-im mb-0">
                Tell us how you want to feel and CineMood suggests films playing in Indore, explains why each one fits,
                and takes you straight to the next show.
              </p>
            </div>
            <div className="col-lg-7">
              <div className="d-flex flex-wrap gap-2">
                {(moods.data || []).map((mood) => (
                  <Link
                    key={mood.id}
                    to={`/cinemood?mood=${mood.id}`}
                    className="mood-chip"
                    style={{ '--mood': mood.color }}
                  >
                    <i className={`bi ${mood.icon}`} aria-hidden="true" />
                    {mood.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Only shown when the catalogue actually has announced releases. */}
      {upcoming.data?.length > 0 && (
        <section className="container pb-5">
          <div className="section-title">
            <div>
              <span className="eyebrow">Announced releases</span>
              <h2>Coming soon</h2>
            </div>
            <Link to="/movies?status=upcoming" className="btn btn-ghost btn-sm">
              View all <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
            </Link>
          </div>
          <div className="movie-grid">
            {upcoming.data.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      <section className="container">
        <div className="steps">
          {STEPS.map((step, i) => (
            <div key={step.title} className="surface step">
              <span className="step-num">{i + 1}</span>
              <i className={`bi ${step.icon}`} aria-hidden="true" />
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
