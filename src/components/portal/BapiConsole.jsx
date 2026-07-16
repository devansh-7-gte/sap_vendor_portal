import React from 'react';
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';

export default function BapiConsole({ state, consoleOpen, setConsoleOpen, consoleEndRef }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-base border-t border-border-em transition-all duration-300 flex flex-col z-20 shadow-lg font-mono ${
        consoleOpen ? 'h-64' : 'h-10'
      }`}
    >
      {/* CONSOLE HEADER TAB */}
      <div
        onClick={() => setConsoleOpen(!consoleOpen)}
        className="h-10 bg-surface border-b border-border-em px-6 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Terminal className="size-4 text-text-secondary" />
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-text-primary">
            SAP BAPI &amp; IDoc Payload Console
          </span>
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse ml-1"></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-tertiary font-mono">
            Click to {consoleOpen ? 'minimize' : 'maximize'}
          </span>
          {consoleOpen ? (
            <ChevronDown className="size-4 text-text-tertiary" />
          ) : (
            <ChevronUp className="size-4 text-text-tertiary" />
          )}
        </div>
      </div>

      {/* CONSOLE PAYLOAD LOG FEED */}
      {consoleOpen && (
        <div ref={consoleEndRef} className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed text-text-secondary bg-base space-y-3 custom-scrollbar">
          {(!mounted || state.logs.length === 0) ? (
            <div className="h-full flex items-center justify-center text-text-tertiary font-sans">
              Console idle. Complete onboarding or transactional tasks to view integration payloads.
            </div>
          ) : (
            state.logs.map((log, idx) => (
              <div key={log.id || log._id || idx} className="border-b border-border pb-3 last:border-0">
                {/* LOG ITEM META */}
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <span className="text-text-tertiary text-[10px] tabular-nums">
                    {log.timestamp.split('T')[1].slice(0, 8)}
                  </span>

                  {/* Interface Type Badge */}
                  <span className="px-2 py-0.5 rounded-none text-[9px] font-bold border bg-surface2 text-text-primary border-border-em">
                    {log.type}
                  </span>

                  {/* Flow Direction Indicator */}
                  <span className="text-[10px] font-bold text-text-secondary">
                    {log.direction === 'OUTBOUND' ? 'PORTAL → SAP' : 'SAP → PORTAL'}
                  </span>

                  {/* Payload Event Label */}
                  <span className="text-text-primary font-bold">{log.name}</span>

                  {/* Execution Status Badge */}
                  <span className={`ml-auto px-2 py-0.5 rounded-none text-[9px] font-bold border ${
                    log.status === 'SUCCESS' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50' :
                    log.status === 'PENDING' ? 'bg-surface2 text-text-secondary border-border-em' :
                    'bg-rose-900/20 text-rose-400 border-rose-900/50'
                  }`}>
                    {log.status}
                  </span>
                </div>

                {/* LOG DATA CODE BLOCK */}
                <pre className="pl-4 text-text-primary bg-surface p-3 rounded-none border border-border whitespace-pre-wrap select-all font-mono text-[11px] max-h-48 overflow-y-auto custom-scrollbar">
                  {log.payload}
                </pre>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
