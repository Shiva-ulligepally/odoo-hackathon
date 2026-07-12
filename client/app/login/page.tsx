'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/forms/FormInput';
import { Key, Mail, Lock, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

type AuthStep = 'login' | 'forgot' | 'otp' | 'reset';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<AuthStep>('login');

  // Input States
  const [email, setEmail] = useState('aditya@ecosphere.ai');
  const [password, setPassword] = useState('password123');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('auth_token', 'mock_token_key');
      toast('Welcome back, Aditya! Authenticated successfully.', 'success');
      router.push('/dashboard');
    }, 1500);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast('Verification OTP code sent to your registered email.', 'success');
      setStep('otp');
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast('Please enter a valid 4-digit code.', 'error');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast('OTP code verified. Set your new access credentials.', 'success');
      setStep('reset');
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast('Passwords do not match.', 'error');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast('Credential codes successfully updated. Sign in to continue.', 'success');
      setStep('login');
    }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              EcoSphere AI
            </span>
          </Link>
        </div>

        {/* Card Panel */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/35 p-8 shadow-2xl backdrop-blur-md">
          <AnimatePresence mode="wait">
            
            {/* LOGIN STEP */}
            {step === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-white">Sign In</h3>
                  <p className="text-xs text-muted-foreground">Access your ESG autonomous operating ledger.</p>
                </div>

                <div className="space-y-4">
                  <FormInput
                    label="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    id="login-email"
                  />
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setStep('forgot')}
                        className="text-xs font-semibold text-primary hover:underline outline-none"
                      >
                        Forgot?
                      </button>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <Button type="submit" loading={isLoading} className="w-full font-bold">
                  Sign In to Platform
                </Button>
              </motion.form>
            )}

            {/* FORGOT PASSWORD STEP */}
            {step === 'forgot' && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleForgotPassword}
                className="space-y-5"
              >
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground outline-none font-semibold"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to login
                </button>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-white">Reset Credentials</h3>
                  <p className="text-xs text-muted-foreground">Enter your corporate email to receive a secure OTP code.</p>
                </div>

                <FormInput
                  label="Registered Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  id="forgot-email"
                />

                <Button type="submit" loading={isLoading} className="w-full font-bold">
                  Send Recovery Code
                </Button>
              </motion.form>
            )}

            {/* OTP VERIFICATION STEP */}
            {step === 'otp' && (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleVerifyOtp}
                className="space-y-5"
              >
                <button
                  type="button"
                  onClick={() => setStep('forgot')}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground outline-none font-semibold"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-white">Verification Code</h3>
                  <p className="text-xs text-muted-foreground">Enter the 4-digit code sent to {email}.</p>
                </div>

                <FormInput
                  label="OTP Code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                  placeholder="0000"
                  required
                  className="text-center tracking-widest text-lg font-bold"
                  id="otp-code"
                />

                <Button type="submit" loading={isLoading} className="w-full font-bold">
                  Verify OTP Code
                </Button>
              </motion.form>
            )}

            {/* PASSWORD RESET STEP */}
            {step === 'reset' && (
              <motion.form
                key="reset"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleResetPassword}
                className="space-y-5"
              >
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-white">Create New Password</h3>
                  <p className="text-xs text-muted-foreground">Choose a new password key for your profile.</p>
                </div>

                <div className="space-y-4">
                  <FormInput
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type="password"
                    required
                    id="new-pass"
                  />
                  <FormInput
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    required
                    id="confirm-pass"
                  />
                </div>

                <Button type="submit" loading={isLoading} className="w-full font-bold">
                  Confirm Password Change
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
