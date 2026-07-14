const router = require('express').Router();
const { getGRNs, getGRNById } = require('../controllers/grn.controller');

router.get('/', getGRNs);
router.get('/:id', getGRNById);

module.exports = router;
