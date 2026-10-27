const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { register, login, me } = require('../controllers/auth.controller');

const router = express.Router();

// Slows down password guessing: max 20 attempts per 15 minutes per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
  skip: () => process.env.NODE_ENV === 'test',
});

const emailRule = body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail({ gmail_remove_dots: false });

router.post(
  '/register',
  authLimiter,
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  emailRule,
  body('password')
    .isString()
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be 8-72 characters')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain a letter')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  emailRule,
  body('password').isString().notEmpty().withMessage('Password is required'),
  validate,
  login
);

router.get('/me', protect, me);

module.exports = router;
