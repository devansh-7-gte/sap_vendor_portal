const router = require('express').Router();
const { getASNs } = require('../controllers/po.controller');

router.get('/', getASNs);

module.exports = router;
