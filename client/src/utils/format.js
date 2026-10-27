// All show times are displayed in Indian Standard Time, wherever the viewer is.
const TIME_ZONE = 'Asia/Kolkata'

export const formatPrice = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`

export const formatDate = (date, options = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  new Date(date).toLocaleDateString('en-IN', { timeZone: TIME_ZONE, ...options })

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-IN', { timeZone: TIME_ZONE, hour: 'numeric', minute: '2-digit', hour12: true })

export const formatDateTime = (date) => `${formatDate(date)}, ${formatTime(date)}`

export const formatDuration = (mins) =>
  mins ? `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m` : 'Runtime TBA'

export const formatReleaseDate = (date) => formatDate(date, { day: 'numeric', month: 'short', year: 'numeric' })

// "2026-10-25" for a date, as a calendar day in India.
export const dateKey = (date = new Date()) => new Date(date).toLocaleDateString('en-CA', { timeZone: TIME_ZONE })

// The next `count` days for the date strip on the movie page.
export function upcomingDays(count = 7) {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000)
    return {
      key: dateKey(date),
      weekday: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : formatDate(date, { weekday: 'short' }),
      day: formatDate(date, { day: 'numeric' }),
      month: formatDate(date, { month: 'short' }),
    }
  })
}

export const isReleased = (movie) => new Date(movie.releaseDate) <= new Date()

export const TIER_LABELS = { classic: 'Classic', prime: 'Prime', recliner: 'Recliner' }

// Price preview for selected seats, using the show's layout. The server
// recalculates the real total when the booking is made.
export function priceSelection(show, seatCodes) {
  const tierByRow = Object.fromEntries(show.seatLayout.map((row) => [row.label, row.tier]))
  return seatCodes.map((code) => {
    const tier = tierByRow[code[0]]
    return { code, tier, price: show.prices[tier] }
  })
}
