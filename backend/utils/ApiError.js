class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
  static notFound(msg = 'Not found')     { return new ApiError(404, msg); }
  static badRequest(msg)                 { return new ApiError(400, msg); }
  static unauthorized(msg = 'Unauthorized') { return new ApiError(401, msg); }
  static forbidden(msg = 'Forbidden')    { return new ApiError(403, msg); }
  static conflict(msg)                   { return new ApiError(409, msg); }
  static internal(msg = 'Internal Server Error') { return new ApiError(500, msg); }
}
module.exports = ApiError;
