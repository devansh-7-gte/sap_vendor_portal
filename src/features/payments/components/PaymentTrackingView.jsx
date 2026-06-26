'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Landmark, Clock, CheckCircle2, ChevronRight, AlertCircle,
  Filter, Calendar, Building2, ShieldCheck, Receipt, Download, Search, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SkeletonLoader from '@/components/shared/SkeletonLoader';
import ErrorBoundary from '@/components/ErrorBoundary';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  if (typeof dateStr === 'string' && dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

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

function SapReadOnlyField({ label, value, isFile, isMonospace = true }) {
  return (
    <div className="flex items-center text-xs select-none min-h-[28px] focus-within:outline-none">
      <span className="w-40 shrink-0 font-bold text-stone-800 text-right text-[9.5px] uppercase tracking-wide pr-2 select-none">
        {label}
      </span>
      <div 
        className={`inline-flex items-center gap-1.5 bg-stone-100 text-stone-900 border border-stone-300 rounded-[3px] px-2.5 text-xs h-6 font-semibold cursor-default box-border w-fit max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1 ${
          isMonospace ? 'font-mono' : 'font-sans'
        }`}
        title={value || ''}
        tabIndex={0}
      >
        {isFile && <FileText className="size-3.5 text-stone-500 shrink-0" />}
        <span>{value || '—'}</span>
      </div>
    </div>
  );
}

export default function PaymentTrackingView({ state }) {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const [detailTab, setDetailTab] = useState('status'); // 'status' | 'tds'

  // Filter and Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [toDateFilter, setToDateFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // TDS Certificates Filter and Search States
  const [tdsYearFilter, setTdsYearFilter] = useState('all');
  const [tdsQuarterFilter, setTdsQuarterFilter] = useState('all');
  const [tdsCurrentPage, setTdsCurrentPage] = useState(1);

  // 1. Unified fallback & live data merger to guarantee rich dummy data is always visible for testing
  const dbPayments = state?.payments || [];
  const mockPaymentsFallback = [
    {
      id: 'PMT-100234',
      invoiceId: 'INV-2026-0001',
      poId: 'PO-2026-0001',
      amount: 42570,
      grossAmount: 43000,
      tdsDeducted: 430,
      paymentDate: '2026-06-01',
      utrCode: 'UTR202606010012',
      paymentMethod: 'NEFT'
    },
    {
      id: 'PMT-100235',
      invoiceId: 'INV-2026-0002',
      poId: 'PO-2026-0002',
      amount: 123750,
      grossAmount: 125000,
      tdsDeducted: 1250,
      paymentDate: '2026-06-05',
      utrCode: 'UTR202606050098',
      paymentMethod: 'RTGS'
    },
    {
      id: 'PMT-100236',
      invoiceId: 'INV-2026-0003',
      poId: 'PO-2026-0003',
      amount: 84150,
      grossAmount: 85000,
      tdsDeducted: 850,
      paymentDate: '2026-06-10',
      utrCode: 'UTR202606100143',
      paymentMethod: 'NEFT'
    },
    {
      id: 'PMT-100237',
      invoiceId: 'INV-2026-0004',
      poId: 'PO-2026-0004',
      amount: 316800,
      grossAmount: 320000,
      tdsDeducted: 3200,
      paymentDate: '2026-06-15',
      utrCode: 'UTR202606150821',
      paymentMethod: 'RTGS'
    },
    {
      id: 'PMT-100238',
      invoiceId: 'INV-2026-0005',
      poId: 'PO-2026-0005',
      amount: 14850,
      grossAmount: 15000,
      tdsDeducted: 150,
      paymentDate: '2026-06-20',
      utrCode: 'UTR202606200259',
      paymentMethod: 'NEFT'
    },
    {
      id: 'PMT-100239',
      invoiceId: 'INV-2026-0006',
      poId: 'PO-2026-0006',
      amount: 94050,
      grossAmount: 95000,
      tdsDeducted: 950,
      paymentDate: '2026-06-25',
      utrCode: 'UTR202606250912',
      paymentMethod: 'NEFT'
    },
    {
      id: 'PMT-100240',
      invoiceId: 'INV-2026-0007',
      poId: 'PO-2026-0007',
      amount: 54450,
      grossAmount: 55000,
      tdsDeducted: 550,
      paymentDate: '2026-06-26',
      utrCode: 'UTR202606260843',
      paymentMethod: 'NEFT'
    },
    {
      id: 'PMT-100241',
      invoiceId: 'INV-2026-0008',
      poId: 'PO-2026-0008',
      amount: 209880,
      grossAmount: 212000,
      tdsDeducted: 2120,
      paymentDate: '2026-06-27',
      utrCode: 'UTR202606270119',
      paymentMethod: 'RTGS'
    },
    {
      id: 'PMT-100242',
      invoiceId: 'INV-2026-0009',
      poId: 'PO-2026-0009',
      amount: 65340,
      grossAmount: 66000,
      tdsDeducted: 660,
      paymentDate: '2026-06-28',
      utrCode: 'UTR202606280456',
      paymentMethod: 'NEFT'
    },
    {
      id: 'PMT-100243',
      invoiceId: 'INV-2026-0010',
      poId: 'PO-2026-0010',
      amount: 34155,
      grossAmount: 34500,
      tdsDeducted: 345,
      paymentDate: '2026-06-29',
      utrCode: 'UTR202606290882',
      paymentMethod: 'NEFT'
    },
    {
      id: 'PMT-100244',
      invoiceId: 'INV-2026-0011',
      poId: 'PO-2026-0011',
      amount: 178200,
      grossAmount: 180000,
      tdsDeducted: 1800,
      paymentDate: '2026-06-30',
      utrCode: 'UTR202606300445',
      paymentMethod: 'RTGS'
    },
    {
      id: 'PMT-100245',
      invoiceId: 'INV-2026-0012',
      poId: 'PO-2026-0012',
      amount: 72270,
      grossAmount: 73000,
      tdsDeducted: 730,
      paymentDate: '2026-07-02',
      utrCode: 'UTR202607020138',
      paymentMethod: 'NEFT'
    }
  ];

  // Merge dbPayments and mockPaymentsFallback, avoiding duplicates
  const cleanPayments = [...dbPayments];
  mockPaymentsFallback.forEach(mockP => {
    const isDuplicate = cleanPayments.some(
      p => p.id === mockP.id || p._id === mockP.id || (p.utrCode && p.utrCode === mockP.utrCode)
    );
    if (!isDuplicate) {
      cleanPayments.push(mockP);
    }
  });

  const selectedPayment = cleanPayments[0];
  const paymentAmount = selectedPayment
    ? (selectedPayment.amount !== undefined ? selectedPayment.amount : (selectedPayment.netAmount || 0))
    : 0;

  // Retrieve matching invoice data or fallback to mock values
  const getInvoiceForPayment = (payment) => {
    if (!payment) return null;
    const inv = (state?.invoices || []).find(i => i.id === payment.invoiceId || i.invoiceNumber === payment.invoiceId);
    if (inv) return inv;

    // Prefilled fallback values based on payment attributes
    const payAmt = payment.amount !== undefined ? payment.amount : (payment.netAmount || 0);
    const paymentIdStr = String(payment.id || payment._id || '0000');
    return {
      id: payment.invoiceId,
      invoiceNumber: payment.invoiceId,
      sapMiroDoc: `510560${paymentIdStr.slice(-4)}`,
      totalAmount: payAmt,
      subTotal: Math.round(payAmt / 1.18),
      taxAmount: Math.round(payAmt - (payAmt / 1.18)),
      status: 'Paid',
      invoiceDate: payment.paymentDate
    };
  };
  const invoice = getInvoiceForPayment(selectedPayment);
  const tdsAmount = selectedPayment
    ? (selectedPayment.tdsDeducted !== undefined ? selectedPayment.tdsDeducted : Math.round(paymentAmount * 0.01))
    : 0;
  const grossAmount = selectedPayment
    ? (selectedPayment.grossAmount !== undefined ? selectedPayment.grossAmount : paymentAmount + tdsAmount)
    : 0;
  const deductorTan = state?.profile?.tanNo || 'MUMB12345A';
  const deducteePan = state?.profile?.panNo || 'ABCDE1234F';

  // TDS Certificates Dataset
  const tdsCertificates = [
    {
      id: 'TDS-2026-Q1',
      fiscalYear: '2025-2026',
      quarter: 'Q1 (Apr - Jun)',
      section: 'SEC 194C',
      deducteePan: deducteePan,
      deductorTan: deductorTan,
      taxWithheld: 7160,
      filingDate: '2026-07-15',
      status: 'Filed & Signed',
      refNo: 'TDS16A-202607159'
    },
    {
      id: 'TDS-2025-Q4',
      fiscalYear: '2024-2025',
      quarter: 'Q4 (Jan - Mar)',
      section: 'SEC 194C',
      deducteePan: deducteePan,
      deductorTan: deductorTan,
      taxWithheld: 18400,
      filingDate: '2025-04-15',
      status: 'Filed & Signed',
      refNo: 'TDS16A-202504153'
    },
    {
      id: 'TDS-2025-Q3',
      fiscalYear: '2024-2025',
      quarter: 'Q3 (Oct - Dec)',
      section: 'SEC 194C',
      deducteePan: deducteePan,
      deductorTan: deductorTan,
      taxWithheld: 14250,
      filingDate: '2025-01-15',
      status: 'Filed & Signed',
      refNo: 'TDS16A-202501157'
    },
    {
      id: 'TDS-2025-Q2',
      fiscalYear: '2024-2025',
      quarter: 'Q2 (Jul - Sep)',
      section: 'SEC 194C',
      deducteePan: deducteePan,
      deductorTan: deductorTan,
      taxWithheld: 11900,
      filingDate: '2024-10-15',
      status: 'Filed & Signed',
      refNo: 'TDS16A-202410152'
    },
    {
      id: 'TDS-2025-Q1',
      fiscalYear: '2024-2025',
      quarter: 'Q1 (Apr - Jun)',
      section: 'SEC 194C',
      deducteePan: deducteePan,
      deductorTan: deductorTan,
      taxWithheld: 9800,
      filingDate: '2024-07-15',
      status: 'Filed & Signed',
      refNo: 'TDS16A-202407156'
    }
  ];

  // Sync TDS page to 1 when TDS filters change
  useEffect(() => {
    setTdsCurrentPage(1);
  }, [tdsYearFilter, tdsQuarterFilter]);

  // Filter TDS Certificates
  const filteredTds = tdsCertificates.filter(cert => {
    const matchesYear = tdsYearFilter === 'all' || cert.fiscalYear === tdsYearFilter;
    const matchesQuarter = tdsQuarterFilter === 'all' || cert.quarter.startsWith(tdsQuarterFilter);
    return matchesYear && matchesQuarter;
  });

  const tdsItemsPerPage = 5;
  const tdsTotalPages = Math.ceil(filteredTds.length / tdsItemsPerPage);
  const paginatedTds = filteredTds.slice((tdsCurrentPage - 1) * tdsItemsPerPage, tdsCurrentPage * tdsItemsPerPage);

  // Sync current page back to 1 when filters or data length change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, fromDateFilter, toDateFilter, paymentMethodFilter, cleanPayments.length]);

  // Filter payments based on query, date range, and method
  const filteredPayments = cleanPayments.filter(payment => {
    const invoiceData = getInvoiceForPayment(payment);
    const invoiceNo = (invoiceData?.invoiceNumber || payment.invoiceId || '').toLowerCase();
    const sapDoc = (invoiceData?.sapMiroDoc || '').toLowerCase();
    const utr = (payment.utrCode || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const clearingDateFormatted = formatDate(payment.paymentDate).toLowerCase();

    // 1. Search Query filter (matches invoice number, sap doc no, UTR, or formatted date)
    const matchesSearch = invoiceNo.includes(query) || 
                          sapDoc.includes(query) || 
                          utr.includes(query) ||
                          clearingDateFormatted.includes(query);

    // 2. Date range filter (clearing date within [fromDateFilter, toDateFilter])
    let matchesDate = true;
    if (payment.paymentDate) {
      try {
        const d = new Date(payment.paymentDate);
        if (!isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const dayVal = String(d.getDate()).padStart(2, '0');
          const clearingDateStr = `${y}-${m}-${dayVal}`; // "YYYY-MM-DD"
          
          if (fromDateFilter && clearingDateStr < fromDateFilter) {
            matchesDate = false;
          }
          if (toDateFilter && clearingDateStr > toDateFilter) {
            matchesDate = false;
          }
        }
      } catch (_) {}
    } else {
      if (fromDateFilter || toDateFilter) {
        matchesDate = false;
      }
    }

    // 3. Payment Method filter
    let matchesMethod = true;
    if (paymentMethodFilter !== 'all') {
      matchesMethod = payment.paymentMethod === paymentMethodFilter;
    }

    return matchesSearch && matchesDate && matchesMethod;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDownloadStatement = async () => {
    try {
      const clerkId = localStorage.getItem('clerk_user_id') || 'mock_vendor_id';
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/reports/statement`, {
        headers: {
          'x-vendor-id': clerkId
        }
      });
      if (!response.ok) throw new Error('Failed to download statement');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statement-Q1-2026.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(err.message || 'Failed to download statement PDF');
    }
  };

  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="p-4 space-y-4">
          <SkeletonLoader type="table" rows={6} cols={5} />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 max-w-full mx-auto animate-fade-in pb-16 relative">

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4 select-none">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <Landmark className="size-5 text-primary shrink-0" /> Payment Tracking
          </h2>
          <p className="text-stone-500 text-xs font-semibold">
            Track bank settlements (F110 runs), clear invoice ledgers, and download TDS certificates
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div 
            tabIndex={0}
            className="flex items-center gap-2 bg-white border border-stone-300 hover:border-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md py-1.5 px-3 text-xs text-stone-700 font-semibold h-9 shadow-sm transition-all cursor-pointer"
          >
            <Calendar className="size-4 text-stone-400 shrink-0" />
            <span>01 Apr 2026 - 30 Jun 2026</span>
          </div>
          <button 
            type="button"
            className="flex items-center gap-2 bg-white border border-stone-300 hover:border-stone-400 hover:bg-stone-50 text-stone-700 font-semibold px-3 h-9 rounded-md transition-all text-xs cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={() => alert('Opening Filters pane')}
          >
            <Filter className="size-4 text-stone-400 shrink-0" />
            <span>Filters</span>
          </button>
          <button 
            type="button"
            className="flex items-center gap-2 bg-white border border-stone-300 hover:border-stone-400 hover:bg-stone-50 text-stone-700 font-semibold px-3 h-9 rounded-md transition-all text-xs cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={() => alert('Exporting payment ledger report')}
          >
            <Download className="size-4 text-stone-400 shrink-0" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* TAB NAVIGATION BAR */}
        <div className="flex border-b border-border select-none bg-white p-1 rounded-sm shadow-xs w-fit">
          <button
            onClick={() => setDetailTab('status')}
            className={`pb-2 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-t-[3px] ${detailTab === 'status'
              ? 'border-primary text-primary font-extrabold'
              : 'border-transparent text-stone-400 hover:text-stone-700 hover:border-stone-200'
              }`}
          >
            <CheckCircle2 className="size-4 shrink-0" /> Payment Ledger Status
          </button>
          <button
            onClick={() => setDetailTab('tds')}
            className={`pb-2 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-t-[3px] ${detailTab === 'tds'
              ? 'border-primary text-primary font-extrabold'
              : 'border-transparent text-stone-400 hover:text-stone-700 hover:border-stone-200'
              }`}
          >
            <FileText className="size-4 shrink-0" /> TDS Tax Certificates
          </button>
        </div>

        {/* TAB CONTENT BLOCK */}
        <div className="space-y-6 bg-transparent">
          {/* Tab 1: Payment Status Form */}
          {detailTab === 'status' && (
            <div className="space-y-4 animate-fade-in">
              {/* Search & Inline Filters Controls */}
              <div className="bg-white border border-stone-200 rounded-lg p-3 flex flex-wrap items-center gap-3 shadow-xs">
                <div className="flex-1 min-w-[240px] relative">
                  <input
                    type="text"
                    placeholder="       Search by Invoice No, SAP Document, UTR, or Date..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-stone-300 focus:border-stone-500 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none h-9 font-sans"
                  />
                  <Search className="size-4 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">From</span>
                  <input
                    type="date"
                    value={fromDateFilter}
                    onChange={(e) => setFromDateFilter(e.target.value)}
                    className="bg-white border border-stone-300 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none h-9 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">To</span>
                  <input
                    type="date"
                    value={toDateFilter}
                    onChange={(e) => setToDateFilter(e.target.value)}
                    className="bg-white border border-stone-300 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none h-9 font-mono"
                  />
                  {(fromDateFilter || toDateFilter) && (
                    <button 
                      onClick={() => { setFromDateFilter(''); setToDateFilter(''); }}
                      className="text-xs text-red-500 font-semibold hover:underline cursor-pointer pl-1"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Method</span>
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    className="bg-white border border-stone-300 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none h-9 font-sans"
                  >
                    <option value="all">All Methods</option>
                    <option value="NEFT">NEFT Transfer</option>
                    <option value="RTGS">RTGS Settlement</option>
                  </select>
                </div>
              </div>

              {/* Combined Invoice & Payment Ledger Table */}
              <div className="w-full overflow-x-auto border border-stone-200 rounded-lg bg-white shadow-xs">
                <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-stone-50/75 border-b border-stone-200 text-black font-bold uppercase text-[10px] tracking-wider font-sans">
                      <th className="py-2.5 px-3 border-r border-stone-200 w-36">Invoice Number</th>
                      <th className="py-2.5 px-3 border-r border-stone-200 w-36">SAP Document No.</th>
                      <th className="py-2.5 px-3 border-r border-stone-200 w-28">Clearing Date</th>
                      <th className="py-2.5 px-3 border-r border-stone-200 w-32 text-right">Gross Amount</th>
                      <th className="py-2.5 px-3 border-r border-stone-200 w-32 text-right">TDS Deducted</th>
                      <th className="py-2.5 px-3 border-r border-stone-200 w-32 text-right">Net Disbursed</th>
                      <th className="py-2.5 px-3 border-r border-stone-200 min-w-[150px]">UTR / Reference</th>
                      <th className="py-2.5 px-3 border-r border-stone-200 w-24">Method</th>
                      <th className="py-2.5 px-3 border-r border-stone-200 w-24">Status</th>
                      <th className="py-2.5 px-3 text-center w-36">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-700">
                    {paginatedPayments.map((payment, idx) => {
                      const invData = getInvoiceForPayment(payment);
                      const payAmt = payment.amount !== undefined ? payment.amount : (payment.netAmount || 0);
                      const tdsAmt = payment.tdsDeducted !== undefined ? payment.tdsDeducted : Math.round(payAmt * 0.01);
                      const grossAmt = payment.grossAmount !== undefined ? payment.grossAmount : payAmt + tdsAmt;

                      return (
                        <tr key={payment.id || payment._id || idx} className="hover:bg-stone-50/50 transition-colors">
                          <td className="py-2 px-3 border-r border-stone-200">
                            <span className="text-blue-600 font-bold hover:underline cursor-pointer select-all whitespace-nowrap">
                              {invData?.invoiceNumber || payment.invoiceId}
                            </span>
                          </td>
                          <td className="py-2 px-3 border-r border-stone-200 font-mono font-semibold text-stone-800 whitespace-nowrap">
                            {invData?.sapMiroDoc || '—'}
                          </td>
                          <td className="py-2 px-3 border-r border-stone-200 font-medium font-mono text-stone-700 whitespace-nowrap">
                            {formatDate(payment.paymentDate)}
                          </td>
                          <td className="py-2 px-3 border-r border-stone-200 font-bold text-stone-900 text-right font-mono whitespace-nowrap">
                            ₹ {grossAmt.toLocaleString('en-IN')}.00
                          </td>
                          <td className="py-2 px-3 border-r border-stone-200 font-medium text-red-650 text-right font-mono whitespace-nowrap">
                            - ₹ {tdsAmt.toLocaleString('en-IN')}.00
                          </td>
                          <td className="py-2 px-3 border-r border-stone-200 font-extrabold text-emerald-700 text-right font-mono whitespace-nowrap">
                            ₹ {payAmt.toLocaleString('en-IN')}.00
                          </td>
                          <td className="py-2 px-3 border-r border-stone-200 font-mono font-bold text-stone-800 select-all break-all">
                            {payment.utrCode}
                          </td>
                          <td className="py-2 px-3 border-r border-stone-200 font-semibold text-stone-600 text-xs whitespace-nowrap">
                            {payment.paymentMethod || 'NEFT'}
                          </td>
                          <td className="py-2 px-3 border-r border-stone-200 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-250 bg-emerald-50 text-emerald-700">
                              <CheckCircle2 className="size-3 shrink-0" />
                              Cleared
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => alert(`Raising inquiry regarding settlement transaction UTR: ${payment.utrCode}`)}
                                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded border border-stone-200 text-[10px] font-bold transition-all cursor-pointer"
                                title="Raise query / dispute"
                              >
                                Query
                              </button>
                              <button
                                onClick={handleDownloadStatement}
                                className="px-2 py-1 bg-primary hover:bg-primary/95 text-white rounded text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                                title="Download Advice Slip"
                              >
                                Advice
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredPayments.length === 0 && (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-stone-400 font-semibold select-none">
                          No cleared invoice matching the filters found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Footer */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 text-stone-500 text-xs font-semibold select-none">
                  <div>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} invoices
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="p-1 border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-white text-stone-700 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="font-mono">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="p-1 border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-white text-stone-700 cursor-pointer transition-colors"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: TDS Certificates Form */}
          {detailTab === 'tds' && (
            <div className="space-y-4 animate-fade-in">
              {/* Search & Inline Filters Controls */}
              <div className="bg-white border border-stone-200 rounded-lg p-3 flex flex-wrap items-center gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Fiscal Year</span>
                  <select
                    value={tdsYearFilter}
                    onChange={(e) => setTdsYearFilter(e.target.value)}
                    className="bg-white border border-stone-300 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none h-9 font-sans"
                  >
                    <option value="all">All Years</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Quarter</span>
                  <select
                    value={tdsQuarterFilter}
                    onChange={(e) => setTdsQuarterFilter(e.target.value)}
                    className="bg-white border border-stone-300 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none h-9 font-sans"
                  >
                    <option value="all">All Quarters</option>
                    <option value="Q1">Q1 (Apr - Jun)</option>
                    <option value="Q2">Q2 (Jul - Sep)</option>
                    <option value="Q3">Q3 (Oct - Dec)</option>
                    <option value="Q4">Q4 (Jan - Mar)</option>
                  </select>
                </div>
              </div>

              {/* TDS Registry Table */}
              <div className="w-full overflow-x-auto custom-scrollbar border border-stone-200 rounded-lg bg-white shadow-xs">
                <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-stone-50/75 border-b border-stone-200 text-black font-bold uppercase text-[10px] tracking-wider font-sans">
                      <th className="py-2.5 px-4 border-r border-stone-200 whitespace-nowrap">Fiscal Year</th>
                      <th className="py-2.5 px-4 border-r border-stone-200 whitespace-nowrap">Quarter</th>
                      <th className="py-2.5 px-4 border-r border-stone-200 whitespace-nowrap">Section</th>
                      <th className="py-2.5 px-4 border-r border-stone-200 whitespace-nowrap">Deductor TAN</th>
                      <th className="py-2.5 px-4 border-r border-stone-200 whitespace-nowrap">Deductee PAN</th>
                      <th className="py-2.5 px-4 border-r border-stone-200 text-right whitespace-nowrap">Tax Withheld</th>
                      <th className="py-2.5 px-4 border-r border-stone-200 whitespace-nowrap">Filing Date</th>
                      <th className="py-2.5 px-4 border-r border-stone-200 text-center whitespace-nowrap">Status</th>
                      <th className="py-2.5 px-4 text-center whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-700 font-mono text-xs">
                    {paginatedTds.map((cert) => (
                      <tr key={cert.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-2.5 px-4 border-r border-stone-200 font-semibold font-sans text-stone-800 whitespace-nowrap">
                          {cert.fiscalYear}
                        </td>
                        <td className="py-2.5 px-4 border-r border-stone-200 font-bold font-sans text-stone-900 whitespace-nowrap">
                          {cert.quarter}
                        </td>
                        <td className="py-2.5 px-4 border-r border-stone-200 font-semibold text-stone-600 whitespace-nowrap">
                          {cert.section}
                        </td>
                        <td className="py-2.5 px-4 border-r border-stone-200 font-medium text-stone-800 select-all whitespace-nowrap">
                          {cert.deductorTan}
                        </td>
                        <td className="py-2.5 px-4 border-r border-stone-200 font-medium text-stone-800 select-all whitespace-nowrap">
                          {cert.deducteePan}
                        </td>
                        <td className="py-2.5 px-4 border-r border-stone-200 font-extrabold text-emerald-700 text-right whitespace-nowrap">
                          ₹ {cert.taxWithheld.toLocaleString('en-IN')}.00
                        </td>
                        <td className="py-2.5 px-4 border-r border-stone-200 whitespace-nowrap">
                          {formatDate(cert.filingDate)}
                        </td>
                        <td className="py-2.5 px-4 border-r border-stone-200 text-center font-sans whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border border-emerald-250 bg-emerald-50 text-emerald-700 whitespace-nowrap">
                            <ShieldCheck className="size-3 shrink-0" />
                            Filed & Signed
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center font-sans whitespace-nowrap">
                          <button
                            onClick={() => alert(`Downloading signed Form 16A quarterly TDS certificate for PAN: ${cert.deducteePan} (${cert.quarter} FY ${cert.fiscalYear})`)}
                            className="px-2.5 py-1 bg-primary hover:bg-primary/95 text-white rounded text-[10px] font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
                          >
                            Download Form 16A
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredTds.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-stone-400 font-semibold font-sans select-none whitespace-nowrap">
                          No filed TDS certificates found matching the criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TDS Table Pagination Footer */}
              {tdsTotalPages > 1 && (
                <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 text-stone-500 text-xs font-semibold select-none">
                  <div>
                    Showing {(tdsCurrentPage - 1) * tdsItemsPerPage + 1} to {Math.min(tdsCurrentPage * tdsItemsPerPage, filteredTds.length)} of {filteredTds.length} certificates
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={tdsCurrentPage === 1}
                      onClick={() => setTdsCurrentPage(prev => Math.max(1, prev - 1))}
                      className="p-1 border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-white text-stone-700 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="font-mono">
                      Page {tdsCurrentPage} of {tdsTotalPages}
                    </span>
                    <button
                      type="button"
                      disabled={tdsCurrentPage >= tdsTotalPages}
                      onClick={() => setTdsCurrentPage(prev => Math.min(tdsTotalPages, prev + 1))}
                      className="p-1 border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-white text-stone-700 cursor-pointer transition-colors"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      </div>
    </ErrorBoundary>
  );
}
