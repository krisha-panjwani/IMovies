const express = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/auth');
const ctrl = require('../controllers/movie.controller');
const { GENRES, MOOD_TAGS, CERTIFICATES } = require('../utils/constants');

const router = express.Router();

const idRule = param('id').isMongoId().withMessage('Invalid movie id');
const urlRule = (field) =>
  body(field)
    .optional()
    .trim()
    .custom((value) => value === '' || /^https?:\/\/\S+$/i.test(value))
    .withMessage(`${field} must be a http(s) URL`);

// The same rules serve "create" (all required) and "update" (all optional).
const movieRules = (isUpdate) => {
  const field = (name) => (isUpdate ? body(name).optional() : body(name));
  return [
    field('title').trim().isLength({ min: 1, max: 150 }).withMessage('Title is required (max 150 characters)'),
    body('tagline').optional().trim().isLength({ max: 160 }).withMessage('Tagline cannot exceed 160 characters'),
    field('synopsis').trim().isLength({ min: 20, max: 1500 }).withMessage('Synopsis must be 20-1500 characters'),
    field('genres').isArray({ min: 1 }).withMessage('Choose at least one genre'),
    body('genres.*').isIn(GENRES).withMessage('Unknown genre'),
    field('language').trim().notEmpty().withMessage('Language is required'),
    body('durationMins')
      .optional({ values: 'null' })
      .isInt({ min: 30, max: 300 })
      .withMessage('Duration must be 30-300 minutes')
      .toInt(),
    body('certificate')
      .optional({ values: 'falsy' })
      .isIn(CERTIFICATES)
      .withMessage(`Certificate must be one of ${CERTIFICATES.join(', ')}`),
    body('rating').optional({ values: 'null' }).isFloat({ min: 0, max: 10 }).withMessage('Rating must be 0-10').toFloat(),
    field('releaseDate').isISO8601().withMessage('Release date must be a valid date'),
    body('director').optional().isString().trim().isLength({ max: 100 }),
    body('cast').optional().isArray({ max: 20 }).withMessage('Cast must be a list'),
    body('cast.*').isString().trim().isLength({ min: 1, max: 80 }),
    body('sourceName').optional().isString().trim().isLength({ max: 60 }),
    urlRule('posterUrl'),
    urlRule('backdropUrl'),
    urlRule('trailerUrl'),
    urlRule('sourceUrl'),
    body('moodTags').optional().isArray().withMessage('Mood tags must be a list'),
    body('moodTags.*').isIn(MOOD_TAGS).withMessage('Unknown mood tag'),
  ];
};

router.get(
  '/',
  query('search').optional().isString().isLength({ max: 100 }),
  query('genre').optional().isIn(GENRES).withMessage('Unknown genre'),
  query('language').optional().isString().isLength({ max: 40 }),
  query('status').optional().isIn(['now', 'upcoming']),
  query('city').optional().isString().isLength({ max: 50 }),
  validate,
  ctrl.listMovies
);
router.get('/meta', ctrl.getMeta);
router.get('/:id', idRule, validate, ctrl.getMovie);

router.post('/', protect, adminOnly, movieRules(false), validate, ctrl.createMovie);
router.put('/:id', protect, adminOnly, idRule, movieRules(true), validate, ctrl.updateMovie);
router.delete('/:id', protect, adminOnly, idRule, validate, ctrl.deleteMovie);

module.exports = router;
