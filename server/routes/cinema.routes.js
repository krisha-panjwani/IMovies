const express = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/auth');
const ctrl = require('../controllers/cinema.controller');
const { TIERS } = require('../utils/constants');

const router = express.Router();

const idRule = param('id').isMongoId().withMessage('Invalid cinema id');

const cinemaRules = (isUpdate) => {
  const field = (name) => (isUpdate ? body(name).optional() : body(name));
  return [
    field('name').trim().isLength({ min: 2, max: 80 }).withMessage('Cinema name must be 2-80 characters'),
    field('city').trim().isLength({ min: 2, max: 50 }).withMessage('City is required'),
    field('address').trim().isLength({ min: 3, max: 200 }).withMessage('Address is required'),
    body('brand').optional().isString().trim().isLength({ max: 40 }),
    body('locality').optional().isString().trim().isLength({ max: 80 }),
    body('state').optional().isString().trim().isLength({ max: 60 }),
    body('amenities').optional().isArray({ max: 20 }),
    body('amenities.*').isString().trim().isLength({ max: 40 }),
    body('sourceUrl').optional().trim().custom((v) => v === '' || /^https?:\/\/\S+$/i.test(v)).withMessage('sourceUrl must be a URL'),
    field('screens').isArray({ min: 1, max: 12 }).withMessage('Add 1-12 screens'),
    body('screens.*.name').trim().notEmpty().withMessage('Every screen needs a name'),
    body('screens.*.rows').isArray({ min: 1, max: 26 }).withMessage('Every screen needs 1-26 rows'),
    body('screens.*.rows.*.label').trim().toUpperCase().matches(/^[A-Z]$/).withMessage('Row labels must be single letters'),
    body('screens.*.rows.*.seats').isInt({ min: 1, max: 30 }).withMessage('Rows can have 1-30 seats').toInt(),
    body('screens.*.rows.*.tier').isIn(TIERS).withMessage(`Tier must be one of ${TIERS.join(', ')}`),
  ];
};

router.get('/', query('city').optional().isString().isLength({ max: 50 }), validate, ctrl.listCinemas);
router.get('/cities', ctrl.listCities);
router.get('/:id', idRule, validate, ctrl.getCinema);
router.post('/', protect, adminOnly, cinemaRules(false), validate, ctrl.createCinema);
router.put('/:id', protect, adminOnly, idRule, cinemaRules(true), validate, ctrl.updateCinema);

module.exports = router;
