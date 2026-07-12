'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: string[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  onRefresh,
  isRefreshing = false,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-5 mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              {idx > 0 && <span>/</span>}
              <span className={idx === breadcrumbs.length - 1 ? 'text-foreground font-semibold' : ''}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>}
        </div>

        {/* Global Page Actions */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh Data"
              className="h-10 w-10 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}

          {actions}
        </div>
      </div>
    </div>
  );
}
