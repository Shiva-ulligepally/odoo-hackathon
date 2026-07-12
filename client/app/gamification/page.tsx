'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import StatCard from '@/components/dashboard/StatCard';
import { Card } from '@/components/common/Card';
import { Award, ShieldCheck, Flame, Zap } from 'lucide-react';

export default function GamificationPage() {
  const achievements = [
    { name: 'Carbon Reducer', desc: 'Slashed company Scope 1 emissions by 10% this quarter.', icon: Flame, points: 500, color: 'text-orange-500' },
    { name: 'Ethics Champion', desc: '100% team completion of anti-corruption code of ethics.', icon: ShieldCheck, points: 300, color: 'text-emerald-500' },
    { name: 'Eco Advocate', desc: 'Organized solar utility transition initiative.', icon: Award, points: 1000, color: 'text-yellow-500' },
    { name: 'Efficiency Master', desc: 'Implemented HVAC optimization rules.', icon: Zap, points: 400, color: 'text-blue-500' },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 py-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Gamification Hub</h1>
          <p className="text-muted-foreground text-sm mt-1">Sustainability milestones, employee engagement leaderboard, and badges.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total ESG Points" value="2,200" description="+450 points from last cycle" />
          <StatCard title="Milestones Met" value="4 / 6" progress={66.6} color="blue" description="Next milestone: Zero-Waste certification" />
          <StatCard title="Rank on Leaderboard" value="#12 / 140" description="Top 10% company-wide rank" />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Active Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((a) => {
              const Icon = a.icon;
              return (
                <Card key={a.name} hoverEffect={true} className="flex gap-4 items-start">
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
