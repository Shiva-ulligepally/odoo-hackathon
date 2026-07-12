'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import StatCard from '@/components/dashboard/StatCard';
import ChartCard from '@/components/charts/ChartCard';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';

export default function CSRPage() {
  return (
    <AppLayout>
      <div className="space-y-8 py-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Social & Human Capital</h1>
          <p className="text-muted-foreground text-sm mt-1">Audit ledger of labor standards, supplier ethics, and workplace representation.</p>
        </div>

        {/* Row of Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Supplier Code Compliance"
            value="94.5%"
            progress={94.5}
            color="emerald"
            description="Tier 1 vendor compliance rate"
          />
          <StatCard
            title="Diversity & Representation"
            value="42.0%"
            progress={42.0}
            color="blue"
            description="Female leadership representation"
          />
          <StatCard
            title="Employee Satisfaction"
            value="82.4%"
            progress={82.4}
            color="purple"
            description="eNPS overall index rating"
          />
          <StatCard
            title="Safety Incident Rate"
            value="0.0"
            progress={100}
            color="emerald"
            description="Zero safety incidents reported"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Workforce Demographics"
            subtitle="Breakdown of representation by function."
          >
            <PieChart
              data={[
                { name: 'Engineering', value: 35, color: '#10b981' },
                { name: 'Sales & Ops', value: 45, color: '#0284c7' },
                { name: 'Leadership', value: 12, color: '#8b5cf6' },
                { name: 'Other', value: 8, color: '#f59e0b' },
              ]}
            />
          </ChartCard>

          <ChartCard
            title="Community Impact Investment"
            subtitle="Community funding and education support."
          >
            <BarChart
              xData={['2022', '2023', '2024', '2025', '2026']}
              series={[
                { name: 'Investment ($K)', data: [120, 150, 190, 240, 310], color: '#6366f1' },
              ]}
              yAxisName="$K"
            />
          </ChartCard>
        </div>
      </div>
    </AppLayout>
  );
}
