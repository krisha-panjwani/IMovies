import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { favoritesApi } from '../api'
import useFetch from '../hooks/useFetch'
import { useFavorites } from '../context/FavoritesContext'
import MovieCard from '../components/MovieCard'
import { EmptyState, ErrorState, MovieGridSkeleton } from '../components/States'
import { CITY } from '../utils/city'

export default function Favorites() {
  const { count } = useFavorites()
  const { data, loading, error, reload } = useFetch(() => favoritesApi.list())

  // When a heart is clicked on this page, reload so the movie disappears.
  useEffect(() => {
    if (data && count !== data.length) reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  return (
    <div className="container py-5">
      <span className="eyebrow">
        <i className="bi bi-heart-fill me-1" aria-hidden="true" />
        Watchlist
      </span>
      <h1 className="h2 mb-1">My favourites</h1>
      <p className="text-muted-im mb-4">Movies you&apos;ve saved. Tap the heart on any movie to add or remove it.</p>

      {loading && !data ? (
        <MovieGridSkeleton count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <EmptyState
          icon="bi-heart"
          title="No favourites yet"
          message="Tap the heart on a movie poster to save it here for later."
        >
          <Link to="/movies" className="btn btn-primary">
            Browse movies in {CITY.name}
          </Link>
        </EmptyState>
      ) : (
        <div className="movie-grid">
          {data.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  )
}
