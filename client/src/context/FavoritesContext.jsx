import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { favoritesApi } from '../api'
import { getErrorMessage } from '../api/http'
import { useAuth } from './AuthContext'

const FavoritesContext = createContext(null)

// Keeps the logged-in user's favourite movie ids, so every heart button
// across the site shows the right state and updates instantly.
export function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const [ids, setIds] = useState(() => new Set())

  // Load favourites when someone logs in; clear them on logout.
  useEffect(() => {
    if (!user) {
      setIds(new Set())
      return
    }
    favoritesApi
      .list()
      .then((movies) => setIds(new Set(movies.map((m) => m._id))))
      .catch(() => setIds(new Set()))
  }, [user])

  const isFavorite = useCallback((movieId) => ids.has(movieId), [ids])

  // Updates the heart immediately, then saves; undoes the change if saving fails.
  const toggle = useCallback(
    async (movie) => {
      const saved = ids.has(movie._id)
      setIds((current) => {
        const next = new Set(current)
        if (saved) next.delete(movie._id)
        else next.add(movie._id)
        return next
      })
      try {
        if (saved) {
          await favoritesApi.remove(movie._id)
          toast.success(`Removed ${movie.title} from favourites`)
        } else {
          await favoritesApi.add(movie._id)
          toast.success(`Added ${movie.title} to favourites`)
        }
      } catch (err) {
        setIds((current) => {
          const next = new Set(current)
          if (saved) next.add(movie._id)
          else next.delete(movie._id)
          return next
        })
        toast.error(getErrorMessage(err))
      }
    },
    [ids],
  )

  const value = useMemo(() => ({ isFavorite, toggle, count: ids.size }), [isFavorite, toggle, ids.size])
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavorites() {
  return useContext(FavoritesContext)
}
