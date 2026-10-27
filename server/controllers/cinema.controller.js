const Cinema = require('../models/Cinema');
const ApiError = require('../utils/ApiError');

const EDITABLE_FIELDS = ['name', 'brand', 'locality', 'city', 'state', 'address', 'amenities', 'sourceUrl', 'screens'];

const pickEditable = (body) =>
  Object.fromEntries(EDITABLE_FIELDS.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));

// GET /api/cinemas?city=Indore
async function listCinemas(req, res) {
  const filter = req.query.city ? { city: req.query.city } : {};
  const cinemas = await Cinema.find(filter).sort({ city: 1, name: 1 }).lean();
  res.json({ data: cinemas });
}

// GET /api/cinemas/cities - the cities that have at least one cinema.
async function listCities(_req, res) {
  const cities = await Cinema.aggregate([
    { $group: { _id: '$city', state: { $first: '$state' }, cinemas: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ data: cities.map((c) => ({ name: c._id, state: c.state, cinemas: c.cinemas })) });
}

// GET /api/cinemas/:id
async function getCinema(req, res) {
  const cinema = await Cinema.findById(req.params.id).lean();
  if (!cinema) throw new ApiError(404, 'Cinema not found');
  res.json({ data: cinema });
}

// POST /api/cinemas (admin)
async function createCinema(req, res) {
  const cinema = await Cinema.create(pickEditable(req.body));
  res.status(201).json({ data: cinema });
}

// PUT /api/cinemas/:id (admin). Existing shows keep their own copy of the
// seat layout, so editing screens here never affects tickets already sold.
async function updateCinema(req, res) {
  const cinema = await Cinema.findByIdAndUpdate(req.params.id, pickEditable(req.body), {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!cinema) throw new ApiError(404, 'Cinema not found');
  res.json({ data: cinema });
}

module.exports = { listCinemas, listCities, getCinema, createCinema, updateCinema };
