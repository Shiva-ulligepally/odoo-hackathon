const DashboardService = require('../services/dashboard.service');
const { sendResponse } = require('../utils/response');

const getDashboard = async (req, res, next) => {
  try {
    const summary = await DashboardService.getDashboardSummary(req.user.organization);
    return sendResponse(res, 200, true, 'Dashboard summary retrieved successfully', summary);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard
};
