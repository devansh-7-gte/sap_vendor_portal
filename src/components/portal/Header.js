'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { usePortal } from '@/lib/portal-context';

export default function Header() {
  const { sidebarCollapsed, setSidebarCollapsed } = usePortal();

  return (
    <header className="h-11 bg-primary text-white border-b border-primary/50 px-4 flex items-center justify-between shrink-0 select-none z-10 shadow-md">
      {/* BRANDING SECTION */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-white/80 hover:text-white transition-colors cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="size-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="size-7 rounded bg-white flex items-center justify-center text-primary font-extrabold text-sm border border-white/20 shadow-sm">
            V
          </div>
          <div>
            <h1 className="font-bold text-[13px] leading-tight tracking-wide text-white">VendorConnect Portal</h1>
            <p className="text-[8px] text-white/70 font-mono tracking-wider uppercase">
              ENTERPRISE INTEGRATED &bull; GST COMPLIANT &bull; INDIA
            </p>
          </div>
        </div>
      </div>

      {/* METADATA CAPSULES */}
      <div className="flex items-center gap-1.5">
        <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded border border-white/20 bg-white/10 text-white">
          Indian Enterprise
        </span>
        <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded border border-white/20 bg-white/10 text-white flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-green-400 animate-pulse"></span>
          ERP CONNECTED
        </span>
        <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded border border-white/20 bg-white/10 text-white">
          GST + TDS + MSME
        </span>
      </div>
    </header>
  );
}
