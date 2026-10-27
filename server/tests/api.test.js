// End-to-end API tests against a temporary in-memory MongoDB filled with
// the demo seed data. Run with:  npm test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;
let server;
let baseUrl;
let seeded;

async function api(method, path, { token, body } = {}) {
  const res = await fetch(`${baseUrl}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json() };
}

async function registerUser(email) {
  const res = await api('POST', '/auth/register', { body: { name: 'Test User', email, password: 'Passw0rd!' } });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res.body.data.token;
}

// A show far enough ahead that it can still be cancelled.
const laterShow = () => seeded.shows.find((s) => s.startTime.getTime() - Date.now() > 3 * 3_600_000);

// Seats in the show that nobody has booked yet.
async function freeSeats(showId, count) {
  const { body } = await api('GET', `/shows/${showId}`);
  const booked = new Set(body.data.bookedSeats);
  const free = [];
  for (const row of body.data.seatLayout) {
    for (let n = 1; n <= row.seats && free.length < count; n += 1) {
      if (!booked.has(`${row.label}${n}`)) free.push(`${row.label}${n}`);
    }
  }
  return free;
}

test.before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri('imovies-test'));
  seeded = await require('../seed/seed')({ log: () => {} });
  const app = require('../app');
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  server?.close();
  await mongoose.disconnect();
  await mongo?.stop();
});

test('health check reports the database as connected', async () => {
  const res = await api('GET', '/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.data.database, 'connected');
});

test('register validates input and never returns the password', async () => {
  const bad = await api('POST', '/auth/register', { body: { name: 'A', email: 'nope', password: 'short' } });
  assert.equal(bad.status, 400);
  assert.ok(bad.body.errors.length >= 1);

  await registerUser('alice@example.com');
  const dup = await api('POST', '/auth/register', {
    body: { name: 'Alice', email: 'alice@example.com', password: 'Passw0rd!' },
  });
  assert.equal(dup.status, 409);

  const login = await api('POST', '/auth/login', { body: { email: 'alice@example.com', password: 'Passw0rd!' } });
  assert.equal(login.status, 200);
  assert.equal(login.body.data.user.password, undefined);
  assert.equal(login.body.data.user.role, 'user');

  const wrong = await api('POST', '/auth/login', { body: { email: 'alice@example.com', password: 'Wrong123' } });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.body.message, 'Invalid email or password');
});

test('movies can be listed, searched and filtered', async () => {
  const all = await api('GET', '/movies');
  assert.equal(all.status, 200);
  assert.equal(all.body.data.length, seeded.movies.length);

  const search = await api('GET', '/movies?search=drishyam');
  assert.deepEqual(search.body.data.map((m) => m.title), ['Drishyam: The Conclusion']);

  const regex = await api('GET', '/movies?search=' + encodeURIComponent('(.*'));
  assert.equal(regex.status, 200, 'search text is matched literally, not as a regex');

  const upcoming = await api('GET', '/movies?status=upcoming');
  assert.ok(upcoming.body.data.every((m) => new Date(m.releaseDate) > new Date()));

  const missing = await api('GET', '/movies/000000000000000000000000');
  assert.equal(missing.status, 404);
});

test('Indore is the seeded city and shows can be filtered by city', async () => {
  const cities = await api('GET', '/cinemas/cities');
  assert.deepEqual(cities.body.data.map((c) => c.name), ['Indore']);

  const indore = await api('GET', '/shows?city=Indore');
  assert.ok(indore.body.data.length > 0);
  assert.ok(indore.body.data.every((s) => s.cinema.city === 'Indore' && s.language));

  const elsewhere = await api('GET', '/shows?city=Mumbai');
  assert.equal(elsewhere.body.data.length, 0);

  const nowInIndore = await api('GET', '/movies?status=now&city=Indore');
  assert.ok(nowInIndore.body.data.length > 0);
  assert.ok(nowInIndore.body.data.every((m) => m.inCity.shows > 0 && m.inCity.cinemas > 0));
});

test('seeded shows start with every seat available', async () => {
  assert.ok(seeded.shows.every((s) => s.bookedSeats.length === 0));
  const { body } = await api('GET', '/bookings', {
    token: (await api('POST', '/auth/login', {
      body: { email: seeded.admin.email, password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345' },
    })).body.data.token,
  });
  assert.equal(body.data.length, 0, 'no fake bookings are created by the seed');
});

test('demo schedule: no two shows overlap on the same screen', async () => {
  const byScreen = new Map();
  for (const show of seeded.shows) {
    const key = `${show.cinema}|${show.screenName}`;
    if (!byScreen.has(key)) byScreen.set(key, []);
    byScreen.get(key).push(show);
  }
  for (const shows of byScreen.values()) {
    shows.sort((a, b) => a.startTime - b.startTime);
    for (let i = 1; i < shows.length; i += 1) {
      assert.ok(shows[i].startTime >= shows[i - 1].endTime, 'shows on one screen must not overlap');
    }
  }
});

test('booking requires login and the server calculates the price', async () => {
  const show = laterShow();
  const seats = await freeSeats(show._id, 2);

  const anonymous = await api('POST', '/bookings', { body: { showId: show._id, seats, paymentMethod: 'gpay' } });
  assert.equal(anonymous.status, 401);

  const token = await registerUser('bob@example.com');
  const res = await api('POST', '/bookings', { token, body: { showId: show._id, seats, totalAmount: 1, paymentMethod: 'phonepe' } });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  assert.match(res.body.data.bookingRef, /^IMV-[A-Z0-9]{6}$/);
  const expected = res.body.data.seats.reduce((sum, s) => sum + s.price, 0);
  assert.equal(res.body.data.totalAmount, expected);
  assert.ok(expected > 1, 'client-sent total must be ignored');
  assert.equal(res.body.data.paymentMethod, 'phonepe');
  assert.match(res.body.data.paymentRef, /^DEMO-UPI-[A-F0-9]{10}$/);
  assert.equal(res.body.data.paymentMode, 'DEMO');

  const noPayment = await api('POST', '/bookings', { token, body: { showId: show._id, seats: ['A1'] } });
  assert.equal(noPayment.status, 400, 'a payment method is required');
  const badPayment = await api('POST', '/bookings', { token, body: { showId: show._id, seats: ['A1'], paymentMethod: 'cash' } });
  assert.equal(badPayment.status, 400, 'only PhonePe, Google Pay and Paytm are accepted');

  const again = await api('POST', '/bookings', { token, body: { showId: show._id, seats, paymentMethod: 'paytm' } });
  assert.equal(again.status, 409, 'the same seats cannot be booked twice');

  const invalid = await api('POST', '/bookings', { token, body: { showId: show._id, seats: ['Z99'], paymentMethod: 'gpay' } });
  assert.equal(invalid.status, 400);
});

test('two users racing for the same seat: exactly one wins', async () => {
  const show = laterShow();
  const [seat] = await freeSeats(show._id, 1);
  const tokens = await Promise.all(
    Array.from({ length: 5 }, (_, i) => registerUser(`racer${i}@example.com`))
  );

  const results = await Promise.all(
    tokens.map((token) => api('POST', '/bookings', { token, body: { showId: show._id, seats: [seat], paymentMethod: 'gpay' } }))
  );
  const statuses = results.map((r) => r.status).sort();
  assert.deepEqual(statuses, [201, 409, 409, 409, 409]);

  const { body } = await api('GET', `/shows/${show._id}`);
  assert.equal(body.data.bookedSeats.filter((s) => s === seat).length, 1);
});

test('cancelling releases the seats and only the owner can cancel', async () => {
  const show = laterShow();
  const seats = await freeSeats(show._id, 2);
  const owner = await registerUser('carol@example.com');
  const stranger = await registerUser('dave@example.com');

  const { body } = await api('POST', '/bookings', { token: owner, body: { showId: show._id, seats, paymentMethod: 'phonepe' } });
  const id = body.data._id;

  const notMine = await api('PATCH', `/bookings/${id}/cancel`, { token: stranger });
  assert.equal(notMine.status, 404);

  const cancel = await api('PATCH', `/bookings/${id}/cancel`, { token: owner });
  assert.equal(cancel.status, 200);
  assert.equal(cancel.body.data.status, 'cancelled');

  const twice = await api('PATCH', `/bookings/${id}/cancel`, { token: owner });
  assert.equal(twice.status, 400);

  const after = await api('GET', `/shows/${show._id}`);
  assert.ok(seats.every((s) => !after.body.data.bookedSeats.includes(s)), 'seats are free again');

  const history = await api('GET', '/bookings/me', { token: owner });
  assert.equal(history.body.data[0].status, 'cancelled');
});

test('admin routes are blocked for normal users and work for admins', async () => {
  const userToken = await registerUser('eve@example.com');
  const denied = await api('GET', '/bookings', { token: userToken });
  assert.equal(denied.status, 403);

  const login = await api('POST', '/auth/login', {
    body: { email: seeded.admin.email, password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345' },
  });
  const adminToken = login.body.data.token;

  const created = await api('POST', '/movies', {
    token: adminToken,
    body: {
      title: 'Test Movie',
      synopsis: 'A movie created by the automated test suite.',
      genres: ['Drama'],
      language: 'English',
      durationMins: 100,
      certificate: 'U',
      releaseDate: new Date().toISOString(),
    },
  });
  assert.equal(created.status, 201, JSON.stringify(created.body));

  const cinema = seeded.cinemas[0];
  const startTime = new Date(Date.now() + 40 * 24 * 3_600_000).toISOString();
  const showBody = {
    movie: created.body.data._id,
    cinema: cinema._id,
    screenName: cinema.screens[0].name,
    startTime,
    prices: { classic: 100, prime: 150, recliner: 300 },
  };
  const show = await api('POST', '/shows', { token: adminToken, body: showBody });
  assert.equal(show.status, 201, JSON.stringify(show.body));

  const clash = await api('POST', '/shows', { token: adminToken, body: showBody });
  assert.equal(clash.status, 409, 'overlapping shows on one screen are refused');

  const all = await api('GET', '/bookings', { token: adminToken });
  assert.equal(all.status, 200);
});

test('favourites: login required, add, list, no duplicates, remove', async () => {
  const movie = seeded.movies[0];
  const anonymous = await api('GET', '/favorites');
  assert.equal(anonymous.status, 401);

  const token = await registerUser('fan@example.com');
  const add = await api('POST', '/favorites', { token, body: { movieId: movie._id } });
  assert.equal(add.status, 201);
  const again = await api('POST', '/favorites', { token, body: { movieId: movie._id } });
  assert.equal(again.status, 201, 'saving the same movie twice is harmless');

  const list = await api('GET', '/favorites', { token });
  assert.deepEqual(list.body.data.map((m) => m.title), [movie.title], 'the movie is listed once');

  const other = await registerUser('other-fan@example.com');
  const otherList = await api('GET', '/favorites', { token: other });
  assert.equal(otherList.body.data.length, 0, 'favourites are private to each user');

  const bad = await api('POST', '/favorites', { token, body: { movieId: '000000000000000000000000' } });
  assert.equal(bad.status, 404);

  const remove = await api('DELETE', `/favorites/${movie._id}`, { token });
  assert.equal(remove.status, 200);
  const empty = await api('GET', '/favorites', { token });
  assert.equal(empty.body.data.length, 0);
});

test('CineMood returns explained, bookable recommendations', async () => {
  const moods = await api('GET', '/cinemood/moods');
  assert.equal(moods.body.data.length, 5);

  const res = await api('GET', '/cinemood/recommendations?mood=plot-twist');
  assert.equal(res.status, 200);
  const titles = res.body.data.results.map((r) => r.movie.title);
  assert.ok(titles.includes('Drishyam: The Conclusion'));
  assert.ok(res.body.data.results.every((r) => r.reasons.length > 0));

  const bad = await api('GET', '/cinemood/recommendations?mood=sleepy');
  assert.equal(bad.status, 400);
});
