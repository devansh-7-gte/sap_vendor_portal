import React, { useState, useEffect } from 'react';
import { usePortal } from '@/lib/portal-context';
import {
  FileText,
  ShoppingBag,
  Receipt,
  CreditCard,
  MessageSquare,
  Activity,
  Download,
  AlertTriangle,
  Calendar,
  Sparkles,
  ChevronRight,
  FileCheck,
  RefreshCw,
  Wifi,
  WifiOff,
  FolderOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function DashboardView({ state, setActiveTab }) {
  const portal = usePortal();

  // Local simulated production state flags
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Auto-clear loading state after 1.2s to demonstrate skeleton states
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Sync calculations from store data
  const openPOList = (state.pos || []).filter(p => p.status === 'Open' || p.status === 'Acknowledged');
  const openPOCount = openPOList.length;
  const openPOTotalValue = openPOList.reduce((sum, po) => sum + (po.items || []).reduce((s, i) => s + i.netValue, 0), 0);

  const pendingInvoices = (state.grns || []).filter(g => !g.invoiceSubmitted);
  const pendingInvoicesCount = pendingInvoices.length;

  const totalSettledPayments = (state.payments || []).reduce((sum, p) => sum + p.amount, 0);

  // Toggle API Error simulation
  const toggleConnection = () => {
    if (apiError) {
      setApiError(null);
    } else {
      setApiError({
        code: 'RFC_ERROR_SYSTEM_FAILURE',
        message: 'RFC connection failed: target host 10.120.4.15 (SAP-ERP-PROD) connection timeout. Target gateway offline.'
      });
    }
  };

  // Re-establish gateway mock trigger
  const handleRetryConnection = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      setApiError(null);
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 800);
    }, 1500);
  };

  // Pull latest POs action trigger
  const handleFetchPOs = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (portal?.poHook?.simulateIncomingPO) {
        portal.poHook.simulateIncomingPO();
      }
    }, 800);
  };

  // Helper function to render a custom illustrative empty state Fiori-style
  const renderEmptyState = (title, description, IconComp, actionText, onAction) => (
    <div className="flex flex-col items-center justify-center p-4 text-center space-y-2.5 min-h-[180px] bg-card border border-border border-dashed rounded animate-fade-in">
      <div className="p-2 bg-muted rounded-full text-muted-foreground">
        <IconComp className="size-5 text-muted-foreground/80" />
      </div>
      <div className="space-y-0.5">
        <h5 className="font-semibold text-xs text-foreground">{title}</h5>
        <p className="text-[10px] text-muted-foreground max-w-[240px] leading-normal">{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-2 py-1 bg-card border border-border text-foreground hover:bg-muted text-[10px] font-bold rounded-sm transition-all cursor-pointer shadow-xs flex items-center gap-1"
        >
          <RefreshCw className="size-2.5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );

  // Helper for rendering skeleton loading shapes
  const renderCardSkeleton = () => (
    <div className="bg-card border border-border rounded-lg p-2.5 shadow-xs flex items-start justify-between animate-pulse">
      <div className="space-y-2 flex-1">
        <div className="h-2.5 bg-muted rounded w-20"></div>
        <div className="h-5 bg-muted rounded w-12"></div>
      </div>
      <div className="size-6 rounded-full bg-muted shrink-0"></div>
    </div>
  );

  // Dynamic Action Alerts generation based on data presence
  const alerts = [];
  if (state.invoices && state.invoices.some(inv => inv.invoiceNumber === 'INV-2025-0084' || inv.no === 'INV-2025-0084')) {
    alerts.push({
      type: 'warning',
      title: 'Invoice Match Discrepancy (INV-2025-0084)',
      desc: 'Line 2 qty variance: 185 KG invoiced vs 200 KG on warehouse GRN document.',
      actionText: 'Resolve Variance',
      tab: 'invoices',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-200'
    });
  }
  if (state.pos && state.pos.length > 0) {
    alerts.push({
      type: 'overdue',
      title: 'Delivery Schedule Overdue (PO-2025-0071)',
      desc: 'PO deadline was 01-Jun-2025. Please update ASN or contact Procurement.',
      actionText: 'Post ASN Status',
      tab: 'pos',
      icon: Calendar,
      iconColor: 'text-red-700 bg-red-50 border-red-200'
    });
  }
  if (state.rfqs && state.rfqs.length > 0) {
    alerts.push({
      type: 'rfq',
      title: 'New RFQ Invitation (RFQ-2025-0041)',
      desc: 'Galvanised coils — 500 MT requirement. Submit your proposal price.',
      actionText: 'Submit Quotation',
      tab: 'rfqs',
      icon: Sparkles,
      iconColor: 'text-blue-700 bg-blue-50 border-blue-200'
    });
  }
  if (state.chats && state.chats.length > 0) {
    alerts.push({
      type: 'message',
      title: 'Clarification Request (PO-2025-0068)',
      desc: 'Amit Sharma requested packaging mill certificates for Cold Rolled sheets.',
      actionText: 'Send Response',
      tab: 'chats',
      icon: MessageSquare,
      iconColor: 'text-muted-foreground bg-muted border-border'
    });
  }

  return (
    <div className="space-y-3 max-w-full animate-fade-in pb-12">

      {/* ERROR STATUS RECOVERY BANNER */}
      {apiError && (
        <div className="bg-red-50/80 border border-red-200 p-3 rounded-lg text-red-955 animate-slide-down shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="size-4 text-red-700 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <h4 className="text-sm font-bold tracking-tight">SAP Gateway Connection Failure ({apiError.code})</h4>
              <p className="text-xs text-red-800 leading-normal font-mono bg-red-100/50 p-1.5 rounded border border-red-200/50">
                {apiError.message}
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                <button
                  onClick={handleRetryConnection}
                  disabled={isRetrying}
                  className="flex items-center gap-1 bg-red-700 hover:bg-red-800 disabled:bg-red-800/80 text-white font-bold text-[9px] px-2.5 py-1 rounded-sm transition-all cursor-pointer shadow-xs select-none"
                >
                  <RefreshCw className={`size-2.5 ${isRetrying ? 'animate-spin' : ''}`} />
                  <span>{isRetrying ? 'Connecting to SAP System...' : 'Reconnect & Retry'}</span>
                </button>
                <button
                  onClick={() => setApiError(null)}
                  className="text-red-800 hover:text-red-955 font-bold text-[9px] hover:underline cursor-pointer"
                >
                  Ignore & Work Offline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP HEADER & MAIN BUTTON ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground select-none">Vendor Dashboard</h2>
          <p className="text-muted-foreground text-[10px] mt-0.5 font-medium">
            Your account overview &mdash; 02 Jun 2025 &bull; FY 2025-26 Q1
          </p>
        </div>
        
        {/* INTERACTIVE STATE CONTROLS */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* SAP GATEWAY SIMULATOR TOGGLE */}
          <button
            onClick={toggleConnection}
            title="Click to toggle SAP ERP Connection state"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-bold transition-all cursor-pointer shadow-xs h-7 ${
              apiError 
                ? 'bg-red-50 border-red-200 text-red-700 animate-pulse hover:bg-red-100'
                : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
            }`}
          >
            {apiError ? <WifiOff className="size-3" /> : <Wifi className="size-3" />}
            <span>SAP: {apiError ? 'Offline' : 'Online'}</span>
          </button>

          <button
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 1200);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-card border border-border text-foreground rounded text-[10px] font-bold hover:bg-muted transition-colors shadow-xs cursor-pointer h-7"
          >
            <RefreshCw className="size-3 text-muted-foreground" />
            <span>Sync</span>
          </button>
          
          <button
            onClick={() => setActiveTab('invoices')}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-primary text-primary-foreground rounded text-[10px] font-bold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer h-7"
          >
            <FileText className="size-3 text-primary-foreground" />
            <span>Submit Invoice</span>
          </button>
        </div>
      </div>

      {/* 2. WELCOME BANNER (Blue-955 Card with Compact Horizontal Actions) */}
      <div className="bg-primary text-primary-foreground rounded-lg p-3 shadow-md border border-primary/30 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-primary-foreground/80 font-bold">WELCOME BACK</p>
          <h3 className="text-xs font-bold text-primary-foreground mt-0.5">
            {state.profile.companyName || 'Bharat Steel & Alloys Pvt. Ltd.'}
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[10px] text-primary-foreground/90">
            <span>Vendor Code: <strong className="font-mono text-primary-foreground">{state.profile.sapVendorCode || 'SAP-100042'}</strong></span>
            <span className="text-primary-foreground/30">|</span>
            <span>GSTIN: <strong className="font-mono text-primary-foreground">{state.profile.gstin || '27AABCB1234F1Z5'}</strong></span>
            <span className="px-1.5 py-0.5 rounded-sm bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 text-[9px] font-bold flex items-center gap-1 font-sans">
              <span className={`size-1 rounded-full ${apiError ? 'bg-red-500' : 'bg-accent animate-pulse'}`}></span>
              {apiError ? 'SAP Offline' : 'Active'}
            </span>
          </div>
        </div>

        {/* QUICK ICON SHORTCUTS (Reduced sizes and tight alignment) */}
        <div className="flex flex-wrap items-center gap-1 border-t border-primary-foreground/15 pt-2 lg:border-t-0 lg:pt-0">
          {[
            { label: 'Submit Invoice', tab: 'invoices', icon: Receipt },
            { label: 'Create ASN', tab: 'pos', icon: ShoppingBag },
            { label: 'View RFQs', tab: 'rfqs', icon: FileText },
            { label: 'Messages', tab: 'chats', icon: MessageSquare },
            { label: 'Statement', tab: 'payments', icon: CreditCard },
            { label: 'TDS Certificates', tab: 'payments', icon: FileCheck }
          ].map((action, idx) => {
            const IconComp = action.icon;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(action.tab)}
                className="flex flex-col items-center justify-center w-16 py-1 rounded hover:bg-primary-foreground/10 transition-colors text-center cursor-pointer text-primary-foreground/90 hover:text-primary-foreground"
              >
                <IconComp className="size-3 mb-0.5 text-primary-foreground/80" />
                <span className="text-[8px] font-bold leading-tight uppercase tracking-tight whitespace-nowrap">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 4 STAT CARDS KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {isLoading ? (
          <>
            {renderCardSkeleton()}
            {renderCardSkeleton()}
            {renderCardSkeleton()}
            {renderCardSkeleton()}
          </>
        ) : (
          <>
            {/* Stat Card 1: Open POs */}
            <div className="bg-card border border-border rounded-lg p-2.5 shadow-xs hover:shadow-sm transition-all flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Open POs</p>
                <p className="text-base font-bold text-foreground font-mono">{openPOCount}</p>
              </div>
              <div className="size-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                <ShoppingBag className="size-3" />
              </div>
            </div>

            {/* Stat Card 2: Pending Invoices */}
            <div className="bg-card border border-border rounded-lg p-2.5 shadow-xs hover:shadow-sm transition-all flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Pending Invoices</p>
                <p className="text-base font-bold text-foreground font-mono">{pendingInvoicesCount}</p>
              </div>
              <div className="size-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                <Receipt className="size-3" />
              </div>
            </div>

            {/* Stat Card 3: Next Payment */}
            <div className="bg-card border border-border rounded-lg p-2.5 shadow-xs hover:shadow-sm transition-all flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Next Payment</p>
                <p className="text-base font-bold text-foreground font-mono">₹{(totalSettledPayments ? (totalSettledPayments * 0.15 / 100000).toFixed(1) : 8.4)}L</p>
              </div>
              <div className="size-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                <CreditCard className="size-3" />
              </div>
            </div>

            {/* Stat Card 4: Performance Score */}
            <div className="bg-card border border-border rounded-lg p-2.5 shadow-xs hover:shadow-sm transition-all flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Performance Score</p>
                <p className="text-base font-bold text-foreground font-mono">{state.performance.deliveryOTIF || 87}<span className="text-[10px] text-muted-foreground font-normal">/100</span></p>
              </div>
              <div className="size-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                <Activity className="size-3" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 4. ALERTS & NOTIFICATIONS (2x2 Grid Panel) */}
      <div className="bg-card border border-border rounded-lg shadow-xs overflow-hidden">
        <div className="px-3.5 py-1.5 border-b border-border flex items-center justify-between uppercase">
          <h4 className="font-semibold text-xs text-foreground tracking-wider">Alerts &amp; Notifications</h4>
          <button
            onClick={() => setActiveTab('chats')}
            className="text-[9px] text-muted-foreground hover:text-foreground hover:underline font-bold flex items-center gap-0.5 cursor-pointer tracking-wider"
          >
            <span>View all</span>
            <ChevronRight className="size-3" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-3 space-y-2 animate-pulse">
            <div className="h-3 bg-muted rounded w-2/3"></div>
            <div className="h-2.5 bg-muted rounded w-1/4"></div>
          </div>
        ) : alerts.length === 0 ? (
          renderEmptyState(
            'All Action Items Cleared',
            'No pending SAP workflow alerts or notifications are registered for your account.',
            CheckCircle2
          )
        ) : (
          /* 2X2 ALERTS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Split alerts into left and right columns */}
            <div className="divide-y divide-border">
              {alerts.slice(0, 2).map((alert, idx) => {
                const Icon = alert.icon;
                return (
                  <div key={idx} className="p-2.5 flex items-start gap-2 hover:bg-muted/50 transition-colors">
                    <div className={`size-5 rounded flex items-center justify-center shrink-0 mt-0.5 border ${alert.iconColor}`}>
                      <Icon className="size-3" />
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-[10px] text-foreground">{alert.title}</h5>
                      <button
                        onClick={() => setActiveTab(alert.tab)}
                        className="text-foreground hover:text-accent font-semibold text-[9px] flex items-center gap-0.5 hover:underline pt-0.5 cursor-pointer uppercase tracking-wider"
                      >
                        <span>{alert.actionText} &rarr;</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="divide-y divide-border">
              {alerts.slice(2, 4).map((alert, idx) => {
                const Icon = alert.icon;
                return (
                  <div key={idx} className="p-2.5 flex items-start gap-2 hover:bg-muted/50 transition-colors">
                    <div className={`size-5 rounded flex items-center justify-center shrink-0 mt-0.5 border ${alert.iconColor}`}>
                      <Icon className="size-3" />
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-[10px] text-foreground">{alert.title}</h5>
                      <button
                        onClick={() => setActiveTab(alert.tab)}
                        className="text-foreground hover:text-accent font-semibold text-[9px] flex items-center gap-0.5 hover:underline pt-0.5 cursor-pointer uppercase tracking-wider"
                      >
                        <span>{alert.actionText} &rarr;</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. SIDE-BY-SIDE: RECENT POs & RECENT INVOICES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">

        {/* RECENT PURCHASE ORDERS */}
        <div className="bg-card border border-border rounded-lg shadow-xs overflow-hidden flex flex-col">
          <div className="px-3.5 py-1.5 border-b border-border flex items-center justify-between uppercase">
            <h4 className="font-semibold text-xs text-foreground tracking-wider">
              Purchase Orders Monitor
            </h4>
            <button
              onClick={() => setActiveTab('pos')}
              className="text-[9px] text-muted-foreground hover:text-foreground hover:underline font-bold cursor-pointer tracking-wider"
            >
              All Orders
            </button>
          </div>
          {isLoading ? (
            <div className="p-3 space-y-3 animate-pulse">
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-8 bg-muted rounded"></div>
            </div>
          ) : !state.pos || state.pos.length === 0 ? (
            renderEmptyState(
              'No Active Purchase Orders',
              'There are no released purchase orders or contracts registered on this Lifnr code.',
              FolderOpen,
              'Simulate PO Inbound',
              handleFetchPOs
            )
          ) : (
            <div className="divide-y divide-border">
              {state.pos.slice(0, 4).map((row, idx) => {
                const badgeStyles = row.status === 'Open' ? 'bg-blue-50/50 text-blue-800 border-blue-200' :
                                    row.status === 'Acknowledged' ? 'bg-emerald-50/50 text-emerald-800 border-emerald-250' :
                                    row.status === 'Dispatched' ? 'bg-amber-50/50 text-amber-800 border-amber-200' :
                                    'bg-muted text-muted-foreground border-border';
                return (
                  <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-6 rounded bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0">
                        <ShoppingBag className="size-3" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-mono font-bold text-foreground cursor-pointer hover:underline text-[11px]" onClick={() => setActiveTab('pos')}>
                          {row.id}
                        </span>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5 font-medium">
                          {row.items?.[0]?.description || 'Material Order'} &bull; {row.items?.[0]?.quantity || 0} {row.items?.[0]?.uom || 'EA'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div>
                        <p className="font-mono font-bold text-foreground text-[11px]">₹{(row.items?.[0]?.netValue || 42500).toLocaleString('en-IN')}.00</p>
                        <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{row.createdDate}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-extrabold border uppercase tracking-wider whitespace-nowrap ${badgeStyles}`}>
                        {row.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RECENT INVOICES */}
        <div className="bg-card border border-border rounded-lg shadow-xs overflow-hidden flex flex-col">
          <div className="px-3.5 py-1.5 border-b border-border flex items-center justify-between uppercase">
            <h4 className="font-semibold text-xs text-foreground tracking-wider">
              Logistics Invoices Ledger
            </h4>
            <button
              onClick={() => setActiveTab('invoices')}
              className="text-[9px] text-muted-foreground hover:text-foreground hover:underline font-bold cursor-pointer tracking-wider"
            >
              All Invoices
            </button>
          </div>
          {isLoading ? (
            <div className="p-3 space-y-3 animate-pulse">
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-8 bg-muted rounded"></div>
            </div>
          ) : !state.invoices || state.invoices.length === 0 ? (
            renderEmptyState(
              'No Invoices Logged',
              'All logistics billing documents cleared. Post a new invoice via MIRO interface.',
              FileText,
              'Submit New Invoice',
              () => setActiveTab('invoices')
            )
          ) : (
            <div className="divide-y divide-border">
              {state.invoices.slice(0, 4).map((row, idx) => {
                const badgeStyles = row.status === 'Approved' ? 'bg-emerald-50/50 text-emerald-800 border-emerald-250' :
                                    row.status === 'Submitted' ? 'bg-blue-50/50 text-blue-800 border-blue-200' :
                                    row.status === 'Match Warning' ? 'bg-red-50/50 text-red-800 border-red-200 animate-pulse font-bold' :
                                    'bg-muted text-muted-foreground border-border';
                return (
                  <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-6 rounded bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0">
                        <Receipt className="size-3" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-mono font-bold text-foreground cursor-pointer hover:underline text-[11px]" onClick={() => setActiveTab('invoices')}>
                          {row.invoiceNumber}
                        </span>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5 font-medium">
                          Ref PO: <strong className="font-mono font-bold">{row.poId}</strong>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div>
                        <p className="font-mono font-bold text-foreground text-[11px]">₹{(row.totalAmount || 52800).toLocaleString('en-IN')}.00</p>
                        <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{row.invoiceDate}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-extrabold border uppercase tracking-wider whitespace-nowrap ${badgeStyles}`}>
                        {row.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 6. SIDE-BY-SIDE: PERFORMANCE BAR INDICATORS & RECENT PAYMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">

        {/* MY PERFORMANCE SCORING BARS */}
        <div className="lg:col-span-5 bg-card border border-border rounded-lg shadow-xs p-3.5 flex flex-col justify-between min-h-[300px]">
          <div>
            <h4 className="font-semibold text-xs text-foreground border-b border-border pb-2 uppercase tracking-wider">
              Service Delivery KPIs (OTIF)
            </h4>

            {isLoading ? (
              <div className="space-y-3 pt-3 animate-pulse">
                <div className="h-5 bg-muted rounded"></div>
                <div className="h-5 bg-muted rounded"></div>
                <div className="h-5 bg-muted rounded"></div>
              </div>
            ) : (
              /* INDICATORS SCALE */
              <div className="space-y-3 pt-3">
                {[
                  { name: 'On-Time In-Full Delivery (OTIF)', score: state.performance.deliveryOTIF || 91, target: 95, icon: '↑', barColor: 'bg-amber-500' },
                  { name: 'Quality Acceptance Rate', score: state.performance.qualityAcceptance || 96, target: 95, icon: '✓', barColor: 'bg-emerald-500' },
                  { name: 'Invoice Billing Accuracy', score: 83, target: 90, icon: '↑', barColor: 'bg-amber-500' },
                  { name: 'Commercial Proposal Response Time', score: 78, target: 85, icon: '↑', barColor: 'bg-red-500' }
                ].map((m, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-foreground">{m.name}</span>
                      <span className="text-muted-foreground">
                        {m.score}% <span className="text-muted-foreground/60 font-normal">/ target {m.target}%</span> <span className="text-xs ml-0.5">{m.icon}</span>
                      </span>
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full border border-border/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${m.barColor}`}
                        style={{ width: `${m.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OVERALL PERFORMANCE CARD SCORE */}
          <div className="mt-3 bg-muted/50 border border-border p-2.5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Overall Score</span>
              <p className="text-base font-bold text-foreground font-mono mt-0.5">
                {state.performance.deliveryOTIF || 87} <span className="text-[10px] font-normal text-muted-foreground/60 font-sans">/ 100</span>
              </p>
            </div>
            <span className="px-2 py-0.5 rounded border border-border bg-muted text-foreground text-[9px] font-semibold uppercase tracking-wider font-sans">
              &#9733;&#9733; Standard
            </span>
          </div>
        </div>

        {/* RECENT PAYMENTS RECEIVED */}
        <div className="lg:col-span-7 bg-card border border-border rounded-lg shadow-xs overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="px-3.5 py-1.5 border-b border-border flex items-center justify-between uppercase">
              <h4 className="font-semibold text-xs text-foreground tracking-wider">
                Treasury Disbursements (Recent)
              </h4>
              <button
                onClick={() => setActiveTab('payments')}
                className="text-[9px] text-muted-foreground hover:text-foreground hover:underline font-bold cursor-pointer tracking-wider"
              >
                Statement
              </button>
            </div>
            {isLoading ? (
              <div className="p-3 space-y-3 animate-pulse">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            ) : !state.payments || state.payments.length === 0 ? (
              renderEmptyState(
                'No Disbursement Logs',
                'No bank transactions found. Payments clear automatically net 45 days post approved invoice posted in SAP.',
                CreditCard
              )
            ) : (
              <div className="divide-y divide-border">
                {state.payments.slice(0, 3).map((row, idx) => {
                  const utr = row.utrCode || row.utr || `UTR${Date.now()}`;
                  const invNumber = row.invoiceNumber || row.id || 'INV-CORP';
                  const method = row.paymentMethod || row.method || 'NEFT';
                  const grossVal = row.grossAmount || (row.amount ? row.amount * 1.01 : 124200);
                  const tdsVal = row.tdsDeducted || (row.amount ? row.amount * 0.01 : 1242);
                  const netVal = row.netAmount || row.amount || 122958;
                  const payDate = row.paymentDate ? new Date(row.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : (row.date || '01-Jun-25');
                  
                  return (
                    <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-6 rounded bg-emerald-50/50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                          <CreditCard className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-mono font-bold text-foreground cursor-pointer hover:underline text-[11px]" onClick={() => setActiveTab('payments')}>
                            {utr}
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                            Inv: <strong className="font-mono font-bold">{invNumber}</strong> &bull; {method}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 shrink-0 text-right">
                        <div className="hidden sm:block text-[9px] text-muted-foreground/80 font-semibold">
                          <p>Gross: <span className="font-mono text-foreground">₹{grossVal.toLocaleString('en-IN')}</span></p>
                          <p>TDS: <span className="font-mono text-destructive">-₹{tdsVal.toLocaleString('en-IN')}</span></p>
                        </div>
                        <div>
                          <p className="font-mono font-bold text-emerald-700 text-[11px]">₹{netVal.toLocaleString('en-IN')}</p>
                          <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{payDate}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACTION BUTTON CLEARING BARS */}
          <div className="p-2.5 bg-muted/50 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('payments')}
              className="flex items-center justify-center gap-1 px-3 py-1 bg-card border border-border text-foreground rounded text-[10px] font-bold hover:bg-muted transition-colors shadow-xs cursor-pointer h-7.5"
            >
              <Download className="size-3 text-muted-foreground" />
              <span>Download Advice</span>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className="flex items-center justify-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded text-[10px] font-bold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer h-7.5"
            >
              <FileCheck className="size-3" />
              <span>Form 16A / TDS</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
