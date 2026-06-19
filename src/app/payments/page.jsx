'use client';

import React from 'react';
import { usePortal } from '@/lib/portal-context';
import PaymentTrackingView from '@/features/payments/components/PaymentTrackingView';

export default function PaymentsPage() {
  const { state } = usePortal();

  return (
    <PaymentTrackingView
      state={state}
    />
  );
}
