const crypto = require('crypto');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const generateBookingRef = require('../utils/bookingRef');

const MAX_SEATS_PER_BOOKING = 10;
const CANCELLATION_CUTOFF_HOURS = 2;

// Turns ["C7", "E3"] into [{ code, tier, price }] using the show's own layout
// and prices. The client never decides the price - the server does.
function priceSeats(show, seatCodes) {
  const rows = new Map(show.seatLayout.map((row) => [row.label, row]));

  return seatCodes.map((code) => {
    const match = /^([A-Z])(\d{1,2})$/.exec(code);
    const row = match && rows.get(match[1]);
    const number = match && Number(match[2]);
    if (!row || number < 1 || number > row.seats) {
      throw new ApiError(400, `Seat ${code} does not exist in this screen`);
    }
    return { code, tier: row.tier, price: show.prices[row.tier] };
  });
}

async function createBookingWithUniqueRef(data) {
  // A clash between two random refs is very unlikely, but retry just in case.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await Booking.create({ ...data, bookingRef: generateBookingRef() });
    } catch (err) {
      if (err.code !== 11000 || !err.keyValue?.bookingRef) throw err;
    }
  }
  throw new ApiError(500, 'Could not generate a booking reference');
}

/**
 * Books seats for a user. The key step is the atomic "claim":
 * MongoDB updates a single document atomically, so the condition
 * "none of these seats are already booked" and the write "mark them booked"
 * happen as one operation. If two users race for the same seat, exactly one
 * update matches; the other gets a 409 Conflict.
 */
async function createBooking(userId, showId, seatCodes, paymentMethod) {
  const codes = [...new Set(seatCodes.map((s) => String(s).trim().toUpperCase()))];
  if (codes.length === 0) throw new ApiError(400, 'Select at least one seat');
  if (codes.length > MAX_SEATS_PER_BOOKING) {
    throw new ApiError(400, `You can book up to ${MAX_SEATS_PER_BOOKING} seats at a time`);
  }

  const show = await Show.findById(showId);
  if (!show) throw new ApiError(404, 'Show not found');
  if (show.startTime <= new Date()) throw new ApiError(400, 'This show has already started');

  const seats = priceSeats(show, codes);
  const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);

  const claimed = await Show.findOneAndUpdate(
    { _id: show._id, startTime: { $gt: new Date() }, bookedSeats: { $nin: codes } },
    { $push: { bookedSeats: { $each: codes } } },
    { returnDocument: 'after' }
  );

  if (!claimed) {
    const latest = await Show.findById(show._id).select('bookedSeats');
    const taken = codes.filter((code) => latest?.bookedSeats.includes(code));
    const message = taken.length
      ? `Sorry, ${taken.join(', ')} ${taken.length > 1 ? 'were' : 'was'} just booked by someone else. Please choose other seats.`
      : 'These seats are no longer available. Please choose again.';
    throw new ApiError(409, message, { takenSeats: taken });
  }

  try {
    return await createBookingWithUniqueRef({
      user: userId,
      show: show._id,
      seats,
      totalAmount,
      paymentMethod,
      // Simulated UPI transaction id, clearly marked as demo.
      paymentRef: `DEMO-UPI-${crypto.randomBytes(5).toString('hex').toUpperCase()}`,
      paidAt: new Date(),
    });
  } catch (err) {
    // Saving the booking failed, so give the seats back (compensating action).
    await Show.updateOne({ _id: show._id }, { $pull: { bookedSeats: { $in: codes } } });
    throw err;
  }
}

/**
 * Cancellation policy: allowed up to 2 hours before the show starts.
 * The booking is marked "cancelled" (never deleted) and its seats are released.
 */
async function cancelBooking(userId, bookingId) {
  const booking = await Booking.findOne({ _id: bookingId, user: userId }).populate('show', 'startTime');
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status === 'cancelled') throw new ApiError(400, 'This booking is already cancelled');
  if (!booking.show) throw new ApiError(400, 'This show is no longer available');

  const hoursLeft = (booking.show.startTime.getTime() - Date.now()) / 3_600_000;
  if (hoursLeft < CANCELLATION_CUTOFF_HOURS) {
    throw new ApiError(400, `Bookings can only be cancelled up to ${CANCELLATION_CUTOFF_HOURS} hours before the show`);
  }

  // The status condition makes this safe if "Cancel" is clicked twice.
  const cancelled = await Booking.findOneAndUpdate(
    { _id: booking._id, status: 'confirmed' },
    { status: 'cancelled', cancelledAt: new Date() },
    { returnDocument: 'after' }
  );
  if (!cancelled) throw new ApiError(400, 'This booking is already cancelled');

  await Show.updateOne(
    { _id: booking.show._id },
    { $pull: { bookedSeats: { $in: booking.seats.map((s) => s.code) } } }
  );
  return cancelled;
}

module.exports = {
  createBooking,
  cancelBooking,
  priceSeats,
  MAX_SEATS_PER_BOOKING,
  CANCELLATION_CUTOFF_HOURS,
};
