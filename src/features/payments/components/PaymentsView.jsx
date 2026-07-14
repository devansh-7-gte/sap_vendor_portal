import React, { useState } from 'react';
import { Search } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { paymentStatusVariant } from '@/lib/statusColors';

export default function PaymentsView({ state }) {
  const clearedPayments = state.payments;
  const [searchTerm, setSearchTerm] = useState('');

  // Merge invoices and payments into a ledger timeline mapping FBL1N vendor line items
  const ledgerItems = [
    ...state.invoices.map(inv => ({
      docNum: inv.sapMiroDoc || 'PENDING',
      docType: 'RE (MIRO Invoice)',
      postDate: inv.postedAt?.split('T')[0] || inv.invoiceDate,
      amount: -inv.totalAmount,
      clearingDoc: inv.paymentDoc || '-',
      status: inv.status
    })),
    ...state.payments.map(pay => {
      const invoice = state.invoices.find(i => i.id === pay.invoiceId);
      return {
        docNum: invoice?.paymentDoc || 'PAYDOC',
        docType: 'KZ (Payment Run)',
        postDate: pay.paymentDate,
        amount: pay.amount,
        clearingDoc: invoice?.paymentDoc || '-',
        status: 'Cleared'
      };
    })
  ].sort((a, b) => new Date(b.postDate).getTime() - new Date(a.postDate).getTime());

  const filteredLedger = ledgerItems.filter(
    item =>
      item.docNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.docType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstanding = ledgerItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-8 max-w-6xl animate-fade-in">
      {/* HEADER STATS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-text-primary">Payment Tracking</h2>
          <p className="text-text-tertiary text-xs mt-0.5">Track cleared weekly payment batches and inspect the FBL1N Account Ledger.</p>
        </div>
        <div className="metric-panel !p-4 text-right">
          <p className="label mb-0">Account Ledger balance</p>
          <p className={`text-base font-bold font-mono tabular-nums ${totalOutstanding >= 0 ? 'text-emerald-text' : 'text-destructive'}`}>
            {totalOutstanding >= 0 ? '₹0.00' : `-₹${Math.abs(totalOutstanding).toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* COMPLETED TRANSFERS */}
      <div className="space-y-3">
        <h3 className="label mb-0">Cleared Payments (F110 bank runs)</h3>
        {clearedPayments.length === 0 ? (
          <div className="card">
            <EmptyState title="No bank clearings syncing" description="Clear weekly batches by posting MIRO invoices." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clearedPayments.map(pay => (
              <div key={pay.id} className="card p-4.5 space-y-3">
                <div className="flex justify-between items-start border-b border-border pb-2">
                  <div>
                    <p className="text-[9px] text-text-tertiary font-mono">PO REFERENCE: {pay.poId}</p>
                    <p className="text-xs font-bold text-text-primary mt-1 tabular-nums">Clearing Date: {pay.paymentDate}</p>
                  </div>
                  <p className="text-sm font-bold font-mono text-emerald-text tabular-nums">₹{pay.amount.toLocaleString()}</p>
                </div>
                <div className="space-y-1.5 text-xs text-text-secondary">
                  <p className="flex justify-between">
                    <span className="text-text-tertiary">Settlement Method</span>
                    <span className="font-semibold text-text-primary">{pay.paymentMethod}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-text-tertiary">Unique UTR Reference</span>
                    <span className="font-mono font-bold text-text-primary">{pay.utrCode}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-text-tertiary">FI Clearing Document</span>
                    <span className="font-mono text-emerald-text font-bold">{state.invoices.find(i => i.id === pay.invoiceId)?.paymentDoc}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACCOUNT LEDGER */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="label mb-0 flex items-center gap-1.5">
            Vendor Line Item Ledger (SAP FBL1N mappings)
          </h3>
          <div className="relative w-64">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text" placeholder="Search doc reference..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="!pl-8 font-mono"
            />
          </div>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr>
                <th>Posting Date</th>
                <th>Doc Reference</th>
                <th>Document Type</th>
                <th>Clearing Doc</th>
                <th className="text-right">Net Value</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={6} className="!border-b-0">
                    <EmptyState title="No transactions registered" description="No transactions registered in this ledger timeline." />
                  </td>
                </tr>
              ) : (
                filteredLedger.map((item, i) => (
                  <tr key={i}>
                    <td className="tabular-nums">{item.postDate}</td>
                    <td className="font-bold text-text-primary">{item.docNum}</td>
                    <td>{item.docType}</td>
                    <td>{item.clearingDoc}</td>
                    <td className={`text-right font-bold tabular-nums ${item.amount < 0 ? 'text-destructive' : 'text-emerald-text'}`}>
                      {item.amount < 0 ? `-₹${Math.abs(item.amount).toLocaleString()}` : `₹${item.amount.toLocaleString()}`}
                    </td>
                    <td className="text-center">
                      <StatusBadge
                        label={item.status === 'Paid' || item.status === 'Cleared' ? 'CLEARED' : 'OPEN'}
                        variant={paymentStatusVariant(item.status === 'Paid' || item.status === 'Cleared' ? 'Cleared' : 'Pending')}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
