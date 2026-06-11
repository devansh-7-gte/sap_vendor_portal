'use client';

import { useState, useEffect } from 'react';
import { useShell } from '../../../lib/shell-context';

export function usePOs(profile) {
  const { addSapLog } = useShell();
  const [pos, setPos] = useState([]);
  const [asns, setAsns] = useState([]);
  const [grns, setGrns] = useState([]);

  // Hydrate states from localStorage on mount
  useEffect(() => {
    try {
      const savedPOs = localStorage.getItem('sap_vendor_portal_pos');
      if (savedPOs) setPos(JSON.parse(savedPOs));

      const savedASNs = localStorage.getItem('sap_vendor_portal_asns');
      if (savedASNs) setAsns(JSON.parse(savedASNs));

      const savedGRNs = localStorage.getItem('sap_vendor_portal_grns');
      if (savedGRNs) setGrns(JSON.parse(savedGRNs));
    } catch (e) {
      console.error('Failed to load logistics state', e);
    }
  }, []);

  const persistLocally = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  };

  const addPO = (newPO) => {
    setPos(prev => {
      const updated = [newPO, ...prev];
      persistLocally('sap_vendor_portal_pos', updated);
      return updated;
    });
  };

  const acknowledgePO = (poId) => {
    const updatedPos = pos.map(po => {
      if (po.id === poId) {
        addSapLog(
          'RFC',
          'RFC_PO_ACKNOWLEDGE',
          'OUTBOUND',
          JSON.stringify({
            EBELN: poId,
            LIFNR: profile?.sapVendorCode || 'VND-CURRENT',
            AEZEIT: new Date().toISOString()
          }),
          'SUCCESS'
        );
        return {
          ...po,
          status: 'Acknowledged',
          acknowledgedAt: new Date().toISOString()
        };
      }
      return po;
    });
    setPos(updatedPos);
    persistLocally('sap_vendor_portal_pos', updatedPos);
  };

  const submitASN = (asnData) => {
    const newASN = {
      ...asnData,
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      sapInboundDelivery: `1800${Math.floor(100000 + Math.random() * 900000)}`
    };

    addSapLog(
      'BAPI',
      'BAPI_DELIVERY_CREATE_DN',
      'OUTBOUND',
      JSON.stringify({
        I_PO_NUMBER: newASN.poId,
        I_DISPATCH_DATE: newASN.shipDate,
        I_EXPECTED_DATE: newASN.estimatedDeliveryDate,
        I_CARRIER: newASN.carrierName,
        I_WAYBILL: newASN.ewayBillNo,
        ITEMS: newASN.items.map(item => ({
          LINE: item.line,
          MATNR: item.materialCode,
          QTY: item.shippedQuantity
        }))
      }),
      'SUCCESS'
    );

    const updatedAsns = [newASN, ...asns];
    setAsns(updatedAsns);
    persistLocally('sap_vendor_portal_asns', updatedAsns);

    // Update PO status to Dispatched
    const updatedPos = pos.map(po => {
      if (po.id === newASN.poId) {
        return { ...po, status: 'Dispatched' };
      }
      return po;
    });
    setPos(updatedPos);
    persistLocally('sap_vendor_portal_pos', updatedPos);

    // Trigger auto-GRN (MIGO Goods Receipt) after 5 seconds
    setTimeout(() => {
      simulateIncomingGRN(newASN);
    }, 5000);
  };

  const simulateIncomingGRN = (asn) => {
    const matchedPo = pos.find(p => p.id === asn.poId);
    if (!matchedPo) return;

    const grnId = `GRN-${Math.floor(5000000 + Math.random() * 4900000)}`;
    const sapMigoDoc = `50002${Math.floor(10000 + Math.random() * 90000)}`;

    const newGRN = {
      id: grnId,
      poId: asn.poId,
      asnId: asn.id,
      vendorId: profile?.sapVendorCode || 'VND-CURRENT',
      sapMigoDoc,
      postingDate: new Date().toISOString().split('T')[0],
      receivedBy: 'Warehouse Team (M. Patel)',
      invoiceSubmitted: false,
      items: asn.items.map(item => {
        const poItem = matchedPo.items.find(pi => pi.line === item.line);
        const received = item.shippedQuantity;
        // 98% acceptance rate simulation
        const rejected = Math.random() > 0.85 ? Math.min(2, Math.floor(received * 0.1)) : 0;
        const accepted = received - rejected;
        return {
          line: item.line,
          materialCode: item.materialCode,
          description: item.description || poItem?.description || '',
          receivedQuantity: received,
          acceptedQuantity: accepted,
          rejectedQuantity: rejected,
          rejectionReason: rejected > 0 ? 'Surface scratches / dimensional dev' : '',
          uom: item.uom
        };
      })
    };

    addSapLog(
      'IDoc',
      'MBGMCR03.MBGMCR',
      'INBOUND',
      JSON.stringify({
        MIGO_DOC: sapMigoDoc,
        EBELN: asn.poId,
        ITEMS: newGRN.items.map(item => ({
          EBELP: item.line,
          MATNR: item.materialCode,
          ERFMG: item.receivedQuantity,
          WEMNG: item.acceptedQuantity,
          REJ_QTY: item.rejectedQuantity
        }))
      }),
      'SUCCESS'
    );

    setGrns(prev => {
      const updated = [newGRN, ...prev];
      persistLocally('sap_vendor_portal_grns', updated);
      return updated;
    });

    // Update PO items with grnQuantity and status to Delivered
    setPos(prevPos => {
      const updated = prevPos.map(po => {
        if (po.id === asn.poId) {
          const updatedItems = po.items.map(item => {
            const grnItem = newGRN.items.find(gi => gi.line === item.line);
            return {
              ...item,
              grnQuantity: item.grnQuantity + (grnItem ? grnItem.acceptedQuantity : 0)
            };
          });
          return {
            ...po,
            status: 'Delivered',
            items: updatedItems
          };
        }
        return po;
      });
      persistLocally('sap_vendor_portal_pos', updated);
      return updated;
    });

    // Update ASN status to Received
    setAsns(prevAsns => {
      const updated = prevAsns.map(a => {
        if (a.id === asn.id) {
          return { ...a, status: 'Received' };
        }
        return a;
      });
      persistLocally('sap_vendor_portal_asns', updated);
      return updated;
    });
  };

  const simulateIncomingPO = () => {
    const poId = `PO-45000${Math.floor(10000 + Math.random() * 90000)}`;
    const newPO = {
      id: poId,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Open',
      paymentTerms: 'NET 45 Days',
      currency: 'INR',
      items: [
        {
          line: 10,
          materialCode: 'FAST-HEX-M12-050',
          description: 'Hexagonal Bolt M12 x 50mm Grade 8.8',
          quantity: 2000,
          uom: 'EA',
          unitPrice: 15.00,
          netValue: 30000,
          grnQuantity: 0
        }
      ]
    };

    addSapLog(
      'ODATA',
      'ZPD_PO_SRV/PurchaseOrderSet',
      'INBOUND',
      JSON.stringify({
        EBELN: newPO.id,
        LIFNR: profile?.sapVendorCode || 'VND-CURRENT',
        BUDAT: newPO.createdDate,
        NETWR: 30000,
        WAERS: 'INR',
        ITEMS: newPO.items.map(item => ({
          EBELP: item.line,
          MATNR: item.materialCode,
          TXZ01: item.description,
          MENGE: item.quantity,
          MEINS: item.uom,
          NETPR: item.unitPrice,
          NETWR: item.netValue
        }))
      }),
      'SUCCESS'
    );

    setPos(prev => {
      const updated = [newPO, ...prev];
      persistLocally('sap_vendor_portal_pos', updated);
      return updated;
    });
  };

  const setInvoiceSubmittedForGrn = (grnId) => {
    setGrns(prev => {
      const updated = prev.map(g => {
        if (g.id === grnId) return { ...g, invoiceSubmitted: true };
        return g;
      });
      persistLocally('sap_vendor_portal_grns', updated);
      return updated;
    });
  };

  return {
    pos,
    asns,
    grns,
    addPO,
    acknowledgePO,
    submitASN,
    simulateIncomingPO,
    setInvoiceSubmittedForGrn
  };
}
