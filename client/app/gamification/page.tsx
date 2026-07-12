'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import { Card } from '@/components/common/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { getDashboardOverview } from '@/services/dashboard';
import { getFacilitiesEmissions } from '@/services/carbon';
import { Award, ShieldCheck, Flame, Zap, Trophy } from 'lucide-react';

export default function GamificationPage() {
  const { toast } = useToast();
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: getDashboardOverview,
  });

  const { data: facilities, isLoading: isFacilitiesLoading } = useQuery({
    queryKey: ['facilitiesEmissions'],
    queryFn: getFacilitiesEmissions,
  });

  const achievements = [
    { name: 'Carbon Reducer', desc: 'Slashed company Scope 1 emissions by 10% this quarter.', icon: Flame, points: 500, color: 'text-orange-500' },
    { name: 'Ethics Champion', desc: '100% team completion of anti-corruption code of ethics.', icon: ShieldCheck, points: 300, color: 'text-emerald-500' },
    { name: 'Eco Advocate', desc: 'Organized solar utility transition initiative.', icon: Award, points: 1000, color: 'text-yellow-500' },
    { name: 'Efficiency Master', desc: 'Implemented HVAC optimization rules.', icon: Zap, points: 400, color: 'text-blue-500' },
  ];

  // Sort facilities to generate leaderboard
  const leaderboard = facilities
    ? [...facilities].sort((a, b) => b.scope1 - a.scope1)
    : [];

  const handleClaimPoints = (id: string, title: string, pts: number) => {
    setClaimingId(id);
    setTimeout(() => {
      setClaimingId(null);
      toast(`Successfully claimed ${pts} ESG Points for challenge: "${title}"!`, 'success');
    }, 1200);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Gamification & Milestones"
        description="Encourage carbon reduction achievements, audit track milestones, and view facility leaderboards."
        breadcrumbs={['EcoSphere', 'Gamification']}
      />

      <div className="space-y-8">
        {/* Row of Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total ESG Points" value="2,200" description="+450 points from last cycle" />
          <StatCard title="Milestones Met" value="4 / 6" progress={66.6} color="blue" description="Next milestone: Zero-Waste certification" />
          <StatCard title="Rank on Leaderboard" value="#12 / 140" description="Top 10% company-wide rank" />
        </div>

        {/* Facility Leaderboard Table */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="font-bold text-base tracking-tight">Regional Facility ESG Leaderboard</h3>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">Rank</TableHead>
                <TableHead>Facility Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Scope 1 Offset</TableHead>
                <TableHead className="text-right font-bold">Renewable energy</TableHead>
                <TableHead className="text-center">Audit Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFacilitiesLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 shimmer">
                    Loading leaderboard standings...
                  </TableCell>
                </TableRow>
              ) : leaderboard.length > 0 ? (
                leaderboard.map((fac, idx) => (
                  <TableRow key={fac.id}>
                    <TableCell className="text-center font-bold">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        idx === 0 
                          ? 'bg-yellow-500/10 text-yellow-600' 
                          : idx === 1 
                          ? 'bg-zinc-400/10 text-zinc-500' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        #{idx + 1}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold">{fac.name}</TableCell>
                    <TableCell className="text-muted-foreground">{fac.location}</TableCell>
                    <TableCell className="text-right text-xs font-semibold">{fac.scope1} tCO2e</TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {fac.efficiencyRating === 'A' ? '78.5%' : fac.efficiencyRating === 'B' ? '64.5%' : '48.0%'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={fac.status === 'compliant' ? 'success' : 'warning'}>
                        {fac.status === 'compliant' ? 'Verified' : 'Warning'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No leaderboard metrics computed.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Active Challenges */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Monthly Milestones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isOverviewLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-32 border border-border rounded-xl shimmer" />
              ))
            ) : overview?.challenges?.map((c) => (
              <Card key={c.id} className="flex flex-col justify-between h-44 border-border">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Badge variant={c.category}>{c.category}</Badge>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {c.currentValue} / {c.targetValue}%
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground mt-2">{c.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs font-bold text-primary">+{c.points} pts</span>
                  {c.status === 'completed' ? (
                    <Button variant="outline" size="sm" disabled={true} className="text-xs">
                      Claimed
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => handleClaimPoints(c.id, c.title, c.points)}
                      loading={claimingId === c.id}
                      className="text-xs h-8"
                    >
                      Claim
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements Gallery */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Active Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((a) => {
              const Icon = a.icon;
              return (
                <Card key={a.name} hoverEffect={true} className="flex gap-4 items-start border-border">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center border border-border shrink-0">
                    <Icon className={`h-6 w-6 ${a.color}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm text-foreground">{a.name}</h4>
                      <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                        +{a.points} pts
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
