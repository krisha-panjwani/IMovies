const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');
const movieRoutes = require('./routes/movie.routes');
const cinemaRoutes = require('./routes/cinema.routes');
const showRoutes = require('./routes/show.routes');
const bookingRoutes = require('./routes/booking.routes');
const cinemoodRoutes = require('./routes/cinemood.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// The Express app is built here and started in server.js. Keeping them apart
// lets the tests use the app without opening a real network port.
const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((o) => o.trim());

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Opening the API base URL in a browser shows what is available.
app.get('/api', (_req, res) => {
  res.json({
    data: {
      name: 'IMovies API - Movie ticket booking made simple',
      status: 'running',
      website: 'Open http://localhost:5173 (run "npm run dev" in the client folder)',
      endpoints: ['/api/health', '/api/movies', '/api/cinemas', '/api/shows', '/api/bookings', '/api/favorites', '/api/cinemood/moods'],
    },
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ data: { status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/cinemood', cinemoodRoutes);
app.use('/api/favorites', favoriteRoutes);

app.use('/api', notFound);
app.use(errorHandler);

module.exports = app;
