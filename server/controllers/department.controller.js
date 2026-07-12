const DepartmentService = require('../services/department.service');
const { sendResponse } = require('../utils/response');

const getDepartments = async (req, res, next) => {
  try {
    const list = await DepartmentService.getDepartments(req.user.organization);
    return sendResponse(res, 200, true, 'Departments list retrieved', list);
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const dept = await DepartmentService.createDepartment(req.user.organization, req.user._id, req.body);
    return sendResponse(res, 201, true, 'Department created successfully', dept);
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const updated = await DepartmentService.updateDepartment(req.params.id, req.user.organization, req.user._id, req.body);
    return sendResponse(res, 200, true, 'Department updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const deleted = await DepartmentService.deleteDepartment(req.params.id, req.user.organization, req.user._id);
    return sendResponse(res, 200, true, 'Department deleted successfully', deleted);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
