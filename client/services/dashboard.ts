import api from '@/lib/axios';
import { ESGOverview, ApiResponse, AIInsight } from '@/types';
import mockDashboardData from '@/mock/dashboard.json';

/**
 * Fetch ESG dashboard overview ratings and breakdown.
 */
export async function getDashboardOverview(): Promise<ESGOverview> {
  try {
    const response = await api.get<ApiResponse<ESGOverview>>('/dashboard/overview');
    return response.data.data;
  } catch (error) {
    console.warn('API error, falling back to mock dashboard data:', error);
    return mockDashboardData.data as unknown as ESGOverview;
  }
}

/**
 * Fetch active ESG and Carbon reduction AI insights.
 */
export async function getAIInsights(): Promise<AIInsight[]> {
  try {
    const response = await api.get<ApiResponse<AIInsight[]>>('/dashboard/insights');
    return response.data.data;
  } catch (error) {
    console.warn('API error, falling back to mock AI insights:', error);
    return mockDashboardData.data.insights as unknown as AIInsight[];
  }
}

/**
 * Resolve or update the status of an AI recommendation.
 */
export async function updateInsightStatus(
  insightId: string,
  status: 'unresolved' | 'in_progress' | 'implemented'
): Promise<AIInsight> {
  const response = await api.patch<ApiResponse<AIInsight>>(`/dashboard/insights/${insightId}`, { status });
  return response.data.data;
}
