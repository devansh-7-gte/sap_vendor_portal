'use client';

import React, { useState } from 'react';
import {
  FileText, Calendar, Table, CheckCircle2, ChevronRight, FileSpreadsheet, Download,
  TrendingUp, Users, ShoppingBag, Percent, Layers, Building2,
  Clock, Activity, Filter, Receipt, ShieldCheck, Zap, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- SHARED LAYOUT COMPONENTS FROM REGISTRATION VIEW ---

function SectionHeader({ title, icon: Icon }) {
  return (
    <div className="col-span-full mb-1 mt-4 first:mt-0 select-none">
      <h3 className="text-xs font-bold text-stone-900 tracking-wider uppercase border-b-2 border-primary/30 pb-1.5 flex items-center gap-2">
        {Icon && <Icon className="size-4 text-primary shrink-0" />}
        <span>{title}</span>
      </h3>
    </div>
  );
}

function EnterpriseFieldCard({ label, required, error, labelWidth, children }) {
  return (
    <div className={`h-full py-1.5 px-3 bg-white transition-all flex flex-col sm:flex-row sm:items-center gap-1 select-none ${
      error ? 'bg-red-50/10' : 'hover:bg-stone-50/30 focus-within:bg-stone-50/50'
    }`}>
      <label className={`text-xs font-bold text-stone-750 ${labelWidth || 'sm:w-48'} shrink-0 whitespace-nowrap select-none block`} title={label}>
        {label} {required && <span className="text-red-500 font-bold select-none ml-0.5">*</span>}
      </label>
      <div className="flex-1 w-full min-w-0 flex flex-col justify-center">
        {children}
        {error && (
          <span className="text-[10px] font-bold text-red-650 mt-1 select-none">{error}</span>
        )}
      </div>
    </div>
  );
}

function SapReadOnlyField({ label, value, isFile, isMonospace = true }) {
  return (
    <div className="flex items-center text-xs select-none min-h-[28px]">
      <span className="w-40 shrink-0 font-bold text-black text-right text-[9.5px] uppercase tracking-wide pr-2">
        {label}
      </span>
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#F5F5F5',
          color: '#292524',
          border: '1px solid #d1d5db',
          borderRadius: '3px',
          padding: '2px 8px',
          fontSize: '11px',
          height: '24px',
          fontWeight: '600',
          fontFamily: isMonospace ? 'monospace' : 'sans-serif',
          cursor: 'default',
          boxSizing: 'border-box',
          width: 'fit-content',
          maxWidth: '280px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
        title={value || ''}
      >
        {isFile && <FileText className="size-3 text-emerald-600 shrink-0" />}
        <span>{value || '—'}</span>
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
                <SectionHeader title="PROCUREMENT KEY PERFORMANCE INDICATORS" icon={TrendingUp} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '0px' }}>
                  <SapReadOnlyField label="Total Spend YTD" value="₹ 1,245,600.00" />
                  <SapReadOnlyField label="Active Vendors" value="12" />
                  <SapReadOnlyField label="Open POs - Count" value="4" />
                  <SapReadOnlyField label="RFQ Participation Rate" value="85.5%" />
                </div>
              </div>

              {/* Section 2: Spend Analytics */}
              <div className="space-y-2">
                <SectionHeader title="SPEND ANALYTICS BREAKDOWN" icon={Layers} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '0px' }}>
                  <SapReadOnlyField label="Spend by Vendor - Top 10" value="₹ 450,000.00" />
                  <SapReadOnlyField label="Spend by Material Group" value="Services" isMonospace={false} />
                  <SapReadOnlyField label="Spend by Plant" value="PL01" />
                </div>
              </div>

              {/* Section 3: Delivery Performance */}
              <div className="space-y-2">
                <SectionHeader title="DELIVERY COMPLIANCE METRICS" icon={Activity} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '0px' }}>
                  <SapReadOnlyField label="On-Time Delivery %" value="96.2%" />
                  <SapReadOnlyField label="Avg PO Acknowledgment" value="1.5 Days" />
                  <SapReadOnlyField label="Fulfillment Rate (%)" value="98.0%" />
                </div>
              </div>

              {/* Section 4: Filters & Export */}
              <div className="space-y-2">
                <SectionHeader title="FILTER PARAMETERS" icon={Filter} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '0px' }}>
                  <SapReadOnlyField label="Company Code" value="1000" />
                  <SapReadOnlyField label="Plant" value="1000 - Mumbai" isMonospace={false} />
                  <SapReadOnlyField label="Date Range" value="2026-01-01 to 2026-12-31" />
                  <SapReadOnlyField label="Vendor Category" value="Domestic" isMonospace={false} />
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
                <Button onClick={() => alert('Scheduling automated reports')} className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 rounded-md h-9 transition-all shadow-xs cursor-pointer">
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
                <SectionHeader title="ACCOUNTS PAYABLE AGING SUMMARY" icon={Clock} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '0px' }}>
                  <SapReadOnlyField label="Payables 0-30 Days" value="₹ 45,000.00" />
                  <SapReadOnlyField label="Payables 31-60 Days" value="₹ 18,200.00" />
                  <SapReadOnlyField label="Payables 61-90 Days" value="₹ 0.00" />
                  <SapReadOnlyField label="Overdue > 90 Days" value="₹ 0.00" />
                </div>
              </div>

              {/* Section 2: Tax & Compliance */}
              <div className="space-y-2">
                <SectionHeader title="TAX WITHHELD & GST COMPLIANCE" icon={ShieldCheck} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '0px' }}>
                  <SapReadOnlyField label="TDS Liability - Quarter" value="₹ 12,450.00" />
                  <SapReadOnlyField label="GST Input Tax Available" value="₹ 32,800.00" />
                  <SapReadOnlyField label="MSME Invoices > 45 Days" value="0 (COMPLIANT)" />
                </div>
              </div>

              {/* Section 3: Invoice Processing KPIs */}
              <div className="space-y-2">
                <SectionHeader title="INVOICE PROCESSING SPEED INDICATORS" icon={Zap} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '0px' }}>
                  <SapReadOnlyField label="Invoice Processing TAT" value="4.2 Days" />
                  <SapReadOnlyField label="First-Pass Approval Rate" value="94.8%" />
                  <SapReadOnlyField label="Blocked Invoice Count" value="2" />
                </div>
              </div>

              {/* Section 4: Filters */}
              <div className="space-y-2">
                <SectionHeader title="FILTER PARAMETERS" icon={Filter} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '0px' }}>
                  <SapReadOnlyField label="Fiscal Year" value="2026" />
                  <SapReadOnlyField label="Posting Period" value="03" />
                  <SapReadOnlyField label="Vendor" value="VND10023" />
                  <SapReadOnlyField label="Payment Status" value="Cleared" isMonospace={false} />
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
                <SectionHeader title="ACCOUNT SNAPSHOT" icon={Building2} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '0px' }}>
                  <SapReadOnlyField label="Open POs Value" value="₹ 142,500.00" />
                  <SapReadOnlyField label="Invoices Pending AP" value="₹ 84,600.00" />
                  <SapReadOnlyField label="Next Payment Due" value="₹ 42,500.00" />
                  <SapReadOnlyField label="Performance Score" value="92 / 100" />
                </div>
              </div>

              {/* Section 2: Account Statement */}
              <div className="space-y-2">
                <SectionHeader title="STATEMENT LEDGER RANGE" icon={Calendar} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '0px' }}>
                  <SapReadOnlyField label="Date Range" value="2026-05-01 to 2026-05-31" />
                  <SapReadOnlyField label="Document Type Filter" value="RE (Invoice)" isMonospace={false} />
                  <SapReadOnlyField label="Currency" value="INR" isMonospace={false} />
                </div>
              </div>

              {/* Section 3: Statement Line Columns */}
              <div className="space-y-2">
                <SectionHeader title="LAST TRANSACTION PARAMETERS" icon={Receipt} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '0px' }}>
                  <SapReadOnlyField label="Document Date" value="2026-05-28" />
                  <SapReadOnlyField label="Invoice / Payment Ref" value="INV-2025-0058" />
                  <SapReadOnlyField label="Clearing Status" value="OPEN (UN-CLEARED)" isMonospace={false} />
                  <SapReadOnlyField label="Debit - Invoice" value="₹ 84,600.00" />
                  <SapReadOnlyField label="Credit - Payment" value="₹ 0.00" />
                  <SapReadOnlyField label="Outstanding Balance" value="₹ 84,600.00" />
                </div>
              </div>

              {/* Section 4: TDS Summary */}
              <div className="space-y-2">
                <SectionHeader title="WITHHOLDING TAX SUMMARY" icon={ShieldCheck} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '0px' }}>
                  <SapReadOnlyField label="Fiscal Year" value="2026" />
                  <SapReadOnlyField label="Quarter / Section" value="Q1 / 194C" isMonospace={false} />
                  <SapReadOnlyField label="Total TDS Deducted" value="₹ 846.00" />
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
                <SectionHeader title="STANDARD SAP TRANSACTION CODES (T-CODES)" icon={Table} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '0px' }}>
                  <SapReadOnlyField label="Vendor Balance (S_ALR_87012078)" value="₹ 127,100.00" />
                  <SapReadOnlyField label="Vendor Line Items (FBL1N)" value="₹ 42,500.00" />
                  <SapReadOnlyField label="Open PO Report (ME2M)" value="₹ 142,500.00" />
                  <SapReadOnlyField label="GR/IR Clearing (MB5S)" value="₹ 0.00" />
                  <SapReadOnlyField label="WHT Withholding (S_P00_07000134)" value="₹ 1,271.00" />
                  <SapReadOnlyField label="Spend Analysis (ME2L)" value="₹ 1,245,600.00" />
                </div>
              </div>

              {/* Section 2: Custom Portal Reports */}
              <div className="space-y-2">
                <SectionHeader title="CUSTOM PORTAL REPORTS" icon={ShieldCheck} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '0px' }}>
                  <SapReadOnlyField label="Vendor Master Compliance" value="COMPLIANT" isMonospace={false} />
                  <SapReadOnlyField label="MSME Overdue Tracker" value="₹ 0.00 (Cleared)" isMonospace={false} />
                  <SapReadOnlyField label="Scorecard Summary Report" value="95.0 / 100" />
                  <SapReadOnlyField label="Invoice Rejection Analysis" value="0% Rejection Rate" isMonospace={false} />
                  <SapReadOnlyField label="GST GSTR-2B Reconciliation" value="RECONCILED" isMonospace={false} />
                  <SapReadOnlyField label="Document Expiry Tracker" value="No Expiring Documents" isMonospace={false} />
                </div>
              </div>

              {/* Section 3: Scheduled Report Config */}
              <div className="space-y-2">
                <SectionHeader title="CONFIGURE SELF-SERVICE REPORT SCHEDULE" icon={Calendar} />
                <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                  {/* Row 1 inputs */}
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[320px] shrink-0">
                      <EnterpriseFieldCard label="Report Name" labelWidth="sm:w-28">
                        <input
                          type="text"
                          placeholder="e.g. Weekly AP Aging"
                          value={schedulerForm.reportName}
                          onChange={e => setSchedulerForm({ ...schedulerForm, reportName: e.target.value })}
                          className="w-full max-w-[170px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal h-9 shadow-sm transition-all"
                        />
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[330px] shrink-0">
                      <EnterpriseFieldCard label="Recipients (Email)" labelWidth="sm:w-32">
                        <input
                          type="text"
                          placeholder="CFO, Finance Director, etc."
                          value={schedulerForm.recipients}
                          onChange={e => setSchedulerForm({ ...schedulerForm, recipients: e.target.value })}
                          className="w-full max-w-[170px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal font-mono h-9 shadow-sm transition-all"
                        />
                      </EnterpriseFieldCard>
                    </div>

                    <div className="flex-1">
                      <EnterpriseFieldCard label="Frequency" labelWidth="sm:w-24">
                        <input
                          type="text"
                          placeholder="Daily / Weekly / Monthly"
                          value={schedulerForm.frequency}
                          onChange={e => setSchedulerForm({ ...schedulerForm, frequency: e.target.value })}
                          className="w-full max-w-[170px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal h-9 shadow-sm transition-all"
                        />
                      </EnterpriseFieldCard>
                    </div>
                  </div>

                  {/* Row 2 inputs */}
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                    <div className="w-[320px] shrink-0">
                      <EnterpriseFieldCard label="Format" labelWidth="sm:w-28">
                        <input
                          type="text"
                          placeholder="Excel / PDF"
                          value={schedulerForm.format}
                          onChange={e => setSchedulerForm({ ...schedulerForm, format: e.target.value })}
                          className="w-full max-w-[170px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal h-9 shadow-sm transition-all"
                        />
                      </EnterpriseFieldCard>
                    </div>

                    <div className="w-[330px] shrink-0">
                      <EnterpriseFieldCard label="Company Code Filter" labelWidth="sm:w-36">
                        <input
                          type="text"
                          placeholder="Scope by company code"
                          value={schedulerForm.companyCode}
                          onChange={e => setSchedulerForm({ ...schedulerForm, companyCode: e.target.value })}
                          className="w-full max-w-[150px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal font-mono h-9 shadow-sm transition-all"
                        />
                      </EnterpriseFieldCard>
                    </div>

                    <div className="flex-1">
                      <EnterpriseFieldCard label="Next Run" labelWidth="sm:w-24">
                        <input
                          type="text"
                          placeholder="Next scheduled execution"
                          value={schedulerForm.nextRun}
                          onChange={e => setSchedulerForm({ ...schedulerForm, nextRun: e.target.value })}
                          className="w-full max-w-[170px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal font-mono h-9 shadow-sm transition-all"
                        />
                      </EnterpriseFieldCard>
                    </div>
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
