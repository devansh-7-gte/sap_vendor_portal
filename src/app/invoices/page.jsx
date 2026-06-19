'use client';

import React from 'react';
import { usePortal } from '@/lib/portal-context';
import InvoiceProcessingView from '@/features/billing/components/InvoiceProcessingView';

export default function InvoicesPage() {
  const {
    state,
    selectedGrnId,
    setSelectedGrnId,
    invoiceForm,
    setInvoiceForm,
    handleInvoiceSubmit,
    isSubmitting
  } = usePortal();

  return (
    <InvoiceProcessingView
      state={state}
      selectedGrnId={selectedGrnId}
      setSelectedGrnId={setSelectedGrnId}
      invoiceForm={invoiceForm}
      setInvoiceForm={setInvoiceForm}
      handleInvoiceSubmit={handleInvoiceSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
