// Fills the database with the IMovies Indore catalogue:
// - real films and verified Indore cinemas (see seed/data/*.js for sources)
// - a DEMO show schedule for the next few days, built from each cinema's
//   verified lineup but with sample times, seat layouts and prices
// - an admin account and a demo user (every seat starts free)
// Run with:  npm run seed
//
// WARNING: this deletes ALL existing users, movies, cinemas, shows, bookings and favourites.

require('dotenv').config({ quiet: true, path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Favorite = require('../models/Favorite');
const { IST_OFFSET, CLEANING_GAP_MINS } = require('../utils/constants');
const movieData = require('./data/movies');
const cinemaData = require('./data/cinemas');

const DAYS_OF_SHOWS = 5;
const FIRST_SHOW = '09:30'; // IST
const LAST_START_MINS = 22 * 60 + 45; // no show starts after 10:45 pm
const SLOT_ROUNDING_MINS = 15;
const MIN = 60 * 1000;
const DAY_MS = 24 * 60 * MIN;
const IST_MS = 5.5 * 60 * MIN;

// "2026-10-25" for a Date, as a calendar day in Indian time.
const istDateKey = (date) => new Date(date.getTime() + IST_MS).toISOString().slice(0, 10);
// Minutes since midnight, Indian time.
const istMinutes = (date) => {
  const ist = new Date(date.getTime() + IST_MS);
  return ist.getUTCHours() * 60 + ist.getUTCMinutes();
};
const roundUpToSlot = (date) => {
  const step = SLOT_ROUNDING_MINS * MIN;
  return new Date(Math.ceil(date.getTime() / step) * step);
};

/**
 * Builds a realistic timetable for each screen: shows run back to back,
 * each starting after the previous film ends plus a cleaning gap, so shows
 * on one screen can never overlap. Films rotate through the cinema's lineup.
 */
function buildSchedule(cinemas, moviesByTitle, now) {
  const shows = [];
  cinemas.forEach((cinema, cinemaIndex) => {
    const { lineup, prices } = cinemaData[cinemaIndex];
    // One entry per film *version*, e.g. Clayface (English) and Clayface (Hindi).
    const versions = lineup.flatMap(({ title, languages }) => {
      const movie = moviesByTitle.get(title);
      if (!movie) throw new Error(`Lineup film "${title}" is not in seed/data/movies.js`);
      return (languages || [movie.language]).map((language) => ({ movie, language }));
    });

    for (let day = 0; day < DAYS_OF_SHOWS; day += 1) {
      const dateKey = istDateKey(new Date(now.getTime() + day * DAY_MS));
      cinema.screens.forEach((screen, screenIndex) => {
        // Stagger screens by 20 minutes, like a real multiplex.
        let start = new Date(new Date(`${dateKey}T${FIRST_SHOW}:00${IST_OFFSET}`).getTime() + screenIndex * 20 * MIN);
        let turn = day + screenIndex * 2;

        while (istMinutes(start) <= LAST_START_MINS && istDateKey(start) === dateKey) {
          const { movie, language } = versions[turn % versions.length];
          turn += 1;
          const end = new Date(start.getTime() + (movie.durationMins + CLEANING_GAP_MINS) * MIN);

          if (start > now) {
            const evening = istMinutes(start) >= 17 * 60 ? 30 : 0;
            shows.push({
              movie: movie._id,
              cinema: cinema._id,
              screenName: screen.name,
              language,
              startTime: start,
              endTime: end,
              prices: { classic: prices.classic + evening, prime: prices.prime + evening, recliner: prices.recliner + evening },
              seatLayout: screen.rows,
              bookedSeats: [],
            });
          }
          start = roundUpToSlot(end);
        }
      });
    }
  });
  return shows;
}

async function seed({ log = console.log } = {}) {
  const now = new Date();

  await Promise.all([
    User.deleteMany({}),
    Movie.deleteMany({}),
    Cinema.deleteMany({}),
    Show.deleteMany({}),
    Booking.deleteMany({}),
    Favorite.deleteMany({}),
  ]);

  // Users - created one by one so the password-hashing hook runs.
  const admin = await User.create({
    name: 'IMovies Admin',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@imovies.dev',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
    role: 'admin',
  });
  const demoUser = await User.create({
    name: 'Demo User',
    email: process.env.SEED_DEMO_EMAIL || 'demo@imovies.dev',
    password: process.env.SEED_DEMO_PASSWORD || 'Demo@12345',
  });
  const movies = await Movie.insertMany(movieData);
  const moviesByTitle = new Map(movies.map((m) => [m.title, m]));
  const cinemas = await Cinema.insertMany(cinemaData.map(({ prices, lineup, ...cinema }) => cinema));

  // Every show starts with ALL seats free. A seat is only shown as booked
  // after a real booking is made through the app.
  const shows = await Show.insertMany(buildSchedule(cinemas, moviesByTitle, now));

  const nowShowing = movies.filter((m) => m.releaseDate <= now).length;
  log(
    `Seeded ${movies.length} movies (${nowShowing} now showing), ${cinemas.length} Indore cinemas, ` +
      `${shows.length} demo shows. All seats start available.`
  );
  log(`Admin login: ${admin.email}   Demo user login: ${demoUser.email}   (passwords: see server/.env)`);
  return { admin, demoUser, movies, cinemas, shows };
}

module.exports = seed;

// Run directly from the command line: `npm run seed`
if (require.main === module) {
  (async () => {
    if (!process.argv.includes('--reset')) {
      console.error('This will DELETE all data in the database. Re-run with --reset (npm run seed) to confirm.');
      process.exit(1);
    }
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is missing. Copy server/.env.example to server/.env and fill it in.');
      process.exit(1);
    }
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      await seed();
    } catch (err) {
      console.error('Seeding failed:', err.message);
      process.exitCode = 1;
    } finally {
      await mongoose.disconnect();
    }
  })();
}
