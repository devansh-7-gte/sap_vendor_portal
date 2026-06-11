'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const ShellContext = createContext(undefined);

export function ShellProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sapPayloadLogs, setSapPayloadLogs] = useState([]);

  // Hydrate shell logs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sap_vendor_portal_logs');
      if (saved) {
        setSapPayloadLogs(JSON.parse(saved));
      } else {
        // Default initial log
        setSapPayloadLogs([
          {
            id: 'LOG-001',
            timestamp: new Date().toISOString(),
            type: 'SYS',
            direction: 'INBOUND',
            name: 'PORTAL_INITIALIZE',
            payload: '{"status":"CONNECTED","sapHost":"ecc-prd-app01.sap.internal","client":"100"}',
            status: 'SUCCESS'
          }
        ]);
      }
    } catch (e) {
      console.error('Failed to load SAP logs', e);
    }
  }, []);

  // Sync shell logs to localStorage on changes
  useEffect(() => {
    if (sapPayloadLogs.length > 0) {
      try {
        localStorage.setItem('sap_vendor_portal_logs', JSON.stringify(sapPayloadLogs));
      } catch (e) {
        // Ignore
      }
    }
  }, [sapPayloadLogs]);

  const addSapLog = (type, name, direction, payload, status = 'SUCCESS') => {
    const newLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      type,
      direction,
      name,
      payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
      status
    };
    setSapPayloadLogs(prev => [newLog, ...prev].slice(0, 100));
  };

  const clearSapLogs = () => {
    setSapPayloadLogs([]);
    try {
      localStorage.removeItem('sap_vendor_portal_logs');
    } catch (e) {
      // Ignore
    }
  };

  return (
    <ShellContext.Provider
      value={{
        activeTab,
        setActiveTab,
        sapPayloadLogs,
        addSapLog,
        clearSapLogs
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  const context = useContext(ShellContext);
  if (context === undefined) {
    throw new Error('useShell must be used within a ShellProvider');
  }
  return context;
}
