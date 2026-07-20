import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function OverviewView({ setActiveTab, state }) {
  // Color-coded cards representing step progression
  const chainItems = [
    { id: 'onboarding', label: '① Onboarding & BAPI Register', desc: 'Create vendor master record', style: 'hover:border-purple-200 bg-purple-50/30 text-purple-700 border-purple-100' },
    { id: 'rfqs', label: '② RFQ Price Bidding', desc: 'Pricing info record uploads', style: 'hover:border-blue-200 bg-blue-50/30 text-blue-700 border-blue-100' },
    { id: 'pos', label: '③ Purchase Orders', desc: 'Acknowledge released PO items', style: 'hover:border-emerald-200 bg-emerald-50/30 text-emerald-700 border-emerald-100' },
    { id: 'pos', label: '④ Dispatch ASN', desc: 'Submit Inbound Delivery VL31N', style: 'hover:border-teal-200 bg-teal-50/30 text-teal-700 border-teal-100' },
    { id: 'pos', label: '⑤ Goods Receipt GRN', desc: 'Quality stores inspection (MIGO)', style: 'hover:border-sky-200 bg-sky-50/30 text-sky-700 border-sky-100' },
    { id: 'invoices', label: '⑥ MIRO LIV Billing', desc: 'Execute 3-Way match validation', style: 'hover:border-indigo-200 bg-indigo-50/30 text-indigo-700 border-indigo-100' },
    { id: 'payments', label: '⑦ Weekly clearing runs', desc: 'Sync cleared ledger payment docs', style: 'hover:border-amber-200 bg-amber-50/30 text-amber-700 border-amber-100' },
    { id: 'analytics', label: '⑧ Analytical scorecard', desc: 'Inspect delivery and QC grades', style: 'hover:border-rose-200 bg-rose-50/30 text-rose-700 border-rose-100' }
  ];

  const rolePills = [
    { name: 'Vendor Desk', style: 'bg-purple-50 text-purple-650 border border-purple-100' },
    { name: 'Buyer Procurement', style: 'bg-blue-50 text-blue-650 border border-blue-100' },
    { name: 'Finance / AP', style: 'bg-emerald-50 text-emerald-650 border border-emerald-100' },
    { name: 'SAP ERP Server', style: 'bg-amber-50 text-amber-650 border border-amber-100' },
    { name: 'Warehouse Logistics', style: 'bg-teal-50 text-teal-650 border border-teal-100' },
    { name: 'Quality QC Inspectors', style: 'bg-rose-50 text-rose-650 border border-rose-100' }
  ];

  const architectureLines = [
    { process: 'Registration', sapDoc: 'Vendor Master (BAPI)', desc: 'Creates supplier record on approval; syncs vendor codes' },
    { process: 'RFQ Management', sapDoc: 'Info Record Update', desc: 'Updates pricing records on bidding award' },
    { process: 'Purchase Orders', sapDoc: 'PO Sync (OData/IDoc)', desc: 'Real-time sync of released/amended PO documents' },
    { process: 'ASN Dispatch', sapDoc: 'Inbound Delivery (VL31N)', desc: 'ASN submission generates Inbound Delivery docs' },
    { process: 'Goods Receipt', sapDoc: 'GRN Sync (MIGO→Portal)', desc: 'Syncs store receipt quantities and inspection rejections' },
    { process: 'Invoice', sapDoc: 'MIRO Posting (LIV)', desc: 'Verifies 3-way match, posts invoice via Logistics Verification' },
    { process: 'Payment', sapDoc: 'F110 Payment Run', desc: 'Syncs cleared payment data and bank UTR numbers' },
    { process: 'Vendor Ledger', sapDoc: 'FI Line Item (FBL1N)', desc: 'Syncs statements directly from SAP vendor line items' }
  ];

  return (
    <div className="space-y-8 max-w-6xl animate-fade-in">
      {/* SECTION HEADER */}
      <div>
        <h2 className="text-[22px] font-bold text-text-primary">Portal Overview</h2>
        <p className="text-text-secondary text-[13px] mt-0.5">End-to-end integration mapping, role responsibilities, and transaction architecture.</p>
      </div>

      {/* PROCESS STEPS CHAIN */}
      <div className="space-y-3">
        <h3 className="label">End-to-End process chain</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {chainItems.map(item => (
            <div
              key={item.label}
              onClick={() => setActiveTab(item.id)}
              className={`card p-4.5 border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[96px] group ${item.style}`}
            >
              <h4 className="font-bold text-xs text-text-primary group-hover:underline flex items-center justify-between">
                {item.label}
                <ChevronRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-1" />
              </h4>
              <p className="text-[11px] text-text-tertiary mt-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ROLES */}
      <div className="space-y-3">
        <h3 className="label">User Roles & Access Areas</h3>
        <div className="flex flex-wrap gap-2">
          {rolePills.map(pill => (
            <span key={pill.name} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${pill.style}`}>
              {pill.name}
            </span>
          ))}
        </div>
      </div>

      {/* ARCHITECTURE TABLE */}
      <div className="space-y-3">
        <h3 className="label">SAP Integration Specifications</h3>
        <div className="card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th>Process Step</th>
                <th>SAP Integration Interface</th>
                <th>Operational Description</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {architectureLines.map((row, i) => (
                <tr key={i}>
                  <td className="font-bold text-text-primary">{row.process}</td>
                  <td className="font-mono font-bold text-emerald-text">{row.sapDoc}</td>
                  <td className="text-text-secondary leading-normal">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
