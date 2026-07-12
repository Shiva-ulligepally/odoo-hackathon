export const API_ROUTES = {
  DASHBOARD_OVERVIEW: '/dashboard/overview',
  DASHBOARD_INSIGHTS: '/dashboard/insights',
  CARBON_METRICS: '/carbon/metrics',
  CARBON_HISTORICAL: '/carbon/historical',
  REPORTS: '/reports',
  REPORTS_GENERATE: '/reports/generate',
};

export const ESG_THRESHOLDS = {
  EXCELLENT: 80,
  AVERAGE: 50,
};

export const CARBON_COEFFICIENTS = {
  SCOPE_1_TARGET: 4000,
  SCOPE_2_TARGET: 8000,
  SCOPE_3_TARGET: 23000,
};

export const NAVIGATION_ROUTES = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Carbon Accounting', href: '/carbon' },
  { name: 'Social & Human Capital', href: '/csr' },
  { name: 'Corporate Governance', href: '/governance' },
  { name: 'Gamification', href: '/gamification' },
  { name: 'Reports & Audits', href: '/reports' },
];
