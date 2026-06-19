'use client';

import React, { useState } from 'react';
import {
  FileText, Landmark, Clock, CheckCircle2, ChevronRight, AlertCircle,
  Filter, Calendar, Building2, ShieldCheck, Receipt, Download
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

export default function PaymentTrackingView({ state }) {
  const [detailTab, setDetailTab] = useState('status'); // 'status' | 'tds'

  // 1. Unified Fallback Mock Payment Data
  const cleanPayments = (state?.payments || []).length > 0
    ? state.payments
    : [
      {
        id: 'PAY-100234',
        invoiceId: 'INV-2025-0065',
        poId: 'PO-2025-0065',
        amount: 42500,
        paymentDate: '2026-06-01',
        utrCode: 'UTR2026060112',
        paymentMethod: 'NEFT'
      }
    ];

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
    return {
      id: payment.invoiceId,
      invoiceNumber: payment.invoiceId,
      sapMiroDoc: `510560${payment.id.slice(-4)}`,
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
    ? (selectedPayment.grossAmount !== undefined ? selectedPayment.grossAmount : paymentAmount - tdsAmount)
    : 0;
  const deductorTan = state?.profile?.tanNo || 'MUMB12345A';
  const deducteePan = state?.profile?.panNo || 'ABCDE1234F';

  return (
    <div className="space-y-6 max-w-full mx-auto animate-fade-in pb-16 relative">

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4 select-none">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <Landmark className="size-5.5 text-primary shrink-0" /> Payment Tracking
          </h2>
          <p className="text-stone-500 text-xs font-semibold">
            Track bank settlements (F110 runs), clear invoice ledgers, and download TDS certificates
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white border border-stone-300 hover:border-stone-400 rounded-md py-1.5 px-3 text-xs outline-none text-stone-700 font-semibold h-9 shadow-sm transition-all cursor-pointer">
            <Calendar className="size-3.5 text-stone-400" />
            <span>01 Apr 2026 - 30 Jun 2026</span>
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
            onClick={() => alert('Exporting payment ledger report')}
          >
            <Download className="size-3.5 text-stone-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* TAB NAVIGATION BAR */}
        <div className="flex border-b border-border select-none bg-white p-1 rounded-sm shadow-xs w-fit">
          <button
            onClick={() => setDetailTab('status')}
            className={`pb-2 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${detailTab === 'status'
              ? 'border-primary text-primary font-extrabold'
              : 'border-transparent text-stone-400 hover:text-stone-750'
              }`}
          >
            <CheckCircle2 className="size-4" /> Payment Ledger Status
          </button>
          <button
            onClick={() => setDetailTab('tds')}
            className={`pb-2 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${detailTab === 'tds'
              ? 'border-primary text-primary font-extrabold'
              : 'border-transparent text-stone-400 hover:text-stone-750'
              }`}
          >
            <FileText className="size-4" /> TDS Tax Certificates
          </button>
        </div>

        {/* TAB CONTENT BLOCK */}
        <div className="space-y-6 bg-transparent">
          {/* Tab 1: Payment Status Form */}
          {detailTab === 'status' && (
            <div className="space-y-6 animate-fade-in">
              {/* Section 1: Invoice Summary */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  SAP Invoice Reference Details
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                  <InlineFieldCell label="Invoice Number" icon={FileText}>
                    <span className="font-mono text-stone-900 font-bold select-all">
                      {invoice.invoiceNumber}
                    </span>
                  </InlineFieldCell>

                  <InlineFieldCell label="SAP Document No." icon={FileText}>
                    <span className="font-mono text-stone-900 font-bold select-all">
                      {invoice.sapMiroDoc}
                    </span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Payment Status" icon={CheckCircle2}>
                    <span className="px-2 py-0.5 rounded-sm text-[9px] font-extrabold border bg-green-50 text-green-700 border-green-200 inline-flex items-center gap-1 font-mono uppercase">
                      Cleared (F110)
                    </span>
                  </InlineFieldCell>
                </div>
              </div>

              {/* Section 2: Payment Details */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  Treasury Clearing &amp; Settlement Parameters
                </h4>
                <div className="space-y-2.5">
                  {/* Row 1: Amounts */}
                  <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                    <InlineFieldCell label="Gross Invoice Amount" icon={Receipt}>
                      <span className="font-mono text-stone-900 font-bold">
                        ₹ {grossAmount.toLocaleString('en-IN')}.00
                      </span>
                    </InlineFieldCell>

                    <InlineFieldCell label="TDS Deducted (194C)" icon={Receipt}>
                      <span className="font-mono text-red-600 font-bold">
                        - ₹ {tdsAmount.toLocaleString('en-IN')}.00
                      </span>
                    </InlineFieldCell>

                    <InlineFieldCell label="Net Settlement Disbursed" icon={Receipt}>
                      <span className="font-mono text-emerald-600 font-extrabold select-all">
                        ₹ {paymentAmount.toLocaleString('en-IN')}.00
                      </span>
                    </InlineFieldCell>
                  </div>

                  {/* Row 2: Audits & References */}
                  <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                    <InlineFieldCell label="Clearing Date" icon={Calendar}>
                      <span className="font-mono text-stone-900 font-semibold">
                        {selectedPayment.paymentDate}
                      </span>
                    </InlineFieldCell>

                    <InlineFieldCell label="Payment Method" icon={Landmark}>
                      <span className="text-stone-900 font-semibold">
                        {selectedPayment.paymentMethod === 'NEFT' ? 'N - NEFT Transfer' : 'R - RTGS Settlement'}
                      </span>
                    </InlineFieldCell>

                    <InlineFieldCell label="UTR / Reference" icon={FileText}>
                      <span className="font-mono text-stone-900 font-extrabold select-all">
                        {selectedPayment.utrCode}
                      </span>
                    </InlineFieldCell>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-between items-center bg-white border border-stone-200 rounded-md p-4 shadow-sm w-full">
                <Button
                  onClick={() => alert(`Raising inquiry regarding settlement transaction UTR: ${selectedPayment.utrCode}`)}
                  variant="outline"
                  className="border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs px-5 rounded-md h-9 cursor-pointer"
                >
                  Raise Query / Dispute
                </Button>
                <Button
                  onClick={() => alert(`Downloading payment advice UTR slip: ${selectedPayment.utrCode}`)}
                  className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 rounded-md h-9 transition-all shadow-xs cursor-pointer"
                >
                  Download Payment Advice Slip
                </Button>
              </div>
            </div>
          )}

          {/* Tab 2: TDS Certificates Form */}
          {detailTab === 'tds' && (
            <div className="space-y-6 animate-fade-in">
              {/* Section 1: Certificate Filter */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  Tax Ledger Selection Filters
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                  <InlineFieldCell label="Fiscal Assessment Year" icon={Calendar}>
                    <span className="font-mono text-stone-900 font-bold">
                      2025 - 2026
                    </span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Filing Quarter" icon={Filter}>
                    <span className="font-bold text-stone-900 font-mono">
                      Q1 (April - June)
                    </span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Withholding Tax Section" icon={ShieldCheck}>
                    <span className="font-bold text-stone-900 font-mono">
                      SEC 194C (Contractors)
                    </span>
                  </InlineFieldCell>
                </div>
              </div>

              {/* Section 2: Certificate Details */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                  PAN / TAN Tax Mapping Ledger
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-stretch bg-white border border-stone-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-stone-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                  <InlineFieldCell label="PAN of Deductee (Supplier)" icon={Building2}>
                    <span className="font-mono text-stone-900 font-extrabold select-all uppercase">
                      {deducteePan}
                    </span>
                  </InlineFieldCell>

                  <InlineFieldCell label="TAN of Deductor (Customer)" icon={Building2}>
                    <span className="font-mono text-stone-900 font-extrabold select-all uppercase">
                      {deductorTan}
                    </span>
                  </InlineFieldCell>

                  <InlineFieldCell label="Total Quarterly TDS Withheld" icon={Receipt}>
                    <span className="font-mono text-red-600 font-extrabold">
                      ₹ {tdsAmount.toLocaleString('en-IN')}.00
                    </span>
                  </InlineFieldCell>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end bg-white border border-stone-200 rounded-md p-4 shadow-sm w-full">
                <Button
                  onClick={() => alert(`Downloading Form 16A quarterly TDS certificate for PAN: ${deducteePan}`)}
                  className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 rounded-md h-9 transition-all shadow-xs cursor-pointer"
                >
                  Download Signed Form 16A Certificate
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
