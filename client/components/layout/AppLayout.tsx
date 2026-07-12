'use client';

import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-all duration-200">
      {/* Top Navigation */}
      <Navbar onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)} />

      <div className="flex flex-1 relative">
        {/* Left Side Navigation */}
        <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

        {/* Mobile Sidebar Overlay */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Main Page Area */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 py-6 md:px-8 transition-all duration-300 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
