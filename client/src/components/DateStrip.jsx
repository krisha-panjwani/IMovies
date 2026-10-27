import { upcomingDays } from '../utils/format'

const DAYS_SHOWN = 5

// `available` (optional): a Set of date keys that have shows; other days are dimmed.
export default function DateStrip({ value, onChange, available }) {
  return (
    <div className="date-strip" role="tablist" aria-label="Choose a date">
      {upcomingDays(DAYS_SHOWN).map((d) => (
        <button
          key={d.key}
          type="button"
          role="tab"
          aria-selected={value === d.key}
          className={`date-pill ${value === d.key ? 'active' : ''} ${available && !available.has(d.key) ? 'empty' : ''}`}
          onClick={() => onChange(d.key)}
        >
          <small>{d.weekday}</small>
          <span className="day">{d.day}</span>
          <small>{d.month}</small>
        </button>
      ))}
    </div>
  )
}
