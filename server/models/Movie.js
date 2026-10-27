const mongoose = require('mongoose');
const { GENRES, MOOD_TAGS, CERTIFICATES } = require('../utils/constants');

const nonEmptyArray = (field) => ({
  validator: (value) => Array.isArray(value) && value.length > 0,
  message: `At least one ${field} is required`,
});

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    tagline: { type: String, trim: true, maxlength: 160, default: '' },
    synopsis: {
      type: String,
      required: [true, 'Synopsis is required'],
      trim: true,
      minlength: [20, 'Synopsis must be at least 20 characters'],
      maxlength: [1500, 'Synopsis cannot exceed 1500 characters'],
    },
    genres: {
      type: [{ type: String, enum: GENRES }],
      validate: nonEmptyArray('genre'),
    },
    language: { type: String, required: [true, 'Language is required'], trim: true },
    // Optional because runtimes of upcoming films are often not announced yet.
    durationMins: {
      type: Number,
      min: [30, 'Duration must be at least 30 minutes'],
      max: [300, 'Duration cannot exceed 300 minutes'],
    },
    // Optional because a film is only certified shortly before release.
    certificate: { type: String, enum: CERTIFICATES },
    // Optional - left empty unless there is a real source for it.
    rating: { type: Number, min: 0, max: 10 },
    releaseDate: { type: Date, required: [true, 'Release date is required'] },
    director: { type: String, trim: true, default: '' },
    cast: { type: [String], default: [] },
    posterUrl: { type: String, trim: true, default: '' },
    backdropUrl: { type: String, trim: true, default: '' },
    trailerUrl: { type: String, trim: true, default: '' },
    // Where the facts and poster came from, shown on the movie page.
    sourceName: { type: String, trim: true, default: '' },
    sourceUrl: { type: String, trim: true, default: '' },
    // How the movie feels - used by CineMood.
    moodTags: { type: [{ type: String, enum: MOOD_TAGS }], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

movieSchema.index({ isActive: 1, releaseDate: -1 });
movieSchema.index({ genres: 1 });

module.exports = mongoose.model('Movie', movieSchema);
