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
  deadlines?: EsgDeadline[];
  recentActivities?: RecentActivityLog[];
  challenges?: EsgChallenge[];
  insights?: AIInsight[];
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

// Extended Enterprise Types
export interface FacilityEmissionsRecord {
  id: string;
  name: string;
  location: string;
  efficiencyRating: 'A' | 'B' | 'C' | 'D' | 'E';
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  status: 'compliant' | 'warning' | 'non_compliant';
}

export interface SupplierEsgRecord {
  id: string;
  name: string;
  sector: string;
  country: string;
  esgScore: number;
  auditStatus: 'compliant' | 'under_review' | 'non_compliant';
  lastAuditDate: string;
}

export interface EsgDeadline {
  id: string;
  title: string;
  dueDate: string;
  category: ESGCategory;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
}

export interface EsgChallenge {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  points: number;
  category: ESGCategory;
  status: 'active' | 'completed';
}

export interface RecentActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  category: ESGCategory | 'SYS';
  details: string;
}
