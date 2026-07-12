'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Leaf, 
  Users, 
  Scale, 
  Cpu, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Gamepad
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Carbon Accounting', href: '/carbon', icon: Leaf },
    { name: 'Social & CSR', href: '/csr', icon: Users },
    { name: 'Corporate Governance', href: '/governance', icon: Scale },
    { name: 'ESG Digital Twin', href: '/digital-twin', icon: Cpu },
    { name: 'Gamification', href: '/gamification', icon: Gamepad },
    { name: 'Reports & Audits', href: '/reports', icon: FileText },
  ];

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card text-card-foreground transition-all duration-300 md:sticky md:top-16 md:h-[calc(100vh-4rem)]',
        isCollapsed ? 'w-16' : 'w-64',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
    >
      {/* Sidebar Navigation Items */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
        
        {/* Toggle Collapse Button for Desktop */}
        <div className="hidden md:flex justify-end px-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href) || (item.href === '/dashboard' && pathname === '/');
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative',
                  isActive 
                    ? 'bg-primary/10 text-primary hover:bg-primary/15' 
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={cn(
                  'h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )} />
                
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 scale-0 rounded bg-popover border border-border px-2 py-1 text-xs text-popover-foreground group-hover:scale-100 transition-all duration-150 z-50 whitespace-nowrap shadow-lg">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Settings Area */}
      <div className="p-3 border-t border-border">
        <Link
          href="/settings"
          onClick={onClose}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all group relative'
          )}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="h-5 w-5 group-hover:rotate-45 transition-transform duration-300" />
          {!isCollapsed && <span>Settings</span>}
          {isCollapsed && (
            <div className="absolute left-14 top-1/2 -translate-y-1/2 scale-0 rounded bg-popover border border-border px-2 py-1 text-xs text-popover-foreground group-hover:scale-100 transition-all duration-150 z-50 whitespace-nowrap shadow-lg">
              Settings
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
