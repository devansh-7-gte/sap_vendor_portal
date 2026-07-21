import React from 'react';
import { Receipt, CheckCircle2, Clock, RefreshCw, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { invoiceStatusVariant } from '@/lib/statusColors';

// Enterprise Field Card (Fiori Inspired Row Layout)
function EnterpriseFieldCard({ label, required, error, labelWidth, children }) {
  return (
    <div className={`h-full py-1.5 px-3 bg-surface transition-colors duration-150 flex flex-col sm:flex-row sm:items-center gap-2 select-none ${
      error ? 'bg-red-50/10' : 'hover:bg-surface2/40 focus-within:bg-surface2/60'
    }`}>
      <label className={`text-xs font-bold text-text-primary ${labelWidth || 'sm:w-56'} shrink-0 whitespace-normal select-none block`} title={label}>
        {label} {required && <span className="text-red-500 font-bold select-none ml-0.5">*</span>}
      </label>
      <div className="flex-1 w-full min-w-0 flex flex-col justify-center">
        {children}
        {error && (
          <span className="text-[10px] font-bold text-red-600 mt-1 select-none">{error}</span>
        )}
      </div>
    </div>
  );
}

export default function InvoiceProcessingView({
  state,
  selectedGrnId,
  setSelectedGrnId,
  invoiceForm,
  setInvoiceForm,
  handleInvoiceSubmit,
  isSubmitting
}) {
  const uninvoicedGRNs = (state.grns || []).filter(g => !g.invoiceSubmitted);
  const submittedInvoices = state.invoices;

  return (
    <div className="space-y-6 max-w-full mx-auto animate-fade-in pb-12">
      {/* Title Header */}
      <div className="card p-4 flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-text-primary flex items-center gap-2">
            <Receipt className="size-4.5 text-text-secondary" /> Invoice Verification &amp; Posting (MIRO)
          </h2>
          <p className="text-[11px] text-text-tertiary mt-1 font-semibold">
            Evaluate inbound warehouse Goods Receipt notes (MIGO 101) and post supplier financial billing invoices
          </p>
        </div>
        <div className="text-xs font-bold font-mono bg-surface2 border border-border px-3 py-1.5 rounded-md text-text-primary tabular-nums">
          Awaiting Billing: {uninvoicedGRNs.length} GRN(s)
        </div>
      </div>

      {/* AWAITING INVOICING CLEARANCE */}
      <div className="space-y-3">
        <h3 className="label">
          Warehouse Receipts Pending MIRO Verification
        </h3>

        {uninvoicedGRNs.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={CheckCircle2}
              title="All Goods Receipts are Invoiced"
              description="No pending warehouse receipts available. Submit new PO shipments first."
            />
          </div>
        ) : (
          <div className="space-y-4">
            {uninvoicedGRNs.map(grn => {
              const isActive = selectedGrnId === grn.id;
              return (
                <div
                  key={grn.id}
                  className={`card overflow-hidden transition-colors duration-150 ${
                    isActive ? 'border-text-primary/40' : ''
                  }`}
                >
                  {/* Summary Bar */}
                  <div className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isActive ? 'bg-surface2/40' : ''
                  }`}>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-text-primary font-mono bg-surface2 border border-border px-2 py-0.5 rounded-md">
                          {grn.id}
                        </span>
                        <span className="text-[10px] text-text-tertiary font-mono bg-surface2 border border-border px-2 py-0.5 rounded-md">
                          SAP MIGO Doc: {grn.sapMigoDoc}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-text-tertiary font-bold uppercase tracking-wider font-mono">
                        <span>PO Ref: <span className="text-text-primary">{grn.poId}</span></span>
                        <span>&bull;</span>
                        <span>Posting Date: <span className="text-text-primary">{grn.postingDate}</span></span>
                        <span>&bull;</span>
                        <span>Inspector: <span className="text-text-primary">{grn.receivedBy}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => setSelectedGrnId(isActive ? null : grn.id)}
                        variant={isActive ? 'secondary' : 'default'}
                        size="sm"
                      >
                        {isActive ? 'Collapse Panel' : 'Execute MIRO Billing'}
                      </Button>
                    </div>
                  </div>

                  {/* 3-WAY MATCH VALIDATION FORM */}
                  {isActive && (
                    <div className="p-5 border-t border-border space-y-6 animate-fade-in">
                      <div className="bg-surface2/50 border border-border p-3.5 rounded-md flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 select-none">
                            <Receipt className="size-4 text-text-secondary" /> BAPI_INCOMINGINVOICE_CREATE Verification Matrix
                          </h4>
                          <p className="text-[10px] text-text-tertiary mt-0.5">Please verify that PO values, GRN quantities, and invoice parameters align (3-Way Match).</p>
                        </div>
                        <StatusBadge label="AWAITING POSTING" variant="info" />
                      </div>

                      {/* ITEMS COMPARATIVE TABLE */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider block font-mono">Line Item Receipt Quantities</span>
                        <div className="border border-border rounded-none overflow-x-auto">
                          <table className="w-full text-left table-sticky">
                            <thead>
                              <tr>
                                <th className="w-12 text-center">Line</th>
                                <th>Material &amp; Description</th>
                                <th className="text-right">MIGO Received Qty</th>
                                <th className="text-right">Accepted Qty (Billing)</th>
                                <th className="text-right">Rejected Qty</th>
                              </tr>
                            </thead>
                            <tbody>
                              {grn.items.map((item, idx) => (
                                <tr key={item.line}>
                                  <td className="font-mono font-bold text-text-tertiary text-center tabular-nums">
                                    {(idx + 1) * 10}
                                  </td>
                                  <td>
                                    <p className="font-bold text-text-primary">{item.materialCode}</p>
                                    <p className="text-[9px] text-text-tertiary font-mono mt-0.5">{item.description}</p>
                                  </td>
                                  <td className="text-right font-mono font-semibold tabular-nums">
                                    {item.receivedQuantity.toLocaleString()}
                                  </td>
                                  <td className="text-right font-mono text-emerald-400 font-bold tabular-nums">
                                    {item.acceptedQuantity.toLocaleString()}
                                  </td>
                                  <td className={`text-right font-mono font-bold tabular-nums ${
                                    item.rejectedQuantity > 0 ? 'text-rose-400' : 'text-text-tertiary'
                                  }`}>
                                    {item.rejectedQuantity > 0 ? item.rejectedQuantity.toLocaleString() : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* BILLING ENTRY INPUTS */}
                      <div className="flex flex-col border border-border rounded-none divide-y divide-border overflow-hidden">
                        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border">
                          <div className="w-[320px] shrink-0">
                            <EnterpriseFieldCard
                              label="Vendor Invoice Ref No."
                              required
                              labelWidth="sm:w-36"
                            >
                              <input
                                type="text"
                                required
                                maxLength={16}
                                placeholder="TAX-2026-INV-84"
                                value={invoiceForm.invoiceNumber}
                                onChange={e => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                                className="w-[20ch] font-mono font-bold uppercase h-8"
                              />
                            </EnterpriseFieldCard>
                          </div>

                          <div className="w-[300px] shrink-0">
                            <EnterpriseFieldCard
                              label="Invoice Date"
                              required
                              labelWidth="sm:w-24"
                            >
                              <input
                                type="date"
                                required
                                value={invoiceForm.invoiceDate}
                                onChange={e => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })}
                                className="w-[15ch] font-mono font-bold h-8 tabular-nums"
                              />
                            </EnterpriseFieldCard>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button
                          onClick={() => setSelectedGrnId(null)}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                        <Button
                          disabled={isSubmitting}
                          onClick={() => handleInvoiceSubmit(grn)}
                          variant="default"
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw className="size-3.5 animate-spin" /> Simulating 3-Way Match...
                            </>
                          ) : (
                            <>
                              Execute 3-Way Match &amp; Post MIRO
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SUBMITTED INVOICES REGISTRY */}
      <div className="space-y-3 pt-4">
        <h3 className="label">
          Financial Invoice Registry (SAP MIRO ledger)
        </h3>

        {submittedInvoices.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Landmark}
              title="No Posted Invoices Found"
              description="Execute MIRO billing against goods receipts to post invoices to the SAP general ledger."
            />
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-left table-sticky">
              <thead>
                <tr>
                  <th>Invoice Ref</th>
                  <th>SAP MIRO Reference</th>
                  <th>PO Contract ID</th>
                  <th className="text-right">GST Invoice Value (18%)</th>
                  <th className="text-center">Settlement Status</th>
                </tr>
              </thead>
              <tbody>
                {submittedInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td>
                      <p className="font-bold text-text-primary uppercase font-mono">{inv.invoiceNumber}</p>
                      <p className="text-[10px] text-text-tertiary font-mono mt-0.5">Date: {inv.invoiceDate}</p>
                    </td>
                    <td className="font-mono">
                      <p className="text-text-primary font-bold">MIRO: {inv.sapMiroDoc}</p>
                      <p className="text-[9px] text-text-tertiary mt-0.5">UUID: {inv.id}</p>
                    </td>
                    <td className="font-mono font-bold text-text-secondary">
                      {inv.poId}
                    </td>
                    <td className="text-right font-mono font-bold text-text-primary tabular-nums">
                      ₹ {Number(inv.totalAmount).toLocaleString('en-IN')}.00
                    </td>
                    <td className="text-center">
                      {inv.status === 'Paid' ? (
                        <StatusBadge label="Paid (F110 Cleared)" variant={invoiceStatusVariant(inv.status)} />
                      ) : (
                        <StatusBadge label="Posted (Open)" variant={invoiceStatusVariant(inv.status)} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
