// Minimal express app for tests: same routes + error handling as server.js,
// without sockets, rate limiting, CORS, or the listening server.
const express = require('express');
const routes = require('../routes/index');
const { errorHandler } = require('../middleware/errorHandler');

const buildTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api', routes);
  app.use(errorHandler);
  return app;
};

module.exports = buildTestApp;
