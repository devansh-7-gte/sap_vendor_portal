import React from 'react';
import { Receipt, AlertTriangle, CheckCircle2, Clock, RefreshCw, FileCheck, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Enterprise Field Card (Fiori Inspired Row Layout)
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
          <span className="text-[10px] font-bold text-red-655 mt-1 select-none">{error}</span>
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
  const uninvoicedGRNs = state.grns.filter(g => !g.invoiceSubmitted);
  const submittedInvoices = state.invoices;

  return (
    <div className="space-y-6 max-w-full mx-auto animate-fade-in pb-12">
      {/* Title Header */}
      <div className="bg-white border border-border p-4 rounded-sm shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 flex items-center gap-2">
            <Receipt className="size-4.5 text-primary" /> Invoice Verification &amp; Posting (MIRO)
          </h2>
          <p className="text-[11px] text-stone-500 mt-1 font-semibold">
            Evaluate inbound warehouse Goods Receipt notes (MIGO 101) and post supplier financial billing invoices
          </p>
        </div>
        <div className="text-xs font-bold font-mono bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-sm text-stone-800 shadow-2xs">
          Awaiting Billing: {uninvoicedGRNs.length} GRN(s)
        </div>
      </div>

      {/* AWAITING INVOICING CLEARANCE */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
          Warehouse Receipts Pending MIRO Verification
        </h3>
        
        {uninvoicedGRNs.length === 0 ? (
          <div className="p-10 rounded-sm border border-stone-200 bg-white text-center text-xs text-stone-500 shadow-xs">
            <CheckCircle2 className="size-8 text-green-600 mx-auto mb-2.5" />
            <p className="font-bold text-stone-900">All Goods Receipts are Invoiced</p>
            <p className="text-[10px] text-stone-400 mt-0.5">No pending warehouse receipts available. Submit new PO shipments first.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {uninvoicedGRNs.map(grn => {
              const isActive = selectedGrnId === grn.id;
              return (
                <div 
                  key={grn.id} 
                  className={`border transition-all duration-200 bg-white rounded-sm shadow-sm overflow-hidden ${
                    isActive ? 'border-primary ring-1 ring-primary/25' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {/* Summary Bar */}
                  <div className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isActive ? 'bg-blue-50/20' : 'bg-stone-50/10'
                  }`}>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-stone-900 font-mono bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-sm">
                          {grn.id}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono bg-stone-100 border border-stone-250 px-2 py-0.5 rounded-sm">
                          SAP MIGO Doc: {grn.sapMigoDoc}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-stone-450 font-bold uppercase tracking-wider font-mono">
                        <span>PO Ref: <span className="text-stone-900">{grn.poId}</span></span>
                        <span>&bull;</span>
                        <span>Posting Date: <span className="text-stone-900">{grn.postingDate}</span></span>
                        <span>&bull;</span>
                        <span>Inspector: <span className="text-stone-900">{grn.receivedBy}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => setSelectedGrnId(isActive ? null : grn.id)}
                        variant="default"
                        className={`font-bold text-xs rounded-sm h-8.5 px-4 cursor-pointer transition-colors ${
                          isActive 
                            ? 'bg-stone-150 hover:bg-stone-200 text-stone-800 border border-stone-300' 
                            : 'bg-primary hover:bg-primary/95 text-white shadow-xs'
                        }`}
                      >
                        {isActive ? 'Collapse Panel' : 'Execute MIRO Billing'}
                      </Button>
                    </div>
                  </div>

                  {/* 3-WAY MATCH VALIDATION FORM */}
                  {isActive && (
                    <div className="p-5 border-t border-stone-200 bg-white space-y-6 animate-fade-in">
                      <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-sm flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 select-none">
                            <Receipt className="size-4 text-stone-600" /> BAPI_INCOMINGINVOICE_CREATE Verification Matrix
                          </h4>
                          <p className="text-[10px] text-stone-500 mt-0.5">Please verify that PO values, GRN quantities, and invoice parameters align (3-Way Match).</p>
                        </div>
                        <span className="text-[9px] font-mono font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-sm">
                          STATUS: AWAITING POSTING
                        </span>
                      </div>

                      {/* ITEMS COMPARATIVE TABLE */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block font-mono">Line Item Receipt Quantities</span>
                        <div className="border border-stone-200 rounded-sm overflow-hidden bg-white">
                          <table className="w-full text-left text-xs bg-white border-collapse">
                            <thead>
                              <tr className="bg-stone-50 border-b border-stone-200 text-stone-900 font-bold text-[9px] uppercase font-mono">
                                <th className="py-2.5 px-4 w-12 border-r border-stone-200 text-center">Line</th>
                                <th className="py-2.5 px-4 border-r border-stone-200">Material &amp; Description</th>
                                <th className="py-2.5 px-4 text-right border-r border-stone-200">MIGO Received Qty</th>
                                <th className="py-2.5 px-4 text-right border-r border-stone-200 text-green-700">Accepted Qty (Billing)</th>
                                <th className="py-2.5 px-4 text-right text-red-650">Rejected Qty</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-150 text-[11px] text-stone-700 font-sans">
                              {grn.items.map((item, idx) => (
                                <tr key={item.line} className="hover:bg-stone-50/10">
                                  <td className="py-2.5 px-4 font-mono font-bold text-stone-500 border-r border-stone-200 text-center">
                                    {(idx + 1) * 10}
                                  </td>
                                  <td className="py-2.5 px-4 border-r border-stone-200">
                                    <p className="font-bold text-stone-900">{item.materialCode}</p>
                                    <p className="text-[9px] text-stone-450 font-mono mt-0.5">{item.description}</p>
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-mono font-semibold border-r border-stone-200">
                                    {item.receivedQuantity.toLocaleString()}
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-mono text-green-700 font-bold border-r border-stone-200 bg-green-50/10">
                                    {item.acceptedQuantity.toLocaleString()}
                                  </td>
                                  <td className={`py-2.5 px-4 text-right font-mono font-bold ${
                                    item.rejectedQuantity > 0 ? 'text-red-650 bg-red-50/5' : 'text-stone-300'
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
                      <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                          <div className="w-[320px] shrink-0">
                            <EnterpriseFieldCard
                              label="Vendor Invoice Ref No."
                              required
                              labelWidth="sm:w-36"
                            >
                              <input
                                type="text" 
                                required 
                                placeholder="e.g. TAX-2026-INV-84"
                                value={invoiceForm.invoiceNumber}
                                onChange={e => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                                className="w-[150px] bg-white border border-stone-300 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none text-stone-900 font-mono font-bold uppercase h-8"
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
                                className="w-[150px] bg-white border border-stone-300 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none text-stone-900 font-mono font-bold h-8"
                              />
                            </EnterpriseFieldCard>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                        <Button 
                          onClick={() => setSelectedGrnId(null)} 
                          variant="outline" 
                          className="border-stone-300 text-stone-750 hover:bg-stone-50 font-bold text-xs h-9 rounded-sm cursor-pointer"
                        >
                          Cancel
                        </Button>
                        <Button
                          disabled={isSubmitting}
                          onClick={() => handleInvoiceSubmit(grn)}
                          variant="default"
                          className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 rounded-sm h-9 flex items-center gap-1.5 cursor-pointer shadow-xs"
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
        <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
          Financial Invoice Registry (SAP MIRO ledger)
        </h3>
        
        {submittedInvoices.length === 0 ? (
          <div className="p-10 rounded-sm border border-stone-200 bg-white text-center text-xs text-stone-500 shadow-sm">
            <Landmark className="size-8 text-stone-300 mx-auto mb-2.5 animate-pulse" />
            <p className="font-bold text-stone-700">No Posted Invoices Found</p>
            <p className="text-[10px] text-stone-400 mt-0.5">Execute MIRO billing against goods receipts to post invoices to the SAP general ledger.</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-stone-200 rounded-sm bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-250 font-bold text-[9px] text-stone-900 uppercase tracking-wider">
                  <th className="py-3 px-5 border-r border-stone-200">Invoice Ref</th>
                  <th className="py-3 px-5 border-r border-stone-200">SAP MIRO Reference</th>
                  <th className="py-3 px-5 border-r border-stone-200">PO Contract ID</th>
                  <th className="py-3 px-5 text-right border-r border-stone-200">GST Invoice Value (18%)</th>
                  <th className="py-3 px-5 text-center">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150 text-stone-700 font-sans">
                {submittedInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-stone-50/20 transition-colors">
                    <td className="py-3 px-5 border-r border-stone-200">
                      <p className="font-bold text-stone-900 uppercase font-mono">{inv.invoiceNumber}</p>
                      <p className="text-[10px] text-stone-450 font-mono mt-0.5">Date: {inv.invoiceDate}</p>
                    </td>
                    <td className="py-3 px-5 font-mono border-r border-stone-200">
                      <p className="text-stone-900 font-bold">MIRO: {inv.sapMiroDoc}</p>
                      <p className="text-[9px] text-stone-400 mt-0.5">UUID: {inv.id}</p>
                    </td>
                    <td className="py-3 px-5 font-mono font-bold text-stone-650 border-r border-stone-200">
                      {inv.poId}
                    </td>
                    <td className="py-3 px-5 text-right font-mono font-bold text-stone-900 border-r border-stone-200 bg-stone-50/10">
                      ₹ {Number(inv.totalAmount).toLocaleString('en-IN')}.00
                    </td>
                    <td className="py-3 px-5 text-center">
                      {inv.status === 'Paid' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border bg-green-50 text-green-700 border-green-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="size-3" /> Paid (F110 Cleared)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold border bg-amber-50 text-amber-700 border-amber-250 inline-flex items-center gap-1">
                          <Clock className="size-3 animate-pulse" /> Posted (Open)
                        </span>
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
