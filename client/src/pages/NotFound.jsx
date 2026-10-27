import { Link } from 'react-router-dom'
import { EmptyState } from '../components/States'

export default function NotFound() {
  return (
    <div className="container py-5">
      <EmptyState icon="bi-signpost-split" title="Page not found" message="The page you're looking for doesn't exist or has moved.">
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      </EmptyState>
    </div>
  )
}
