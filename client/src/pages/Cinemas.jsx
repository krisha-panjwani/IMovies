import { cinemasApi } from '../api'
import useFetch from '../hooks/useFetch'
import CinemaCard from '../components/CinemaCard'
import { EmptyState, ErrorState, PageLoader } from '../components/States'
import { CITY, CITY_LABEL } from '../utils/city'

export default function Cinemas() {
  const { data, loading, error, reload } = useFetch(() => cinemasApi.list({ city: CITY.name }))

  return (
    <div className="container py-5">
      <span className="eyebrow">
        <i className="bi bi-geo-alt-fill me-1" aria-hidden="true" />
        {CITY_LABEL}
      </span>
      <h1 className="h2 mb-2">Cinemas in {CITY.name}</h1>
      <p className="text-muted-im mb-4" style={{ maxWidth: 640 }}>
        Choose a cinema to see its movies and showtimes. Venue names and addresses were checked against public cinema
        listings.
      </p>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <EmptyState icon="bi-building" title={`No cinemas in ${CITY.name} yet`} />
      ) : (
        <div className="row g-3">
          {data.map((cinema) => (
            <div key={cinema._id} className="col-md-6 col-lg-4">
              <CinemaCard cinema={cinema} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
