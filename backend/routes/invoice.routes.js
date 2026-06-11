const router = require('express').Router();
const { getInvoices, getInvoiceById, submitInvoice } = require('../controllers/invoice.controller');

router.get('/', getInvoices);
router.post('/', submitInvoice);
router.get('/:id', getInvoiceById);

module.exports = router;
