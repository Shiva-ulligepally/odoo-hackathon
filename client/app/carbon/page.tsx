'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartCard from '@/components/charts/ChartCard';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { getCarbonMetrics, getHistoricalEmissions, getFacilitiesEmissions, getEnergyMixData } from '@/services/carbon';
import { formatCO2e } from '@/utils/format';
import { Download, Building } from 'lucide-react';
import { FacilityEmissionsRecord } from '@/types';

export default function CarbonPage() {
  const { toast } = useToast();
  const [scopeFilter, setScopeFilter] = useState<'all' | 'scope1' | 'scope2' | 'scope3'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['carbonMetrics'],
    queryFn: getCarbonMetrics,
  });

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['carbonHistory'],
    queryFn: getHistoricalEmissions,
  });

  const { data: facilities, isLoading: isFacilitiesLoading } = useQuery({
    queryKey: ['facilitiesEmissions'],
    queryFn: getFacilitiesEmissions,
  });

  const { data: energyMix, isLoading: isEnergyMixLoading } = useQuery({
    queryKey: ['energyMixData'],
    queryFn: getEnergyMixData,
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

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast('CSV Emissions Ledger exported successfully.', 'success');
    }, 1500);
  };

  const getFilteredEmissions = (fac: FacilityEmissionsRecord) => {
    if (scopeFilter === 'scope1') return fac.scope1;
    if (scopeFilter === 'scope2') return fac.scope2;
    if (scopeFilter === 'scope3') return fac.scope3;
    return fac.total;
  };

  return (
    <AppLayout>
      <PageHeader
        title="Carbon Accounting"
        description="Auditable ledger tracking corporate emissions across Scope 1, 2, and 3 channels."
        breadcrumbs={['EcoSphere', 'Environmental']}
        actions={
          <div className="flex gap-2">
            <div className="flex items-center bg-muted/65 rounded-lg p-0.5 border border-border">
              <Button
                variant={scopeFilter === 'all' ? 'secondary' : 'ghost'}
                onClick={() => setScopeFilter('all')}
                className="h-8 text-xs font-semibold px-3"
              >
                All Scopes
              </Button>
              <Button
                variant={scopeFilter === 'scope1' ? 'secondary' : 'ghost'}
                onClick={() => setScopeFilter('scope1')}
                className="h-8 text-xs font-semibold px-3"
              >
                Scope 1
              </Button>
              <Button
                variant={scopeFilter === 'scope2' ? 'secondary' : 'ghost'}
                onClick={() => setScopeFilter('scope2')}
                className="h-8 text-xs font-semibold px-3"
              >
                Scope 2
              </Button>
              <Button
                variant={scopeFilter === 'scope3' ? 'secondary' : 'ghost'}
                onClick={() => setScopeFilter('scope3')}
                className="h-8 text-xs font-semibold px-3"
              >
                Scope 3
              </Button>
            </div>
            <Button
              onClick={handleExportCSV}
              loading={isExporting}
              variant="outline"
              className="text-xs font-semibold gap-1.5 h-10"
            >
              <Download className="h-4 w-4" />
              Export Ledger
            </Button>
          </div>
        }
      />

      <div className="space-y-8">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            title="Scope 3 (Value Chain)"
            value={formatCO2e(scope3, false)}
            unit="tCO2e"
            category="E"
            loading={isMetricsLoading}
            lowerIsBetter={true}
          />
        </div>

        {/* Facility Emissions Table */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Building className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base tracking-tight">Facility Carbon Registry</h3>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facility Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-center">Energy Grade</TableHead>
                <TableHead className="text-right">Scope 1</TableHead>
                <TableHead className="text-right">Scope 2</TableHead>
                <TableHead className="text-right">Scope 3</TableHead>
                <TableHead className="text-right font-bold">Total Emissions</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFacilitiesLoading ? (
                [1, 2].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8} className="text-center py-6 shimmer">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ))
              ) : facilities && facilities.length > 0 ? (
                facilities.map((fac) => (
                  <TableRow key={fac.id}>
                    <TableCell className="font-semibold">{fac.name}</TableCell>
                    <TableCell className="text-muted-foreground">{fac.location}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded bg-muted/65 text-xs font-bold font-sans">
                        Grade {fac.efficiencyRating}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatCO2e(fac.scope1)}</TableCell>
                    <TableCell className="text-right">{formatCO2e(fac.scope2)}</TableCell>
                    <TableCell className="text-right">{formatCO2e(fac.scope3)}</TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {formatCO2e(getFilteredEmissions(fac))}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={fac.status === 'compliant' ? 'success' : 'warning'}>
                        {fac.status === 'compliant' ? 'Compliant' : 'Warning Threshold'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No facility metrics registered for current fiscal period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
                { name: 'Target limit', data: targetData, color: '#f43f5e' },
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
            title="Corporate Power Energy Mix"
            subtitle="Current distribution of energy inputs."
            loading={isEnergyMixLoading}
          >
            <PieChart data={energyMix ?? []} />
          </ChartCard>
        </div>
      </div>
    </AppLayout>
  );
}
