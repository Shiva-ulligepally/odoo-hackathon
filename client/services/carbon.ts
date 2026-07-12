import api from '@/lib/axios';
import { CarbonEmissionsMetric, ApiResponse, FacilityEmissionsRecord, SupplierEsgRecord } from '@/types';
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

/**
 * Fetch facility emissions and carbon efficiency ratings.
 */
export async function getFacilitiesEmissions(): Promise<FacilityEmissionsRecord[]> {
  try {
    const response = await api.get<ApiResponse<FacilityEmissionsRecord[]>>('/carbon/facilities');
    return response.data.data;
  } catch (error) {
    console.warn('API error, falling back to mock facilities emissions:', error);
    return mockCarbonData.data.facilities as unknown as FacilityEmissionsRecord[];
  }
}

/**
 * Fetch suppliers ESG ratings and compliance checklist.
 */
export async function getSupplierEsgRecords(): Promise<SupplierEsgRecord[]> {
  try {
    const response = await api.get<ApiResponse<SupplierEsgRecord[]>>('/social/suppliers');
    return response.data.data;
  } catch (error) {
    console.warn('API error, falling back to mock supplier ESG records:', error);
    return mockCarbonData.data.suppliers as unknown as SupplierEsgRecord[];
  }
}

/**
 * Fetch active power utility energy mix distribution.
 */
export async function getEnergyMixData(): Promise<{ name: string; value: number; color?: string }[]> {
  try {
    const response = await api.get<ApiResponse<{ name: string; value: number; color?: string }[]>>('/carbon/energymix');
    return response.data.data;
  } catch (error) {
    console.warn('API error, falling back to mock energy mix data:', error);
    return mockCarbonData.data.energyMix;
  }
}
