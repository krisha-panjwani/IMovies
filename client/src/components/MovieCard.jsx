import { Link } from 'react-router-dom'
import Poster from './Poster'
import FavoriteButton from './FavoriteButton'
import { formatDate, isReleased } from '../utils/format'

export default function MovieCard({ movie }) {
  const released = isReleased(movie)
  const { inCity } = movie

  return (
    // The heart button sits beside the link (not inside it), so clicking it
    // saves the movie instead of opening the movie page .
    <div className="movie-card-wrap">
      <Link to={`/movies/${movie._id}`} className="movie-card" aria-label={`${movie.title} - view details`}>
        <Poster movie={movie}>
          {movie.certificate && <span className="badge-cert">{movie.certificate}</span>}
          {!released && (
            <span className="badge-soon">{formatDate(movie.releaseDate, { day: 'numeric', month: 'short' })}</span>
          )}
        </Poster>
        <div className="card-meta">
          <h3 className="card-title">{movie.title}</h3>
          <div className="card-sub">
            {movie.genres.slice(0, 2).join(' · ')} · {movie.language}
          </div>
          {inCity ? (
            <div className="card-avail">
              <i className="bi bi-geo-alt-fill" aria-hidden="true" /> {inCity.cinemas}{' '}
              {inCity.cinemas === 1 ? 'cinema' : 'cinemas'} · {inCity.shows} shows
            </div>
          ) : (
            !released && (
              <div className="card-avail upcoming">
                Releases {formatDate(movie.releaseDate, { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )
          )}
        </div>
      </Link>
      <FavoriteButton movie={movie} className="card-fav" />
    </div>
  )
}
