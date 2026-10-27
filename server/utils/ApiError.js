// An error that carries an HTTP status code, so controllers can simply
// `throw new ApiError(404, 'Movie not found')` and the error handler
// turns it into a proper JSON response.
class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

module.exports = ApiError;
