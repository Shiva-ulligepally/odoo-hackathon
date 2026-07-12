'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import StatCard from '@/components/dashboard/StatCard';
import ChartCard from '@/components/charts/ChartCard';
import PieChart from '@/components/charts/PieChart';
import GaugeChart from '@/components/charts/GaugeChart';

export default function GovernancePage() {
  return (
    <AppLayout>
      <div className="space-y-8 py-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Corporate Governance</h1>
          <p className="text-muted-foreground text-sm mt-1">Audit log of executive boards, business ethics, and whistleblower compliance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Board Independence"
            value="80.0%"
            progress={80}
            color="emerald"
            description="8 out of 10 board members independent"
          />
          <StatCard
            title="Ethics Training Completed"
            value="100.0%"
            progress={100}
            color="emerald"
            description="Mandatory compliance training completion"
          />
          <StatCard
            title="Anti-Corruption Audit"
            value="Passed"
            description="Clean audit report for 2026 cycle"
            color="emerald"
          />
          <StatCard
            title="Whistleblower Incidents"
            value="Resolved"
            description="All tickets closed in <30 days"
            color="emerald"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Governance Risk Index"
            subtitle="Overall governance rating metric assessment."
          >
            <GaugeChart value={87} title="Compliance score" color="#8b5cf6" />
          </ChartCard>

          <ChartCard
            title="Board Committee Breakdown"
            subtitle="Seat distribution among compliance Committees."
          >
            <PieChart
              data={[
                { name: 'Audit Committee', value: 4, color: '#ef4444' },
                { name: 'Compensation', value: 3, color: '#f59e0b' },
                { name: 'Ethics & Compliance', value: 5, color: '#10b981' },
                { name: 'Nomination', value: 2, color: '#3b82f6' },
              ]}
            />
          </ChartCard>
        </div>
      </div>
    </AppLayout>
  );
}
