'use client';

import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  FileText,
  ShoppingBag,
  Receipt,
  CreditCard,
  MessageSquare,
  Activity,
  BarChart3,
  Building2,
  Database
} from 'lucide-react';
import { usePortal } from '@/lib/portal-context';

export default function Sidebar({ activeTab, setActiveTab, state, onReset }) {
  const { sidebarCollapsed } = usePortal();

  const navigationItems = [
    { id: 'dashboard', name: 'Vendor Dashboard', icon: LayoutDashboard }
  ];

  const moduleItems = [
    { id: 'registration', name: 'Vendor Registration', icon: UserCheck },
    { id: 'rfqs', name: 'RFQ Management', icon: FileText },
    { id: 'pos', name: 'Purchase Orders', icon: ShoppingBag },
    { id: 'invoices', name: 'Invoice Processing', icon: Receipt },
    { id: 'payments', name: 'Payment Tracking', icon: CreditCard },
    { id: 'chats', name: 'Communications', icon: MessageSquare },
    { id: 'performance', name: 'Performance', icon: Activity },
    { id: 'analytics', name: 'Reports & Analytics', icon: BarChart3 }
  ];

  const renderLink = (item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        title={sidebarCollapsed ? item.name : undefined}
        className={`w-full flex items-center rounded-lg text-sm transition-all duration-150 relative ${
          sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-4 py-2.5 text-left'
        } ${
          isActive
            ? 'bg-stone-200/60 text-stone-900 font-semibold border-l-4 border-stone-850 rounded-l-none'
            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/30'
        }`}
      >
        <Icon className={`size-4.5 shrink-0 ${isActive ? 'text-stone-800' : 'text-stone-400'}`} />
        {!sidebarCollapsed && <span>{item.name}</span>}
        
        {/* Dynamic Badge counts */}
        {item.id === 'pos' && state.pos.filter(p => p.status === 'Open').length > 0 && (
          <span className={sidebarCollapsed
            ? "absolute top-1 right-3.5 size-4 rounded-full bg-stone-800 text-white text-[8px] flex items-center justify-center font-bold"
            : "ml-auto size-5 rounded-full bg-stone-200 text-stone-700 border border-stone-300 text-[10px] flex items-center justify-center font-bold"
          }>
            {state.pos.filter(p => p.status === 'Open').length}
          </span>
        )}
        {item.id === 'rfqs' && state.rfqs.filter(r => r.status === 'Bidding Open').length > 0 && (
          <span className={sidebarCollapsed
            ? "absolute top-1 right-3.5 size-4 rounded-full bg-stone-800 text-white text-[8px] flex items-center justify-center font-bold"
            : "ml-auto size-5 rounded-full bg-stone-200 text-stone-700 border border-stone-300 text-[10px] flex items-center justify-center font-bold"
          }>
            {state.rfqs.filter(r => r.status === 'Bidding Open').length}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className={`bg-sidebar border-r border-border flex flex-col shrink-0 select-none h-full transition-all duration-300 ease-in-out ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* NAVIGATION SECTION */}
      <div className={`px-4 pt-6 ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
        {!sidebarCollapsed ? (
          <p className="text-[10px] tracking-wider text-stone-400 font-bold uppercase mb-2 px-2">
            NAVIGATION
          </p>
        ) : (
          <div className="h-4 w-full border-b border-stone-200/40 mb-4" />
        )}
        <nav className="space-y-1 w-full">
          {navigationItems.map(renderLink)}
        </nav>
      </div>

      {/* MODULES SECTION */}
      <div className={`flex-1 px-4 pt-6 overflow-y-auto custom-scrollbar ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
        {!sidebarCollapsed ? (
          <p className="text-[10px] tracking-wider text-stone-400 font-bold uppercase mb-2 px-2">
            MODULES
          </p>
        ) : (
          <div className="h-4 w-full border-b border-stone-200/40 mb-4" />
        )}
        <nav className="space-y-1 w-full">
          {moduleItems.map(renderLink)}
        </nav>
      </div>

      {/* VENDOR PROFILE BOX */}
      <div className={`p-4 border-t border-stone-200 bg-stone-100/50 flex flex-col gap-2 ${sidebarCollapsed ? 'items-center' : ''}`}>
        <div className="flex items-center gap-3 w-full justify-center">
          <div className="size-9 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 border border-stone-300 shrink-0">
            <Building2 className="size-4.5" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-stone-900 truncate" title={state.profile.companyName || 'Guest Vendor'}>
                {state.profile.companyName || 'Guest Vendor'}
              </h4>
              <p className="text-[10px] text-stone-500 font-mono truncate">
                {state.profile.sapVendorCode || 'Pending Master'}
              </p>
            </div>
          )}
        </div>

        {/* Database Clean Reset Trigger */}
        {sidebarCollapsed ? (
          <button
            onClick={onReset}
            className="text-stone-400 hover:text-red-750 flex items-center justify-center p-1.5 rounded hover:bg-red-50 cursor-pointer mt-1"
            title="Reset ERP Database"
          >
            <Database className="size-4" />
          </button>
        ) : (
          <button
            onClick={onReset}
            className="text-left text-[10px] font-mono text-red-650/80 hover:text-red-750 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
            title="Reset local state back to defaults"
          >
            <Database className="size-3" />
            <span>Reset ERP Database</span>
          </button>
        )}
      </div>
    </aside>
  );
}
