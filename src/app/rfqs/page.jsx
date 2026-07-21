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
    handleCreateRFQ,
    handleReissueRFQ,
    handleCancelRFQ,
    awardVendorBidWrapper,
    addToast
  } = usePortal();

  return (
    <RfqView
      state={state}
      selectedRfqId={selectedRfqId}
      setSelectedRfqId={setSelectedRfqId}
      handleBidSubmit={handleBidSubmit}
      createRFQ={handleCreateRFQ}
      awardVendorBid={awardVendorBidWrapper}
      reissueRFQ={handleReissueRFQ}
      cancelRFQ={handleCancelRFQ}
      addToast={addToast}
    />
  );
}
