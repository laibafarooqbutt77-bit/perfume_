import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, AlertCircle, KeyRound, Mail } from 'lucide-react';
import { loginAdmin, getFailedAttemptsState } from '../../utils/adminAuth';
import { useSiteContent } from '../../context/SiteContentContext';

interface AdminLoginProps {
  onSuccess: () => void;
  onExitToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onExitToStore }) => {
  const { cms, refreshLogs } = useSiteContent();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lockSeconds, setLockSeconds] = useState<number>(0);

  useEffect(() => {
    const checkLock = () => {
      const state = getFailedAttemptsState();
      if (state.lockedUntil && Date.now() < state.lockedUntil) {
        setLockSeconds(Math.ceil((state.lockedUntil - Date.now()) / 1000));
      } else {
        setLockSeconds(0);
      }
    };
    checkLock();
    const timer = setInterval(checkLock, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || lockSeconds > 0) return;

    setError('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Both Email and Password are required.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await loginAdmin(trimmedEmail, password);
      refreshLogs();
      if (result.ok) {
        setPassword('');
        onSuccess();
      } else {
        setError(result.error);
        if (result.lockedSeconds) {
          setLockSeconds(result.lockedSeconds);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#12110F] text-[#FAF8F5] flex flex-col justify-between p-4 sm:p-6">
      {/* Top navigation strip */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onExitToStore}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#C7BEB2] hover:text-[#D4AF37] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </button>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#A89E92]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Private Admin Access</span>
        </div>
      </div>

      {/* Centered Login Card */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="bg-[#191714] border border-[#2E2922] rounded-xl shadow-2xl overflow-hidden">
          <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-[#29251F] text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#24201A] border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold block">
              {cms.siteSettings.siteName}
            </span>
            <h1 className="font-serif-luxury text-2xl sm:text-3xl text-white font-medium">
              Admin Panel Login
            </h1>
            <p className="text-xs text-[#A89E92]">
              Sign in with your authorized Email and Password to access the Admin Dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5" autoComplete="off">
            {(error || lockSeconds > 0) && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-red-950/50 border border-red-800/60 text-red-200 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>
                  {lockSeconds > 0
                    ? `Login temporarily paused due to failed attempts. Retry in ${lockSeconds}s.`
                    : error}
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="admin-login-email"
                className="block text-[11px] uppercase tracking-[0.16em] font-semibold text-[#D4C8B8]"
              >
                Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8E857B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-login-email"
                  name="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter admin email"
                  disabled={lockSeconds > 0}
                  className="w-full pl-10 pr-3.5 py-3 rounded-lg bg-[#12110F] border border-[#353028] text-sm text-white placeholder-[#736B63] focus:outline-hidden focus:border-[#D4AF37] transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-login-password"
                className="block text-[11px] uppercase tracking-[0.16em] font-semibold text-[#D4C8B8]"
              >
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8E857B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter password"
                  disabled={lockSeconds > 0}
                  className="w-full pl-10 pr-11 py-3 rounded-lg bg-[#12110F] border border-[#353028] text-sm text-white placeholder-[#736B63] focus:outline-hidden focus:border-[#D4AF37] transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#A89E92] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || lockSeconds > 0}
              className="w-full py-3.5 px-6 rounded-lg bg-[#D4AF37] hover:bg-[#E0BE52] text-[#141414] text-xs font-bold uppercase tracking-[0.18em] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{submitting ? 'Signing In...' : 'Sign In to Dashboard'}</span>
            </button>

            <div className="pt-2 border-t border-[#26221D] text-[11px] text-[#8E857B] leading-relaxed text-center">
              Protected by local browser session verification. All edits persist strictly in LocalStorage and IndexedDB.
            </div>
          </form>
        </div>
      </div>

      <div className="text-center text-[11px] text-[#736B63] pb-2">
        {cms.siteSettings.siteName} · Private Management Console
      </div>
    </div>
  );
};
