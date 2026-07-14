const router = require('express').Router();
const {
  getPOs,
  getPOById,
  acknowledgePO,
  simulatePO,
  submitASN,
  getASNForPO
} = require('../controllers/po.controller');

const validate = require('../middleware/validate');
const { asnCreateSchema } = require('../validators/asn.validator');

router.get('/', getPOs);
router.post('/simulate', simulatePO);
router.get('/:id', getPOById);
router.put('/:id/acknowledge', acknowledgePO);
router.post('/:id/asn', validate(asnCreateSchema), submitASN);
router.get('/:id/asn', getASNForPO);

module.exports = router;
