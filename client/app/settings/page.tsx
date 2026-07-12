'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/forms/FormInput';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/hooks/useTheme';
import { User, Building, Bell, Shield, Key } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Settings State
  const [profileName, setProfileName] = useState('Aditya');
  const [profileEmail, setProfileEmail] = useState('aditya@ecosphere.ai');
  const [companyName, setCompanyName] = useState('EcoSphere AI Ltd.');
  const [companyTax, setCompanyTax] = useState('US-9834279-A');
  const [language, setLanguage] = useState('en');
  const [apiKey, setApiKey] = useState('esg_live_8f0a3e9c4b72fd1d0a');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSlack, setNotifSlack] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast('Global settings saved successfully.', 'success');
    }, 1200);
  };

  const handleResetDefaults = () => {
    setProfileName('Aditya');
    setProfileEmail('aditya@ecosphere.ai');
    setCompanyName('EcoSphere AI Ltd.');
    setCompanyTax('US-9834279-A');
    setLanguage('en');
    setApiKey('esg_live_8f0a3e9c4b72fd1d0a');
    setOldPassword('');
    setNewPassword('');
    setNotifEmail(true);
    setNotifSlack(false);
    toast('Settings reset to system defaults.', 'warning');
  };

  return (
    <AppLayout>
      <PageHeader
        title="SaaS Configuration Settings"
        description="Configure admin profile credentials, company registers, security codes, and notification webhooks."
        breadcrumbs={['EcoSphere', 'Settings']}
      />

      <div className="space-y-8 max-w-4xl">
        {/* Profile & Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-4 border-border">
            <h3 className="text-base font-bold tracking-tight text-foreground border-b border-border pb-3 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-primary" />
              UserProfile Details
            </h3>
            <FormInput
              label="Full Name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              id="profile-name"
            />
            <FormInput
              label="Professional Email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              id="profile-email"
              type="email"
            />
          </Card>

          <Card className="space-y-4 border-border">
            <h3 className="text-base font-bold tracking-tight text-foreground border-b border-border pb-3 flex items-center gap-2">
              <Building className="h-4.5 w-4.5 text-primary" />
              Company Ledger Info
            </h3>
            <FormInput
              label="Registered Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              id="company-name"
            />
            <FormInput
              label="Corporate Tax Registration No"
              value={companyTax}
              onChange={(e) => setCompanyTax(e.target.value)}
              id="company-tax"
            />
          </Card>
        </div>

        {/* UI Preferences & Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-4 border-border">
            <h3 className="text-base font-bold tracking-tight text-foreground border-b border-border pb-3 flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-primary" />
              Notification Preferences
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifEmail}
                  onChange={(e) => setNotifEmail(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                />
                <span className="text-xs font-semibold text-foreground/80">Receive Weekly Summary Email Alerts</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifSlack}
                  onChange={(e) => setNotifSlack(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                />
                <span className="text-xs font-semibold text-foreground/80">Forward AI recommendations to Slack</span>
              </label>
            </div>

            <div className="pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Language Setting</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-lg text-xs font-semibold p-2.5 outline-none text-foreground"
              >
                <option value="en">English (US)</option>
                <option value="es">Español (ES)</option>
                <option value="de">Deutsch (DE)</option>
                <option value="fr">Français (FR)</option>
              </select>
            </div>
          </Card>

          <Card className="space-y-4 border-border">
            <h3 className="text-base font-bold tracking-tight text-foreground border-b border-border pb-3 flex items-center gap-2">
              <Shield className="h-4.5 w-4.5 text-primary" />
              Theme Preference
            </h3>
            <div className="space-y-3 pt-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose the visual layout mode for your EcoSphere dashboard display.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'} 
                  onClick={() => setTheme('dark')}
                  className="text-xs flex-1 h-9 font-semibold"
                >
                  Dark UI Theme
                </Button>
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'} 
                  onClick={() => setTheme('light')}
                  className="text-xs flex-1 h-9 font-semibold"
                >
                  Light UI Theme
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Security & Credentials */}
        <Card className="space-y-6 border-border">
          <h3 className="text-base font-bold tracking-tight text-foreground border-b border-border pb-3 flex items-center gap-2">
            <Key className="h-4.5 w-4.5 text-primary" />
            Security & API Integrations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Change Password</h4>
              <FormInput
                label="Current Password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                id="old-password"
              />
              <FormInput
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                id="new-password"
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">API Token Access</h4>
              <FormInput
                label="Odoo ERP Hook Token"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                id="api-key"
              />
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                Use this endpoint key to authenticate direct data syncs from your internal Odoo ERP backend servers. Keep this private.
              </p>
            </div>
          </div>
        </Card>

        {/* Actions Button Bar */}
        <div className="flex items-center justify-between border-t border-border pt-6">
          <Button variant="ghost" onClick={handleResetDefaults} className="text-xs font-semibold">
            Reset to System Defaults
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => toast('Changes discarded.', 'warning')} className="text-xs font-semibold h-10">
              Cancel Changes
            </Button>
            <Button onClick={handleSaveSettings} loading={isSaving} className="text-xs font-semibold h-10">
              Save Config Settings
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
