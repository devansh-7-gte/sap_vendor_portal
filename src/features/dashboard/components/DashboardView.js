import React from 'react';
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
  Landmark
} from 'lucide-react';

export default function DashboardView({ state, setActiveTab }) {
  // Calculated dashboard states based on live store data
  const openPOList = state.pos.filter(p => p.status === 'Open' || p.status === 'Acknowledged');
  const openPOCount = openPOList.length;
  const openPOTotalValue = openPOList.reduce((sum, po) => sum + po.items.reduce((s, i) => s + i.netValue, 0), 0);

  const pendingInvoices = state.grns.filter(g => !g.invoiceSubmitted);
  const pendingInvoicesCount = pendingInvoices.length;

  // Calculate average order value from PO items
  const avgOrderValue = state.pos.length > 0
    ? Math.round(state.pos.reduce((sum, po) => sum + po.items.reduce((s, i) => s + i.netValue, 0), 0) / state.pos.length)
    : 0;

  // Total cleared payment volume
  const totalSettledPayments = state.payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-4 max-w-full animate-fade-in pb-16">

      {/* 1. TOP HEADER & MAIN BUTTON ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 select-none">
            Bharat Steel Vendor Connect
          </h2>
          <p className="text-stone-500 text-[11px] mt-0.5 font-semibold">
            Operational and Financial Ledger Overview &bull; FY 2025-26 Q1
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('payments')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 text-stone-700 rounded-sm text-xs font-bold hover:bg-stone-50 transition-colors shadow-sm cursor-pointer h-9"
          >
            <Download className="size-3.5 text-stone-400" />
            <span>Download Account Statement</span>
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className="flex items-center gap-1.5 px-4.5 py-1.5 bg-primary hover:bg-primary/95 text-white rounded-sm text-xs font-bold transition-colors shadow-sm cursor-pointer h-9"
          >
            <FileText className="size-3.5 text-blue-300" />
            <span>Post Invoice (MIRO)</span>
          </button>
        </div>
      </div>

      {/* 2. WELCOME BANNER (Steel-Blue Fiori Banner) */}
      <div className="bg-primary text-white rounded-sm p-4 shadow-sm border border-primary flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-blue-300 font-extrabold">Enterprise Partner Portal</p>
          <h3 className="text-lg font-bold text-white mt-1">
            {state.profile.companyName || 'Bharat Steel & Alloys Pvt. Ltd.'}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-[11px] text-blue-100">
            <span>SAP Vendor Code: <strong className="font-mono text-white bg-blue-900/40 px-1.5 py-0.5 rounded-sm">{state.profile.sapVendorCode || 'SAP-100042'}</strong></span>
            <span className="text-blue-800">|</span>
            <span>GSTIN: <strong className="font-mono text-white bg-blue-900/40 px-1.5 py-0.5 rounded-sm">{state.profile.gstin || '27AABCB1234F1Z5'}</strong></span>
            <span className="px-2 py-0.5 rounded-sm bg-blue-900 text-blue-300 border border-blue-800 text-[10px] font-extrabold flex items-center gap-1 font-sans uppercase">
              <span className="size-1.5 rounded-full bg-green-400 animate-pulse"></span>
              LIFNR Cleared
            </span>
          </div>
        </div>

        {/* QUICK ICON SHORTCUTS */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-1 bg-blue-900/30 p-1.5 rounded-sm border border-blue-900/40">
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
                className="flex flex-col items-center justify-center w-20 py-2 rounded-sm hover:bg-white/10 transition-colors text-center cursor-pointer text-blue-100 hover:text-white"
              >
                <IconComp className="size-4 mb-1 text-blue-300" />
                <span className="text-[9px] font-extrabold leading-tight uppercase tracking-wider">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 4 STAT CARDS KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card 1: Open POs */}
        <div className="bg-white border border-stone-200 rounded-sm p-3.5 shadow-xs hover:border-stone-300 transition-all flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Open PO Contracts</p>
            <p className="text-2xl font-bold text-stone-900 font-mono">{openPOCount || 12}</p>
            <div className="text-[10px] font-semibold">
              <span className="text-stone-400">Total Value:</span>
              <span className="text-stone-850 font-mono ml-1 font-bold">₹{(openPOTotalValue ? (openPOTotalValue / 100000).toFixed(1) : 48.6)}L</span>
            </div>
          </div>
          <div className="size-8 rounded-sm bg-stone-50 flex items-center justify-center text-stone-600 shrink-0 border border-stone-200">
            <ShoppingBag className="size-4 text-stone-700" />
          </div>
        </div>

        {/* Stat Card 2: Pending Invoices */}
        <div className="bg-white border border-stone-200 rounded-sm p-3.5 shadow-xs hover:border-stone-300 transition-all flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Pending Invoices (AP)</p>
            <p className="text-2xl font-bold text-stone-900 font-mono">{pendingInvoicesCount || 4}</p>
            <div className="text-[10px] font-semibold">
              <span className="text-stone-400">In Process:</span>
              <span className="text-amber-600 font-mono ml-1 font-bold">₹12.3L</span>
            </div>
          </div>
          <div className="size-8 rounded-sm bg-stone-50 flex items-center justify-center text-stone-600 shrink-0 border border-stone-200">
            <Receipt className="size-4 text-stone-700" />
          </div>
        </div>

        {/* Stat Card 3: Next Payment */}
        <div className="bg-white border border-stone-200 rounded-sm p-3.5 shadow-xs hover:border-stone-300 transition-all flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Expected Disbursement</p>
            <p className="text-2xl font-bold text-green-700 font-mono">₹8.4L</p>
            <div className="text-[10px] font-semibold">
              <span className="text-stone-400">Due Date:</span>
              <span className="text-stone-850 font-mono ml-1 font-bold">15-Jun-2025</span>
            </div>
          </div>
          <div className="size-8 rounded-sm bg-stone-50 flex items-center justify-center text-stone-600 shrink-0 border border-stone-200">
            <CreditCard className="size-4 text-stone-700" />
          </div>
        </div>

        {/* Stat Card 4: Performance Score */}
        <div className="bg-white border border-stone-200 rounded-sm p-3.5 shadow-xs hover:border-stone-300 transition-all flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Vendor Performance Score</p>
            <p className="text-2xl font-bold text-stone-900 font-mono">{state.performance.deliveryOTIF || 87}<span className="text-xs text-stone-400 font-normal">/100</span></p>
            <div className="text-[10px] font-semibold">
              <span className="text-stone-400">Vendor Status:</span>
              <span className="text-green-700 font-bold ml-1 uppercase">Preferred</span>
            </div>
          </div>
          <div className="size-8 rounded-sm bg-stone-50 flex items-center justify-center text-stone-600 shrink-0 border border-stone-200">
            <Activity className="size-4 text-stone-700" />
          </div>
        </div>
      </div>

      {/* 4. ALERTS & NOTIFICATIONS */}
      <div className="bg-white border border-stone-200 rounded-sm shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <h4 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider">SAP Workflow Action Items</h4>
          <button
            onClick={() => setActiveTab('chats')}
            className="text-[10px] text-stone-600 hover:text-stone-900 font-bold flex items-center gap-0.5 cursor-pointer uppercase tracking-wider"
          >
            <span>View All Messages</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        {/* 2X2 ALERTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-150">
          <div className="divide-y divide-stone-150">
            {/* ALERT 1 (Match Warning) */}
            <div className="p-3 flex items-start gap-3.5 hover:bg-stone-50/20 transition-colors">
              <div className="size-7 bg-red-50 border border-red-200 rounded-sm flex items-center justify-center text-red-650 shrink-0 mt-0.5">
                <AlertTriangle className="size-4" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-xs text-stone-850">Invoice Match Discrepancy (INV-2025-0084)</h5>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Line 2 quantity mismatch detected: 185 KG invoiced vs 200 KG received on warehouse GRN document.
                </p>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className="text-primary font-bold text-[10px] uppercase tracking-wider flex items-center gap-0.5 hover:underline pt-1 cursor-pointer"
                >
                  <span>Resolve Variance &rarr;</span>
                </button>
              </div>
            </div>

            {/* ALERT 2 (Overdue PO) */}
            <div className="p-3 flex items-start gap-3.5 hover:bg-stone-50/20 transition-colors">
              <div className="size-7 bg-amber-50 border border-amber-250 rounded-sm flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                <Calendar className="size-4" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-xs text-stone-850">Delivery Schedule Overdue (PO-2025-0071)</h5>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  PO schedule deadline was 01-Jun-2025. Material not received at Plant 1000 gate.
                </p>
                <button
                  onClick={() => setActiveTab('pos')}
                  className="text-primary font-bold text-[10px] uppercase tracking-wider flex items-center gap-0.5 hover:underline pt-1 cursor-pointer"
                >
                  <span>Post ASN Status &rarr;</span>
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-stone-150">
            {/* ALERT 3 (New RFQ) */}
            <div className="p-3 flex items-start gap-3.5 hover:bg-stone-50/20 transition-colors">
              <div className="size-7 bg-blue-50 border border-blue-200 rounded-sm flex items-center justify-center text-blue-750 shrink-0 mt-0.5">
                <Sparkles className="size-4" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-xs text-stone-850">New RFQ Invitation (RFQ-2025-0041)</h5>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Fasteners hex Grade 8.8. Standard RFQ document published. Quantity required: 500,000 EA.
                </p>
                <button
                  onClick={() => setActiveTab('rfqs')}
                  className="text-primary font-bold text-[10px] uppercase tracking-wider flex items-center gap-0.5 hover:underline pt-1 cursor-pointer"
                >
                  <span>Submit Proposal Price &rarr;</span>
                </button>
              </div>
            </div>

            {/* ALERT 4 (New Message) */}
            <div className="p-3 flex items-start gap-3.5 hover:bg-stone-50/20 transition-colors">
              <div className="size-7 bg-stone-100 border border-stone-250 rounded-sm flex items-center justify-center text-stone-700 shrink-0 mt-0.5">
                <MessageSquare className="size-4" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-xs text-stone-850">Buyer Clarification (PO-2025-0068)</h5>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Amit Sharma requested packaging dimensions and mill test certificates for Cold Rolled plates.
                </p>
                <button
                  onClick={() => setActiveTab('chats')}
                  className="text-primary font-bold text-[10px] uppercase tracking-wider flex items-center gap-0.5 hover:underline pt-1 cursor-pointer"
                >
                  <span>Send Response &rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SIDE-BY-SIDE: RECENT POs & RECENT INVOICES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* RECENT PURCHASE ORDERS */}
        <div className="bg-white border border-stone-200 rounded-sm shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="px-5 py-3 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider">Purchase Orders Monitor</h4>
            <button
              onClick={() => setActiveTab('pos')}
              className="text-[10px] text-stone-600 hover:text-stone-900 font-bold uppercase tracking-wider"
            >
              All Orders
            </button>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/50 border-b border-stone-200 text-stone-900 font-bold text-[9px] uppercase tracking-wider font-mono">
                  <th className="py-2.5 px-5 border-r border-stone-200">PO ID</th>
                  <th className="py-2.5 px-5 border-r border-stone-200">Material Description</th>
                  <th className="py-2.5 px-5 text-right border-r border-stone-200">Net Value</th>
                  <th className="py-2.5 px-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150 text-stone-700 font-sans">
                {[
                  { no: 'PO-2025-0081', desc: 'HR Steel Coils', detail: '2,000 KG • 28-May-25', val: '2,40,000', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Acknowledged' },
                  { no: 'PO-2025-0079', desc: 'MS Plates 6mm', detail: '800 KG • 25-May-25', val: '72,000', badgeClass: 'bg-amber-50 text-amber-700 border-amber-250', text: 'ASN Submitted' },
                  { no: 'PO-2025-0071', desc: 'Galvanised Coils', detail: '1,200 KG • 18-May-25', val: '1,56,000', badgeClass: 'bg-red-50 text-red-700 border-red-200', text: 'Overdue' },
                  { no: 'PO-2025-0065', desc: 'CR Steel Sheets', detail: '500 KG • 10-May-25', val: '42,500', badgeClass: 'bg-green-50 text-green-700 border-green-200', text: 'GRN Received' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/20 transition-colors">
                    <td 
                      className="py-3 px-5 font-mono font-bold text-stone-900 cursor-pointer hover:underline border-r border-stone-200" 
                      onClick={() => setActiveTab('pos')}
                    >
                      {row.no}
                    </td>
                    <td className="py-3 px-5 border-r border-stone-200">
                      <p className="font-bold text-stone-900">{row.desc}</p>
                      <p className="text-[10px] text-stone-500 font-mono mt-0.5">{row.detail}</p>
                    </td>
                    <td className="py-3 px-5 text-right font-mono font-bold text-stone-950 border-r border-stone-200 bg-stone-50/5">
                      ₹ {row.val}.00
                    </td>
                    <td className="py-3 px-5 text-center">
                      <span className={`px-2 py-0.5 rounded-sm text-[9px] font-extrabold border ${row.badgeClass} uppercase tracking-wider font-mono`}>
                        {row.text}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT INVOICES */}
        <div className="bg-white border border-stone-200 rounded-sm shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="px-5 py-3 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider">Logistics Invoices Ledger</h4>
            <button
              onClick={() => setActiveTab('invoices')}
              className="text-[10px] text-stone-600 hover:text-stone-900 font-bold uppercase tracking-wider"
            >
              All Invoices
            </button>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/50 border-b border-stone-200 text-stone-900 font-bold text-[9px] uppercase tracking-wider font-mono">
                  <th className="py-2.5 px-5 border-r border-stone-200">Invoice Doc</th>
                  <th className="py-2.5 px-5 border-r border-stone-200">SAP PO reference</th>
                  <th className="py-2.5 px-5 text-right border-r border-stone-200">Total Amt</th>
                  <th className="py-2.5 px-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150 text-stone-700 font-sans">
                {[
                  { no: 'INV-2025-0088', po: 'PO-2025-0079', date: '01-Jun-25', val: '75,600', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200', text: 'Submitted' },
                  { no: 'INV-2025-0084', po: 'PO-2025-0085', date: '28-May-25', val: '74,599', badgeClass: 'bg-red-50 text-red-700 border-red-200', text: 'Match Warning' },
                  { no: 'INV-2025-0078', po: 'PO-2025-0061', date: '20-May-25', val: '1,08,000', badgeClass: 'bg-green-50 text-green-700 border-green-200', text: 'Approved' },
                  { no: 'INV-2025-0072', po: 'PO-2025-0055', date: '12-May-25', val: '52,800', badgeClass: 'bg-stone-100 text-stone-700 border-stone-200', text: 'Posted in SAP' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/20 transition-colors">
                    <td 
                      className="py-3 px-5 font-mono font-bold text-stone-900 cursor-pointer hover:underline border-r border-stone-200" 
                      onClick={() => setActiveTab('invoices')}
                    >
                      {row.no}
                    </td>
                    <td className="py-3 px-5 border-r border-stone-200">
                      <p className="font-bold text-stone-900 font-mono">{row.po}</p>
                      <p className="text-[10px] text-stone-500 font-mono mt-0.5">{row.date}</p>
                    </td>
                    <td className="py-3 px-5 text-right font-mono font-bold text-stone-955 border-r border-stone-200 bg-stone-50/5">
                      ₹ {row.val}.00
                    </td>
                    <td className="py-3 px-5 text-center">
                      <span className={`px-2 py-0.5 rounded-sm text-[9px] font-extrabold border ${row.badgeClass} uppercase tracking-wider font-mono`}>
                        {row.text}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. PERFORMANCE INDICATORS & RECENT PAYMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* MY PERFORMANCE SCORING BARS */}
        <div className="w-full bg-white border border-stone-200 rounded-sm shadow-xs p-4 flex flex-col justify-between min-h-[320px]">
          <div>
            <h4 className="font-extrabold text-xs text-stone-900 border-b border-stone-200 pb-2.5 uppercase tracking-wider">
              Service Delivery KPIs (OTIF)
            </h4>

            {/* INDICATORS SCALE */}
            <div className="space-y-3 pt-3">
              {[
                { name: 'On-Time In-Full Delivery (OTIF)', score: 91, target: 95, icon: '↑' },
                { name: 'Quality Acceptance Rate', score: 96, target: 95, icon: '✓' },
                { name: 'Invoice Billing Accuracy', score: 83, target: 90, icon: '↑' },
                { name: 'Commercial Proposal Response Time', score: 78, target: 85, icon: '↑' }
              ].map((m, idx) => {
                let barColor = 'bg-red-500'; // Red for < 80%
                if (m.score >= 95) {
                  barColor = 'bg-emerald-600'; // Green for >= 95%
                } else if (m.score >= 80) {
                  barColor = 'bg-amber-500'; // Yellow for 80% - 94%
                }

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-stone-750">{m.name}</span>
                      <span className="text-stone-605">
                        {m.score}% <span className="text-stone-400 font-normal">/ target {m.target}%</span> <span className="text-[10px] ml-0.5 font-bold font-mono">{m.icon}</span>
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 h-2 rounded-sm border border-stone-200 overflow-hidden">
                      <div
                        className={`h-full rounded-sm transition-all duration-500 ${barColor}`}
                        style={{ width: `${m.score}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* OVERALL PERFORMANCE CARD SCORE */}
          <div className="mt-6 bg-stone-50 border border-stone-200 p-4 rounded-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Supplier Quality Rating</span>
              <p className="text-2xl font-bold text-stone-900 mt-1 font-mono">
                87 <span className="text-xs font-normal text-stone-450 font-sans">/ 100</span>
              </p>
            </div>
            <span className="px-3 py-1 rounded-sm border border-stone-200 bg-stone-100 text-stone-700 text-xs font-extrabold font-sans uppercase">
              CLASS A SUPPLIER
            </span>
          </div>
        </div>

        {/* RECENT PAYMENTS RECEIVED */}
        <div className="w-full bg-white border border-stone-200 rounded-sm shadow-xs overflow-hidden flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="px-4 py-2.5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider">Treasury Disbursements (Recent)</h4>
              <button
                onClick={() => setActiveTab('payments')}
                className="text-[10px] text-stone-600 hover:text-stone-900 font-bold uppercase tracking-wider"
              >
                Statement
              </button>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50/50 border-b border-stone-200 text-stone-900 font-bold text-[9px] uppercase tracking-wider font-mono">
                    <th className="py-2 px-3.5 border-r border-stone-200">UTR / Clearing Ref</th>
                    <th className="py-2 px-3.5 border-r border-stone-200">Invoice Doc</th>
                    <th className="py-2 px-3.5 text-right border-r border-stone-200">Gross</th>
                    <th className="py-2 px-3.5 text-right border-r border-stone-200">TDS</th>
                    <th className="py-2 px-3.5 text-right border-r border-stone-200">Net Cleared</th>
                    <th className="py-2 px-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 text-stone-700 font-mono">
                  {[
                    { utr: 'UTR2025060112', inv: 'INV-2025-0065', gross: '1,24,200', tds: '1,242', net: '1,22,958', date: '01-Jun-25', method: 'NEFT' },
                    { utr: 'UTR2025052801', inv: 'INV-2025-0058', gross: '84,600', tds: '846', net: '83,754', date: '28-May-25', method: 'NEFT' },
                    { utr: 'UTR2025051501', inv: 'INV-2025-0049', gross: '67,200', tds: '672', net: '66,528', date: '15-May-25', method: 'RTGS' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/20 transition-colors">
                      <td 
                        className="py-2 px-3.5 font-bold text-stone-900 hover:underline cursor-pointer border-r border-stone-200" 
                        onClick={() => setActiveTab('payments')}
                      >
                        {row.utr}
                      </td>
                      <td className="py-2 px-3.5 border-r border-stone-200">{row.inv}</td>
                      <td className="py-2 px-3.5 text-right text-stone-800 font-semibold border-r border-stone-200">₹ {row.gross}</td>
                      <td className="py-2 px-3.5 text-right text-stone-505 font-semibold border-r border-stone-200">-₹ {row.tds}</td>
                      <td className="py-2 px-3.5 text-right text-green-700 font-extrabold border-r border-stone-200 bg-stone-50/5 font-mono">₹ {row.net}</td>
                      <td className="py-2 px-3.5 font-sans">
                        <p className="text-stone-900 font-bold">{row.date}</p>
                        <p className="text-[9px] text-stone-400 font-mono uppercase font-bold">{row.method}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ACTION BUTTON CLEARING BARS */}
          <div className="p-3 bg-stone-50 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('payments')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-stone-300 text-stone-700 rounded-sm text-xs font-bold hover:bg-stone-100 transition-colors shadow-sm cursor-pointer h-9"
            >
              <Download className="size-4 text-stone-400" />
              <span>Download Bank Advice</span>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-white rounded-sm text-xs font-bold transition-colors shadow-sm cursor-pointer h-9"
            >
              <FileCheck className="size-4 text-blue-300" />
              <span>Form 16A TDS ledger</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
