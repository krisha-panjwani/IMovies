// Honest labelling: real films and venues, but sample showtimes.
export default function DemoNotice({ className = '' }) {
  return (
    <div className={`demo-note ${className}`} role="note">
      <i className="bi bi-info-circle" aria-hidden="true" />
      <span>
        <strong>Demo schedule.</strong> Films and cinemas are real, but these showtimes, prices and seat availability are
        sample data for a student project. They are not live PVR or INOX inventory.
      </span>
    </div>
  )
}
