'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import MetricCard from '@/components/dashboard/MetricCard';
import AIInsightCard from '@/components/dashboard/AIInsightCard';
import ChartCard from '@/components/charts/ChartCard';
import PieChart from '@/components/charts/PieChart';
import BarChart from '@/components/charts/BarChart';
import { getDashboardOverview, getAIInsights, updateInsightStatus } from '@/services/dashboard';

export default function DashboardPage() {
  const queryClient = useQueryClient();

  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: getDashboardOverview,
  });

  const { data: insights, isLoading: isInsightsLoading } = useQuery({
    queryKey: ['aiInsights'],
    queryFn: getAIInsights,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'unresolved' | 'in_progress' | 'implemented' }) =>
      updateInsightStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiInsights'] });
    },
  });

  const handleUpdateStatus = (id: string, status: any) => {
    mutation.mutate({ id, status });
  };

  const breakdownData = overview
    ? [
        { name: 'Environmental', value: overview.breakdown.environmental.score, color: '#10b981' },
        { name: 'Social', value: overview.breakdown.social.score, color: '#0284c7' },
        { name: 'Governance', value: overview.breakdown.governance.score, color: '#8b5cf6' },
      ]
    : [];

  return (
    <AppLayout>
      <div className="space-y-8 py-4">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">ESG Operations Hub</h1>
          <p className="text-muted-foreground text-sm mt-1">Autonomous ESG analytics and AI insights.</p>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Overall ESG Rating"
            value={overview?.overallScore ?? '--'}
            unit={`/100 (${overview?.overallGrade ?? ''})`}
            change={overview?.yoyTrend}
            category="neutral"
            loading={isOverviewLoading}
          />
          <MetricCard
            title="Environmental (E)"
            value={overview?.breakdown.environmental.score ?? '--'}
            unit="/100"
            change={overview?.breakdown.environmental.changeYoy}
            category="E"
            loading={isOverviewLoading}
          />
          <MetricCard
            title="Social & HR (S)"
            value={overview?.breakdown.social.score ?? '--'}
            unit="/100"
            change={overview?.breakdown.social.changeYoy}
            category="S"
            loading={isOverviewLoading}
          />
          <MetricCard
            title="Governance (G)"
            value={overview?.breakdown.governance.score ?? '--'}
            unit="/100"
            change={overview?.breakdown.governance.changeYoy}
            category="G"
            loading={isOverviewLoading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="ESG Rating Breakdown"
            subtitle="Current rating score comparison across pillars."
            loading={isOverviewLoading}
          >
            <PieChart data={breakdownData} />
          </ChartCard>

          <ChartCard
            title="Pillar Growth YoY"
            subtitle="Year-over-year rating changes per ESG category."
            loading={isOverviewLoading}
          >
            <BarChart
              xData={['Environmental', 'Social', 'Governance']}
              series={[
                {
                  name: 'YoY Growth (%)',
                  data: [
                    overview?.breakdown.environmental.changeYoy ?? 0,
                    overview?.breakdown.social.changeYoy ?? 0,
                    overview?.breakdown.governance.changeYoy ?? 0,
                  ],
                  color: '#10b981',
                },
              ]}
              yAxisName="%"
            />
          </ChartCard>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">AI Recommendations & Offsets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isInsightsLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-48 border border-border rounded-xl shimmer" />
              ))
            ) : insights && insights.length > 0 ? (
              insights.map((insight) => (
                <AIInsightCard
                  key={insight.id}
                  insight={insight}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No active recommendations.</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
