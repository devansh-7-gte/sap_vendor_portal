import React, { useState } from 'react';
import { Search } from 'lucide-react';

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
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Payment Tracking</h2>
          <p className="text-gray-500 text-xs mt-0.5">Track cleared weekly payment batches and inspect the FBL1N Account Ledger.</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm text-right">
          <p className="text-[10px] text-gray-405 uppercase font-bold tracking-wider">Account Ledger balance</p>
          <p className={`text-base font-bold font-mono ${totalOutstanding >= 0 ? 'text-emerald-650' : 'text-red-500'}`}>
            {totalOutstanding >= 0 ? '₹0.00' : `-₹${Math.abs(totalOutstanding).toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* COMPLETED TRANSFERS */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cleared Payments (F110 bank runs)</h3>
        {clearedPayments.length === 0 ? (
          <div className="p-6 rounded-xl border border-gray-200 bg-white text-center text-xs text-gray-550 shadow-sm">
            No bank clearings syncing. Clear weekly batches by posting MIRO invoices.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clearedPayments.map(pay => (
              <div key={pay.id} className="p-4.5 border border-gray-200 bg-white rounded-xl shadow-sm space-y-3">
                <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                  <div>
                    <p className="text-[9px] text-gray-450 font-mono">PO REFERENCE: {pay.poId}</p>
                    <p className="text-xs font-bold text-gray-900 mt-1">Clearing Date: {pay.paymentDate}</p>
                  </div>
                  <p className="text-sm font-bold font-mono text-emerald-650">₹{pay.amount.toLocaleString()}</p>
                </div>
                <div className="space-y-1.5 text-xs text-gray-700">
                  <p className="flex justify-between">
                    <span className="text-gray-405">Settlement Method</span>
                    <span className="font-semibold text-gray-900">{pay.paymentMethod}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-405">Unique UTR Reference</span>
                    <span className="font-mono font-bold text-gray-900">{pay.utrCode}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-405">FI Clearing Document</span>
                    <span className="font-mono text-[#1b6b5a] font-bold">{state.invoices.find(i => i.id === pay.invoiceId)?.paymentDoc}</span>
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
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            Vendor Line Item Ledger (SAP FBL1N mappings)
          </h3>
          <div className="relative w-64">
            <Search className="size-3.5 absolute left-3 top-2 text-gray-400" />
            <input
              type="text" placeholder="Search doc reference..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg py-1 pl-8 pr-3 text-xs outline-none focus:border-emerald-500 text-gray-900 font-mono"
            />
          </div>
        </div>

        <div className="overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 font-bold text-[9px] text-gray-550 uppercase tracking-wider">
                <th className="py-2.5 px-6">Posting Date</th>
                <th className="py-2.5 px-6">Doc Reference</th>
                <th className="py-2.5 px-6">Document Type</th>
                <th className="py-2.5 px-6">Clearing Doc</th>
                <th className="py-2.5 px-6 text-right">Net Value</th>
                <th className="py-2.5 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 font-mono text-gray-700">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-450 font-sans">
                    No transactions registered in this ledger timeline.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-3 px-6 text-gray-500">{item.postDate}</td>
                    <td className="py-3 px-6 font-bold text-gray-900">{item.docNum}</td>
                    <td className="py-3 px-6 text-gray-550">{item.docType}</td>
                    <td className="py-3 px-6 text-gray-500">{item.clearingDoc}</td>
                    <td className={`py-3 px-6 text-right font-bold ${item.amount < 0 ? 'text-red-500' : 'text-emerald-650'}`}>
                      {item.amount < 0 ? `-₹${Math.abs(item.amount).toLocaleString()}` : `₹${item.amount.toLocaleString()}`}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        item.status === 'Paid' || item.status === 'Cleared'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-750'
                      }`}>
                        {item.status === 'Paid' || item.status === 'Cleared' ? 'CLEARED' : 'OPEN'}
                      </span>
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
