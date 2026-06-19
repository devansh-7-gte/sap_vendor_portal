import React from 'react';
import { Send } from 'lucide-react';

export default function ChatsView({
  state, chatInput, setChatInput, handleSendMessage, chatEndRef
}) {
  return (
    <div className="space-y-6 max-w-4xl h-[calc(100vh-14rem)] flex flex-col justify-between animate-fade-in">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900">Communication Hub</h2>
        <p className="text-gray-505 text-xs mt-0.5">Communicate directly with buyer planners, warehouses, and account compliance desks.</p>
      </div>

      {/* iOS MESSAGES BUBBLE BODY */}
      <div className="flex-1 min-h-0 border border-gray-200 bg-white rounded-2xl p-5 overflow-y-auto space-y-4.5 custom-scrollbar shadow-inner">
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
              <span className="text-[8px] text-gray-400 font-bold mb-1 uppercase">
                {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div
                className={`p-3 rounded-xl text-xs leading-normal shadow-sm ${
                  isVendor
                    ? 'bg-[#22c55e] text-white rounded-tr-none'
                    : isSystem
                    ? 'bg-gray-50 text-gray-500 border border-gray-200 font-mono text-[9px] text-center rounded-lg'
                    : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200/40'
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* MESSAGE INPUT BOX */}
      <div className="flex items-center gap-2">
        <input
          type="text" value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask procurement about PO lines, or settlement schedules..."
          className="flex-1 bg-white border border-gray-300 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs outline-none text-gray-900 shadow-sm"
        />
        <button
          onClick={handleSendMessage}
          className="size-10 rounded-xl bg-[#22c55e] hover:bg-[#1ebd53] text-stone-700 flex items-center justify-center transition-all shadow-sm cursor-pointer"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}
