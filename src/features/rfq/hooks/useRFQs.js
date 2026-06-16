'use client';

import { useState, useEffect } from 'react';
import { useShell } from '../../../lib/shell-context';
import { INITIAL_RFQS } from '../constants';

export function useRFQs(profile) {
  const { addSapLog } = useShell();
  const [rfqs, setRfqs] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sap_vendor_portal_rfqs');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error('Failed to load RFQs', e);
      }
    }
    return INITIAL_RFQS;
  });

  const persistLocally = (updated) => {
    try {
      localStorage.setItem('sap_vendor_portal_rfqs', JSON.stringify(updated));
    } catch (e) {}
  };

  const submitBid = (rfqId, unitPrices, leadTime, remarks, gstRate, validityDate, freight = 0, moq = 1, uploadedDocs = []) => {
    const rfqIndex = rfqs.findIndex(r => r.id === rfqId);
    if (rfqIndex === -1) return;

    const rfq = rfqs[rfqIndex];
    const updatedRfqs = [...rfqs];

    const currentVendorCode = profile?.sapVendorCode || 'VND-CURRENT';
    const currentVendorName = profile?.companyName || 'Your Firm (Current Vendor)';

    const taxCodeMap = { '18%': 'G1', '12%': 'G2', '5%': 'G3', '28%': 'G4', 'Exempt': 'G0' };
    const sapTaxCode = taxCodeMap[gstRate] || 'G1';

    addSapLog(
      'RFC',
      'RFC_RFQ_SUBMIT_BID',
      'OUTBOUND',
      JSON.stringify({
        RFQ_ID: rfqId,
        LIFNR: currentVendorCode,
        PRICES: Object.entries(unitPrices).map(([line, price]) => ({ LINE: Number(line), PRICE: price })),
        LEAD_TIME: leadTime,
        GST_RATE: gstRate,
        TAX_CODE: sapTaxCode,
        FREIGHT: freight,
        MOQ: moq,
        VALID_TO: validityDate,
        REMARKS: remarks,
        DOCUMENTS: uploadedDocs.map(d => d.name)
      }),
      'SUCCESS'
    );

    const newBid = {
      vendorId: currentVendorCode,
      vendorName: currentVendorName,
      unitPrices,
      deliveryLeadTimeDays: leadTime,
      gstRate,
      freight: Number(freight || 0),
      moq: Number(moq || 1),
      validityDate,
      remarks,
      technicalScore: 92,
      vendorRating: 95,
      uploadedDocs,
      submittedAt: new Date().toISOString()
    };

    const updatedInvitedVendors = rfq.invitedVendors.map(vendor => {
      if (vendor.id === currentVendorCode || vendor.id === 'VND-CURRENT') {
        return { ...vendor, status: 'Quoted' };
      }
      return vendor;
    });
    
    const hasCurrent = rfq.invitedVendors.some(v => v.id === currentVendorCode || v.id === 'VND-CURRENT');
    const finalInvited = hasCurrent ? updatedInvitedVendors : [
      ...updatedInvitedVendors,
      { id: currentVendorCode, name: currentVendorName, status: 'Quoted', rating: 95 }
    ];

    const updatedBids = [
      ...(rfq.bids || []).filter(b => b.vendorId !== currentVendorCode),
      newBid
    ];

    updatedRfqs[rfqIndex] = {
      ...rfq,
      status: 'Submitted',
      invitedVendors: finalInvited,
      bids: updatedBids,
      vendorBid: newBid
    };

    setRfqs(updatedRfqs);
    persistLocally(updatedRfqs);
  };

  const createRFQ = (rfqData) => {
    const newRfq = {
      ...rfqData,
      status: 'Bidding Open',
      bids: [],
      invitedVendors: rfqData.invitedVendors || [],
      createdDate: new Date().toISOString().split('T')[0]
    };

    addSapLog(
      'BAPI',
      'BAPI_RFQ_CREATE',
      'INBOUND',
      JSON.stringify({
        RFQ_ID: newRfq.id,
        EKKO_BUKRS: newRfq.companyCode,
        EKKO_EKORG: newRfq.purchasingOrg,
        EKKO_EKGRP: newRfq.purchasingGroup,
        ITEMS: newRfq.items.map(item => ({
          LINE: item.line,
          MATNR: item.materialCode,
          MENGE: item.quantity,
          MEINS: item.uom,
          WERKS: item.plant
        }))
      }),
      'SUCCESS'
    );

    const updated = [newRfq, ...rfqs];
    setRfqs(updated);
    persistLocally(updated);
  };

  const awardVendorBid = (rfqId, vendorId) => {
    const rfqIndex = rfqs.findIndex(r => r.id === rfqId);
    if (rfqIndex === -1) return null;

    const rfq = rfqs[rfqIndex];
    const bid = rfq.bids.find(b => b.vendorId === vendorId);
    if (!bid) return null;

    const poId = `PO-45000${Math.floor(10000 + Math.random() * 90000)}`;

    addSapLog(
      'BAPI',
      'BAPI_PO_CREATE_FROM_RFQ',
      'OUTBOUND',
      JSON.stringify({
        RFQ_ID: rfqId,
        LIFNR: vendorId,
        NEW_PO_ID: poId
      }),
      'SUCCESS'
    );

    const updatedRfqs = [...rfqs];
    updatedRfqs[rfqIndex] = {
      ...rfq,
      status: 'Awarded',
      awardedVendorId: vendorId,
      awardedVendorName: bid.vendorName,
      awardedAt: new Date().toISOString(),
      convertedPoId: poId
    };

    setRfqs(updatedRfqs);
    persistLocally(updatedRfqs);

    // Return PO details so PO hook can append it
    return {
      id: poId,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Open',
      paymentTerms: rfq.paymentTerms || 'NET 30 Days',
      currency: rfq.currency || 'INR',
      fromRfqId: rfqId,
      vendorId,
      plant: rfq.items[0]?.plant || '1000',
      items: rfq.items.map(item => ({
        line: item.line,
        materialCode: item.materialCode,
        description: item.description,
        quantity: item.quantity,
        grnQuantity: 0,
        unitPrice: bid.unitPrices[item.line] || item.targetPrice || 10,
        netValue: item.quantity * (bid.unitPrices[item.line] || item.targetPrice || 10),
        uom: item.uom
      }))
    };
  };

  const reissueRFQ = (rfqId, newDeadline) => {
    const rfqIndex = rfqs.findIndex(r => r.id === rfqId);
    if (rfqIndex === -1) return;

    const updatedRfqs = [...rfqs];
    updatedRfqs[rfqIndex] = {
      ...updatedRfqs[rfqIndex],
      status: 'Bidding Open',
      deadlineDate: newDeadline,
      bids: [],
      awardedVendorId: undefined,
      awardedVendorName: undefined,
      awardedAt: undefined,
      convertedPoId: undefined
    };

    addSapLog(
      'BAPI',
      'BAPI_RFQ_REISSUE',
      'INBOUND',
      JSON.stringify({
        RFQ_ID: rfqId,
        NEW_DEADLINE: newDeadline
      }),
      'SUCCESS'
    );

    setRfqs(updatedRfqs);
    persistLocally(updatedRfqs);
  };

  const cancelRFQ = (rfqId) => {
    const rfqIndex = rfqs.findIndex(r => r.id === rfqId);
    if (rfqIndex === -1) return;

    const updatedRfqs = [...rfqs];
    updatedRfqs[rfqIndex] = {
      ...updatedRfqs[rfqIndex],
      status: 'Closed'
    };

    addSapLog(
      'BAPI',
      'BAPI_RFQ_CANCEL',
      'INBOUND',
      JSON.stringify({
        RFQ_ID: rfqId
      }),
      'SUCCESS'
    );

    setRfqs(updatedRfqs);
    persistLocally(updatedRfqs);
  };

  return {
    rfqs,
    submitBid,
    createRFQ,
    awardVendorBid,
    reissueRFQ,
    cancelRFQ
  };
}
