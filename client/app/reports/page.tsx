'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/common/Card';
import { getReports, generateReport } from '@/services/reports';
import { FileText, Download, CheckCircle, Clock } from 'lucide-react';
import { formatDate } from '@/utils/format';

export default function ReportsPage() {
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reportsList'],
    queryFn: getReports,
  });

  const generateMutation = useMutation({
    mutationFn: ({ title, type, year }: { title: string; type: any; year: number }) =>
      generateReport(title, type, year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportsList'] });
    },
  });

  const handleGenerateReport = () => {
    generateMutation.mutate({
      title: `Ad-hoc ESG Audit Report ${new Date().getFullYear()}`,
      type: 'sustainability',
      year: new Date().getFullYear(),
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Sustainability Reports</h1>
            <p className="text-muted-foreground text-sm mt-1">Autonomous disclosure sheets certified for GRI and carbon audit standards.</p>
          </div>
          <Button 
            onClick={handleGenerateReport} 
            loading={generateMutation.isPending}
            className="sm:self-center"
          >
            Generate Audited Report
          </Button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            [1, 2].map((i) => (
              <div key={i} className="h-20 border border-border rounded-xl shimmer" />
            ))
          ) : reports && reports.length > 0 ? (
            reports.map((report) => (
              <Card key={report.id} hoverEffect={true} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{report.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="capitalize">{report.type.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>Created {formatDate(report.createdAt)}</span>
                      {report.certifiedBy && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-500 font-semibold">{report.certifiedBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {report.status === 'certified' ? (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded flex items-center gap-1 select-none">
                      <CheckCircle className="h-3 w-3" />
                      Certified
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded flex items-center gap-1 select-none">
                      <Clock className="h-3 w-3" />
                      Pending Audit
                    </span>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <a href={report.downloadUrl} className="flex items-center gap-1.5">
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No reports generated yet.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
