'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import MetricCard from '@/components/dashboard/MetricCard';
import AIInsightCard from '@/components/dashboard/AIInsightCard';
import ChartCard from '@/components/charts/ChartCard';
import PieChart from '@/components/charts/PieChart';
import BarChart from '@/components/charts/BarChart';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/common/Card';
import { useToast } from '@/components/ui/Toast';
import { getDashboardOverview, getAIInsights, updateInsightStatus } from '@/services/dashboard';
import { Calendar, ArrowRight, ShieldCheck, FileSpreadsheet, PlusCircle } from 'lucide-react';
import { formatDate } from '@/utils/format';

import { InsightStatus } from '@/types';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: overview, isLoading: isOverviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: getDashboardOverview,
  });

  const { data: insights, isLoading: isInsightsLoading, refetch: refetchInsights } = useQuery({
    queryKey: ['aiInsights'],
    queryFn: getAIInsights,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'unresolved' | 'in_progress' | 'implemented' }) =>
      updateInsightStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['aiInsights'] });
      const statusLabels = {
        in_progress: 'marked as in-progress',
        implemented: 'successfully completed',
        unresolved: 'reset to unresolved',
      };
      toast(`Insight recommendation has been ${statusLabels[variables.status]}.`, 'success');
    },
  });

  const handleUpdateStatus = (id: string, status: InsightStatus) => {
    mutation.mutate({ id, status });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchOverview(), refetchInsights()]);
    setIsRefreshing(false);
    toast('Dashboard analytics refetched successfully.', 'success');
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
      <PageHeader
        title="ESG Operations Hub"
        description="Autonomous ESG intelligence, compliance timelines, and AI recommendations."
        breadcrumbs={['EcoSphere', 'Dashboard']}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="text-xs font-semibold gap-1.5 h-10">
              <Calendar className="h-4 w-4" />
              FY 2026
            </Button>
            <Button className="text-xs font-semibold gap-1.5 h-10">
              <PlusCircle className="h-4 w-4" />
              New Ledger Entry
            </Button>
          </div>
        }
      />

      <div className="space-y-8">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Quick Actions Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverEffect={true} className="flex items-center justify-between p-5 border-border">
            <div className="space-y-1">
              <h4 className="font-bold text-sm">Download ESG Report</h4>
              <p className="text-xs text-muted-foreground">Get the latest certified GRI/CSDR disclosure.</p>
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
              <FileSpreadsheet className="h-4.5 w-4.5 text-primary" />
            </Button>
          </Card>

          <Card hoverEffect={true} className="flex items-center justify-between p-5 border-border">
            <div className="space-y-1">
              <h4 className="font-bold text-sm">Verify Whistleblower Logs</h4>
              <p className="text-xs text-muted-foreground">Conduct anti-corruption incident tracking.</p>
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
              <ShieldCheck className="h-4.5 w-4.5 text-esg-g" />
            </Button>
          </Card>

          <Card hoverEffect={true} className="flex items-center justify-between p-5 border-border">
            <div className="space-y-1">
              <h4 className="font-bold text-sm">Explore Energy Mix</h4>
              <p className="text-xs text-muted-foreground">Check solar and clean electricity PPAs.</p>
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
              <ArrowRight className="h-4.5 w-4.5 text-esg-e" />
            </Button>
          </Card>
        </div>

        {/* Charts & Deadlines Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="ESG Rating Breakdown"
            subtitle="Current rating score comparison across pillars."
            loading={isOverviewLoading}
            className="lg:col-span-2"
          >
            <PieChart data={breakdownData} />
          </ChartCard>

          {/* Upcoming Deadlines */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-base tracking-tight">Compliance Deadlines</h3>
              <div className="divide-y divide-border">
                {overview?.deadlines?.map((d) => (
                  <div key={d.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-foreground block">{d.title}</span>
                      <span className="text-[10px] text-muted-foreground">Due: {formatDate(d.dueDate)}</span>
                    </div>
                    <Badge variant={d.category}>{d.category}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pillar Growth and Activity Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Pillar Growth YoY"
            subtitle="Year-over-year rating changes per ESG category."
            loading={isOverviewLoading}
            className="lg:col-span-2"
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

          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-base tracking-tight">Audit Timeline</h3>
              <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-3 before:w-0.5 before:bg-muted-foreground/15">
                {overview?.recentActivities?.map((a) => (
                  <div key={a.id} className="flex gap-4 items-start relative pl-1">
                    <div className="h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 z-10 text-[10px] font-bold">
                      {a.category}
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-foreground">{a.action}</h5>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{a.details}</p>
                      <span className="text-[9px] font-semibold text-muted-foreground/60">{formatDate(a.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
