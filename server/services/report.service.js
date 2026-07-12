const ReportRepository = require('../repositories/ReportRepository');
const ActivityLogRepository = require('../repositories/ActivityLogRepository');

class ReportService {
  async getReports(organizationId) {
    return await ReportRepository.find({ organization: organizationId }, { populate: ['generatedBy', 'document'] });
  }

  async createReport(organizationId, employeeId, userId, data) {
    const report = await ReportRepository.create({
      ...data,
      organization: organizationId,
      generatedBy: employeeId
    });

    await ActivityLogRepository.create({
      user: userId,
      organization: organizationId,
      action: 'Report Generated',
      details: `Generated compliance report: "${report.title}"`
    });

    return report;
  }
}

module.exports = new ReportService();
