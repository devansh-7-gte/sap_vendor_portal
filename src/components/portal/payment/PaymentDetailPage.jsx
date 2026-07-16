'use client';

import React, { useMemo } from 'react';
import { ArrowLeft, Download, Printer, Share2, FileText, DollarSign, Banknote, Calendar } from 'lucide-react';
import { StatusBadge, PaymentTimeline, AlertBanner } from './components/DesignComponents';
import { formatCurrency, formatDate, daysBetween } from './utils/dataUtils';

export default function PaymentDetailPage({ payment, state, onBack }) {
  const timelineEvents = useMemo(() => {
    const invoiceDate = new Date(payment.invoiceDate);
    const paymentDate = new Date(payment.paymentDate);
    const clearingDate = new Date(payment.clearingDate);

    return [
      {
        title: 'Invoice Approved',
        date: formatDate(invoiceDate),
        completed: true,
        description: `Invoice ${payment.invoiceNumber} approved for payment`,
      },
      {
        title: 'Payment Scheduled',
        date: formatDate(new Date(paymentDate.getTime() - 2 * 24 * 60 * 60 * 1000)),
        completed: true,
        description: 'Payment included in F110 payment run',
      },
      {
        title: 'Payment Processed',
        date: formatDate(paymentDate),
        completed: true,
        description: `Payment processed with UTR: ${payment.utrNumber}`,
      },
      {
        title: 'Payment Cleared',
        date: formatDate(clearingDate),
        completed: payment.status === 'Cleared',
        description: 'Payment cleared and settled in bank account',
      },
    ];
  }, [payment]);

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[13px] font-semibold text-text-secondary hover:text-text-primary transition-colors duration-150 cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Back to List
        </button>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-surface2 rounded-none transition-colors duration-150 cursor-pointer">
            <Share2 className="size-4 text-text-secondary" />
          </button>
          <button className="p-2 hover:bg-surface2 rounded-none transition-colors duration-150 cursor-pointer">
            <Printer className="size-4 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* HEADER CARD */}
      <div className="card p-6">
        <div className="space-y-6">
          {/* Top section */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-4">
              <div>
                <p className="label mb-0">Payment Number</p>
                <p className="text-2xl font-bold text-text-primary font-mono mt-1 tabular-nums">{payment.paymentNumber}</p>
              </div>
              <div>
                <p className="label mb-0">Related Invoice</p>
                <p className="text-lg font-bold text-text-primary font-mono mt-1 tabular-nums">{payment.invoiceNumber}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="label mb-0">Status</p>
                <div className="mt-2">
                  <StatusBadge status={payment.status} size="md" />
                </div>
              </div>
              <div>
                <p className="label mb-0">Payment Date</p>
                <p className="text-lg font-bold text-text-primary mt-1 tabular-nums">{formatDate(payment.paymentDate)}</p>
              </div>
            </div>

            <div className="space-y-4 text-right">
              <div>
                <p className="label mb-0">Net Amount Paid</p>
                <p className="text-2xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">{formatCurrency(payment.netAmount)}</p>
              </div>
              <div>
                <p className="label mb-0">Clearing Status</p>
                <p className="text-sm font-bold text-text-primary mt-1 tabular-nums">{payment.clearingDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="label mb-0">Gross Amount</p>
          <p className="text-xl font-bold text-text-primary font-mono mt-2 tabular-nums">{formatCurrency(payment.grossAmount)}</p>
        </div>
        <div className="card p-4">
          <p className="label mb-0 text-rose-400">TDS Deduction</p>
          <p className="text-xl font-bold text-rose-400 font-mono mt-2 tabular-nums">{formatCurrency(payment.tdsAmount)}</p>
        </div>
        <div className="card p-4">
          <p className="label mb-0 text-amber-400">Other Adjustments</p>
          <p className="text-xl font-bold text-amber-400 font-mono mt-2 tabular-nums">{formatCurrency(0)}</p>
        </div>
        <div className="card p-4">
          <p className="label mb-0 text-emerald-400">Net Amount Paid</p>
          <p className="text-xl font-bold text-emerald-400 font-mono mt-2 tabular-nums">{formatCurrency(payment.netAmount)}</p>
        </div>
      </div>

      {/* PAYMENT INFORMATION */}
      <div className="card p-6">
        <h3 className="text-[15px] font-bold text-text-primary mb-6">Payment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="label mb-0">Payment Method</p>
              <p className="text-sm font-semibold text-text-primary mt-1">{payment.paymentMethod}</p>
            </div>
            <div>
              <p className="label mb-0">Bank Name</p>
              <p className="text-sm font-semibold text-text-primary mt-1">{payment.bankName}</p>
            </div>
            <div>
              <p className="label mb-0">UTR Number</p>
              <p className="text-sm font-mono font-bold text-text-primary mt-1 break-all tabular-nums">{payment.utrNumber}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="label mb-0">Transaction Reference</p>
              <p className="text-sm font-mono font-bold text-text-primary mt-1 tabular-nums">{payment.bankReference}</p>
            </div>
            <div>
              <p className="label mb-0">Clearing Date</p>
              <p className="text-sm font-semibold text-text-primary mt-1 tabular-nums">{formatDate(payment.clearingDate)}</p>
            </div>
            <div>
              <p className="label mb-0">Days to Clear</p>
              <p className="text-sm font-semibold text-text-primary mt-1 tabular-nums">
                {daysBetween(payment.paymentDate, payment.clearingDate)} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* INVOICE MAPPING */}
      <div className="card p-6">
        <h3 className="text-[15px] font-bold text-text-primary mb-6">Invoice Mapping</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="label mb-0">Invoice Number</p>
              <p className="text-base font-mono font-bold text-text-primary mt-1 tabular-nums">{payment.invoiceNumber}</p>
            </div>
            <div>
              <p className="label mb-0">Invoice Date</p>
              <p className="text-base font-semibold text-text-primary mt-1 tabular-nums">{formatDate(payment.invoiceDate)}</p>
            </div>
            <div>
              <p className="label mb-0">Invoice Amount</p>
              <p className="text-base font-mono font-bold text-text-primary mt-1 tabular-nums">{formatCurrency(payment.grossAmount)}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="label mb-0">PO Number</p>
              <p className="text-base font-mono font-bold text-text-primary mt-1 tabular-nums">{payment.poNumber}</p>
            </div>
            <div>
              <p className="label mb-0">GRN Number</p>
              <p className="text-base font-mono text-text-secondary mt-1 tabular-nums">GRN-001234</p>
            </div>
            <div>
              <p className="label mb-0">Status</p>
              <p className="text-base font-semibold text-emerald-400 mt-1">Matched & Cleared</p>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="card p-6">
        <h3 className="text-[15px] font-bold text-text-primary mb-6">Payment Lifecycle</h3>
        <PaymentTimeline events={timelineEvents} />
      </div>

      {/* ACTIONS */}
      <div className="card p-6">
        <h3 className="text-[15px] font-bold text-text-primary mb-6">Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="card p-4 hover:bg-surface2 transition-colors duration-150 flex flex-col items-center justify-center gap-2 group cursor-pointer">
            <FileText className="size-6 text-text-tertiary group-hover:text-text-primary transition-colors duration-150" />
            <span className="text-xs font-semibold text-text-primary">Download Advice</span>
          </button>
          <button className="card p-4 hover:bg-surface2 transition-colors duration-150 flex flex-col items-center justify-center gap-2 group cursor-pointer">
            <FileText className="size-6 text-text-tertiary group-hover:text-text-primary transition-colors duration-150" />
            <span className="text-xs font-semibold text-text-primary">Download Statement</span>
          </button>
          <button className="card p-4 hover:bg-surface2 transition-colors duration-150 flex flex-col items-center justify-center gap-2 group cursor-pointer">
            <FileText className="size-6 text-text-tertiary group-hover:text-text-primary transition-colors duration-150" />
            <span className="text-xs font-semibold text-text-primary">TDS Certificate</span>
          </button>
          <button className="card p-4 hover:bg-surface2 transition-colors duration-150 flex flex-col items-center justify-center gap-2 group cursor-pointer">
            <Printer className="size-6 text-text-tertiary group-hover:text-text-primary transition-colors duration-150" />
            <span className="text-xs font-semibold text-text-primary">Print Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
