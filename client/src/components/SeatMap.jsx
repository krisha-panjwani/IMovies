import { TIER_LABELS, formatPrice } from '../utils/format'

// Draws the seat layout of a show. Row A is nearest the screen.
// Seats are real buttons, so they work with a keyboard and screen readers.
export default function SeatMap({ layout, prices, bookedSeats, selected, onToggle }) {
  const booked = new Set(bookedSeats)
  const chosen = new Set(selected)

  return (
    <div className="seat-stage">
      <div className="seat-map">
        <div className="screen-arc" aria-hidden="true">
          SCREEN THIS WAY
        </div>

        {layout.map((row, index) => {
          const newTier = index === 0 || layout[index - 1].tier !== row.tier
          const aisleAfter = Math.ceil(row.seats / 2)

          return (
            <div key={row.label} className="w-100 d-flex flex-column align-items-center">
              {newTier && (
                <div className="tier-label">
                  <strong>{TIER_LABELS[row.tier].toUpperCase()}</strong>
                  <span>{formatPrice(prices[row.tier])}</span>
                </div>
              )}
              <div className="seat-row">
                <span className="row-label" aria-hidden="true">
                  {row.label}
                </span>
                {Array.from({ length: row.seats }, (_, i) => {
                  const code = `${row.label}${i + 1}`
                  const isBooked = booked.has(code)
                  const isSelected = chosen.has(code)
                  const state = isBooked ? 'booked' : isSelected ? 'selected' : 'available'
                  return (
                    <span key={code} className="d-inline-flex">
                      <button
                        type="button"
                        className={`seat ${state} ${row.tier === 'recliner' ? 'recliner' : ''}`}
                        disabled={isBooked}
                        aria-pressed={isSelected}
                        aria-label={`Row ${row.label} seat ${i + 1}, ${TIER_LABELS[row.tier]}, ${formatPrice(prices[row.tier])}, ${state}`}
                        title={`${code} · ${TIER_LABELS[row.tier]} · ${formatPrice(prices[row.tier])}`}
                        onClick={() => onToggle(code)}
                      >
                        {i + 1}
                      </button>
                      {i + 1 === aisleAfter && <span className="seat-gap" aria-hidden="true" />}
                    </span>
                  )
                })}
                <span className="row-label" aria-hidden="true">
                  {row.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SeatLegend() {
  return (
    <div className="seat-legend" aria-hidden="true">
      <span>
        <span className="seat d-inline-block" />
        Available
      </span>
      <span>
        <span className="seat selected d-inline-block" />
        Selected
      </span>
      <span>
        <span className="seat booked d-inline-block" />
        Booked
      </span>
    </div>
  )
}
