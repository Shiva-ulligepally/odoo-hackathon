'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Monitor, Bell, Menu, Flame, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '@/utils/format';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notifications = [
    {
      id: 'n-01',
      title: 'Scope 1 Audit Approaching',
      desc: 'Annual greenhouse gas audit submission is due on July 25.',
      time: '2026-07-12T09:15:00Z',
      type: 'E',
      unread: true,
    },
    {
      id: 'n-02',
      title: 'Critical Vendor Flagged',
      desc: 'Tier 1 supplier Delta Energy Services marked non-compliant in ethics checklist.',
      time: '2026-07-11T14:22:00Z',
      type: 'S',
      unread: true,
    },
    {
      id: 'n-03',
      title: 'Audit Trail Ledger Updated',
      desc: 'System successfully completed whistleblower and board transparency checks.',
      time: '2026-07-10T11:05:00Z',
      type: 'G',
      unread: false,
    },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md transition-all duration-200">
      <div className="flex h-16 items-center justify-between px-6">
        
        {/* Left Side: Brand and Mobile Toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent">
              EcoSphere AI
            </span>
          </div>
        </div>

        {/* Right Side: Theme switcher, notifications, user avatar */}
        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          
          {/* Notifications Trigger */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative text-muted-foreground hover:text-foreground transition-colors ${showNotifications ? 'text-foreground bg-accent' : ''}`}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </Button>

            {/* Notifications Dropdown Panel */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card p-4 shadow-2xl z-50 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-sm font-bold text-foreground">Alerts & Notifications</span>
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      2 Unread
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto divide-y divide-border">
                    {notifications.map((n) => (
                      <div key={n.id} className="pt-3 first:pt-0 flex gap-3 items-start text-left">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                          n.type === 'E' 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                            : n.type === 'S' 
                            ? 'bg-sky-500/10 text-sky-600 border-sky-500/20' 
                            : 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                        }`}>
                          {n.type === 'E' ? (
                            <Flame className="h-4 w-4" />
                          ) : n.type === 'S' ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <ShieldCheck className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <h5 className={`text-xs font-bold ${n.unread ? 'text-foreground' : 'text-foreground/80'}`}>
                            {n.title}
                          </h5>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            {n.desc}
                          </p>
                          <span className="text-[9px] font-medium text-muted-foreground/60">
                            {formatDate(n.time)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-2 border-t border-border">
                    <Button variant="ghost" size="sm" className="w-full text-xs font-bold hover:bg-accent/40" onClick={() => setShowNotifications(false)}>
                      Dismiss All Alerts
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center bg-muted/60 rounded-lg p-0.5 border border-border">
            <Button
              variant={theme === 'light' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7 rounded-md p-0"
              onClick={() => setTheme('light')}
              title="Light Mode"
            >
              <Sun className="h-4 w-4" />
            </Button>
            <Button
              variant={theme === 'dark' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7 rounded-md p-0"
              onClick={() => setTheme('dark')}
              title="Dark Mode"
            >
              <Moon className="h-4 w-4" />
            </Button>
            <Button
              variant={theme === 'system' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7 rounded-md p-0"
              onClick={() => setTheme('system')}
              title="System Theme"
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center text-sm shadow-sm select-none">
              AD
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-sm font-semibold leading-none">Aditya</span>
              <span className="text-xs text-muted-foreground mt-0.5">ESG Director</span>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
