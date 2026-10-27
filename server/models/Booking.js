const mongoose = require('mongoose');
const { TIERS, PAYMENT_METHODS } = require('../utils/constants');

const bookedSeatSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    tier: { type: String, enum: TIERS, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    seats: {
      type: [bookedSeatSchema],
      validate: { validator: (seats) => seats.length > 0, message: 'A booking needs at least one seat' },
    },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    // IMovies uses a demo checkout - no real payment is ever taken.
    paymentMode: { type: String, enum: ['DEMO'], default: 'DEMO' },
    // Which UPI app the user chose at the demo checkout, and a simulated
    // transaction reference. Nothing here comes from a real payment provider.
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentRef: { type: String, required: true },
    paidAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ show: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
