const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Cinema = require('../models/Cinema');
const ApiError = require('../utils/ApiError');
const { GENRES, MOOD_TAGS, CERTIFICATES } = require('../utils/constants');

// Escapes characters like "." or "(" so user search text is matched literally.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const EDITABLE_FIELDS = [
  'title',
  'tagline',
  'synopsis',
  'genres',
  'language',
  'durationMins',
  'certificate',
  'rating',
  'releaseDate',
  'director',
  'cast',
  'posterUrl',
  'backdropUrl',
  'trailerUrl',
  'sourceName',
  'sourceUrl',
  'moodTags',
];

// Copies only allowed fields, so a request can never set e.g. isActive or _id.
const pickEditable = (body) =>
  Object.fromEntries(EDITABLE_FIELDS.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));

// For each movie with upcoming shows in a city: how many shows, at how many
// cinemas, and when the next one starts.
async function showStatsForCity(city) {
  const cinemaIds = await Cinema.find({ city }).distinct('_id');
  const stats = await Show.aggregate([
    { $match: { cinema: { $in: cinemaIds }, startTime: { $gt: new Date() } } },
    { $group: { _id: '$movie', shows: { $sum: 1 }, cinemas: { $addToSet: '$cinema' }, nextShow: { $min: '$startTime' } } },
  ]);
  return new Map(
    stats.map((s) => [String(s._id), { shows: s.shows, cinemas: s.cinemas.length, nextShow: s.nextShow }])
  );
}

// GET /api/movies?search=&genre=&language=&status=now|upcoming&city=
// With `city`, each movie gets `inCity: { shows, cinemas, nextShow }` and
// "now" means "has upcoming shows in that city".
async function listMovies(req, res) {
  const { search, genre, language, status, city } = req.query;
  const filter = { isActive: true };

  if (search) filter.title = { $regex: escapeRegex(search), $options: 'i' };
  if (genre) filter.genres = genre;
  if (language) filter.language = language;

  const now = new Date();
  let sort = { releaseDate: -1 };
  if (status === 'now') filter.releaseDate = { $lte: now };
  if (status === 'upcoming') {
    filter.releaseDate = { $gt: now };
    sort = { releaseDate: 1 };
  }

  let movies = await Movie.find(filter).sort(sort).lean();

  if (city) {
    const stats = await showStatsForCity(city);
    movies = movies.map((movie) => ({ ...movie, inCity: stats.get(String(movie._id)) || null }));
    if (status === 'now') {
      // Most widely released first: number of cinemas, then number of shows.
      movies = movies
        .filter((m) => m.inCity)
        .sort((a, b) => b.inCity.cinemas - a.inCity.cinemas || b.inCity.shows - a.inCity.shows);
    }
  }

  res.json({ data: movies });
}

// GET /api/movies/meta - lists used to build filter chips and admin forms.
async function getMeta(_req, res) {
  const languages = await Movie.distinct('language', { isActive: true });
  res.json({ data: { genres: GENRES, moodTags: MOOD_TAGS, certificates: CERTIFICATES, languages: languages.sort() } });
}

// GET /api/movies/:id
async function getMovie(req, res) {
  const movie = await Movie.findOne({ _id: req.params.id, isActive: true }).lean();
  if (!movie) throw new ApiError(404, 'Movie not found');
  res.json({ data: movie });
}

// POST /api/movies (admin)
async function createMovie(req, res) {
  const movie = await Movie.create(pickEditable(req.body));
  res.status(201).json({ data: movie });
}

// PUT /api/movies/:id (admin)
async function updateMovie(req, res) {
  const movie = await Movie.findOneAndUpdate({ _id: req.params.id, isActive: true }, pickEditable(req.body), {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!movie) throw new ApiError(404, 'Movie not found');
  res.json({ data: movie });
}

// DELETE /api/movies/:id (admin) - a soft delete: the movie is hidden but kept,
// so old bookings still show the correct title.
async function deleteMovie(req, res) {
  const upcoming = await Show.countDocuments({ movie: req.params.id, startTime: { $gt: new Date() } });
  if (upcoming > 0) {
    throw new ApiError(409, `This movie still has ${upcoming} upcoming show(s). Delete those shows first.`);
  }
  const movie = await Movie.findOneAndUpdate({ _id: req.params.id, isActive: true }, { isActive: false });
  if (!movie) throw new ApiError(404, 'Movie not found');
  res.json({ data: { message: 'Movie removed' } });
}

module.exports = { listMovies, getMeta, getMovie, createMovie, updateMovie, deleteMovie };
