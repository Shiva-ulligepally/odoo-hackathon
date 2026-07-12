const CarbonRecordRepository = require('../repositories/CarbonRecordRepository');
const EmployeeRepository = require('../repositories/EmployeeRepository');
const PolicyRepository = require('../repositories/PolicyRepository');
const ReportRepository = require('../repositories/ReportRepository');
const ChallengeRepository = require('../repositories/ChallengeRepository');
const AIRecommendationRepository = require('../repositories/AIRecommendationRepository');

class DashboardService {
  async getDashboardSummary(organizationId) {
    // 1. Carbon statistics
    const carbonRecords = await CarbonRecordRepository.find({ organization: organizationId });
    const totalCarbonEmissions = carbonRecords.reduce((sum, r) => sum + r.value, 0);

    // 2. Organization head count
    const totalEmployees = await EmployeeRepository.count({ organization: organizationId, status: 'Active' });

    // 3. Document/compliance policies count
    const totalPolicies = await PolicyRepository.count({ organization: organizationId });

    // 4. Reports compiled count
    const totalReports = await ReportRepository.count({ organization: organizationId });

    // 5. Active challenge count
    const activeChallenges = await ChallengeRepository.count({ organization: organizationId, status: 'Active' });

    // 6. Latest AI Recommendations
    const latestRecommendations = await AIRecommendationRepository.find(
      { organization: organizationId },
      { sort: { createdAt: -1 }, limit: 3 }
    );

    // 7. Top saving department calculation (Mock logic mapping carbon logs)
    // Find department wise sum
    const deptTotals = {};
    carbonRecords.forEach(rec => {
      const deptId = rec.department.toString();
      deptTotals[deptId] = (deptTotals[deptId] || 0) + rec.value;
    });

    return {
      metrics: {
        totalCarbonEmissions,
        totalEmployees,
        totalPolicies,
        totalReports,
        activeChallenges
      },
      latestRecommendations,
      departmentEmissionsBreakdown: Object.keys(deptTotals).map(deptId => ({
        departmentId: deptId,
        emissions: deptTotals[deptId]
      }))
    };
  }
}

module.exports = new DashboardService();
