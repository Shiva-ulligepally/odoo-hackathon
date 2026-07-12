import React from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title?: string;
  message: string;
  className?: string;
}

export default function EmptyState({
  title = 'No Records Found',
  message,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto', className)}>
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 mb-4 border border-border">
        <HelpCircle className="h-6 w-6" />
      </div>
      <h4 className="font-bold text-sm text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{message}</p>
    </div>
  );
}
