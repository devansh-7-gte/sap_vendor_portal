const router = require('express').Router();
const chatController = require('../controllers/chat.controller');

const validate = require('../middleware/validate');
const { chatMessageSchema } = require('../validators/chat.validator');

router.get('/', chatController.getMessages);
router.post('/', validate(chatMessageSchema), chatController.sendMessage);

module.exports = router;
