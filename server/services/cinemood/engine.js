// CineMood recommendation engine - transparent, rule-based scoring.
// No machine learning: every point a movie gets comes with a human-readable reason.

const WEIGHTS = {
  primaryGenre: 3,
  secondaryGenre: 1,
  tag: 4,
  keyword: 1,
  maxKeywordPoints: 2,
  upcomingShow: 2,
};

// Movies scoring below this are not a good enough match to show.
const MIN_SCORE = 4;

const SHOW_WINDOW_DAYS = 7;

const formatShowTime = (date) =>
  new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

/**
 * Scores one movie for one mood.
 * @param movie     { genres, moodTags, synopsis, certificate }
 * @param mood      an entry from moods.js
 * @param nextShow  { startTime } of the soonest upcoming show, or null
 * @returns { score, reasons } or null when the movie is excluded / scores too low
 */
function scoreMovie(movie, mood, nextShow = null) {
  const genres = movie.genres || [];
  const tags = movie.moodTags || [];

  if (tags.some((t) => mood.exclude.tags.includes(t))) return null;
  if (mood.exclude.certificates.includes(movie.certificate)) return null;

  let score = 0;
  const reasons = [];

  const primary = genres.filter((g) => mood.primaryGenres.includes(g));
  if (primary.length) {
    score += primary.length * WEIGHTS.primaryGenre;
    reasons.push(`${primary.join(' + ')} ${primary.length > 1 ? 'genres' : 'genre'}`);
  }

  const secondary = genres.filter((g) => mood.secondaryGenres.includes(g));
  if (secondary.length) {
    score += secondary.length * WEIGHTS.secondaryGenre;
    reasons.push(`Also ${secondary.join(', ')}`);
  }

  const matchedTags = tags.filter((t) => mood.tags.includes(t));
  if (matchedTags.length) {
    score += matchedTags.length * WEIGHTS.tag;
    reasons.push(`Tagged ${matchedTags.map((t) => `"${t}"`).join(', ')}`);
  }

  const synopsis = (movie.synopsis || '').toLowerCase();
  const keywords = mood.keywords.filter((k) => synopsis.includes(k));
  if (keywords.length) {
    score += Math.min(keywords.length * WEIGHTS.keyword, WEIGHTS.maxKeywordPoints);
    reasons.push(`Story mentions ${keywords.slice(0, 2).join(', ')}`);
  }

  // Only a real match earns the "bookable" bonus - availability alone never
  // turns an unrelated movie into a recommendation.
  if (score === 0) return null;

  if (nextShow) {
    score += WEIGHTS.upcomingShow;
    reasons.push(`Next show ${formatShowTime(nextShow.startTime)}`);
  }

  return score >= MIN_SCORE ? { score, reasons } : null;
}

/**
 * Ranks movies for a mood: highest score first, then higher rating,
 * then the soonest show.
 * @param nextShows Map of movieId -> next show
 */
function recommend(movies, mood, nextShows = new Map()) {
  return movies
    .map((movie) => {
      const nextShow = nextShows.get(String(movie._id)) || null;
      const result = scoreMovie(movie, mood, nextShow);
      return result && { movie, nextShow, ...result };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.movie.rating || 0) - (a.movie.rating || 0) ||
        (a.nextShow ? new Date(a.nextShow.startTime) : Infinity) -
          (b.nextShow ? new Date(b.nextShow.startTime) : Infinity)
    );
}

module.exports = { scoreMovie, recommend, WEIGHTS, MIN_SCORE, SHOW_WINDOW_DAYS };
