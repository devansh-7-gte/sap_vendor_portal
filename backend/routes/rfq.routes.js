const router = require('express').Router();
const {
  getRFQs,
  getRFQById,
  createRFQ,
  cancelRFQ,
  reissueRFQ,
  submitBid,
  getEvaluationMatrix,
  awardBid
} = require('../controllers/rfq.controller');

const validate = require('../middleware/validate');
const {
  rfqCreateSchema,
  bidSchema,
  reissueRfqSchema
} = require('../validators/rfq.validator');

router.get('/', getRFQs);
router.post('/', validate(rfqCreateSchema), createRFQ);
router.get('/:id', getRFQById);
router.put('/:id/cancel', cancelRFQ);
router.put('/:id/reissue', validate(reissueRfqSchema), reissueRFQ);
router.post('/:id/bid', validate(bidSchema), submitBid);
router.get('/:id/evaluate', getEvaluationMatrix);
router.post('/:id/award', awardBid);

module.exports = router;
