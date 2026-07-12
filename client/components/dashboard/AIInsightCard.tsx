'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { AIInsight } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface AIInsightCardProps {
  insight: AIInsight;
  onUpdateStatus?: (id: string, status: AIInsight['status']) => void;
}

export default function AIInsightCard({ insight, onUpdateStatus }: AIInsightCardProps) {
  const severityColors = {
    low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    high: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    critical: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse',
  };

  const categoryLabels = {
    E: 'Environmental',
    S: 'Social',
    G: 'Governance',
  };

  const categoryColors = {
    E: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
    S: 'text-sky-500 border-sky-500/20 bg-sky-500/5',
    G: 'text-purple-500 border-purple-500/20 bg-purple-500/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
    >
      <div className={cn(
        'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
        insight.category === 'E' ? 'from-emerald-400 to-teal-500' :
        insight.category === 'S' ? 'from-sky-400 to-blue-500' :
        'from-purple-400 to-indigo-500'
      )} />

      <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Cpu className="h-4 w-4" />
          </div>
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border uppercase tracking-wider', categoryColors[insight.category])}>
            {categoryLabels[insight.category]}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border capitalize', severityColors[insight.severity])}>
            {insight.severity} Priority
          </span>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-base font-bold tracking-tight">{insight.title}</h4>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{insight.description}</p>
      </div>

      <div className="mt-4 bg-muted/40 border-l-2 border-primary/50 rounded-r-lg p-3 text-xs leading-relaxed text-foreground/80 italic">
        <strong>Recommendation:</strong> {insight.recommendation}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
        <div>
          <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Estimated Impact</span>
          <span className={cn(
            'text-base font-bold mt-0.5 block',
            insight.category === 'E' ? 'text-emerald-500' :
            insight.category === 'S' ? 'text-sky-500' :
            'text-purple-500'
          )}>
            {insight.estimatedImpact.value > 0 ? '-' : ''}
            {insight.estimatedImpact.value} {insight.estimatedImpact.unit}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {insight.status === 'unresolved' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onUpdateStatus?.(insight.id, 'in_progress')}
              className="gap-1.5"
            >
              Start Implementation
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}

          {insight.status === 'in_progress' && (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => onUpdateStatus?.(insight.id, 'implemented')}
              className="gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mark Complete
            </Button>
          )}

          {insight.status === 'implemented' && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
              Implemented
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
