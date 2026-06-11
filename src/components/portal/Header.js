'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { usePortal } from '@/lib/portal-context';

export default function Header() {
  const { sidebarCollapsed, setSidebarCollapsed } = usePortal();

  return (
    <header className="h-16 bg-gradient-to-r from-blue-950 to-stone-900 text-stone-50 border-b border-stone-800 px-6 flex items-center justify-between shrink-0 shadow-md select-none z-10">
      {/* BRANDING SECTION */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-stone-400 hover:text-white transition-colors cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="size-6" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-blue-900/40 flex items-center justify-center text-blue-100 font-bold text-lg shadow-sm border border-blue-800/60">
            V
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-wide text-white">VendorConnect Portal</h1>
            <p className="text-[10px] text-blue-300/80 font-mono tracking-wider uppercase">
              SAP INTEGRATED &bull; GST COMPLIANT &bull; INDIA
            </p>
          </div>
        </div>
      </div>

      {/* METADATA CAPSULES */}
      <div className="flex items-center gap-3">
        <span className="px-3.5 py-1 text-[11px] font-semibold rounded-md border border-blue-900/40 bg-blue-950/30 text-blue-200">
          Indian Enterprise
        </span>
        <span className="px-3.5 py-1 text-[11px] font-semibold rounded-md border border-blue-900/40 bg-blue-950/30 text-blue-200 flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          SAP S/4HANA
        </span>
        <span className="px-3.5 py-1 text-[11px] font-semibold rounded-md border border-blue-900/40 bg-blue-950/30 text-blue-200">
          GST + TDS + MSME
        </span>
      </div>
    </header>
  );
}
