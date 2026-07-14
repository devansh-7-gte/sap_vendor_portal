const router = require('express').Router();
const { getInvoices, getInvoiceById, submitInvoice } = require('../controllers/invoice.controller');

const validate = require('../middleware/validate');
const { invoiceCreateSchema } = require('../validators/invoice.validator');

router.get('/', getInvoices);
router.post('/', validate(invoiceCreateSchema), submitInvoice);
router.get('/:id', getInvoiceById);

module.exports = router;
