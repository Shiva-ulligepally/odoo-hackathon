'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import ChartCard from '@/components/charts/ChartCard';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getSupplierEsgRecords } from '@/services/carbon';
import { formatDate } from '@/utils/format';
import { Heart, Users, FileText, CheckCircle } from 'lucide-react';

export default function CSRPage() {
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  const { data: suppliers, isLoading: isSuppliersLoading } = useQuery({
    queryKey: ['supplierEsgRecords'],
    queryFn: getSupplierEsgRecords,
  });

  const filteredSuppliers = suppliers?.filter((s) => {
    if (sectorFilter === 'all') return true;
    return s.sector.toLowerCase().includes(sectorFilter.toLowerCase());
  }) ?? [];

  const campaigns = [
    { name: 'Solar Access Initiative', desc: 'Deploying small-scale solar packages to community clinics.', date: '2026-06-15', status: 'completed' },
    { name: 'Water Stewardship Program', desc: 'Recycling 100% of foundry runoffs in Indiana facilities.', date: '2026-07-20', status: 'active' },
    { name: 'Supplier Code Alignment', desc: 'Auditing top critical suppliers for ISO 14001 certification.', date: '2026-08-10', status: 'pending' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Social & Human Capital"
        description="Pillar auditing of diversity metrics, employee satisfaction, safety logs, and supplier compliance checks."
        breadcrumbs={['EcoSphere', 'Social']}
        actions={
          <div className="flex gap-2">
            <select 
              value={sectorFilter} 
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-background border border-border rounded-lg text-xs font-semibold px-3 py-2 outline-none"
            >
              <option value="all">All Sectors</option>
              <option value="materials">Raw Materials</option>
              <option value="logistics">Logistics & Supply</option>
              <option value="chemicals">Chemicals</option>
              <option value="utilities">Utilities</option>
            </select>
          </div>
        }
      />

      <div className="space-y-8">
        {/* Row of Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Supplier ESG Registry Table */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base tracking-tight">Supply Chain Vendor Registry</h3>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">ESG Score</TableHead>
                <TableHead className="text-center">Last Audit</TableHead>
                <TableHead className="text-center">Audit Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isSuppliersLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 shimmer">
                    Loading vendor ledger...
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((sup) => (
                  <TableRow key={sup.id}>
                    <TableCell className="font-semibold">{sup.name}</TableCell>
                    <TableCell className="text-muted-foreground">{sup.sector}</TableCell>
                    <TableCell>{sup.country}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{sup.esgScore} / 100</TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">{formatDate(sup.lastAuditDate)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={sup.auditStatus === 'compliant' ? 'success' : sup.auditStatus === 'under_review' ? 'warning' : 'destructive'}>
                        {sup.auditStatus === 'compliant' ? 'Compliant' : sup.auditStatus === 'under_review' ? 'Under Review' : 'Non-Compliant'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No suppliers match the selected sector filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Workforce Representation"
            subtitle="Breakdown of representation by corporate function."
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
            subtitle="Annual community allocation towards local development."
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

        {/* CSR Campaigns Timeline */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="h-5 w-5 text-rose-500" />
            <h3 className="font-bold text-base tracking-tight">Workplace & Community CSR Campaigns</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {campaigns.map((c) => (
              <div key={c.name} className="border border-border rounded-xl p-5 bg-muted/20 flex flex-col justify-between h-40">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-muted-foreground">{formatDate(c.date)}</span>
                    <Badge variant={c.status === 'completed' ? 'success' : c.status === 'active' ? 'info' : 'secondary'}>
                      {c.status}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-foreground mt-2">{c.name}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
