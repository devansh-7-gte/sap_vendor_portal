'use client';

import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '../services/paymentService';

const STORAGE_KEY = 'sap_vendor_portal_payments';

export function usePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hydrate payments — try backend first, fall back to localStorage
  useEffect(() => {
    async function loadPayments() {
      try {
        const data = await paymentService.getPayments();
        if (Array.isArray(data) && data.length > 0) {
          setPayments(data);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
          return;
        }
      } catch (_) {
        // Backend unavailable — use cached data
      }
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) setPayments(JSON.parse(cached));
      } catch (_) {}
      finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  const persistLocally = useCallback((updated) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (_) {}
  }, []);

  /** Called by billing hook when invoice payment is scheduled. */
  const addPayment = useCallback((newPayment) => {
    setPayments(prev => {
      const updated = [newPayment, ...prev];
      persistLocally(updated);

      // Best-effort persist to backend
      paymentService.createPayment(newPayment).catch(() => {});

      return updated;
    });
  }, [persistLocally]);

  /** Update a payment record (e.g., status change after TDS deduction). */
  const updatePaymentStatus = useCallback((paymentId, status) => {
    setPayments(prev => {
      const updated = prev.map(p =>
        p.id === paymentId ? { ...p, status, updatedAt: new Date().toISOString() } : p
      );
      persistLocally(updated);

      paymentService.updatePaymentStatus(paymentId, status).catch(() => {});

      return updated;
    });
  }, [persistLocally]);

  return {
    payments,
    loading,
    addPayment,
    updatePaymentStatus
  };
}
