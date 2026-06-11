import React from 'react';
import { Send } from 'lucide-react';

export default function CommunicationsView({
  state,
  chatInput,
  setChatInput,
  handleSendMessage,
  chatEndRef
}) {
  return (
    <div className="space-y-6 max-w-full mx-auto h-[calc(100vh-14rem)] flex flex-col justify-between animate-fade-in pb-12">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-stone-900">Communications Hub</h2>
        <p className="text-stone-500 text-xs mt-0.5 font-medium">
          Message directly with procurement, quality inspectors, or accounts payable representatives.
        </p>
      </div>

      {/* CHAT MESSAGES PANEL */}
      <div className="flex-1 min-h-0 border border-stone-200 bg-white rounded-2xl p-5 overflow-y-auto space-y-4 custom-scrollbar shadow-inner">
        {state.chats.map(msg => {
          const isVendor = msg.sender === 'Vendor';
          const isSystem = msg.sender === 'System';
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[70%] ${
                isVendor ? 'ml-auto items-end' : isSystem ? 'mx-auto items-center' : 'items-start'
              }`}
            >
              <span className="text-[9px] text-stone-400 font-bold mb-1 uppercase font-mono">
                {msg.sender} &bull; {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div
                className={`p-3.5 rounded-xl text-xs leading-relaxed shadow-sm ${
                  isVendor
                    ? 'bg-stone-850 text-stone-50 rounded-tr-none'
                    : isSystem
                    ? 'bg-stone-50 text-stone-500 border border-stone-200 font-mono text-[10px] text-center rounded-lg'
                    : 'bg-stone-100 text-stone-800 rounded-tl-none border border-stone-200/50'
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* TYPING INPUT BAR */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask procurement about PO updates, clearing schedules, or GRN items..."
          className="flex-1 bg-white border border-stone-300 focus:border-stone-500 rounded-xl px-4 py-3 text-xs outline-none text-stone-900 shadow-sm"
        />
        <button
          onClick={handleSendMessage}
          className="size-11 rounded-xl bg-stone-850 hover:bg-stone-950 text-stone-50 flex items-center justify-center transition-all shadow-sm cursor-pointer"
        >
          <Send className="size-4.5" />
        </button>
      </div>
    </div>
  );
}
