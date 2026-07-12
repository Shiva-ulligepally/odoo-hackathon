/**
 * EcoSphere AI: Shared Enterprise TypeScript Interfaces
 * These types define the domain models and represent the single source of truth
 * for communication between Backend, Frontend, and AI Service contracts.
 */

export interface Organization {
  id: string;
  name: string;
  sector: OrganizationSector;
  country: string;
  establishedYear: number;
  esgScore: number; // Overall ESG Score (0-100)
  environmentalScore: number; // Environmental Subscore (0-100)
  socialScore: number; // Social Subscore (0-100)
  governanceScore: number; // Governance Subscore (0-100)
  lastAnalyzedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type OrganizationSector =
  | 'Energy'
  | 'Materials & Manufacturing'
  | 'Technology & Communications'
  | 'Financial Services'
  | 'Healthcare & Pharmaceuticals'
  | 'Consumer Goods & Retail'
  | 'Transportation & Logistics'
  | 'Utilities';

export interface ESGMetric {
  id: string;
  organizationId: string;
  category: ESGMetricCategory;
  name: string; // e.g., "Scope 1 GHG Emissions", "Water Withdrawal", "Board Diversity Ratio"
  value: number | string;
  unit: string; // e.g., "tCO2e", "m3", "%", "Count"
  year: number;
  sourceDocumentId: string | null; // Linked disclosure doc, if any
  status: MetricStatus;
  verifiedBy: string | null; // User ID or "AI Agent"
  createdAt: string;
  updatedAt: string;
}

export type ESGMetricCategory = 'environmental' | 'social' | 'governance';

export type MetricStatus = 'pending' | 'verified' | 'flagged';

export interface DataDisclosure {
  id: string;
  organizationId: string;
  fileName: string;
  fileUrl: string;
  fileType: string; // e.g., "application/pdf"
  fileSize: number; // in bytes
  reportingYear: number;
  status: DisclosureStatus;
  extractedMetricsCount: number;
  aiSummary: string | null;
  uploadedBy: string; // User ID
  createdAt: string;
}

export type DisclosureStatus = 'uploaded' | 'processing' | 'processed' | 'failed';

export interface AIAnalysis {
  id: string;
  organizationId: string;
  disclosureId: string | null;
  frameworks: ESGReportingFramework[];
  complianceScore: number; // Overall framework alignment (0-100)
  findings: AIFinding[];
  recommendations: AIRecommendation[];
  performedBy: string; // Agent designation/version
  createdAt: string;
}

export type ESGReportingFramework = 'GRI' | 'SASB' | 'TCFD' | 'CSRD';

export interface AIFinding {
  id: string;
  category: ESGMetricCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  metricReference: string | null; // e.g., "GHG Emissions"
  citation: string | null; // e.g., "Page 14, paragraph 2"
}

export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionableSteps: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string; // e.g., "METRIC_UPDATE", "DISCLOSURE_UPLOAD", "AI_ANALYSIS_RUN"
  details: string; // JSON payload description of changed properties
  ipAddress: string;
  createdAt: string;
}
