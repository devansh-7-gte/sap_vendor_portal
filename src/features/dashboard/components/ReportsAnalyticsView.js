'use client';

import React, { useState } from 'react';
import {
  FileText,
  Table,
  Link
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Enterprise Metadata Field Card (Fiori Inspired)
function EnterpriseFieldCard({ label, required, error, children }) {
  return (
    <div className={`p-4 rounded-xl border bg-white transition-all flex flex-col justify-between min-h-[110px] shadow-sm ${error
      ? 'border-red-300 bg-red-50/5 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400'
      : 'border-stone-200 hover:border-stone-300 focus-within:border-stone-500 focus-within:ring-1 focus-within:ring-stone-500'
      }`}>
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <label className="text-xs font-medium text-stone-750 truncate block select-none" title={label}>
          {label} {required && <span className="text-red-500 font-bold select-none ml-0.5">*</span>}
        </label>
      </div>
      <div className="flex-1 flex flex-col justify-center">{children}</div>
    </div>
  );
}

export default function ReportsAnalyticsView({ state }) {
  const [detailTab, setDetailTab] = useState('procurement'); // 'procurement' | 'finance' | 'selfservice' | 'library'
  const [isSapView, setIsSapView] = useState(false);

  // Scheduler Form State
  const [schedulerForm, setSchedulerForm] = useState({
    reportName: '',
    recipients: '',
    frequency: '',
    format: '',
    companyCode: '',
    nextRun: ''
  });

  return (
    <div className="space-y-6 max-w-full mx-auto animate-fade-in pb-16 relative select-none">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-4 gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2.5">
            <span>Reports &amp; Analytics</span>
            <span className="size-1.5 rounded-full bg-amber-500"></span>
          </h2>
          <p className="text-stone-500 text-xs font-semibold">
            Process flow &bull; Screen designs with SAP field types &bull; Field mapping
          </p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* TAB HEADERS */}
        <div className="flex flex-wrap items-center gap-2 bg-stone-100/50 border border-stone-200 p-1 rounded-xl w-fit">
          {[
            { id: 'procurement', label: 'Procurement Dashboard' },
            { id: 'finance', label: 'Finance & AP Reports' },
            { id: 'selfservice', label: 'Vendor Self-Service' },
            { id: 'library', label: 'Report Library' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setDetailTab(t.id)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                detailTab === t.id
                  ? 'bg-white text-stone-900 border border-stone-200 shadow-xs'
                  : 'text-stone-500 hover:text-stone-750'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT BLOCK */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-6">
          
          {/* Title header with SAP view toggle */}
          <div className="flex justify-between items-start border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span className="w-1.5 h-4.5 bg-orange-500 rounded-sm" />
                <span>
                  {detailTab === 'procurement' && 'Procurement Dashboard'}
                  {detailTab === 'finance' && 'Finance & AP Reports'}
                  {detailTab === 'selfservice' && 'Vendor Self-Service'}
                  {detailTab === 'library' && 'Report Library'}
                </span>
              </h3>
            </div>

            {/* SAP/Form View Toggle Removed */}
          </div>

          {/* TAB CONTENT: 1. PROCUREMENT DASHBOARD */}
          {detailTab === 'procurement' && (
            <div className="space-y-6 animate-fade-in">
              {/* Section 1: Dashboard KPI Cards */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                  <span>Dashboard KPI Cards</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <EnterpriseFieldCard label="Total Spend YTD (₹)" typeBadge="CURR" lenBadge="13" mappingCode="EKKO-NETWR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">₹ 1,245,600.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Active Vendors" typeBadge="NUMC" lenBadge="10" mappingCode="LFA1-LIFNR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">12</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Open POs - Count" typeBadge="NUMC" lenBadge="10" mappingCode="EKKO-EBELN" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">4</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="RFQ Participation Rate" typeBadge="DEC" lenBadge="5" mappingCode="EKKO-ANFNR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">85.5%</span>
                  </EnterpriseFieldCard>
                </div>
              </div>

              {/* Section 2: Spend Analytics */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                  <span>Spend Analytics</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <EnterpriseFieldCard label="Spend by Vendor - Top 10" typeBadge="CURR" lenBadge="13" mappingCode="EKKO-NETWR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">₹ 450,000.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Spend by Material Group" typeBadge="CHAR" lenBadge="9" mappingCode="EKPO-MATKL" isSapView={isSapView}>
                    <span className="font-bold text-stone-800 text-xs">Services</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Spend by Plant" typeBadge="CHAR" lenBadge="4" mappingCode="EKPO-WERKS" isSapView={isSapView}>
                    <span className="font-bold text-stone-800 text-xs">PL01</span>
                  </EnterpriseFieldCard>
                </div>
              </div>

              {/* Section 3: Delivery Performance */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                  <span>Delivery Performance</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <EnterpriseFieldCard label="On-Time Delivery %" typeBadge="DEC" lenBadge="5" mappingCode="EKET/LIKP-EINDT/WADAT_IST" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">96.2%</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Avg PO Acknowledgment (Days)" typeBadge="NUMC" lenBadge="3" mappingCode="EKKO-AEDAT" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">1.5 Days</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Fulfillment Rate (%)" typeBadge="DEC" lenBadge="5" mappingCode="EKPO-WEMNG/MENGE" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">98.0%</span>
                  </EnterpriseFieldCard>
                </div>
              </div>

              {/* Section 4: Filters & Export */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                  <span>Filters &amp; Export</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <EnterpriseFieldCard label="Company Code" typeBadge="CHAR" lenBadge="4" mappingCode="EKKO-BUKRS" isSapView={isSapView}>
                    <span className="font-bold text-stone-800 text-xs">1000</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Plant" typeBadge="CHAR" lenBadge="4" mappingCode="EKPO-WERKS" isSapView={isSapView}>
                    <span className="font-bold text-stone-800 text-xs">PL01</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Date Range" typeBadge="DATS" lenBadge="8" mappingCode="EKKO-BEDAT" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">2026-01-01 to 2026-12-31</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Vendor Category" typeBadge="CHAR" lenBadge="4" mappingCode="LFA1-KTOKK" isSapView={isSapView}>
                    <span className="font-bold text-stone-800 text-xs">Domestic</span>
                  </EnterpriseFieldCard>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-stone-200 mt-6">
                <div className="flex gap-2">
                  <Button onClick={() => alert('Exporting dashboard PDF')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-black hover:text-white hover:border-black font-bold text-xs px-5 rounded-lg h-9 shadow-sm">
                    Export PDF
                  </Button>
                  <Button onClick={() => alert('Exporting dashboard Excel')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-black hover:text-white hover:border-black font-bold text-xs px-5 rounded-lg h-9 shadow-sm">
                    Export Excel
                  </Button>
                </div>
                <Button onClick={() => alert('Scheduling dashboard report')} className="bg-stone-850 hover:bg-black text-stone-700 hover:text-white font-bold text-xs px-6 rounded-lg h-9 transition-all shadow-sm">
                  Schedule Report
                </Button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2. FINANCE & AP REPORTS */}
          {detailTab === 'finance' && (
            <div className="space-y-6 animate-fade-in">
              {/* Section 1: AP Aging Summary */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                  <span>AP Aging Summary</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <EnterpriseFieldCard label="Payables 0-30 Days (₹)" typeBadge="CURR" lenBadge="13" mappingCode="BSIK-DMBTR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">₹ 45,000.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Payables 31-60 Days (₹)" typeBadge="CURR" lenBadge="13" mappingCode="BSIK-DMBTR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">₹ 18,200.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Payables 61-90 Days (₹)" typeBadge="CURR" lenBadge="13" mappingCode="BSIK-DMBTR" isSapView={isSapView}>
                    <span className="font-mono text-stone-850 font-bold text-xs">₹ 0.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Overdue > 90 Days (₹)" typeBadge="CURR" lenBadge="13" mappingCode="BSIK-DMBTR" isSapView={isSapView}>
                    <span className="font-mono text-stone-850 font-bold text-xs">₹ 0.00</span>
                  </EnterpriseFieldCard>
                </div>
              </div>

              {/* Section 2: Tax & Compliance */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                  <span>Tax &amp; Compliance</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <EnterpriseFieldCard label="TDS Liability - Quarter (₹)" typeBadge="CURR" lenBadge="13" mappingCode="WITH_ITEM-QBSHB" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">₹ 12,450.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="GST Input Tax Available (₹)" typeBadge="CURR" lenBadge="13" mappingCode="BSET-KBETR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">₹ 32,800.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="MSME Invoices > 45 Days" typeBadge="NUMC" lenBadge="10" mappingCode="BSIK-BELNR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">0</span>
                  </EnterpriseFieldCard>
                </div>
              </div>

              {/* Section 3: Invoice Processing KPIs */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                  <span>Invoice Processing KPIs</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <EnterpriseFieldCard label="Invoice Processing TAT (Days)" typeBadge="DEC" lenBadge="5" mappingCode="RBKP-BLDAT/BUDAT" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">4.2 Days</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="First-Pass Approval Rate (%)" typeBadge="DEC" lenBadge="5" mappingCode="RBKP-RBSTAT" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">94.8%</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Blocked Invoice Count" typeBadge="NUMC" lenBadge="5" mappingCode="RBKP-RBSTAT" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">2</span>
                  </EnterpriseFieldCard>
                </div>
              </div>

              {/* Section 4: Filters */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                  <span>Filters</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <EnterpriseFieldCard label="Fiscal Year" typeBadge="NUMC" lenBadge="4" mappingCode="BKPF-GJAHR" isSapView={isSapView}>
                    <span className="font-bold text-stone-800 text-xs">2026</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Posting Period" typeBadge="NUMC" lenBadge="2" mappingCode="BKPF-MONAT" isSapView={isSapView}>
                    <span className="font-bold text-stone-800 text-xs">03</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Vendor" typeBadge="CHAR" lenBadge="10" mappingCode="BSIK-LIFNR" isSapView={isSapView}>
                    <span className="font-mono text-stone-850 font-bold text-xs">VND10023</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Payment Status" typeBadge="CHAR" lenBadge="10" mappingCode="BSEG-AUGBL" isSapView={isSapView}>
                    <span className="font-bold text-stone-850 text-xs">Cleared</span>
                  </EnterpriseFieldCard>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-stone-200 mt-6">
                <div className="flex gap-2">
                  <Button onClick={() => alert('Exporting AP aging Excel report')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-black hover:text-white hover:border-black font-bold text-xs px-5 rounded-lg h-9 shadow-sm">
                    Export AP Aging (Excel)
                  </Button>
                  <Button onClick={() => alert('Exporting MSME compliance report')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-black hover:text-white hover:border-black font-bold text-xs px-5 rounded-lg h-9 shadow-sm">
                    Export MSME Report
                  </Button>
                </div>
                <Button onClick={() => alert('Exporting TDS liability summary report')} className="bg-stone-850 hover:bg-black text-stone-700 hover:text-white font-bold text-xs px-6 rounded-lg h-9 transition-all shadow-sm">
                  Export TDS Summary
                </Button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 3. VENDOR SELF-SERVICE */}
          {detailTab === 'selfservice' && (
            <div className="space-y-6 animate-fade-in">
              {/* Section 1: My Account Snapshot */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                  <span>My Account Snapshot</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <EnterpriseFieldCard label="Open POs (₹)" typeBadge="CURR" lenBadge="13" mappingCode="EKKO-NETWR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">₹ 142,500.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Invoices Pending AP" typeBadge="CURR" lenBadge="13" mappingCode="RBKP-WRBTR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">₹ 84,600.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Next Payment Due (₹)" typeBadge="CURR" lenBadge="13" mappingCode="BSEGI-DMBTR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">₹ 42,500.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Performance Score" typeBadge="DEC" lenBadge="5" mappingCode="" isSapView={isSapView}>
                    <span className="font-bold text-stone-800 text-xs">92 / 100</span>
                  </EnterpriseFieldCard>
                </div>
              </div>

              {/* Section 2: Account Statement */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                  <span>Account Statement</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <EnterpriseFieldCard label="Date Range" typeBadge="DATS" lenBadge="8" mappingCode="BKPF-BUDAT" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">2026-05-01 to 2026-05-31</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Document Type Filter" typeBadge="CHAR" lenBadge="2" mappingCode="BKPF-BLART" isSapView={isSapView}>
                    <span className="font-bold text-stone-800 text-xs">RE (Invoice)</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Currency" typeBadge="CHAR" lenBadge="5" mappingCode="BKPF-WAERS" isSapView={isSapView}>
                    <span className="font-bold text-stone-800 text-xs">INR</span>
                  </EnterpriseFieldCard>
                </div>
              </div>

              {/* Section 3: Statement Line Columns */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                  <span>Statement Line Columns</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <EnterpriseFieldCard label="Document Date" typeBadge="DATS" lenBadge="8" mappingCode="BKPF-BLDAT" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">2026-05-28</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Invoice / Payment Reference" typeBadge="CHAR" lenBadge="16" mappingCode="BKPF-XBLNR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs select-all">INV-2025-0058</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Debit - Invoice (₹)" typeBadge="CURR" lenBadge="13" mappingCode="BSEG-WRBTR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">₹ 84,600.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Credit - Payment (₹)" typeBadge="CURR" lenBadge="13" mappingCode="BSEG-WRBTR" isSapView={isSapView}>
                    <span className="font-mono text-stone-850 font-bold text-xs">₹ 0.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Outstanding Balance (₹)" typeBadge="CURR" lenBadge="13" mappingCode="BSIK-DMBTR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">₹ 84,600.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Clearing Status" typeBadge="CHAR" lenBadge="10" mappingCode="BSEG-AUGBL" isSapView={isSapView}>
                    <span className="font-bold text-stone-800 text-xs">Open</span>
                  </EnterpriseFieldCard>
                </div>
              </div>

              {/* Section 4: TDS Summary */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                  <span>TDS Summary</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <EnterpriseFieldCard label="Fiscal Year" typeBadge="NUMC" lenBadge="4" mappingCode="WITH_ITEM-GJAHR" isSapView={isSapView}>
                    <span className="font-bold text-stone-800 text-xs">2026</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Quarter / Section" typeBadge="CHAR" lenBadge="2" mappingCode="WITH_ITEM-WITHT" isSapView={isSapView}>
                    <span className="font-bold text-stone-800 text-xs">Q1 / 194C</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Total TDS Deducted (₹)" typeBadge="CURR" lenBadge="13" mappingCode="WITH_ITEM-QBSHB" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">₹ 846.00</span>
                  </EnterpriseFieldCard>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-stone-200 mt-6">
                <div className="flex gap-2">
                  <Button onClick={() => alert('Exporting self-service ledger Excel sheet')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-black hover:text-white hover:border-black font-bold text-xs px-5 rounded-lg h-9 shadow-sm">
                    Export Statement (Excel)
                  </Button>
                  <Button onClick={() => alert('Exporting self-service ledger PDF report')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-black hover:text-white hover:border-black font-bold text-xs px-5 rounded-lg h-9 shadow-sm">
                    Export Statement (PDF)
                  </Button>
                </div>
                <Button onClick={() => alert('Downloading self-service TDS certificate summary')} className="bg-stone-850 hover:bg-black text-stone-700 hover:text-white font-bold text-xs px-6 rounded-lg h-9 transition-all shadow-sm">
                  Download TDS Summary
                </Button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 4. REPORT LIBRARY */}
          {detailTab === 'library' && (
            <div className="space-y-6 animate-fade-in">
              {/* Section 1: Standard SAP Reports */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                  <span>Standard SAP Reports</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <EnterpriseFieldCard label="Vendor Balance (S_ALR_87012078)" typeBadge="CURR" lenBadge="13" mappingCode="BSIK/BSAK-DMBTR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">₹ 127,100.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Vendor Line Items (FBL1N)" typeBadge="CURR" lenBadge="13" mappingCode="BSEG-WRBTR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">₹ 42,500.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Open PO Report (ME2M)" typeBadge="CURR" lenBadge="13" mappingCode="EKKO-NETWR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">₹ 142,500.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="GR/IR Clearing (MB5S)" typeBadge="CURR" lenBadge="13" mappingCode="BSEG-WRBTR" isSapView={isSapView}>
                    <span className="font-mono text-stone-855 font-bold text-xs">₹ 0.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="WHT Withholding Report (S_P00_07000134)" typeBadge="CURR" lenBadge="13" mappingCode="WITH_ITEM-QBSHB" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">₹ 1,271.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Spend Analysis (ME2L)" typeBadge="CURR" lenBadge="13" mappingCode="EKKO-NETWR" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">₹ 1,245,600.00</span>
                  </EnterpriseFieldCard>
                </div>
              </div>

              {/* Section 2: Custom Portal Reports */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                  <span>Custom Portal Reports</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <EnterpriseFieldCard label="Vendor Master Compliance" typeBadge="CHAR" lenBadge="15" mappingCode="LFA1-STCD1/STCD2" isSapView={isSapView}>
                    <span className="font-bold text-stone-800 text-xs">Compliant</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="MSME Overdue Tracker" typeBadge="CURR" lenBadge="13" mappingCode="BSIK-DMBTR" isSapView={isSapView}>
                    <span className="font-mono text-stone-855 font-bold text-xs">₹ 0.00</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Invoice Rejection Analysis" typeBadge="CHAR" lenBadge="1" mappingCode="RBKP-RBSTAT" isSapView={isSapView}>
                    <span className="font-bold text-stone-800 text-xs">0% Rejection</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="GST GSTR-2B Reconciliation" typeBadge="CHAR" lenBadge="15" mappingCode="LFA1-STCD3" isSapView={isSapView}>
                    <span className="font-bold text-stone-800 text-xs">Reconciled</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Document Expiry Tracker" typeBadge="DATS" lenBadge="8" mappingCode="LFA1-REDRY" isSapView={isSapView}>
                    <span className="font-bold text-stone-800 text-xs">No Expiring Docs</span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Scorecard Summary Report" typeBadge="DEC" lenBadge="5" mappingCode="" isSapView={isSapView}>
                    <span className="font-mono text-stone-800 font-bold text-xs">95.0</span>
                  </EnterpriseFieldCard>
                </div>
              </div>

              {/* Section 3: Scheduled Report Config */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                  <span>Scheduled Report Config</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <EnterpriseFieldCard label="Report Name" required={true} typeBadge="CHAR" lenBadge="60" mappingCode="" isSapView={isSapView}>
                    <input
                      type="text"
                      placeholder="e.g. Weekly AP Aging"
                      value={schedulerForm.reportName}
                      onChange={e => setSchedulerForm({ ...schedulerForm, reportName: e.target.value })}
                      className="w-full bg-white border border-stone-200 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none text-stone-900 transition-all font-semibold"
                    />
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Recipients (Email)" required={true} typeBadge="CHAR" lenBadge="255" mappingCode="ADR6-SMTP_ADDR" isSapView={isSapView}>
                    <input
                      type="text"
                      placeholder="CFO, Finance Director, etc."
                      value={schedulerForm.recipients}
                      onChange={e => setSchedulerForm({ ...schedulerForm, recipients: e.target.value })}
                      className="w-full bg-white border border-stone-200 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none text-stone-900 transition-all font-semibold font-mono"
                    />
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Frequency" required={true} typeBadge="CHAR" lenBadge="10" mappingCode="" isSapView={isSapView}>
                    <input
                      type="text"
                      placeholder="Daily / Weekly / Monthly"
                      value={schedulerForm.frequency}
                      onChange={e => setSchedulerForm({ ...schedulerForm, frequency: e.target.value })}
                      className="w-full bg-white border border-stone-200 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none text-stone-900 transition-all font-semibold"
                    />
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Format" typeBadge="CHAR" lenBadge="5" mappingCode="" isSapView={isSapView}>
                    <input
                      type="text"
                      placeholder="Excel / PDF"
                      value={schedulerForm.format}
                      onChange={e => setSchedulerForm({ ...schedulerForm, format: e.target.value })}
                      className="w-full bg-white border border-stone-200 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none text-stone-900 transition-all font-semibold"
                    />
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Company Code Filter" typeBadge="CHAR" lenBadge="4" mappingCode="EKKO-BUKRS" isSapView={isSapView}>
                    <input
                      type="text"
                      placeholder="Scope by company code"
                      value={schedulerForm.companyCode}
                      onChange={e => setSchedulerForm({ ...schedulerForm, companyCode: e.target.value })}
                      className="w-full bg-white border border-stone-200 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none text-stone-900 transition-all font-semibold font-mono"
                    />
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Next Run" typeBadge="DATS" lenBadge="8" mappingCode="" isSapView={isSapView}>
                    <input
                      type="text"
                      placeholder="Next scheduled execution"
                      value={schedulerForm.nextRun}
                      onChange={e => setSchedulerForm({ ...schedulerForm, nextRun: e.target.value })}
                      className="w-full bg-white border border-stone-200 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none text-stone-900 transition-all font-semibold font-mono"
                    />
                  </EnterpriseFieldCard>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-stone-200 mt-6">
                <Button onClick={() => alert('Triggering instant report generation')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-black hover:text-white hover:border-black font-bold text-xs px-5 rounded-lg h-9 shadow-sm">
                  Run Now
                  </Button>
                <Button onClick={() => alert(`Saving report schedule configuration: ${schedulerForm.reportName || 'Untitled'}`)} className="bg-stone-850 hover:bg-black text-stone-700 hover:text-white font-bold text-xs px-6 rounded-lg h-9 transition-all shadow-sm">
                  Save Schedule
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
