'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { usePortal } from '@/lib/portal-context';

export default function Header() {
  const { sidebarCollapsed, setSidebarCollapsed } = usePortal();

  return (
    <header className="h-16 bg-stone-950 text-orange-400 border-b border-stone-800 px-6 flex items-center justify-between shrink-0 select-none z-10">
      {/* BRANDING SECTION */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-orange-400/80 hover:text-orange-300 transition-colors cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="size-6" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-orange-400 flex items-center justify-center text-stone-950 font-extrabold text-lg border border-orange-500 shadow-md">
            V
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-wide text-orange-400">VendorConnect Portal</h1>
            <p className="text-[10px] text-orange-500/80 font-mono tracking-wider uppercase">
              SAP INTEGRATED &bull; GST COMPLIANT &bull; INDIA
            </p>
          </div>
        </div>
      </div>

      {/* METADATA CAPSULES */}
      <div className="flex items-center gap-3">
        <span className="px-3.5 py-1 text-[11px] font-semibold rounded-md border border-orange-400/20 bg-stone-900 text-orange-400">
          Indian Enterprise
        </span>
        <span className="px-3.5 py-1 text-[11px] font-semibold rounded-md border border-orange-400/20 bg-stone-900 text-orange-400 flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-orange-400 animate-pulse"></span>
          SAP S/4HANA
        </span>
        <span className="px-3.5 py-1 text-[11px] font-semibold rounded-md border border-orange-400/20 bg-stone-900 text-orange-400">
          GST + TDS + MSME
        </span>
      </div>
    </header>
  );
}
