import { useState } from 'react'

// Colour pairs for the generated fallback artwork.
const PALETTES = [
  ['#e3264b', '#5b21b6'],
  ['#f59e0b', '#7c2d12'],
  ['#38bdf8', '#1e3a8a'],
  ['#8b5cf6', '#be185d'],
  ['#22c55e', '#134e4a'],
  ['#f97316', '#4c1d95'],
  ['#ec4899', '#1e1b4b'],
  ['#14b8a6', '#7f1d1d'],
  ['#eab308', '#1e3a8a'],
]

// The same title always gets the same colours.
// eslint-disable-next-line react-refresh/only-export-components
export function movieArt(title = '') {
  let hash = 0
  for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return PALETTES[hash % PALETTES.length]
}

// Shows the movie's official poster. While it loads, a shimmer is shown; if
// there is no poster or it fails to load, a clearly generic title card is
// drawn instead - never a broken image and never a poster from another film.
export default function Poster({ movie, className = '', eager = false, children }) {
  const initial = movie.posterUrl ? 'loading' : 'failed'
  const [state, setState] = useState({ url: movie.posterUrl, status: initial })
  // If this component is reused for a different movie, start loading again.
  if (state.url !== movie.posterUrl) setState({ url: movie.posterUrl, status: initial })
  const status = state.url === movie.posterUrl ? state.status : initial
  const setStatus = (next) => setState({ url: movie.posterUrl, status: next })
  const [a, b] = movieArt(movie.title)
  const longestWord = Math.max(...movie.title.split(/\s+/).map((w) => w.length))
  const titleScale = Math.min(1, 8.5 / longestWord)

  return (
    <div
      className={`poster ${status === 'loading' ? 'is-loading' : ''} ${className}`}
      style={{ '--art-a': a, '--art-b': b, '--title-scale': titleScale }}
    >
      {status !== 'failed' && (
        <img
          src={movie.posterUrl}
          alt={`${movie.title} poster`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className={status === 'loaded' ? 'is-visible' : ''}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('failed')}
        />
      )}
      {status === 'failed' && (
        <div className="poster-art" role="img" aria-label={`${movie.title} (poster unavailable)`}>
          <div className="art-rule" />
          <div className="art-title">{movie.title}</div>
          <div className="art-tagline">Poster unavailable</div>
        </div>
      )}
      {children}
    </div>
  )
}
