'use client';

import React from 'react';
import { usePortal } from '@/lib/portal-context';
import PerformanceView from '@/features/dashboard/components/PerformanceView';

export default function PerformancePage() {
  const { state } = usePortal();

  return (
    <PerformanceView
      state={state}
    />
  );
}
