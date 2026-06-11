import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

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
  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900">RFQ Price Bidding</h2>
        <p className="text-gray-500 text-xs mt-0.5">Review requests for quotations and register bid pricing to SAP Info Records.</p>
      </div>

      {state.profile.status !== 'Approved' && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 flex items-start gap-3">
          <AlertTriangle className="size-5 shrink-0 mt-0.5 text-amber-650" />
          <div>
            <h4 className="font-bold text-xs">Onboarding Verification Required</h4>
            <p className="text-[11px] mt-1 text-amber-700/80">You can view open RFQs, but bidding remains locked until compliance onboarding completes and assigned SAP code syncs.</p>
          </div>
        </div>
      )}

      {/* RFQ CARDS LIST */}
      <div className="space-y-4">
        {state.rfqs.map(rfq => (
          <div key={rfq.id} className="p-5 border border-gray-200 bg-white rounded-xl shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-[#1b6b5a] font-mono">{rfq.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    rfq.status === 'Bidding Open' ? 'bg-sky-50 text-sky-600 border border-sky-100' :
                    rfq.status === 'Submitted' ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse' :
                    rfq.status === 'Awarded' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}>
                    {rfq.status}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-gray-900 mt-1.5">{rfq.description}</h4>
              </div>
              <div className="text-right text-xs">
                <p className="text-gray-455">Deadline: <span className="text-gray-700 font-bold font-mono">{rfq.deadlineDate}</span></p>
                <p className="text-[10px] text-gray-400 mt-0.5">Released: {rfq.createdDate}</p>
              </div>
            </div>

            {/* ITEMIZATION TABLE */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/20">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold text-[9px] uppercase">
                    <th className="py-2 px-4">Line</th>
                    <th className="py-2 px-4">Material description</th>
                    <th className="py-2 px-4 text-right">Quantity</th>
                    <th className="py-2 px-4 text-right">Target price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {rfq.items.map(item => (
                    <tr key={item.line} className="text-gray-700">
                      <td className="py-2.5 px-4 font-mono text-gray-400">{item.line}</td>
                      <td className="py-2.5 px-4">
                        <p className="font-semibold text-gray-900">{item.description}</p>
                        <p className="text-[10px] text-gray-505 font-mono">{item.materialCode}</p>
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold">{item.quantity.toLocaleString()} {item.uom}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-gray-600">
                        {item.targetPrice ? `₹${item.targetPrice.toFixed(2)}` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ACTION TRIGGERS */}
            <div className="flex justify-end pt-2 border-t border-gray-100">
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
                  className="border-sky-200 text-sky-600 hover:bg-sky-50 font-bold text-xs"
                >
                  Configure & submit bid proposal
                </Button>
              )}

              {rfq.status === 'Submitted' && rfq.vendorBid && (
                <div className="w-full flex items-center justify-between text-xs p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                  <span className="text-amber-600 font-bold flex items-center gap-1.5">
                    <Clock className="size-4" /> Bid registered in SAP; under evaluation cycles
                  </span>
                  <div className="space-x-4 font-mono text-gray-600">
                    <span>Lead time: <strong className="text-gray-900">{rfq.vendorBid.deliveryLeadTimeDays} Days</strong></span>
                    <span>Total Bid: <strong className="text-emerald-600">₹{rfq.items.reduce((sum, it) => sum + (rfq.vendorBid?.unitPrices[it.line] || 0) * it.quantity, 0).toLocaleString()}</strong></span>
                  </div>
                </div>
              )}

              {rfq.status === 'Awarded' && (
                <div className="w-full flex items-center justify-between text-xs p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" /> Bidding Awarded & Synced to SAP Info Records (BAPI)
                  </span>
                  <div className="font-mono text-gray-600">
                    <span>Total contract: <strong className="text-emerald-700">₹{rfq.items.reduce((sum, it) => sum + (rfq.vendorBid?.unitPrices[it.line] || 0) * it.quantity, 0).toLocaleString()}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* EXPANDED PROPOSAL CONFIG FORM */}
            {selectedRfqId === rfq.id && (
              <div className="mt-4 p-5 rounded-lg border border-gray-250 bg-gray-50/40 space-y-4 animate-slide-down">
                <h5 className="text-[10px] font-bold text-gray-505 uppercase tracking-wider flex items-center gap-1.5">
                  Configure pricing proposal ({rfq.id})
                </h5>
                <div className="space-y-4">
                  {rfq.items.map(item => (
                    <div key={item.line} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-xs font-bold text-gray-900">{item.description}</p>
                        <p className="text-[10px] text-gray-500 font-mono">Line {item.line} • Target: ₹{item.targetPrice}</p>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Bid Price (Unit) *</label>
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
                            className="w-40 bg-white border border-gray-300 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-xs outline-none text-right font-mono text-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Lead time (days)</label>
                      <input
                        type="number" value={bidLeadTime}
                        onChange={e => setBidLeadTime(Number(e.target.value))}
                        className="w-full bg-white border border-gray-300 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs outline-none text-gray-900 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Remarks / Notes</label>
                      <input
                        type="text" value={bidRemarks}
                        onChange={e => setBidRemarks(e.target.value)}
                        placeholder="e.g. Bulk shipment discounts included"
                        className="w-full bg-white border border-gray-300 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs outline-none text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button onClick={() => setSelectedRfqId(null)} variant="ghost" size="sm" className="text-gray-550 text-xs">
                      Cancel
                    </Button>
                    <Button onClick={() => handleBidSubmit(rfq.id)} variant="default" size="sm" className="bg-[#22c55e] hover:bg-[#1ebd53] text-stone-700 font-bold text-xs px-6">
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
