const morgan = require('morgan');

// Custom morgan format to log method, url, status, response time, and content length
const requestLogger = morgan((tokens, req, res) => {
  return [
    `[REQUEST]`,
    tokens.method(req, res),
    tokens.url(req, res),
    `Status: ${tokens.status(req, res)}`,
    `Time: ${tokens['response-time'](req, res)}ms`,
    `Length: ${tokens.res(req, res, 'content-length') || 0} bytes`
  ].join(' - ');
});

module.exports = requestLogger;
