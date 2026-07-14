'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Calendar, Table, CheckCircle2, ChevronLeft, ChevronRight, FileSpreadsheet, Download,
  TrendingUp, Users, ShoppingBag, Percent, Layers, Building2,
  Clock, Activity, Filter, Receipt, ShieldCheck, Zap, AlertTriangle, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ErrorBoundary from '@/components/ErrorBoundary';
import { usePortal } from '@/lib/portal-context';

// --- BASKET OF INDIAN MSME SPECIFIC MOCK DATA (FALLBACK) ---


const MOCK_SPEND_DATA = [
  { group: 'Packaging Materials', code: 'MAT-PKG-1002', poCount: 15, spend: 345000, trend: '+4.2%', status: 'Stable' }
];

const MOCK_AP_AGING_DATA = [
  { ref: 'TAX-2026-904', date: '15.06.2026', vendor: 'Shiva Enterprises', gstin: '27AABCS9012D1Z4', type: 'Micro', amount: 45000, days: 14, status: 'Safe' }
];

const MOCK_LEDGER_DATA = [
  { date: '28.05.2026', type: 'RE (Invoice)', doc: '5105609012', desc: 'Material supply against PO-8001', debit: 84600, credit: 0, balance: 84600, status: 'Uncleared' }
];

const MOCK_SCHEDULED_REPORTS_INIT = [
  { name: 'Weekly AP Aging Summary', frequency: 'Weekly', recipients: 'cfo@shivaent.in, accounts@shivaent.in', format: 'Excel', nextRun: '03.07.2026', status: 'Active' }
];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

function SapReadOnlyField({ label, value, isFile, isMonospace = true, valueClassName = '', containerClassName = '', icon: Icon }) {
  return (
    <div className="flex flex-col gap-1 items-center select-none focus-within:outline-none">
      <span className="text-[9px] font-extrabold text-stone-600 uppercase tracking-wider flex items-center gap-1 leading-none" title={label}>
        {Icon && <Icon className="size-3 text-stone-500 shrink-0" />}
        <span>{label}</span>
      </span>
      <div
        className={`inline-flex items-center gap-1.5 border rounded-[3px] px-2.5 text-xs h-6.5 font-semibold cursor-default box-border w-fit max-w-full overflow-hidden text-ellipsis whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:ring-offset-1 select-all transition-all duration-150 ${isMonospace ? 'font-mono' : 'font-sans'
          } ${containerClassName || 'bg-stone-50 text-stone-900 border-stone-200'} ${valueClassName}`}
        title={value || ''}
        tabIndex={0}
      >
        {isFile && <FileText className="size-3.5 text-stone-500 shrink-0" />}
        <span>{value || '—'}</span>
      </div>
    </div>
  );
}

function SapInputField({ label, required, children, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1 items-center focus-within:outline-none">
      <span className="text-[9px] font-extrabold text-stone-600 uppercase tracking-wider flex items-center gap-1 leading-none">
        {Icon && <Icon className="size-3 text-stone-500 shrink-0" />}
        <span>
          {label}
          {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
        </span>
      </span>
      <div className="w-fit">
        {children}
      </div>
    </div>
  );
}

export default function ReportsAnalyticsView({ state }) {
  const { addToast } = usePortal();
  const [detailTab, setDetailTab] = useState('procurement'); // 'procurement' | 'finance' | 'selfservice' | 'library'

  // Scheduled Reports registry
  const [scheduledReports, setScheduledReports] = useState(MOCK_SCHEDULED_REPORTS_INIT);

  // Scheduler Form State
  const [schedulerForm, setSchedulerForm] = useState({
    reportName: '',
    recipients: '',
    frequency: 'Weekly',
    format: 'Excel',
    companyCode: '1000',
    nextRun: ''
  });

  const handleSaveSchedule = () => {
    if (!schedulerForm.reportName.trim() || !schedulerForm.recipients.trim()) {
      addToast('error', 'Please enter a Report Name and Recipients email.');
      return;
    }
    const newReport = {
      name: schedulerForm.reportName,
      frequency: schedulerForm.frequency,
      recipients: schedulerForm.recipients,
      format: schedulerForm.format,
      nextRun: schedulerForm.nextRun || formatDate(new Date()),
      status: 'Active'
    };
    setScheduledReports(prev => [newReport, ...prev]);
    setSchedulerForm({
      reportName: '',
      recipients: '',
      frequency: 'Weekly',
      format: 'Excel',
      companyCode: '1000',
      nextRun: ''
    });
    addToast('success', 'Report schedule saved successfully!');
  };

  // --- DYNAMIC CALCULATIONS LOGIC FROM COMPONENT STATE CONTEXT ---

  // 1. Tab 1 spend data aggregated dynamically from PO items
  const spendMap = {};
  state.pos?.forEach(po => {
    if (po.status === 'Cancelled') return;
    po.items?.forEach(item => {
      const code = item.materialCode || 'MAT-GEN';
      const description = item.description || 'General Supplies';
      const itemSpend = item.quantity * (item.unitPrice || 0);

      if (!spendMap[code]) {
        spendMap[code] = {
          code,
          group: description,
          poCount: 0,
          spend: 0,
          trend: '+0.0%',
          status: 'Stable'
        };
      }
      spendMap[code].poCount += 1;
      spendMap[code].spend += itemSpend;
    });
  });
  const spendData = Object.values(spendMap);
  const dynamicSpendData = spendData.length > 0 ? spendData : MOCK_SPEND_DATA;

  // 2. Tab 2 AP aging logs computed dynamically from Invoices list
  const apAgingData = state.invoices?.map(inv => {
    const invoiceDate = new Date(inv.invoiceDate || Date.now());
    const diffTime = Math.abs(new Date() - invoiceDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const msmeType = state.profile?.msmeNumber ? 'Micro' : 'Non-MSME';
    
    let status = 'Safe';
    if (inv.status === 'Paid') {
      status = 'Cleared';
    } else if (msmeType !== 'Non-MSME') {
      if (diffDays > 45) {
        status = 'Overdue (MSME Priority!)';
      } else if (diffDays >= 30) {
        status = 'Critical (45-Day Alert)';
      }
    }

    return {
      ref: inv.invoiceNumber || inv.id,
      date: formatDate(inv.invoiceDate),
      vendor: state.profile?.companyName || 'Shiva Enterprises',
      gstin: state.profile?.gstin || '27AABCS9012D1Z4',
      type: msmeType,
      amount: inv.totalAmount || 0,
      days: diffDays || 0,
      status
    };
  }) || [];
  const dynamicApAgingData = apAgingData.length > 0 ? apAgingData : MOCK_AP_AGING_DATA;

  // 3. Tab 3 ledger statement logs computed dynamically from Invoices + Payments
  const ledgerEvents = [];
  state.invoices?.forEach(inv => {
    ledgerEvents.push({
      date: inv.invoiceDate,
      type: 'RE (Invoice)',
      doc: inv.id || '5105609012',
      desc: `Material supply against PO-${inv.poId}`,
      debit: inv.totalAmount || 0,
      credit: 0,
      status: inv.status === 'Paid' ? 'Cleared' : 'Uncleared',
      rawDate: new Date(inv.invoiceDate || Date.now())
    });
  });

  state.payments?.forEach(pmt => {
    ledgerEvents.push({
      date: pmt.paymentDate || pmt.createdDate,
      type: 'KZ (Payment)',
      doc: pmt.utrCode || pmt.id || '1500004561',
      desc: `Clearing of Invoice Ref`,
      debit: 0,
      credit: pmt.netAmount || pmt.amount || 0,
      status: 'Cleared',
      rawDate: new Date(pmt.paymentDate || pmt.createdDate || Date.now())
    });
  });

  ledgerEvents.sort((a, b) => a.rawDate - b.rawDate);

  let runningBalance = 0;
  const formattedLedgerData = ledgerEvents.map(event => {
    runningBalance += event.debit - event.credit;
    return {
      ...event,
      date: formatDate(event.date),
      balance: runningBalance
    };
  });
  formattedLedgerData.reverse();
  const dynamicLedgerData = formattedLedgerData.length > 0 ? formattedLedgerData : MOCK_LEDGER_DATA;

  return (
    <ErrorBoundary>
      <div className="space-y-6 max-w-full mx-auto animate-fade-in pb-16 relative">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4 select-none">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2.5">
              <FileSpreadsheet className="size-5 text-stone-500 shrink-0" /> Reports &amp; Analytics
            </h2>
            <p className="text-stone-500 text-xs font-semibold">
              Operational spend analytics, treasury payables ledger aging, and self-service report scheduling
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div 
              tabIndex={0}
              className="flex items-center gap-2 bg-white border border-stone-300 hover:border-stone-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-500 rounded-lg py-1.5 px-3 text-xs text-stone-700 font-semibold h-9 shadow-sm transition-all cursor-pointer"
            >
              <Calendar className="size-4 text-stone-450 shrink-0" />
              <span>01 Jan 2026 - 31 Dec 2026</span>
            </div>
            <button 
              type="button"
              className="flex items-center gap-2 bg-white border border-stone-300 hover:border-stone-400 hover:bg-stone-50 text-stone-700 font-semibold px-3 h-9 rounded-md transition-all text-xs cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-500"
              onClick={() => addToast('info', 'Opening Filters panel...')}
            >
              <Filter className="size-4 text-stone-450 shrink-0" />
              <span>Filters</span>
            </button>
            <button 
              type="button"
              className="flex items-center gap-2 bg-white border border-stone-300 hover:border-stone-400 hover:bg-stone-50 text-stone-700 font-semibold px-3 h-9 rounded-md transition-all text-xs cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-500"
              onClick={() => addToast('success', 'Operational analytics report exported successfully!')}
            >
              <Download className="size-4 text-stone-450 shrink-0" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* TAB HEADERS */}
        <div className="flex items-center gap-6 border-b border-stone-200">
          {[
            { id: 'procurement', label: '1. Procurement Dashboard' },
            { id: 'finance', label: '2. Finance & AP Reports' },
            { id: 'selfservice', label: '3. Vendor Self-Service' },
            { id: 'library', label: '4. Report Library (SAP Standard)' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setDetailTab(t.id)}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${detailTab === t.id
                  ? 'border-stone-850 text-stone-900'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT BLOCK */}
        <div className="bg-stone-50/30 p-1 rounded-xl">

          {/* TAB CONTENT: 1. PROCUREMENT DASHBOARD */}
          {detailTab === 'procurement' && (
            <div className="space-y-6 animate-fade-in">
              {/* Section 1: Dashboard KPI Cards */}
              <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50/60">
                  <div className="size-1.5 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Procurement Key Performance Indicators</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5">
                  <SapReadOnlyField label="Total Spend YTD" value="₹ 1,245,600.00" icon={TrendingUp} containerClassName="bg-blue-50 text-blue-700 border-blue-200" />
                  <SapReadOnlyField label="Active Vendors" value="12" icon={Users} containerClassName="bg-blue-50 text-blue-700 border-blue-200" />
                  <SapReadOnlyField label="Open POs - Count" value="4" icon={ShoppingBag} containerClassName="bg-orange-50 text-orange-700 border-orange-200 animate-pulse" />
                  <SapReadOnlyField label="RFQ Participation Rate" value="85.5%" icon={Percent} containerClassName="bg-emerald-50 text-emerald-800 border-emerald-200" />
                </div>
              </div>

              {/* Section 2: Spend Analytics */}
              <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50/60">
                  <div className="size-1.5 rounded-full bg-teal-500"></div>
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Spend Analytics Breakdown</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5">
                  <SapReadOnlyField label="Spend by Vendor - Top 10" value="₹ 450,000.00" icon={Users} containerClassName="bg-blue-50 text-blue-700 border-blue-200" />
                  <SapReadOnlyField label="Spend by Material Group" value="Services" isMonospace={false} icon={Layers} containerClassName="bg-teal-50 text-teal-700 border-teal-200" />
                  <SapReadOnlyField label="Spend by Plant" value="PL01" icon={Building2} containerClassName="bg-amber-50 text-amber-700 border-amber-200" />
                </div>
              </div>

              {/* Spend Table */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-2">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Top Spend Categories &amp; Material Groups
                  </h4>
                </div>
                <div className="w-full overflow-x-auto overflow-y-auto max-h-[320px] custom-scrollbar border border-stone-200 rounded-lg bg-white shadow-xs">
                  <table className="w-full text-xs text-left border-collapse min-w-[800px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-stone-50 border-b border-stone-200 text-stone-900 font-bold uppercase text-[10px] tracking-wider font-sans">
                        <th className="py-2.5 px-3 border-r border-stone-200 w-16">No</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 w-44">Material Group Code</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 min-w-[200px]">Description Category</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 w-28 text-right">Active POs</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 w-36 text-right">YTD Spend</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 w-24 text-center">Trend</th>
                        <th className="py-2.5 px-3 text-center w-28">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-700">
                      {dynamicSpendData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                          <td className="py-2 px-3 border-r border-stone-200 text-stone-600 font-semibold font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 border-r border-stone-200 font-mono font-bold text-stone-900">{item.code}</td>
                          <td className="py-2 px-3 border-r border-stone-200 font-sans font-medium text-stone-855">{item.group}</td>
                          <td className="py-2 px-3 border-r border-stone-200 text-right font-mono">{item.poCount}</td>
                          <td className="py-2 px-3 border-r border-stone-200 text-right font-mono font-bold text-stone-900">₹ {item.spend.toLocaleString('en-IN')}.00</td>
                          <td className={`py-2 px-3 border-r border-stone-200 text-center font-mono font-bold ${
                            item.trend.startsWith('+') ? 'text-rose-600' : 'text-emerald-700'
                          }`}>{item.trend}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              item.status === 'Favorable' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : item.status === 'Increasing'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-stone-50 text-stone-600 border-stone-200'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3: Delivery Performance */}
              <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50/60">
                  <div className="size-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Delivery Compliance Metrics</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5">
                  <SapReadOnlyField label="On-Time Delivery %" value="96.2%" icon={CheckCircle2} containerClassName="bg-emerald-50 text-emerald-800 border-emerald-200" />
                  <SapReadOnlyField label="Avg PO Acknowledgment" value="1.5 Days" icon={Clock} containerClassName="bg-amber-50 text-amber-700 border-amber-200" />
                  <SapReadOnlyField label="Fulfillment Rate (%)" value="98.0%" icon={Percent} containerClassName="bg-emerald-50 text-emerald-800 border-emerald-200" />
                </div>
              </div>

              {/* Section 4: Filters & Export */}
              <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50/60">
                  <div className="size-1.5 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Filter Parameters</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5">
                  <SapReadOnlyField label="Company Code" value="1000" icon={Building2} containerClassName="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer" />
                  <SapReadOnlyField label="Plant" value="1000 - Mumbai" isMonospace={false} icon={MapPin} containerClassName="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer" />
                  <SapReadOnlyField label="Date Range" value="2026-01-01 to 2026-12-31" icon={Calendar} containerClassName="bg-stone-100 text-stone-700 border-stone-200" />
                  <SapReadOnlyField label="Vendor Category" value="Domestic" isMonospace={false} icon={Users} containerClassName="bg-stone-100 text-stone-700 border-stone-200" />
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between items-center bg-white border border-stone-200 rounded-md p-4 shadow-sm w-full">
                <div className="flex gap-2">
                  <Button onClick={() => addToast('success', 'PDF spend analytics report generated successfully.')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs px-5 rounded-md h-9 cursor-pointer">
                    Export PDF
                  </Button>
                  <Button onClick={() => addToast('success', 'Excel spend datasheet exported successfully.')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs px-5 rounded-md h-9 cursor-pointer">
                    Export Excel
                  </Button>
                </div>
                <Button onClick={() => addToast('info', 'Redirecting to report scheduling config...')} className="bg-stone-850 hover:bg-black text-white font-bold text-xs px-6 rounded-md h-9 transition-all shadow-xs cursor-pointer">
                  Schedule Automatic Report
                </Button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2. FINANCE & AP REPORTS */}
          {detailTab === 'finance' && (
            <div className="space-y-6 animate-fade-in">
              {/* Section 1: AP Aging Summary */}
              <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50/60">
                  <div className="size-1.5 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Accounts Payable Aging Summary</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5">
                  <SapReadOnlyField label="Payables 0-30 Days" value="₹ 45,000.00" icon={Clock} containerClassName="bg-blue-50 text-blue-700 border-blue-200" />
                  <SapReadOnlyField label="Payables 31-60 Days" value="₹ 18,200.00" icon={Clock} containerClassName="bg-orange-50 text-orange-700 border-orange-200" />
                  <SapReadOnlyField label="Payables 61-90 Days" value="₹ 0.00" icon={Clock} containerClassName="bg-stone-100 text-stone-700 border-stone-200" />
                  <SapReadOnlyField label="Overdue &gt; 90 Days" value="₹ 0.00" icon={AlertTriangle} containerClassName="bg-rose-50 text-rose-800 border-rose-200" />
                </div>
              </div>

              {/* AP Aging Table */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-2">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Accounts Payable Invoices Aging Details
                  </h4>
                </div>
                <div className="w-full overflow-x-auto overflow-y-auto max-h-[320px] custom-scrollbar border border-stone-200 rounded-lg bg-white shadow-xs">
                  <table className="w-full text-xs text-left border-collapse min-w-[900px] whitespace-nowrap">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-stone-50 border-b border-stone-200 text-stone-900 font-bold uppercase text-[10px] tracking-wider font-sans">
                        <th className="py-2.5 px-3 border-r border-stone-200 w-32">Invoice Ref</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 w-24 text-center">Posting Date</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 min-w-[150px]">Vendor Name</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 w-36">GSTIN</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 w-24 text-center">MSME Type</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 w-24 text-right">Age (Days)</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 w-32 text-right">Net Value</th>
                        <th className="py-2.5 px-3 text-center w-36">Compliance Alert</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-700">
                      {dynamicApAgingData.map((item, idx) => {
                        const isMsme = item.type === 'Micro' || item.type === 'Small';
                        const isOverdue = isMsme && item.days > 45;
                        return (
                          <tr key={idx} className={`hover:bg-stone-50/50 transition-colors ${isOverdue ? 'bg-rose-50/20' : ''}`}>
                            <td className="py-2 px-3 border-r border-stone-200 font-mono font-bold text-stone-900">{item.ref}</td>
                            <td className="py-2 px-3 border-r border-stone-200 text-center font-mono">{item.date}</td>
                            <td className="py-2 px-3 border-r border-stone-200 font-semibold">{item.vendor}</td>
                            <td className="py-2 px-3 border-r border-stone-200 font-mono text-stone-600">{item.gstin}</td>
                            <td className="py-2 px-3 border-r border-stone-200 text-center font-extrabold text-blue-650">{item.type}</td>
                            <td className={`py-2 px-3 border-r border-stone-200 text-right font-mono font-bold ${isOverdue ? 'text-rose-600' : ''}`}>{item.days}</td>
                            <td className="py-2 px-3 border-r border-stone-200 text-right font-mono font-bold text-stone-900">₹ {item.amount.toLocaleString('en-IN')}.00</td>
                            <td className="py-2 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                isOverdue ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-705 border-emerald-200'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: Tax & Compliance */}
              <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50/60">
                  <div className="size-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Tax Withheld &amp; GST Compliance</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5">
                  <SapReadOnlyField label="TDS Liability - Quarter" value="₹ 12,450.00" icon={Receipt} containerClassName="bg-rose-50 text-rose-800 border-rose-200" />
                  <SapReadOnlyField label="GST Input Tax Available" value="₹ 32,800.00" icon={ShieldCheck} containerClassName="bg-emerald-50 text-emerald-800 border-emerald-200" />
                  <SapReadOnlyField label="MSME Invoices &gt; 45 Days" value="0 (COMPLIANT)" isMonospace={false} icon={CheckCircle2} containerClassName="bg-emerald-50 text-emerald-800 border-emerald-300" />
                </div>
              </div>

              {/* Section 3: Invoice Processing KPIs */}
              <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50/60">
                  <div className="size-1.5 rounded-full bg-teal-500"></div>
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Invoice Processing Speed Indicators</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5">
                  <SapReadOnlyField label="Invoice Processing TAT" value="4.2 Days" icon={Clock} containerClassName="bg-blue-50 text-blue-700 border-blue-200" />
                  <SapReadOnlyField label="First-Pass Approval Rate" value="94.8%" icon={Percent} containerClassName="bg-emerald-50 text-emerald-800 border-emerald-200" />
                  <SapReadOnlyField label="Blocked Invoice Count" value="2" icon={AlertTriangle} containerClassName="bg-rose-50 text-rose-800 border-rose-200 animate-pulse" />
                </div>
              </div>

              {/* Section 4: Filters */}
              <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50/60">
                  <div className="size-1.5 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Filter Parameters</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5">
                  <SapReadOnlyField label="Fiscal Year" value="2026" icon={Calendar} containerClassName="bg-stone-100 text-stone-700 border-stone-200" />
                  <SapReadOnlyField label="Posting Period" value="03" icon={Clock} containerClassName="bg-stone-100 text-stone-700 border-stone-200" />
                  <SapReadOnlyField label="Vendor" value="VND10023" icon={Users} containerClassName="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer" />
                  <SapReadOnlyField label="Payment Status" value="Cleared" isMonospace={false} icon={CheckCircle2} containerClassName="bg-emerald-50 text-emerald-800 border-emerald-250" />
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between items-center bg-white border border-stone-200 rounded-md p-4 shadow-sm w-full">
                <div className="flex gap-2">
                  <Button onClick={() => addToast('success', 'Accounts Payable aging spreadsheet exported successfully.')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs px-5 rounded-md h-9 cursor-pointer">
                    Export AP Aging (Excel)
                  </Button>
                  <Button onClick={() => addToast('success', 'MSME compliance registry report generated successfully.')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs px-5 rounded-md h-9 cursor-pointer">
                    Export MSME Report
                  </Button>
                </div>
                <Button onClick={() => addToast('success', 'TDS withholding liability statement generated.')} className="bg-stone-850 hover:bg-black text-white font-bold text-xs px-6 rounded-md h-9 transition-all shadow-xs cursor-pointer">
                  Export TDS Summary
                </Button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 3. VENDOR SELF-SERVICE */}
          {detailTab === 'selfservice' && (
            <div className="space-y-6 animate-fade-in">
              {/* Section 1: My Account Snapshot */}
              <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50/60">
                  <div className="size-1.5 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Account Snapshot</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5">
                  <SapReadOnlyField label="Open POs Value" value="₹ 142,500.00" icon={ShoppingBag} containerClassName="bg-blue-50 text-blue-700 border-blue-200" />
                  <SapReadOnlyField label="Invoices Pending AP" value="₹ 84,600.00" icon={Receipt} containerClassName="bg-orange-50 text-orange-700 border-orange-200" />
                  <SapReadOnlyField label="Next Payment Due" value="₹ 42,500.00" icon={Clock} containerClassName="bg-blue-50 text-blue-700 border-blue-200" />
                  <SapReadOnlyField label="Performance Score" value="92 / 100" icon={CheckCircle2} containerClassName="bg-emerald-50 text-emerald-800 border-emerald-200" />
                </div>
              </div>

              {/* Ledger Statement Table */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-2">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Partner Ledger Account Statement log
                  </h4>
                </div>
                <div className="w-full overflow-x-auto overflow-y-auto max-h-[320px] custom-scrollbar border border-stone-200 rounded-lg bg-white shadow-xs">
                  <table className="w-full text-xs text-left border-collapse min-w-[850px] whitespace-nowrap">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-stone-50 border-b border-stone-200 text-stone-900 font-bold uppercase text-[10px] tracking-wider font-sans">
                        <th className="py-2.5 px-3 border-r border-stone-200 w-24 text-center">Posting Date</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 w-28">Doc Type</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 w-32">Document Ref</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 min-w-[200px]">Description/Invoice Ref</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 w-28 text-right">Debit (₹)</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 w-28 text-right">Credit (₹)</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 w-32 text-right">Balance</th>
                        <th className="py-2.5 px-3 text-center w-28">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-700">
                      {dynamicLedgerData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                          <td className="py-2 px-3 border-r border-stone-200 text-center font-mono font-medium">{item.date}</td>
                          <td className="py-2 px-3 border-r border-stone-200 font-medium font-sans text-stone-600">{item.type}</td>
                          <td className="py-2 px-3 border-r border-stone-200 font-mono font-bold text-stone-900">{item.doc}</td>
                          <td className="py-2 px-3 border-r border-stone-200 font-medium">{item.desc}</td>
                          <td className="py-2 px-3 border-r border-stone-200 text-right font-mono">{item.debit > 0 ? `₹ ${item.debit.toLocaleString('en-IN')}.00` : '—'}</td>
                          <td className="py-2 px-3 border-r border-stone-200 text-right font-mono">{item.credit > 0 ? `₹ ${item.credit.toLocaleString('en-IN')}.00` : '—'}</td>
                          <td className="py-2 px-3 border-r border-stone-200 text-right font-mono font-bold text-stone-900">₹ {item.balance.toLocaleString('en-IN')}.05</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              item.status === 'Cleared' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-250 font-bold animate-pulse'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: Account Statement */}
              <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50/60">
                  <div className="size-1.5 rounded-full bg-teal-500"></div>
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Statement Ledger Range</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5">
                  <SapReadOnlyField label="Date Range" value="2026-05-01 to 2026-05-31" icon={Calendar} containerClassName="bg-stone-100 text-stone-700 border-stone-200" />
                  <SapReadOnlyField label="Document Type Filter" value="RE (Invoice)" isMonospace={false} icon={FileText} containerClassName="bg-teal-50 text-teal-700 border-teal-200" />
                  <SapReadOnlyField label="Currency" value="INR" isMonospace={false} icon={Receipt} containerClassName="bg-emerald-50 text-emerald-800 border-emerald-200" />
                </div>
              </div>

              {/* Section 3: Statement Line Columns */}
              <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50/60">
                  <div className="size-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Last Transaction Parameters</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5">
                  <SapReadOnlyField label="Document Date" value="2026-05-28" icon={Calendar} containerClassName="bg-stone-100 text-stone-700 border-stone-200" />
                  <SapReadOnlyField label="Invoice / Payment Ref" value="INV-2025-0058" icon={FileText} containerClassName="bg-blue-50 text-blue-700 border-blue-200" />
                  <SapReadOnlyField label="Clearing Status" value="OPEN (UN-CLEARED)" isMonospace={false} icon={Clock} containerClassName="bg-amber-50 text-amber-700 border-amber-300 animate-pulse" />
                  <SapReadOnlyField label="Debit - Invoice" value="₹ 84,600.00" icon={Receipt} containerClassName="bg-rose-50 text-rose-805 border-rose-200" />
                  <SapReadOnlyField label="Credit - Payment" value="₹ 0.00" icon={Receipt} containerClassName="bg-emerald-50 text-emerald-800 border-emerald-200" />
                  <SapReadOnlyField label="Outstanding Balance" value="₹ 84,600.00" icon={TrendingUp} containerClassName="bg-orange-50 text-orange-700 border-orange-200" />
                </div>
              </div>

              {/* Section 4: TDS Summary */}
              <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50/60">
                  <div className="size-1.5 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Withholding Tax Summary</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5">
                  <SapReadOnlyField label="Fiscal Year" value="2026" icon={Calendar} containerClassName="bg-stone-100 text-stone-700 border-stone-200" />
                  <SapReadOnlyField label="Quarter / Section" value="Q1 / 194C" isMonospace={false} icon={Receipt} containerClassName="bg-blue-50 text-blue-750 border-blue-200" />
                  <SapReadOnlyField label="Total TDS Deducted" value="₹ 846.00" icon={ShieldCheck} containerClassName="bg-emerald-50 text-emerald-800 border-emerald-200" />
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between items-center bg-white border border-stone-200 rounded-md p-4 shadow-sm w-full">
                <div className="flex gap-2">
                  <Button onClick={() => addToast('success', 'Partner ledger spreadsheet exported successfully.')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs px-5 rounded-md h-9 cursor-pointer">
                    Export Statement (Excel)
                  </Button>
                  <Button onClick={() => addToast('success', 'PDF account ledger statement generated successfully.')} variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs px-5 rounded-md h-9 cursor-pointer">
                    Export Statement (PDF)
                  </Button>
                </div>
                <Button onClick={() => addToast('success', 'Withholding tax summary downloaded successfully.')} className="bg-stone-850 hover:bg-black text-white font-bold text-xs px-6 rounded-md h-9 transition-all shadow-xs cursor-pointer">
                  Download TDS Summary Advice
                </Button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 4. REPORT LIBRARY */}
          {detailTab === 'library' && (
            <div className="space-y-6 animate-fade-in">
              {/* Section 1: Standard SAP Reports */}
              <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50/60">
                  <div className="size-1.5 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Standard System Reports</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5">
                  <SapReadOnlyField label="Vendor Balance" value="₹ 127,100.00" icon={Table} containerClassName="bg-blue-50 text-blue-700 border-blue-200" />
                  <SapReadOnlyField label="Vendor Line Items" value="₹ 42,500.00" icon={Table} containerClassName="bg-orange-50 text-orange-700 border-orange-200" />
                  <SapReadOnlyField label="Open PO Report" value="₹ 142,500.00" icon={Table} containerClassName="bg-teal-50 text-teal-700 border-teal-200" />
                  <SapReadOnlyField label="GR/IR Clearing" value="₹ 0.00" icon={Table} containerClassName="bg-emerald-50 text-emerald-800 border-emerald-200" />
                  <SapReadOnlyField label="WHT Withholding" value="₹ 1,271.00" icon={Table} containerClassName="bg-rose-50 text-rose-800 border-rose-200" />
                  <SapReadOnlyField label="Spend Analysis" value="₹ 1,245,600.00" icon={Table} containerClassName="bg-teal-50 text-teal-700 border-teal-200" />
                </div>
              </div>

              {/* Section 2: Custom Portal Reports */}
              <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50/60">
                  <div className="size-1.5 rounded-full bg-teal-500"></div>
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Custom Portal Reports</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5">
                  <SapReadOnlyField label="Vendor Master Compliance" value="COMPLIANT" isMonospace={false} icon={CheckCircle2} containerClassName="bg-emerald-50 text-emerald-700 border-emerald-300" />
                  <SapReadOnlyField label="MSME Overdue Tracker" value="₹ 0.00 (Cleared)" isMonospace={false} icon={Clock} containerClassName="bg-emerald-50 text-emerald-700 border-emerald-300" />
                  <SapReadOnlyField label="Scorecard Summary Report" value="95.0 / 100" icon={Activity} containerClassName="bg-blue-50 text-blue-700 border-blue-200" />
                  <SapReadOnlyField label="Invoice Rejection Analysis" value="0% Rejection Rate" isMonospace={false} icon={AlertTriangle} containerClassName="bg-emerald-50 text-emerald-700 border-emerald-250" />
                  <SapReadOnlyField label="GST GSTR-2B Reconciliation" value="RECONCILED" isMonospace={false} icon={ShieldCheck} containerClassName="bg-emerald-50 text-emerald-700 border-emerald-300" />
                  <SapReadOnlyField label="Document Expiry Tracker" value="No Expiring Documents" isMonospace={false} icon={Calendar} containerClassName="bg-emerald-50 text-emerald-700 border-emerald-300" />
                </div>
              </div>

              {/* Section 3: Scheduled Report Config */}
              <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50/60">
                  <div className="size-1.5 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Configure Self-Service Report Schedule</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5">
                  <SapInputField label="Report Name" required icon={FileText}>
                    <input
                      type="text"
                      placeholder="e.g. Weekly AP Aging"
                      value={schedulerForm.reportName}
                      onChange={e => setSchedulerForm({ ...schedulerForm, reportName: e.target.value })}
                      className="w-56 bg-white border border-stone-200 focus:border-blue-400 rounded-[3px] px-2.5 h-6.5 text-xs outline-none text-stone-900 font-bold transition-all duration-150"
                    />
                  </SapInputField>

                  <SapInputField label="Recipients (Email)" required icon={Users}>
                    <input
                      type="text"
                      placeholder="CFO, Finance Director, etc."
                      value={schedulerForm.recipients}
                      onChange={e => setSchedulerForm({ ...schedulerForm, recipients: e.target.value })}
                      className="w-64 bg-white border border-stone-200 focus:border-blue-400 rounded-[3px] px-2.5 h-6.5 text-xs outline-none text-stone-900 font-mono font-bold transition-all duration-150"
                    />
                  </SapInputField>

                  <SapInputField label="Frequency" required icon={Calendar}>
                    <select
                      value={schedulerForm.frequency}
                      onChange={e => setSchedulerForm({ ...schedulerForm, frequency: e.target.value })}
                      className="w-36 bg-white border border-stone-200 focus:border-blue-400 rounded-[3px] px-2.5 h-6.5 text-xs outline-none text-stone-900 font-semibold transition-all duration-150 cursor-pointer"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </SapInputField>

                  <SapInputField label="Format" required icon={FileSpreadsheet}>
                    <select
                      value={schedulerForm.format}
                      onChange={e => setSchedulerForm({ ...schedulerForm, format: e.target.value })}
                      className="w-32 bg-white border border-stone-200 focus:border-blue-400 rounded-[3px] px-2.5 h-6.5 text-xs outline-none text-stone-900 font-semibold transition-all duration-150 cursor-pointer"
                    >
                      <option value="Excel">Excel (.xlsx)</option>
                      <option value="PDF">PDF Document</option>
                    </select>
                  </SapInputField>

                  <SapInputField label="Company Code Filter" required icon={Building2}>
                    <select
                      value={schedulerForm.companyCode}
                      onChange={e => setSchedulerForm({ ...schedulerForm, companyCode: e.target.value })}
                      className="w-32 bg-white border border-stone-200 focus:border-blue-400 rounded-[3px] px-2.5 h-6.5 text-xs outline-none text-stone-900 font-semibold transition-all duration-150 cursor-pointer"
                    >
                      <option value="1000">1000 (Mumbai)</option>
                      <option value="2000">2000 (Delhi)</option>
                      <option value="3000">3000 (Bangalore)</option>
                    </select>
                  </SapInputField>

                  <SapInputField label="Next Run" required icon={Clock}>
                    <input
                      type="date"
                      value={schedulerForm.nextRun}
                      onChange={e => setSchedulerForm({ ...schedulerForm, nextRun: e.target.value })}
                      className="w-44 bg-white border border-stone-200 focus:border-blue-400 rounded-[3px] px-2.5 h-6.5 text-xs outline-none text-stone-900 font-semibold transition-all duration-150 cursor-pointer"
                    />
                  </SapInputField>
                </div>
              </div>
              {/* Scheduled Registry Table */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-2">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Active Scheduled Email Reports Registry
                  </h4>
                </div>
                <div className="w-full overflow-x-auto overflow-y-auto max-h-[320px] custom-scrollbar border border-stone-200 rounded-lg bg-white shadow-xs">
                  <table className="w-full text-xs text-left border-collapse min-w-[850px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-stone-50 border-b border-stone-200 text-stone-900 font-bold uppercase text-[10px] tracking-wider font-sans">
                        <th className="py-2.5 px-3 border-r border-stone-200 min-w-[200px]">Report Name</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 w-44">Frequency</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 min-w-[200px]">Recipients List</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 w-24 text-center">Format</th>
                        <th className="py-2.5 px-3 border-r border-stone-200 w-28 text-center font-mono">Next Execution</th>
                        <th className="py-2.5 px-3 text-center w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-700">
                      {scheduledReports.map((item, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                          <td className="py-2 px-3 border-r border-stone-200 font-semibold text-stone-900">{item.name}</td>
                          <td className="py-2 px-3 border-r border-stone-200 font-medium font-sans text-stone-600">{item.frequency}</td>
                          <td className="py-2 px-3 border-r border-stone-200 font-mono text-stone-600 truncate max-w-[200px]" title={item.recipients}>{item.recipients}</td>
                          <td className="py-2 px-3 border-r border-stone-200 text-center font-bold text-stone-700">{item.format}</td>
                          <td className="py-2 px-3 border-r border-stone-200 text-center font-mono text-stone-500">{item.nextRun}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              item.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between items-center bg-white border border-stone-200 rounded-md p-4 shadow-sm w-full">
                <Button onClick={() => addToast('info', 'Triggering instant report execution in background...')} variant="outline" className="border-stone-300 text-stone-750 hover:bg-stone-50 font-bold text-xs px-5 rounded-md h-9 cursor-pointer">
                  Run Report Now
                </Button>
                <Button onClick={handleSaveSchedule} className="bg-stone-850 hover:bg-black text-white font-bold text-xs px-6 rounded-md h-9 transition-all shadow-xs cursor-pointer">
                  Save Schedule Config
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </ErrorBoundary>
  );
}
