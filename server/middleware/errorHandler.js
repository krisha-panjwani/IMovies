const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

// Any /api URL that matched no route.
function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Express 5 sends every thrown error (including from async handlers) here.
// We turn it into one consistent JSON shape: { message, errors? }.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message;
  let errors = err.details;

  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    message = errors[0].message;
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    message = field === 'email' ? 'An account with this email already exists' : `Duplicate ${field}`;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body is not valid JSON';
  }

  if (status >= 500) {
    console.error(err);
    // Never leak internal details (stack traces, DB messages) to users.
    message = 'Something went wrong on our side. Please try again.';
    errors = undefined;
  }

  res.status(status).json({ message, ...(errors ? { errors } : {}) });
}

module.exports = { notFound, errorHandler };
