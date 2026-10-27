const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { signToken } = require('../middleware/auth');

// POST /api/auth/register - public sign-up always creates a normal "user".
// Admin accounts are only created by the seed script.
async function register(req, res) {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password, role: 'user' });
  res.status(201).json({ data: { token: signToken(user), user } });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  // Same message for "no such email" and "wrong password", so attackers
  // cannot discover which emails are registered.
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.json({ data: { token: signToken(user), user } });
}

// GET /api/auth/me - used by the frontend to restore a session on refresh.
async function me(req, res) {
  res.json({ data: { user: req.user } });
}

module.exports = { register, login, me };
