const express = require('express');
const router = express.Router();
const PolicyController = require('../controllers/policy.controller');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { validateCreatePolicy } = require('../validators/policy.validator');

router.use(protect);

router.route('/')
  .get(PolicyController.getPolicies)
  .post(authorize('Admin'), validate(validateCreatePolicy), PolicyController.createPolicy);

module.exports = router;
