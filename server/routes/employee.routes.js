const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employee.controller');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { validateCreateEmployee } = require('../validators/employee.validator');

// Leaderboard does not require profile check, just standard auth protect
router.get('/leaderboard', protect, EmployeeController.getLeaderboard);

// Personal profile management
router.route('/profile')
  .get(protect, EmployeeController.getProfile)
  .post(protect, EmployeeController.updateProfile); // Using POST /api/profile as requested

// Corporate employee list management
router.route('/')
  .get(protect, EmployeeController.getEmployees)
  .post(protect, authorize('Admin'), validate(validateCreateEmployee), EmployeeController.createEmployee);

module.exports = router;
