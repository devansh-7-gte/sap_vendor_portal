const router = require('express').Router();
const { getDashboardSummary } = require('../controllers/dashboard.controller');

router.get('/summary', getDashboardSummary);

module.exports = router;
