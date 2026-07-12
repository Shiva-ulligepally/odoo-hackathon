'use client';

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Monitor, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { theme, setTheme } = useTheme();

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
        <div className="flex items-center gap-4">
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </Button>

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
            <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center text-sm shadow-sm">
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
