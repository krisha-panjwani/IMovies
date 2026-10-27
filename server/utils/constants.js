// Shared lists used by models, validators, seed data and CineMood.

const GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Devotional',
  'Drama',
  'Family',
  'Fantasy',
  'Horror',
  'Musical',
  'Mystery',
  'Mythology',
  'Romance',
  'Sci-Fi',
  'Spy',
  'Sports',
  'Thriller',
];

// Tags describing how a movie feels. CineMood matches moods against these.
const MOOD_TAGS = [
  'funny',
  'lighthearted',
  'feel-good',
  'twisty',
  'mind-bending',
  'suspenseful',
  'emotional',
  'tearjerker',
  'heartfelt',
  'high-octane',
  'action-packed',
  'epic',
  'cozy',
  'comforting',
  'romantic',
  'inspiring',
  'dark',
  'family-friendly',
];

// CBFC (India) certificates, including the age-based UA categories.
const CERTIFICATES = ['U', 'UA7+', 'UA13+', 'UA16+', 'A'];

// IMovies currently serves one city. Cinemas store their city, so adding
// another city later is a data change, not a code change.
const DEFAULT_CITY = 'Indore';

// UPI apps offered at the DEMO checkout. No real payment is ever made.
const PAYMENT_METHODS = ['phonepe', 'gpay', 'paytm'];

// Seat tiers, cheapest first.
const TIERS = ['classic', 'prime', 'recliner'];

// All show times are Indian Standard Time.
const IST_OFFSET = '+05:30';

// Time reserved after each show for cleaning before the next one on the same screen.
const CLEANING_GAP_MINS = 15;

module.exports = {
  GENRES,
  MOOD_TAGS,
  CERTIFICATES,
  DEFAULT_CITY,
  PAYMENT_METHODS,
  TIERS,
  IST_OFFSET,
  CLEANING_GAP_MINS,
};
