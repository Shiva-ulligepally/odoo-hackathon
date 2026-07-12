'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number; // YoY percentage change
  changeText?: string;
  category?: 'E' | 'S' | 'G' | 'neutral';
  loading?: boolean;
  lowerIsBetter?: boolean;
}

export default function MetricCard({
  title,
  value,
  unit,
  change,
  changeText = 'vs last year',
  category = 'neutral',
  loading = false,
  lowerIsBetter = false,
}: MetricCardProps) {
  const isPositiveChange = change !== undefined && change > 0;
  const isZeroChange = change !== undefined && change === 0;
  
  let isGoodTrend = true;
  if (change !== undefined) {
    if (lowerIsBetter) {
      isGoodTrend = change < 0;
    } else {
      isGoodTrend = change > 0;
    }
  }

  const categoryBorderClasses = {
    E: 'border-emerald-500/20 dark:border-emerald-500/30 hover:border-emerald-500/50 dark:hover:border-emerald-500/60 shadow-emerald-500/5',
    S: 'border-sky-500/20 dark:border-sky-500/30 hover:border-sky-500/50 dark:hover:border-sky-500/60 shadow-sky-500/5',
    G: 'border-purple-500/20 dark:border-purple-500/30 hover:border-purple-500/50 dark:hover:border-purple-500/60 shadow-purple-500/5',
    neutral: 'border-border hover:border-muted-foreground/30',
  };

  const categoryBadgeClasses = {
    E: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    S: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    G: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    neutral: 'bg-muted text-muted-foreground border-transparent',
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm shimmer h-36">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-8 w-36 rounded bg-muted mt-4" />
        <div className="h-4 w-48 rounded bg-muted mt-4" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      className={cn(
        'relative rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 overflow-hidden',
        categoryBorderClasses[category]
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground truncate">{title}</span>
        {category !== 'neutral' && (
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border select-none uppercase tracking-wider', categoryBadgeClasses[category])}>
            {category}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {unit && <span className="text-sm font-semibold text-muted-foreground">{unit}</span>}
      </div>

      {change !== undefined && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <div
            className={cn(
              'flex items-center gap-0.5 font-semibold px-2 py-0.5 rounded-full border',
              isZeroChange
                ? 'bg-muted text-muted-foreground border-transparent'
                : isGoodTrend
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
            )}
          >
            {isZeroChange ? (
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mr-1" />
            ) : isPositiveChange ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>{isZeroChange ? '0.0%' : `${Math.abs(change).toFixed(1)}%`}</span>
          </div>
          <span className="text-muted-foreground font-medium">{changeText}</span>
        </div>
      )}
    </motion.div>
  );
}
