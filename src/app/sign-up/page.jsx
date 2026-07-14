'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, KeyRound, Mail, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [vendorId, setVendorId] = useState(`mock_vendor_${Math.floor(10000 + Math.random() * 90000)}`);
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  
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

  const generateNewId = () => {
    setVendorId(`mock_vendor_${Math.floor(10000 + Math.random() * 90000)}`);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Pre-validate GSTIN and PAN structure before submitting
    const gstinRegex = /^[0-9]{2}[A-Z0-9]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
    const panRegex = /^[A-Z0-9]{5}[0-9]{4}[A-Z]{1}$/i;

    if (!gstinRegex.test(gstin)) {
      setError('Invalid GSTIN format. Example: 27AAAAA1111A1Z1');
      return;
    }
    if (!panRegex.test(pan)) {
      setError('Invalid PAN format. Example: AAAAA1111A');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          companyName,
          email,
          password,
          gstin,
          pan
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || Object.values(data.errors || {})[0] || 'Registration failed');
      }

      // Save credentials and token
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('clerk_user_id', data.vendor.vendorId);
      localStorage.setItem('sap_vendor_profile_data', JSON.stringify(data.vendor));

      // Route to dashboard
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[460px] p-8 rounded-xl border border-stone-800 bg-stone-900/60 backdrop-blur-xl shadow-2xl animate-fade-in my-8">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="size-12 rounded-lg bg-blue-600 flex items-center justify-center text-white mb-3 shadow-lg border border-blue-500/25">
          <Building2 className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-stone-100 tracking-wide font-sans">Register Vendor Partner</h2>
        <p className="text-[10px] text-stone-400 font-mono tracking-wider uppercase mt-1">
          ONBOARDING WIZARD &bull; ERP SYNCHRONIZED
        </p>
      </div>

      {/* Error Output */}
      {error && (
        <div className="p-3 mb-4 rounded bg-red-950/40 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-400">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Onboarding Form */}
      <form onSubmit={handleRegister} className="space-y-3.5">
        <div className="grid grid-cols-1 gap-3.5">
          {/* Vendor ID Field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[9px] font-mono tracking-wider text-stone-400 uppercase font-semibold">
                Suggested Vendor ID
              </label>
              <button
                type="button"
                onClick={generateNewId}
                className="text-[9px] font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-0.5 cursor-pointer"
              >
                <Sparkles className="size-2.5" />
                <span>Re-generate</span>
              </button>
            </div>
            <input
              type="text"
              required
              disabled={loading}
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full h-9 px-3 rounded border border-stone-800 bg-stone-950 text-stone-200 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50 transition-all disabled:opacity-55"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-[9px] font-mono tracking-wider text-stone-400 uppercase mb-1 font-semibold">
              Company Registered Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={loading}
                placeholder="e.g. Acme Manufacturing Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-9 px-3 pl-8.5 rounded border border-stone-800 bg-stone-950 text-stone-200 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50 transition-all"
              />
              <Building2 className="absolute left-2.5 top-2.5 size-3.5 text-stone-600" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[9px] font-mono tracking-wider text-stone-400 uppercase mb-1 font-semibold">
              Corporate Contact Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                disabled={loading}
                placeholder="partner@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 px-3 pl-8.5 rounded border border-stone-800 bg-stone-950 text-stone-200 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50 transition-all"
              />
              <Mail className="absolute left-2.5 top-2.5 size-3.5 text-stone-600" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[9px] font-mono tracking-wider text-stone-400 uppercase mb-1 font-semibold">
              Create Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                disabled={loading}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-9 px-3 pl-8.5 rounded border border-stone-800 bg-stone-950 text-stone-200 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50 transition-all"
              />
              <KeyRound className="absolute left-2.5 top-2.5 size-3.5 text-stone-600" />
            </div>
          </div>

          {/* GSTIN & PAN Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-mono tracking-wider text-stone-400 uppercase mb-1 font-semibold">
                GSTIN Number (India)
              </label>
              <input
                type="text"
                required
                disabled={loading}
                placeholder="27AAAAA1111A1Z1"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full h-9 px-3 rounded border border-stone-800 bg-stone-950 text-stone-200 text-xs focus:outline-none focus:border-blue-600 uppercase transition-all"
              />
            </div>
            <div>
              <label className="block text-[9px] font-mono tracking-wider text-stone-400 uppercase mb-1 font-semibold">
                PAN Number
              </label>
              <input
                type="text"
                required
                disabled={loading}
                placeholder="AAAAA1111A"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                className="w-full h-9 px-3 rounded border border-stone-800 bg-stone-950 text-stone-200 text-xs focus:outline-none focus:border-blue-600 uppercase transition-all"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-9 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-900/20 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Verifying and Onboarding...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer login redirect */}
      <div className="mt-6 pt-5 border-t border-stone-800/85 text-center">
        <p className="text-[11px] text-stone-500">
          Already registered?{' '}
          <Link
            href="/sign-in"
            className="text-blue-500 hover:text-blue-400 hover:underline transition-colors font-medium ml-1"
          >
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
