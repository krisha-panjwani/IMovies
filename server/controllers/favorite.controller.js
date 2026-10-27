const Favorite = require('../models/Favorite');
const Movie = require('../models/Movie');
const ApiError = require('../utils/ApiError');

// GET /api/favorites - the logged-in user's saved movies, newest first.
async function listFavorites(req, res) {
  const favorites = await Favorite.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate({ path: 'movie', match: { isActive: true } })
    .lean();
  // Skip movies that an admin has removed since they were saved.
  res.json({ data: favorites.filter((f) => f.movie).map((f) => ({ ...f.movie, favoritedAt: f.createdAt })) });
}

// POST /api/favorites { movieId } - saving the same movie twice is harmless.
async function addFavorite(req, res) {
  const movie = await Movie.findOne({ _id: req.body.movieId, isActive: true });
  if (!movie) throw new ApiError(404, 'Movie not found');

  await Favorite.updateOne(
    { user: req.user._id, movie: movie._id },
    { $setOnInsert: { user: req.user._id, movie: movie._id } },
    { upsert: true }
  );
  res.status(201).json({ data: { movieId: movie._id, favorite: true } });
}

// DELETE /api/favorites/:movieId
async function removeFavorite(req, res) {
  await Favorite.deleteOne({ user: req.user._id, movie: req.params.movieId });
  res.json({ data: { movieId: req.params.movieId, favorite: false } });
}

module.exports = { listFavorites, addFavorite, removeFavorite };
