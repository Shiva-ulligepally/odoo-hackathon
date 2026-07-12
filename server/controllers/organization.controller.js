const OrganizationService = require('../services/organization.service');
const { sendResponse } = require('../utils/response');

const getOrganization = async (req, res, next) => {
  try {
    const profile = await OrganizationService.getProfile(req.user.organization);
    return sendResponse(res, 200, true, 'Organization profile retrieved', profile);
  } catch (error) {
    next(error);
  }
};

const updateOrganization = async (req, res, next) => {
  try {
    const updated = await OrganizationService.updateProfile(req.user.organization, req.body);
    return sendResponse(res, 200, true, 'Organization profile updated', updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrganization,
  updateOrganization
};
