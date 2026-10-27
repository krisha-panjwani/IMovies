const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Runs after express-validator rules. If any rule failed, stop here with a
// 400 response listing each problem: [{ field, message }].
function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
  throw new ApiError(400, errors[0].message, errors);
}

module.exports = validate;
