const Movie = require('../models/Movie');
const Show = require('../models/Show');
const ApiError = require('../utils/ApiError');
const moods = require('../services/cinemood/moods');
const { recommend, SHOW_WINDOW_DAYS } = require('../services/cinemood/engine');

// Public view of a mood - the matching rules are included on purpose,
// so the UI can explain exactly how CineMood works.
const describeMood = ({ id, name, description, color, icon, primaryGenres, tags }) => ({
  id,
  name,
  description,
  color,
  icon,
  primaryGenres,
  tags,
});

// GET /api/cinemood/moods
function listMoods(_req, res) {
  res.json({ data: moods.map(describeMood) });
}

// GET /api/cinemood/recommendations?mood=good-laugh
async function getRecommendations(req, res) {
  const mood = moods.find((m) => m.id === req.query.mood);
  if (!mood) throw new ApiError(400, 'Choose a valid mood');

  const now = new Date();
  const windowEnd = new Date(now.getTime() + SHOW_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [movies, shows] = await Promise.all([
    Movie.find({ isActive: true }).lean(),
    Show.find({ startTime: { $gt: now, $lt: windowEnd } })
      .sort({ startTime: 1 })
      .select('movie cinema startTime')
      .populate('cinema', 'name')
      .lean(),
  ]);

  // Shows are sorted by time, so the first one seen per movie is the soonest.
  const nextShows = new Map();
  for (const show of shows) {
    const key = String(show.movie);
    if (!nextShows.has(key)) nextShows.set(key, show);
  }

  const results = recommend(movies, mood, nextShows).map(({ movie, nextShow, score, reasons }) => ({
    movie,
    score,
    reasons,
    nextShow: nextShow && { _id: nextShow._id, startTime: nextShow.startTime, cinemaName: nextShow.cinema?.name },
  }));

  res.json({ data: { mood: describeMood(mood), results } });
}

module.exports = { listMoods, getRecommendations };
