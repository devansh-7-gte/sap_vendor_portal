import React from 'react';
import { Award, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

export default function PerformanceView({ state }) {
  const perf = state.performance;
  const metrics = [
    { name: 'On-Time In-Full (OTIF)', val: `${perf.deliveryOTIF}%`, target: 'Target: >95.0%', style: 'text-stone-800 border-stone-200 bg-stone-50/50' },
    { name: 'QC Acceptance Rate', val: `${perf.qualityAcceptance}%`, target: 'Target: >98.0%', style: 'text-stone-800 border-stone-200 bg-stone-50/50' },
    { name: 'Pricing Index Competitiveness', val: `${perf.priceIndex}/100`, target: 'Target: >85.0', style: 'text-stone-800 border-stone-200 bg-stone-50/50' },
    { name: 'AP Response Window', val: `${perf.responseTimeHours} hrs`, target: 'Target: <4.0 hrs', style: 'text-stone-800 border-stone-200 bg-stone-50/50' }
  ];

  return (
    <div className="space-y-8 max-w-full mx-auto animate-fade-in pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Performance Scorecard</h2>
          <p className="text-stone-500 text-xs mt-0.5 font-medium">
            Operational quality grades dynamically assessed from warehouse GRNs and shipping dates.
          </p>
        </div>
        <div className="size-14 rounded-xl border border-stone-200 bg-stone-50 flex flex-col items-center justify-center shadow-sm">
          <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">GRADE</span>
          <span className="text-xl font-bold font-mono text-stone-800 leading-none mt-0.5">{perf.grade}</span>
        </div>
      </div>

      {/* METRICS CARDS PANEL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.name} className={`p-5 rounded-xl border flex flex-col justify-between min-h-[120px] shadow-sm bg-white ${m.style}`}>
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block leading-tight">{m.name}</span>
              <span className="text-2xl font-mono font-bold block mt-2 text-stone-900">{m.val}</span>
            </div>
            <span className="text-[10px] text-stone-400 font-semibold mt-2">{m.target}</span>
          </div>
        ))}
      </div>

      {/* PERFORMANCE CRITERIA BARS SECTION */}
      <div className="p-6 rounded-xl border border-stone-200 bg-white shadow-sm space-y-5">
        <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-2 flex items-center gap-2">
          <TrendingUp className="size-4 text-stone-500" /> Operational Metrics Timeline Check
        </h3>
        
        <div className="space-y-4 max-w-2xl">
          {[
            { name: 'On-Time Delivery (OTIF)', val: perf.deliveryOTIF, target: 95 },
            { name: 'Quality Stores Acceptance', val: perf.qualityAcceptance, target: 98 },
            { name: 'Invoice Billing Accuracy', val: 83, target: 90 },
            { name: 'Planners Response Speed', val: 92, target: 85 }
          ].map((bar, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-stone-700">{bar.name}</span>
                <span className={bar.val >= bar.target ? 'text-stone-750' : 'text-stone-550'}>
                  {bar.val}% <span className="text-stone-400 font-normal">/ target {bar.target}%</span>
                </span>
              </div>
              <div className="w-full bg-stone-105 h-2.5 rounded-full border border-stone-200/60 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${bar.val >= bar.target ? 'bg-stone-700' : 'bg-stone-400'}`} 
                  style={{ width: `${bar.val}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMPLIANCE GUIDANCE CARD */}
      <div className="p-6 rounded-xl border border-stone-200 bg-white shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-stone-850 uppercase tracking-wider border-b border-stone-100 pb-2">
          Operational Compliance Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-500 leading-relaxed">
          <div className="space-y-1">
            <h4 className="font-bold text-stone-800">Quality Stores Rejections</h4>
            <p>
              Inspection discrepancies logged at store gates during MIGO posting directly reduce the Quality index. Verify and securely pack materials.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-stone-800">Lead-Time Compliance</h4>
            <p>
              OTIF scores compare tracking dispatch stamps against agreed contractual delivery dates. Keeping dispatches within slots preserves priority status.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-stone-800">LIV Invoice Consistency</h4>
            <p>
              Quantities and prices listed in posted invoices are checked against PO schedules and GRN MIGO records. Perfect match entries speed clearing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
