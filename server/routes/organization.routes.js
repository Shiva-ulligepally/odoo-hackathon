const express = require('express');
const router = express.Router();
const OrganizationController = require('../controllers/organization.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, OrganizationController.getOrganization);
router.put('/', protect, authorize('Admin'), OrganizationController.updateOrganization);

module.exports = router;
