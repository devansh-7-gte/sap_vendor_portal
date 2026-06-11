import React from 'react';
import { Receipt, AlertTriangle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InvoiceProcessingView({
  state,
  selectedGrnId,
  setSelectedGrnId,
  invoiceForm,
  setInvoiceForm,
  handleInvoiceSubmit,
  isSubmitting
}) {
  const uninvoicedGRNs = state.grns.filter(g => !g.invoiceSubmitted);
  const submittedInvoices = state.invoices;

  return (
    <div className="space-y-8 max-w-full mx-auto animate-fade-in pb-12">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-stone-900">Invoice Processing</h2>
        <p className="text-stone-500 text-xs mt-0.5 font-medium">
          Create billing invoices against warehouse Goods Receipts (SAP MIRO LIV).
        </p>
      </div>

      {/* AWAITING INVOICING CLEARANCE */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Awaiting Billing Clearance</h3>
        {uninvoicedGRNs.length === 0 ? (
          <div className="p-6 rounded-xl border border-stone-200 bg-white text-center text-xs text-stone-500 shadow-sm">
            No pending Goods Receipts available. Complete PO shipments and warehouse stores receipt checks first.
          </div>
        ) : (
          <div className="space-y-3">
            {uninvoicedGRNs.map(grn => (
              <div key={grn.id} className="p-4 border border-stone-200 bg-white rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-850 font-mono bg-stone-50 border border-stone-200 px-2 py-0.5 rounded">
                      {grn.id}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      (SAP GRN MIGO: {grn.sapMigoDoc})
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-stone-450 mt-1.5 font-semibold">
                    <span>PO Reference: {grn.poId}</span>
                    <span>&bull;</span>
                    <span>GRN Posting Date: {grn.postingDate}</span>
                    <span>&bull;</span>
                    <span>Received By: {grn.receivedBy}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setSelectedGrnId(selectedGrnId === grn.id ? null : grn.id)}
                    variant="default"
                    className="bg-stone-850 hover:bg-black text-stone-700 hover:text-white font-bold text-xs rounded-lg"
                  >
                    Execute MIRO Billing
                  </Button>
                </div>

                {/* 3-WAY MATCH VALIDATION FORM */}
                {selectedGrnId === grn.id && (
                  <div className="w-full mt-4 p-5 rounded-lg border border-stone-200 bg-stone-50/50 space-y-4 sm:col-span-2 animate-slide-down order-last">
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider border-b border-stone-200 pb-2 flex items-center gap-2">
                      <Receipt className="size-4.5 text-stone-500" /> MIRO Invoice Verification &amp; 3-Way Match Verification
                    </h4>

                    {/* ITEMS COMPARATIVE TABLE */}
                    <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
                      <table className="w-full text-left text-xs bg-white border-collapse">
                        <thead>
                          <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold text-[9px] uppercase">
                            <th className="py-2.5 px-4">Material description</th>
                            <th className="py-2.5 px-4 text-right">Received Qty</th>
                            <th className="py-2.5 px-4 text-right text-stone-750">Accepted Qty</th>
                            <th className="py-2.5 px-4 text-right text-stone-500">Rejected Qty</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-[11px] text-stone-700">
                          {grn.items.map(item => (
                            <tr key={item.line} className="hover:bg-stone-50/20">
                              <td className="py-3 px-4">
                                <p className="font-semibold text-stone-900">{item.description}</p>
                                <p className="text-[10px] text-stone-450 font-mono mt-0.5">{item.materialCode}</p>
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-semibold">{item.receivedQuantity}</td>
                              <td className="py-3 px-4 text-right font-mono text-stone-750 font-bold">{item.acceptedQuantity}</td>
                              <td className="py-3 px-4 text-right font-mono text-stone-500 font-bold">
                                {item.rejectedQuantity > 0 ? item.rejectedQuantity : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* BILLING ENTRY INPUTS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-455 uppercase block">Vendor Invoice Reference No. *</label>
                        <input
                          type="text" required placeholder="e.g. TAX-2025-INV-84"
                          value={invoiceForm.invoiceNumber}
                          onChange={e => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                          className="w-full bg-white border border-stone-300 focus:border-stone-500 rounded-lg px-3 py-1.5 text-xs outline-none text-stone-900 font-mono uppercase"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-455 uppercase block">Billing Document Date *</label>
                        <input
                          type="date" required value={invoiceForm.invoiceDate}
                          onChange={e => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })}
                          className="w-full bg-white border border-stone-300 focus:border-stone-500 rounded-lg px-3 py-1 text-xs outline-none text-stone-900 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-stone-200">
                      <Button onClick={() => setSelectedGrnId(null)} variant="ghost" className="text-stone-500 text-xs">
                        Cancel
                      </Button>
                      <Button
                        disabled={isSubmitting}
                        onClick={() => handleInvoiceSubmit(grn)}
                        variant="default"
                        className="bg-stone-850 hover:bg-black text-stone-700 hover:text-white font-bold text-xs px-6 rounded-lg flex items-center gap-1.5"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="size-3.5 animate-spin" /> Matching records...
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

      {/* SUBMITTED INVOICES REGISTRY */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Submitted Invoices Registry</h3>
        {submittedInvoices.length === 0 ? (
          <div className="p-6 rounded-xl border border-stone-200 bg-white text-center text-xs text-stone-500 shadow-sm">
            No logistics invoices posted.
          </div>
        ) : (
          <div className="overflow-hidden border border-stone-200 rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 font-bold text-[9px] text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Invoice Ref</th>
                  <th className="py-3 px-6">SAP MIRO Reference</th>
                  <th className="py-3 px-6">PO Contract ID</th>
                  <th className="py-3 px-6 text-right">GST Total (18%)</th>
                  <th className="py-3 px-6 text-center">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {submittedInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-stone-50/40 transition-colors">
                    <td className="py-3.5 px-6">
                      <p className="font-semibold text-stone-900 uppercase font-mono">{inv.invoiceNumber}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">Date: {inv.invoiceDate}</p>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-stone-800">
                      <p className="text-stone-800 font-bold">MIRO: {inv.sapMiroDoc}</p>
                      <p className="text-[9px] text-stone-400">UUID: {inv.id}</p>
                    </td>
                    <td className="py-3.5 px-6 font-mono font-semibold text-stone-650">{inv.poId}</td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-stone-900">
                      ₹ {inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold border bg-stone-100 text-stone-700 border-stone-200">
                        {inv.status === 'Paid' ? 'Paid (F110 Cleared)' : 'Posted (Open)'}
                      </span>
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
