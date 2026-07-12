const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, DashboardController.getDashboard);

module.exports = router;
