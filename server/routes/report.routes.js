const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { validateCreateReport } = require('../validators/report.validator');

router.use(protect);

router.route('/')
  .get(ReportController.getReports)
  .post(authorize('Admin', 'Manager'), validate(validateCreateReport), ReportController.createReport);

router.post('/generate', authorize('Admin', 'Manager'), validate(validateCreateReport), ReportController.createReport);

module.exports = router;
