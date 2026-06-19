'use client';

import React, { useState } from 'react';
import {
  FileText, Calendar, Table, CheckCircle2, ChevronRight, FileSpreadsheet, Download,
  TrendingUp, Users, ShoppingBag, Percent, BarChart3, Layers, Building2,
  Clock, Activity, Filter, Receipt, ShieldCheck, Zap, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Compact inline field cell for SAP-style layout
function InlineFieldCell({ label, icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2.5 py-2 px-3.5 hover:bg-stone-50/50 transition-colors select-none min-h-[38px] shrink-0">
      <span className="text-[10.5px] font-semibold text-stone-500 shrink-0 select-none">
        {label}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        {Icon && <Icon className="size-3.5 text-stone-400 shrink-0" />}
        <div className="text-stone-900 font-bold text-[11px] flex items-center">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ReportsAnalyticsView({ state }) {
  const [detailTab, setDetailTab] = useState('procurement'); // 'procurement' | 'finance' | 'selfservice' | 'library'

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
    <div className="space-y-6 max-w-full mx-auto animate-fade-in pb-16 relative">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4 select-none">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <FileSpreadsheet className="size-5.5 text-primary shrink-0" /> Reports &amp; Analytics
          </h2>
          <p className="text-stone-500 text-xs font-semibold">
            Operational spend analytics, treasury payables ledger aging, and self-service report scheduling
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white border border-stone-300 hover:border-stone-400 rounded-md py-1.5 px-3 text-xs outline-none text-stone-700 font-semibold h-9 shadow-sm transition-all cursor-pointer">
            <Calendar className="size-3.5 text-stone-400" />
            <span>01 Jan 2026 - 31 Dec 2026</span>
          </div>
          <button 
            type="button"
            className="flex items-center gap-2 bg-white border border-stone-300 hover:border-stone-400 hover:bg-stone-50 text-stone-700 font-semibold px-3 h-9 rounded-md transition-colors text-xs cursor-pointer shadow-sm"
            onClick={() => alert('Opening Filters pane')}
          >
            <Filter className="size-3.5 text-stone-400" />
            <span>Filters</span>
          </button>
          <button 
            type="button"
            className="flex items-center gap-2 bg-white border border-stone-300 hover:border-stone-400 hover:bg-stone-50 text-stone-700 font-semibold px-3 h-9 rounded-md transition-colors text-xs cursor-pointer shadow-sm"
            onClick={() => alert('Exporting analytics report')}
          >
            <Download className="size-3.5 text-stone-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        
        {/* TAB NAVIGATION BAR */}
        <div className="flex flex-wrap border-b border-border select-none bg-white p-1 rounded-sm shadow-xs w-fit">
          {[
            { id: 'procurement', label: 'Procurement Dashboard' },
            { id: 'finance', label: 'Finance & AP Reports' },
            { id: 'selfservice', label: 'Vendor Self-Service' },
            { id: 'library', label: 'Report Library (SAP Standard)' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setDetailTab(t.id)}
              className={`pb-2 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                detailTab === t.id
                  ? 'border-primary text-primary font-extrabold'
                  : 'border-transparent text-stone-400 hover:text-stone-750'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT BLOCK */}
        <div className="space-y-6 bg-transparent">

          {/* TAB CONTENT: 1. PROCUREMENT DASHBOARD */}
          {detailTab === 'procurement' && (
            <div className="space-y-6 animate-fade-in">
              {/* Section 1: Dashboard KPI Cards */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  Procurement KPIs
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                  <InlineFieldCell label="Total Spend YTD" icon={TrendingUp}>
                    <span className="font-mono text-stone-900 font-extrabold">₹ 1,245,600.00</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Active Vendors" icon={Users}>
                    <span className="font-mono text-stone-850 font-bold">12</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Open POs - Count" icon={ShoppingBag}>
                    <span className="font-mono text-stone-850 font-bold">4</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="RFQ Participation Rate" icon={Percent}>
                    <span className="font-mono text-stone-850 font-bold">85.5%</span>
                  </InlineFieldCell>
                </div>
              </div>

              {/* Section 2: Spend Analytics */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  Spend Analytics breakdown
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                  <InlineFieldCell label="Spend by Vendor - Top 10" icon={Users}>
                    <span className="font-mono text-stone-850 font-bold">₹ 450,000.00</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Spend by Material Group" icon={Layers}>
                    <span className="font-bold text-stone-850">Services</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Spend by Plant" icon={Building2}>
                    <span className="font-bold text-stone-850 font-mono">PL01</span>
                  </InlineFieldCell>
                </div>
              </div>

              {/* Section 3: Delivery Performance */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  Delivery Compliance metrics
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                  <InlineFieldCell label="On-Time Delivery %" icon={Clock}>
                    <span className="font-mono text-green-700 font-bold">96.2%</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Avg PO Acknowledgment" icon={Activity}>
                    <span className="font-mono text-stone-850 font-bold">1.5 Days</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Fulfillment Rate (%)" icon={CheckCircle2}>
                    <span className="font-mono text-stone-850 font-bold">98.0%</span>
                  </InlineFieldCell>
                </div>
              </div>

              {/* Section 4: Filters & Export */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  Filter Parameters
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                  <InlineFieldCell label="Company Code" icon={Filter}>
                    <span className="font-bold text-stone-850">1000</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Plant" icon={Filter}>
                    <span className="font-bold text-stone-850 font-mono">1000 - Mumbai</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Date Range" icon={Calendar}>
                    <span className="font-mono text-stone-850 font-bold">2026-01-01 to 2026-12-31</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Vendor Category" icon={Filter}>
                    <span className="font-bold text-stone-850">Domestic</span>
                  </InlineFieldCell>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between items-center bg-white border border-stone-200 rounded-md p-4 shadow-sm w-full">
                <div className="flex gap-2">
                  <Button onClick={() => alert('Exporting dashboard PDF')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs px-5 rounded-md h-9 cursor-pointer">
                    Export PDF
                  </Button>
                  <Button onClick={() => alert('Exporting dashboard Excel')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs px-5 rounded-md h-9 cursor-pointer">
                    Export Excel
                  </Button>
                </div>
                <Button onClick={() => setDetailTab('library')} className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 rounded-md h-9 transition-all shadow-xs cursor-pointer">
                  Schedule Automatic Report
                </Button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2. FINANCE & AP REPORTS */}
          {detailTab === 'finance' && (
            <div className="space-y-6 animate-fade-in">
              {/* Section 1: AP Aging Summary */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  Accounts Payable Aging Summary
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                  <InlineFieldCell label="Payables 0-30 Days" icon={Clock}>
                    <span className="font-mono text-stone-900 font-bold">₹ 45,000.00</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Payables 31-60 Days" icon={Clock}>
                    <span className="font-mono text-stone-900 font-bold">₹ 18,200.00</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Payables 61-90 Days" icon={Clock}>
                    <span className="font-mono text-stone-400 font-bold">₹ 0.00</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Overdue > 90 Days" icon={AlertTriangle}>
                    <span className="font-mono text-stone-400 font-bold">₹ 0.00</span>
                  </InlineFieldCell>
                </div>
              </div>

              {/* Section 2: Tax & Compliance */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  Tax withheld &amp; GST compliance
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                  <InlineFieldCell label="TDS Liability - Quarter" icon={Receipt}>
                    <span className="font-mono text-stone-850 font-bold">₹ 12,450.00</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="GST Input Tax Available" icon={ShieldCheck}>
                    <span className="font-mono text-stone-850 font-bold">₹ 32,800.00</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="MSME Invoices > 45 Days" icon={CheckCircle2}>
                    <span className="font-mono text-green-700 font-bold">0 (Compliant)</span>
                  </InlineFieldCell>
                </div>
              </div>

              {/* Section 3: Invoice Processing KPIs */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  Invoice Processing speed indicators
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                  <InlineFieldCell label="Invoice Processing TAT" icon={Clock}>
                    <span className="font-mono text-stone-850 font-bold">4.2 Days</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="First-Pass Approval Rate" icon={Zap}>
                    <span className="font-mono text-green-700 font-bold">94.8%</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Blocked Invoice Count" icon={AlertTriangle}>
                    <span className="font-mono text-red-600 font-bold">2</span>
                  </InlineFieldCell>
                </div>
              </div>

              {/* Section 4: Filters */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  Filter parameters
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                  <InlineFieldCell label="Fiscal Year" icon={Filter}>
                    <span className="font-bold text-stone-850 font-mono">2026</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Posting Period" icon={Filter}>
                    <span className="font-bold text-stone-850 font-mono">03</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Vendor" icon={Filter}>
                    <span className="font-mono text-stone-850 font-bold">VND10023</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Payment Status" icon={Filter}>
                    <span className="font-bold text-stone-850">Cleared</span>
                  </InlineFieldCell>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between items-center bg-white border border-stone-200 rounded-md p-4 shadow-sm w-full">
                <div className="flex gap-2">
                  <Button onClick={() => alert('Exporting AP aging Excel report')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs px-5 rounded-md h-9 cursor-pointer">
                    Export AP Aging (Excel)
                  </Button>
                  <Button onClick={() => alert('Exporting MSME compliance report')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs px-5 rounded-md h-9 cursor-pointer">
                    Export MSME Report
                  </Button>
                </div>
                <Button onClick={() => alert('Exporting TDS liability summary report')} className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 rounded-md h-9 transition-all shadow-xs cursor-pointer">
                  Export TDS Summary
                </Button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 3. VENDOR SELF-SERVICE */}
          {detailTab === 'selfservice' && (
            <div className="space-y-6 animate-fade-in">
              {/* Section 1: My Account Snapshot */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  Account Snapshot
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                  <InlineFieldCell label="Open POs Value" icon={ShoppingBag}>
                    <span className="font-mono text-stone-900 font-bold">₹ 142,500.00</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Invoices Pending AP" icon={Receipt}>
                    <span className="font-mono text-stone-900 font-bold">₹ 84,600.00</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Next Payment Due" icon={Calendar}>
                    <span className="font-mono text-stone-900 font-bold">₹ 42,500.00</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Performance Score" icon={Activity}>
                    <span className="font-bold text-stone-850 font-mono">92 / 100</span>
                  </InlineFieldCell>
                </div>
              </div>

              {/* Section 2: Account Statement */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  Statement ledger range
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                  <InlineFieldCell label="Date Range" icon={Calendar}>
                    <span className="font-mono text-stone-850 font-bold">2026-05-01 to 2026-05-31</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Document Type Filter" icon={Filter}>
                    <span className="font-bold text-stone-850">RE (Invoice)</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Currency" icon={Receipt}>
                    <span className="font-bold text-stone-850">INR</span>
                  </InlineFieldCell>
                </div>
              </div>

              {/* Section 3: Statement Line Columns */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  Last transaction parameters
                </h4>
                <div className="space-y-2.5">
                  {/* Row 1: References & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                    <InlineFieldCell label="Document Date" icon={Calendar}>
                      <span className="font-mono text-stone-850 font-bold">2026-05-28</span>
                    </InlineFieldCell>

                    <InlineFieldCell label="Invoice / Payment Ref" icon={FileText}>
                      <span className="font-mono text-stone-900 font-bold select-all">INV-2025-0058</span>
                    </InlineFieldCell>

                    <InlineFieldCell label="Clearing Status" icon={CheckCircle2}>
                      <span className="text-amber-600 font-bold text-xs font-mono uppercase">Open (Un-cleared)</span>
                    </InlineFieldCell>
                  </div>

                  {/* Row 2: Balances */}
                  <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                    <InlineFieldCell label="Debit - Invoice" icon={Receipt}>
                      <span className="font-mono text-stone-850 font-bold">₹ 84,600.00</span>
                    </InlineFieldCell>

                    <InlineFieldCell label="Credit - Payment" icon={Receipt}>
                      <span className="font-mono text-stone-400 font-bold">₹ 0.00</span>
                    </InlineFieldCell>

                    <InlineFieldCell label="Outstanding Balance" icon={Receipt}>
                      <span className="font-mono text-stone-900 font-bold">₹ 84,600.00</span>
                    </InlineFieldCell>
                  </div>
                </div>
              </div>

              {/* Section 4: TDS Summary */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  Withholding Tax Summary
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                  <InlineFieldCell label="Fiscal Year" icon={Calendar}>
                    <span className="font-bold text-stone-850 font-mono">2026</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Quarter / Section" icon={Filter}>
                    <span className="font-bold text-stone-850 font-mono">Q1 / 194C</span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Total TDS Deducted" icon={Receipt}>
                    <span className="font-mono text-red-600 font-bold">₹ 846.00</span>
                  </InlineFieldCell>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between items-center bg-white border border-stone-200 rounded-md p-4 shadow-sm w-full">
                <div className="flex gap-2">
                  <Button onClick={() => alert('Exporting self-service ledger Excel sheet')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs px-5 rounded-md h-9 cursor-pointer">
                    Export Statement (Excel)
                  </Button>
                  <Button onClick={() => alert('Exporting self-service ledger PDF report')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs px-5 rounded-md h-9 cursor-pointer">
                    Export Statement (PDF)
                  </Button>
                </div>
                <Button onClick={() => alert('Downloading self-service TDS certificate summary')} className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 rounded-md h-9 transition-all shadow-xs cursor-pointer">
                  Download TDS Summary Advice
                </Button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 4. REPORT LIBRARY */}
          {detailTab === 'library' && (
            <div className="space-y-6 animate-fade-in">
              {/* Section 1: Standard SAP Reports */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  Standard SAP Transaction Codes (T-Codes)
                </h4>
                <div className="space-y-2.5">
                  {/* Row 1 */}
                  <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                    <InlineFieldCell label="Vendor Balance (S_ALR_87012078)" icon={Table}>
                      <span className="font-mono text-stone-850 font-bold">₹ 127,100.00</span>
                    </InlineFieldCell>

                    <InlineFieldCell label="Vendor Line Items (FBL1N)" icon={Table}>
                      <span className="font-mono text-stone-850 font-bold">₹ 42,500.00</span>
                    </InlineFieldCell>

                    <InlineFieldCell label="Open PO Report (ME2M)" icon={Table}>
                      <span className="font-mono text-stone-850 font-bold">₹ 142,500.00</span>
                    </InlineFieldCell>
                  </div>

                  {/* Row 2 */}
                  <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                    <InlineFieldCell label="GR/IR Clearing (MB5S)" icon={Table}>
                      <span className="font-mono text-stone-400 font-bold">₹ 0.00</span>
                    </InlineFieldCell>

                    <InlineFieldCell label="WHT Withholding (S_P00_07000134)" icon={Table}>
                      <span className="font-mono text-stone-850 font-bold">₹ 1,271.00</span>
                    </InlineFieldCell>

                    <InlineFieldCell label="Spend Analysis (ME2L)" icon={Table}>
                      <span className="font-mono text-stone-850 font-bold">₹ 1,245,600.00</span>
                    </InlineFieldCell>
                  </div>
                </div>
              </div>

              {/* Section 2: Custom Portal Reports */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  Custom Portal Reports
                </h4>
                <div className="space-y-2.5">
                  {/* Row 1 */}
                  <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                    <InlineFieldCell label="Vendor Master Compliance" icon={ShieldCheck}>
                      <span className="px-2 py-0.5 rounded-sm text-[9px] font-extrabold border bg-green-50 text-green-700 border-green-200 inline-flex items-center gap-1 font-mono uppercase">
                        COMPLIANT
                      </span>
                    </InlineFieldCell>

                    <InlineFieldCell label="MSME Overdue Tracker" icon={ShieldCheck}>
                      <span className="font-mono text-green-700 font-bold">₹ 0.00 (Cleared)</span>
                    </InlineFieldCell>

                    <InlineFieldCell label="Scorecard Summary Report" icon={Activity}>
                      <span className="font-mono text-stone-850 font-bold">95.0 / 100</span>
                    </InlineFieldCell>
                  </div>

                  {/* Row 2 */}
                  <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                    <InlineFieldCell label="Invoice Rejection Analysis" icon={Activity}>
                      <span className="font-bold text-green-700">0% Rejection Rate</span>
                    </InlineFieldCell>

                    <InlineFieldCell label="GST GSTR-2B Reconciliation" icon={ShieldCheck}>
                      <span className="px-2 py-0.5 rounded-sm text-[9px] font-extrabold border bg-green-50 text-green-700 border-green-200 inline-flex items-center gap-1 font-mono uppercase">
                        RECONCILED
                      </span>
                    </InlineFieldCell>

                    <InlineFieldCell label="Document Expiry Tracker" icon={Calendar}>
                      <span className="font-bold text-stone-850 font-mono">No Expiring Documents</span>
                    </InlineFieldCell>
                  </div>
                </div>
              </div>

              {/* Section 3: Scheduled Report Config */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  Configure Self-Service Report Schedule
                </h4>
                <div className="space-y-2.5">
                  {/* Row 1 inputs */}
                  <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                    <InlineFieldCell label="Report Name" icon={FileText}>
                      <input
                        type="text"
                        placeholder="e.g. Weekly AP Aging"
                        value={schedulerForm.reportName}
                        onChange={e => setSchedulerForm({ ...schedulerForm, reportName: e.target.value })}
                        className="w-44 bg-white border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary rounded-sm py-1 px-2 text-[11px] outline-none text-stone-900 font-bold h-7 transition-all"
                      />
                    </InlineFieldCell>

                    <InlineFieldCell label="Recipients (Email)" icon={Users}>
                      <input
                        type="text"
                        placeholder="CFO, Finance Director, etc."
                        value={schedulerForm.recipients}
                        onChange={e => setSchedulerForm({ ...schedulerForm, recipients: e.target.value })}
                        className="w-48 bg-white border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary rounded-sm py-1 px-2 text-[11px] outline-none text-stone-900 font-mono font-bold h-7 transition-all"
                      />
                    </InlineFieldCell>

                    <InlineFieldCell label="Frequency" icon={Activity}>
                      <input
                        type="text"
                        placeholder="Daily / Weekly / Monthly"
                        value={schedulerForm.frequency}
                        onChange={e => setSchedulerForm({ ...schedulerForm, frequency: e.target.value })}
                        className="w-44 bg-white border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary rounded-sm py-1 px-2 text-[11px] outline-none text-stone-900 font-bold h-7 transition-all"
                      />
                    </InlineFieldCell>
                  </div>

                  {/* Row 2 inputs */}
                  <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                    <InlineFieldCell label="Format" icon={FileText}>
                      <input
                        type="text"
                        placeholder="Excel / PDF"
                        value={schedulerForm.format}
                        onChange={e => setSchedulerForm({ ...schedulerForm, format: e.target.value })}
                        className="w-44 bg-white border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary rounded-sm py-1 px-2 text-[11px] outline-none text-stone-900 font-bold h-7 transition-all"
                      />
                    </InlineFieldCell>

                    <InlineFieldCell label="Company Code Filter" icon={Building2}>
                      <input
                        type="text"
                        placeholder="Scope by company code"
                        value={schedulerForm.companyCode}
                        onChange={e => setSchedulerForm({ ...schedulerForm, companyCode: e.target.value })}
                        className="w-44 bg-white border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary rounded-sm py-1 px-2 text-[11px] outline-none text-stone-900 font-mono font-bold h-7 transition-all"
                      />
                    </InlineFieldCell>

                    <InlineFieldCell label="Next Run" icon={Calendar}>
                      <input
                        type="text"
                        placeholder="Next scheduled execution"
                        value={schedulerForm.nextRun}
                        onChange={e => setSchedulerForm({ ...schedulerForm, nextRun: e.target.value })}
                        className="w-44 bg-white border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary rounded-sm py-1 px-2 text-[11px] outline-none text-stone-900 font-mono font-bold h-7 transition-all"
                      />
                    </InlineFieldCell>
                  </div>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between items-center bg-white border border-stone-200 rounded-md p-4 shadow-sm w-full">
                <Button onClick={() => alert('Triggering instant report generation')} variant="outline" className="border-stone-300 text-stone-750 hover:bg-stone-50 font-bold text-xs px-5 rounded-md h-9 cursor-pointer">
                  Run Report Now
                </Button>
                <Button onClick={() => alert(`Saving report schedule configuration: ${schedulerForm.reportName || 'Untitled'}`)} className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 rounded-md h-9 transition-all shadow-xs cursor-pointer">
                  Save Schedule Config
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
