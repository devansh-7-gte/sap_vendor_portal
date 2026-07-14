import React from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className="card p-4 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-[22px] font-bold text-text-primary flex items-center gap-2">
            <MessageSquare className="size-4.5 text-text-secondary" /> Communications Hub (Direct RFC Chat)
          </h2>
          <p className="text-[11px] text-text-secondary mt-1 font-semibold">
            Real-time collaboration with corporate procurement buyers, warehouse stores teams, and accounts payable
          </p>
        </div>
      </div>

      <div ref={chatEndRef} className="flex-1 min-h-0 card p-5 overflow-y-auto space-y-4 custom-scrollbar">
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
              <span className="text-[9px] text-text-tertiary font-bold mb-1 uppercase font-mono tracking-wider tabular-nums">
                {msg.sender} &bull; {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div
                className={`p-3 rounded-md text-xs leading-relaxed ${
                  isVendor
                    ? 'bg-surface text-text-primary border border-border-em'
                    : isSystem
                    ? 'bg-base text-text-tertiary border border-border font-mono text-[10px] text-center'
                    : 'bg-surface2 text-text-primary border border-border'
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
          className="flex-1"
        />
        <Button
          variant="default"
          onClick={handleSendMessage}
          className="h-10 px-4"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
