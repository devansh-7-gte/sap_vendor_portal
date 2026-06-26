import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Receipt, RefreshCw, Download } from 'lucide-react';
import SkeletonLoader from '@/components/shared/SkeletonLoader';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function InvoicesView({
  state, selectedGrnId, setSelectedGrnId, invoiceForm, setInvoiceForm, handleInvoiceSubmit, isSubmitting
}) {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const uninvoicedGRNs = (state?.grns || []).filter(g => !g.invoiceSubmitted);
  const submittedInvoices = state?.invoices || [];

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
      <div className="space-y-8 max-w-6xl animate-fade-in">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900">Invoice Submission</h2>
        <p className="text-gray-500 text-xs mt-0.5">Post logistics billing invoices against cleared warehouse GRNs (SAP MIRO LIV).</p>
      </div>

      {/* UNINVOICED BILLING ITEMS */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Awaiting Billing Clearance</h3>
        {uninvoicedGRNs.length === 0 ? (
          <div className="p-6 rounded-xl border border-gray-200 bg-white text-center text-xs text-gray-500 shadow-sm">
            No pending Goods Receipts available. Complete PO shipments and warehouse receipts before billing.
          </div>
        ) : (
          <div className="space-y-3">
            {uninvoicedGRNs.map(grn => (
              <div key={grn.id} className="p-4 border border-gray-200 bg-white rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1b6b5a] font-mono">{grn.id}</span>
                    <span className="text-[10px] text-gray-400 font-mono">(SAP GRN MIGO: {grn.sapMigoDoc})</span>
                    {grn.items.some(i => i.rejectedQuantity > 0) && (
                      <span className="px-1.5 py-0.2 rounded-full text-[8px] bg-red-50 text-red-650 border border-red-100 font-bold">
                        Stores rejection discrepant
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-gray-450 mt-1">
                    <span>PO Ref: {grn.poId}</span>
                    <span>•</span>
                    <span>GR Date: {grn.postingDate}</span>
                    <span>•</span>
                    <span>Receiver: {grn.receivedBy}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setSelectedGrnId(selectedGrnId === grn.id ? null : grn.id)}
                    variant="default"
                    size="sm"
                    className="bg-indigo-500 hover:bg-indigo-650 text-stone-700 font-bold text-xs"
                  >
                    Execute MIRO Billing
                  </Button>
                </div>

                {/* EXPANDED MATCHING FORM */}
                {selectedGrnId === grn.id && (
                  <div className="w-full mt-4 p-5 rounded-lg border border-gray-200 bg-gray-50/40 space-y-4 sm:col-span-2 animate-slide-down order-last">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-200 pb-2 flex items-center gap-2">
                      <Receipt className="size-4 text-indigo-500" /> MIRO Invoice Verification & 3-Way Match Check
                    </h4>

                    {/* GRN ITEM LISTING */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <table className="w-full text-left text-xs bg-white">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold text-[8px] uppercase">
                            <th className="py-2 px-3">Material description</th>
                            <th className="py-2 px-3 text-right">Receipt Qty</th>
                            <th className="py-2 px-3 text-right text-emerald-650">Accepted Qty</th>
                            <th className="py-2 px-3 text-right text-red-650">Rejected Qty</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-[11px]">
                          {grn.items.map(item => (
                            <tr key={item.line} className="text-gray-700">
                              <td className="py-2 px-3">
                                <p className="font-semibold text-gray-900">{item.description}</p>
                                <p className="text-[9px] text-gray-505 font-mono">{item.materialCode}</p>
                              </td>
                              <td className="py-2 px-3 text-right font-mono">{item.receivedQuantity}</td>
                              <td className="py-2 px-3 text-right font-mono text-emerald-600 font-bold">{item.acceptedQuantity}</td>
                              <td className="py-2 px-3 text-right font-mono text-red-505 font-semibold">{item.rejectedQuantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* INPUTS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-550 uppercase tracking-wider block">Vendor Invoice Ref Code *</label>
                        <input
                          type="text" required placeholder="e.g. TAX-2026-INV-1092"
                          value={invoiceForm.invoiceNumber}
                          onChange={e => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                          className="w-full bg-white border border-gray-300 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs outline-none text-gray-900 font-mono uppercase"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-550 uppercase tracking-wider block">Billing Document Date *</label>
                        <input
                          type="date" required value={invoiceForm.invoiceDate}
                          onChange={e => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })}
                          className="w-full bg-white border border-gray-300 focus:border-indigo-550 rounded-lg px-3 py-1 text-xs outline-none text-gray-900 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
                      <Button onClick={() => setSelectedGrnId(null)} variant="ghost" size="sm" className="text-gray-450 text-xs">
                        Cancel
                      </Button>
                      <Button
                        disabled={isSubmitting}
                        onClick={() => handleInvoiceSubmit(grn)}
                        variant="default"
                        size="sm"
                        className="bg-indigo-500 hover:bg-indigo-650 text-stone-700 font-bold text-xs px-6 flex items-center gap-1.5 shadow-sm"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="size-3.5 animate-spin" /> Verifying matching integrity...
                          </>
                        ) : (
                          'Execute 3-Way Match & MIRO Post'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BILLING ARCHIVE */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Submitted Invoices Registry</h3>
        {submittedInvoices.length === 0 ? (
          <div className="p-6 rounded-xl border border-gray-200 bg-white text-center text-xs text-gray-505 shadow-sm">
            No logistics invoices submitted.
          </div>
        ) : (
          <div className="overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 font-bold text-[9px] text-gray-550 uppercase tracking-wider">
                  <th className="py-3 px-6">Invoice ref</th>
                  <th className="py-3 px-6">SAP MIRO Reference</th>
                  <th className="py-3 px-6">PO Contract ID</th>
                  <th className="py-3 px-6 text-right">GST Total (18%)</th>
                  <th className="py-3 px-6 text-center">Settlement Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submittedInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-3.5 px-6">
                      <p className="font-semibold text-gray-900 uppercase font-mono">{inv.invoiceNumber}</p>
                      <p className="text-[10px] text-gray-550 mt-0.5">Date: {inv.invoiceDate}</p>
                    </td>
                    <td className="py-3.5 px-6 font-mono">
                      <p className="text-[#1b6b5a] font-bold">MIRO: {inv.sapMiroDoc}</p>
                      <p className="text-[9px] text-gray-450">Local ID: {inv.id}</p>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-gray-600">{inv.poId}</td>
                    <td className="py-3.5 px-6 text-right font-mono text-gray-900 font-bold">₹{inv.totalAmount.toLocaleString()}</td>
                    <td className="py-3.5 px-6 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      }`}>
                        {inv.status === 'Paid' ? 'Paid (F110 Cleared)' : 'Posted (Open)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <button
                        onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reports/invoice/${inv.id}`, '_blank')}
                        className="p-1.5 text-indigo-650 hover:text-indigo-900 hover:bg-stone-50 transition-all rounded cursor-pointer"
                        title="Download Invoice PDF"
                      >
                        <Download className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </ErrorBoundary>
  );
}
