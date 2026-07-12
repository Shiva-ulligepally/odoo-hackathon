const CarbonRecordRepository = require('../repositories/CarbonRecordRepository');
const EmployeeRepository = require('../repositories/EmployeeRepository');
const PolicyRepository = require('../repositories/PolicyRepository');
const ReportRepository = require('../repositories/ReportRepository');
const ChallengeRepository = require('../repositories/ChallengeRepository');
const AIRecommendationRepository = require('../repositories/AIRecommendationRepository');
const OrganizationRepository = require('../repositories/OrganizationRepository');
const EnergyBillRepository = require('../repositories/EnergyBillRepository');
const NotificationRepository = require('../repositories/NotificationRepository');
const ConfidenceScoreRepository = require('../repositories/ConfidenceScoreRepository');

class DashboardService {
  async getDashboardSummary(organizationId) {
    // 1. Organization Metadata
    const organization = await OrganizationRepository.findById(organizationId);

    // 2. Headcount & Employees Summary
    const totalEmployees = await EmployeeRepository.count({ organization: organizationId, status: 'Active' });
    const recentEmployees = await EmployeeRepository.find(
      { organization: organizationId },
      { sort: { createdAt: -1 }, limit: 5, populate: 'department' }
    );

    // 3. Carbon Statistics (Total & Scope Breakdown)
    const carbonRecords = await CarbonRecordRepository.find({ organization: organizationId });
    const totalCarbonEmissions = carbonRecords.reduce((sum, r) => sum + r.value, 0);
    const scopeBreakdown = { 'Scope 1': 0, 'Scope 2': 0, 'Scope 3': 0 };
    carbonRecords.forEach(r => {
      if (scopeBreakdown[r.scope] !== undefined) {
        scopeBreakdown[r.scope] += r.value;
      }
    });

    // 4. Energy Consumption Stats
    const energyBills = await EnergyBillRepository.find({ organization: organizationId });
    const totalEnergyCost = energyBills.reduce((sum, b) => sum + b.amount, 0);
    const totalEnergyConsumption = energyBills.reduce((sum, b) => sum + b.consumption, 0);

    // 5. Department Summary
    const deptTotals = {};
    carbonRecords.forEach(rec => {
      const deptId = rec.department.toString();
      deptTotals[deptId] = (deptTotals[deptId] || 0) + rec.value;
    });

    // 6. Recent Reports & ESG Policies
    const recentReports = await ReportRepository.find(
      { organization: organizationId },
      { sort: { createdAt: -1 }, limit: 5, populate: 'generatedBy' }
    );
    const recentPolicies = await PolicyRepository.find(
      { organization: organizationId },
      { sort: { createdAt: -1 }, limit: 5 }
    );

    // 7. Notifications Log (Unread Count & Recent logs)
    const unreadNotificationsCount = await NotificationRepository.count({
      organization: organizationId,
      readStatus: false
    });
    const recentNotifications = await NotificationRepository.find(
      { organization: organizationId },
      { sort: { createdAt: -1 }, limit: 5 }
    );

    // 8. AI Recommendations
    const latestRecommendations = await AIRecommendationRepository.find(
      { organization: organizationId },
      { sort: { createdAt: -1 }, limit: 3 }
    );

    // 9. Confidence Score
    const recentConfidenceScores = await ConfidenceScoreRepository.find(
      { organization: organizationId },
      { sort: { lastCalculated: -1 }, limit: 5 }
    );
    const avgConfidenceScore = recentConfidenceScores.length > 0
      ? Math.round(recentConfidenceScores.reduce((sum, s) => sum + s.score, 0) / recentConfidenceScores.length)
      : 100;

    return {
      organization,
      employees: {
        totalActive: totalEmployees,
        recent: recentEmployees
      },
      carbonStatistics: {
        total: totalCarbonEmissions,
        scopeBreakdown
      },
      energyConsumption: {
        totalCost: totalEnergyCost,
        totalConsumption: totalEnergyConsumption,
        bills: energyBills
      },
      departmentSummary: Object.keys(deptTotals).map(deptId => ({
        departmentId: deptId,
        emissions: deptTotals[deptId]
      })),
      recentReports,
      recentPolicies,
      notifications: {
        unreadCount: unreadNotificationsCount,
        recent: recentNotifications
      },
      aiRecommendations: latestRecommendations,
      confidenceScore: {
        average: avgConfidenceScore,
        recent: recentConfidenceScores
      }
    };
  }
}

module.exports = new DashboardService();
