'use client';

import React from 'react';
import { Search, Sun, Moon } from 'lucide-react';

import { usePortal } from '@/lib/portal-context';
import { useTheme } from '@/lib/theme-context';

export default function Header() {
  const { sidebarCollapsed, setSidebarCollapsed } = usePortal();
  const { theme, toggleTheme, mounted } = useTheme();

  const openPalette = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  return (
    <header className="h-11 bg-surface text-text-primary border-b border-border px-4 flex items-center justify-between shrink-0 select-none z-10">
      {/* BRANDING SECTION */}
      <div className="flex items-center gap-3">

        <div className="flex items-center gap-2">
          <div className="size-7 rounded flex items-center justify-center text-white font-extrabold text-sm shrink-0" style={{ backgroundColor: 'rgb(var(--color-emerald-default-rgb))', color: '#FFFFFF' }}>
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
        <span className="chip bg-surface2 text-text-secondary hidden lg:inline-flex">
          Indian Enterprise
        </span>
        <span className="chip bg-surface2 text-text-secondary flex items-center gap-1">
          <span className="status-dot status-dot-active"></span>
          ERP CONNECTED
        </span>
        <span className="chip bg-surface2 text-text-secondary hidden lg:inline-flex">
          GST + TDS + MSME
        </span>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Command palette trigger */}
        <button
          onClick={openPalette}
          title="Search & commands"
          className="group flex items-center gap-2 h-7 pl-2 pr-1.5 rounded-md border border-border-em bg-surface2/60 text-text-tertiary hover:text-text-primary hover:border-border-em hover:bg-surface2 transition-colors duration-150 cursor-pointer"
        >
          <Search className="size-3.5" />
          <span className="text-[11px] font-medium hidden sm:inline">Search</span>
          <kbd className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-surface border border-border text-text-tertiary group-hover:text-text-secondary">
            Ctrl K
          </kbd>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle color theme"
          className="flex items-center justify-center size-7 rounded-md border border-border-em text-text-tertiary hover:text-text-primary hover:bg-surface2 transition-colors duration-150 cursor-pointer"
        >
          {mounted && theme === 'dark'
            ? <Sun className="size-3.5" />
            : <Moon className="size-3.5" />}
        </button>
      </div>
    </header>
  );
}
