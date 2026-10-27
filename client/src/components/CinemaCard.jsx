import { Link } from 'react-router-dom'

// A cinema venue: brand, name, locality and amenities.
export default function CinemaCard({ cinema, compact = false }) {
  return (
    <Link to={`/cinemas/${cinema._id}`} className="cinema-tile surface" aria-label={`${cinema.name}, ${cinema.locality}`}>
      <div className="d-flex align-items-start justify-content-between gap-2">
        <span className={`brand-badge brand-${(cinema.brand || 'other').toLowerCase()}`}>{cinema.brand || 'Cinema'}</span>
        <i className="bi bi-chevron-right text-muted-im" aria-hidden="true" />
      </div>
      <h3 className="h6 mt-3 mb-1">{cinema.name}</h3>
      <div className="small text-muted-im">
        <i className="bi bi-geo-alt me-1" aria-hidden="true" />
        {cinema.locality}, {cinema.city}
      </div>
      {!compact && <div className="small text-muted-im mt-2">{cinema.address}</div>}
      {cinema.amenities?.length > 0 && (
        <div className="d-flex flex-wrap gap-1 mt-3">
          {cinema.amenities.slice(0, compact ? 2 : 6).map((a) => (
            <span key={a} className="amenity">
              {a}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
