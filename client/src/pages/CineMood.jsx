import { Link, useSearchParams } from 'react-router-dom'
import { cinemoodApi } from '../api'
import useFetch from '../hooks/useFetch'
import Poster from '../components/Poster'
import { EmptyState, ErrorState, PageLoader } from '../components/States'
import { formatDate, formatDuration, formatTime } from '../utils/format'

function Recommendations({ moodId }) {
  const { data, loading, error, reload } = useFetch(() => cinemoodApi.recommend(moodId), [moodId])

  if (loading) return <PageLoader label="Matching movies to your mood…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  const { mood, results } = data
  if (results.length === 0) {
    return (
      <EmptyState
        icon="bi-emoji-neutral"
        title={`Nothing matches “${mood.name}” right now`}
        message="None of the current movies fit this mood well enough. Try a different mood, or browse everything that's showing."
      >
        <Link to="/movies?status=now" className="btn btn-outline-light">
          Browse all movies
        </Link>
      </EmptyState>
    )
  }

  const topScore = results[0].score

  return (
    <div style={{ '--mood': mood.color }}>
      <p className="text-muted-im mb-3">
        {results.length} {results.length === 1 ? 'movie matches' : 'movies match'} <strong className="text-white">{mood.name}</strong>,
        best match first.
      </p>
      <div className="d-grid gap-3">
        {results.map(({ movie, score, reasons, nextShow }, index) => (
          <article key={movie._id} className="surface rec-card">
            <Link to={`/movies/${movie._id}`} aria-label={`${movie.title} details`}>
              <Poster movie={movie} />
            </Link>
            <div className="min-w-0 d-flex flex-column">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                {index === 0 && (
                  <span className="badge" style={{ background: 'var(--im-violet)' }}>
                    <i className="bi bi-trophy me-1" aria-hidden="true" />
                    Best match
                  </span>
                )}
                <h2 className="h5 mb-0">{movie.title}</h2>
              </div>
              <div className="small text-muted-im mb-2">
                {[movie.genres.join(' · '), movie.language, formatDuration(movie.durationMins), movie.certificate]
                  .filter(Boolean)
                  .join(' · ')}
                {movie.rating > 0 && (
                  <span className="text-gold ms-2">
                    <i className="bi bi-star-fill" aria-hidden="true" /> {movie.rating.toFixed(1)}
                  </span>
                )}
              </div>

              <div className="d-flex align-items-center gap-2 mb-2" style={{ maxWidth: 320 }}>
                <span className="small text-muted-im text-nowrap">Match</span>
                <div className="match-bar flex-grow-1" role="meter" aria-valuemin={0} aria-valuemax={topScore} aria-valuenow={score} aria-label="Match strength">
                  <span style={{ width: `${Math.round((score / topScore) * 100)}%` }} />
                </div>
                <span className="small text-muted-im">{score} pts</span>
              </div>

              <div className="small text-muted-im mb-1">Why this matches:</div>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {reasons.map((reason) => (
                  <span key={reason} className="reason">
                    <i className="bi bi-check2" aria-hidden="true" />
                    {reason}
                  </span>
                ))}
              </div>

              <div className="d-flex flex-wrap gap-2 mt-auto">
                {nextShow ? (
                  <Link to={`/shows/${nextShow._id}/seats`} className="btn btn-primary btn-sm">
                    <i className="bi bi-ticket-perforated me-1" aria-hidden="true" />
                    Book {formatDate(nextShow.startTime)}, {formatTime(nextShow.startTime)}
                  </Link>
                ) : (
                  <span className="badge text-bg-secondary align-self-center">No shows in the next 7 days</span>
                )}
                <Link to={`/movies/${movie._id}`} className="btn btn-outline-light btn-sm">
                  All showtimes
                </Link>
              </div>
              {nextShow && <div className="small text-muted-im mt-2">Next show at {nextShow.cinemaName}</div>}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default function CineMood() {
  const [params, setParams] = useSearchParams()
  const selected = params.get('mood')
  const moods = useFetch(() => cinemoodApi.moods())

  return (
    <>
      <section className="cinemood-hero">
        <div className="container py-5">
          <span className="eyebrow" style={{ color: 'var(--im-violet-soft)' }}>
            <i className="bi bi-stars me-1" aria-hidden="true" />
            CineMood
          </span>
          <h1 className="cinemood-title display-6 fw-bold mt-2">
            Discover by mood. <span>Book smarter.</span>
          </h1>
          <p className="text-muted-im mb-4" style={{ maxWidth: 620 }}>
            How do you want to feel tonight? Pick a mood and CineMood ranks the movies in Indore that fit it, tells you
            why each one matches, and takes you straight to the next show.
          </p>

          {moods.loading ? (
            <PageLoader label="Loading moods…" />
          ) : moods.error ? (
            <ErrorState message={moods.error} onRetry={moods.reload} />
          ) : (
            <div className="mood-grid" role="radiogroup" aria-label="Choose a mood">
              {moods.data.map((mood) => (
                <button
                  key={mood.id}
                  type="button"
                  role="radio"
                  aria-checked={selected === mood.id}
                  className={`mood-card ${selected === mood.id ? 'active' : ''}`}
                  style={{ '--mood': mood.color }}
                  onClick={() => setParams({ mood: mood.id })}
                >
                  <span className="mood-icon">
                    <i className={`bi ${mood.icon}`} aria-hidden="true" />
                  </span>
                  <h3>{mood.name}</h3>
                  <p>{mood.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container py-5">
        {selected ? (
          <Recommendations moodId={selected} />
        ) : (
          <EmptyState icon="bi-hand-index" title="Pick a mood to get started" message="Your recommendations will appear here." />
        )}

        <details className="surface p-4 mt-5">
          <summary className="fw-semibold" style={{ cursor: 'pointer' }}>
            <i className="bi bi-info-circle me-2" aria-hidden="true" />
            How does CineMood choose movies?
          </summary>
          <div className="text-muted-im mt-3 small" style={{ lineHeight: 1.8 }}>
            CineMood uses transparent rules, not AI. Each mood has a list of matching genres and mood tags. Every movie
            earns points: <strong className="text-white">+3</strong> for each main genre that fits,{' '}
            <strong className="text-white">+1</strong> for each supporting genre, <strong className="text-white">+4</strong>{' '}
            for each matching mood tag, up to <strong className="text-white">+2</strong> for mood keywords in the story,
            and <strong className="text-white">+2</strong> if it has a show in the next 7 days. Some moods exclude movies
            (for example, Cozy Movie Night skips A-rated and dark films). Movies need at least 4 points to be recommended,
            and ties go to the film with the sooner show. Mood tags are IMovies&apos; own editorial labels based on each
            film&apos;s genre.
          </div>
        </details>
      </section>
    </>
  )
}
