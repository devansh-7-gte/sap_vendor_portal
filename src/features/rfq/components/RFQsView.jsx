import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui/StatusBadge';
import { rfqStatusVariant } from '@/lib/statusColors';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import FileUploadZone from '@/components/shared/FileUploadZone';

export default function RFQsView({
  state,
  selectedRfqId,
  setSelectedRfqId,
  bidPrices,
  setBidPrices,
  bidLeadTime,
  setBidLeadTime,
  bidRemarks,
  setBidRemarks,
  handleBidSubmit
}) {
  const [gstRate, setGstRate] = useState('18');
  const [validityDate, setValidityDate] = useState('');
  const [freight, setFreight] = useState(0);
  const [moq, setMoq] = useState(1);
  const [bidDoc, setBidDoc] = useState(null);

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div>
        <h2 className="text-[22px] font-bold text-text-primary">RFQ Price Bidding</h2>
        <p className="text-text-tertiary text-xs mt-0.5">Review requests for quotations and register bid pricing to SAP Info Records.</p>
      </div>

      {state.profile.status !== 'Approved' && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 flex items-start gap-3">
          <AlertTriangle className="size-5 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <h4 className="font-bold text-xs">Onboarding Verification Required</h4>
            <p className="text-[11px] mt-1 text-amber-700/80">You can view open RFQs, but bidding remains locked until compliance onboarding completes and assigned SAP code syncs.</p>
          </div>
        </div>
      )}

      {/* RFQ CARDS LIST */}
      <div className="space-y-4">
        {state.rfqs.map(rfq => (
          <div key={rfq.id} className="card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-text-primary font-mono">{rfq.id}</span>
                  <StatusBadge label={rfq.status} variant={rfqStatusVariant(rfq.status)} />
                </div>
                <h4 className="font-bold text-xs text-text-primary mt-1.5">{rfq.description}</h4>
              </div>
              <div className="text-right text-xs">
                <p className="text-text-tertiary">Deadline: <span className="text-text-primary font-bold font-mono tabular-nums">{rfq.deadlineDate}</span></p>
                <p className="text-[10px] text-text-tertiary mt-0.5 tabular-nums">Released: {rfq.createdDate}</p>
              </div>
            </div>

            {/* ITEMIZATION TABLE */}
            <div className="border border-border rounded-lg overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th>Line</th>
                    <th>Material description</th>
                    <th className="text-right">Quantity</th>
                    <th className="text-right">Target price</th>
                  </tr>
                </thead>
                <tbody>
                  {rfq.items.map(item => (
                    <tr key={item.line}>
                      <td className="font-mono tabular-nums">{item.line}</td>
                      <td>
                        <p className="font-semibold text-text-primary">{item.description}</p>
                        <p className="text-[10px] text-text-tertiary font-mono">{item.materialCode}</p>
                      </td>
                      <td className="text-right font-semibold tabular-nums">{item.quantity.toLocaleString()} {item.uom}</td>
                      <td className="text-right font-mono tabular-nums">
                        {item.targetPrice ? `₹${item.targetPrice.toFixed(2)}` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ACTION TRIGGERS */}
            <div className="flex justify-end pt-2 border-t border-border">
              {rfq.status === 'Bidding Open' && (
                <Button
                  onClick={() => {
                    if (state.profile.status !== 'Approved') {
                      alert('Onboarding is still pending. Bidding remains locked.');
                      return;
                    }
                    setSelectedRfqId(selectedRfqId === rfq.id ? null : rfq.id);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Configure & submit bid proposal
                </Button>
              )}

              {rfq.status === 'Submitted' && rfq.vendorBid && (
                <div className="w-full flex items-center justify-between text-xs p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                  <span className="text-amber-600 font-bold flex items-center gap-1.5">
                    <Clock className="size-4" /> Bid registered in SAP; under evaluation cycles
                  </span>
                  <div className="space-x-4 font-mono text-text-secondary tabular-nums">
                    <span>Lead time: <strong className="text-text-primary">{rfq.vendorBid.deliveryLeadTimeDays} Days</strong></span>
                    <span>Total Bid: <strong className="text-emerald-600">₹{rfq.items.reduce((sum, it) => sum + (rfq.vendorBid?.unitPrices[it.line] || 0) * it.quantity, 0).toLocaleString()}</strong></span>
                  </div>
                </div>
              )}

              {rfq.status === 'Awarded' && (
                <div className="w-full flex items-center justify-between text-xs p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" /> Bidding Awarded & Synced to SAP Info Records (BAPI)
                  </span>
                  <div className="font-mono text-text-secondary tabular-nums">
                    <span>Total contract: <strong className="text-emerald-700">₹{rfq.items.reduce((sum, it) => sum + (rfq.vendorBid?.unitPrices[it.line] || 0) * it.quantity, 0).toLocaleString()}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* EXPANDED PROPOSAL CONFIG FORM */}
            {selectedRfqId === rfq.id && (
              <div className="mt-4 p-5 rounded-lg border border-border bg-base/60 space-y-4 animate-slide-down">
                <h5 className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5">
                  Configure pricing proposal ({rfq.id})
                </h5>
                <div className="space-y-4">
                  {rfq.items.map(item => (
                    <div key={item.line} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center border-b border-border pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-xs font-bold text-text-primary">{item.description}</p>
                        <p className="text-[10px] text-text-tertiary font-mono tabular-nums">Line {item.line} • Target: ₹{item.targetPrice}</p>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <div className="space-y-1">
                          <label className="label">Bid Price (Unit) *</label>
                          <input
                            type="number" required placeholder={`Target: ₹${item.targetPrice}`}
                            value={bidPrices[rfq.id]?.[item.line] || ''}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setBidPrices({
                                ...bidPrices,
                                [rfq.id]: {
                                  ...(bidPrices[rfq.id] || {}),
                                  [item.line]: val
                                }
                              });
                            }}
                            className="w-40 text-right font-mono tabular-nums"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="label">Lead time (days)</label>
                      <input
                        type="number" value={bidLeadTime}
                        onChange={e => setBidLeadTime(Number(e.target.value))}
                        className="font-mono tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="label">GST Rate (%)</label>
                      <select
                        value={gstRate}
                        onChange={e => setGstRate(e.target.value)}
                        className="font-mono"
                      >
                        <option value="18">18% (Regular Services/Goods)</option>
                        <option value="12">12%</option>
                        <option value="5">5%</option>
                        <option value="28">28%</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="label">Validity Date</label>
                      <input
                        type="date" value={validityDate}
                        onChange={e => setValidityDate(e.target.value)}
                        className="font-mono tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="label">Freight Charge (INR)</label>
                      <input
                        type="number" value={freight}
                        onChange={e => setFreight(Number(e.target.value))}
                        className="font-mono tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="label">MOQ (Min Order Qty)</label>
                      <input
                        type="number" value={moq}
                        onChange={e => setMoq(Number(e.target.value))}
                        className="font-mono tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="label">Remarks / Notes</label>
                      <input
                        type="text" value={bidRemarks}
                        onChange={e => setBidRemarks(e.target.value)}
                        placeholder="e.g. Bulk shipment discounts included"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <FileUploadZone
                      label="Quotation Attachment / Bid Details"
                      value={bidDoc}
                      onUploadComplete={result => setBidDoc(result)}
                      onFileRemoved={() => setBidDoc(null)}
                      linkedTo="RFQ"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button onClick={() => setSelectedRfqId(null)} variant="ghost" size="sm">
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleBidSubmit(
                        rfq.id,
                        bidPrices[rfq.id],
                        bidLeadTime,
                        bidRemarks,
                        gstRate,
                        validityDate,
                        freight,
                        moq,
                        bidDoc ? [bidDoc] : []
                      )}
                      variant="default"
                      size="sm"
                    >
                      Submit Bidding Proposal
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
