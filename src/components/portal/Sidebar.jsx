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
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
        className={`w-full flex items-center text-[11px] transition-all duration-150 relative cursor-pointer ${
          sidebarCollapsed ? 'justify-center px-0 py-2' : 'gap-2 px-3 py-1.5 text-left'
        } ${
          isActive
            ? 'bg-blue-100/60 text-blue-900 font-bold border-l-[3px] border-primary rounded-l-none'
            : 'text-stone-600 hover:text-blue-900 hover:bg-blue-50/50'
        }`}
      >
        <Icon className={`size-4 shrink-0 ${isActive ? 'text-primary' : 'text-stone-400'}`} />
        {!sidebarCollapsed && <span>{item.name}</span>}
        
        {/* Dynamic Badge counts */}
        {mounted && item.id === 'pos' && state.pos.filter(p => p.status === 'Open').length > 0 && (
          <span className={sidebarCollapsed
            ? "absolute top-1 right-3.5 size-4 rounded-full bg-primary text-white text-[8px] flex items-center justify-center font-bold"
            : "ml-auto size-4.5 rounded-full bg-blue-50 text-primary border border-blue-200 text-[9px] flex items-center justify-center font-bold"
          }>
            {state.pos.filter(p => p.status === 'Open').length}
          </span>
        )}
        {mounted && item.id === 'rfqs' && state.rfqs.filter(r => r.status === 'Bidding Open').length > 0 && (
          <span className={sidebarCollapsed
            ? "absolute top-1 right-3.5 size-4 rounded-full bg-primary text-white text-[8px] flex items-center justify-center font-bold"
            : "ml-auto size-4.5 rounded-full bg-blue-50 text-primary border border-blue-200 text-[9px] flex items-center justify-center font-bold"
          }>
            {state.rfqs.filter(r => r.status === 'Bidding Open').length}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className={`bg-sidebar border-r border-border flex flex-col shrink-0 select-none h-full transition-all duration-300 ease-in-out ${
      sidebarCollapsed ? 'w-16' : 'w-48'
    }`}>
      {/* NAVIGATION SECTION */}
      <div className={`px-2 pt-2.5 ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
        {!sidebarCollapsed ? (
          <p className="text-[9px] tracking-wider text-stone-500 font-bold uppercase mb-1.5 px-2">
            NAVIGATION
          </p>
        ) : (
          <div className="h-4 w-full border-b border-border mb-4" />
        )}
        <nav className="space-y-1 w-full">
          {navigationItems.map(renderLink)}
        </nav>
      </div>

      {/* MODULES SECTION */}
      <div className={`flex-1 px-2.5 pt-3 overflow-y-auto custom-scrollbar ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
        {!sidebarCollapsed ? (
          <p className="text-[9px] tracking-wider text-stone-500 font-bold uppercase mb-1.5 px-2">
            MODULES
          </p>
        ) : (
          <div className="h-4 w-full border-b border-border mb-4" />
        )}
        <nav className="space-y-1 w-full">
          {moduleItems.map(renderLink)}
        </nav>
      </div>

      {/* VENDOR PROFILE BOX */}
      <div className={`p-3 pb-8 border-t border-border bg-card flex flex-col gap-2 ${sidebarCollapsed ? 'items-center' : ''}`}>
        <div className="flex items-center gap-2 w-full justify-center">
          <div className="size-7 rounded-full bg-muted flex items-center justify-center text-primary border border-border shrink-0">
            <Building2 className="size-3.5" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden min-w-0 flex-1">
              <h4 className="text-[10px] font-bold text-foreground truncate" title={(mounted && state.profile.companyName) || 'Guest Vendor'}>
                {(mounted && state.profile.companyName) || 'Guest Vendor'}
              </h4>
              <p className="text-[9px] text-muted-foreground font-mono truncate">
                {(mounted && state.profile.sapVendorCode) || 'Pending Master'}
              </p>
            </div>
          )}
        </div>

        {/* Database Clean Reset Trigger */}
        {sidebarCollapsed ? (
          <button
            onClick={onReset}
            className="text-muted-foreground hover:text-destructive flex items-center justify-center p-1.5 rounded hover:bg-muted cursor-pointer mt-0.5"
            title="Reset ERP Database"
          >
            <Database className="size-4" />
          </button>
        ) : (
          <button
            onClick={onReset}
            className="text-left text-[9px] font-mono text-destructive hover:text-red-700 hover:underline flex items-center gap-0.5 mt-0.5 cursor-pointer"
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
