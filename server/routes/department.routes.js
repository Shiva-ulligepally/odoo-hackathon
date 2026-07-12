const express = require('express');
const router = express.Router();
const DepartmentController = require('../controllers/department.controller');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { validateCreateDepartment, validateUpdateDepartment } = require('../validators/department.validator');

router.use(protect);

router.route('/')
  .get(DepartmentController.getDepartments)
  .post(authorize('Admin'), validate(validateCreateDepartment), DepartmentController.createDepartment);

router.route('/:id')
  .put(authorize('Admin', 'Manager'), validate(validateUpdateDepartment), DepartmentController.updateDepartment)
  .delete(authorize('Admin'), DepartmentController.deleteDepartment);

module.exports = router;
