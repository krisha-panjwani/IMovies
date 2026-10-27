const mongoose = require('mongoose');
const { TIERS } = require('../utils/constants');

// One row of seats, e.g. { label: 'E', seats: 14, tier: 'prime' } = seats E1..E14.
// Exported because a Show keeps its own copy of the layout.
const rowSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      uppercase: true,
      match: [/^[A-Z]$/, 'Row label must be a single letter A-Z'],
    },
    seats: { type: Number, required: true, min: 1, max: 30 },
    tier: { type: String, enum: TIERS, required: true },
  },
  { _id: false }
);

const screenSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Screen name is required'], trim: true },
    rows: {
      type: [rowSchema],
      validate: {
        validator: (rows) => rows.length > 0 && new Set(rows.map((r) => r.label)).size === rows.length,
        message: 'A screen needs at least one row and row labels must be unique',
      },
    },
  },
  { _id: false }
);

const cinemaSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Cinema name is required'], trim: true },
    brand: { type: String, trim: true, default: '' }, // e.g. PVR, INOX
    locality: { type: String, trim: true, default: '' }, // e.g. Regal Square
    city: { type: String, required: [true, 'City is required'], trim: true },
    state: { type: String, trim: true, default: '' },
    address: { type: String, required: [true, 'Address is required'], trim: true },
    amenities: { type: [String], default: [] },
    // Where the venue's name and address were verified.
    sourceUrl: { type: String, trim: true, default: '' },
    screens: {
      type: [screenSchema],
      validate: {
        validator: (screens) => screens.length > 0 && new Set(screens.map((s) => s.name)).size === screens.length,
        message: 'A cinema needs at least one screen and screen names must be unique',
      },
    },
  },
  { timestamps: true }
);

const Cinema = mongoose.model('Cinema', cinemaSchema);

module.exports = Cinema;
module.exports.rowSchema = rowSchema;
