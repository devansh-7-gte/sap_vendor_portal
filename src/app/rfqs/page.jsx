'use client';

import React from 'react';
import { usePortal } from '@/lib/portal-context';
import RfqView from '@/features/rfq/components/RfqView';

export default function RfqsPage() {
  const {
    state,
    selectedRfqId,
    setSelectedRfqId,
    handleBidSubmit,
    rfqHook,
    awardVendorBidWrapper
  } = usePortal();

  return (
    <RfqView
      state={state}
      selectedRfqId={selectedRfqId}
      setSelectedRfqId={setSelectedRfqId}
      handleBidSubmit={handleBidSubmit}
      createRFQ={rfqHook.createRFQ}
      awardVendorBid={awardVendorBidWrapper}
      reissueRFQ={rfqHook.reissueRFQ}
      cancelRFQ={rfqHook.cancelRFQ}
    />
  );
}
