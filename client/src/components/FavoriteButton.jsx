import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'

// Heart button that adds or removes a movie from the user's favourites.
// Guests are sent to log in first. `variant="full"` shows a text label too.
export default function FavoriteButton({ movie, variant = 'icon', className = '' }) {
  const { user } = useAuth()
  const { isFavorite, toggle } = useFavorites()
  const navigate = useNavigate()
  const location = useLocation()
  const saved = isFavorite(movie._id)
  const label = saved ? `Remove ${movie.title} from favourites` : `Add ${movie.title} to favourites`

  const onClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast('Log in to save favourites')
      navigate('/login', { state: { from: location } })
      return
    }
    toggle(movie)
  }

  if (variant === 'full') {
    return (
      <button type="button" className={`btn btn-outline-light btn-lg ${className}`} onClick={onClick} aria-pressed={saved}>
        <i className={`bi ${saved ? 'bi-heart-fill text-brand' : 'bi-heart'} me-2`} aria-hidden="true" />
        {saved ? 'In favourites' : 'Add to favourites'}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`fav-btn ${saved ? 'is-saved' : ''} ${className}`}
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? 'Remove from favourites' : 'Add to favourites'}
    >
      <i className={`bi ${saved ? 'bi-heart-fill' : 'bi-heart'}`} aria-hidden="true" />
    </button>
  )
}
