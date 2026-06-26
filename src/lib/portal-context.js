'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useShell } from '@/lib/shell-context';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useRFQs } from '@/features/rfq/hooks/useRFQs';
import { usePOs } from '@/features/purchase-order/hooks/usePOs';
import { useInvoices } from '@/features/billing/hooks/useInvoices';
import { usePayments } from '@/features/payments/hooks/usePayments';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { usePathname, useRouter } from 'next/navigation';
import { initSocket, closeSocket } from '@/lib/socket';
import ToastNotification from '@/components/portal/ToastNotification';

const PortalContext = createContext(undefined);

export function PortalProvider({ children }) {
  const shell = useShell();
  const profileHook = useProfile();
  const poHook = usePOs(profileHook.profile);
  const paymentHook = usePayments();
  const invoiceHook = useInvoices(profileHook.profile, poHook.setInvoiceSubmittedForGrn, paymentHook.addPayment);
  const rfqHook = useRFQs(profileHook.profile);
  const dashboardHook = useDashboard(profileHook.profile, shell.clearSapLogs);

  const [toasts, setToasts] = useState([]);
  const addToast = (type, message) => {
    setToasts(prev => [...prev, { id: `toast-${Date.now()}-${Math.random()}`, type, message }]);
  };
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const clerkId = profileHook.profile?.clerkId || (typeof window !== 'undefined' ? localStorage.getItem('clerk_user_id') : null) || 'mock_vendor_id';
    
    console.log('[PortalContext] Initializing WebSockets connection for vendor:', clerkId);
    const socket = initSocket(null, clerkId);

    socket.on('po:new', (po) => {
      poHook.refreshPOs();
      addToast('info', `New Purchase Order received! ID: ${po.id}`);
      shell.addSapLog('ODATA', 'ZPD_PO_SRV/PurchaseOrderSet', 'INBOUND', po, 'SUCCESS');
    });

    socket.on('grn:received', (grn) => {
      poHook.refreshGRNs();
      poHook.refreshPOs();
      poHook.refreshASNs();
      addToast('success', `Goods Receipt Note (GRN) received for PO: ${grn.poId}. Stores accepted your goods.`);
      shell.addSapLog('IDoc', 'MBGMCR03_GRN_IDoc', 'INBOUND', grn, 'SUCCESS');
    });

    socket.on('payment:cleared', (pmt) => {
      paymentHook.refreshPayments();
      invoiceHook.refreshInvoices();
      addToast('success', `Payment cleared! UTR: ${pmt.utrCode} · Net Amount: ₹${pmt.netAmount.toLocaleString('en-IN')}`);
      shell.addSapLog('IDoc', 'PAYEXT_F110_PAYMENT', 'INBOUND', pmt, 'SUCCESS');
    });

    socket.on('chat:message', (msg) => {
      if (dashboardHook?.refreshChats) {
        dashboardHook.refreshChats();
      }
    });

    socket.on('log:new', (log) => {
      shell.addSapLog(log.type, log.name, 'INBOUND', log.payload || 'Sync', 'SUCCESS');
    });

    return () => {
      closeSocket();
    };
  }, [profileHook.profile?.clerkId]);

  const pathname = usePathname();
  const router = useRouter();

  // Determine active tab from pathname
  const activeTab = pathname === '/' ? 'dashboard' : pathname.replace(/^\//, '');

  const setActiveTab = (tabId) => {
    if (tabId === 'dashboard') {
      router.push('/');
    } else {
      router.push(`/${tabId}`);
    }
  };

  // Legacy state object syntax mapping for component compatibility
  const state = {
    profile: profileHook.profile,
    rfqs: rfqHook.rfqs,
    pos: poHook.pos,
    asns: poHook.asns,
    grns: poHook.grns,
    invoices: invoiceHook.invoices,
    payments: paymentHook.payments,
    chats: dashboardHook.chats,
    logs: shell.sapPayloadLogs,
    performance: dashboardHook.performance
  };

  const [consoleOpen, setConsoleOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedRfqId, setSelectedRfqId] = useState(null);
  const [selectedPoId, setSelectedPoId] = useState(null);
  const [selectedGrnId, setSelectedGrnId] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms states managed locally
  const [companyForm, setCompanyForm] = useState({
    companyName: '', tradeName: '', businessType: '', incorporationDate: '',
    gstin: '', gstType: '', pan: '', cin: '', msmeNumber: '', tdsSection: '',
    email: '', phone: '', address: '', city: '', state: '', postalCode: '',
    bankName: '', accountNumber: '', ifscCode: '', accountName: '', bankBranch: '',
    cancelledCheque: null, panCardCopy: null, gstCertificate: null,
    incorporationCertificate: null, msmeCertificate: null, isoCertificate: null, itReturns: null
  });

  const [bidPrices, setBidPrices] = useState({});
  const [bidLeadTime, setBidLeadTime] = useState(7);
  const [bidRemarks, setBidRemarks] = useState('');

  const [asnForm, setAsnForm] = useState({
    carrierName: '', trackingNumber: '', vehicleNumber: '',
    invoiceReference: '', shipDate: '', estimatedDeliveryDate: '',
    items: {}
  });

  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '', invoiceDate: ''
  });

  // DOM ref pointers
  const chatEndRef = useRef(null);
  const consoleEndRef = useRef(null);

  // Auto-scroll feeds
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
    }
  }, [state.chats]);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollTop = consoleEndRef.current.scrollHeight;
    }
  }, [state.logs]);

  // Sync profile values
  useEffect(() => {
    if (state.profile.companyName) {
      Promise.resolve().then(() => {
        setCompanyForm({
          companyName: state.profile.companyName || '',
          tradeName: state.profile.tradeName || '',
          businessType: state.profile.businessType || '',
          incorporationDate: state.profile.incorporationDate || '',
          gstin: state.profile.gstin || '',
          gstType: state.profile.gstType || '',
          pan: state.profile.pan || '',
          cin: state.profile.cin || '',
          msmeNumber: state.profile.msmeNumber || '',
          tdsSection: state.profile.tdsSection || '',
          email: state.profile.email || '',
          phone: state.profile.phone || '',
          address: state.profile.address || '',
          city: state.profile.city || '',
          state: state.profile.state || '',
          postalCode: state.profile.postalCode || '',
          bankName: state.profile.bankName || '',
          accountNumber: state.profile.accountNumber || '',
          ifscCode: state.profile.ifscCode || '',
          accountName: state.profile.accountName || '',
          bankBranch: state.profile.bankBranch || '',
          cancelledCheque: state.profile.cancelledCheque || null,
          panCardCopy: state.profile.panCardCopy || null,
          gstCertificate: state.profile.gstCertificate || null,
          incorporationCertificate: state.profile.incorporationCertificate || null,
          msmeCertificate: state.profile.msmeCertificate || null,
          isoCertificate: state.profile.isoCertificate || null,
          itReturns: state.profile.itReturns || null
        });
      });
    }
  }, [state.profile]);

  // Form Submit Handlers
  const handleCompanySubmit = (e) => {
    e.preventDefault();
    if (!companyForm.companyName || !companyForm.gstin || !companyForm.email) {
      alert('Please fill in all required fields (Company Name, GSTIN, and Contact Email).');
      return;
    }
    profileHook.submitRegistration(companyForm);
    setActiveTab('registration');
  };

  const handleBidSubmit = (rfqId, prices, leadTime, remarks, gstRate, validityDate, freight, moq, docs) => {
    rfqHook.submitBid(rfqId, prices, leadTime, remarks, gstRate, validityDate, freight, moq, docs);
    setSelectedRfqId(null);
  };

  const handleAsnSubmit = async (po) => {
    const items = po.items.map(item => ({
      line: item.line,
      shippedQuantity: Number(asnForm.items[item.line] || item.quantity)
    }));

    const res = await poHook.submitASN({
      poId: po.id,
      shipDate: asnForm.shipDate || new Date().toISOString().split('T')[0],
      estimatedDeliveryDate: asnForm.estimatedDeliveryDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      carrierName: asnForm.carrierName || 'BlueDart Express',
      trackingNumber: asnForm.trackingNumber || `BD-${Math.floor(100000 + Math.random() * 900000)}`,
      vehicleNumber: asnForm.vehicleNumber || `DL-01-CA-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceReference: asnForm.invoiceReference || `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      ewayBillNo: po.ewayBillNo || '',
      documentIds: po.documentIds || [],
      items
    });

    setSelectedPoId(null);
    setAsnForm({
      carrierName: '', trackingNumber: '', vehicleNumber: '',
      invoiceReference: '', shipDate: '', estimatedDeliveryDate: '',
      items: {}
    });

    // Fallback timer to refresh POs, ASNs and GRNs after 11 seconds (backend simulation takes 10s)
    setTimeout(() => {
      console.log('[PortalContext] Fallback refresh for GRN/MIGO simulation...');
      poHook.refreshPOs();
      poHook.refreshASNs();
      poHook.refreshGRNs();
    }, 11000);

    return res;
  };

  const handleInvoiceSubmit = (grn) => {
    if (!invoiceForm.invoiceNumber || !invoiceForm.invoiceDate) {
      alert('Please enter Invoice Number and Billing Date.');
      return;
    }

    const items = grn.items.map(item => {
      const po = state.pos.find(p => p.id === grn.poId);
      const poItem = po?.items.find(pi => pi.line === item.line);
      const unitPrice = poItem?.unitPrice || 0;
      return {
        line: item.line,
        materialCode: item.materialCode,
        description: item.description,
        quantity: item.acceptedQuantity,
        unitPrice,
        amount: item.acceptedQuantity * unitPrice
      };
    });

    const subTotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = Number((subTotal * 0.18).toFixed(2));
    const totalAmount = Number((subTotal + taxAmount).toFixed(2));

    setIsSubmitting(true);

    setTimeout(() => {
      invoiceHook.submitInvoice({
        grnId: grn.id,
        poId: grn.poId,
        invoiceNumber: invoiceForm.invoiceNumber,
        invoiceDate: invoiceForm.invoiceDate,
        subTotal,
        taxAmount,
        totalAmount,
        items
      });
      setIsSubmitting(false);
      setSelectedGrnId(null);
      setInvoiceForm({ invoiceNumber: '', invoiceDate: '' });
      setActiveTab('invoices');

      // Fallback timer to refresh payments, invoices and POs after 13 seconds (backend simulation takes 12s)
      setTimeout(() => {
        console.log('[PortalContext] Fallback refresh for Payment simulation...');
        paymentHook.refreshPayments();
        invoiceHook.refreshInvoices();
        poHook.refreshPOs();
      }, 13000);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    dashboardHook.sendChatMessage(chatInput);
    setChatInput('');
  };

  const handleResetDatabase = () => {
    if (confirm('Reset portal ERP database back to default state? This will clear all transactions.')) {
      dashboardHook.clearAllState();
      setActiveTab('dashboard');
    }
  };

  const awardVendorBidWrapper = async (rfqId, vendorId) => {
    const newPO = await rfqHook.awardVendorBid(rfqId, vendorId);
    if (newPO) {
      poHook.addPO(newPO);
      poHook.refreshPOs();
      dashboardHook.addSystemMessage(`Purchase Order ${newPO.id} has been created and dispatched to the awarded vendor.`);
    }
  };

  return (
    <PortalContext.Provider
      value={{
        activeTab,
        setActiveTab,
        sidebarCollapsed,
        setSidebarCollapsed,
        state,
        profileHook,
        poHook,
        paymentHook,
        invoiceHook,
        rfqHook,
        dashboardHook,
        consoleOpen,
        setConsoleOpen,
        selectedRfqId,
        setSelectedRfqId,
        selectedPoId,
        setSelectedPoId,
        selectedGrnId,
        setSelectedGrnId,
        chatInput,
        setChatInput,
        isSubmitting,
        setIsSubmitting,
        companyForm,
        setCompanyForm,
        bidPrices,
        setBidPrices,
        bidLeadTime,
        setBidLeadTime,
        bidRemarks,
        setBidRemarks,
        asnForm,
        setAsnForm,
        invoiceForm,
        setInvoiceForm,
        chatEndRef,
        consoleEndRef,
        handleCompanySubmit,
        handleBidSubmit,
        handleAsnSubmit,
        handleInvoiceSubmit,
        handleSendMessage,
        handleResetDatabase,
        awardVendorBidWrapper,
        addToast
      }}
    >
      {children}
      <ToastNotification toasts={toasts} removeToast={removeToast} />
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (context === undefined) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
}
