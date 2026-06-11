import React from 'react';

export default function AnalyticsView({ state }) {
  const totalOrders = state.pos.length;
  const totalPayments = state.payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingInvoicesVal = state.invoices.filter(i => i.status === 'Posted').reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <div className="space-y-8 max-w-6xl animate-fade-in">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900">Procurement Reporting</h2>
        <p className="text-gray-500 text-xs mt-0.5">Interactive statistics on order flow volumes and outstanding ledger balances.</p>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 border border-gray-200 bg-white rounded-xl shadow-sm">
          <span className="text-[10px] text-gray-450 uppercase font-bold tracking-wider block">Total PO Documents</span>
          <span className="text-xl font-mono font-bold text-gray-900 mt-1 block">{totalOrders}</span>
          <span className="text-[10px] text-gray-450 mt-1 block">Active across order lifecycle</span>
        </div>
        <div className="p-5 border border-gray-200 bg-white rounded-xl shadow-sm">
          <span className="text-[10px] text-gray-455 uppercase font-bold tracking-wider block">Completed Settlements</span>
          <span className="text-xl font-mono font-bold text-emerald-650 mt-1 block">₹{totalPayments.toLocaleString()}</span>
          <span className="text-[10px] text-gray-450 mt-1 block">Cleared via weekly runs</span>
        </div>
        <div className="p-5 border border-gray-200 bg-white rounded-xl shadow-sm">
          <span className="text-[10px] text-gray-455 uppercase font-bold tracking-wider block">Ledger Outstanding Balance</span>
          <span className="text-xl font-mono font-bold text-amber-600 mt-1 block">₹{pendingInvoicesVal.toLocaleString()}</span>
          <span className="text-[10px] text-gray-450 mt-1 block">Invoices currently posted for matching</span>
        </div>
      </div>

      {/* CHART PANEL */}
      <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-100">Bimonthly order volume timeline</h3>
        <div className="h-64 flex items-end justify-between gap-6 pt-6 font-mono text-[9px] text-gray-400 border-b border-l border-gray-200 pb-2 pl-2">
          {/* Bar 1 */}
          <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
            <span className="text-gray-650 opacity-0 group-hover:opacity-100 transition-opacity">₹75K</span>
            <div className="w-full bg-emerald-500/10 group-hover:bg-emerald-500/30 border border-emerald-500/20 rounded-t h-[30%] transition-all"></div>
            <span className="font-sans">Jan-Feb</span>
          </div>
          {/* Bar 2 */}
          <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
            <span className="text-gray-650 opacity-0 group-hover:opacity-100 transition-opacity">₹145K</span>
            <div className="w-full bg-emerald-500/10 group-hover:bg-emerald-500/30 border border-emerald-500/20 rounded-t h-[55%] transition-all"></div>
            <span className="font-sans">Mar-Apr</span>
          </div>
          {/* Bar 3 */}
          <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
            <span className="text-gray-650 opacity-0 group-hover:opacity-100 transition-opacity">₹210K</span>
            <div className="w-full bg-[#22c55e]/25 group-hover:bg-[#22c55e]/50 border border-[#22c55e]/30 rounded-t h-[80%] transition-all animate-grow"></div>
            <span className="font-sans">May-Jun</span>
          </div>
        </div>
      </div>
    </div>
  );
}
