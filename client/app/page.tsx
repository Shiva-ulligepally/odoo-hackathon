'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, ShieldCheck, Users, FileText, Zap, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const stats = [
    { value: '37,600', unit: 'tCO2e', label: 'Emissions Monitored' },
    { value: '94.5%', unit: '', label: 'Supplier Compliance' },
    { value: '100%', unit: '', label: 'Anti-Corruption Audit' },
    { value: 'A-', unit: '', label: 'ESG Composite Rating' },
  ];

  const features = [
    {
      title: 'Carbon Accounting Ledger',
      desc: 'Autonomous Scope 1, 2, and 3 carbon accounting integrated directly with enterprise resource planning databases.',
      icon: Flame,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'ESG Digital Twin Map',
      desc: 'Interact with company departments, personnel assets, and compliance guidelines using live relational React Flow node structures.',
      icon: Users,
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    },
    {
      title: 'Auditable Reporting Systems',
      desc: 'One-click GRI, CSDR, and carbon disclosure generation certified by regulatory compliance check sheets.',
      icon: FileText,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30 selection:text-emerald-400 overflow-x-hidden">
      
      {/* Brand Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              EcoSphere AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-xs font-semibold hover:bg-white/5 text-slate-300">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400">
              <Link href="/dashboard">Launch Platform</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-6 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent -z-10" />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto space-y-6"
        >
          <motion.span 
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400"
          >
            <Zap className="h-3 w-3" />
            Autonomous ESG Operating System
          </motion.span>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight"
          >
            Observe, Reason & Optimize <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 bg-clip-text text-transparent">
              Your Corporate ESG Output
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            EcoSphere AI monitors scope carbon loads, supplier ethics, and compliance risk factors across your assets—generating predictive insights and autonomous offset proposals.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="text-xs text-emerald-400/80 uppercase tracking-widest font-bold font-mono py-1 select-none"
          >
            Observe → Verify → Reason → Predict → Recommend → Improve
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center gap-4 pt-2"
          >
            <Button asChild className="font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 gap-1.5 px-6 h-11">
              <Link href="/dashboard">
                Explore Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="font-semibold border-white/10 hover:bg-white/5 h-11 px-6 text-slate-300">
              <Link href="/login">Authenticate Demo</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Dashboard Mockup Display */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
          className="mt-16 md:mt-20 rounded-2xl border border-white/10 bg-slate-900/50 p-2 shadow-2xl backdrop-blur-md relative group overflow-hidden max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-teal-500/10 pointer-events-none" />
          <Image
            src="/dashboard_mockup.png"
            alt="EcoSphere AI Dashboard Platform Mockup"
            width={1200}
            height={675}
            priority
            className="rounded-xl w-full object-cover"
          />
        </motion.div>
      </section>

      {/* Statistics Row */}
      <section className="border-y border-white/5 bg-slate-950/45 py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center space-y-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  {stat.value}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-400 block tracking-widest uppercase">
                  {stat.unit} {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-24 max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <h2 className="text-3xl font-bold tracking-tight">Full ESG Lifecycle Automation</h2>
          <p className="text-sm text-slate-400">All pillar operations linked into a unified, secure analytical twin.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="border border-white/5 bg-slate-900/30 rounded-2xl p-6 space-y-4 hover:border-emerald-500/20 transition-all duration-300">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center border shrink-0 ${feat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-100">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">E</span>
            </div>
            <span className="font-bold text-sm text-slate-200">EcoSphere AI</span>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} EcoSphere AI Inc. Autonomous ESG compliance platforms. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
