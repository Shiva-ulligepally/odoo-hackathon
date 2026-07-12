'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { getReports, generateReport } from '@/services/reports';
import { FileText, Download, CheckCircle, Clock, Eye, Search, X } from 'lucide-react';
import { formatDate } from '@/utils/format';
import { motion, AnimatePresence } from 'framer-motion';
import { ESGReport } from '@/types';

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'alphabetical'>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [previewReport, setPreviewReport] = useState<ESGReport | null>(null);

  const itemsPerPage = 5;

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reportsList'],
    queryFn: getReports,
  });

  const generateMutation = useMutation({
    mutationFn: ({ title, type, year }: { title: string; type: ESGReport['type']; year: number }) =>
      generateReport(title, type, year),
    onSuccess: (newReport) => {
      queryClient.invalidateQueries({ queryKey: ['reportsList'] });
      toast(`Successfully generated draft: "${newReport.title}"!`, 'success');
    },
  });

  const handleGenerateReport = () => {
    generateMutation.mutate({
      title: `Ad-hoc ESG Audit Report ${new Date().getFullYear()}`,
      type: 'sustainability',
      year: new Date().getFullYear(),
    });
  };

  const handleDownload = (title: string) => {
    toast(`Initiated secure download for: "${title}".`, 'success');
  };

  // Filter and sort reports
  const processedReports = reports
    ? [...reports]
        .filter((r) => {
          const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesType = filterType === 'all' || r.type === filterType;
          return matchesSearch && matchesType;
        })
        .sort((a, b) => {
          if (sortBy === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          return a.title.localeCompare(b.title);
        })
    : [];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedReports.length / itemsPerPage);

  return (
    <AppLayout>
      <PageHeader
        title="Sustainability Reports"
        breadcrumbs={['EcoSphere', 'Reports']}
        description="Audited sustainability disclosure frameworks and ESG ledgers compliant with GRI and CSRD standards."
        actions={
          <Button 
            onClick={handleGenerateReport} 
            loading={generateMutation.isPending}
            className="text-xs font-semibold h-10 px-4"
          >
            Generate Audited Report
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Search, Filter, and Sort Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reports by title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-muted/30 border border-border rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-primary transition-colors text-foreground"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-muted/30 border border-border rounded-lg text-xs font-semibold px-3 py-2.5 outline-none text-foreground"
            >
              <option value="all">All Categories</option>
              <option value="sustainability">Sustainability Report</option>
              <option value="carbon_disclosure">Carbon Disclosure</option>
              <option value="gri_index">GRI Index</option>
              <option value="governance_audit">Governance Audit</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'latest' | 'oldest' | 'alphabetical')}
              className="bg-muted/30 border border-border rounded-lg text-xs font-semibold px-3 py-2.5 outline-none text-foreground"
            >
              <option value="latest">Sort by: Newest</option>
              <option value="oldest">Sort by: Oldest</option>
              <option value="alphabetical">Sort by: A-Z</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-20 border border-border rounded-xl shimmer animate-pulse bg-muted/40" />
            ))
          ) : currentItems.length > 0 ? (
            currentItems.map((report) => (
              <Card key={report.id} hoverEffect={true} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-border">
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

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {report.status === 'certified' ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1 select-none">
                      <CheckCircle className="h-3 w-3" />
                      Certified
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1 select-none">
                      <Clock className="h-3 w-3" />
                      Draft
                    </span>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPreviewReport(report)}
                    className="text-xs h-8 gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => handleDownload(report.title)}
                    className="text-xs h-8 gap-1"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No sustainability reports match the criteria.</p>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, processedReports.length)} of {processedReports.length} reports
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-xs h-8"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="text-xs h-8"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Dialog Modal */}
      <AnimatePresence>
        {previewReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewReport(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-2xl z-10 space-y-4"
            >
              <button
                onClick={() => setPreviewReport(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-1">
                <Badge variant={previewReport.status === 'certified' ? 'success' : 'warning'}>
                  {previewReport.status === 'certified' ? 'Certified Disclosure' : 'Internal Review Draft'}
                </Badge>
                <h3 className="font-bold text-lg text-foreground mt-2">{previewReport.title}</h3>
                <p className="text-xs text-muted-foreground">Framework Type: <span className="capitalize">{previewReport.type.replace('_', ' ')}</span></p>
              </div>

              <div className="border-t border-border pt-4 text-xs text-foreground/80 leading-relaxed space-y-3">
                <h4 className="font-bold text-sm text-foreground">Disclosure Abstract Framework:</h4>
                <p>
                  This auditable statement outlines the carbon coefficients and social diversity indicators for EcoSphere AI in the fiscal cycle of {previewReport.year}. The assessment validates Scope 1 (Direct manufacturing outputs) and Scope 2 (Grid utility coefficients).
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-muted-foreground">
                  <li>Global Reporting Initiative (GRI) core compliance mappings validated.</li>
                  <li>Social pay equality targets checked against 2026 workforce indexes.</li>
                  <li>Board whistleblower oversight controls completed with zero major compliance risks.</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setPreviewReport(null)}>
                  Close Preview
                </Button>
                <Button size="sm" onClick={() => {
                  setPreviewReport(null);
                  handleDownload(previewReport.title);
                }}>
                  Download PDF
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
