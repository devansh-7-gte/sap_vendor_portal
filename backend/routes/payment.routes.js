const router = require('express').Router();
const {
  getPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus
} = require('../controllers/payment.controller');

router.get('/', getPayments);
router.post('/', createPayment);
router.get('/:id', getPaymentById);
router.put('/:id/status', updatePaymentStatus);

module.exports = router;
