const crypto = require('crypto');
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  // Attach requestId for tracking correlation
  req.requestId = crypto.randomUUID();
  const startTime = process.hrtime();

  // Log incoming request
  logger.info(`Incoming request`, {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress
  });

  // Track response completion
  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const responseTimeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    const statusCode = res.statusCode;
    const contentLength = res.get('content-length') || 0;

    const logData = {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode,
      responseTimeMs: Number(responseTimeMs),
      contentLength: Number(contentLength),
      ip: req.ip || req.connection.remoteAddress
    };

    // Log request body on warnings/errors for inspection (Sanitizer handles redact)
    if (statusCode >= 400 && req.body && Object.keys(req.body).length > 0) {
      logData.body = req.body;
    }

    if (statusCode >= 500) {
      logger.error(`Request failed with server error ${statusCode}`, logData);
    } else if (statusCode >= 400) {
      logger.warn(`Request warning ${statusCode}`, logData);
    } else {
      logger.info(`Request completed`, logData);
    }
  });

  next();
};

module.exports = requestLogger;
