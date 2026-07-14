const router = require('express').Router();
const reportsController = require('../controllers/reports.controller');

router.get('/statement', reportsController.generateStatement);
router.get('/invoice/:id', reportsController.generateInvoicePDF);
router.get('/metrics', reportsController.getPlatformMetrics);

module.exports = router;
