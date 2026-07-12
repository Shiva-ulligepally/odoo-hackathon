const PolicyService = require('../services/policy.service');
const { sendResponse } = require('../utils/response');

const getPolicies = async (req, res, next) => {
  try {
    const list = await PolicyService.getPolicies(req.user.organization);
    return sendResponse(res, 200, true, 'Policies list retrieved', list);
  } catch (error) {
    next(error);
  }
};

const createPolicy = async (req, res, next) => {
  try {
    const policy = await PolicyService.createPolicy(req.user.organization, req.user._id, req.body);
    return sendResponse(res, 201, true, 'Policy created successfully', policy);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPolicies,
  createPolicy
};
