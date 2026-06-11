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

router.get('/', getRFQs);
router.post('/', createRFQ);
router.get('/:id', getRFQById);
router.put('/:id/cancel', cancelRFQ);
router.put('/:id/reissue', reissueRFQ);
router.post('/:id/bid', submitBid);
router.get('/:id/evaluate', getEvaluationMatrix);
router.post('/:id/award', awardBid);

module.exports = router;
