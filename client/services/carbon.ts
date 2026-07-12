import api from '@/lib/axios';
import { CarbonEmissionsMetric, ApiResponse } from '@/types';
import mockCarbonData from '@/mock/carbon.json';

/**
 * Fetch active carbon accounting metrics for the current cycle.
 */
export async function getCarbonMetrics(): Promise<CarbonEmissionsMetric> {
  try {
    const response = await api.get<ApiResponse<CarbonEmissionsMetric>>('/carbon/metrics');
    return response.data.data;
  } catch (error) {
    console.warn('API error, falling back to mock carbon metrics:', error);
    return mockCarbonData.data.currentMetrics as unknown as CarbonEmissionsMetric;
  }
}

/**
 * Fetch historical scope-based emissions data for charting.
 */
export async function getHistoricalEmissions(): Promise<CarbonEmissionsMetric[]> {
  try {
    const response = await api.get<ApiResponse<CarbonEmissionsMetric[]>>('/carbon/historical');
    return response.data.data;
  } catch (error) {
    console.warn('API error, falling back to mock historical emissions:', error);
    return mockCarbonData.data.historicalEmissions as unknown as CarbonEmissionsMetric[];
  }
}
