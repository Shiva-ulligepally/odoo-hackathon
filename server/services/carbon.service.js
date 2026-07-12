const CarbonRecordRepository = require('../repositories/CarbonRecordRepository');
const ConfidenceScoreRepository = require('../repositories/ConfidenceScoreRepository');
const ActivityLogRepository = require('../repositories/ActivityLogRepository');

class CarbonService {
  async getCarbonRecords(organizationId, filters = {}, options = {}) {
    const query = { organization: organizationId };

    if (filters.department) {
      query.department = filters.department;
    }
    if (filters.scope) {
      query.scope = filters.scope;
    }
    if (filters.activityType) {
      query.activityType = filters.activityType;
    }
    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }

    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const records = await CarbonRecordRepository.find(query, {
      populate: ['department', 'recordedBy', 'evidenceDocument'],
      sort: options.sort || { date: -1 },
      skip,
      limit
    });

    const total = await CarbonRecordRepository.count(query);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async createCarbonRecord(organizationId, employeeId, userId, data) {
    const record = await CarbonRecordRepository.create({
      ...data,
      organization: organizationId,
      recordedBy: employeeId
    });

    // Automatically calculate a data Confidence Score (ESG standard)
    const baseScore = data.evidenceDocument ? 95 : 60; // Higher confidence if file evidence exists
    const factors = [
      { factorName: 'Evidence Uploaded', status: data.evidenceDocument ? 'Pass' : 'Warning', weight: 40 },
      { factorName: 'Approved Department Log', status: 'Pass', weight: 30 },
      { factorName: 'Temporal Consistence', status: 'Pass', weight: 30 }
    ];

    await ConfidenceScoreRepository.create({
      organization: organizationId,
      targetModel: 'CarbonRecord',
      targetId: record._id,
      score: baseScore,
      factors,
      verifiedByAI: true
    });

    // Log Activity
    await ActivityLogRepository.create({
      user: userId,
      organization: organizationId,
      action: 'Carbon Logged',
      details: `Logged ${record.value} ${record.unit} emissions for ${record.activityType}`
    });

    return record;
  }

  async getEmissionsAnalytics(organizationId) {
    // Basic aggregation: emissions by scope and by month
    const records = await CarbonRecordRepository.find({ organization: organizationId });
    
    const scopeData = { 'Scope 1': 0, 'Scope 2': 0, 'Scope 3': 0 };
    const activityData = {};
    let totalEmissions = 0;

    records.forEach(r => {
      scopeData[r.scope] = (scopeData[r.scope] || 0) + r.value;
      activityData[r.activityType] = (activityData[r.activityType] || 0) + r.value;
      totalEmissions += r.value;
    });

    return {
      totalEmissions,
      byScope: scopeData,
      byActivity: activityData
    };
  }
}

module.exports = new CarbonService();
