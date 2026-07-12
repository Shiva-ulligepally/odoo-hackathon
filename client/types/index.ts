export type ESGCategory = 'E' | 'S' | 'G';
export type InsightSeverity = 'low' | 'medium' | 'high' | 'critical';
export type InsightStatus = 'unresolved' | 'in_progress' | 'implemented';

export interface ESGScoreDetail {
  category: ESGCategory;
  score: number;
  grade: string;
  changeYoy: number;
  status: 'improving' | 'stable' | 'declining';
  keyDrivers: string[];
}

export interface ESGOverview {
  overallScore: number;
  overallGrade: string;
  percentile: number;
  yoyTrend: number;
  breakdown: {
    environmental: ESGScoreDetail;
    social: ESGScoreDetail;
    governance: ESGScoreDetail;
  };
  lastUpdated: string;
}

export interface EmissionsBreakdown {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

export interface CarbonEmissionsMetric {
  year: number;
  quarter?: string;
  breakdown: EmissionsBreakdown;
  targetEmissions: number;
  renewableEnergyPercentage: number;
  intensityPerRevenue: number;
}

export interface AIInsight {
  id: string;
  category: ESGCategory;
  title: string;
  description: string;
  recommendation: string;
  severity: InsightSeverity;
  status: InsightStatus;
  estimatedImpact: {
    value: number;
    unit: string;
  };
  createdAt: string;
}

export interface AuditTrailLog {
  id: string;
  timestamp: string;
  actor: {
    name: string;
    role: string;
  };
  action: string;
  targetCategory: ESGCategory;
  impactDetails: string;
  hash: string;
  status: 'verified' | 'pending';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ESGReport {
  id: string;
  title: string;
  type: 'sustainability' | 'carbon_disclosure' | 'gri_index' | 'governance_audit';
  year: number;
  status: 'draft' | 'under_review' | 'certified';
  certifiedBy?: string;
  downloadUrl: string;
  createdAt: string;
}
