'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  className?: string;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  actions,
  loading = false,
  empty = false,
  emptyMessage = 'No chart data available for the selected filters.',
  className,
}: ChartCardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card shadow-sm p-6 flex flex-col min-h-[380px]', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 self-start sm:self-auto">{actions}</div>}
      </div>

      <div className="flex-1 w-full relative flex items-center justify-center min-h-[260px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/60 backdrop-blur-[1px] z-10 transition-all">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <span className="text-xs text-muted-foreground font-medium">Recalculating ESG dataset...</span>
            </div>
          </div>
        )}

        {empty && !loading ? (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-xs">
            <HelpCircle className="h-8 w-8 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="w-full h-full min-h-[260px] flex items-center justify-center">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
