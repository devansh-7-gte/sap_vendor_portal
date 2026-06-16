'use client';

import React, { useState } from 'react';
import { FileText, Calendar, Table, CheckCircle2, ChevronRight, FileSpreadsheet, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Enterprise Field Card (Fiori Inspired Row Layout)
function EnterpriseFieldCard({ label, required, error, labelWidth, children }) {
  return (
    <div className={`h-full py-1.5 px-3 bg-white transition-all flex flex-col sm:flex-row sm:items-center gap-2 select-none ${
      error ? 'bg-red-50/10' : 'hover:bg-stone-50/30 focus-within:bg-stone-50/50'
    }`}>
      <label className={`text-xs font-bold text-stone-750 ${labelWidth || 'sm:w-56'} shrink-0 whitespace-normal select-none block`} title={label}>
        {label} {required && <span className="text-red-500 font-bold select-none ml-0.5">*</span>}
      </label>
      <div className="flex-1 w-full min-w-0 flex flex-col justify-center">
        {children}
        {error && (
          <span className="text-[10px] font-bold text-red-655 mt-1 select-none">{error}</span>
        )}
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
      <div className="bg-white border border-border p-4 rounded-sm shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 flex items-center gap-2">
            <FileSpreadsheet className="size-4.5 text-primary" /> Reports &amp; Analytics Portal
          </h2>
          <p className="text-[11px] text-stone-500 mt-1 font-semibold">
            Operational spend analytics, treasury payables ledger aging, and self-service report scheduling
          </p>
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
        <div className="bg-white border border-stone-200 rounded-sm p-6 shadow-xs space-y-6">

          {/* TAB CONTENT: 1. PROCUREMENT DASHBOARD */}
          {detailTab === 'procurement' && (
            <div className="space-y-6 animate-fade-in">
              {/* Section 1: Dashboard KPI Cards */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  Procurement KPIs
                </h4>
                <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[260px] shrink-0">
                      <EnterpriseFieldCard label="Total Spend YTD" labelWidth="sm:w-36">
                        <span className="font-mono text-stone-900 font-extrabold text-xs">₹ 1,245,600.00</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[220px] shrink-0">
                      <EnterpriseFieldCard label="Active Vendors" labelWidth="sm:w-28">
                        <span className="font-mono text-stone-850 font-bold text-xs">12</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[240px] shrink-0">
                      <EnterpriseFieldCard label="Open POs - Count" labelWidth="sm:w-36">
                        <span className="font-mono text-stone-850 font-bold text-xs">4</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[280px] shrink-0">
                      <EnterpriseFieldCard label="RFQ Participation Rate" labelWidth="sm:w-44">
                        <span className="font-mono text-stone-850 font-bold text-xs">85.5%</span>
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Spend Analytics */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  Spend Analytics breakdown
                </h4>
                <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[320px] shrink-0">
                      <EnterpriseFieldCard label="Spend by Vendor - Top 10" labelWidth="sm:w-44">
                        <span className="font-mono text-stone-850 font-bold text-xs">₹ 450,000.00</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[320px] shrink-0">
                      <EnterpriseFieldCard label="Spend by Material Group" labelWidth="sm:w-44">
                        <span className="font-bold text-stone-850 text-xs">Services</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[240px] shrink-0">
                      <EnterpriseFieldCard label="Spend by Plant" labelWidth="sm:w-32">
                        <span className="font-bold text-stone-850 text-xs font-mono">PL01</span>
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Delivery Performance */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  Delivery Compliance metrics
                </h4>
                <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[280px] shrink-0">
                      <EnterpriseFieldCard label="On-Time Delivery %" labelWidth="sm:w-36">
                        <span className="font-mono text-green-700 font-bold text-xs">96.2%</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[320px] shrink-0">
                      <EnterpriseFieldCard label="Avg PO Acknowledgment" labelWidth="sm:w-44">
                        <span className="font-mono text-stone-850 font-bold text-xs">1.5 Days</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[280px] shrink-0">
                      <EnterpriseFieldCard label="Fulfillment Rate (%)" labelWidth="sm:w-36">
                        <span className="font-mono text-stone-850 font-bold text-xs">98.0%</span>
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Filters & Export */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  Filter Parameters
                </h4>
                <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[220px] shrink-0">
                      <EnterpriseFieldCard label="Company Code" labelWidth="sm:w-28">
                        <span className="font-bold text-stone-850 text-xs">1000</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[240px] shrink-0">
                      <EnterpriseFieldCard label="Plant" labelWidth="sm:w-20">
                        <span className="font-bold text-stone-850 text-xs font-mono">1000 - Mumbai</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[340px] shrink-0">
                      <EnterpriseFieldCard label="Date Range" labelWidth="sm:w-24">
                        <span className="font-mono text-stone-850 font-bold text-xs">2026-01-01 to 2026-12-31</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[280px] shrink-0">
                      <EnterpriseFieldCard label="Vendor Category" labelWidth="sm:w-32">
                        <span className="font-bold text-stone-850 text-xs">Domestic</span>
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-stone-200 mt-6">
                <div className="flex gap-2">
                  <Button onClick={() => alert('Exporting dashboard PDF')} variant="outline" className="border-stone-300 text-stone-750 hover:bg-stone-50 font-bold text-xs px-5 rounded-sm h-9 shadow-sm cursor-pointer">
                    Export PDF
                  </Button>
                  <Button onClick={() => alert('Exporting dashboard Excel')} variant="outline" className="border-stone-300 text-stone-750 hover:bg-stone-50 font-bold text-xs px-5 rounded-sm h-9 shadow-sm cursor-pointer">
                    Export Excel
                  </Button>
                </div>
                <Button onClick={() => setDetailTab('library')} className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 rounded-sm h-9 transition-all shadow-xs cursor-pointer">
                  Schedule Automatic Report
                </Button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2. FINANCE & AP REPORTS */}
          {detailTab === 'finance' && (
            <div className="space-y-6 animate-fade-in">
              {/* Section 1: AP Aging Summary */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  Accounts Payable Aging Summary
                </h4>
                <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[240px] shrink-0">
                      <EnterpriseFieldCard label="Payables 0-30 Days" labelWidth="sm:w-36">
                        <span className="font-mono text-stone-905 font-bold text-xs">₹ 45,000.00</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[240px] shrink-0">
                      <EnterpriseFieldCard label="Payables 31-60 Days" labelWidth="sm:w-36">
                        <span className="font-mono text-stone-905 font-bold text-xs">₹ 18,200.00</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[240px] shrink-0">
                      <EnterpriseFieldCard label="Payables 61-90 Days" labelWidth="sm:w-36">
                        <span className="font-mono text-stone-400 font-bold text-xs">₹ 0.00</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[240px] shrink-0">
                      <EnterpriseFieldCard label="Overdue > 90 Days" labelWidth="sm:w-36">
                        <span className="font-mono text-stone-400 font-bold text-xs">₹ 0.00</span>
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Tax & Compliance */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  Tax withheld &amp; GST compliance
                </h4>
                <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[320px] shrink-0">
                      <EnterpriseFieldCard label="TDS Liability - Quarter" labelWidth="sm:w-44">
                        <span className="font-mono text-stone-850 font-bold text-xs">₹ 12,450.00</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[320px] shrink-0">
                      <EnterpriseFieldCard label="GST Input Tax Available" labelWidth="sm:w-44">
                        <span className="font-mono text-stone-850 font-bold text-xs">₹ 32,800.00</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[320px] shrink-0">
                      <EnterpriseFieldCard label="MSME Invoices > 45 Days" labelWidth="sm:w-48">
                        <span className="font-mono text-green-700 font-bold text-xs">0 (Compliant)</span>
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Invoice Processing KPIs */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  Invoice Processing speed indicators
                </h4>
                <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[280px] shrink-0">
                      <EnterpriseFieldCard label="Invoice Processing TAT" labelWidth="sm:w-44">
                        <span className="font-mono text-stone-850 font-bold text-xs">4.2 Days</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[300px] shrink-0">
                      <EnterpriseFieldCard label="First-Pass Approval Rate" labelWidth="sm:w-44">
                        <span className="font-mono text-green-700 font-bold text-xs">94.8%</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[280px] shrink-0">
                      <EnterpriseFieldCard label="Blocked Invoice Count" labelWidth="sm:w-44">
                        <span className="font-mono text-red-655 font-bold text-xs">2</span>
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Filters */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  Filter parameters
                </h4>
                <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[200px] shrink-0">
                      <EnterpriseFieldCard label="Fiscal Year" labelWidth="sm:w-20">
                        <span className="font-bold text-stone-850 text-xs font-mono">2026</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[220px] shrink-0">
                      <EnterpriseFieldCard label="Posting Period" labelWidth="sm:w-24">
                        <span className="font-bold text-stone-850 text-xs font-mono">03</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[220px] shrink-0">
                      <EnterpriseFieldCard label="Vendor" labelWidth="sm:w-16">
                        <span className="font-mono text-stone-850 font-bold text-xs">VND10023</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[240px] shrink-0">
                      <EnterpriseFieldCard label="Payment Status" labelWidth="sm:w-28">
                        <span className="font-bold text-stone-850 text-xs">Cleared</span>
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-stone-200 mt-6">
                <div className="flex gap-2">
                  <Button onClick={() => alert('Exporting AP aging Excel report')} variant="outline" className="border-stone-300 text-stone-750 hover:bg-stone-50 font-bold text-xs px-5 rounded-sm h-9 shadow-sm cursor-pointer">
                    Export AP Aging (Excel)
                  </Button>
                  <Button onClick={() => alert('Exporting MSME compliance report')} variant="outline" className="border-stone-300 text-stone-750 hover:bg-stone-50 font-bold text-xs px-5 rounded-sm h-9 shadow-sm cursor-pointer">
                    Export MSME Report
                  </Button>
                </div>
                <Button onClick={() => alert('Exporting TDS liability summary report')} className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 rounded-sm h-9 transition-all shadow-xs cursor-pointer">
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
                <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  Account Snapshot
                </h4>
                <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[240px] shrink-0">
                      <EnterpriseFieldCard label="Open POs Value" labelWidth="sm:w-36">
                        <span className="font-mono text-stone-900 font-bold text-xs">₹ 142,500.00</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[260px] shrink-0">
                      <EnterpriseFieldCard label="Invoices Pending AP" labelWidth="sm:w-36">
                        <span className="font-mono text-stone-900 font-bold text-xs">₹ 84,600.00</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[240px] shrink-0">
                      <EnterpriseFieldCard label="Next Payment Due" labelWidth="sm:w-36">
                        <span className="font-mono text-stone-900 font-bold text-xs">₹ 42,500.00</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[240px] shrink-0">
                      <EnterpriseFieldCard label="Performance Score" labelWidth="sm:w-36">
                        <span className="font-bold text-stone-850 text-xs font-mono">92 / 100</span>
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Account Statement */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  Statement ledger range
                </h4>
                <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[320px] shrink-0">
                      <EnterpriseFieldCard label="Date Range" labelWidth="sm:w-24">
                        <span className="font-mono text-stone-850 font-bold text-xs">2026-05-01 to 2026-05-31</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[300px] shrink-0">
                      <EnterpriseFieldCard label="Document Type Filter" labelWidth="sm:w-44">
                        <span className="font-bold text-stone-850 text-xs">RE (Invoice)</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[200px] shrink-0">
                      <EnterpriseFieldCard label="Currency" labelWidth="sm:w-20">
                        <span className="font-bold text-stone-850 text-xs">INR</span>
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Statement Line Columns */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  Last transaction parameters
                </h4>
                <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[240px] shrink-0">
                      <EnterpriseFieldCard label="Document Date" labelWidth="sm:w-32">
                        <span className="font-mono text-stone-850 font-bold text-xs">2026-05-28</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[360px] shrink-0">
                      <EnterpriseFieldCard label="Invoice / Payment Ref" labelWidth="sm:w-44">
                        <span className="font-mono text-stone-900 font-bold text-xs select-all">INV-2025-0058</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[260px] shrink-0">
                      <EnterpriseFieldCard label="Debit - Invoice" labelWidth="sm:w-32">
                        <span className="font-mono text-stone-850 font-bold text-xs">₹ 84,600.00</span>
                      </EnterpriseFieldCard>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[240px] shrink-0">
                      <EnterpriseFieldCard label="Credit - Payment" labelWidth="sm:w-32">
                        <span className="font-mono text-stone-405 font-bold text-xs">₹ 0.00</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[280px] shrink-0">
                      <EnterpriseFieldCard label="Outstanding Balance" labelWidth="sm:w-40">
                        <span className="font-mono text-stone-900 font-bold text-xs">₹ 84,600.00</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[300px] shrink-0">
                      <EnterpriseFieldCard label="Clearing Status" labelWidth="sm:w-32">
                        <span className="text-amber-605 font-bold text-xs font-mono uppercase">Open (Un-cleared)</span>
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: TDS Summary */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  Withholding Tax Summary
                </h4>
                <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[200px] shrink-0">
                      <EnterpriseFieldCard label="Fiscal Year" labelWidth="sm:w-24">
                        <span className="font-bold text-stone-850 text-xs font-mono">2026</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[240px] shrink-0">
                      <EnterpriseFieldCard label="Quarter / Section" labelWidth="sm:w-32">
                        <span className="font-bold text-stone-850 text-xs font-mono">Q1 / 194C</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[260px] shrink-0">
                      <EnterpriseFieldCard label="Total TDS Deducted" labelWidth="sm:w-36">
                        <span className="font-mono text-red-655 font-bold text-xs">₹ 846.00</span>
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-stone-200 mt-6">
                <div className="flex gap-2">
                  <Button onClick={() => alert('Exporting self-service ledger Excel sheet')} variant="outline" className="border-stone-300 text-stone-750 hover:bg-stone-50 font-bold text-xs px-5 rounded-sm h-9 shadow-sm cursor-pointer">
                    Export Statement (Excel)
                  </Button>
                  <Button onClick={() => alert('Exporting self-service ledger PDF report')} variant="outline" className="border-stone-300 text-stone-750 hover:bg-stone-50 font-bold text-xs px-5 rounded-sm h-9 shadow-sm cursor-pointer">
                    Export Statement (PDF)
                  </Button>
                </div>
                <Button onClick={() => alert('Downloading self-service TDS certificate summary')} className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 rounded-sm h-9 transition-all shadow-xs cursor-pointer">
                  Download TDS Summary Advice
                </Button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 4. REPORT LIBRARY */}
          {detailTab === 'library' && (
            <div className="space-y-6 animate-fade-in">
              {/* Section 1: Standard SAP Reports */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  Standard SAP Transaction Codes (T-Codes)
                </h4>
                <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[360px] shrink-0">
                      <EnterpriseFieldCard label="Vendor Balance (S_ALR_87012078)" labelWidth="sm:w-56">
                        <span className="font-mono text-stone-850 font-bold text-xs">₹ 127,100.00</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[320px] shrink-0">
                      <EnterpriseFieldCard label="Vendor Line Items (FBL1N)" labelWidth="sm:w-48">
                        <span className="font-mono text-stone-850 font-bold text-xs">₹ 42,500.00</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[280px] shrink-0">
                      <EnterpriseFieldCard label="Open PO Report (ME2M)" labelWidth="sm:w-36">
                        <span className="font-mono text-stone-850 font-bold text-xs">₹ 142,500.00</span>
                      </EnterpriseFieldCard>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[280px] shrink-0">
                      <EnterpriseFieldCard label="GR/IR Clearing (MB5S)" labelWidth="sm:w-36">
                        <span className="font-mono text-stone-400 font-bold text-xs">₹ 0.00</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[360px] shrink-0">
                      <EnterpriseFieldCard label="WHT Withholding (S_P00_07000134)" labelWidth="sm:w-56">
                        <span className="font-mono text-stone-850 font-bold text-xs">₹ 1,271.00</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[280px] shrink-0">
                      <EnterpriseFieldCard label="Spend Analysis (ME2L)" labelWidth="sm:w-36">
                        <span className="font-mono text-stone-850 font-bold text-xs">₹ 1,245,600.00</span>
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Custom Portal Reports */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  Custom Portal Reports
                </h4>
                <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[320px] shrink-0">
                      <EnterpriseFieldCard label="Vendor Master Compliance" labelWidth="sm:w-44">
                        <span className="px-2 py-0.5 rounded-sm text-[9px] font-extrabold border bg-green-50 text-green-700 border-green-200 inline-flex items-center gap-1 font-mono uppercase">
                          COMPLIANT
                        </span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[320px] shrink-0">
                      <EnterpriseFieldCard label="MSME Overdue Tracker" labelWidth="sm:w-44">
                        <span className="font-mono text-green-700 font-bold text-xs">₹ 0.00 (Cleared)</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[320px] shrink-0">
                      <EnterpriseFieldCard label="Invoice Rejection Analysis" labelWidth="sm:w-44">
                        <span className="font-bold text-green-700 text-xs">0% Rejection Rate</span>
                      </EnterpriseFieldCard>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[320px] shrink-0">
                      <EnterpriseFieldCard label="GST GSTR-2B Reconciliation" labelWidth="sm:w-44">
                        <span className="px-2 py-0.5 rounded-sm text-[9px] font-extrabold border bg-green-50 text-green-700 border-green-200 inline-flex items-center gap-1 font-mono uppercase">
                          RECONCILED
                        </span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[320px] shrink-0">
                      <EnterpriseFieldCard label="Document Expiry Tracker" labelWidth="sm:w-44">
                        <span className="font-bold text-stone-850 text-xs font-mono">No Expiring Documents</span>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[320px] shrink-0">
                      <EnterpriseFieldCard label="Scorecard Summary Report" labelWidth="sm:w-44">
                        <span className="font-mono text-stone-850 font-bold text-xs">95.0 / 100</span>
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Scheduled Report Config */}
              <div className="space-y-3.5 pt-4">
                <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                  Configure Self-Service Report Schedule
                </h4>
                <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[380px] shrink-0">
                      <EnterpriseFieldCard label="Report Name" required labelWidth="sm:w-28">
                        <input
                          type="text"
                          placeholder="e.g. Weekly AP Aging"
                          value={schedulerForm.reportName}
                          onChange={e => setSchedulerForm({ ...schedulerForm, reportName: e.target.value })}
                          className="w-[220px] bg-white border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary rounded-sm py-1.5 px-3 text-xs outline-none text-stone-900 font-bold"
                        />
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[440px] shrink-0">
                      <EnterpriseFieldCard label="Recipients (Email)" required labelWidth="sm:w-36">
                        <input
                          type="text"
                          placeholder="CFO, Finance Director, etc."
                          value={schedulerForm.recipients}
                          onChange={e => setSchedulerForm({ ...schedulerForm, recipients: e.target.value })}
                          className="w-[260px] bg-white border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary rounded-sm py-1.5 px-3 text-xs outline-none text-stone-900 font-mono font-bold"
                        />
                      </EnterpriseFieldCard>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[380px] shrink-0">
                      <EnterpriseFieldCard label="Frequency" required labelWidth="sm:w-28">
                        <input
                          type="text"
                          placeholder="Daily / Weekly / Monthly"
                          value={schedulerForm.frequency}
                          onChange={e => setSchedulerForm({ ...schedulerForm, frequency: e.target.value })}
                          className="w-[220px] bg-white border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary rounded-sm py-1.5 px-3 text-xs outline-none text-stone-900 font-bold"
                        />
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[380px] shrink-0">
                      <EnterpriseFieldCard label="Format" labelWidth="sm:w-28">
                        <input
                          type="text"
                          placeholder="Excel / PDF"
                          value={schedulerForm.format}
                          onChange={e => setSchedulerForm({ ...schedulerForm, format: e.target.value })}
                          className="w-[220px] bg-white border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary rounded-sm py-1.5 px-3 text-xs outline-none text-stone-900 font-bold"
                        />
                      </EnterpriseFieldCard>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[380px] shrink-0">
                      <EnterpriseFieldCard label="Company Code Filter" labelWidth="sm:w-36">
                        <input
                          type="text"
                          placeholder="Scope by company code"
                          value={schedulerForm.companyCode}
                          onChange={e => setSchedulerForm({ ...schedulerForm, companyCode: e.target.value })}
                          className="w-[200px] bg-white border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary rounded-sm py-1.5 px-3 text-xs outline-none text-stone-900 font-mono font-bold"
                        />
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[380px] shrink-0">
                      <EnterpriseFieldCard label="Next Run" labelWidth="sm:w-28">
                        <input
                          type="text"
                          placeholder="Next scheduled execution"
                          value={schedulerForm.nextRun}
                          onChange={e => setSchedulerForm({ ...schedulerForm, nextRun: e.target.value })}
                          className="w-[220px] bg-white border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary rounded-sm py-1.5 px-3 text-xs outline-none text-stone-900 font-mono font-bold"
                        />
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-stone-200 mt-6">
                <Button onClick={() => alert('Triggering instant report generation')} variant="outline" className="border-stone-300 text-stone-750 hover:bg-stone-50 font-bold text-xs px-5 rounded-sm h-9 shadow-sm cursor-pointer">
                  Run Report Now
                </Button>
                <Button onClick={() => alert(`Saving report schedule configuration: ${schedulerForm.reportName || 'Untitled'}`)} className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 rounded-sm h-9 transition-all shadow-xs cursor-pointer">
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
