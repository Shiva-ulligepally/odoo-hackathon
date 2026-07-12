'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  progress?: number; // 0 to 100
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'neutral';
  className?: string;
}

export default function StatCard({
  title,
  value,
  description,
  progress,
  color = 'neutral',
  className,
}: StatCardProps) {
  const colorMaps = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    neutral: 'bg-muted-foreground',
  };

  const textColors = {
    emerald: 'text-emerald-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    amber: 'text-amber-500',
    rose: 'text-rose-500',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className={cn('rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between min-h-[140px]', className)}>
      <div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">{title}</span>
        <span className="text-2xl font-extrabold tracking-tight mt-2 block">{value}</span>
      </div>

      <div className="mt-4">
        {progress !== undefined && (
          <div className="space-y-1">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className={cn('h-full transition-all duration-500', colorMaps[color])} 
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
              <span>Progress</span>
              <span className={textColors[color]}>{progress.toFixed(0)}%</span>
            </div>
          </div>
        )}
        {description && progress === undefined && (
          <span className="text-xs text-muted-foreground font-medium">{description}</span>
        )}
      </div>
    </div>
  );
}
