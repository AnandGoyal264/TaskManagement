const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fileController = require('../controllers/fileController');

const router = express.Router();

router.use(auth);

router.post('/upload', upload.array('files', 10), fileController.uploadFiles);
router.get('/task/:taskId', fileController.getFilesByTask);
router.get('/:id/url', fileController.getFileUrl);
router.get('/:id/download', fileController.downloadFile);
router.delete('/:id', fileController.deleteFile);

module.exports = router;
