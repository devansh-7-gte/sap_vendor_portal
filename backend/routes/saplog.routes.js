const express = require('express');
const router = express.Router();
const saplogController = require('../controllers/saplog.controller');

router.get('/', saplogController.listSapLogs);

module.exports = router;
