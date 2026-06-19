'use client';

import React from 'react';
import { usePortal } from '@/lib/portal-context';
import ReportsAnalyticsView from '@/features/dashboard/components/ReportsAnalyticsView';

export default function AnalyticsPage() {
  const { state } = usePortal();

  return (
    <ReportsAnalyticsView
      state={state}
    />
  );
}
