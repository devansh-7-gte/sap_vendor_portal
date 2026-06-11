const router = require('express').Router();
const ApiError = require('../utils/ApiError');

router.get('/health', (req, res) => {
  res.json({
    status: "healthy",
    db: "connected",
    timestamp: new Date().toISOString()
  });
});

router.get('/test-error', (req, res, next) => {
  next(ApiError.badRequest('This is a test error to verify errorHandler'));
});

router.use('/vendors', require('./vendor.routes'));
router.use('/rfqs', require('./rfq.routes'));
router.use('/pos', require('./po.routes'));
router.use('/grns', require('./grn.routes'));
router.use('/invoices', require('./invoice.routes'));
router.use('/payments', require('./payment.routes'));

module.exports = router;
