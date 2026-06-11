'use client';

import React from 'react';
import { usePortal } from '@/lib/portal-context';
import CommunicationsView from '@/features/dashboard/components/CommunicationsView';

export default function ChatsPage() {
  const {
    state,
    chatInput,
    setChatInput,
    handleSendMessage,
    chatEndRef
  } = usePortal();

  return (
    <CommunicationsView
      state={state}
      chatInput={chatInput}
      setChatInput={setChatInput}
      handleSendMessage={handleSendMessage}
      chatEndRef={chatEndRef}
    />
  );
}
