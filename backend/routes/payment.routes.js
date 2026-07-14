const router = require('express').Router();
const { getPayments } = require('../controllers/payment.controller');

router.get('/', getPayments);

module.exports = router;
