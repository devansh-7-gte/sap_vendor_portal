'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import { apiClient } from './api-client';

const ShellContext = createContext(undefined);

export function ShellProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sapPayloadLogs, setSapPayloadLogs] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sap_vendor_portal_logs');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error('Failed to load SAP logs', e);
      }
    }
    // Default initial log
    return [
      {
        id: 'LOG-001',
        timestamp: new Date().toISOString(),
        type: 'SYS',
        direction: 'INBOUND',
        name: 'PORTAL_INITIALIZE',
        payload: '{"status":"CONNECTED","sapHost":"ecc-prd-app01.sap.internal","client":"100"}',
        status: 'SUCCESS'
      }
    ];
  });

  const refreshSapLogs = async () => {
    try {
      const logs = await apiClient.get('/logs');
      if (logs) {
        setSapPayloadLogs(logs);
      }
    } catch (e) {
      console.error('Failed to fetch SAP logs from API', e);
    }
  };

  // Fetch SAP logs from backend on mount
  useEffect(() => {
    refreshSapLogs();
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
        clearSapLogs,
        refreshSapLogs
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
