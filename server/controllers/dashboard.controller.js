const DashboardService = require('../services/dashboard.service');
const { sendResponse } = require('../utils/response');

const getDashboardOverview = async (req, res, next) => {
  try {
    const overview = await DashboardService.getDashboardOverview(req.user.organization);
    return sendResponse(res, 200, true, 'Dashboard overview retrieved successfully', overview);
  } catch (error) {
    next(error);
  }
};

const getAIInsights = async (req, res, next) => {
  try {
    const insights = await DashboardService.getAIInsights(req.user.organization);
    return sendResponse(res, 200, true, 'AI Insights retrieved successfully', insights);
  } catch (error) {
    next(error);
  }
};

const updateInsightStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await DashboardService.updateInsightStatus(req.params.id, status);
    return sendResponse(res, 200, true, 'Insight status updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
  getAIInsights,
  updateInsightStatus
};
