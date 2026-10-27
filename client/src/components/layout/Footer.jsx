import { Link } from 'react-router-dom'
import { CITY_LABEL } from '../../utils/city'

export default function Footer() {
  return (
    <footer className="im-footer py-5 mt-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-8">
            <Link to="/" className="brand" aria-label="IMovies home">
              <i className="bi bi-film" aria-hidden="true" />I<span>Movies</span>
            </Link>
            <p className="mt-3 mb-2 text-white">IMovies - Movie ticket booking made simple</p>
            <p className="mb-0 small">
              <i className="bi bi-geo-alt-fill me-1" aria-hidden="true" />
              Serving {CITY_LABEL}
            </p>
          </div>
          <div className="col-md-4">
            <h6 className="text-white mb-3">Explore</h6>
            <ul className="list-unstyled d-grid gap-2 mb-0">
              <li><Link to="/movies?status=now">Now showing</Link></li>
              <li><Link to="/movies?status=upcoming">Coming soon</Link></li>
              <li><Link to="/cinemas">Cinemas in Indore</Link></li>
              <li><Link to="/cinemood">CineMood</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
