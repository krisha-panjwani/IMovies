import { useSearchParams } from 'react-router-dom'
import { moviesApi } from '../api'
import useFetch from '../hooks/useFetch'
import MovieCard from '../components/MovieCard'
import { EmptyState, ErrorState, MovieGridSkeleton } from '../components/States'
import { CITY } from '../utils/city'

const STATUS_TABS = [
  { value: '', label: 'All movies' },
  { value: 'now', label: 'Now showing' },
  { value: 'upcoming', label: 'Coming soon' },
]

// The filters live in the URL (?search=&genre=&language=&status=), so a
// filtered page can be bookmarked, shared and survives a refresh.
export default function Movies() {
  const [params, setParams] = useSearchParams()
  const search = params.get('search') || ''
  const genre = params.get('genre') || ''
  const language = params.get('language') || ''
  const status = params.get('status') || ''

  const meta = useFetch(() => moviesApi.meta())
  const movies = useFetch(
    () =>
      moviesApi.list({
        search: search || undefined,
        genre: genre || undefined,
        language: language || undefined,
        status: status || undefined,
        city: CITY.name,
      }),
    [search, genre, language, status],
  )

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  const onSearch = (e) => {
    e.preventDefault()
    setFilter('search', new FormData(e.currentTarget).get('search').trim())
  }

  const hasFilters = search || genre || language || status

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
        <div>
          <span className="eyebrow">
            <i className="bi bi-geo-alt-fill me-1" aria-hidden="true" />
            {CITY.name}
          </span>
          <h1 className="h2 mb-0">Movies in {CITY.name}</h1>
        </div>
        <div className="chip-row" role="tablist" aria-label="Release status">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={status === tab.value}
              className={`chip ${status === tab.value ? 'active' : ''}`}
              onClick={() => setFilter('status', tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="surface p-3 mb-4">
        <div className="row g-2 align-items-center">
          <form className="col-md-6" role="search" onSubmit={onSearch}>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0">
                <i className="bi bi-search" aria-hidden="true" />
              </span>
              {/* `key` resets the box when the URL's search changes (e.g. from the navbar). */}
              <input
                key={search}
                name="search"
                type="search"
                className="form-control border-start-0"
                placeholder="Search by title"
                aria-label="Search by title"
                defaultValue={search}
              />
              <button className="btn btn-primary" type="submit">
                Search
              </button>
            </div>
          </form>
          <div className="col-6 col-md-3">
            <select className="form-select" aria-label="Genre" value={genre} onChange={(e) => setFilter('genre', e.target.value)}>
              <option value="">All genres</option>
              {meta.data?.genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              aria-label="Language"
              value={language}
              onChange={(e) => setFilter('language', e.target.value)}
            >
              <option value="">All languages</option>
              {meta.data?.languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {movies.loading ? (
        <MovieGridSkeleton />
      ) : movies.error ? (
        <ErrorState message={movies.error} onRetry={movies.reload} />
      ) : movies.data.length === 0 ? (
        <EmptyState icon="bi-camera-reels" title="No movies match your filters" message="Try a different title, genre or language.">
          {hasFilters && (
            <button type="button" className="btn btn-outline-light" onClick={() => setParams({})}>
              Clear filters
            </button>
          )}
        </EmptyState>
      ) : (
        <>
          <p className="text-muted-im small mb-3">
            {movies.data.length} {movies.data.length === 1 ? 'movie' : 'movies'}
            {search && <> matching “{search}”</>}
          </p>
          <div className="movie-grid">
            {movies.data.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
