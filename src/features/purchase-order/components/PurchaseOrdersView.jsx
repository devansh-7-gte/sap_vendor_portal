'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Clock, CheckCircle2, Truck, ChevronRight, ChevronLeft, Search, Filter,
  Calendar, User, Download, AlertTriangle, MessageSquare, Plus, Send,
  FileText, X, ChevronDown, Check, MapPin, CreditCard, ArrowLeft,
  Building, Building2, TrendingUp, Percent, ShieldCheck, RefreshCw, FileCheck, HelpCircle, Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileUploadZone from '@/components/shared/FileUploadZone';
import SkeletonLoader from '@/components/shared/SkeletonLoader';
import ErrorBoundary from '@/components/ErrorBoundary';

function EnterpriseFieldCard({ label, required, error, children, icon: Icon }) {
  return (
    <div className={`h-full p-3 rounded-lg border border-stone-200 bg-white hover:border-stone-350 hover:shadow-xs transition-all duration-150 flex flex-col justify-between relative min-h-[76px] select-none ${
      error ? 'border-red-300 bg-red-50/10' : ''
    }`}>
      <div className="flex justify-between items-start w-full gap-2">
        <label className="text-[10px] font-bold text-stone-800 uppercase tracking-wider block leading-tight" title={label}>
          {label} {required && <span className="text-red-500 font-bold select-none ml-0.5">*</span>}
        </label>
        {Icon && <Icon className="size-3.5 text-stone-600 shrink-0" />}
      </div>
      <div className="w-full min-w-0 mt-1.5 flex flex-col justify-end text-stone-600 font-medium [&_span:not(.rounded)]:font-medium [&_span:not(.rounded)]:text-stone-600 [&_input]:font-medium [&_input]:text-stone-600">
        {children}
        {error && (
          <span className="text-[10px] font-bold text-red-650 mt-1 select-none">{error}</span>
        )}
      </div>
    </div>
  );
}

const generateInvoiceNumber = () => `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

export default function PurchaseOrdersView({
  state,
  selectedPoId,
  setSelectedPoId,
  asnForm,
  setAsnForm,
  handleAsnSubmit,
  acknowledgePO,
  simulateIncomingPO,
  setActiveTab,
  submitInvoice
}) {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // -----------------------------------------------------------------
  // DATA PIPELINE SANITISATION
  // -----------------------------------------------------------------
  // Filter out any null elements or corrupt POs/GRNs/ASNs from localStorage
  const cleanPOs = (Array.isArray(state?.pos) ? state.pos : [])
    .filter(Boolean)
    .map(po => ({
      plant: 'Plant 1000 (Mumbai)',
      buyerName: 'Amit Sharma (Lead Procurement)',
      paymentTerms: 'NET 30 Days',
      currency: 'INR',
      incoterms: 'EXW',
      deliveryAddress: 'Plant Gate 2, Industrial Sector, Mumbai, India',
      status: 'Open',
      ...po,
      items: (po.items || []).filter(Boolean).map(item => ({
        quantity: 0,
        grnQuantity: 0,
        unitPrice: 0,
        netValue: 0,
        ...item
      }))
    }));

  const cleanGrns = (Array.isArray(state?.grns) ? state.grns : [])
    .filter(Boolean)
    .map(grn => ({
      postingDate: new Date().toISOString().split('T')[0],
      receivedBy: 'Stores Manager (QC Group)',
      ...grn,
      items: (grn.items || []).filter(Boolean).map(item => ({
        receivedQuantity: 0,
        acceptedQuantity: 0,
        rejectedQuantity: 0,
        ...item
      }))
    }));

  const cleanAsns = (Array.isArray(state?.asns) ? state.asns : []).filter(Boolean);

  // Navigation states:
  // poSubTab tracks the main top menu: 'list' (Orders Monitor), 'grn' (Goods Receipts), 'invoice' (Invoice Ready)
  const [poSubTab, setPoSubTab] = useState('list');
  // currentView tracks detail sub-states: 'list' | 'detail' | 'asn' | 'asn_success' | 'grn_detail' | 'invoice_detail'
  const [currentView, setCurrentView] = useState('list');
  const [activePoState, setActivePo] = useState(null);
  const [activeGrnState, setActiveGrn] = useState(null);
  const activePo = activePoState ? (cleanPOs.find(p => p.id === activePoState.id) || activePoState) : null;
  const activeGrn = activeGrnState ? (cleanGrns.find(g => g.id === activeGrnState.id) || activeGrnState) : null;
  const [localSubmissionTimes, setLocalSubmissionTimes] = useState({});
  const [isSapView, setIsSapView] = useState(false);
  const [activeLineIdx, setActiveLineIdx] = useState(0);

  // Search and Filters for Screen 1
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [plantFilter, setPlantFilter] = useState('all');
  const [buyerFilter, setBuyerFilter] = useState('all');

  // Table Sorting
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Local state for E-Way Bill uploads and validation errors
  const [ewayBillNo, setEwayBillNo] = useState('');
  const [ewayBillFile, setEwayBillFile] = useState(null);
  const [dispatchQuantities, setDispatchQuantities] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  
  // Local state for local uploads in ASN
  const [asnDocs, setAsnDocs] = useState({ packingList: null, invoiceCopy: null, transportDoc: null });

  // ASN Success Display state
  const [asnSuccessInfo, setAsnSuccessInfo] = useState(null);

  // local Invoice input details (Screen 5)
  const [vendorInvoiceNo, setVendorInvoiceNo] = useState('');
  const [billingDate, setBillingDate] = useState('');
  const [isPostingInvoice, setIsPostingInvoice] = useState(false);
  const [invoicePostedSuccess, setInvoicePostedSuccess] = useState(false);

  // Sliding Side Drawer for Communication Center
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPo, setDrawerPo] = useState(null);
  const [chatMessageInput, setChatMessageInput] = useState('');
  const [poIssueStatus, setPoIssueStatus] = useState({}); // poId -> 'Open' | 'In Review' | 'Resolved'
  const [poChats, setPoChats] = useState({}); // poId -> array of messages

  // Detail View Active Sub-tab ('po_detail' | 'create_asn' | 'grn_status')
  const [detailTab, setDetailTab] = useState('po_detail');

  // Countdown timer for MIGO receipt simulation
  const [countdown, setCountdown] = useState({});

  // Fetch unique plants and buyers from actual PO list for filters
  const uniquePlants = Array.from(new Set(cleanPOs.map(p => p.plant)));
  const uniqueBuyers = Array.from(new Set(cleanPOs.map(p => p.buyerName)));

  // Monitor POs that are Dispatched and track countdowns for GRN sync
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      cleanPOs.forEach(po => {
        if (po.status === 'Dispatched') {
          // Calculate elapsed time since dispatch submission.
          // Since submitASN creates the ASN and triggers GRN in 10 seconds,
          // we can simulate a countdown from 10 seconds.
          const asn = cleanAsns.find(a => a.poId === po.id);
          const submittedDate = asn?.submittedAt || asn?.createdAt || localSubmissionTimes[po.id];
          if (submittedDate) {
            const elapsed = Math.floor((now - new Date(submittedDate).getTime()) / 1000);
            const remaining = Math.max(0, 10 - elapsed);
            setCountdown(prev => ({ ...prev, [po.id]: remaining }));
          } else {
            setCountdown(prev => ({ ...prev, [po.id]: 10 }));
          }
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cleanPOs, cleanAsns, localSubmissionTimes]);

  // Pre-load default chat messages for POs
  useEffect(() => {
    cleanPOs.forEach(po => {
      if (!poChats[po.id]) {
        // Initialize mock thread
        setPoChats(prev => ({
          ...prev,
          [po.id]: [
            {
              sender: 'Buyer',
              message: `Hi Team, PO ${po.id} has been released in SAP. Please review payment terms (${po.paymentTerms || 'NET 30'}) and delivery locations and confirm acknowledgement.`,
              timestamp: new Date(new Date(po.createdDate).getTime() + 10 * 60000).toISOString()
            }
          ]
        }));
        setPoIssueStatus(prev => ({ ...prev, [po.id]: 'In Review' }));
      }
    });
  }, [cleanPOs]);

  // Auto-initialize ASN form when user enters tab 2 via tab navigation
  useEffect(() => {
    if (detailTab === 'create_asn' && activePo && activePo.status !== 'Open') {
      const lines = (activePo.items || []).map(item => item.line);
      const isInitialized = lines.length > 0 && lines.every(line => dispatchQuantities[line] !== undefined);
      if (!isInitialized) {
        const initialQtys = {};
        const initialErrors = {};
        (activePo.items || []).forEach(item => {
          const remaining = item.quantity - (item.grnQuantity || 0);
          initialQtys[item.line] = remaining;
          initialErrors[item.line] = '';
        });
        setDispatchQuantities(initialQtys);
        setValidationErrors(initialErrors);
        setEwayBillNo(prev => prev || `E-WAY-${Math.floor(100000000000 + Math.random() * 900000000000)}`);
        setAsnForm(prev => ({
          carrierName: prev.carrierName || 'DHL Global Logistics',
          trackingNumber: prev.trackingNumber || `DHL-${Math.floor(1000000 + Math.random() * 9000000)}`,
          vehicleNumber: prev.vehicleNumber || 'MH-12-XY-4321',
          invoiceReference: prev.invoiceReference || `TAX-2026-${Math.floor(100 + Math.random() * 900)}`,
          shipDate: prev.shipDate || new Date().toISOString().split('T')[0],
          estimatedDeliveryDate: prev.estimatedDeliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          items: initialQtys
        }));
      }
    }
  }, [detailTab, activePo?.id]);

  // Handle PO Row selection
  const handleOpenPoDetails = (po) => {
    setActivePo(po);
    setDetailTab('po_detail');
    setCurrentView('detail');
    setActiveLineIdx(0);
  };

  const handleOpenGrnDetails = (grn) => {
    const po = cleanPOs.find(p => p.id === grn.poId);
    setActiveGrn(grn);
    setActivePo(po);
    setDetailTab('grn_status');
    setCurrentView('detail');
    setActiveLineIdx(0);
  };

  const handleOpenInvoiceDetail = (grn) => {
    const po = cleanPOs.find(p => p.id === grn.poId);
    setActiveGrn(grn);
    setActivePo(po);
    // Prefill fields
    setVendorInvoiceNo(generateInvoiceNumber());
    setBillingDate(new Date().toISOString().split('T')[0]);
    setInvoicePostedSuccess(false);
    setCurrentView('invoice_detail');
    setActiveLineIdx(0);
  };

  // Open Communication Drawer
  const handleOpenDrawer = (e, po) => {
    e.stopPropagation();
    setDrawerPo(po);
    setDrawerOpen(true);
  };

  // Send Drawer Message
  const handleSendDrawerMessage = () => {
    if (!chatMessageInput.trim()) return;

    const newMessage = {
      sender: 'Vendor',
      message: chatMessageInput,
      timestamp: new Date().toISOString()
    };

    setPoChats(prev => ({
      ...prev,
      [drawerPo.id]: [...(prev[drawerPo.id] || []), newMessage]
    }));

    const text = chatMessageInput;
    setChatMessageInput('');

    // Trigger mock response
    setTimeout(() => {
      let reply = "We have updated the records in SAP. Let us know if you need anything else.";
      if (text.toLowerCase().includes('delivery') || text.toLowerCase().includes('date') || text.toLowerCase().includes('delay')) {
        reply = "Acknowledged. Please make sure the dispatch quantity matches the remaining quantities to avoid MIGO rejection flags.";
      } else if (text.toLowerCase().includes('price') || text.toLowerCase().includes('tax') || text.toLowerCase().includes('gst')) {
        reply = "Our finance desk uses tax code G1 (18% GST). Standard payment terms will apply upon invoice verification.";
      } else if (text.toLowerCase().includes('issue') || text.toLowerCase().includes('dented') || text.toLowerCase().includes('rejected')) {
        reply = "Quality check failures must be supported with a signed inspection sheet. Please update documentation in the Attachments tab.";
      }

      setPoChats(prev => ({
        ...prev,
        [drawerPo.id]: [
          ...(prev[drawerPo.id] || []),
          {
            sender: 'Buyer',
            message: reply,
            timestamp: new Date().toISOString()
          }
        ]
      }));
    }, 1500);
  };

  // Sort POs
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort the PO list
  const getFilteredPOs = () => {
    return cleanPOs
      .filter(po => {
        const matchesSearch = po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (po.items || []).some(item => item && (item.description.toLowerCase().includes(searchQuery.toLowerCase()) || item.materialCode.toLowerCase().includes(searchQuery.toLowerCase())));
        
        const mappedStatus = po.status;
        const matchesStatus = statusFilter === 'all' || 
          (statusFilter === 'New' && mappedStatus === 'Open') ||
          (statusFilter === 'Acknowledged' && mappedStatus === 'Acknowledged') ||
          (statusFilter === 'ASN Submitted' && mappedStatus === 'Dispatched') ||
          (statusFilter === 'GRN Complete' && (mappedStatus === 'Delivered' || mappedStatus === 'Invoiced' || mappedStatus === 'Paid'));

        const matchesPlant = plantFilter === 'all' || po.plant === plantFilter;
        const matchesBuyer = buyerFilter === 'all' || po.buyerName === buyerFilter;

        return matchesSearch && matchesStatus && matchesPlant && matchesBuyer;
      })
      .sort((a, b) => {
        let fieldA = a[sortField];
        let fieldB = b[sortField];

        // Custom field comparisons for items/totals
        if (sortField === 'value') {
          fieldA = (a.items || []).reduce((s, i) => s + (i.netValue || 0), 0);
          fieldB = (b.items || []).reduce((s, i) => s + (i.netValue || 0), 0);
        } else if (sortField === 'itemsCount') {
          fieldA = (a.items || []).length;
          fieldB = (b.items || []).length;
        }

        if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  };

  const filteredPOs = getFilteredPOs();
  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage);
  const paginatedPOs = filteredPOs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Initialize ASN Form
  const handleOpenAsnForm = (po) => {
    setActivePo(po);
    const initialQtys = {};
    const initialErrors = {};
    (po.items || []).forEach(item => {
      // Remaining qty = Ordered Qty - GRN Quantity
      const remaining = item.quantity - (item.grnQuantity || 0);
      initialQtys[item.line] = remaining;
      initialErrors[item.line] = '';
    });
    setDispatchQuantities(initialQtys);
    setValidationErrors(initialErrors);
    setEwayBillNo(`E-WAY-${Math.floor(100000000000 + Math.random() * 900000000000)}`);
    setAsnDocs({ packingList: null, invoiceCopy: null, transportDoc: null });
    setAsnForm({
      carrierName: 'DHL Global Logistics',
      trackingNumber: `DHL-${Math.floor(1000000 + Math.random() * 9000000)}`,
      vehicleNumber: 'MH-12-XY-4321',
      invoiceReference: `TAX-2026-${Math.floor(100 + Math.random() * 900)}`,
      shipDate: new Date().toISOString().split('T')[0],
      estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: initialQtys
    });
    setDetailTab('create_asn');
    setCurrentView('detail');
  };

  // Validate and submit ASN
  const handleAsnSubmitClick = async () => {
    let hasErrors = false;
    const newErrors = {};

    (activePo?.items || []).forEach(item => {
      const qty = Number(dispatchQuantities[item.line]);
      const remaining = item.quantity - (item.grnQuantity || 0);

      if (isNaN(qty) || qty <= 0) {
        newErrors[item.line] = 'Quantity must be greater than 0';
        hasErrors = true;
      } else if (qty > remaining) {
        newErrors[item.line] = `Quantity cannot exceed remaining ordered units (${remaining})`;
        hasErrors = true;
      } else {
        newErrors[item.line] = '';
      }
    });

    setValidationErrors(newErrors);

    if (hasErrors) return;

    try {
      // Record local submission timestamp to start countdown immediately
      if (activePo) {
        setLocalSubmissionTimes(prev => ({ ...prev, [activePo.id]: new Date().toISOString() }));
      }

      // Call store dispatch
      const res = await handleAsnSubmit({
        ...activePo,
        items: activePo?.items || [],
        ewayBillNo,
        documentIds: Object.values(asnDocs).filter(Boolean).map(d => d.documentId)
      });

      if (res && res.asn) {
        // Configure the success info using the actual backend-generated IDs
        setAsnSuccessInfo({
          asnId: res.asn.id,
          sapInbound: res.asn.sapInboundDelivery,
          poId: activePo?.id || 'PO',
          carrierName: asnForm.carrierName || 'DHL Global Logistics',
          trackingNumber: asnForm.trackingNumber || `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
          eta: asnForm.estimatedDeliveryDate,
          items: (activePo?.items || []).map(item => ({
            ...item,
            shippedQty: Number(dispatchQuantities[item.line])
          }))
        });
      }

      setDetailTab('grn_status');
      setCurrentView('detail');
    } catch (e) {
      console.error(e);
      alert('Failed to submit ASN: ' + (e.message || e));
    }
  };

  // Submit MIRO Invoice Posting
  const handleMiroInvoicePost = () => {
    if (!vendorInvoiceNo.trim() || !billingDate) {
      alert('Please fill in Invoice Reference and Document Date.');
      return;
    }

    setIsPostingInvoice(true);

    const items = (activeGrn?.items || []).map(item => {
      const poItem = activePo?.items?.find(pi => pi.line === item.line);
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

    setTimeout(() => {
      submitInvoice({
        grnId: activeGrn.id,
        poId: activeGrn.poId,
        invoiceNumber: vendorInvoiceNo.toUpperCase(),
        invoiceDate: billingDate,
        subTotal,
        taxAmount,
        totalAmount,
        items
      });
      setIsPostingInvoice(false);
      setInvoicePostedSuccess(true);
    }, 1500);
  };

  // Status Chip formatting
  const renderStatusChip = (status) => {
    switch (status) {
      case 'Open':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1.5 w-fit">
            <span className="size-1.5 rounded-full bg-blue-500"></span> New
          </span>
        );
      case 'Acknowledged':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1.5 w-fit">
            <span className="size-1.5 rounded-full bg-purple-500"></span> Acknowledged
          </span>
        );
      case 'Dispatched':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1.5 w-fit">
            <span className="size-1.5 rounded-full bg-orange-400 animate-pulse"></span> ASN Submitted
          </span>
        );
      case 'Delivered':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-green-50 text-green-700 border-green-200 flex items-center gap-1.5 w-fit">
            <span className="size-1.5 rounded-full bg-green-500"></span> GRN Complete
          </span>
        );
      case 'Invoiced':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-teal-50 text-teal-700 border-teal-200 flex items-center gap-1.5 w-fit">
            <span className="size-1.5 rounded-full bg-teal-500"></span> Invoice Posted
          </span>
        );
      case 'Paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-stone-100 text-stone-700 border-stone-300 flex items-center gap-1.5 w-fit">
            <Check className="size-3 text-stone-600" /> Paid (F110)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-stone-50 text-stone-700 border-stone-200 w-fit">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="p-4 space-y-4">
          <SkeletonLoader type="table" rows={6} cols={5} />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 max-w-full mx-auto animate-fade-in pb-16 relative">
      
      {/* ==================== SUB-TABS NAVIGATION BAR ==================== */}
      {currentView === 'list' && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-200 pb-2 gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => { setPoSubTab('list'); setCurrentPage(1); }}
              className={`pb-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${poSubTab === 'list' ? 'border-stone-850 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
            >
              <ShoppingBag className="size-4.5" />
              <span>Orders Monitor</span>
              <span className="bg-stone-100 text-stone-600 font-mono text-[10px] px-1.5 py-0.5 rounded-full border border-stone-200">
                {cleanPOs.length}
              </span>
            </button>
            <button
              onClick={() => { setPoSubTab('grn'); }}
              className={`pb-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${poSubTab === 'grn' ? 'border-stone-850 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
            >
              <Truck className="size-4.5" />
              <span>Goods Receipts (MIGO)</span>
              <span className="bg-stone-100 text-stone-600 font-mono text-[10px] px-1.5 py-0.5 rounded-full border border-stone-200">
                {cleanGrns.length}
              </span>
            </button>
            <button
              onClick={() => { setPoSubTab('invoice'); }}
              className={`pb-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${poSubTab === 'invoice' ? 'border-stone-850 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
            >
              <FileCheck className="size-4.5" />
              <span>Invoice Ready (MIRO)</span>
              <span className="bg-amber-100 text-amber-700 font-mono text-[10px] px-1.5 py-0.5 rounded-full border border-amber-200 font-bold">
                {cleanGrns.filter(g => !g.invoiceSubmitted).length}
              </span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={simulateIncomingPO}
              variant="outline"
              className="border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="size-3.5 text-stone-400 animate-spin-hover" />
              <span>Simulate SAP PO (ME21N)</span>
            </Button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SCREEN 1: ORDERS MONITOR TAB / PO LIST                          */}
      {/* ================================================================= */}
      {currentView === 'list' && poSubTab === 'list' && (
        <div className="space-y-6">
          
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Contract Orders</p>
                <p className="text-2xl font-bold text-stone-900">{cleanPOs.length}</p>
                <p className="text-[10px] text-stone-500 font-semibold">Synced from ERP ledger</p>
              </div>
              <div className="size-9 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-600">
                <ShoppingBag className="size-4.5" />
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">New POs Awaiting Ack</p>
                <p className="text-2xl font-bold text-blue-600">
                  {cleanPOs.filter(p => p.status === 'Open').length}
                </p>
                <p className="text-[10px] text-blue-500 font-bold">Requires attention</p>
              </div>
              <div className="size-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Clock className="size-4.5" />
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Pending ASN Dispatches</p>
                <p className="text-2xl font-bold text-purple-600">
                  {cleanPOs.filter(p => p.status === 'Acknowledged').length}
                </p>
                <p className="text-[10px] text-purple-500 font-semibold">Ready for shipment</p>
              </div>
              <div className="size-9 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Truck className="size-4.5" />
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Completed Orders</p>
                <p className="text-2xl font-bold text-green-600">
                  {cleanPOs.filter(p => p.status === 'Delivered' || p.status === 'Invoiced' || p.status === 'Paid').length}
                </p>
                <p className="text-[10px] text-green-500 font-semibold">Stores receipted & post</p>
              </div>
              <div className="size-9 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="size-4.5" />
              </div>
            </div>
          </div>

          {/* Sticky Filter Bar */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-stone-400" />
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Search & Filter</h4>
              </div>
              {(searchQuery || statusFilter !== 'all' || plantFilter !== 'all' || buyerFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPlantFilter('all');
                    setBuyerFilter('all');
                  }}
                  className="text-stone-500 hover:text-stone-900 text-xs font-semibold hover:underline"
                >
                  Reset all filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 size-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="PO # or material description..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-stone-50 border border-stone-250 focus:border-stone-500 focus:bg-white rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none text-stone-900 transition-all font-medium"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center bg-stone-50 border border-stone-250 rounded-lg px-2 py-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase mr-2 shrink-0">Status</label>
                <select
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-transparent text-xs text-stone-700 outline-none font-semibold cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="New">New (Open)</option>
                  <option value="Acknowledged">Acknowledged</option>
                  <option value="ASN Submitted">ASN Submitted</option>
                  <option value="GRN Complete">GRN Complete</option>
                </select>
              </div>

              {/* Plant Filter */}
              <div className="flex items-center bg-stone-50 border border-stone-250 rounded-lg px-2 py-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase mr-2 shrink-0">Plant</label>
                <select
                  value={plantFilter}
                  onChange={e => { setPlantFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-transparent text-xs text-stone-700 outline-none font-semibold cursor-pointer"
                >
                  <option value="all">All Plants</option>
                  {uniquePlants.map((plant, idx) => (
                    <option key={idx} value={plant}>{plant}</option>
                  ))}
                </select>
              </div>

              {/* Buyer Filter */}
              <div className="flex items-center bg-stone-50 border border-stone-250 rounded-lg px-2 py-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase mr-2 shrink-0">Buyer</label>
                <select
                  value={buyerFilter}
                  onChange={e => { setBuyerFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-transparent text-xs text-stone-700 outline-none font-semibold cursor-pointer"
                >
                  <option value="all">All Buyers</option>
                  {uniqueBuyers.map((buyer, idx) => (
                    <option key={idx} value={buyer}>{buyer}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PO List Table */}
          {cleanPOs.length === 0 ? (
            <div className="p-12 rounded-xl border border-stone-250 bg-white text-center shadow-sm">
              <ShoppingBag className="size-12 mx-auto text-stone-300 mb-4 animate-bounce-slow" />
              <h4 className="text-sm font-bold text-stone-700">No Purchase Orders Found</h4>
              <p className="text-xs text-stone-450 mt-1 max-w-sm mx-auto">
                No PO records synced yet. Complete onboarding checklist approval or bid conversion to sync your order schedule, or click the simulation button above.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold text-[9px] uppercase tracking-wider">
                      <th className="py-3 px-4 font-mono select-none cursor-pointer hover:bg-stone-100/50" onClick={() => handleSort('id')}>
                        PO Number {sortField === 'id' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="py-3 px-4 select-none cursor-pointer hover:bg-stone-100/50" onClick={() => handleSort('createdDate')}>
                        PO Date {sortField === 'createdDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="py-3 px-4">Buyer Group</th>
                      <th className="py-3 px-4">Plant</th>
                      <th className="py-3 px-4 text-center select-none cursor-pointer hover:bg-stone-100/50" onClick={() => handleSort('itemsCount')}>
                        Items Count {sortField === 'itemsCount' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="py-3 px-4 text-right select-none cursor-pointer hover:bg-stone-100/50" onClick={() => handleSort('value')}>
                        Order Value {sortField === 'value' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="py-3 px-4 select-none cursor-pointer hover:bg-stone-100/50" onClick={() => handleSort('status')}>
                        Status {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="py-3 px-4 text-center">Row Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {paginatedPOs.map(po => {
                      if (!po) return null;
                      const totalValue = (po.items || []).reduce((s, i) => s + (i.netValue || 0), 0);
                      const plantName = po.plant || 'Plant 1000 (Mumbai)';
                      const buyerName = po.buyerName || 'Amit Sharma (Lead Procurement)';
                      
                      return (
                        <tr
                          key={po.id}
                          onDoubleClick={() => handleOpenPoDetails(po)}
                          className="hover:bg-stone-50/40 transition-colors group cursor-pointer"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-stone-900 group-hover:underline whitespace-nowrap">
                            {po.id}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-stone-500 whitespace-nowrap">{formatDate(po.createdDate)}</td>
                          <td className="py-3.5 px-4 font-semibold text-stone-700">{buyerName}</td>
                          <td className="py-3.5 px-4 text-stone-600 font-medium">{plantName}</td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold">{(po.items || []).length}</td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900 whitespace-nowrap">
                            ₹ {totalValue.toLocaleString()}.00
                          </td>
                          <td className="py-3.5 px-4">
                            {renderStatusChip(po.status)}
                          </td>
                          <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenPoDetails(po)}
                                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-[10px] font-bold border border-stone-200 transition-colors"
                              >
                                View PO
                              </button>
                              
                              {po.status === 'Acknowledged' && (
                                <button
                                  onClick={() => handleOpenAsnForm(po)}
                                  className="px-2 py-1 bg-white border border-stone-300 text-stone-800 hover:bg-orange-500 hover:text-white hover:border-orange-500 rounded-md text-[10px] font-bold transition-colors"
                                >
                                  Create ASN
                                </button>
                              )}

                              <button
                                onClick={(e) => handleOpenDrawer(e, po)}
                                className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
                                title="Chat / Raise Issue"
                              >
                                <MessageSquare className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-between bg-stone-50 text-stone-500 text-xs font-semibold">
                  <div>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPOs.length)} of {filteredPOs.length} purchase orders
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="px-2.5 py-1 bg-white border border-stone-300 hover:bg-stone-50 rounded-md text-stone-700 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold transition-colors"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`size-7 rounded-md font-bold text-xs flex items-center justify-center transition-colors border ${currentPage === page ? 'bg-stone-850 text-stone-700 border-stone-850' : 'bg-white border-stone-300 hover:bg-stone-50 text-stone-700'}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="px-2.5 py-1 bg-white border border-stone-300 hover:bg-stone-50 rounded-md text-stone-700 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* SCREEN 1: GOODS RECEIPTS (MIGO) MONITOR TAB                      */}
      {/* ================================================================= */}
      {currentView === 'list' && poSubTab === 'grn' && (
        <div className="space-y-4">
          <div className="bg-white p-4 border border-stone-200 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Goods Receipt Notes (GRN) Registry</h3>
              <p className="text-xs text-stone-500">View and track MIGO post logs synchronized automatically from stores inspections.</p>
            </div>
            <div className="text-xs text-stone-500 font-semibold font-mono">
              Total Inbound Documents: {cleanGrns.length}
            </div>
          </div>

          {cleanGrns.length === 0 ? (
            <div className="p-12 rounded-xl border border-stone-250 bg-white text-center shadow-sm">
              <Truck className="size-12 mx-auto text-stone-300 mb-4 animate-bounce-slow" />
              <h4 className="text-sm font-bold text-stone-700">No Goods Receipts Registered</h4>
              <p className="text-xs text-stone-450 mt-1 max-w-sm mx-auto">
                Once you submit an ASN, the warehouse team performs check-ins and quality inspections (Movement Type 101). The synced GRN will appear here within 10 seconds.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {cleanGrns.map(grn => {
                if (!grn) return null;
                const po = cleanPOs.find(p => p.id === grn.poId);
                const hasRejections = (grn.items || []).some(i => i.rejectedQuantity > 0);
                const acceptedCount = (grn.items || []).reduce((s, i) => s + (i.acceptedQuantity || 0), 0);
                const rejectedCount = (grn.items || []).reduce((s, i) => s + (i.rejectedQuantity || 0), 0);
                
                return (
                  <div
                    key={grn.id}
                    onClick={() => handleOpenGrnDetails(grn)}
                    className="p-4 bg-white border border-stone-200 hover:border-stone-400 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900 font-mono bg-stone-50 border border-stone-200 px-2 py-0.5 rounded">
                          {grn.id}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          SAP Doc: {grn.sapMigoDoc}
                        </span>
                        {hasRejections ? (
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[9px] font-bold flex items-center gap-1">
                            <AlertTriangle className="size-3" /> QC Discrepancy
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 text-[9px] font-bold flex items-center gap-1">
                            <Check className="size-3" /> QC Passed
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[10px] text-stone-450 font-bold">
                        <span>PO Ref: {grn.poId}</span>
                        <span>&bull;</span>
                        <span>Posting Date: {grn.postingDate}</span>
                        <span>&bull;</span>
                        <span>Inspector: {grn.receivedBy}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between border-t border-stone-100 pt-3 sm:border-t-0 sm:pt-0">
                      <div className="text-right">
                        <p className="text-[10px] text-stone-400 font-bold uppercase">Accepted / Rejected</p>
                        <p className="text-xs font-bold text-stone-885 font-mono">
                          {acceptedCount} units / <span className={rejectedCount > 0 ? 'text-red-650 font-extrabold' : 'text-stone-400'}>{rejectedCount} rejected</span>
                        </p>
                      </div>
                      <ChevronRight className="size-5 text-stone-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* SCREEN 1: INVOICE READY (MIRO) MONITOR TAB                       */}
      {/* ================================================================= */}
      {currentView === 'list' && poSubTab === 'invoice' && (
        <div className="space-y-4">
          <div className="bg-white p-4 border border-stone-200 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">MIRO Invoice Eligibility Portal</h3>
              <p className="text-xs text-stone-500">Select verified warehouse receipts that are pending financial billing. Pre-fills lines automatically.</p>
            </div>
            <div className="text-xs text-stone-500 font-semibold font-mono bg-stone-50 border border-stone-200 px-2.5 py-1 rounded">
              Awaiting Billing: {cleanGrns.filter(g => !g.invoiceSubmitted).length} docs
            </div>
          </div>

          {cleanGrns.filter(g => !g.invoiceSubmitted).length === 0 ? (
            <div className="p-12 rounded-xl border border-stone-250 bg-white text-center shadow-sm">
              <FileCheck className="size-12 mx-auto text-stone-300 mb-4 animate-bounce-slow" />
              <h4 className="text-sm font-bold text-stone-700">No Pending Receipts for Invoicing</h4>
              <p className="text-xs text-stone-450 mt-1 max-w-sm mx-auto">
                Once goods receipts are posted by the warehouse and accepted, they will show up here as &quot;Invoice Ready&quot;. If all are billed, verify under Invoices Registry.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {cleanGrns.filter(g => !g.invoiceSubmitted).map(grn => {
                if (!grn) return null;
                const po = cleanPOs.find(p => p.id === grn.poId);
                const itemsCount = (grn.items || []).length;
                const acceptedTotal = (grn.items || []).reduce((s, i) => s + (i.acceptedQuantity || 0), 0);
                
                return (
                  <div
                    key={grn.id}
                    onClick={() => handleOpenInvoiceDetail(grn)}
                    className="p-4 bg-white border border-stone-200 hover:border-amber-300 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-800 font-mono bg-amber-50 border border-amber-250 px-2 py-0.5 rounded">
                          {grn.id}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          MIGO reference: {grn.sapMigoDoc}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold">
                          Ready for MIRO Posting
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[10px] text-stone-450 font-bold">
                        <span>PO Ref: {grn.poId}</span>
                        <span>&bull;</span>
                        <span>Receipt Date: {grn.postingDate}</span>
                        <span>&bull;</span>
                        <span>Billed To: Plant {po?.plant || '1000'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between border-t border-stone-100 pt-3 sm:border-t-0 sm:pt-0">
                      <div className="text-right">
                        <p className="text-[10px] text-stone-400 font-bold uppercase">Accepted Quantity</p>
                        <p className="text-xs font-bold text-stone-800 font-mono">
                          {acceptedTotal} units ({itemsCount} lines)
                        </p>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInvoiceDetail(grn);
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] h-8 px-4 rounded-lg flex items-center gap-1 shadow-sm transition-colors border border-amber-650"
                      >
                        <span>MIRO Invoice</span>
                        <ChevronRight className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* SCREEN 2: PO DETAIL / OBJECT PAGE                                */}
      {/* ================================================================= */}
      {currentView === 'detail' && activePo && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Block & Back button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div className="space-y-1.5">
              <button
                onClick={() => setCurrentView('list')}
                className="flex items-center gap-2 text-stone-500 hover:text-stone-900 text-xs font-bold transition-colors cursor-pointer w-fit"
              >
                <ArrowLeft className="size-4" />
                <span>Back to PO Ledger</span>
              </button>
              <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2.5">
                <span>Purchase Order: {activePo.id}</span>
                {renderStatusChip(activePo.status)}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Business vs SAP View toggle removed */}

              <Button
                onClick={(e) => handleOpenDrawer(e, activePo)}
                variant="outline"
                className="border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <MessageSquare className="size-4 text-stone-400" />
                <span>Chat</span>
              </Button>
              {activePo.status === 'Open' && (
                <Button
                  onClick={() => acknowledgePO(activePo.id)}
                  className="bg-white border border-stone-300 text-stone-800 hover:bg-orange-500 hover:text-white hover:border-orange-500 font-bold text-xs rounded-lg px-4 transition-all duration-150"
                >
                  Acknowledge Purchase Order
                </Button>
              )}
            </div>
          </div>

          {/* TAB HEADERS */}
          <div className="flex items-center gap-6 border-b border-stone-200">
            {[
              { id: 'po_detail', label: '1. PO Detail View' },
              { id: 'create_asn', label: '2. Create ASN' },
              { id: 'grn_status', label: '3. GRN Status' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setDetailTab(t.id)}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  detailTab === t.id 
                    ? 'border-stone-800 text-stone-900' 
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="bg-stone-50/30 p-1 rounded-xl">
            {/* TAB 1: PO Detail View */}
            {detailTab === 'po_detail' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <EnterpriseFieldCard label="PO Number" icon={ShoppingBag} accentColor="bg-blue-600">
                    <span className="font-mono text-stone-850 font-bold text-sm select-all">
                      {activePo.id}
                    </span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="PO Date" icon={Calendar} accentColor="bg-blue-600">
                    <span className="font-mono text-stone-850 font-bold text-sm">
                      {formatDate(activePo.createdDate)}
                    </span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="PO Status" icon={CheckCircle2} accentColor="bg-emerald-600">
                    <span className="font-bold text-stone-850 text-sm">
                      {activePo.status === 'Open' ? 'Open' : activePo.status === 'Acknowledged' ? 'Acknowledged' : 'Closed'}
                    </span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Buyer Company" icon={Building2} accentColor="bg-indigo-600">
                    <span className="font-bold text-stone-850 text-sm">
                      {activePo.companyCode || '1000'}
                    </span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Buyer GSTIN" icon={Receipt} accentColor="bg-indigo-600">
                    <span className="font-mono text-stone-850 font-bold text-xs">
                      {activePo.buyerGstin || '27AABCB1234F1Z5'}
                    </span>
                  </EnterpriseFieldCard>

                  <EnterpriseFieldCard label="Plant / Location" icon={MapPin} accentColor="bg-indigo-600">
                    <span className="font-bold text-stone-850 text-xs font-sans">
                      {activePo.plant || 'PL01'} (Mumbai Plant)
                    </span>
                  </EnterpriseFieldCard>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-2">
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      PO Line Items
                    </h4>
                    
                    {/* Carousel Navigation Controls */}
                    {activePo.items && activePo.items.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={activeLineIdx === 0}
                          onClick={() => setActiveLineIdx(prev => Math.max(0, prev - 1))}
                          className="p-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white text-stone-700 cursor-pointer transition-colors"
                        >
                          <ChevronLeft className="size-4" />
                        </button>
                        <span className="text-xs font-semibold text-stone-600 font-mono select-none">
                          Page {activeLineIdx + 1} of {Math.max(1, Math.ceil(activePo.items.length / 5))}
                        </span>
                        <button
                          type="button"
                          disabled={activeLineIdx >= Math.ceil(activePo.items.length / 5) - 1}
                          onClick={() => setActiveLineIdx(prev => Math.min(Math.ceil(activePo.items.length / 5) - 1, prev + 1))}
                          className="p-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white text-stone-700 cursor-pointer transition-colors"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {activePo.items && activePo.items.length > 0 && (
                    <div className="w-full space-y-4">
                      {/* Responsive Table Container */}
                      <div className="w-full overflow-x-auto border border-stone-200 rounded-lg bg-white shadow-xs">
                        <table className="w-full text-xs text-left border-collapse min-w-[900px]">
                          <thead>
                            <tr className="bg-stone-50/75 border-b border-stone-200 text-stone-700 font-bold uppercase text-[10px] tracking-wider font-sans">
                              <th className="py-2 px-3 border-r border-stone-200 w-16">Line</th>
                              <th className="py-2 px-3 border-r border-stone-200 w-36">Material Code</th>
                              <th className="py-2 px-3 border-r border-stone-200 min-w-[200px]">Description</th>
                              <th className="py-2 px-3 border-r border-stone-200 w-28 text-right">Ordered Qty</th>
                              <th className="py-2 px-3 border-r border-stone-200 w-20">UoM</th>
                              <th className="py-2 px-3 border-r border-stone-200 w-32 text-right">Net Price</th>
                              <th className="py-2 px-3 border-r border-stone-200 w-28">GST Tax Code</th>
                              <th className="py-2 px-3 border-r border-stone-200 w-36">Delivery Date</th>
                              <th className="py-2 px-3 text-right w-36">Line Net Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-200">
                            {activePo.items.slice(activeLineIdx * 5, activeLineIdx * 5 + 5).map((item, idx) => {
                              return (
                                <tr key={item.line || idx} className="hover:bg-stone-50/50 transition-colors">
                                  <td className="py-2 px-3 border-r border-stone-200 text-stone-600 font-semibold font-mono">{item.line}</td>
                                  <td className="py-2 px-3 border-r border-stone-200">
                                    <span className="text-blue-600 font-bold hover:underline cursor-pointer">{item.materialCode}</span>
                                  </td>
                                  <td className="py-2 px-3 border-r border-stone-200 text-stone-800 font-sans font-medium">{item.description}</td>
                                  <td className="py-2 px-3 border-r border-stone-200 font-bold text-stone-900 text-right font-mono">{item.quantity}</td>
                                  <td className="py-2 px-3 border-r border-stone-200 text-stone-600 font-medium">{item.uom || 'EA'}</td>
                                  <td className="py-2 px-3 border-r border-stone-200 font-bold text-stone-900 text-right font-mono">₹ {item.unitPrice.toLocaleString()}.00</td>
                                  <td className="py-2 px-3 border-r border-stone-200 text-stone-600 font-medium">G1 (18%)</td>
                                  <td className="py-2 px-3 border-r border-stone-200 font-medium font-mono text-stone-700">{formatDate(item.deliveryDate || activePo.createdDate)}</td>
                                  <td className="py-2 px-3 font-bold text-stone-900 text-right font-mono">₹ {item.netValue.toLocaleString()}.00</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Bullet page indicators */}
                      {Math.ceil(activePo.items.length / 5) > 1 && (
                        <div className="flex justify-center items-center gap-1.5 mt-3 select-none">
                          {Array.from({ length: Math.ceil(activePo.items.length / 5) }).map((_, dotIdx) => (
                            <button
                              key={dotIdx}
                              type="button"
                              onClick={() => setActiveLineIdx(dotIdx)}
                              className={`size-2 rounded-full transition-all duration-150 cursor-pointer ${
                                activeLineIdx === dotIdx 
                                  ? 'bg-stone-800 w-4.5' 
                                  : 'bg-stone-300 hover:bg-stone-400'
                              }`}
                              title={`Go to page ${dotIdx + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Create ASN */}
            {detailTab === 'create_asn' && (
              <div className="space-y-6 animate-fade-in">
                {activePo.status === 'Open' ? (
                  <div className="p-6 border border-stone-200 bg-white rounded-xl shadow-sm text-center">
                    <AlertTriangle className="size-8 text-amber-500 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-stone-800">PO Acknowledgement Required</h4>
                    <p className="text-xs text-stone-500 mt-1">
                      You must acknowledge this purchase order before you can create an Inbound ASN Delivery.
                    </p>
                    <Button
                      onClick={() => acknowledgePO(activePo.id)}
                      className="mt-4 bg-white border border-stone-300 text-stone-800 hover:bg-orange-500 hover:text-white hover:border-orange-500 font-bold text-xs rounded-lg px-6 transition-all duration-150"
                    >
                      Acknowledge PO
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-white border border-stone-200 rounded-xl flex items-center justify-between shadow-sm">
                      <div>
                        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Advanced Shipping Notice Form (VL31N)</h4>
                        <p className="text-[10px] text-stone-500 font-medium mt-0.5">Provide actual shipment details and dispatch quantities</p>
                      </div>
                      <Button
                        onClick={handleAsnSubmitClick}
                        className="bg-stone-850 hover:bg-black text-stone-700 hover:text-white font-bold text-xs rounded-lg px-6"
                      >
                        Submit Inbound Delivery
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <EnterpriseFieldCard label="Linked PO Number" required icon={ShoppingBag} accentColor="bg-blue-600">
                        <input
                          type="text"
                          readOnly
                          value={activePo.id}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs outline-none text-stone-700 font-mono font-bold select-none cursor-not-allowed h-8"
                        />
                      </EnterpriseFieldCard>

                      <EnterpriseFieldCard label="Dispatch Date" required icon={Calendar} accentColor="bg-blue-600">
                        <input
                          type="date"
                          required
                          value={asnForm.shipDate}
                          onChange={e => setAsnForm({ ...asnForm, shipDate: e.target.value })}
                          className="w-full bg-white border border-stone-300 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none text-stone-900 font-mono font-bold h-8"
                        />
                      </EnterpriseFieldCard>

                      <EnterpriseFieldCard label="Expected Delivery" required icon={Calendar} accentColor="bg-blue-600">
                        <input
                          type="date"
                          required
                          value={asnForm.estimatedDeliveryDate}
                          onChange={e => setAsnForm({ ...asnForm, estimatedDeliveryDate: e.target.value })}
                          className="w-full bg-white border border-stone-300 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none text-stone-900 font-mono font-bold h-8"
                        />
                      </EnterpriseFieldCard>

                      <EnterpriseFieldCard label="Carrier / Transporter" required icon={Truck} accentColor="bg-indigo-600">
                        <input
                          type="text"
                          required
                          value={asnForm.carrierName}
                          onChange={e => setAsnForm({ ...asnForm, carrierName: e.target.value })}
                          placeholder="e.g. DHL Express"
                          className="w-full bg-white border border-stone-300 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none text-stone-900 font-bold h-8"
                        />
                      </EnterpriseFieldCard>

                      <EnterpriseFieldCard label="Vehicle / Tracking No." icon={Truck} accentColor="bg-indigo-600">
                        <input
                          type="text"
                          value={asnForm.vehicleNumber}
                          onChange={e => setAsnForm({ ...asnForm, vehicleNumber: e.target.value })}
                          placeholder="e.g. MH-12-XY-4321"
                          className="w-full bg-white border border-stone-300 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none text-stone-900 font-mono font-bold uppercase h-8"
                        />
                      </EnterpriseFieldCard>

                      <EnterpriseFieldCard label="E-Way Bill Number" icon={Receipt} accentColor="bg-indigo-600">
                        <input
                          type="text"
                          maxLength={12}
                          value={ewayBillNo}
                          onChange={e => setEwayBillNo(e.target.value.replace(/\D/g, ''))}
                          placeholder="12-digit numeric code"
                          className="w-full bg-white border border-stone-300 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none text-stone-900 font-mono font-bold h-8"
                        />
                      </EnterpriseFieldCard>
                    </div>

                    {/* ASN Document Attachments */}
                    <div className="space-y-3 mt-6">
                      <h4 className="text-xs font-bold text-stone-850 uppercase tracking-wider border-b border-stone-200 pb-1.5 flex items-center justify-between">
                        <span>Shipment Document Attachments</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FileUploadZone
                          label="Packing List (Optional)"
                          value={asnDocs.packingList}
                          onUploadComplete={result => setAsnDocs(prev => ({ ...prev, packingList: result }))}
                          onFileRemoved={() => setAsnDocs(prev => ({ ...prev, packingList: null }))}
                          linkedTo="ASN"
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        />
                        <FileUploadZone
                          label="Invoice Copy (Optional)"
                          value={asnDocs.invoiceCopy}
                          onUploadComplete={result => setAsnDocs(prev => ({ ...prev, invoiceCopy: result }))}
                          onFileRemoved={() => setAsnDocs(prev => ({ ...prev, invoiceCopy: null }))}
                          linkedTo="ASN"
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        />
                        <FileUploadZone
                          label="Transport Bill / LR (Optional)"
                          value={asnDocs.transportDoc}
                          onUploadComplete={result => setAsnDocs(prev => ({ ...prev, transportDoc: result }))}
                          onFileRemoved={() => setAsnDocs(prev => ({ ...prev, transportDoc: null }))}
                          linkedTo="ASN"
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        />
                      </div>
                    </div>

                    {/* Dispatch quantities allocation */}
                    <div className="space-y-3.5 mt-6">
                      <h4 className="text-xs font-bold text-stone-850 uppercase tracking-wider border-b border-stone-200 pb-1.5 flex items-center justify-between">
                        <span>Dispatch Qty Allocation</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(activePo.items || []).map((item, idx) => {
                          const remaining = item.quantity - (item.grnQuantity || 0);
                          const error = validationErrors[item.line];
                          return (
                            <div key={idx} className="p-4 border border-stone-200 bg-white rounded-xl space-y-3 shadow-sm">
                              <div className="flex justify-between items-start border-b border-stone-100 pb-1.5">
                                <p className="text-xs font-bold text-stone-900">{item.description}</p>
                                <span className="bg-stone-50 border border-stone-200 text-stone-600 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                                  Remaining: {remaining} {item.uom}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                <EnterpriseFieldCard label="Line Item" icon={FileText} accentColor="bg-stone-400">
                                  <input
                                    type="text"
                                    readOnly
                                    value={item.line}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs outline-none text-stone-500 font-mono text-right select-none h-8"
                                  />
                                </EnterpriseFieldCard>

                                <EnterpriseFieldCard label="Dispatched Qty" icon={Percent} accentColor="bg-blue-600">
                                  <input
                                    type="number"
                                    value={dispatchQuantities[item.line] || ''}
                                    onChange={e => {
                                      const val = e.target.value;
                                      setDispatchQuantities(prev => ({
                                        ...prev,
                                        [item.line]: val
                                      }));
                                      setAsnForm(prev => ({
                                        ...prev,
                                        items: {
                                          ...prev.items,
                                          [item.line]: val
                                        }
                                      }));
                                    }}
                                    className="w-full bg-white border border-stone-300 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs text-right font-mono font-normal outline-none h-8"
                                  />
                                </EnterpriseFieldCard>

                                <EnterpriseFieldCard label="UoM" icon={Filter} accentColor="bg-stone-400">
                                  <input
                                    type="text"
                                    readOnly
                                    value={item.uom}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs outline-none text-stone-500 font-mono text-center select-none h-8"
                                  />
                                </EnterpriseFieldCard>
                              </div>

                              {error && (
                                <p className="text-[10px] text-red-650 font-semibold flex items-center gap-1.5">
                                  <AlertTriangle className="size-3 shrink-0" />
                                  <span>{error}</span>
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: GRN Status */}
            {detailTab === 'grn_status' && (
              <div className="space-y-6 animate-fade-in">
                {(() => {
                  const grn = cleanGrns.find(g => g.poId === activePo.id);
                  const activeAsn = cleanAsns.find(a => a.poId === activePo.id) || (asnSuccessInfo?.poId === activePo.id ? asnSuccessInfo : null);
                  if (!grn) {
                    if (activePo.status === 'Dispatched') {
                      return (
                        <div className="p-6 border border-amber-200 bg-amber-50/50 rounded-xl space-y-4 max-w-xl mx-auto shadow-sm animate-fade-in text-stone-700">
                          <div className="text-center space-y-2">
                            <div className="size-12 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                              <Check className="size-6 animate-pulse" />
                            </div>
                            <h4 className="text-sm font-bold text-amber-850">ASN Dispatch Submitted Successfully</h4>
                            <p className="text-xs text-stone-500 max-w-md mx-auto leading-normal">
                              Logistics dispatch details successfully transmitted via SAP BAPI (`BAPI_DELIVERY_CREATE_DN`).
                            </p>
                          </div>

                          <div className="p-4 bg-white border border-amber-250/60 rounded-xl text-xs space-y-3.5 shadow-sm">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-left font-mono">
                              <div>
                                <span className="text-[9px] text-stone-400 font-bold uppercase block font-sans">ASN Reference ID</span>
                                <span className="font-bold text-stone-900 text-xs select-all">
                                  {activeAsn?.id || activeAsn?.asnId || 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] text-stone-400 font-bold uppercase block font-sans">SAP Delivery Note ID</span>
                                <span className="font-bold text-stone-900 text-xs select-all">
                                  {activeAsn?.sapInboundDelivery || activeAsn?.sapInbound || 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] text-stone-400 font-bold uppercase block font-sans">Carrier / Transporter</span>
                                <span className="font-bold text-stone-700 text-xs font-sans">
                                  {activeAsn?.carrierName || 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] text-stone-400 font-bold uppercase block font-sans">Tracking / Vehicle No</span>
                                <span className="font-bold text-stone-700 text-xs">
                                  {activeAsn?.trackingNumber || activeAsn?.vehicleNumber || 'N/A'}
                                </span>
                              </div>
                            </div>

                            <div className="border-t border-stone-100 pt-3 flex items-center justify-between bg-stone-50/50 p-2.5 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Truck className="size-4.5 text-amber-500 animate-bounce" />
                                <span className="font-semibold text-stone-600 font-sans">Warehouse MIGO receipt simulation:</span>
                              </div>
                              <span className="text-amber-600 animate-pulse font-bold font-mono text-sm">
                                {countdown[activePo.id] !== undefined ? `${countdown[activePo.id]}s` : '10s'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="p-6 border border-stone-200 bg-white rounded-xl shadow-sm text-center">
                        <AlertTriangle className="size-8 text-stone-400 mx-auto mb-2" />
                        <h4 className="text-xs font-bold text-stone-700">Goods Receipt Not Synced</h4>
                        <p className="text-xs text-stone-500 mt-1">
                          Please prepare and submit ASN shipment dispatch (Tab 2) first to initiate delivery sync.
                        </p>
                      </div>
                    );
                  }

                  // GRN exists!
                  return (
                    <div className="space-y-6">
                      <div className="p-4 bg-white border border-stone-200 rounded-xl flex items-center justify-between shadow-sm">
                        <div>
                          <h4 className="text-xs font-bold text-stone-850 uppercase tracking-wider">SAP Goods Receipt Note (MIGO 101)</h4>
                          <p className="text-[10px] text-stone-500 font-medium mt-0.5">Inspected & cleared by warehouse stores division</p>
                        </div>
                        {!grn.invoiceSubmitted ? (
                          <Button
                            onClick={() => handleOpenInvoiceDetail(grn)}
                            className="bg-white border border-stone-300 text-stone-800 hover:bg-orange-500 hover:text-white hover:border-orange-500 font-bold text-xs rounded-lg px-5 shadow-sm flex items-center gap-1.5 transition-all duration-150"
                          >
                            <span>Proceed with Invoice</span>
                            <ChevronRight className="size-3.5" />
                          </Button>
                        ) : (
                          <span className="px-3 py-1 rounded bg-stone-100 text-stone-700 border border-stone-200 text-xs font-bold font-mono">
                            Invoice Posted (MIRO complete)
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <EnterpriseFieldCard label="GRN / Material Doc No." icon={FileText} accentColor="bg-blue-600">
                          <span className="font-mono text-stone-850 font-bold text-sm select-all">
                            {grn.sapMigoDoc}
                          </span>
                        </EnterpriseFieldCard>

                        <EnterpriseFieldCard label="Posting Date" icon={Calendar} accentColor="bg-blue-600">
                          <span className="font-mono text-stone-850 font-bold text-sm">
                            {grn.postingDate}
                          </span>
                        </EnterpriseFieldCard>

                        <EnterpriseFieldCard label="Movement Type" icon={Truck} accentColor="bg-indigo-600">
                          <span className="font-bold text-stone-850 text-sm">
                            101
                          </span>
                        </EnterpriseFieldCard>
                      </div>

                      {/* Line Status Itemization */}
                      <div className="space-y-3.5 mt-6">
                        <h4 className="text-xs font-bold text-stone-850 uppercase tracking-wider border-b border-stone-200 pb-1.5">
                          GRN Line Items & QC Status
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(grn.items || []).map((item, idx) => (
                            <div key={idx} className="p-4 border border-stone-200 bg-white rounded-xl space-y-3 shadow-sm">
                              <div className="flex justify-between items-start border-b border-stone-100 pb-1.5">
                                <div>
                                  <p className="text-xs font-bold text-stone-900">{item.description}</p>
                                  <span className="text-[9px] text-stone-400 font-mono block mt-0.5">{item.materialCode}</span>
                                </div>
                                <span className="bg-stone-50 border border-stone-200 text-stone-600 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                                  Line {item.line}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                <EnterpriseFieldCard label="Accepted Qty" icon={CheckCircle2} accentColor="bg-emerald-600">
                                  <span className="font-normal text-green-700 text-xs font-mono text-right block">
                                    {item.acceptedQuantity} units
                                  </span>
                                </EnterpriseFieldCard>

                                <EnterpriseFieldCard label="Rejected Qty" icon={AlertTriangle} accentColor="bg-red-500">
                                  <span className={`font-normal text-xs font-mono text-right block ${item.rejectedQuantity > 0 ? 'text-red-650 font-semibold' : 'text-stone-500'}`}>
                                    {item.rejectedQuantity || 0} units
                                  </span>
                                </EnterpriseFieldCard>

                                <EnterpriseFieldCard label="Quality Status" icon={ShieldCheck} accentColor="bg-stone-500">
                                  <span className="font-normal text-stone-850 font-bold text-xs text-center block uppercase">
                                    Q
                                  </span>
                                </EnterpriseFieldCard>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SCREEN 5: INVOICE ELIGIBILITY PAGE (MIRO PREFILLED VIEW) ==================== */}
      {currentView === 'invoice_detail' && activeGrn && activePo && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setCurrentView('list'); setPoSubTab('invoice'); }}
              className="flex items-center gap-2 text-stone-500 hover:text-stone-900 text-xs font-bold transition-colors cursor-pointer w-fit"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Invoice Ready List</span>
            </button>
          </div>

          {/* Success Post view */}
          {invoicePostedSuccess ? (
            <div className="bg-white border border-stone-200 rounded-xl p-8 shadow-md text-center max-w-md mx-auto space-y-6">
              <div className="size-16 bg-green-50 border-2 border-green-500 rounded-full flex items-center justify-center text-green-600 mx-auto">
                <Check className="size-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900">MIRO Invoice Posted Successfully</h3>
                <p className="text-xs text-stone-500">BAPI_INCOMINGINVOICE_CREATE matched &amp; posted in SAP ledger</p>
              </div>
              
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono font-bold text-stone-700 text-left space-y-1">
                <p>PO Reference: {activePo.id}</p>
                <p>GRN Reference: {activeGrn.id}</p>
                <p>Invoice Doc Reference: {vendorInvoiceNo.toUpperCase()}</p>
                <p>SAP MIRO Doc: 510560{String(activeGrn?.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 9000 + 1000}</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 leading-normal font-semibold text-left">
                💳 The invoice is now posted. SAP payment run (F110 RTGS/NEFT batch) is simulated weekly. The invoice status will update to Paid within 12 seconds automatically.
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => {
                    setActiveTab('invoices');
                  }}
                  className="bg-stone-850 hover:bg-black text-stone-700 hover:text-white font-bold text-xs rounded-lg px-4"
                >
                  Go to Invoices Registry
                </Button>
                <Button
                  onClick={() => {
                    setCurrentView('list');
                    setPoSubTab('list');
                  }}
                  variant="outline"
                  className="border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold rounded-lg px-4"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Notice Banner */}
              <div className="bg-emerald-50 border border-emerald-250 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="size-5 text-emerald-650 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-800 text-xs uppercase tracking-wider">3-Way Match Verification Complete</h4>
                  <p className="text-emerald-750 text-xs mt-1 leading-normal font-semibold">
                    Purchase Order quantities, Unit prices, and Warehouse Goods Receipt (MIGO) accepted counts match perfectly. You are eligible to post MIRO billing for this receipt.
                  </p>
                </div>
              </div>

              {/* Prefilled Fields Section */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-stone-850 uppercase border-b border-stone-100 pb-2">Prefilled Header Parameters</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Vendor Code</span>
                    <span className="font-semibold text-stone-700">{state?.profile?.sapVendorCode || 'VND-4001'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Vendor Name</span>
                    <span className="font-semibold text-stone-700">{state?.profile?.companyName || 'Your Firm'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">PO Reference</span>
                    <span className="font-mono font-bold text-stone-700">{activePo.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">GRN Document</span>
                    <span className="font-mono font-bold text-stone-700">{activeGrn.id} (SAP MIGO: {activeGrn.sapMigoDoc})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Tax Scheme</span>
                    <span className="font-semibold text-stone-700">GST 18% (G1 code)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Payment Terms</span>
                    <span className="font-semibold text-stone-700">{activePo.paymentTerms}</span>
                  </div>
                </div>
              </div>

              {/* Form Entry Block */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Billing items grid (8 cols) */}
                <div className="lg:col-span-8 bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-stone-850 uppercase border-b border-stone-100 pb-2">Billed Line Allocation</h3>
                  
                  <div className="border border-stone-200 rounded-lg overflow-hidden bg-stone-50/10">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold text-[9px] uppercase tracking-wider">
                          <th className="py-2.5 px-3">Line</th>
                          <th className="py-2.5 px-3">Material & Description</th>
                          <th className="py-2.5 px-3 text-right">Billed Qty</th>
                          <th className="py-2.5 px-3 text-right font-mono">Unit Price</th>
                          <th className="py-2.5 px-3 text-right">GST Tax</th>
                          <th className="py-2.5 px-3 text-right">Total Net Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-700">
                        {(activeGrn.items || []).map(item => {
                          const poItem = activePo?.items?.find(pi => pi.line === item.line);
                          const unitPrice = poItem?.unitPrice || 0;
                          const netValue = item.acceptedQuantity * unitPrice;
                          
                          return (
                            <tr key={item.line} className="hover:bg-stone-50/20">
                              <td className="py-3 px-3 font-mono text-stone-400">{item.line}</td>
                              <td className="py-3 px-3">
                                <p className="font-semibold text-stone-900">{item.description}</p>
                                <p className="text-[10px] text-stone-450 font-mono mt-0.5">{item.materialCode}</p>
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800 bg-emerald-50/20">
                                {item.acceptedQuantity} {poItem?.uom || 'EA'}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-stone-600">₹ {unitPrice.toLocaleString()}.00</td>
                              <td className="py-3 px-3 text-right font-mono text-stone-500">18% (G1)</td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">
                                ₹ {netValue.toLocaleString()}.00
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Manual Billing Inputs */}
                  <div className="border-t border-stone-100 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <EnterpriseFieldCard label="Vendor Tax Invoice No." required icon={FileText} accentColor="bg-blue-600">
                        <input
                          type="text"
                          value={vendorInvoiceNo}
                          onChange={e => setVendorInvoiceNo(e.target.value)}
                          placeholder="e.g. INV-2026-8890"
                          className="w-full bg-white border border-stone-300 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none text-stone-900 font-mono font-bold uppercase h-8"
                        />
                      </EnterpriseFieldCard>

                      <EnterpriseFieldCard label="Invoice Date" required icon={Calendar} accentColor="bg-blue-600">
                        <input
                          type="date"
                          value={billingDate}
                          onChange={e => setBillingDate(e.target.value)}
                          className="w-full bg-white border border-stone-300 focus:border-stone-500 rounded-lg px-2.5 py-1 text-xs outline-none text-stone-900 font-mono font-bold h-8"
                        />
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>

                {/* Summary calculation card (4 cols) */}
                <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-stone-850 uppercase border-b border-stone-100 pb-2">Invoice Summary</h3>
                  
                  {(() => {
                    const subtotal = (activeGrn.items || []).reduce((sum, item) => {
                      const poItem = activePo?.items?.find(pi => pi.line === item.line);
                      const unitPrice = poItem?.unitPrice || 0;
                      return sum + item.acceptedQuantity * unitPrice;
                    }, 0);
                    const gst = Number((subtotal * 0.18).toFixed(2));
                    const total = subtotal + gst;
                    
                    return (
                      <div className="space-y-4 text-xs">
                        <div className="space-y-2 text-stone-500 font-semibold">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-mono text-stone-700">₹ {subtotal.toLocaleString()}.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>GST Tax (18% G1)</span>
                            <span className="font-mono text-stone-700">₹ {gst.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Freight charges</span>
                            <span className="font-mono text-stone-700">₹ 0.00</span>
                          </div>
                        </div>

                        <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                          <span className="font-bold text-stone-800 text-sm">Grand Gross Value</span>
                          <span className="text-lg font-bold text-stone-950 font-mono">
                            ₹ {total.toLocaleString()}
                          </span>
                        </div>

                        <div className="pt-2">
                          <Button
                            disabled={isPostingInvoice}
                            onClick={handleMiroInvoicePost}
                            className="w-full bg-white border border-stone-300 text-stone-800 hover:bg-orange-500 hover:text-white hover:border-orange-500 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all duration-150"
                          >
                            {isPostingInvoice ? (
                              <>
                                <RefreshCw className="size-3.5 animate-spin" />
                                <span>Verifying in SAP...</span>
                              </>
                            ) : (
                              <>
                                <FileCheck className="size-4" />
                                <span>Post MIRO Logistics Invoice</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* COLLAPSIBLE RIGHT DRAWER: COMMUNICATION CENTER                   */}
      {/* ================================================================= */}
      {drawerOpen && drawerPo && (
        <div className="fixed inset-0 z-50 overflow-hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-xs transition-opacity animate-fade-in" />
          
          <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex" onClick={e => e.stopPropagation()}>
            <div className="w-screen max-w-md bg-white shadow-xl flex flex-col h-full border-l border-stone-200 animate-slide-left">
              
              {/* Drawer Header */}
              <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                    <MessageSquare className="size-4.5 text-stone-500" />
                    <span>Communication Desk</span>
                  </h3>
                  <p className="text-[10px] text-stone-450 font-mono mt-0.5">PO Ref: {drawerPo.id}</p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-150 rounded-md transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Status control */}
              <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between text-xs bg-stone-50/50">
                <span className="font-bold text-stone-500 uppercase text-[9px] tracking-wider">Issue Status Tag:</span>
                <div className="flex items-center gap-1.5">
                  {['Open', 'In Review', 'Resolved'].map(st => (
                    <button
                      key={st}
                      onClick={() => setPoIssueStatus(prev => ({ ...prev, [drawerPo.id]: st }))}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${poIssueStatus[drawerPo.id] === st ? st === 'Open' ? 'bg-red-50 text-red-700 border-red-200' : st === 'In Review' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-stone-400 border-stone-200 hover:bg-stone-50'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-stone-50/20">
                {(poChats[drawerPo.id] || []).map((msg, idx) => (
                  <div key={idx} className={`flex flex-col gap-1 max-w-[85%] ${msg.sender === 'Vendor' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                    <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                      {msg.sender === 'Vendor' ? 'Your Firm' : 'Amit Sharma (Buyer)'}
                    </span>
                    <div className={`p-3 rounded-2xl border text-xs ${msg.sender === 'Vendor' ? 'bg-stone-900 border-stone-900 text-stone-50 rounded-tr-none' : 'bg-white border-stone-200 text-stone-850 rounded-tl-none shadow-xs'}`}>
                      <p className="leading-relaxed">{msg.message}</p>
                    </div>
                    <span className="text-[8px] text-stone-400 font-mono mt-0.5">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Message Input Footer */}
              <div className="p-4 border-t border-stone-200 bg-white flex gap-2">
                <input
                  type="text"
                  placeholder="Ask buyer a question..."
                  value={chatMessageInput}
                  onChange={e => setChatMessageInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendDrawerMessage()}
                  className="flex-1 bg-stone-50 border border-stone-250 focus:border-stone-400 rounded-lg px-3 py-2 text-xs outline-none text-stone-900 font-medium"
                />
                <button
                  onClick={handleSendDrawerMessage}
                  className="px-3 bg-stone-850 hover:bg-stone-950 text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Send className="size-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      </div>
    </ErrorBoundary>
  );
}
