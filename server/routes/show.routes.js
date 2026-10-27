const express = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/auth');
const ctrl = require('../controllers/show.controller');

const router = express.Router();

const idRule = param('id').isMongoId().withMessage('Invalid show id');
const priceRule = (tier) =>
  body(`prices.${tier}`).isFloat({ min: 0, max: 5000 }).withMessage(`${tier} price must be 0-5000`).toFloat();

router.get(
  '/',
  query('movie').optional().isMongoId().withMessage('Invalid movie id'),
  query('cinema').optional().isMongoId().withMessage('Invalid cinema id'),
  query('city').optional().isString().isLength({ max: 50 }),
  query('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must look like 2026-10-25'),
  validate,
  ctrl.listShows
);
router.get('/:id', idRule, validate, ctrl.getShow);

router.post(
  '/',
  protect,
  adminOnly,
  body('movie').isMongoId().withMessage('Choose a movie'),
  body('cinema').isMongoId().withMessage('Choose a cinema'),
  body('screenName').trim().notEmpty().withMessage('Choose a screen'),
  body('startTime').isISO8601().withMessage('Start time must be a valid date and time'),
  body('language').optional({ values: 'falsy' }).isString().trim().isLength({ max: 40 }),
  priceRule('classic'),
  priceRule('prime'),
  priceRule('recliner'),
  validate,
  ctrl.createShow
);
router.delete('/:id', protect, adminOnly, idRule, validate, ctrl.deleteShow);

module.exports = router;
