'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { usePortal } from '@/lib/portal-context';

export default function Header() {
  const { sidebarCollapsed, setSidebarCollapsed } = usePortal();

  return (
    <header className="h-16 bg-background text-foreground border-b border-border px-6 flex items-center justify-between shrink-0 select-none z-10">
      {/* BRANDING SECTION */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="size-6" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg border border-border">
            V
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-wide text-foreground">VendorConnect Portal</h1>
            <p className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase">
              SAP INTEGRATED &bull; GST COMPLIANT &bull; INDIA
            </p>
          </div>
        </div>
      </div>

      {/* METADATA CAPSULES */}
      <div className="flex items-center gap-3">
        <span className="px-3.5 py-1 text-[11px] font-semibold rounded-md border border-border bg-card text-foreground">
          Indian Enterprise
        </span>
        <span className="px-3.5 py-1 text-[11px] font-semibold rounded-md border border-border bg-card text-foreground flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          SAP S/4HANA
        </span>
        <span className="px-3.5 py-1 text-[11px] font-semibold rounded-md border border-border bg-card text-foreground">
          GST + TDS + MSME
        </span>
      </div>
    </header>
  );
}
