const express = require('express');
const router = express.Router();
const UploadController = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Single file upload log endpoint matching POST /api/upload/document
router.post('/document', protect, upload.single('file'), UploadController.uploadDocument);

module.exports = router;
