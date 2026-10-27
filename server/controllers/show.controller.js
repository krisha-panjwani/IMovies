const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const { IST_OFFSET, CLEANING_GAP_MINS } = require('../utils/constants');

const totalSeats = (layout) => layout.reduce((sum, row) => sum + row.seats, 0);

const CINEMA_FIELDS = 'name brand locality city address';

// GET /api/shows?movie=&cinema=&city=&date=YYYY-MM-DD
// Returns upcoming shows only. `date` is a calendar day in Indian time.
async function listShows(req, res) {
  const { movie, cinema, city, date } = req.query;
  const now = new Date();
  const filter = { startTime: { $gt: now } };

  if (movie) filter.movie = movie;
  if (cinema) filter.cinema = cinema;
  else if (city) filter.cinema = { $in: await Cinema.find({ city }).distinct('_id') };
  if (date) {
    const dayStart = new Date(`${date}T00:00:00${IST_OFFSET}`);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    filter.startTime = { $gt: dayStart > now ? dayStart : now, $lt: dayEnd };
  }

  const shows = await Show.find(filter)
    .sort({ startTime: 1 })
    .limit(500)
    .populate('cinema', CINEMA_FIELDS)
    .populate('movie', 'title language certificate durationMins posterUrl')
    .lean();

  // Send seat counts instead of the full seat arrays to keep the list small.
  const data = shows.map(({ seatLayout, bookedSeats, ...show }) => {
    const total = totalSeats(seatLayout);
    return { ...show, totalSeats: total, seatsLeft: total - bookedSeats.length };
  });
  res.json({ data });
}

// GET /api/shows/:id - everything the seat map needs.
async function getShow(req, res) {
  const show = await Show.findById(req.params.id)
    .populate('cinema', CINEMA_FIELDS)
    .populate('movie', 'title language certificate durationMins genres posterUrl backdropUrl')
    .lean();
  if (!show) throw new ApiError(404, 'Show not found');
  res.json({ data: { ...show, totalSeats: totalSeats(show.seatLayout) } });
}

// POST /api/shows (admin)
async function createShow(req, res) {
  const { movie: movieId, cinema: cinemaId, screenName, startTime, prices, language } = req.body;

  const [movie, cinema] = await Promise.all([
    Movie.findOne({ _id: movieId, isActive: true }),
    Cinema.findById(cinemaId),
  ]);
  if (!movie) throw new ApiError(404, 'Movie not found');
  if (!cinema) throw new ApiError(404, 'Cinema not found');
  if (!movie.durationMins) {
    throw new ApiError(400, `Add the runtime of "${movie.title}" before scheduling shows`);
  }

  const screen = cinema.screens.find((s) => s.name === screenName);
  if (!screen) throw new ApiError(400, `${cinema.name} has no screen called "${screenName}"`);

  const start = new Date(startTime);
  if (start <= new Date()) throw new ApiError(400, 'Show time must be in the future');
  const end = new Date(start.getTime() + (movie.durationMins + CLEANING_GAP_MINS) * 60 * 1000);

  // Two shows overlap if one starts before the other ends.
  const clash = await Show.findOne({
    cinema: cinema._id,
    screenName,
    startTime: { $lt: end },
    endTime: { $gt: start },
  }).populate('movie', 'title');
  if (clash) {
    throw new ApiError(409, `${screenName} is already showing "${clash.movie?.title}" at that time`);
  }

  const show = await Show.create({
    movie: movie._id,
    cinema: cinema._id,
    screenName,
    language: language || movie.language,
    startTime: start,
    endTime: end,
    prices,
    seatLayout: screen.rows,
  });
  res.status(201).json({ data: show });
}

// DELETE /api/shows/:id (admin) - refused if anyone holds a ticket.
async function deleteShow(req, res) {
  const confirmed = await Booking.countDocuments({ show: req.params.id, status: 'confirmed' });
  if (confirmed > 0) {
    throw new ApiError(409, `This show has ${confirmed} confirmed booking(s) and cannot be deleted`);
  }
  const show = await Show.findByIdAndDelete(req.params.id);
  if (!show) throw new ApiError(404, 'Show not found');
  res.json({ data: { message: 'Show deleted' } });
}

module.exports = { listShows, getShow, createShow, deleteShow };
