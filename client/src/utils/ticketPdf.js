import { formatDate, formatTime } from './format'
import { paymentLabel } from './payments'

// Builds a printable A5 PDF ticket and downloads it as IMovies-<ref>.pdf.
// jsPDF is loaded only when needed, so it doesn't slow down the first page load.
// `qrDataUrl` is a PNG of the ticket's QR code (from the canvas on the page).
// Note: the built-in PDF fonts have no rupee sign, so amounts use "Rs".
export async function downloadTicketPdf(booking, qrDataUrl) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a5' }) // 148 x 210 mm
  const { show } = booking
  const W = 148
  const M = 12 // page margin

  // Header band
  doc.setFillColor(11, 13, 18)
  doc.rect(0, 0, W, 34, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(227, 38, 75)
  doc.text('I', M, 16)
  doc.setTextColor(255, 255, 255)
  doc.text('Movies', M + doc.getTextWidth('I'), 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(190, 195, 210)
  doc.text('IMovies - Movie ticket booking made simple', M, 23)
  doc.setTextColor(booking.status === 'cancelled' ? 248 : 74, booking.status === 'cancelled' ? 113 : 222, booking.status === 'cancelled' ? 113 : 128)
  doc.setFont('helvetica', 'bold')
  doc.text(booking.status === 'cancelled' ? 'CANCELLED' : 'BOOKING CONFIRMED', W - M, 16, { align: 'right' })

  // Film
  let y = 46
  doc.setTextColor(17, 20, 28)
  doc.setFontSize(16)
  const titleLines = doc.splitTextToSize(show?.movie?.title || 'Show removed', W - 2 * M)
  doc.text(titleLines, M, y)
  y += titleLines.length * 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(90, 96, 110)
  doc.text([show?.movie?.certificate, show?.language || show?.movie?.language].filter(Boolean).join('  |  '), M, y)
  y += 8

  // Details grid (two columns)
  const field = (label, value, x, yy) => {
    doc.setFontSize(7.5)
    doc.setTextColor(120, 126, 140)
    doc.setFont('helvetica', 'bold')
    doc.text(label.toUpperCase(), x, yy)
    doc.setFontSize(10.5)
    doc.setTextColor(17, 20, 28)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(String(value || '-'), (W - 2 * M) / 2 - 4)
    doc.text(lines, x, yy + 5)
    return lines.length
  }
  const col2 = M + (W - 2 * M) / 2
  doc.setDrawColor(220, 223, 230)
  doc.line(M, y, W - M, y)
  y += 7
  field('Date', show ? formatDate(show.startTime, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-', M, y)
  field('Time', show ? formatTime(show.startTime) : '-', col2, y)
  y += 14
  const cinemaLines = field('Cinema', show ? `${show.cinema?.name}, ${show.cinema?.locality}, ${show.cinema?.city}` : '-', M, y)
  field('Screen', show?.screenName, col2, y)
  y += 9 + cinemaLines * 4.5
  field('Seats', booking.seats.map((s) => s.code).join(', '), M, y)
  field('Amount', `Rs ${booking.totalAmount.toLocaleString('en-IN')}`, col2, y)
  y += 14
  field('Payment (demo)', booking.paymentMethod ? `${paymentLabel(booking.paymentMethod)} (UPI) - no money charged` : 'Demo checkout', M, y)
  field('Transaction ref', booking.paymentRef || '-', col2, y)
  y += 16

  // Dashed tear line
  doc.setLineDashPattern([1.5, 1.5], 0)
  doc.line(M, y, W - M, y)
  doc.setLineDashPattern([], 0)
  y += 8

  // QR + reference
  const qrSize = 42
  if (qrDataUrl) doc.addImage(qrDataUrl, 'PNG', M, y, qrSize, qrSize, undefined, 'FAST') // compressed
  const tx = M + qrSize + 8
  doc.setFontSize(8)
  doc.setTextColor(120, 126, 140)
  doc.text('BOOKING REFERENCE', tx, y + 8)
  doc.setFont('courier', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(17, 20, 28)
  doc.text(booking.bookingRef, tx, y + 17)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(90, 96, 110)
  doc.text(doc.splitTextToSize('Scan the QR to read the booking details on any phone.', W - tx - M), tx, y + 25)

  // Footer disclaimer
  doc.setFillColor(255, 248, 225)
  doc.rect(0, 186, W, 24, 'F')
  doc.setFontSize(7.5)
  doc.setTextColor(120, 90, 10)
  doc.text(
    doc.splitTextToSize(
      'DEMO TICKET - IMovies is a student project. This is not a ticket issued by the cinema and is not valid for entry. ' +
        'Showtimes, prices and seat availability are sample data; no real payment was made.',
      W - 2 * M,
    ),
    M,
    194,
  )

  doc.save(`IMovies-${booking.bookingRef}.pdf`)
}
