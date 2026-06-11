import React from 'react';
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';

export default function BapiConsole({ state, consoleOpen, setConsoleOpen, consoleEndRef }) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-stone-50 border-t border-stone-200 transition-all duration-300 flex flex-col z-20 shadow-lg ${
        consoleOpen ? 'h-64' : 'h-10'
      }`}
    >
      {/* CONSOLE HEADER TAB */}
      <div
        onClick={() => setConsoleOpen(!consoleOpen)}
        className="h-10 bg-white border-b border-stone-200 px-6 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Terminal className="size-4 text-stone-550" />
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-stone-700">
            SAP BAPI &amp; IDoc Payload Console
          </span>
          <span className="size-2 rounded-full bg-stone-400 animate-pulse ml-1"></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-stone-400 font-mono">
            Click to {consoleOpen ? 'minimize' : 'maximize'}
          </span>
          {consoleOpen ? (
            <ChevronDown className="size-4 text-stone-400" />
          ) : (
            <ChevronUp className="size-4 text-stone-400" />
          )}
        </div>
      </div>

      {/* CONSOLE PAYLOAD LOG FEED */}
      {consoleOpen && (
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed text-stone-700 bg-stone-50 space-y-3 custom-scrollbar">
          {state.logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-stone-400 font-sans">
              Console idle. Complete onboarding or transactional tasks to view integration payloads.
            </div>
          ) : (
            state.logs.map((log) => (
              <div key={log.id} className="border-b border-stone-200 pb-3 last:border-0">
                {/* LOG ITEM META */}
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <span className="text-stone-400 text-[10px]">
                    {log.timestamp.split('T')[1].slice(0, 8)}
                  </span>
                  
                  {/* Interface Type Badge */}
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold border bg-stone-100 text-stone-750 border-stone-200">
                    {log.type}
                  </span>

                  {/* Flow Direction Indicator */}
                  <span className="text-[10px] font-bold text-stone-500">
                    {log.direction === 'OUTBOUND' ? 'PORTAL → SAP' : 'SAP → PORTAL'}
                  </span>

                  {/* Payload Event Label */}
                  <span className="text-stone-850 font-bold">{log.name}</span>

                  {/* Execution Status Badge */}
                  <span className={`ml-auto px-2 py-0.5 rounded text-[9px] font-bold border ${
                    log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-750 border-emerald-150' :
                    log.status === 'PENDING' ? 'bg-stone-100 text-stone-600 border-stone-200' :
                    'bg-red-50 text-red-700 border-red-150'
                  }`}>
                    {log.status}
                  </span>
                </div>

                {/* LOG DATA CODE BLOCK */}
                <pre className="pl-4 text-stone-850 bg-white p-3 rounded-lg border border-stone-200 whitespace-pre-wrap select-all font-mono text-[11px] max-h-48 overflow-y-auto custom-scrollbar">
                  {log.payload}
                </pre>
              </div>
            ))
          )}
          <div ref={consoleEndRef} />
        </div>
      )}
    </div>
  );
}
