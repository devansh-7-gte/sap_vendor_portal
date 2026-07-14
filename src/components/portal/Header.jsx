'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { usePortal } from '@/lib/portal-context';

export default function Header() {
  const { sidebarCollapsed, setSidebarCollapsed } = usePortal();

  return (
    <header className="h-11 bg-surface text-text-primary border-b border-border px-4 flex items-center justify-between shrink-0 select-none z-10">
      {/* BRANDING SECTION */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-text-tertiary hover:text-text-primary transition-colors duration-150 cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="size-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md flex items-center justify-center text-white font-extrabold text-sm shrink-0" style={{ backgroundColor: 'rgb(var(--color-emerald-default-rgb))' }}>
            V
          </div>
          <div>
            <h1 className="font-bold text-[13px] leading-tight tracking-wide text-text-primary">VendorConnect Portal</h1>
            <p className="text-[9px] text-text-tertiary font-mono tracking-wider uppercase">
              ENTERPRISE INTEGRATED &bull; GST COMPLIANT &bull; INDIA
            </p>
          </div>
        </div>
      </div>

      {/* METADATA CAPSULES */}
      <div className="flex items-center gap-1.5">
        <span className="chip bg-surface2 text-text-secondary">
          Indian Enterprise
        </span>
        <span className="chip bg-surface2 text-text-secondary flex items-center gap-1">
          <span className="status-dot status-dot-active"></span>
          ERP CONNECTED
        </span>
        <span className="chip bg-surface2 text-text-secondary">
          GST + TDS + MSME
        </span>
      </div>
    </header>
  );
}
