const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // If error is not an instance of ApiError, default to 500 Internal Server Error
  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || 500;
    message = err.message || 'Internal Server Error';
  }

  res.locals.errorMessage = err.message;

  const response = {
    success: false,
    error: message,
    code: statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  if (process.env.NODE_ENV === 'development' || statusCode >= 500) {
    console.error(`[ERROR] [${req.method}] ${req.originalUrl} - Status: ${statusCode} - Message: ${message}`);
    if (err.stack) {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json(response);
};

module.exports = { errorHandler };
