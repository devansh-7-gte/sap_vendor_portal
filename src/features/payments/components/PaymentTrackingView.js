'use client';

import React, { useState } from 'react';
import { FileText, Landmark, Clock, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Enterprise Metadata Field Card (Fiori Inspired)
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
          <span className="text-[10px] font-bold text-red-650 mt-1 select-none">{error}</span>
        )}
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
      <div className="bg-white border border-border p-4 rounded-sm shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 flex items-center gap-2">
            <Landmark className="size-4.5 text-primary" /> Financial Accounts Settlement Monitor
          </h2>
          <p className="text-[11px] text-stone-500 mt-1 font-semibold">
            Track bank settlements (F110 runs), clear invoice ledgers, and download TDS certificates
          </p>
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
        <div className="bg-white border border-stone-200 rounded-sm p-6 shadow-sm space-y-6">
          {/* Tab 1: Payment Status Form */}
          {detailTab === 'status' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-6">
                {/* Section 1: Invoice Summary */}
                <div className="space-y-3.5">
                  <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                    SAP Invoice Reference Details
                  </h4>
                  <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                      <div className="w-[280px] shrink-0">
                        <EnterpriseFieldCard
                          label="Invoice Number"
                          labelWidth="sm:w-28"
                          typeBadge="CHAR"
                          lenBadge="16"
                          mappingCode="BKPF-XBLNR"
                        >
                          <span className="font-mono text-stone-850 font-bold text-xs select-all">
                            {invoice.invoiceNumber}
                          </span>
                        </EnterpriseFieldCard>
                      </div>

                      <div className="w-[280px] shrink-0">
                        <EnterpriseFieldCard
                          label="SAP Document No."
                          labelWidth="sm:w-32"
                          typeBadge="CHAR"
                          lenBadge="10"
                          mappingCode="BKPF-BELNR"
                        >
                          <span className="font-mono text-stone-850 font-bold text-xs select-all">
                            {invoice.sapMiroDoc}
                          </span>
                        </EnterpriseFieldCard>
                      </div>

                      <div className="w-[240px] shrink-0">
                        <EnterpriseFieldCard
                          label="Payment Status"
                          labelWidth="sm:w-28"
                          typeBadge="CHAR"
                          lenBadge="10"
                          mappingCode="BSEG-AUGBL"
                        >
                          <span className="px-2 py-0.5 rounded-sm text-[9px] font-extrabold border bg-green-50 text-green-700 border-green-200 inline-flex items-center gap-1 font-mono uppercase">
                            Cleared (F110)
                          </span>
                        </EnterpriseFieldCard>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Payment Details */}
                <div className="space-y-3.5">
                  <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                    Treasury Clearing &amp; Settlement Parameters
                  </h4>
                  <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                      <div className="w-[280px] shrink-0">
                        <EnterpriseFieldCard
                          label="Gross Invoice Amount"
                          labelWidth="sm:w-36"
                        >
                          <span className="font-mono text-stone-900 font-bold text-xs">
                            ₹ {grossAmount.toLocaleString('en-IN')}.00
                          </span>
                        </EnterpriseFieldCard>
                      </div>

                      <div className="w-[280px] shrink-0">
                        <EnterpriseFieldCard
                          label="TDS Deducted (194C)"
                          labelWidth="sm:w-36"
                          typeBadge="CURR"
                          lenBadge="13"
                          mappingCode="BSEG-QSBSH"
                        >
                          <span className="font-mono text-red-655 font-bold text-xs">
                            - ₹ {tdsAmount.toLocaleString('en-IN')}.00
                          </span>
                        </EnterpriseFieldCard>
                      </div>

                      <div className="w-[320px] shrink-0">
                        <EnterpriseFieldCard
                          label="Net Settlement Disbursed"
                          labelWidth="sm:w-44"
                          typeBadge="CURR"
                          lenBadge="13"
                          mappingCode="BSEG-WRBTR"
                        >
                          <span className="font-mono text-green-700 font-extrabold text-sm select-all">
                            ₹ {paymentAmount.toLocaleString('en-IN')}.00
                          </span>
                        </EnterpriseFieldCard>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                      <div className="w-[240px] shrink-0">
                        <EnterpriseFieldCard
                          label="Clearing Date"
                          labelWidth="sm:w-24"
                          typeBadge="DATS"
                          lenBadge="8"
                          mappingCode="BSEG-AUGDT"
                        >
                          <span className="font-mono text-stone-850 font-bold text-xs">
                            {selectedPayment.paymentDate}
                          </span>
                        </EnterpriseFieldCard>
                      </div>

                      <div className="w-[340px] shrink-0">
                        <EnterpriseFieldCard
                          label="Payment Method"
                          labelWidth="sm:w-28"
                          typeBadge="CHAR"
                          lenBadge="1"
                          mappingCode="BSEG-ZLSCH"
                        >
                          <span className="font-bold text-stone-850 text-xs">
                            {selectedPayment.paymentMethod === 'NEFT' ? 'N - NEFT Transfer' : 'R - RTGS Settlement'}
                          </span>
                        </EnterpriseFieldCard>
                      </div>

                      <div className="w-[300px] shrink-0">
                        <EnterpriseFieldCard
                          label="UTR / Reference"
                          labelWidth="sm:w-28"
                          typeBadge="CHAR"
                          lenBadge="30"
                          mappingCode="BSEG-KIDNO"
                        >
                          <span className="font-mono text-stone-900 font-extrabold text-xs select-all">
                            {selectedPayment.utrCode}
                          </span>
                        </EnterpriseFieldCard>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-stone-200 mt-6">
                  <Button
                    onClick={() => alert(`Raising inquiry regarding settlement transaction UTR: ${selectedPayment.utrCode}`)}
                    variant="outline"
                    className="border-stone-300 text-stone-750 hover:bg-stone-50 font-bold text-xs px-5 rounded-sm h-9 cursor-pointer"
                  >
                    Raise Query / Dispute
                  </Button>
                  <Button
                    onClick={() => alert(`Downloading payment advice UTR slip: ${selectedPayment.utrCode}`)}
                    className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 rounded-sm h-9 transition-all shadow-xs cursor-pointer"
                  >
                    Download Payment Advice Slip
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: TDS Certificates Form */}
          {detailTab === 'tds' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-6">
                {/* Section 1: Certificate Filter */}
                <div className="space-y-3.5">
                  <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                    Tax Ledger Selection Filters
                  </h4>
                  <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                      <div className="w-[260px] shrink-0">
                        <EnterpriseFieldCard
                          label="Fiscal Assessment Year"
                          labelWidth="sm:w-36"
                          typeBadge="NUMC"
                          lenBadge="4"
                          mappingCode="WITH_ITEM-GJAHR"
                        >
                          <span className="font-mono text-stone-850 font-bold text-xs">
                            2025 - 2026
                          </span>
                        </EnterpriseFieldCard>
                      </div>

                      <div className="w-[240px] shrink-0">
                        <EnterpriseFieldCard
                          label="Filing Quarter"
                          labelWidth="sm:w-24"
                          typeBadge="DATS"
                          lenBadge="8"
                          mappingCode="WITH_ITEM-BUDAT"
                        >
                          <span className="font-bold text-stone-850 text-xs font-mono">
                            Q1 (April - June)
                          </span>
                        </EnterpriseFieldCard>
                      </div>

                      <div className="w-[320px] shrink-0">
                        <EnterpriseFieldCard
                          label="Withholding Tax Section"
                          labelWidth="sm:w-40"
                          typeBadge="CHAR"
                          lenBadge="2"
                          mappingCode="WITH_ITEM-WITHT"
                        >
                          <span className="font-bold text-stone-850 text-xs font-mono">
                            SEC 194C (Contractors)
                          </span>
                        </EnterpriseFieldCard>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Certificate Details */}
                <div className="space-y-3.5">
                  <h4 className="text-[10px] font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                    PAN / TAN Tax Mapping Ledger
                  </h4>
                  <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                      <div className="w-[300px] shrink-0">
                        <EnterpriseFieldCard
                          label="PAN of Deductee (Supplier)"
                          labelWidth="sm:w-44"
                          typeBadge="CHAR"
                          lenBadge="10"
                          mappingCode="LFA1-STCD3"
                        >
                          <span className="font-mono text-stone-900 font-extrabold text-xs select-all uppercase">
                            {deducteePan}
                          </span>
                        </EnterpriseFieldCard>
                      </div>

                      <div className="w-[300px] shrink-0">
                        <EnterpriseFieldCard
                          label="TAN of Deductor (Customer)"
                          labelWidth="sm:w-44"
                          typeBadge="CHAR"
                          lenBadge="10"
                          mappingCode="J_1ICOMPANYCODE-J_1ITAN"
                        >
                          <span className="font-mono text-stone-900 font-extrabold text-xs select-all uppercase">
                            {deductorTan}
                          </span>
                        </EnterpriseFieldCard>
                      </div>

                      <div className="w-[340px] shrink-0">
                        <EnterpriseFieldCard
                          label="Total Quarterly TDS Withheld"
                          labelWidth="sm:w-44"
                          typeBadge="CURR"
                          lenBadge="13"
                          mappingCode="WITH_ITEM-QBSHB"
                        >
                          <span className="font-mono text-red-655 font-extrabold text-sm">
                            ₹ {tdsAmount.toLocaleString('en-IN')}.00
                          </span>
                        </EnterpriseFieldCard>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end pt-4 border-t border-stone-200 mt-6">
                  <Button
                    onClick={() => alert(`Downloading Form 16A quarterly TDS certificate for PAN: ${deducteePan}`)}
                    className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 rounded-sm h-9 transition-all shadow-xs cursor-pointer"
                  >
                    Download Signed Form 16A Certificate
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
