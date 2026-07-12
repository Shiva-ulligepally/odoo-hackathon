'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartCard from '@/components/charts/ChartCard';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import { getCarbonMetrics, getHistoricalEmissions } from '@/services/carbon';
import { formatCO2e } from '@/utils/format';

export default function CarbonPage() {
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['carbonMetrics'],
    queryFn: getCarbonMetrics,
  });

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['carbonHistory'],
    queryFn: getHistoricalEmissions,
  });

  // Calculate scope emissions
  const totalEmissions = metrics?.breakdown.total ?? 0;
  const scope1 = metrics?.breakdown.scope1 ?? 0;
  const scope2 = metrics?.breakdown.scope2 ?? 0;
  const scope3 = metrics?.breakdown.scope3 ?? 0;

  // Prepare line chart historical data
  const years = history?.map((h) => h.year) ?? [];
  const scope1Data = history?.map((h) => h.breakdown.scope1) ?? [];
  const scope2Data = history?.map((h) => h.breakdown.scope2) ?? [];
  const scope3Data = history?.map((h) => h.breakdown.scope3) ?? [];
  const totalData = history?.map((h) => h.breakdown.total) ?? [];
  const targetData = history?.map((h) => h.targetEmissions) ?? [];
  const renewableData = history?.map((h) => h.renewableEnergyPercentage) ?? [];

  return (
    <AppLayout>
      <div className="space-y-8 py-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Carbon Accounting</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time Scope 1, 2, and 3 carbon accounting ledger.</p>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Emissions"
            value={formatCO2e(totalEmissions, false)}
            unit="tCO2e"
            category="E"
            loading={isMetricsLoading}
            lowerIsBetter={true}
          />
          <MetricCard
            title="Scope 1 (Direct)"
            value={formatCO2e(scope1, false)}
            unit="tCO2e"
            category="E"
            loading={isMetricsLoading}
            lowerIsBetter={true}
          />
          <MetricCard
            title="Scope 2 (Indirect)"
            value={formatCO2e(scope2, false)}
            unit="tCO2e"
            category="E"
            loading={isMetricsLoading}
            lowerIsBetter={true}
          />
          <MetricCard
            title="Scope 3 (Supply Chain)"
            value={formatCO2e(scope3, false)}
            unit="tCO2e"
            category="E"
            loading={isMetricsLoading}
            lowerIsBetter={true}
          />
        </div>

        {/* Chart Rows */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Emissions Trajectory vs Target"
            subtitle="Historical tCO2e output mapped against compliance carbon caps."
            loading={isHistoryLoading}
          >
            <LineChart
              xData={years.map(String)}
              series={[
                { name: 'Total Emissions', data: totalData, color: '#10b981', areaStyle: true },
                { name: 'Target Target', data: targetData, color: '#f43f5e' },
              ]}
            />
          </ChartCard>

          <ChartCard
            title="Scope Emissions Breakdown"
            subtitle="Historical trend across Scope 1, Scope 2, and Scope 3."
            loading={isHistoryLoading}
          >
            <LineChart
              xData={years.map(String)}
              series={[
                { name: 'Scope 1', data: scope1Data, color: '#34d399' },
                { name: 'Scope 2', data: scope2Data, color: '#60a5fa' },
                { name: 'Scope 3', data: scope3Data, color: '#a78bfa' },
              ]}
            />
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Renewable Energy Share"
            subtitle="Percentage of power sourced from renewable PPAs."
            loading={isHistoryLoading}
          >
            <BarChart
              xData={years.map(String)}
              series={[
                { name: 'Renewable energy (%)', data: renewableData, color: '#10b981' },
              ]}
              yAxisName="%"
            />
          </ChartCard>

          <ChartCard
            title="Carbon Intensity per Revenue"
            subtitle="tCO2e emitted per million USD of business revenue."
            loading={isHistoryLoading}
          >
            <BarChart
              xData={years.map(String)}
              series={[
                {
                  name: 'Intensity Index',
                  data: history?.map((h) => h.intensityPerRevenue) ?? [],
                  color: '#6366f1',
                },
              ]}
              yAxisName="Index"
            />
          </ChartCard>
        </div>
      </div>
    </AppLayout>
  );
}
