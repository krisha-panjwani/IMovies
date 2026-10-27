# IMovies — Architecture

## System overview

```text
┌──────────────── Browser ────────────────┐
│ React pages → components → api/index.js │
│ AuthContext keeps { user, token }       │
└───────────────┬─────────────────────────┘
                │ HTTPS + JSON, header: Authorization: Bearer <JWT>
┌───────────────▼─────────────────────────┐
│ Express app (app.js)                    │
│  helmet → cors → json → [rate limit]    │
│  route → [protect] → [adminOnly] →      │
│  [validate] → controller → service      │
│  → errorHandler (one JSON error format) │
└───────────────┬─────────────────────────┘
                │ Mongoose
┌───────────────▼─────────────────────────┐
│ MongoDB: users, movies, cinemas,        │
│ shows, bookings                         │
└─────────────────────────────────────────┘
```

| Layer | Job | Example |
|---|---|---|
| Route | Which URL runs what, plus validation rules | `routes/booking.routes.js` |
| Middleware | Is the request allowed and valid? | `middleware/auth.js` |
| Controller | Read the request, send the response | `controllers/booking.controller.js` |
| Service | Business rules | `services/booking.service.js` |
| Model | Shape and validation of stored data | `models/Booking.js` |

## Data model

```text
User 1 ──── * Booking * ──── 1 Show * ──── 1 Movie
                                   * ──── 1 Cinema
User 1 ──── * Favorite * ──── 1 Movie
```

| Collection | Key fields | Notes |
|---|---|---|
| **users** | name, email (unique), password (bcrypt hash, `select: false`), role | Public sign-up always creates `user`; admins come from the seed script |
| **movies** | title, synopsis, genres[], language, durationMins?, certificate? (CBFC: U / UA7+ / UA13+ / UA16+ / A), releaseDate, director, cast[], posterUrl, sourceName, sourceUrl, moodTags[], isActive | Runtime and certificate are optional for upcoming films; `sourceUrl` records where facts and the poster came from; `moodTags` power CineMood |
| **cinemas** | name, brand, locality, city, state, address, amenities[], sourceUrl, screens[{ name, rows[{ label, seats, tier }] }] | Venue facts are verified (District); screen layouts are demo values; tiers: classic, prime, recliner |
| **shows** | movie → Movie, cinema → Cinema, screenName, language, startTime, endTime, prices{}, seatLayout[], bookedSeats[] | `language` = this screening's language (e.g. Hindi version); `bookedSeats` is the double-booking guard |
| **bookings** | bookingRef (unique), user → User, show → Show, seats[{ code, tier, price }], totalAmount, status, paymentMode: DEMO, paymentMethod (phonepe / gpay / paytm), paymentRef (DEMO-UPI-…), paidAt | Never deleted, only marked cancelled |
| **favorites** | user → User, movie → Movie, timestamps | Unique `{user, movie}` index, so a movie is saved once per user; removed movies are skipped when listing |

**Indexes:**
- shows: `{movie, startTime}`, plus a unique `{cinema, screenName, startTime}`
- bookings: `{user, createdAt}` and `{show, status}`
- users: `email` (unique)
- bookings: `bookingRef` (unique)

## Booking sequence

```text
POST /api/bookings { showId, seats }
 1. protect    → valid JWT? → req.user
 2. validate   → 1-10 seats, each like "C7"
 3. load show  → exists, not started, seats exist in its layout
 4. price      → server adds up the tier prices (any client total is ignored)
 5. claim      → findOneAndUpdate({ _id, startTime > now, bookedSeats: { $nin: seats } },
                                  { $push: { bookedSeats: { $each: seats } } })
                 no match → 409 + list of seats that were taken
 6. save       → Booking.create(...) with a unique ref; on failure, $pull the seats back
 7. respond    → 201 with booking + show details
```

**Cancellation:**
1. The booking must belong to the user, be `confirmed`, and the show must be ≥ 2 hours away.
2. The status is changed with a conditional update (`status: 'confirmed'`), so a double click can't cancel twice.
3. The seats are released with `$pull`.

## City support

Every cinema stores `city` and `state`. The API filters by city (`/api/shows?city=`, `/api/cinemas?city=`, `/api/movies?city=`), and `/api/cinemas/cities` lists the cities that have cinemas. The frontend uses one constant (`client/src/utils/city.js`, Indore). Adding a city means adding cinemas and making the selector read from `/api/cinemas/cities`.

## Frontend routing

| Route | Page | Guard |
|---|---|---|
| `/` | Home | — |
| `/movies` | Catalogue (filters stored in the URL) | — |
| `/movies/:id` | Details + showtimes | — |
| `/cinemas` | Indore cinemas | — |
| `/cinemas/:id` | One cinema's movies and showtimes by date | — |
| `/cinemood` | Mood picker + recommendations | — |
| `/login`, `/register` | Auth | — |
| `/shows/:showId/seats` | Seat map | login |
| `/shows/:showId/checkout?seats=` | Review + demo UPI payment (PhonePe / Google Pay / Paytm) | login |
| `/bookings/:ref` | Ticket | login |
| `/my-bookings` | Booking history + cancel | login |
| `/favorites` | Saved movies (watchlist) | login |
| `/admin/*` | Dashboard, movies, cinemas, shows, bookings | admin |

`ProtectedRoute` only hides pages; the **server** checks the token and role on every protected request.

## Security checklist

- Passwords hashed with bcrypt (cost 10) and never returned (`select: false` + `toJSON` transform)
- JWT signed with `JWT_SECRET` from `.env`, expires after 1 day; 401 responses log the user out on the client
- Role checks happen on the server (`adminOnly`)
- express-validator on every input; only whitelisted fields are copied into the database
- Rate limit on login and register (20 requests per 15 minutes per IP)
- helmet security headers; CORS limited to `CLIENT_URL`; JSON body limit of 100 kB
- Errors return safe messages; stack traces are only logged on the server
- Login failures use the same message for unknown emails and wrong passwords
