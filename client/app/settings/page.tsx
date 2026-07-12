'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/forms/FormInput';

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState('EcoSphere AI Ltd.');
  const [apiKey, setApiKey] = useState('esg_live_8f0a3e9c4b72fd1d0a');

  return (
    <AppLayout>
      <div className="space-y-8 py-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">SaaS Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure company profiles, webhook audits, and API access keys.</p>
        </div>

        <div className="max-w-2xl">
          <Card className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-foreground border-b border-border pb-3">Company Metadata</h3>
            
            <FormInput 
              label="Registered Company Name" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              id="company-name"
            />

            <FormInput 
              label="Active API Secret Access Key" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              id="api-key"
              type="password"
            />

            <div className="flex justify-end pt-4">
              <Button>Save Config Settings</Button>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
