const EmployeeService = require('../services/employee.service');
const { sendResponse } = require('../utils/response');

const getEmployees = async (req, res, next) => {
  try {
    const { search, department, status, page, limit, sortBy, sortOrder } = req.query;
    
    const filters = { search, department, status };
    
    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort: {}
    };

    if (sortBy) {
      options.sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      options.sort['name'] = 1;
    }

    const result = await EmployeeService.getEmployees(req.user.organization, filters, options);
    return sendResponse(res, 200, true, 'Employees list retrieved', result.employees, result.pagination);
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const employee = await EmployeeService.createEmployee(req.user.organization, req.user._id, req.body);
    return sendResponse(res, 201, true, 'Employee created successfully', employee);
  } catch (error) {
    next(error);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const list = await EmployeeService.getLeaderboard(req.user.organization);
    return sendResponse(res, 200, true, 'Green points leaderboard retrieved', list);
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await EmployeeService.getProfile(req.user._id);
    return sendResponse(res, 200, true, 'Employee profile retrieved', profile);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updated = await EmployeeService.updateProfile(req.user._id, req.body);
    return sendResponse(res, 200, true, 'Employee profile updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  getLeaderboard,
  getProfile,
  updateProfile
};
