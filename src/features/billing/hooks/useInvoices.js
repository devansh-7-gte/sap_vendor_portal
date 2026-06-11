'use client';

import { useState, useEffect } from 'react';
import { useShell } from '../../../lib/shell-context';

export function useInvoices(profile, setInvoiceSubmittedForGrn, addPayment) {
  const { addSapLog } = useShell();
  const [invoices, setInvoices] = useState([]);

  // Hydrate invoices from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sap_vendor_portal_invoices');
      if (saved) {
        setInvoices(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load invoices state', e);
    }
  }, []);

  const persistLocally = (updated) => {
    try {
      localStorage.setItem('sap_vendor_portal_invoices', JSON.stringify(updated));
    } catch (e) {}
  };

  const submitInvoice = (invoiceData) => {
    const sapMiroDoc = `510560${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvoice = {
      id: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...invoiceData,
      status: 'Submitted',
      sapMiroDoc,
      createdAt: new Date().toISOString()
    };

    addSapLog(
      'BAPI',
      'BAPI_INCOMINGINVOICE_CREATE',
      'OUTBOUND',
      JSON.stringify({
        I_INVOICE_NO: newInvoice.invoiceNumber,
        I_PO_NUMBER: newInvoice.poId,
        I_GRN_NUMBER: newInvoice.grnId,
        I_SUB_TOTAL: newInvoice.subTotal,
        I_TAX_AMOUNT: newInvoice.taxAmount,
        I_TOTAL_AMOUNT: newInvoice.totalAmount,
        I_TAX_CODE: newInvoice.taxCode,
        ITEMS: newInvoice.items.map(item => ({
          LINE: item.line,
          MATNR: item.materialCode,
          QTY: item.quantity,
          PRICE: item.unitPrice,
          AMOUNT: item.amount
        }))
      }),
      'PENDING'
    );

    const updated = [newInvoice, ...invoices];
    setInvoices(updated);
    persistLocally(updated);

    // Mark GRN as invoiced
    if (setInvoiceSubmittedForGrn) {
      setInvoiceSubmittedForGrn(invoiceData.grnId);
    }

    // Simulate invoice approval and posting in SAP in 4 seconds
    setTimeout(() => {
      simulateSapPosting(newInvoice, addPayment);
    }, 4000);
  };

  const simulateSapPosting = (invoice, addPayment) => {
    setInvoices(prev => {
      const updated = prev.map(inv => {
        if (inv.id === invoice.id) {
          // Success log
          addSapLog(
            'BAPI',
            'BAPI_INCOMINGINVOICE_CREATE',
            'OUTBOUND',
            JSON.stringify({
              MIRO_DOC: inv.sapMiroDoc,
              STATUS: 'POSTED_IN_SAP',
              SAP_MSG: 'Invoice verified and posted successfully'
            }),
            'SUCCESS'
          );

          // Update status to Posted in SAP
          return {
            ...inv,
            status: 'Posted in SAP',
            postedAt: new Date().toISOString()
          };
        }
        return inv;
      });
      persistLocally(updated);
      return updated;
    });

    // Simulate payment run (F110 Automatic Payment) in 6 seconds
    setTimeout(() => {
      simulatePaymentRun(invoice, addPayment);
    }, 6000);
  };

  const simulatePaymentRun = (invoice, addPayment) => {
    setInvoices(prev => {
      const updated = prev.map(inv => {
        if (inv.id === invoice.id) {
          return {
            ...inv,
            status: 'Cleared',
            clearedAt: new Date().toISOString()
          };
        }
        return inv;
      });
      persistLocally(updated);
      return updated;
    });

    const paymentId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    const utrCode = `UTR${new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 8)}${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment = {
      id: paymentId,
      invoiceId: invoice.id,
      poId: invoice.poId,
      vendorId: profile?.sapVendorCode || 'VND-CURRENT',
      invoiceNumber: invoice.invoiceNumber,
      sapMiroDoc: invoice.sapMiroDoc,
      grossAmount: invoice.totalAmount,
      tdsDeducted: Math.round(invoice.totalAmount * 0.01),
      netAmount: Math.round(invoice.totalAmount * 0.99),
      paymentDate: new Date().toISOString().split('T')[0],
      utrCode,
      paymentMethod: 'NEFT',
      sapPaymentDoc: `20005${Math.floor(10000 + Math.random() * 90000)}`,
      bankName: 'HDFC Bank Ltd',
      runId: `F110-${new Date().toISOString().split('T')[0].replace(/-/g, '')}`,
      
      // TDS certifications
      fiscalYear: new Date().getFullYear(),
      quarter: `Q${Math.floor(new Date().getMonth() / 3) + 1}`,
      tdsSection: profile?.tdsSection || '194C',
      deducteePan: profile?.pan || 'ABCDE1234F',
      deductorTan: 'MUMB12345A',
      totalTds: Math.round(invoice.totalAmount * 0.01)
    };

    addSapLog(
      'IDoc',
      'PAYEXT.PEXR2002',
      'INBOUND',
      JSON.stringify({
        DOC_NUM: newPayment.sapPaymentDoc,
        UTR: utrCode,
        LIFNR: newPayment.vendorId,
        WRBTR: newPayment.netAmount,
        AUGDT: newPayment.paymentDate
      }),
      'SUCCESS'
    );

    if (addPayment) {
      addPayment(newPayment);
    }
  };

  return {
    invoices,
    submitInvoice
  };
}
