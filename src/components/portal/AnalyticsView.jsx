import React from 'react';

export default function AnalyticsView({ state }) {
  const totalOrders = state.pos.length;
  const totalPayments = state.payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingInvoicesVal = state.invoices.filter(i => i.status === 'Posted').reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <div className="space-y-8 max-w-6xl animate-fade-in">
      <div>
        <h2 className="text-[22px] font-bold text-text-primary">Procurement Reporting</h2>
        <p className="text-text-tertiary text-xs mt-0.5">Interactive statistics on order flow volumes and outstanding ledger balances.</p>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="metric-panel">
          <span className="label mb-0">Total PO Documents</span>
          <span className="text-xl font-mono font-bold text-text-primary mt-1 block tabular-nums">{totalOrders}</span>
          <span className="text-[10px] text-text-tertiary mt-1 block">Active across order lifecycle</span>
        </div>
        <div className="metric-panel">
          <span className="label mb-0">Completed Settlements</span>
          <span className="text-xl font-mono font-bold text-emerald-text mt-1 block tabular-nums">₹{totalPayments.toLocaleString()}</span>
          <span className="text-[10px] text-text-tertiary mt-1 block">Cleared via weekly runs</span>
        </div>
        <div className="metric-panel">
          <span className="label mb-0">Ledger Outstanding Balance</span>
          <span className="text-xl font-mono font-bold text-amber-500 mt-1 block tabular-nums">₹{pendingInvoicesVal.toLocaleString()}</span>
          <span className="text-[10px] text-text-tertiary mt-1 block">Invoices currently posted for matching</span>
        </div>
      </div>

      {/* CHART PANEL */}
      <div className="card p-6 space-y-4">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider pb-2 border-b border-border">Bimonthly order volume timeline</h3>
        <div className="h-64 flex items-end justify-between gap-6 pt-6 font-mono text-[9px] text-text-tertiary border-b border-l border-border pb-2 pl-2">
          {/* Bar 1 */}
          <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
            <span className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">₹75K</span>
            <div className="w-full bg-emerald-900/30 group-hover:bg-emerald-900/50 border border-emerald-900/50 rounded-none h-[30%] transition-all duration-150"></div>
            <span className="font-sans">Jan-Feb</span>
          </div>
          {/* Bar 2 */}
          <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
            <span className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">₹145K</span>
            <div className="w-full bg-emerald-900/30 group-hover:bg-emerald-900/50 border border-emerald-900/50 rounded-none h-[55%] transition-all duration-150"></div>
            <span className="font-sans">Mar-Apr</span>
          </div>
          {/* Bar 3 */}
          <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
            <span className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">₹210K</span>
            <div className="w-full bg-emerald-900/50 group-hover:bg-emerald-900/70 border border-emerald-900/80 rounded-none h-[80%] transition-all duration-150 animate-grow"></div>
            <span className="font-sans">May-Jun</span>
          </div>
        </div>
      </div>
    </div>
  );
}
