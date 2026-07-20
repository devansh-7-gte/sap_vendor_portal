import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ChatsView({
  state, chatInput, setChatInput, handleSendMessage, chatEndRef
}) {
  return (
    <div className="space-y-6 max-w-4xl h-[calc(100vh-14rem)] flex flex-col justify-between animate-fade-in">
      <div>
        <h2 className="text-[22px] font-bold text-text-primary">Communication Hub</h2>
        <p className="text-text-tertiary text-xs mt-0.5">Communicate directly with buyer planners, warehouses, and account compliance desks.</p>
      </div>

      {/* MESSAGES BUBBLE BODY */}
      <div className="flex-1 min-h-0 card p-5 overflow-y-auto space-y-4.5 custom-scrollbar">
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
              <span className="text-[8px] text-text-tertiary font-bold mb-1 uppercase tabular-nums">
                {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div
                className={`p-3 rounded-xl text-xs leading-normal ${
                  isVendor
                    ? 'bg-surface text-text-primary border border-border-em rounded-tr-none'
                    : isSystem
                    ? 'bg-base text-text-tertiary border border-border font-mono text-[9px] text-center rounded-lg'
                    : 'bg-surface2 text-text-primary rounded-tl-none border border-border'
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
          className="flex-1"
        />
        <Button
          variant="default"
          size="icon"
          onClick={handleSendMessage}
          className="rounded-xl"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
