const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

// Requires a valid "Authorization: Bearer <token>" header.
// On success, the logged-in user is available as req.user.
async function protect(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Please log in to continue');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Your session has expired. Please log in again');
  }

  // Load the user fresh from the database, so a deleted user or a changed
  // role takes effect immediately.
  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, 'Your account no longer exists');

  req.user = user;
  next();
}

// Use after `protect`. Blocks everyone except admins.
function adminOnly(req, _res, next) {
  if (req.user?.role !== 'admin') {
    throw new ApiError(403, 'Only admins can do this');
  }
  next();
}

function signToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

module.exports = { protect, adminOnly, signToken };
