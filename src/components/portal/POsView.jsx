import React from 'react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { poStatusVariant } from '@/lib/statusColors';
import { ShoppingBag, Clock, CheckCircle2, Truck } from 'lucide-react';

export default function POsView({
  state, selectedPoId, setSelectedPoId, asnForm, setAsnForm, handleAsnSubmit, acknowledgePO
}) {
  const activePOs = state.pos;

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div>
        <h2 className="text-[22px] font-bold text-text-primary">Purchase Orders</h2>
        <p className="text-text-tertiary text-xs mt-0.5">Acknowledge synced purchase orders and submit Advanced Shipping Notices (ASN).</p>
      </div>

      {activePOs.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ShoppingBag}
            title="No purchase orders synced"
            description="Purchase orders will appear once onboarding is approved or RFQs are awarded."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {activePOs.map(po => (
            <div key={po.id} className="card p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-text-primary font-mono">{po.id}</span>
                    <StatusBadge label={po.status} variant={poStatusVariant(po.status)} />
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-text-tertiary mt-1 tabular-nums">
                    <span>Date: {po.createdDate}</span>
                    <span>•</span>
                    <span>Terms: {po.paymentTerms}</span>
                    <span>•</span>
                    <span>Currency: {po.currency}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-text-tertiary">Total contract value</p>
                  <p className="text-sm font-bold text-text-primary font-mono tabular-nums">₹{po.items.reduce((s, i) => s + i.netValue, 0).toLocaleString()}.00</p>
                </div>
              </div>

              {/* ITEMIZATION TABLE */}
              <div className="border border-border rounded-lg overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th>Line</th>
                      <th>Material description</th>
                      <th className="text-right">Ordered Qty</th>
                      <th className="text-right">Unit Price</th>
                      <th className="text-right">Net Value</th>
                      <th className="text-right">GRN Accepted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {po.items.map(item => (
                      <tr key={item.line}>
                        <td className="font-mono tabular-nums">{item.line}</td>
                        <td>
                          <p className="font-semibold text-text-primary">{item.description}</p>
                          <p className="text-[10px] text-text-tertiary font-mono">{item.materialCode}</p>
                        </td>
                        <td className="text-right font-semibold tabular-nums">{item.quantity.toLocaleString()} {item.uom}</td>
                        <td className="text-right font-mono tabular-nums">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="text-right font-mono text-text-primary font-semibold tabular-nums">₹{item.netValue.toLocaleString()}</td>
                        <td className="text-right font-mono text-emerald-600 font-bold tabular-nums">
                          {item.grnQuantity ? `${item.grnQuantity.toLocaleString()} ${item.uom}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ACTION LAYOUT */}
              <div className="flex justify-end pt-2 border-t border-border">
                {po.status === 'Open' && (
                  <Button
                    onClick={() => acknowledgePO(po.id)}
                    variant="default"
                    size="sm"
                  >
                    Acknowledge Purchase Order
                  </Button>
                )}

                {po.status === 'Acknowledged' && (
                  <Button
                    onClick={() => setSelectedPoId(selectedPoId === po.id ? null : po.id)}
                    variant="outline"
                    size="sm"
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
                <div className="mt-4 p-5 rounded-lg border border-border bg-base/60 space-y-4 animate-slide-down">
                  <h5 className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                    <Truck className="size-4 text-amber-500" /> Advanced Shipping Notice (VL31N Inbound sync)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="label">Carrier Partner</label>
                      <input
                        type="text" required value={asnForm.carrierName}
                        onChange={e => setAsnForm({ ...asnForm, carrierName: e.target.value })}
                        placeholder="e.g. DHL Logistics"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="label">Tracking / LR Number</label>
                      <input
                        type="text" required value={asnForm.trackingNumber}
                        onChange={e => setAsnForm({ ...asnForm, trackingNumber: e.target.value })}
                        placeholder="e.g. LR-4001928"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="label">Vehicle Registration</label>
                      <input
                        type="text" required value={asnForm.vehicleNumber}
                        onChange={e => setAsnForm({ ...asnForm, vehicleNumber: e.target.value })}
                        placeholder="e.g. DL-01-CA-1234"
                        className="uppercase font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="label">Vendor Invoice Reference</label>
                      <input
                        type="text" required value={asnForm.invoiceReference}
                        onChange={e => setAsnForm({ ...asnForm, invoiceReference: e.target.value })}
                        placeholder="e.g. TAX-2026-092"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="label">Shipping Date</label>
                      <input
                        type="date" value={asnForm.shipDate}
                        onChange={e => setAsnForm({ ...asnForm, shipDate: e.target.value })}
                        className="font-mono tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="label">Estimated Delivery Date</label>
                      <input
                        type="date" value={asnForm.estimatedDeliveryDate}
                        onChange={e => setAsnForm({ ...asnForm, estimatedDeliveryDate: e.target.value })}
                        className="font-mono tabular-nums"
                      />
                    </div>
                  </div>

                  {/* DISPATCH QTY */}
                  <div className="space-y-2.5 pt-2">
                    <h6 className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider">Specify shipped quantities</h6>
                    {po.items.map(item => (
                      <div key={item.line} className="flex justify-between items-center bg-surface p-2.5 rounded-lg border border-border text-xs">
                        <div>
                          <span className="font-semibold text-text-primary">{item.description}</span>
                          <span className="text-[9px] text-text-tertiary font-mono ml-2 tabular-nums">Contract Qty: {item.quantity}</span>
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
                            className="w-24 text-right font-semibold font-mono tabular-nums"
                          />
                          <span className="text-[10px] text-text-tertiary">{item.uom}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-border">
                    <Button onClick={() => setSelectedPoId(null)} variant="ghost" size="sm">
                      Cancel
                    </Button>
                    <Button onClick={() => handleAsnSubmit(po)} variant="default" size="sm">
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
