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
    <div className="space-y-4 max-w-full animate-fade-in pb-12">

      {/* 1. TOP HEADER & MAIN BUTTON ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-stone-900">Vendor Dashboard</h2>
          <p className="text-stone-500 text-xs mt-0.5">
            Your account overview &mdash; 02 Jun 2025 &bull; FY 2025-26 Q1
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('payments')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-250 text-stone-700 rounded text-xs font-semibold hover:bg-stone-50 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="size-3.5 text-stone-400" />
            <span>Download Statement</span>
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-850 text-stone-50 rounded text-xs font-semibold hover:bg-stone-950 transition-colors shadow-sm cursor-pointer"
          >
            <FileText className="size-3.5 text-stone-100" />
            <span className='text-stone-100'>Submit Invoice</span>
          </button>
        </div>
      </div>

      {/* 2. WELCOME BANNER (Blue-955 Card with Horizontal Actions) */}
      <div className="bg-blue-950 text-white rounded-lg p-4 shadow-md border border-blue-900 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-blue-300 font-bold">WELCOME BACK</p>
          <h3 className="text-sm font-bold text-white mt-0.5">
            {state.profile.companyName || 'Bharat Steel & Alloys Pvt. Ltd.'}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[10px] text-blue-100/90">
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
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 border-t border-blue-900 pt-3 lg:border-t-0 lg:pt-0">
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
                className="flex flex-col items-center justify-center w-14 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-center cursor-pointer text-blue-200 hover:text-white"
              >
                <IconComp className="size-3.5 mb-1 text-blue-300" />
                <span className="text-[8px] font-bold leading-tight">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 4 STAT CARDS KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Stat Card 1: Open POs */}
        <div className="bg-white border border-stone-200 rounded-lg p-3 shadow-xs hover:shadow-sm transition-all flex items-start justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Open POs</p>
            <p className="text-lg font-extrabold text-stone-900">{openPOCount || 12}</p>
            <div className="text-[10px] font-medium text-stone-600">
              <span className="text-stone-500">₹{(openPOTotalValue ? (openPOTotalValue / 100000).toFixed(1) : 48.6)}L total value</span>
              <span className="text-stone-700 font-bold ml-1.5">+3 this week</span>
            </div>
          </div>
          <div className="size-7 rounded-full bg-stone-50 flex items-center justify-center text-stone-600 shrink-0 border border-stone-200">
            <ShoppingBag className="size-3.5" />
          </div>
        </div>

        {/* Stat Card 2: Pending Invoices */}
        <div className="bg-white border border-stone-200 rounded-lg p-3 shadow-xs hover:shadow-sm transition-all flex items-start justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Pending Invoices</p>
            <p className="text-lg font-extrabold text-stone-900">{pendingInvoicesCount || 4}</p>
            <div className="text-[10px] font-medium text-stone-600">
              <span className="text-stone-500">₹12.3L awaiting AP</span>
              <span className="text-stone-655 font-bold ml-1.5">2 matched</span>
            </div>
          </div>
          <div className="size-7 rounded-full bg-stone-50 flex items-center justify-center text-stone-600 shrink-0 border border-stone-200">
            <Receipt className="size-3.5" />
          </div>
        </div>

        {/* Stat Card 3: Next Payment */}
        <div className="bg-white border border-stone-200 rounded-lg p-3 shadow-xs hover:shadow-sm transition-all flex items-start justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Next Payment</p>
            <p className="text-lg font-extrabold text-stone-900">₹8.4L</p>
            <div className="text-[10px] font-medium text-stone-600">
              <span className="text-stone-500">Due 15-Jun-2025</span>
              <span className="text-stone-700 font-bold ml-1.5">Net 45 &bull; On track</span>
            </div>
          </div>
          <div className="size-7 rounded-full bg-stone-50 flex items-center justify-center text-stone-600 shrink-0 border border-stone-200">
            <CreditCard className="size-3.5" />
          </div>
        </div>

        {/* Stat Card 4: Performance Score */}
        <div className="bg-white border border-stone-200 rounded-lg p-3 shadow-xs hover:shadow-sm transition-all flex items-start justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Performance Score</p>
            <p className="text-lg font-extrabold text-stone-900">{state.performance.deliveryOTIF || 87}/100</p>
            <div className="text-[10px] font-medium text-stone-600">
              <span className="text-stone-500">Q1 2025-26</span>
              <span className="text-stone-700 font-bold ml-1.5">+4 from last Q</span>
            </div>
          </div>
          <div className="size-7 rounded-full bg-stone-50 flex items-center justify-center text-stone-600 shrink-0 border border-stone-200">
            <Activity className="size-3.5" />
          </div>
        </div>
      </div>

      {/* 4. ALERTS & NOTIFICATIONS (2x2 Grid Panel) */}
      <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-2 border-b border-stone-200 flex items-center justify-between uppercase">
          <h4 className="font-extrabold text-xs text-stone-900 tracking-wider">Alerts &amp; Notifications</h4>
          <button
            onClick={() => setActiveTab('chats')}
            className="text-[10px] text-stone-600 hover:text-stone-850 hover:underline font-bold flex items-center gap-0.5 cursor-pointer tracking-wider"
          >
            <span>View all</span>
            <ChevronRight className="size-3" />
          </button>
        </div>

        {/* 2X2 ALERTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-100">
          <div className="divide-y divide-stone-100">
            {/* ALERT 1 (Match Warning) */}
            <div className="p-3 flex items-start gap-2.5 hover:bg-stone-50/50 transition-colors">
              <div className="size-6 rounded bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-550 shrink-0 mt-0.5">
                <AlertTriangle className="size-3" />
              </div>
              <div className="space-y-0.5">
                <h5 className="font-bold text-[11px] text-stone-800">Invoice INV-2025-0084 has a match warning</h5>
                <p className="text-stone-500 text-[10px] leading-snug">
                  Line 2 qty variance: 185 KG invoiced vs 200 KG on GRN. Please review or contact AP.
                </p>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className="text-stone-700 font-semibold text-[10px] flex items-center gap-0.5 hover:underline pt-0.5 cursor-pointer"
                >
                  <span>View Invoice &rarr;</span>
                </button>
              </div>
            </div>

            {/* ALERT 2 (Overdue PO) */}
            <div className="p-3 flex items-start gap-2.5 hover:bg-stone-50/50 transition-colors">
              <div className="size-6 rounded bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-550 shrink-0 mt-0.5">
                <Calendar className="size-3" />
              </div>
              <div className="space-y-0.5">
                <h5 className="font-bold text-[11px] text-stone-800">PO-2025-0071 delivery overdue by 2 days</h5>
                <p className="text-stone-500 text-[10px] leading-snug">
                  Scheduled delivery was 01-Jun-2025. Please update ASN or contact Procurement.
                </p>
                <button
                  onClick={() => setActiveTab('pos')}
                  className="text-stone-700 font-semibold text-[10px] flex items-center gap-0.5 hover:underline pt-0.5 cursor-pointer"
                >
                  <span>Update ASN &rarr;</span>
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {/* ALERT 3 (New RFQ) */}
            <div className="p-3 flex items-start gap-2.5 hover:bg-stone-50/50 transition-colors">
              <div className="size-6 rounded bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-550 shrink-0 mt-0.5">
                <Sparkles className="size-3" />
              </div>
              <div className="space-y-0.5">
                <h5 className="font-bold text-[11px] text-stone-800">New RFQ published: RFQ-2025-0041</h5>
                <p className="text-stone-500 text-[10px] leading-snug">
                  Galvanised coils &mdash; 500 MT requirement. Deadline: 25-Jun-2025. Submit your quote.
                </p>
                <button
                  onClick={() => setActiveTab('rfqs')}
                  className="text-stone-700 font-semibold text-[10px] flex items-center gap-0.5 hover:underline pt-0.5 cursor-pointer"
                >
                  <span>View RFQ &rarr;</span>
                </button>
              </div>
            </div>

            {/* ALERT 4 (New Message) */}
            <div className="p-3 flex items-start gap-2.5 hover:bg-stone-50/50 transition-colors">
              <div className="size-6 rounded bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-550 shrink-0 mt-0.5">
                <MessageSquare className="size-3" />
              </div>
              <div className="space-y-0.5">
                <h5 className="font-bold text-[11px] text-stone-800">New message from Procurement re PO-2025-0068</h5>
                <p className="text-stone-500 text-[10px] leading-snug">
                  Query on packing specification for Cold Rolled Sheets batch.
                </p>
                <button
                  onClick={() => setActiveTab('chats')}
                  className="text-stone-700 font-semibold text-[10px] flex items-center gap-0.5 hover:underline pt-0.5 cursor-pointer"
                >
                  <span>Reply &rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SIDE-BY-SIDE: RECENT POs & RECENT INVOICES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* RECENT PURCHASE ORDERS */}
        <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="px-4 py-2 border-b border-stone-200 flex items-center justify-between uppercase">
            <h4 className="font-extrabold text-xs text-stone-900 tracking-wider">
              Purchase Orders Monitor
            </h4>
            <button
              onClick={() => setActiveTab('pos')}
              className="text-[10px] text-stone-600 hover:text-stone-850 hover:underline font-bold cursor-pointer tracking-wider"
            >
              All Orders
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {[
              { no: 'PO-2025-0081', desc: 'HR Steel Coils', detail: '2,000 KG', date: '28-May-25', val: '2,40,000', text: 'Acknowledged', statusColor: 'blue' },
              { no: 'PO-2025-0079', desc: 'MS Plates 6mm', detail: '800 KG', date: '25-May-25', val: '72,000', text: 'ASN Submitted', statusColor: 'amber' },
              { no: 'PO-2025-0071', desc: 'Galvanised Coils', detail: '1,200 KG', date: '18-May-25', val: '1,56,000', text: 'Overdue', statusColor: 'red' },
              { no: 'PO-2025-0065', desc: 'CR Steel Sheets', detail: '500 KG', date: '10-May-25', val: '42,500', text: 'GRN Received', statusColor: 'emerald' }
            ].map((row, idx) => {
              const badgeStyles = row.statusColor === 'blue' ? 'bg-blue-50/50 text-blue-800 border-blue-200' :
                                  row.statusColor === 'amber' ? 'bg-amber-50/50 text-amber-800 border-amber-200' :
                                  row.statusColor === 'red' ? 'bg-red-50/50 text-red-800 border-red-200 animate-pulse' :
                                  'bg-emerald-50/50 text-emerald-800 border-emerald-250';
              return (
                <div key={idx} className="p-3 flex items-center justify-between hover:bg-stone-50/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`size-8 rounded-lg flex items-center justify-center border shrink-0 ${
                      row.statusColor === 'blue' ? 'bg-blue-50/50 border-blue-100 text-blue-700' :
                      row.statusColor === 'amber' ? 'bg-amber-50/50 border-amber-100 text-amber-700' :
                      row.statusColor === 'red' ? 'bg-red-50/50 border-red-100 text-red-700' :
                      'bg-emerald-50/50 border-emerald-100 text-emerald-700'
                    }`}>
                      <ShoppingBag className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-stone-900 cursor-pointer hover:underline text-xs" onClick={() => setActiveTab('pos')}>
                        {row.no}
                      </span>
                      <p className="text-[10px] text-stone-500 truncate mt-0.5 font-medium">
                        {row.desc} &bull; {row.detail}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3.5 shrink-0 text-right">
                    <div>
                      <p className="font-mono font-bold text-stone-900 text-xs">₹{row.val}.00</p>
                      <p className="text-[9px] text-stone-400 font-mono mt-0.5">{row.date}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider whitespace-nowrap ${badgeStyles}`}>
                      {row.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT INVOICES */}
        <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="px-4 py-2 border-b border-stone-200 flex items-center justify-between uppercase">
            <h4 className="font-extrabold text-xs text-stone-900 tracking-wider">
              Logistics Invoices Ledger
            </h4>
            <button
              onClick={() => setActiveTab('invoices')}
              className="text-[10px] text-stone-600 hover:text-stone-850 hover:underline font-bold cursor-pointer tracking-wider"
            >
              All Invoices
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {[
              { no: 'INV-2025-0088', po: 'PO-2025-0079', date: '01-Jun-25', val: '75,600', text: 'Submitted', statusColor: 'blue' },
              { no: 'INV-2025-0084', po: 'PO-2025-0085', date: '28-May-25', val: '74,599', text: 'Match Warning', statusColor: 'red' },
              { no: 'INV-2025-0078', po: 'PO-2025-0061', date: '20-May-25', val: '1,08,000', text: 'Approved', statusColor: 'emerald' },
              { no: 'INV-2025-0072', po: 'PO-2025-0055', date: '12-May-25', val: '52,800', text: 'Posted in SAP', statusColor: 'stone' }
            ].map((row, idx) => {
              const badgeStyles = row.statusColor === 'blue' ? 'bg-blue-50/50 text-blue-800 border-blue-200' :
                                  row.statusColor === 'red' ? 'bg-red-50/50 text-red-800 border-red-200 animate-pulse font-bold' :
                                  row.statusColor === 'emerald' ? 'bg-emerald-50/50 text-emerald-800 border-emerald-250' :
                                  'bg-stone-50 text-stone-700 border-stone-250';
              return (
                <div key={idx} className="p-3 flex items-center justify-between hover:bg-stone-50/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`size-8 rounded-lg flex items-center justify-center border shrink-0 ${
                      row.statusColor === 'blue' ? 'bg-blue-50/50 border-blue-100 text-blue-700' :
                      row.statusColor === 'red' ? 'bg-red-50/50 border-red-100 text-red-700' :
                      row.statusColor === 'emerald' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' :
                      'bg-stone-50 border-stone-200 text-stone-600'
                    }`}>
                      <Receipt className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-stone-900 cursor-pointer hover:underline text-xs" onClick={() => setActiveTab('invoices')}>
                        {row.no}
                      </span>
                      <p className="text-[10px] text-stone-500 truncate mt-0.5 font-medium">
                        Ref PO: <strong className="font-mono font-bold">{row.po}</strong>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3.5 shrink-0 text-right">
                    <div>
                      <p className="font-mono font-bold text-stone-900 text-xs">₹{row.val}.00</p>
                      <p className="text-[9px] text-stone-400 font-mono mt-0.5">{row.date}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider whitespace-nowrap ${badgeStyles}`}>
                      {row.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. SIDE-BY-SIDE: PERFORMANCE BAR INDICATORS & RECENT PAYMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* MY PERFORMANCE SCORING BARS */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-lg shadow-sm p-4 flex flex-col justify-between min-h-[300px]">
          <div>
            <h4 className="font-extrabold text-xs text-stone-900 border-b border-stone-200 pb-2.5 uppercase tracking-wider">
              Service Delivery KPIs (OTIF)
            </h4>

            {/* INDICATORS SCALE */}
            <div className="space-y-4 pt-4">
              {[
                { name: 'On-Time In-Full Delivery (OTIF)', score: 91, target: 95, icon: '↑', barColor: 'bg-amber-500' },
                { name: 'Quality Acceptance Rate', score: 96, target: 95, icon: '✓', barColor: 'bg-emerald-500' },
                { name: 'Invoice Billing Accuracy', score: 83, target: 90, icon: '↑', barColor: 'bg-amber-500' },
                { name: 'Commercial Proposal Response Time', score: 78, target: 85, icon: '↑', barColor: 'bg-red-500' }
              ].map((m, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-stone-700">{m.name}</span>
                    <span className="text-stone-600">
                      {m.score}% <span className="text-stone-400 font-normal">/ target {m.target}%</span> <span className="text-[10px] ml-0.5">{m.icon}</span>
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full border border-stone-200/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${m.barColor}`}
                      style={{ width: `${m.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OVERALL PERFORMANCE CARD SCORE */}
          <div className="mt-4 bg-stone-50 border border-stone-200 p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Overall Score</span>
              <p className="text-lg font-extrabold text-stone-855 mt-1">
                87 <span className="text-xs font-normal text-stone-450 font-sans">/ 100</span>
              </p>
            </div>
            <span className="px-3 py-1 rounded border border-stone-200 bg-stone-100 text-stone-700 text-[10px] font-bold uppercase tracking-wider font-sans">
              &#9733;&#9733; Standard
            </span>
          </div>
        </div>

        {/* RECENT PAYMENTS RECEIVED */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="px-4 py-2 border-b border-stone-200 flex items-center justify-between uppercase">
              <h4 className="font-extrabold text-xs text-stone-900 tracking-wider">
                Treasury Disbursements (Recent)
              </h4>
              <button
                onClick={() => setActiveTab('payments')}
                className="text-[10px] text-stone-600 hover:text-stone-850 hover:underline font-bold cursor-pointer tracking-wider"
              >
                Statement
              </button>
            </div>
            <div className="divide-y divide-stone-100">
              {[
                { utr: 'UTR2025060112', inv: 'INV-2025-0065', gross: '1,24,200', tds: '1,242', net: '1,22,958', date: '01-Jun-25', method: 'NEFT' },
                { utr: 'UTR2025052801', inv: 'INV-2025-0058', gross: '84,600', tds: '846', net: '83,754', date: '28-May-25', method: 'NEFT' },
                { utr: 'UTR2025051501', inv: 'INV-2025-0049', gross: '67,200', tds: '672', net: '66,528', date: '15-May-25', method: 'RTGS' }
              ].map((row, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between hover:bg-stone-50/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                      <CreditCard className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-stone-900 cursor-pointer hover:underline text-xs" onClick={() => setActiveTab('payments')}>
                        {row.utr}
                      </span>
                      <p className="text-[10px] text-stone-500 mt-0.5 font-medium">
                        Inv: <strong className="font-mono font-bold">{row.inv}</strong> &bull; {row.method}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-5 shrink-0 text-right">
                    <div className="hidden sm:block text-[10px] text-stone-400 font-medium">
                      <p>Gross: <span className="font-mono font-semibold text-stone-600">₹{row.gross}</span></p>
                      <p>TDS: <span className="font-mono font-semibold text-red-650">-₹{row.tds}</span></p>
                    </div>
                    <div>
                      <p className="font-mono font-bold text-emerald-700 text-xs">₹{row.net}</p>
                      <p className="text-[9px] text-stone-400 font-mono mt-0.5">{row.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTION BUTTON CLEARING BARS */}
          <div className="p-3 bg-stone-50 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => setActiveTab('payments')}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-stone-250 text-stone-700 rounded text-xs font-bold hover:bg-stone-100 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="size-3.5 text-stone-400" />
              <span>Download Advice</span>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-850 text-stone-50 rounded text-xs font-bold hover:bg-stone-950 transition-colors shadow-sm cursor-pointer"
            >
              <FileCheck className="size-3.5" />
              <span>Form 16A / TDS</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
