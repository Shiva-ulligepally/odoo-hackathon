const express = require('express');
const router = express.Router();
const AIController = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth');

// Mount routes matching Step 16
router.post('/validate', protect, AIController.validate);
router.post('/confidence', protect, AIController.confidence);
router.post('/predict', protect, AIController.predict);
router.post('/recommend', protect, AIController.recommend);
router.post('/governance', protect, AIController.governance);
router.post('/csr', protect, AIController.csr);
router.post('/chat', protect, AIController.chat);
router.get('/status', protect, AIController.status);

module.exports = router;
