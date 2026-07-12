'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ReactFlow, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react';
import { HelpCircle, X } from 'lucide-react';
import '@xyflow/react/dist/style.css';

interface NodeDetail {
  title: string;
  type: string;
  score?: string;
  description: string;
  status: string;
  metrics: { label: string; value: string }[];
}

export default function DigitalTwinPage() {
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>({
    title: 'EcoSphere AI Corp',
    type: 'Company HQ',
    score: '86/100',
    description: 'Autonomous corporate entity overseeing ESG compliance structures across all manufacturing and operational divisions.',
    status: 'compliant',
    metrics: [
      { label: 'Total emissions', value: '37,601 tCO2e' },
      { label: 'GRI Certified', value: 'Yes (FY25)' },
      { label: 'Employees', value: '140 members' },
    ],
  });

  const initialNodes: Node[] = [
    {
      id: 'n1',
      position: { x: 300, y: 20 },
      data: {
        label: 'EcoSphere AI Corp',
        details: {
          title: 'EcoSphere AI Corp',
          type: 'Company HQ',
          score: '86/100',
          description: 'Autonomous corporate entity overseeing ESG compliance structures across all divisions.',
          status: 'compliant',
          metrics: [
            { label: 'Total emissions', value: '37,601 tCO2e' },
            { label: 'GRI Certified', value: 'Yes (FY25)' },
            { label: 'Employees', value: '140 members' },
          ],
        },
      },
      style: { background: '#022c22', border: '1px solid #10b981', color: '#fff', borderRadius: '8px', padding: '10px' },
    },
    {
      id: 'n2',
      position: { x: 100, y: 120 },
      data: {
        label: 'Operations & Mfg',
        details: {
          title: 'Operations & Mfg',
          type: 'Department',
          score: '82/100',
          description: 'Factory production line and assembly floors mapping utility requirements.',
          status: 'warning',
          metrics: [
            { label: 'Direct energy', value: 'PPA Solar / Coal Grid' },
            { label: 'Waste rate', value: '4.2% overall' },
          ],
        },
      },
      style: { background: '#0f172a', border: '1px solid #3b82f6', color: '#fff', borderRadius: '8px', padding: '10px' },
    },
    {
      id: 'n3',
      position: { x: 300, y: 120 },
      data: {
        label: 'Logistics & Supply',
        details: {
          title: 'Logistics & Supply',
          type: 'Department',
          score: '79/100',
          description: 'Fleet distribution networks and supply vendor compliance checklist checks.',
          status: 'warning',
          metrics: [
            { label: 'Fleet power', value: '8% Electrified' },
            { label: 'Active suppliers', value: '24 contracted' },
          ],
        },
      },
      style: { background: '#0f172a', border: '1px solid #3b82f6', color: '#fff', borderRadius: '8px', padding: '10px' },
    },
    {
      id: 'n4',
      position: { x: 500, y: 120 },
      data: {
        label: 'Human Resources',
        details: {
          title: 'Human Resources & CSR',
          type: 'Department',
          score: '90/100',
          description: 'DEI targets, labor ethics compliance, and local community charity sponsorships.',
          status: 'compliant',
          metrics: [
            { label: 'Diversity target', value: '40% Female Leadership' },
            { label: 'eNPS Satisfaction', value: '82.4% index' },
          ],
        },
      },
      style: { background: '#0f172a', border: '1px solid #3b82f6', color: '#fff', borderRadius: '8px', padding: '10px' },
    },
    {
      id: 'n5',
      position: { x: 50, y: 220 },
      data: {
        label: 'Southeast Mfg Hub',
        details: {
          title: 'Southeast Mfg Hub',
          type: 'Physical Asset',
          score: 'B Efficiency',
          description: 'Regional logistics and manufacturing factory located in Georgia, USA.',
          status: 'compliant',
          metrics: [
            { label: 'Power mix', value: 'Solar PPA (Pillar E)' },
            { label: 'Compliant audit', value: 'Yes' },
          ],
        },
      },
      style: { background: '#1e293b', border: '1px solid #64748b', color: '#fff', borderRadius: '8px', padding: '10px' },
    },
    {
      id: 'n6',
      position: { x: 200, y: 220 },
      data: {
        label: 'Midwest Foundry Hub',
        details: {
          title: 'Midwest Foundry Hub',
          type: 'Physical Asset',
          score: 'D Efficiency',
          description: 'High-emission iron foundry operations located in Indiana, USA.',
          status: 'warning',
          metrics: [
            { label: 'Power source', value: 'Coal Grid sourced' },
            { label: 'Action target', value: 'Electrify furnace' },
          ],
        },
      },
      style: { background: '#1e293b', border: '1px solid #f59e0b', color: '#fff', borderRadius: '8px', padding: '10px' },
    },
    {
      id: 'n7',
      position: { x: 500, y: 220 },
      data: {
        label: 'Ethics Policy Code',
        details: {
          title: 'Ethics Policy Code',
          type: 'Corporate Policy',
          description: 'Anti-bribery directives and whistleblower reporting channels.',
          status: 'compliant',
          metrics: [
            { label: 'Completion', value: '100% staff certified' },
            { label: 'Incidents log', value: '0 unresolved' },
          ],
        },
      },
      style: { background: '#581c87', border: '1px solid #a855f7', color: '#fff', borderRadius: '8px', padding: '10px' },
    },
  ];

  const initialEdges: Edge[] = [
    { id: 'e1-2', source: 'n1', target: 'n2', animated: true, style: { stroke: '#10b981' } },
    { id: 'e1-3', source: 'n1', target: 'n3', style: { stroke: '#64748b' } },
    { id: 'e1-4', source: 'n1', target: 'n4', style: { stroke: '#64748b' } },
    { id: 'e2-5', source: 'n2', target: 'n5', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e2-6', source: 'n2', target: 'n6', style: { stroke: '#f59e0b' } },
    { id: 'e4-7', source: 'n4', target: 'n7', style: { stroke: '#a855f7' } },
  ];

  const handleNodeClick = (_: unknown, node: Node) => {
    if (node.data?.details) {
      setSelectedNode(node.data.details as NodeDetail);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="ESG Digital Twin Map"
        description="Interact with relational departments, assets, personnel groups, and compliance policy nodes."
        breadcrumbs={['EcoSphere', 'Digital Twin']}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px] items-stretch">
        
        {/* React Flow Canvas */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card/45 relative overflow-hidden shadow-sm min-h-[400px]">
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            onNodeClick={handleNodeClick}
            fitView
            colorMode="dark"
          >
            <Background color="#334155" gap={16} />
            <Controls className="!bg-card !border-border !text-foreground" />
            <MiniMap 
              nodeColor={(n) => {
                if (n.id === 'n1') return '#10b981';
                if (n.id === 'n7') return '#a855f7';
                return '#3b82f6';
              }}
              className="!bg-card !border-border"
            />
          </ReactFlow>
        </div>

        {/* Node Detail Side Panel */}
        <div className="lg:col-span-1">
          {selectedNode ? (
            <Card className="h-full flex flex-col justify-between border-border relative">
              <button 
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                title="Dismiss Details"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Badge variant={selectedNode.status === 'compliant' ? 'success' : 'warning'}>
                    {selectedNode.type}
                  </Badge>
                  <h3 className="font-bold text-lg text-foreground pt-1.5">{selectedNode.title}</h3>
                  {selectedNode.score && (
                    <span className="text-xs font-bold text-primary block mt-1">
                      Pillar Rating: {selectedNode.score}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedNode.description}
                </p>

                <div className="border-t border-border pt-4 space-y-3">
                  <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">Node Metadata:</h4>
                  <div className="space-y-2">
                    {selectedNode.metrics.map((m) => (
                      <div key={m.label} className="flex justify-between items-center bg-muted/30 p-2 rounded text-[11px]">
                        <span className="text-muted-foreground font-semibold">{m.label}</span>
                        <span className="font-bold text-foreground">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border text-center">
                <Button className="w-full text-xs font-semibold" variant="outline">
                  Open Audit Records
                </Button>
              </div>
            </Card>
          ) : (
            <div className="rounded-xl border border-border border-dashed flex flex-col items-center justify-center p-6 text-center h-full">
              <HelpCircle className="h-8 w-8 text-muted-foreground/60 mb-2" />
              <h4 className="font-bold text-sm text-foreground">Select Node Map</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-[180px] mx-auto leading-relaxed">
                Click on any node in the React Flow twin schema to trace ESG compliance metadata.
              </p>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
