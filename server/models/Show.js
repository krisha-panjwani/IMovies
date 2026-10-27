const mongoose = require('mongoose');
const { rowSchema } = require('./Cinema');

const priceField = { type: Number, required: true, min: [0, 'Price cannot be negative'] };

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    cinema: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
    screenName: { type: String, required: true, trim: true },
    // Language of this screening, e.g. a Hindi-dubbed show of an English film.
    language: { type: String, trim: true },
    startTime: { type: Date, required: true },
    // startTime + movie duration + cleaning gap. Used to stop two shows
    // overlapping on the same screen.
    endTime: { type: Date, required: true },
    prices: {
      classic: priceField,
      prime: priceField,
      recliner: priceField,
    },
    // A copy of the screen layout at the time the show was created, so later
    // edits to the cinema never change seats that were already sold.
    seatLayout: { type: [rowSchema], required: true },
    // Seat codes already sold, e.g. ["C7", "C8"]. Updated atomically by the
    // booking service - this array is what prevents double-booking.
    bookedSeats: { type: [String], default: [] },
  },
  { timestamps: true }
);

showSchema.index({ movie: 1, startTime: 1 });
showSchema.index({ cinema: 1, screenName: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Show', showSchema);
