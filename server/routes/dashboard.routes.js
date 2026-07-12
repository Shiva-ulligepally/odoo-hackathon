const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth');

router.get('/overview', protect, DashboardController.getDashboardOverview);
router.get('/insights', protect, DashboardController.getAIInsights);
router.patch('/insights/:id', protect, DashboardController.updateInsightStatus);

module.exports = router;
