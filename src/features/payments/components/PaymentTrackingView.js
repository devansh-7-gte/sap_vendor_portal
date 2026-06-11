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

export default function PaymentTrackingView({ state }) {
  const [detailTab, setDetailTab] = useState('status'); // 'status' | 'tds'
  const [isSapView, setIsSapView] = useState(false);

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
    <div className="space-y-6 max-w-full mx-auto animate-fade-in pb-16 relative select-none">

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-4 gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2.5">
            <span>Payment Tracking</span>
            <span className="size-1.5 rounded-full bg-amber-500"></span>
          </h2>
          <p className="text-stone-500 text-xs font-semibold">
            Process flow &bull; Screen designs with SAP field types &bull; Field mapping
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* TAB HEADERS */}
        <div className="flex items-center gap-2 bg-stone-100/50 border border-stone-200 p-1 rounded-xl w-fit">
          {[
            { id: 'status', label: 'Payment Status' },
            { id: 'tds', label: 'TDS Certificates' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setDetailTab(t.id)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${detailTab === t.id
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
                <span>{detailTab === 'status' ? 'Payment Status' : 'TDS Certificates'}</span>
              </h3>
            </div>

            {/* SAP/Form View Toggle Removed */}
          </div>

          {/* Tab 1: Payment Status Form */}
          {detailTab === 'status' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-6">
                {/* Section 1: Invoice Summary */}
                <div className="space-y-3.5">
                  <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                    <span>Invoice Summary</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <EnterpriseFieldCard
                      label="Invoice Number"
                      typeBadge="CHAR"
                      lenBadge="16"
                      mappingCode="BKPF-XBLNR"
                      isSapView={isSapView}
                    >
                      <span className="font-mono text-stone-800 font-bold text-xs select-all">
                        {invoice.invoiceNumber}
                      </span>
                    </EnterpriseFieldCard>

                    <EnterpriseFieldCard
                      label="SAP Document No."
                      typeBadge="CHAR"
                      lenBadge="10"
                      mappingCode="BKPF-BELNR"
                      isSapView={isSapView}
                    >
                      <span className="font-mono text-stone-800 font-bold text-xs select-all">
                        {invoice.sapMiroDoc}
                      </span>
                    </EnterpriseFieldCard>

                    <EnterpriseFieldCard
                      label="Payment Status"
                      typeBadge="CHAR"
                      lenBadge="10"
                      mappingCode="BSEG-AUGBL"
                      isSapView={isSapView}
                    >
                      <span className="font-bold text-stone-800 text-xs">
                        Cleared
                      </span>
                    </EnterpriseFieldCard>
                  </div>
                </div>

                {/* Section 2: Payment Details */}
                <div className="space-y-3.5">
                  <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                    <span>Payment Details</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <EnterpriseFieldCard
                      label="Gross Invoice Amount (₹)"
                      typeBadge="CURR"
                      lenBadge="13"
                      mappingCode="BSEG-DMBTR"
                      isSapView={isSapView}
                    >
                      <span className="font-mono text-stone-800 font-bold text-xs">
                        ₹ {grossAmount.toLocaleString()}.00
                      </span>
                    </EnterpriseFieldCard>

                    <EnterpriseFieldCard
                      label="TDS Deducted (₹)"
                      typeBadge="CURR"
                      lenBadge="13"
                      mappingCode="BSEG-QSBSH"
                      isSapView={isSapView}
                    >
                      <span className="font-mono text-stone-800 font-bold text-xs">
                        ₹ {tdsAmount.toLocaleString()}.00
                      </span>
                    </EnterpriseFieldCard>

                    <EnterpriseFieldCard
                      label="Net Amount Paid (₹)"
                      typeBadge="CURR"
                      lenBadge="13"
                      mappingCode="BSEG-WRBTR"
                      isSapView={isSapView}
                    >
                      <span className="font-mono text-stone-800 font-bold text-xs select-all">
                        ₹ {paymentAmount.toLocaleString()}.00
                      </span>
                    </EnterpriseFieldCard>

                    <EnterpriseFieldCard
                      label="Payment Date"
                      typeBadge="DATS"
                      lenBadge="8"
                      mappingCode="BSEG-AUGDT"
                      isSapView={isSapView}
                    >
                      <span className="font-mono text-stone-800 font-bold text-xs">
                        {selectedPayment.paymentDate}
                      </span>
                    </EnterpriseFieldCard>

                    <EnterpriseFieldCard
                      label="Payment Mode"
                      typeBadge="CHAR"
                      lenBadge="1"
                      mappingCode="BSEG-ZLSCH"
                      isSapView={isSapView}
                    >
                      <span className="font-bold text-stone-800 text-xs">
                        {selectedPayment.paymentMethod === 'NEFT' ? 'N' : 'R'}
                      </span>
                    </EnterpriseFieldCard>

                    <EnterpriseFieldCard
                      label="UTR / Cheque Number"
                      typeBadge="CHAR"
                      lenBadge="30"
                      mappingCode="BSEG-KIDNO"
                      isSapView={isSapView}
                    >
                      <span className="font-mono text-stone-800 font-bold text-xs select-all">
                        {selectedPayment.utrCode}
                      </span>
                    </EnterpriseFieldCard>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-stone-200 mt-6">
                  <Button
                    onClick={() => alert(`Raising inquiry regarding settlement transaction UTR: ${selectedPayment.utrCode}`)}
                    variant="outline"
                    className="border-stone-300 text-stone-700 hover:bg-black hover:text-white hover:border-black font-bold text-xs px-5 rounded-lg h-9 shadow-sm select-none"
                  >
                    Raise Query
                  </Button>
                  <Button
                    onClick={() => alert(`Downloading payment advice UTR slip: ${selectedPayment.utrCode}`)}
                    className="bg-stone-850 hover:bg-black text-stone-700 hover:text-white font-bold text-xs px-6 rounded-lg h-9 transition-all shadow-sm select-none"
                  >
                    Download Payment Advice
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
                  <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                    <span>Certificate Filter</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <EnterpriseFieldCard
                      label="Fiscal Year"
                      typeBadge="NUMC"
                      lenBadge="4"
                      mappingCode="WITH_ITEM-GJAHR"
                      isSapView={isSapView}
                    >
                      <span className="font-mono text-stone-800 font-bold text-xs">
                        2025
                      </span>
                    </EnterpriseFieldCard>

                    <EnterpriseFieldCard
                      label="Quarter"
                      typeBadge="DATS"
                      lenBadge="8"
                      mappingCode="WITH_ITEM-BUDAT"
                      isSapView={isSapView}
                    >
                      <span className="font-bold text-stone-800 text-xs">
                        Q1
                      </span>
                    </EnterpriseFieldCard>

                    <EnterpriseFieldCard
                      label="TDS Section"
                      typeBadge="CHAR"
                      lenBadge="2"
                      mappingCode="WITH_ITEM-WITHT"
                      isSapView={isSapView}
                    >
                      <span className="font-bold text-stone-800 text-xs">
                        194C
                      </span>
                    </EnterpriseFieldCard>
                  </div>
                </div>

                {/* Section 2: Certificate Details */}
                <div className="space-y-3.5">
                  <h4 className="text-[10px] font-bold text-stone-855 uppercase tracking-wider border-b border-stone-100 pb-1 flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-stone-700 rounded-xs" />
                    <span>Certificate Details</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <EnterpriseFieldCard
                      label="PAN of Deductee"
                      typeBadge="CHAR"
                      lenBadge="10"
                      mappingCode="LFA1-STCD3"
                      isSapView={isSapView}
                    >
                      <span className="font-mono text-stone-800 font-bold text-xs select-all uppercase">
                        {deducteePan}
                      </span>
                    </EnterpriseFieldCard>

                    <EnterpriseFieldCard
                      label="TAN of Deductor"
                      typeBadge="CHAR"
                      lenBadge="10"
                      mappingCode="J_1ICOMPANYCODE-J_1ITAN"
                      isSapView={isSapView}
                    >
                      <span className="font-mono text-stone-800 font-bold text-xs select-all uppercase">
                        {deductorTan}
                      </span>
                    </EnterpriseFieldCard>

                    <EnterpriseFieldCard
                      label="Total TDS (₹)"
                      typeBadge="CURR"
                      lenBadge="13"
                      mappingCode="WITH_ITEM-QBSHB"
                      isSapView={isSapView}
                    >
                      <span className="font-mono text-stone-800 font-bold text-xs font-mono">
                        ₹ {tdsAmount.toLocaleString()}.00
                      </span>
                    </EnterpriseFieldCard>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end pt-4 border-t border-stone-200 mt-6">
                  <Button
                    onClick={() => alert(`Downloading Form 16A quarterly TDS certificate for PAN: ${deducteePan}`)}
                    className="bg-stone-850 hover:bg-black text-stone-700 hover:text-white font-bold text-xs px-6 rounded-lg h-9 transition-all shadow-sm select-none"
                  >
                    Download Form 16A
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
