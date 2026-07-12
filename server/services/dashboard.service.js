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
const ActivityLogRepository = require('../repositories/ActivityLogRepository');

class DashboardService {
  async getDashboardSummary(organizationId) {
    const organization = await OrganizationRepository.findById(organizationId);
    const totalEmployees = await EmployeeRepository.count({ organization: organizationId, status: 'Active' });
    const recentEmployees = await EmployeeRepository.find(
      { organization: organizationId },
      { sort: { createdAt: -1 }, limit: 5, populate: 'department' }
    );

    const carbonRecords = await CarbonRecordRepository.find({ organization: organizationId });
    const totalCarbonEmissions = carbonRecords.reduce((sum, r) => sum + r.value, 0);
    const scopeBreakdown = { 'Scope 1': 0, 'Scope 2': 0, 'Scope 3': 0 };
    carbonRecords.forEach(r => {
      if (scopeBreakdown[r.scope] !== undefined) {
        scopeBreakdown[r.scope] += r.value;
      }
    });

    const energyBills = await EnergyBillRepository.find({ organization: organizationId });
    const totalEnergyCost = energyBills.reduce((sum, b) => sum + b.amount, 0);
    const totalEnergyConsumption = energyBills.reduce((sum, b) => sum + b.consumption, 0);

    const deptTotals = {};
    carbonRecords.forEach(rec => {
      const deptId = rec.department.toString();
      deptTotals[deptId] = (deptTotals[deptId] || 0) + rec.value;
    });

    const recentReports = await ReportRepository.find(
      { organization: organizationId },
      { sort: { createdAt: -1 }, limit: 5, populate: 'generatedBy' }
    );
    const recentPolicies = await PolicyRepository.find(
      { organization: organizationId },
      { sort: { createdAt: -1 }, limit: 5 }
    );

    const unreadNotificationsCount = await NotificationRepository.count({
      organization: organizationId,
      readStatus: false
    });
    const recentNotifications = await NotificationRepository.find(
      { organization: organizationId },
      { sort: { createdAt: -1 }, limit: 5 }
    );

    const latestRecommendations = await AIRecommendationRepository.find(
      { organization: organizationId },
      { sort: { createdAt: -1 }, limit: 3 }
    );

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

  async getDashboardOverview(organizationId) {
    const org = await OrganizationRepository.findById(organizationId);
    const carbonRecords = await CarbonRecordRepository.find({ organization: organizationId });
    const totalCarbon = carbonRecords.reduce((sum, r) => sum + r.value, 0);

    const recentConfidenceScores = await ConfidenceScoreRepository.find(
      { organization: organizationId },
      { sort: { lastCalculated: -1 }, limit: 5 }
    );
    const avgConfidenceScore = recentConfidenceScores.length > 0
      ? Math.round(recentConfidenceScores.reduce((sum, s) => sum + s.score, 0) / recentConfidenceScores.length)
      : 96;

    // Fetch activities from ActivityLog
    const logs = await ActivityLogRepository.find(
      { organization: organizationId },
      { sort: { timestamp: -1 }, limit: 5, populate: 'user' }
    );
    const recentActivities = logs.map(l => ({
      id: l._id.toString(),
      timestamp: l.timestamp.toISOString(),
      actor: l.user ? l.user.email : 'System Automation',
      action: l.action,
      category: 'E',
      details: l.details || ''
    }));

    // Fetch active challenges
    const challenges = await ChallengeRepository.find({ organization: organizationId });
    const esgChallenges = challenges.map(ch => ({
      id: ch._id.toString(),
      title: ch.title,
      description: ch.description,
      targetValue: ch.rewardPoints,
      currentValue: ch.status === 'Completed' ? ch.rewardPoints : ch.rewardPoints * 0.8,
      points: ch.rewardPoints,
      category: 'E',
      status: ch.status === 'Active' ? 'active' : 'completed'
    }));

    const recommendations = await AIRecommendationRepository.find({ organization: organizationId });
    const insights = recommendations.map(this.mapRecommendationToInsight);

    return {
      overallScore: 86,
      overallGrade: 'A-',
      percentile: 94.2,
      yoyTrend: 4.5,
      lastUpdated: new Date().toISOString(),
      breakdown: {
        environmental: {
          category: 'E',
          score: 82,
          grade: 'B+',
          changeYoy: 6.2,
          status: 'improving',
          keyDrivers: [
            `Total carbon emissions managed at ${totalCarbon} MT CO2e`,
            'Renewable electric grid conversion in progress',
            'Fleet fuel usage logs updated'
          ]
        },
        social: {
          category: 'S',
          score: 90,
          grade: 'A',
          changeYoy: 3.8,
          status: 'improving',
          keyDrivers: [
            'Staff training and certifications in progress',
            'Supplier compliance audit log integration active'
          ]
        },
        governance: {
          category: 'G',
          score: 87,
          grade: 'A-',
          changeYoy: 2.1,
          status: 'stable',
          keyDrivers: [
            'ESG policies successfully compiled and uploaded',
            'Security audit logging automated and operational'
          ]
        }
      },
      confidence: avgConfidenceScore,
      deadlines: [
        {
          id: 'dl-01',
          title: 'GRI Disclosure Submission',
          dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'G',
          priority: 'high',
          status: 'pending'
        },
        {
          id: 'dl-02',
          title: 'Scope 1 Annual Carbon Audit',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'E',
          priority: 'high',
          status: 'pending'
        }
      ],
      recentActivities,
      challenges: esgChallenges,
      insights
    };
  }

  async getAIInsights(organizationId) {
    const recommendations = await AIRecommendationRepository.find({ organization: organizationId });
    return recommendations.map(this.mapRecommendationToInsight);
  }

  async updateInsightStatus(insightId, status) {
    // Map status: 'unresolved' | 'in_progress' | 'implemented' -> 'New'/'Accepted'/'Implemented'/'Dismissed'
    let dbStatus = 'New';
    if (status === 'in_progress') dbStatus = 'Accepted';
    if (status === 'implemented') dbStatus = 'Implemented';

    const updated = await AIRecommendationRepository.update(insightId, { status: dbStatus });
    if (!updated) {
      throw new Error('Recommendation not found');
    }
    return this.mapRecommendationToInsight(updated);
  }

  mapRecommendationToInsight(rec) {
    let category = 'E';
    if (rec.recommendationType === 'Waste Optimization') category = 'S';
    if (rec.recommendationType === 'Compliance Risk') category = 'G';

    let severity = 'medium';
    if (rec.confidenceScore > 90) severity = 'high';
    if (rec.confidenceScore < 70) severity = 'low';

    let status = 'unresolved';
    if (rec.status === 'Accepted') status = 'in_progress';
    if (rec.status === 'Implemented') status = 'implemented';

    return {
      id: rec._id.toString(),
      category,
      title: rec.title,
      description: rec.description,
      recommendation: `Target savings: ${rec.potentialSavingsCo2e || 0} tCO2e, financial: $${rec.potentialFinancialSavings || 0}`,
      severity,
      status,
      estimatedImpact: {
        value: rec.potentialSavingsCo2e || 0,
        unit: 'tCO2e'
      },
      createdAt: rec.createdAt ? rec.createdAt.toISOString() : new Date().toISOString()
    };
  }
}

module.exports = new DashboardService();
