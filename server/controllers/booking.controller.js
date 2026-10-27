const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const bookingService = require('../services/booking.service');

// Everything the booking cards and ticket page need, in one query.
const showDetails = {
  path: 'show',
  select: 'startTime screenName language movie cinema',
  populate: [
    { path: 'movie', select: 'title posterUrl certificate language durationMins genres' },
    { path: 'cinema', select: 'name brand locality city address' },
  ],
};

// POST /api/bookings  { showId, seats: ["C7", "C8"], paymentMethod: "phonepe" }
async function createBooking(req, res) {
  const { showId, seats, paymentMethod } = req.body;
  const booking = await bookingService.createBooking(req.user._id, showId, seats, paymentMethod);
  await booking.populate(showDetails);
  res.status(201).json({ data: booking });
}

// GET /api/bookings/me
async function myBookings(req, res) {
  const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 }).populate(showDetails).lean();
  res.json({ data: bookings });
}

// GET /api/bookings/ref/:ref - the owner or an admin can view a ticket.
async function getByRef(req, res) {
  const booking = await Booking.findOne({ bookingRef: req.params.ref.toUpperCase() })
    .populate(showDetails)
    .populate('user', 'name email')
    .lean();

  const isOwner = booking && String(booking.user._id) === String(req.user._id);
  // Same 404 for "doesn't exist" and "not yours", so refs can't be probed.
  if (!booking || (!isOwner && req.user.role !== 'admin')) throw new ApiError(404, 'Booking not found');
  res.json({ data: booking });
}

// PATCH /api/bookings/:id/cancel
async function cancelBooking(req, res) {
  const booking = await bookingService.cancelBooking(req.user._id, req.params.id);
  res.json({ data: booking });
}

// GET /api/bookings (admin) - newest first.
async function allBookings(_req, res) {
  const bookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(300)
    .populate(showDetails)
    .populate('user', 'name email')
    .lean();
  res.json({ data: bookings });
}

module.exports = { createBooking, myBookings, getByRef, cancelBooking, allBookings };
