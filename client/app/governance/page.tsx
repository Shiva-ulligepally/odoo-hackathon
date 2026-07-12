'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import ChartCard from '@/components/charts/ChartCard';
import PieChart from '@/components/charts/PieChart';
import GaugeChart from '@/components/charts/GaugeChart';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Calendar, FileText } from 'lucide-react';
import { formatDate } from '@/utils/format';

export default function GovernancePage() {
  const auditHistory = [
    { id: 'aud-01', title: 'SOC 2 Type II Security Audit', auditor: 'PwC Certifications', year: 2026, score: 98, status: 'certified', date: '2026-05-12' },
    { id: 'aud-02', title: 'CSRD Pre-Compliance Review', auditor: 'Deloitte ESG Advisory', year: 2025, score: 85, status: 'certified', date: '2025-11-20' },
    { id: 'aud-03', title: 'Anti-Bribery and Whistleblower Review', auditor: 'Ethics Board LLC', year: 2026, score: 92, status: 'under_review', date: '2026-06-30' },
    { id: 'aud-04', title: 'Scope 1 & 2 Emissions Validation', auditor: 'EcoVerify Auditors', year: 2026, score: 79, status: 'warning', date: '2026-04-10' },
  ];

  const committeeSchedule = [
    { committee: 'Audit & Integrity Committee', chair: 'Helen Vance', date: '2026-07-28T10:00:00Z', agenda: 'Review Q2 whistleblower logs and cyber compliance' },
    { committee: 'Compensation & Remuneration', chair: 'Dr. Arthur Chen', date: '2026-08-05T14:00:00Z', agenda: 'Align board salary indexes with 2026 DEI goals' },
    { committee: 'Ethics & Compliance Committee', chair: 'Aditya (ESG Director)', date: '2026-07-19T09:00:00Z', agenda: 'Audit supplier code of conduct checklists' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Corporate Governance"
        description="Legal and compliance auditing records, executive boards alignment, and anti-corruption registers."
        breadcrumbs={['EcoSphere', 'Governance']}
      />

      <div className="space-y-8">
        {/* Row of Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Audit History Table */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base tracking-tight">Compliance & Ethics Audit Ledger</h3>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Audit Title</TableHead>
                <TableHead>Auditor / Authority</TableHead>
                <TableHead className="text-center">Year</TableHead>
                <TableHead className="text-right">Compliance Score</TableHead>
                <TableHead className="text-center">Audit Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditHistory.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-semibold">{a.title}</TableCell>
                  <TableCell className="text-muted-foreground">{a.auditor}</TableCell>
                  <TableCell className="text-center">{a.year}</TableCell>
                  <TableCell className="text-right font-bold text-primary">{a.score} / 100</TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground">{formatDate(a.date)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={a.status === 'certified' ? 'success' : a.status === 'under_review' ? 'warning' : 'destructive'}>
                      {a.status === 'certified' ? 'Certified' : a.status === 'under_review' ? 'Under Review' : 'Action Required'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Charts & Gauges Grid */}
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

        {/* Board Committee Schedule */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base tracking-tight">Executive Committee Meet Schedule</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {committeeSchedule.map((c) => (
              <div key={c.committee} className="border border-border rounded-xl p-5 bg-muted/20 flex flex-col justify-between h-44">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold text-muted-foreground">Chair: {c.chair}</span>
                    <span className="text-[9px] font-semibold text-primary">{formatDate(c.date)}</span>
                  </div>
                  <h4 className="font-bold text-xs text-foreground mt-2">{c.committee}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{c.agenda}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
