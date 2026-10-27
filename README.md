# IMovies - Movie ticket booking made simple

IMovies is a full-stack **MERN** web application (MongoDB, Express, React, Node.js) for booking movie tickets in **Indore, Madhya Pradesh**.

A user can find a movie, choose a cinema, date and showtime, pick seats on a seat map, pay with a UPI app (demo), and get a ticket with a QR code that can be downloaded as a PDF.

**Author:** Krisha Panjwani
**Course:** Full Stack Development (MERN) – Capstone Project

---

## Contents

1. [Project at a glance](#project-at-a-glance)
2. [Features](#features)
3. [How the app works](#how-the-app-works)
4. [Tech stack](#tech-stack)
5. [How to run the project](#how-to-run-the-project)
6. [Demo logins](#demo-logins)
7. [Project structure](#project-structure)
8. [Technical highlights](#technical-highlights)
9. [API endpoints](#api-endpoints)
10. [About the data](#about-the-data)
11. [Troubleshooting](#troubleshooting)
12. [Future improvements](#future-improvements)

---

## Project at a glance

| | |
|---|---|
| **Type** | Movie ticket booking website |
| **City** | Indore, Madhya Pradesh, India |
| **Users** | Customers (browse and book) and Admins (manage the system) |
| **Movies** | 8 now showing and 3 coming soon (real films) |
| **Cinemas** | 5 real Indore cinemas |
| **Special feature** | **CineMood**: discover movies by mood |
| **Database** | MongoDB Atlas (cloud) |

---

## Features

### For customers
- **Browse movies**: "Now showing in Indore" and "Coming soon", with posters, genres, language, runtime, certificate, cast and director.
- **Search and filter**: by movie name, genre, language and release status.
- **Cinemas page**: every Indore cinema with its area, address, amenities and showtimes.
- **Book in 3 steps**: choose a **cinema** → a **date** → a **showtime**.
- **Seat selection**: interactive seat map with **Classic, Prime and Recliner** seats, a screen indicator and a live price total (up to 10 seats).
- **UPI payment (demo)**: choose **PhonePe, Google Pay or Paytm** (simulated, no real money is charged).
- **Ticket**: booking reference, **QR code**, **Download ticket (PDF)** and **Print ticket**.
- **My bookings**: Upcoming, Past and Cancelled tabs; cancel up to **2 hours** before the show.
- **Favourites (watchlist)**: tap the ❤ on any movie to save it, and see all saved movies on the **My favourites** page.
- **CineMood**: pick a mood (Good Laugh, Mind-Blowing Plot Twist, Good Cry, Adrenaline Rush, Cozy Movie Night) and get matching movies, each with the reasons it matches.
- **Accounts**: sign up, log in and log out.

### For admins
- **Dashboard**: number of movies, cinemas, upcoming shows, tickets sold and revenue (demo).
- **Manage movies**: add, edit and remove movies.
- **Manage cinemas**: add cinemas with their screens and seat layouts.
- **Manage shows**: schedule shows; the system blocks two shows overlapping on the same screen.
- **All bookings**: search and filter every booking.

### General
- Dark, cinema-style design that works on **desktop, tablet and mobile**.
- Loading, empty and error messages on every page.

---

## How the app works

**Customer journey:**

```text
Home page → Choose a movie → Choose a cinema → Choose a date → Choose a showtime
   → Log in / Sign up → Select seats → Review and pay (UPI demo) → Ticket with QR code
```

**How the parts talk to each other:**

```text
 React website (port 5173)  ──requests──►  Express API (port 8000)  ──►  MongoDB Atlas
   pages, seat map, forms     ◄──JSON────    checks login, validates,      users, movies,
                                             books seats, CineMood         cinemas, shows,
                                                                           bookings
```

1. The **React** website shows the pages and sends requests to the backend using Axios.
2. The **Express** backend checks the user's login token (JWT), validates the data and applies the business rules.
3. **MongoDB** stores everything: users, movies, cinemas, shows and bookings.

---

## Tech stack

| Part | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router, Bootstrap 5, React-Bootstrap, Bootstrap Icons, Axios |
| **Backend** | Node.js, Express.js 5 |
| **Database** | MongoDB Atlas, Mongoose |
| **Security** | JWT (login tokens), bcrypt (password hashing), Helmet, CORS, express-validator, rate limiting |
| **Extras** | qrcode.react (QR codes), jsPDF (PDF tickets), react-hot-toast (notifications) |
| **Testing** | Node.js test runner, mongodb-memory-server |

---

## How to run the project

### Requirements
- **Node.js 20 or newer** – check with `node -v`
- **VS Code** (or any terminal)
- **Google Chrome** or another modern browser

### Step 1 – Open the project
Open the `IMovies` folder in VS Code, then open a terminal: **Terminal → New Terminal**.

### Step 2 – Install the packages (first time only)

```bash
cd server
npm install
cd ../client
npm install
cd ..
```

### Step 3 – Start the backend (Terminal 1)

Choose **one** of these options.

**Option A – Quick start (no database setup needed)**
Uses a temporary built-in database that already contains the sample movies, cinemas and shows. The data resets every time the server restarts.

```bash
cd server
npm run dev:demo
```

The first run downloads a small MongoDB engine, so it can take about a minute.

**Option B – With MongoDB Atlas (data is saved permanently)**

1. Copy `server/.env.example` and rename the copy to `server/.env`.
2. Open `server/.env` and fill in the settings (see the table below).
3. Load the sample data **once**, then start the server:

```bash
cd server
npm run seed
npm run dev
```

> ⚠️ `npm run seed` **deletes** all existing data (users, bookings, favourites and so on) and loads fresh sample data. Run it only the first time, or when you want to start again. The sample showtimes cover the **next 5 days** from when you run it.

**`server/.env` settings:**

| Setting | What to put |
|---|---|
| `PORT` | `8000` |
| `MONGODB_URI` | Your MongoDB Atlas connection string, ending in `.mongodb.net/imovies?...` |
| `JWT_SECRET` | Any long random text (used to sign login tokens) |
| `JWT_EXPIRES_IN` | `1d` (login lasts 1 day) |
| `CLIENT_URL` | `http://localhost:5173` |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_DEMO_EMAIL`, `SEED_DEMO_PASSWORD` | Logins created by `npm run seed` |

You'll know the backend is ready when the terminal shows:

```text
IMovies API running at http://localhost:8000/api
```

(In quick-start mode, the message reads `IMovies API (in-memory demo DB) running at http://localhost:8000/api`.)

### Step 4 – Start the website (Terminal 2)

Keep Terminal 1 running. Open a **second terminal** (click **+** in the VS Code terminal panel) and run:

```bash
cd client
npm run dev
```

### Step 5 – Open the website

Go to **http://localhost:5173** in your browser.

To stop the project, press **Ctrl + C** in both terminals.

### Run the automated tests (optional)

```bash
cd server
npm test
```

There are 19 tests covering login, search, seat booking, double-booking prevention, cancellation, favourites, admin access and CineMood.

---

## Demo logins

| Role | Email | Password |
|---|---|---|
| **Customer** | `demo@imovies.dev` | `Demo@12345` |
| **Admin** | `admin@imovies.dev` | `Admin@12345` |

You can also create a new customer account with **Sign up**. Admin accounts can only be created by the seed script, not through sign-up.

---

## Project structure

```text
IMovies/
├── client/                    React frontend (website)
│   ├── index.html
│   ├── vite.config.js         Dev server; forwards /api requests to the backend
│   └── src/
│       ├── App.jsx            All page routes
│       ├── pages/             Home, Movies, MovieDetails, Cinemas, CinemaDetails,
│       │                      SelectSeats, Checkout, Confirmation (ticket),
│       │                      MyBookings, Favorites, CineMood, Login, Register, admin/*
│       ├── components/        Navbar, Footer, MovieCard, Poster, SeatMap,
│       │                      DateStrip, ShowtimePills, ProtectedRoute, …
│       ├── api/               All calls to the backend (Axios)
│       ├── context/           AuthContext (who is logged in), FavoritesContext (saved movies)
│       ├── hooks/             useFetch – loading / error / data
│       ├── utils/             Formatting (₹, dates), city, payments, PDF ticket
│       └── styles/theme.css   Dark theme and design
│
├── server/                    Express backend (REST API)
│   ├── server.js              Starts the server
│   ├── app.js                 Middleware and routes
│   ├── config/db.js           MongoDB connection
│   ├── models/                User, Movie, Cinema, Show, Booking, Favorite (Mongoose schemas)
│   ├── routes/                API URLs and input validation
│   ├── controllers/           Handle each request
│   ├── middleware/            Login check (JWT), admin check, validation, errors
│   ├── services/              Booking logic and CineMood recommendation engine
│   ├── seed/                  Sample data and the seed script
│   ├── scripts/dev-memory.js  Quick-start mode with a temporary database
│   ├── tests/                 Automated tests
│   └── .env.example           Template for the settings file
│
├── docs/architecture.md       Detailed system design
└── README.md                  This file
```

---

## Technical highlights

- **No double booking:** a seat is reserved with one **atomic** MongoDB update. The update only succeeds if none of the chosen seats are already booked. If two people try to book the same seat at the same moment, only one succeeds; the other gets a clear "seat just booked" message. This is tested with 5 simultaneous requests.
- **Server-side pricing:** the server calculates the ticket price from the show's seat prices, so a user cannot change the price in the browser.
- **Secure login:** passwords are hashed with **bcrypt** and never stored as plain text. Logins use **JWT** tokens that expire after 1 day.
- **Role-based access:** admin pages and admin API routes are protected on the server, not just hidden in the website.
- **Input validation:** every request is checked with express-validator, and errors come back as clear messages.
- **Cancellation policy:** a booking can be cancelled up to 2 hours before the show; its seats become available again.
- **CineMood recommendation engine:** a rule-based scoring system (not AI). Each movie gets points for matching the mood's genres (+3 each for main genres, +1 for supporting ones), mood tags (+4) and story keywords (up to +2), plus +2 if it has a show in the next 7 days. The best matches are shown with the reasons.
- **No overlapping shows:** the admin cannot schedule two shows on the same screen at the same time.

---

## API endpoints

Base URL: `http://localhost:8000/api`

| Method | Endpoint | Access | What it does |
|---|---|---|---|
| POST | `/auth/register` | Public | Create an account |
| POST | `/auth/login` | Public | Log in and receive a JWT token |
| GET | `/auth/me` | Logged in | Get the current user |
| GET | `/movies` | Public | List movies (`search`, `genre`, `language`, `status` filters) |
| GET | `/movies/:id` | Public | One movie's details |
| GET | `/cinemas` | Public | List cinemas |
| GET | `/cinemas/:id` | Public | One cinema's details |
| GET | `/shows?movie=&cinema=&date=` | Public | List upcoming showtimes |
| GET | `/shows/:id` | Public | Seat layout, prices and booked seats of a show |
| POST | `/bookings` | Logged in | Book seats `{ showId, seats, paymentMethod }` |
| GET | `/bookings/me` | Logged in | My bookings |
| GET | `/bookings/ref/:ref` | Owner / Admin | One ticket by booking reference |
| PATCH | `/bookings/:id/cancel` | Owner | Cancel a booking |
| GET | `/favorites` | Logged in | My favourite movies |
| POST | `/favorites` | Logged in | Add a movie to favourites `{ movieId }` |
| DELETE | `/favorites/:movieId` | Logged in | Remove a movie from favourites |
| GET | `/cinemood/moods` | Public | List of moods |
| GET | `/cinemood/recommendations?mood=` | Public | Movie suggestions for a mood |
| POST / PUT / DELETE | `/movies`, `/movies/:id` | Admin | Add, edit and remove movies |
| POST / PUT | `/cinemas`, `/cinemas/:id` | Admin | Add and edit cinemas |
| POST / DELETE | `/shows`, `/shows/:id` | Admin | Schedule and delete shows |
| GET | `/bookings` | Admin | All bookings |

More details are in [docs/architecture.md](docs/architecture.md).

---

## About the data

**Real information** (collected from public sources in October 2026):
- **Movies now showing:** Drishyam: The Conclusion, Udta Teer, Prahaar: The Untold Story of Ujjwal Nikam, Nayyi Navelli, Clayface, Street Fighter, Jailer 2, Hanuman Ansh
- **Coming soon:** Ramayana: Part 1, Eetha, King
- **Cinemas in Indore:** PVR Treasure Island Mall (South Tukoganj), INOX C-21 Mall (Sheetal Nagar), INOX Nexus Indore Central (Regal Square), INOX Phoenix Pride of India (Phoenix Citadel Mall), Sapna Sangeeta Lumiere (Old Agrawal Nagar)
- Movie details and posters are from Wikipedia; cinema names and addresses are from District. Posters belong to their respective studios.

**Sample (demo) information:**
- **Showtimes, ticket prices, screens and seat layouts** are created by the app. IMovies is a student project and is **not connected** to any real cinema's booking system.
- **UPI payment is simulated**: no payment app is contacted and no money is charged.
- The QR code on the ticket contains the booking details but is **not valid for entry** at a real cinema.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Website shows **"Request failed with status code 502"** or login does not work | The backend is not running. Start it in Terminal 1 (`npm run dev` or `npm run dev:demo` in the `server` folder). |
| Backend says **"MongoDB connection failed … IP that isn't whitelisted"** | In MongoDB Atlas, go to **Network Access → Add IP Address** and add your current IP, or `0.0.0.0/0` to allow access from anywhere. |
| Backend says **"MONGODB_URI … still contains a placeholder"** | Put your real Atlas connection string in `server/.env` and save the file, or use `npm run dev:demo`. |
| Backend error **"EADDRINUSE … 8000"**, or the website opens on **5174** instead of 5173 | The project is already running in another terminal. Press **Ctrl + C** there (or close that terminal), then start it again. |
| **No showtimes** appear | The sample showtimes cover 5 days from the last `npm run seed`. Run `npm run seed` again (this resets the data). |
| `http://localhost:8000/api` shows only JSON | That is the backend. The website is at **http://localhost:5173**. |

---

## Future improvements

- Real payment gateway (for example Razorpay in test mode)
- More cities besides Indore
- Seat hold timer while the user is paying
- Email tickets and show reminders
- Movie reviews and ratings
- Online deployment (for example Vercel for the website and Render for the API)
