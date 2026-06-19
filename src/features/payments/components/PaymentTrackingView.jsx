'use client';

import React, { useState } from 'react';
import {
  FileText, Landmark, Clock, CheckCircle2, ChevronRight, AlertCircle,
  Filter, Calendar, Building2, ShieldCheck, Receipt, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- SHARED LAYOUT COMPONENTS FROM REGISTRATION VIEW ---

function SectionHeader({ title, icon: Icon }) {
  return (
    <div className="col-span-full mb-1 mt-4 first:mt-0 select-none">
      <h3 className="text-[9px] font-bold text-stone-900 tracking-wider uppercase border-b-2 border-primary/30 pb-1.5 flex items-center gap-2">
        {Icon && <Icon className="size-3 text-primary shrink-0" />}
        <span>{title}</span>
      </h3>
    </div>
  );
}

function SapReadOnlyField({ label, value, isFile, isMonospace = true }) {
  return (
    <div className="flex items-center text-xs select-none min-h-[28px]">
      <span className="w-40 shrink-0 font-bold text-black text-right text-[11px] uppercase tracking-wide pr-2">
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
    ? (selectedPayment.grossAmount !== undefined ? selectedPayment.grossAmount : paymentAmount + tdsAmount)
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
                <SectionHeader title="SAP INVOICE REFERENCE DETAILS" icon={FileText} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '12px' }}>
                  <SapReadOnlyField label="Invoice Number" value={invoice.invoiceNumber} />
                  <SapReadOnlyField label="SAP Document No." value={invoice.sapMiroDoc} />
                  <SapReadOnlyField label="Payment Status" value="Cleared (F110)" />
                </div>
              </div>

              {/* Section 2: Payment Details */}
              <div className="space-y-2">
                <SectionHeader title="TREASURY CLEARING & SETTLEMENT PARAMETERS" icon={Landmark} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '12px' }}>
                  <SapReadOnlyField label="Gross Invoice Amount" value={`₹ ${grossAmount.toLocaleString('en-IN')}.00`} />
                  <SapReadOnlyField label="TDS Deducted (194C)" value={`- ₹ ${tdsAmount.toLocaleString('en-IN')}.00`} />
                  <SapReadOnlyField label="Net Settlement Disbursed" value={`₹ ${paymentAmount.toLocaleString('en-IN')}.00`} />
                  <SapReadOnlyField label="Clearing Date" value={selectedPayment.paymentDate} />
                  <SapReadOnlyField label="Payment Method" value={selectedPayment.paymentMethod === 'NEFT' ? 'N - NEFT Transfer' : 'R - RTGS Settlement'} isMonospace={false} />
                  <div className="col-span-2">
                    <SapReadOnlyField label="UTR / Reference" value={selectedPayment.utrCode} />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-between items-center bg-white border border-stone-200 rounded-md p-4 shadow-sm w-full">
                <Button
                  onClick={() => alert(`Raising inquiry regarding settlement transaction UTR: ${selectedPayment.utrCode}`)}
                  variant="outline"
                  className="border-stone-300 text-stone-750 hover:bg-stone-50 font-bold text-xs px-5 rounded-md h-9 cursor-pointer"
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
                <SectionHeader title="TAX LEDGER SELECTION FILTERS" icon={Filter} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '12px' }}>
                  <SapReadOnlyField label="Fiscal Assessment Year" value="2025 - 2026" />
                  <SapReadOnlyField label="Filing Quarter" value="Q1 (April - June)" />
                  <SapReadOnlyField label="Withholding Tax Section" value="SEC 194C (Contractors)" />
                </div>
              </div>

              {/* Section 2: Certificate Details */}
              <div className="space-y-2">
                <SectionHeader title="PAN / TAN TAX MAPPING LEDGER" icon={Building2} />
                <div className="grid grid-cols-2 gap-y-3 bg-white border border-stone-200 rounded-md p-4 shadow-sm w-fit mx-auto" style={{ columnGap: '12px' }}>
                  <SapReadOnlyField label="PAN of Deductee (Supplier)" value={deducteePan} />
                  <SapReadOnlyField label="TAN of Deductor (Customer)" value={deductorTan} />
                  <SapReadOnlyField label="Total Quarterly TDS Withheld" value={`₹ ${tdsAmount.toLocaleString('en-IN')}.00`} />
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
