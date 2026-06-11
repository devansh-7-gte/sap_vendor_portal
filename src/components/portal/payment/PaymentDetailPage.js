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
          className="flex items-center gap-2 text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to List
        </button>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
            <Share2 className="size-4 text-stone-600 dark:text-stone-400" />
          </button>
          <button className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
            <Printer className="size-4 text-stone-600 dark:text-stone-400" />
          </button>
        </div>
      </div>

      {/* HEADER CARD */}
      <div className="p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 backdrop-blur-sm">
        <div className="space-y-6">
          {/* Top section */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Payment Number</p>
                <p className="text-2xl font-bold text-stone-900 dark:text-white font-mono mt-1">{payment.paymentNumber}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Related Invoice</p>
                <p className="text-lg font-bold text-stone-900 dark:text-white font-mono mt-1">{payment.invoiceNumber}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Status</p>
                <div className="mt-2">
                  <StatusBadge status={payment.status} size="md" />
                </div>
              </div>
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Payment Date</p>
                <p className="text-lg font-bold text-stone-900 dark:text-white mt-1">{formatDate(payment.paymentDate)}</p>
              </div>
            </div>

            <div className="space-y-4 text-right">
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Net Amount Paid</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono mt-1">{formatCurrency(payment.netAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Clearing Status</p>
                <p className="text-sm font-bold text-stone-900 dark:text-white mt-1">{payment.clearingDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/30">
          <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold">Gross Amount</p>
          <p className="text-xl font-bold text-stone-900 dark:text-white font-mono mt-2">{formatCurrency(payment.grossAmount)}</p>
        </div>
        <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <p className="text-xs text-red-600 dark:text-red-400 uppercase font-bold">TDS Deduction</p>
          <p className="text-xl font-bold text-red-700 dark:text-red-300 font-mono mt-2">{formatCurrency(payment.tdsAmount)}</p>
        </div>
        <div className="p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <p className="text-xs text-yellow-600 dark:text-yellow-400 uppercase font-bold">Other Adjustments</p>
          <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300 font-mono mt-2">{formatCurrency(0)}</p>
        </div>
        <div className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <p className="text-xs text-green-600 dark:text-green-400 uppercase font-bold">Net Amount Paid</p>
          <p className="text-xl font-bold text-green-700 dark:text-green-300 font-mono mt-2">{formatCurrency(payment.netAmount)}</p>
        </div>
      </div>

      {/* PAYMENT INFORMATION */}
      <div className="p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-6">Payment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Payment Method</p>
              <p className="text-sm font-semibold text-stone-900 dark:text-white mt-1">{payment.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Bank Name</p>
              <p className="text-sm font-semibold text-stone-900 dark:text-white mt-1">{payment.bankName}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">UTR Number</p>
              <p className="text-sm font-mono font-bold text-stone-900 dark:text-white mt-1 break-all">{payment.utrNumber}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Transaction Reference</p>
              <p className="text-sm font-mono font-bold text-stone-900 dark:text-white mt-1">{payment.bankReference}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Clearing Date</p>
              <p className="text-sm font-semibold text-stone-900 dark:text-white mt-1">{formatDate(payment.clearingDate)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Days to Clear</p>
              <p className="text-sm font-semibold text-stone-900 dark:text-white mt-1">
                {daysBetween(payment.paymentDate, payment.clearingDate)} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* INVOICE MAPPING */}
      <div className="p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-6">Invoice Mapping</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold">Invoice Number</p>
              <p className="text-base font-mono font-bold text-stone-900 dark:text-white mt-1">{payment.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold">Invoice Date</p>
              <p className="text-base font-semibold text-stone-900 dark:text-white mt-1">{formatDate(payment.invoiceDate)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold">Invoice Amount</p>
              <p className="text-base font-mono font-bold text-stone-900 dark:text-white mt-1">{formatCurrency(payment.grossAmount)}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold">PO Number</p>
              <p className="text-base font-mono font-bold text-stone-900 dark:text-white mt-1">{payment.poNumber}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold">GRN Number</p>
              <p className="text-base font-mono text-stone-700 dark:text-stone-300 mt-1">GRN-001234</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold">Status</p>
              <p className="text-base font-semibold text-green-600 dark:text-green-400 mt-1">Matched & Cleared</p>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-6">Payment Lifecycle</h3>
        <PaymentTimeline events={timelineEvents} />
      </div>

      {/* ACTIONS */}
      <div className="p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-6">Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all flex flex-col items-center justify-center gap-2 group">
            <FileText className="size-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-stone-900 dark:text-white">Download Advice</span>
          </button>
          <button className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all flex flex-col items-center justify-center gap-2 group">
            <FileText className="size-6 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-stone-900 dark:text-white">Download Statement</span>
          </button>
          <button className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all flex flex-col items-center justify-center gap-2 group">
            <FileText className="size-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-stone-900 dark:text-white">TDS Certificate</span>
          </button>
          <button className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all flex flex-col items-center justify-center gap-2 group">
            <Printer className="size-6 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-stone-900 dark:text-white">Print Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
