'use client';

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import BapiConsole from './BapiConsole';
import { usePortal } from '@/lib/portal-context';

export default function PortalLayout({ children }) {
  const {
    activeTab,
    setActiveTab,
    state,
    consoleOpen,
    setConsoleOpen,
    consoleEndRef,
    handleResetDatabase
  } = usePortal();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground font-sans">
      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          state={state}
          onReset={handleResetDatabase}
        />

        <main className="flex-1 flex flex-col min-w-0 relative h-full">
          <div className={`flex-1 overflow-y-auto py-2.5 px-4 md:py-4 md:px-6 custom-scrollbar transition-all duration-305 ${consoleOpen ? 'pb-72' : 'pb-14'}`}>
            {children}
          </div>

          <BapiConsole
            state={state}
            consoleOpen={consoleOpen}
            setConsoleOpen={setConsoleOpen}
            consoleEndRef={consoleEndRef}
          />
        </main>
      </div>
    </div>
  );
}
