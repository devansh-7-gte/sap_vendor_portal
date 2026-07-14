import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { invoiceStatusVariant } from '@/lib/statusColors';
import { Receipt, RefreshCw, Download } from 'lucide-react';
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
        <div className="card">
          <TableSkeleton rows={6} cols={5} />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8 max-w-6xl animate-fade-in">
      <div>
        <h2 className="text-[22px] font-bold text-text-primary">Invoice Submission</h2>
        <p className="text-text-tertiary text-xs mt-0.5">Post logistics billing invoices against cleared warehouse GRNs (SAP MIRO LIV).</p>
      </div>

      {/* UNINVOICED BILLING ITEMS */}
      <div className="space-y-3">
        <h3 className="label">Awaiting Billing Clearance</h3>
        {uninvoicedGRNs.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Receipt}
              title="No pending Goods Receipts"
              description="Complete PO shipments and warehouse receipts before billing."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {uninvoicedGRNs.map(grn => (
              <div key={grn.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary font-mono">{grn.id}</span>
                    <span className="text-[10px] text-text-tertiary font-mono">(SAP GRN MIGO: {grn.sapMigoDoc})</span>
                    {grn.items.some(i => i.rejectedQuantity > 0) && (
                      <StatusBadge label="Stores rejection discrepant" variant="suspended" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-text-tertiary mt-1">
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
                  >
                    Execute MIRO Billing
                  </Button>
                </div>

                {/* EXPANDED MATCHING FORM */}
                {selectedGrnId === grn.id && (
                  <div className="w-full mt-4 p-5 rounded-lg border border-border bg-base/60 space-y-4 sm:col-span-2 animate-slide-down order-last">
                    <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
                      <Receipt className="size-4 text-emerald-text" /> MIRO Invoice Verification & 3-Way Match Check
                    </h4>

                    {/* GRN ITEM LISTING */}
                    <div className="border border-border rounded-lg overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr>
                            <th>Material description</th>
                            <th className="text-right">Receipt Qty</th>
                            <th className="text-right">Accepted Qty</th>
                            <th className="text-right">Rejected Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grn.items.map(item => (
                            <tr key={item.line}>
                              <td>
                                <p className="font-semibold text-text-primary">{item.description}</p>
                                <p className="text-[9px] text-text-tertiary font-mono">{item.materialCode}</p>
                              </td>
                              <td className="text-right font-mono tabular-nums">{item.receivedQuantity}</td>
                              <td className="text-right font-mono text-emerald-600 font-bold tabular-nums">{item.acceptedQuantity}</td>
                              <td className="text-right font-mono text-red-600 font-semibold tabular-nums">{item.rejectedQuantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* INPUTS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="label">Vendor Invoice Ref Code *</label>
                        <input
                          type="text" required placeholder="e.g. TAX-2026-INV-1092"
                          value={invoiceForm.invoiceNumber}
                          onChange={e => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                          className="font-mono uppercase"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="label">Billing Document Date *</label>
                        <input
                          type="date" required value={invoiceForm.invoiceDate}
                          onChange={e => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })}
                          className="font-mono tabular-nums"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-border">
                      <Button onClick={() => setSelectedGrnId(null)} variant="ghost" size="sm">
                        Cancel
                      </Button>
                      <Button
                        disabled={isSubmitting}
                        onClick={() => handleInvoiceSubmit(grn)}
                        variant="default"
                        size="sm"
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
        <h3 className="label">Submitted Invoices Registry</h3>
        {submittedInvoices.length === 0 ? (
          <div className="card">
            <EmptyState title="No logistics invoices submitted" />
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>Invoice ref</th>
                  <th>SAP MIRO Reference</th>
                  <th>PO Contract ID</th>
                  <th className="text-right">GST Total (18%)</th>
                  <th className="text-center">Settlement Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submittedInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td>
                      <p className="font-semibold text-text-primary uppercase font-mono">{inv.invoiceNumber}</p>
                      <p className="text-[10px] text-text-tertiary mt-0.5">Date: {inv.invoiceDate}</p>
                    </td>
                    <td className="font-mono">
                      <p className="text-text-primary font-bold">MIRO: {inv.sapMiroDoc}</p>
                      <p className="text-[9px] text-text-tertiary">Local ID: {inv.id}</p>
                    </td>
                    <td className="font-mono">{inv.poId}</td>
                    <td className="text-right font-mono text-text-primary font-bold tabular-nums">₹{inv.totalAmount.toLocaleString()}</td>
                    <td className="text-center">
                      <StatusBadge
                        label={inv.status === 'Paid' ? 'Paid (F110 Cleared)' : 'Posted (Open)'}
                        variant={invoiceStatusVariant(inv.status)}
                      />
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reports/invoice/${inv.id}`, '_blank')}
                        className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface2 transition-colors duration-150 rounded cursor-pointer"
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
