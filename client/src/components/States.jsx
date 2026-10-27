// Shared loading / empty / error states, so every page handles them the same way.

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="page-loader" role="status">
      <div className="text-center">
        <div className="spinner-border mb-3" aria-hidden="true" />
        <div>{label}</div>
      </div>
    </div>
  )
}

export function MovieGridSkeleton({ count = 10 }) {
  return (
    <div className="movie-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <div className="skeleton" style={{ aspectRatio: '2 / 3' }} />
          <div className="skeleton mt-3" style={{ height: 14, width: '80%' }} />
          <div className="skeleton mt-2" style={{ height: 12, width: '55%' }} />
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ icon = 'bi-film', title, message, children }) {
  return (
    <div className="state-box">
      <i className={`bi ${icon}`} aria-hidden="true" />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {children}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-box" role="alert">
      <i className="bi bi-exclamation-octagon" aria-hidden="true" style={{ color: '#f87171' }} />
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline-light" onClick={onRetry}>
          <i className="bi bi-arrow-clockwise me-2" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  )
}
