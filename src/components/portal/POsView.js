import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Clock, CheckCircle2, Truck } from 'lucide-react';

export default function POsView({
  state, selectedPoId, setSelectedPoId, asnForm, setAsnForm, handleAsnSubmit, acknowledgePO
}) {
  const activePOs = state.pos;

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900">Purchase Orders</h2>
        <p className="text-gray-500 text-xs mt-0.5">Acknowledge synced purchase orders and submit Advanced Shipping Notices (ASN).</p>
      </div>

      {activePOs.length === 0 ? (
        <div className="p-8 rounded-xl border border-gray-200 bg-white text-center text-gray-400 shadow-sm">
          <ShoppingBag className="size-8 mx-auto text-gray-350 mb-3" />
          <p className="text-xs font-semibold text-gray-700">No purchase orders synced</p>
          <p className="text-[11px] text-gray-450 mt-1">Purchase orders will appear once onboarding is approved or RFQs are awarded.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activePOs.map(po => (
            <div key={po.id} className="p-5 border border-gray-200 bg-white rounded-xl shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-[#1b6b5a] font-mono">{po.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      po.status === 'Open' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      po.status === 'Acknowledged' ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' :
                      po.status === 'Dispatched' ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse' :
                      po.status === 'Delivered' ? 'bg-emerald-50 text-emerald-650 border border-emerald-100' :
                      'bg-gray-50 text-gray-500 border border-gray-200'
                    }`}>
                      {po.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-gray-450 mt-1">
                    <span>Date: {po.createdDate}</span>
                    <span>•</span>
                    <span>Terms: {po.paymentTerms}</span>
                    <span>•</span>
                    <span>Currency: {po.currency}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-455">Total contract value</p>
                  <p className="text-sm font-bold text-gray-900 font-mono">₹{po.items.reduce((s, i) => s + i.netValue, 0).toLocaleString()}.00</p>
                </div>
              </div>

              {/* ITEMIZATION TABLE */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/20">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-550 font-bold text-[9px] uppercase">
                      <th className="py-2 px-4">Line</th>
                      <th className="py-2 px-4">Material description</th>
                      <th className="py-2 px-4 text-right">Ordered Qty</th>
                      <th className="py-2 px-4 text-right">Unit Price</th>
                      <th className="py-2 px-4 text-right">Net Value</th>
                      <th className="py-2 px-4 text-right">GRN Accepted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {po.items.map(item => (
                      <tr key={item.line} className="text-gray-750">
                        <td className="py-2 px-4 font-mono text-gray-400">{item.line}</td>
                        <td className="py-2 px-4">
                          <p className="font-semibold text-gray-900">{item.description}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{item.materialCode}</p>
                        </td>
                        <td className="py-2 px-4 text-right font-semibold">{item.quantity.toLocaleString()} {item.uom}</td>
                        <td className="py-2 px-4 text-right font-mono text-gray-600">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="py-2 px-4 text-right font-mono text-gray-900 font-semibold">₹{item.netValue.toLocaleString()}</td>
                        <td className="py-2 px-4 text-right font-mono text-emerald-600 font-bold">
                          {item.grnQuantity ? `${item.grnQuantity.toLocaleString()} ${item.uom}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ACTION LAYOUT */}
              <div className="flex justify-end pt-2 border-t border-gray-100">
                {po.status === 'Open' && (
                  <Button
                    onClick={() => acknowledgePO(po.id)}
                    variant="default"
                    size="sm"
                    className="bg-[#22c55e] hover:bg-[#1ebd53] text-stone-700 font-bold text-xs"
                  >
                    Acknowledge Purchase Order
                  </Button>
                )}

                {po.status === 'Acknowledged' && (
                  <Button
                    onClick={() => setSelectedPoId(selectedPoId === po.id ? null : po.id)}
                    variant="outline"
                    size="sm"
                    className="border-amber-200 text-amber-700 hover:bg-amber-50 font-bold text-xs"
                  >
                    Prepare ASN Dispatch Shipment
                  </Button>
                )}

                {po.status === 'Dispatched' && (
                  <div className="w-full flex items-center justify-between text-xs p-2.5 rounded-lg bg-amber-50/50 border border-amber-100">
                    <span className="text-amber-700 font-bold flex items-center gap-1.5">
                      <Clock className="size-4 animate-pulse" /> In transit; awaiting store inspection (MIGO Sync)
                    </span>
                  </div>
                )}

                {po.status === 'Delivered' && (
                  <div className="w-full flex items-center justify-between text-xs p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="size-4" /> Receipt inspected in warehouse; ready for invoicing
                    </span>
                  </div>
                )}
              </div>

              {/* EXPANDED ASN SHIPMENT FORM */}
              {selectedPoId === po.id && (
                <div className="mt-4 p-5 rounded-lg border border-gray-250 bg-gray-50/40 space-y-4 animate-slide-down">
                  <h5 className="text-[10px] font-bold text-gray-505 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200 pb-2">
                    <Truck className="size-4 text-amber-500" /> Advanced Shipping Notice (VL31N Inbound sync)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Carrier Partner</label>
                      <input
                        type="text" required value={asnForm.carrierName}
                        onChange={e => setAsnForm({ ...asnForm, carrierName: e.target.value })}
                        placeholder="e.g. DHL Logistics"
                        className="w-full bg-white border border-gray-300 focus:border-emerald-550 rounded-lg px-2.5 py-1.5 text-xs outline-none text-gray-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Tracking / LR Number</label>
                      <input
                        type="text" required value={asnForm.trackingNumber}
                        onChange={e => setAsnForm({ ...asnForm, trackingNumber: e.target.value })}
                        placeholder="e.g. LR-4001928"
                        className="w-full bg-white border border-gray-300 focus:border-emerald-550 rounded-lg px-2.5 py-1.5 text-xs outline-none text-gray-900 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Vehicle Registration</label>
                      <input
                        type="text" required value={asnForm.vehicleNumber}
                        onChange={e => setAsnForm({ ...asnForm, vehicleNumber: e.target.value })}
                        placeholder="e.g. DL-01-CA-1234"
                        className="w-full bg-white border border-gray-300 focus:border-emerald-555 rounded-lg px-2.5 py-1.5 text-xs outline-none text-gray-900 uppercase font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Vendor Invoice Reference</label>
                      <input
                        type="text" required value={asnForm.invoiceReference}
                        onChange={e => setAsnForm({ ...asnForm, invoiceReference: e.target.value })}
                        placeholder="e.g. TAX-2026-092"
                        className="w-full bg-white border border-gray-300 focus:border-emerald-555 rounded-lg px-2.5 py-1.5 text-xs outline-none text-gray-900 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Shipping Date</label>
                      <input
                        type="date" value={asnForm.shipDate}
                        onChange={e => setAsnForm({ ...asnForm, shipDate: e.target.value })}
                        className="w-full bg-white border border-gray-300 focus:border-emerald-555 rounded-lg px-2.5 py-1 text-xs outline-none text-gray-900 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Estimated Delivery Date</label>
                      <input
                        type="date" value={asnForm.estimatedDeliveryDate}
                        onChange={e => setAsnForm({ ...asnForm, estimatedDeliveryDate: e.target.value })}
                        className="w-full bg-white border border-gray-300 focus:border-emerald-555 rounded-lg px-2.5 py-1 text-xs outline-none text-gray-900 font-mono"
                      />
                    </div>
                  </div>

                  {/* DISPATCH QTY */}
                  <div className="space-y-2.5 pt-2">
                    <h6 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Specify shipped quantities</h6>
                    {po.items.map(item => (
                      <div key={item.line} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-200 text-xs">
                        <div>
                          <span className="font-semibold text-gray-900">{item.description}</span>
                          <span className="text-[9px] text-gray-500 font-mono ml-2">Contract Qty: {item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number" required max={item.quantity} defaultValue={item.quantity}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setAsnForm({
                                ...asnForm,
                                items: { ...asnForm.items, [item.line]: val }
                              });
                            }}
                            className="w-24 bg-white border border-gray-300 focus:border-emerald-500 rounded-lg px-2 py-1 text-xs text-right text-gray-900 font-semibold font-mono"
                          />
                          <span className="text-[10px] text-gray-500">{item.uom}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
                    <Button onClick={() => setSelectedPoId(null)} variant="ghost" size="sm" className="text-gray-450 text-xs">
                      Cancel
                    </Button>
                    <Button onClick={() => handleAsnSubmit(po)} variant="default" size="sm" className="bg-[#22c55e] hover:bg-[#1ebd53] text-stone-700 font-bold text-xs px-6">
                      Create Inbound Delivery VL31N
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
