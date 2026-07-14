'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, KeyRound, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [vendorIdOrEmail, setVendorIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        router.push('/');
      }
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!vendorIdOrEmail || !password) {
      setError('Please enter both credentials.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorIdOrEmail, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.errors?.vendorIdOrEmail || data.errors?.password || 'Authentication failed');
      }

      // Save token and profile details
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('clerk_user_id', data.vendor.vendorId);
      localStorage.setItem('sap_vendor_profile_data', JSON.stringify(data.vendor));

      // Redirect to main portal dashboard
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] p-8 rounded-xl border border-stone-800 bg-stone-900/60 backdrop-blur-xl shadow-2xl animate-fade-in">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="size-12 rounded-lg bg-blue-600 flex items-center justify-center text-white mb-3 shadow-lg border border-blue-500/25">
          <Building2 className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-stone-100 tracking-wide">VendorConnect Portal</h2>
        <p className="text-[10px] text-stone-400 font-mono tracking-wider uppercase mt-1">
          SAP INTEGRATED PARTNER GATEWAY
        </p>
      </div>

      {/* Form Error Message */}
      {error && (
        <div className="p-3 mb-5 rounded bg-red-950/40 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-400">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-[10px] font-mono tracking-wider text-stone-400 uppercase mb-1.5 font-semibold">
            Vendor ID or Registered Email
          </label>
          <div className="relative">
            <input
              type="text"
              required
              disabled={loading}
              placeholder="e.g. VND-40012 or partner@domain.com"
              value={vendorIdOrEmail}
              onChange={(e) => setVendorIdOrEmail(e.target.value)}
              className="w-full h-10 px-3 pl-9 rounded border border-stone-800 bg-stone-950 text-stone-200 text-xs placeholder:text-stone-600 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50 transition-all disabled:opacity-55"
            />
            <Building2 className="absolute left-3 top-3 size-4 text-stone-600" />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-[10px] font-mono tracking-wider text-stone-400 uppercase font-semibold">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              type="password"
              required
              disabled={loading}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 pl-9 rounded border border-stone-800 bg-stone-950 text-stone-200 text-xs placeholder:text-stone-600 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50 transition-all disabled:opacity-55"
            />
            <KeyRound className="absolute left-3 top-3 size-4 text-stone-600" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-900/20"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to Portal</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer onboarding links */}
      <div className="mt-8 pt-6 border-t border-stone-800/80 text-center">
        <p className="text-[11px] text-stone-500">
          New vendor partner?{' '}
          <Link
            href="/sign-up"
            className="text-blue-500 hover:text-blue-400 hover:underline transition-colors font-medium ml-1"
          >
            Register Profile
          </Link>
        </p>
      </div>
    </div>
  );
}
