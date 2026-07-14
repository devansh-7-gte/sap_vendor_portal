const router = require('express').Router();
const uploadController = require('../controllers/upload.controller');
const upload = require('../middleware/upload');

router.post('/', upload.single('file'), uploadController.uploadFile);
router.get('/', uploadController.listDocuments);
router.get('/:id', uploadController.downloadFile);
router.delete('/:id', uploadController.deleteDocument);

module.exports = router;
