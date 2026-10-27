const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/auth');
const ctrl = require('../controllers/booking.controller');
const { MAX_SEATS_PER_BOOKING } = require('../services/booking.service');
const { PAYMENT_METHODS } = require('../utils/constants');

const router = express.Router();

// Every booking route needs a logged-in user.
router.use(protect);

router.post(
  '/',
  body('showId').isMongoId().withMessage('Invalid show'),
  body('seats')
    .isArray({ min: 1, max: MAX_SEATS_PER_BOOKING })
    .withMessage(`Select between 1 and ${MAX_SEATS_PER_BOOKING} seats`),
  body('seats.*').isString().trim().toUpperCase().matches(/^[A-Z]\d{1,2}$/).withMessage('Invalid seat code'),
  body('paymentMethod')
    .isIn(PAYMENT_METHODS)
    .withMessage('Choose a payment method: PhonePe, Google Pay or Paytm'),
  validate,
  ctrl.createBooking
);

router.get('/me', ctrl.myBookings);
router.get(
  '/ref/:ref',
  param('ref').matches(/^IMV-[A-Z0-9]{6}$/i).withMessage('Invalid booking reference'),
  validate,
  ctrl.getByRef
);
router.patch('/:id/cancel', param('id').isMongoId().withMessage('Invalid booking id'), validate, ctrl.cancelBooking);
router.get('/', adminOnly, ctrl.allBookings);

module.exports = router;
