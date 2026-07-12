import api from '@/lib/axios';
import { ESGReport, ApiResponse } from '@/types';

const mockReports: ESGReport[] = [
  {
    id: 'rep-01',
    title: '2025 Annual Sustainability Report',
    type: 'sustainability',
    year: 2025,
    status: 'certified',
    certifiedBy: 'GRI Certified Auditors',
    downloadUrl: '#',
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'rep-02',
    title: 'Scope 1 & 2 Carbon Audit Q1 2026',
    type: 'carbon_disclosure',
    year: 2026,
    status: 'certified',
    certifiedBy: 'EcoVerify LLC',
    downloadUrl: '#',
    createdAt: '2026-04-10T11:30:00Z',
  },
  {
    id: 'rep-03',
    title: 'Governance & Ethics Compliance Check',
    type: 'governance_audit',
    year: 2026,
    status: 'under_review',
    downloadUrl: '#',
    createdAt: '2026-06-30T15:45:00Z',
  },
];

/**
 * Fetch all available ESG and compliance reports.
 */
export async function getReports(): Promise<ESGReport[]> {
  try {
    const response = await api.get<ApiResponse<ESGReport[]>>('/reports');
    return response.data.data;
  } catch (error) {
    console.warn('API error, falling back to mock reports list:', error);
    return mockReports;
  }
}

/**
 * Trigger the autonomous generation of a new ESG report.
 */
export async function generateReport(
  title: string,
  type: ESGReport['type'],
  year: number
): Promise<ESGReport> {
  try {
    const response = await api.post<ApiResponse<ESGReport>>('/reports/generate', {
      title,
      type,
      year,
    });
    return response.data.data;
  } catch (error) {
    console.warn('API error, falling back to returning a mock generated report:', error);
    const newReport: ESGReport = {
      id: `rep-${Math.random().toString(36).substr(2, 9)}`,
      title,
      type,
      year,
      status: 'draft',
      downloadUrl: '#',
      createdAt: new Date().toISOString(),
    };
    return newReport;
  }
}
