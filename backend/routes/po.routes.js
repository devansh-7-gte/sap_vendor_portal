const router = require('express').Router();
const {
  getPOs,
  getPOById,
  acknowledgePO,
  simulatePO,
  submitASN,
  getASNForPO
} = require('../controllers/po.controller');

router.get('/', getPOs);
router.post('/simulate', simulatePO);
router.get('/:id', getPOById);
router.put('/:id/acknowledge', acknowledgePO);
router.post('/:id/asn', submitASN);
router.get('/:id/asn', getASNForPO);

module.exports = router;
