const CarbonService = require('../services/carbon.service');
const { sendResponse } = require('../utils/response');
const CustomError = require('../utils/customError');

const getCarbonRecords = async (req, res, next) => {
  try {
    const { department, scope, activityType, startDate, endDate, page, limit } = req.query;
    const filters = { department, scope, activityType, startDate, endDate };
    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10
    };

    const result = await CarbonService.getCarbonRecords(req.user.organization, filters, options);
    return sendResponse(res, 200, true, 'Carbon footprint records retrieved', result.records, result.pagination);
  } catch (error) {
    next(error);
  }
};

const createCarbonRecord = async (req, res, next) => {
  try {
    if (!req.employee) {
      return next(new CustomError('Only registered employees can log carbon emissions', 403));
    }
    const record = await CarbonService.createCarbonRecord(req.user.organization, req.employee._id, req.user._id, req.body);
    return sendResponse(res, 201, true, 'Carbon record saved successfully', record);
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const data = await CarbonService.getEmissionsAnalytics(req.user.organization);
    return sendResponse(res, 200, true, 'Environmental analytics compiled', data);
  } catch (error) {
    next(error);
  }
};

const getCarbonMetrics = async (req, res, next) => {
  try {
    const data = await CarbonService.getCarbonMetrics(req.user.organization);
    return sendResponse(res, 200, true, 'Carbon metrics retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

const getHistoricalEmissions = async (req, res, next) => {
  try {
    const data = await CarbonService.getHistoricalEmissions(req.user.organization);
    return sendResponse(res, 200, true, 'Historical emissions trends retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

const getFacilitiesEmissions = async (req, res, next) => {
  try {
    const data = await CarbonService.getFacilitiesEmissions(req.user.organization);
    return sendResponse(res, 200, true, 'Facilities emissions retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

const getEnergyMixData = async (req, res, next) => {
  try {
    const data = await CarbonService.getEnergyMixData(req.user.organization);
    return sendResponse(res, 200, true, 'Energy mix retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCarbonRecords,
  createCarbonRecord,
  getAnalytics,
  getCarbonMetrics,
  getHistoricalEmissions,
  getFacilitiesEmissions,
  getEnergyMixData
};
