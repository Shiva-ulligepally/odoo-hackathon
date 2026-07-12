const ReportService = require('../services/report.service');
const { sendResponse } = require('../utils/response');
const CustomError = require('../utils/customError');

const getReports = async (req, res, next) => {
  try {
    const list = await ReportService.getReports(req.user.organization);
    return sendResponse(res, 200, true, 'Compliance reports list retrieved', list);
  } catch (error) {
    next(error);
  }
};

const createReport = async (req, res, next) => {
  try {
    if (!req.employee) {
      return next(new CustomError('Only registered employee profiles can generate reports', 403));
    }
    const report = await ReportService.createReport(req.user.organization, req.employee._id, req.user._id, req.body);
    return sendResponse(res, 201, true, 'Report metadata stored successfully', report);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReports,
  createReport
};
