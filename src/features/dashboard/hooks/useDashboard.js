'use client';

import { useState, useEffect } from 'react';
import { INITIAL_CHATS, INITIAL_PERFORMANCE } from '../constants';
import { dashboardService } from '../services/dashboardService';

export function useDashboard(profile, clearAllLogs) {
  const [chats, setChats] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedChats = localStorage.getItem('sap_vendor_portal_chats');
        if (savedChats) {
          return JSON.parse(savedChats);
        }
      } catch (e) {
        console.error('Failed to load dashboard state chats', e);
      }
    }
    return INITIAL_CHATS;
  });

  const [performance, setPerformance] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPerf = localStorage.getItem('sap_vendor_portal_performance');
        if (savedPerf) {
          return JSON.parse(savedPerf);
        }
      } catch (e) {
        console.error('Failed to load dashboard state performance', e);
      }
    }
    return INITIAL_PERFORMANCE;
  });

  // Fetch live backend performance score if vendor is approved
  useEffect(() => {
    if (profile?.sapVendorCode && profile?.status === 'Approved') {
      dashboardService.getPerformance().then(data => {
        if (data) {
          const mapped = {
            deliveryOTIF: data.deliveryOTIF,
            qualityAcceptance: data.qualityAcceptance,
            priceIndex: 88.0, // Fallback accent metric
            responseTimeHours: 3.4,
            grade: data.grade
          };
          setPerformance(mapped);
          try {
            localStorage.setItem('sap_vendor_portal_performance', JSON.stringify(mapped));
          } catch (e) {}
        }
      }).catch(() => {});
    }
  }, [profile]);

  const persistChats = (updated) => {
    try {
      localStorage.setItem('sap_vendor_portal_chats', JSON.stringify(updated));
    } catch (e) {}
  };

  const sendChatMessage = (text) => {
    const newMsg = {
      id: `MSG-${Date.now()}`,
      sender: 'Vendor',
      message: text,
      timestamp: new Date().toISOString()
    };
    const updated = [...chats, newMsg];
    setChats(updated);
    persistChats(updated);

    // Simulate system response
    setTimeout(() => {
      const systemMsg = {
        id: `MSG-SYS-${Date.now()}`,
        sender: 'Buyer Officer',
        message: `Acknowledge message regarding: "${text.slice(0, 30)}...". We are checking the transaction queue.`,
        timestamp: new Date().toISOString()
      };
      setChats(prev => {
        const final = [...prev, systemMsg];
        persistChats(final);
        return final;
      });
    }, 1500);
  };

  const addSystemMessage = (messageText) => {
    const sysMsg = {
      id: `MSG-SYS-${Date.now()}`,
      sender: 'System',
      message: messageText,
      timestamp: new Date().toISOString()
    };
    setChats(prev => {
      const final = [...prev, sysMsg];
      persistChats(final);
      return final;
    });
  };

  const clearAllState = () => {
    localStorage.removeItem('sap_vendor_profile_data');
    localStorage.removeItem('sap_vendor_portal_rfqs');
    localStorage.removeItem('sap_vendor_portal_pos');
    localStorage.removeItem('sap_vendor_portal_asns');
    localStorage.removeItem('sap_vendor_portal_grns');
    localStorage.removeItem('sap_vendor_portal_invoices');
    localStorage.removeItem('sap_vendor_portal_payments');
    localStorage.removeItem('sap_vendor_portal_chats');
    localStorage.removeItem('sap_vendor_portal_performance');
    
    if (clearAllLogs) clearAllLogs();
    
    // Refresh page to reset states
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return {
    chats,
    performance,
    sendChatMessage,
    addSystemMessage,
    clearAllState
  };
}
