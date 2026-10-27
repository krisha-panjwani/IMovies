const mongoose = require('mongoose');

// A movie a user has saved to their favourites (watchlist).
const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  },
  { timestamps: true }
);

// A user can save each movie only once.
favoriteSchema.index({ user: 1, movie: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
