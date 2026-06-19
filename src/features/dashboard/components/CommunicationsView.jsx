import React from 'react';
import { Send, MessageSquare } from 'lucide-react';

export default function CommunicationsView({
  state,
  chatInput,
  setChatInput,
  handleSendMessage,
  chatEndRef
}) {
  return (
    <div className="space-y-4 max-w-full mx-auto h-[calc(100vh-13.5rem)] flex flex-col justify-between animate-fade-in pb-12">
      {/* Title Header */}
      <div className="bg-white border border-border p-4 rounded-sm shadow-xs flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 flex items-center gap-2">
            <MessageSquare className="size-4.5 text-primary" /> Communications Hub (Direct RFC Chat)
          </h2>
          <p className="text-[11px] text-stone-500 mt-1 font-semibold">
            Real-time collaboration with corporate procurement buyers, warehouse stores teams, and accounts payable
          </p>
        </div>
      </div>

      <div ref={chatEndRef} className="flex-1 min-h-0 border border-stone-250 bg-white rounded-sm p-5 overflow-y-auto space-y-4 custom-scrollbar shadow-2xs">
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
              <span className="text-[9px] text-stone-400 font-bold mb-1 uppercase font-mono tracking-wider">
                {msg.sender} &bull; {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div
                className={`p-3 rounded-sm text-xs leading-relaxed shadow-2xs ${
                  isVendor
                    ? 'bg-primary text-white'
                    : isSystem
                    ? 'bg-stone-50 text-stone-500 border border-stone-200 font-mono text-[10px] text-center'
                    : 'bg-[#f0f4f8] text-stone-800 border border-stone-200'
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
      </div>

      {/* TYPING INPUT BAR */}
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your query regarding PO delivery status, GRN verification, or MIRO billing schedule..."
          className="flex-1 bg-white border border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary rounded-sm px-4 py-2.5 text-xs outline-none text-stone-900 shadow-2xs"
        />
        <button
          onClick={handleSendMessage}
          className="h-10 px-4 rounded-sm bg-primary hover:bg-primary/95 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer border border-primary"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}
