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
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  FileCheck
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
    <div className="space-y-6 max-w-full animate-fade-in pb-16">

      {/* 1. TOP HEADER & MAIN BUTTON ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">Vendor Dashboard</h2>
          <p className="text-stone-500 text-sm mt-0.5">
            Your account overview &mdash; 02 Jun 2025 &bull; FY 2025-26 Q1
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('payments')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-250 text-stone-700 rounded-lg text-sm font-semibold hover:bg-stone-50 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="size-4 text-stone-400" />
            <span>Download Statement</span>
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className="flex items-center gap-2 px-4 py-2 bg-stone-850 text-stone-50 rounded-lg text-sm font-semibold hover:bg-stone-950 transition-colors shadow-sm cursor-pointer"
          >
            <FileText className="size-4 text-green-900" />
            <span className='text-green-900'>Submit Invoice</span>
          </button>
        </div>
      </div>

      {/* 2. WELCOME BANNER (Blue-955 Card with Horizontal Actions) */}
      <div className="bg-blue-950 text-white rounded-xl p-6 shadow-md border border-blue-900 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-blue-300 font-bold">WELCOME BACK</p>
          <h3 className="text-xl font-bold text-white mt-1">
            {state.profile.companyName || 'Bharat Steel & Alloys Pvt. Ltd.'}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-blue-100/90">
            <span>Vendor Code: <strong className="font-mono text-blue-200">{state.profile.sapVendorCode || 'SAP-100042'}</strong></span>
            <span className="text-blue-900">|</span>
            <span>GSTIN: <strong className="font-mono text-blue-200">{state.profile.gstin || '27AABCB1234F1Z5'}</strong></span>
            <span className="px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-200 border border-blue-800/80 text-[10px] font-semibold flex items-center gap-1 font-sans">
              <span className="size-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              Active
            </span>
          </div>
        </div>

        {/* QUICK ICON SHORTCUTS */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 border-t border-blue-900 pt-4 lg:border-t-0 lg:pt-0">
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
                className="flex flex-col items-center justify-center w-20 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-center cursor-pointer text-blue-200 hover:text-white"
              >
                <IconComp className="size-5 mb-1.5 text-blue-300" />
                <span className="text-[10px] font-semibold leading-tight">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 4 STAT CARDS KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card 1: Open POs */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-stone-550">Open POs</p>
            <p className="text-2xl font-bold text-stone-900">{openPOCount || 12}</p>
            <div className="text-[11px] font-medium">
              <span className="text-stone-500">₹{(openPOTotalValue ? (openPOTotalValue / 100000).toFixed(1) : 48.6)}L total value</span>
              <span className="text-stone-700 font-bold ml-1.5">+3 this week</span>
            </div>
          </div>
          <div className="size-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-600 shrink-0 border border-stone-200">
            <ShoppingBag className="size-5" />
          </div>
        </div>

        {/* Stat Card 2: Pending Invoices */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-stone-550">Pending Invoices</p>
            <p className="text-2xl font-bold text-stone-900">{pendingInvoicesCount || 4}</p>
            <div className="text-[11px] font-medium">
              <span className="text-stone-500">₹12.3L awaiting AP</span>
              <span className="text-stone-650 font-bold ml-1.5">2 matched</span>
            </div>
          </div>
          <div className="size-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-600 shrink-0 border border-stone-200">
            <Receipt className="size-5" />
          </div>
        </div>

        {/* Stat Card 3: Next Payment */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-stone-550">Next Payment</p>
            <p className="text-2xl font-bold text-stone-900">₹8.4L</p>
            <div className="text-[11px] font-medium">
              <span className="text-stone-500">Due 15-Jun-2025</span>
              <span className="text-stone-700 font-bold ml-1.5">Net 45 &bull; On track</span>
            </div>
          </div>
          <div className="size-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-600 shrink-0 border border-stone-200">
            <CreditCard className="size-5" />
          </div>
        </div>

        {/* Stat Card 4: Performance Score */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-stone-550">Performance Score</p>
            <p className="text-2xl font-bold text-stone-900">{state.performance.deliveryOTIF || 87}/100</p>
            <div className="text-[11px] font-medium">
              <span className="text-stone-500">Q1 2025-26</span>
              <span className="text-stone-700 font-bold ml-1.5">+4 from last Q</span>
            </div>
          </div>
          <div className="size-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-600 shrink-0 border border-stone-200">
            <Activity className="size-5" />
          </div>
        </div>
      </div>

      {/* 4. ALERTS & NOTIFICATIONS (2x2 Grid Panel) */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <h4 className="font-bold text-sm text-stone-900">Alerts &amp; Notifications</h4>
          <button
            onClick={() => setActiveTab('chats')}
            className="text-xs text-stone-600 hover:text-stone-850 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
          >
            <span>View all</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        {/* 2X2 ALERTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-100">
          <div className="divide-y divide-stone-100">
            {/* ALERT 1 (Match Warning) */}
            <div className="p-5 flex items-start gap-4 hover:bg-stone-50/50 transition-colors">
              <div className="size-8.5 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-550 shrink-0 mt-0.5">
                <AlertTriangle className="size-4.5" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-xs text-stone-800">Invoice INV-2025-0084 has a match warning</h5>
                <p className="text-stone-500 text-xs leading-normal">
                  Line 2 qty variance: 185 KG invoiced vs 200 KG on GRN. Please review or contact AP.
                </p>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className="text-stone-700 font-semibold text-xs flex items-center gap-0.5 hover:underline pt-0.5 cursor-pointer"
                >
                  <span>View Invoice &rarr;</span>
                </button>
              </div>
            </div>

            {/* ALERT 2 (Overdue PO) */}
            <div className="p-5 flex items-start gap-4 hover:bg-stone-50/50 transition-colors">
              <div className="size-8.5 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-550 shrink-0 mt-0.5">
                <Calendar className="size-4.5" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-xs text-stone-800">PO-2025-0071 delivery overdue by 2 days</h5>
                <p className="text-stone-500 text-xs leading-normal">
                  Scheduled delivery was 01-Jun-2025. Please update ASN or contact Procurement.
                </p>
                <button
                  onClick={() => setActiveTab('pos')}
                  className="text-stone-700 font-semibold text-xs flex items-center gap-0.5 hover:underline pt-0.5 cursor-pointer"
                >
                  <span>Update ASN &rarr;</span>
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {/* ALERT 3 (New RFQ) */}
            <div className="p-5 flex items-start gap-4 hover:bg-stone-50/50 transition-colors">
              <div className="size-8.5 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-550 shrink-0 mt-0.5">
                <Sparkles className="size-4.5" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-xs text-stone-800">New RFQ published: RFQ-2025-0041</h5>
                <p className="text-stone-500 text-xs leading-normal">
                  Galvanised coils &mdash; 500 MT requirement. Deadline: 25-Jun-2025. Submit your quote.
                </p>
                <button
                  onClick={() => setActiveTab('rfqs')}
                  className="text-stone-700 font-semibold text-xs flex items-center gap-0.5 hover:underline pt-0.5 cursor-pointer"
                >
                  <span>View RFQ &rarr;</span>
                </button>
              </div>
            </div>

            {/* ALERT 4 (New Message) */}
            <div className="p-5 flex items-start gap-4 hover:bg-stone-50/50 transition-colors">
              <div className="size-8.5 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-550 shrink-0 mt-0.5">
                <MessageSquare className="size-4.5" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-xs text-stone-800">New message from Procurement re PO-2025-0068</h5>
                <p className="text-stone-500 text-xs leading-normal">
                  Query on packing specification for Cold Rolled Sheets batch.
                </p>
                <button
                  onClick={() => setActiveTab('chats')}
                  className="text-stone-700 font-semibold text-xs flex items-center gap-0.5 hover:underline pt-0.5 cursor-pointer"
                >
                  <span>Reply &rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SIDE-BY-SIDE: RECENT POs & RECENT INVOICES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* RECENT PURCHASE ORDERS */}
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
            <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <span>Recent Purchase Orders</span>
            </h4>
            <button
              onClick={() => setActiveTab('pos')}
              className="text-xs text-stone-600 hover:text-stone-850 hover:underline font-semibold cursor-pointer"
            >
              View all POs
            </button>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-400 font-bold text-[10px] uppercase">
                  <th className="py-2.5 px-6">PO No.</th>
                  <th className="py-2.5 px-6">Material</th>
                  <th className="py-2.5 px-6 text-right">Value</th>
                  <th className="py-2.5 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {[
                  { no: 'PO-2025-0081', desc: 'HR Steel Coils', detail: '2,000 KG • 28-May-25', val: '2,40,000', badgeClass: 'bg-stone-100 text-stone-700 border-stone-200', text: 'Acknowledged' },
                  { no: 'PO-2025-0079', desc: 'MS Plates 6mm', detail: '800 KG • 25-May-25', val: '72,000', badgeClass: 'bg-stone-100 text-stone-700 border-stone-200', text: 'ASN Submitted' },
                  { no: 'PO-2025-0071', desc: 'Galvanised Coils', detail: '1,200 KG • 18-May-25', val: '1,56,000', badgeClass: 'bg-stone-100 text-stone-700 border-stone-200', text: 'Overdue' },
                  { no: 'PO-2025-0065', desc: 'CR Steel Sheets', detail: '500 KG • 10-May-25', val: '42,500', badgeClass: 'bg-stone-100 text-stone-700 border-stone-200', text: 'GRN Received' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-stone-800 cursor-pointer hover:underline" onClick={() => setActiveTab('pos')}>
                      {row.no}
                    </td>
                    <td className="py-3.5 px-6">
                      <p className="font-semibold text-stone-900">{row.desc}</p>
                      <p className="text-[10px] text-stone-500 font-mono mt-0.5">{row.detail}</p>
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-semibold text-stone-800">
                      ₹ {row.val}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${row.badgeClass}`}>
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
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
            <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <span>Recent Invoices</span>
            </h4>
            <button
              onClick={() => setActiveTab('invoices')}
              className="text-xs text-stone-600 hover:text-stone-850 hover:underline font-semibold cursor-pointer"
            >
              View all Invoices
            </button>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-400 font-bold text-[10px] uppercase">
                  <th className="py-2.5 px-6">Invoice</th>
                  <th className="py-2.5 px-6">PO Ref</th>
                  <th className="py-2.5 px-6 text-right">Amount</th>
                  <th className="py-2.5 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {[
                  { no: 'INV-2025-0088', po: 'PO-2025-0079', date: '01-Jun-25', val: '75,600', badgeClass: 'bg-stone-100 text-stone-700 border-stone-200', text: 'Submitted' },
                  { no: 'INV-2025-0084', po: 'PO-2025-0085', date: '28-May-25', val: '74,599', badgeClass: 'bg-stone-100 text-stone-700 border-stone-200', text: 'Match Warning' },
                  { no: 'INV-2025-0078', po: 'PO-2025-0061', date: '20-May-25', val: '1,08,000', badgeClass: 'bg-stone-100 text-stone-700 border-stone-200', text: 'Approved' },
                  { no: 'INV-2025-0072', po: 'PO-2025-0055', date: '12-May-25', val: '52,800', badgeClass: 'bg-stone-100 text-stone-700 border-stone-200', text: 'Posted in SAP' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-stone-850 cursor-pointer hover:underline" onClick={() => setActiveTab('invoices')}>
                      {row.no}
                    </td>
                    <td className="py-3.5 px-6">
                      <p className="font-semibold text-stone-900">{row.po}</p>
                      <p className="text-[10px] text-stone-500 font-mono mt-0.5">{row.date}</p>
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-semibold text-stone-800">
                      ₹ {row.val}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${row.badgeClass}`}>
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

      {/* 6. SIDE-BY-SIDE: PERFORMANCE BAR INDICATORS & RECENT PAYMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* MY PERFORMANCE SCORING BARS */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl shadow-sm p-6 flex flex-col justify-between min-h-[360px]">
          <div>
            <h4 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
              <span>My Performance &mdash; Q1 FY 2025-26</span>
            </h4>

            {/* INDICATORS SCALE */}
            <div className="space-y-4 pt-4">
              {[
                { name: 'On-Time Delivery', score: 91, target: 95, icon: '↑', isGreen: true },
                { name: 'Quality Acceptance', score: 96, target: 95, icon: '✓', isGreen: true },
                { name: 'Invoice Accuracy', score: 83, target: 90, icon: '↑', isGreen: false },
                { name: 'Response Time', score: 78, target: 85, icon: '↑', isGreen: false }
              ].map((m, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-700">{m.name}</span>
                    <span className="text-stone-600">
                      {m.score}% <span className="text-stone-400 font-normal">/ target {m.target}%</span> <span className="text-[10px] ml-0.5">{m.icon}</span>
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full border border-stone-200/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${m.isGreen ? 'bg-stone-700' : 'bg-stone-400'}`}
                      style={{ width: `${m.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OVERALL PERFORMANCE CARD SCORE */}
          <div className="mt-6 bg-stone-50 border border-stone-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-stone-500">Overall Score</span>
              <p className="text-2xl font-bold text-stone-850 mt-1">
                87 <span className="text-sm font-normal text-stone-450 font-sans">/ 100</span>
              </p>
            </div>
            <span className="px-3 py-1 rounded border border-stone-200 bg-stone-100 text-stone-700 text-xs font-bold font-sans">
              &#9733;&#9733; Standard
            </span>
          </div>
        </div>

        {/* RECENT PAYMENTS RECEIVED */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <span>Recent Payments Received</span>
              </h4>
              <button
                onClick={() => setActiveTab('payments')}
                className="text-xs text-stone-600 hover:text-stone-850 hover:underline font-semibold cursor-pointer"
              >
                Account Statement
              </button>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-400 font-bold text-[10px] uppercase">
                    <th className="py-2.5 px-6">UTR Reference</th>
                    <th className="py-2.5 px-6">Invoice</th>
                    <th className="py-2.5 px-6 text-right">Gross Amt</th>
                    <th className="py-2.5 px-6 text-right">TDS</th>
                    <th className="py-2.5 px-6 text-right">Net Received</th>
                    <th className="py-2.5 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700 font-mono">
                  {[
                    { utr: 'UTR2025060112', inv: 'INV-2025-0065', gross: '1,24,200', tds: '1,242', net: '1,22,958', date: '01-Jun-25', method: 'NEFT' },
                    { utr: 'UTR2025052801', inv: 'INV-2025-0058', gross: '84,600', tds: '846', net: '83,754', date: '28-May-25', method: 'NEFT' },
                    { utr: 'UTR2025051501', inv: 'INV-2025-0049', gross: '67,200', tds: '672', net: '66,528', date: '15-May-25', method: 'RTGS' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-stone-850 hover:underline cursor-pointer" onClick={() => setActiveTab('payments')}>
                        {row.utr}
                      </td>
                      <td className="py-3.5 px-6">{row.inv}</td>
                      <td className="py-3.5 px-6 text-right text-stone-800 font-semibold">₹ {row.gross}</td>
                      <td className="py-3.5 px-6 text-right text-stone-500 font-semibold">₹ {row.tds}</td>
                      <td className="py-3.5 px-6 text-right text-stone-900 font-bold">₹ {row.net}</td>
                      <td className="py-3.5 px-6 font-sans">
                        <p className="text-stone-850 font-semibold">{row.date}</p>
                        <p className="text-[10px] text-stone-400 font-mono">{row.method}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ACTION BUTTON CLEARING BARS */}
          <div className="p-6 bg-stone-50 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('payments')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-250 text-stone-700 rounded-lg text-xs font-bold hover:bg-stone-100 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="size-4 text-stone-400" />
              <span>Download Advice</span>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-850 text-stone-50 rounded-lg text-xs font-bold hover:bg-stone-950 transition-colors shadow-sm cursor-pointer"
            >
              <FileCheck className="size-4" />
              <span>Form 16A / TDS</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
