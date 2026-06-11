'use client';

import React from 'react';
import { usePortal } from '@/lib/portal-context';
import DashboardView from '@/features/dashboard/components/DashboardView';

export default function PortalPage() {
  const { state, setActiveTab } = usePortal();

  return (
    <DashboardView
      state={state}
      setActiveTab={setActiveTab}
    />
  );
}
