const express = require('express');
const router = express.Router();
const CarbonController = require('../controllers/carbon.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { validateCreateCarbon } = require('../validators/carbon.validator');

router.use(protect);

router.get('/analytics', CarbonController.getAnalytics);

router.route('/')
  .get(CarbonController.getCarbonRecords)
  .post(validate(validateCreateCarbon), CarbonController.createCarbonRecord);

module.exports = router;
