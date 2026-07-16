import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  FileText,
  Database,
  Settings,
  Layers,
  Percent,
  Calendar,
  Sparkles,
  ClipboardList,
  Search,
  Plus,
  Trash2,
  User,
  Upload,
  X,
  File,
  ChevronDown,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SkeletonLoader from '@/components/shared/SkeletonLoader';
import ErrorBoundary from '@/components/ErrorBoundary';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { rfqStatusVariant } from '@/lib/statusColors';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  // If it's a full ISO string or contains T, split by T
  if (typeof dateStr === 'string' && dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

// --- Redesigned SAP Fiori Components ---
const SectionHeader = ({ title, icon: Icon }) => (
  <div className="col-span-full mb-4 mt-6 first:mt-0">
    <h3 className="text-xs font-extrabold text-text-primary tracking-wider uppercase border-b border-border pb-2 flex items-center gap-2 select-none">
      {Icon && <Icon className="size-4 text-text-secondary shrink-0" />}
      <span>{title}</span>
    </h3>
  </div>
);

const EnterpriseCard = ({ label, required, children, error }) => (
  <div className={`p-4.5 border rounded-xl shadow-xs flex flex-col justify-between min-h-[110px] transition-all duration-200 ${error ? 'border-red-500 ring-1 ring-red-500/50 bg-red-50/5' : 'border-border hover:border-border-em hover:shadow-xs bg-surface'
    }`}>
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-xs font-medium text-text-secondary block select-none">{label} {required && <span className="text-red-500 font-bold select-none ml-0.5">*</span>}</span>
    </div>
    <div className="flex-1 flex items-center w-full">
      {children}
    </div>
  </div>
);

const EnterpriseFieldCard = ({ label, required, error, children, labelWidth = 'sm:w-56', className = '' }) => (
  <div className={`h-full py-1.5 px-3 bg-surface transition-colors duration-150 flex flex-col sm:flex-row sm:items-center gap-3 select-none ${
    error ? 'bg-red-50/10' : 'hover:bg-surface2/30 focus-within:bg-surface2/50'
  } ${className}`}>
    <label className={`text-xs font-bold text-text-secondary shrink-0 whitespace-nowrap select-none block ${labelWidth}`} title={label}>
      {label} {required && <span className="text-red-500 font-bold select-none ml-0.5">*</span>}
    </label>
    <div className="flex-1 w-full min-w-0 flex flex-col justify-center">
      {children}
      {error && (
        <span className="text-[10px] font-bold text-red-600 mt-1 select-none">{error}</span>
      )}
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="p-4.5 bg-surface border border-border rounded-xl flex flex-col justify-between min-h-[140px] animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-3.5 w-24 skeleton" />
      <div className="h-3.5 w-8 skeleton" />
    </div>
    <div className="h-9 w-full skeleton rounded-lg mt-2" />
    <div className="flex justify-between items-center pt-2 mt-3 border-t border-border">
      <div className="flex gap-1.5">
        <div className="h-4.5 w-10 skeleton rounded-full" />
        <div className="h-4.5 w-10 skeleton rounded-full" />
      </div>
      <div className="h-3 w-16 skeleton" />
    </div>
  </div>
);

const getInitialRfqForm = () => ({
  rfqRefNo: '',
  description: '',
  rfqType: 'AN',
  deadlineDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  bindingPeriod: '30',
  paymentTerms: 'NET 30 Days',
  purchasingGroup: '001',
  materialDescription: 'FAST-HEX-M12-050',
  quantityRequired: '10000',
  unitOfMeasure: 'EA',
  currency: 'INR',
  priceBasis: 'Exclusive of Tax',
  vendorType: 'Manufacturer',
  vendorCategory: 'Raw Material',
  plant: 'PL01 - Delhi',
  companyCode: '1000',
  incoterms: 'FOB',
  remarks: 'Please provide best competitive pricing.'
});

const getInitialQuoteForm = () => ({
  rfqId: '',
  selectedLine: 10,
  quoteRef: '',
  quoteDate: new Date().toISOString().split('T')[0],
  validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  unitPrice: '',
  gstRate: '18%',
  discount: '0',
  deliveryLeadTime: '7',
  freight: '0',
  incoterms: 'EXW'
});

export default function RfqView({
  state,
  selectedRfqId,
  setSelectedRfqId,
  handleBidSubmit,
  createRFQ,
  awardVendorBid,
  reissueRFQ,
  cancelRFQ
}) {
  const [isPageLoading, setIsPageLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const isApproved = state.profile.status === 'Approved';
  const currentVendorCode = state.profile.sapVendorCode || 'VND-CURRENT';

  // 1. Role state defaults to procurement (vendor representative role removed)
  const [userRole, setUserRole] = useState('procurement');

  // 2. Tab selector state
  // Procurement tabs: 'monitor', 'me41', 'me47' (Submit Quotation), 'me48'
  const [activeProcTab, setActiveProcTab] = useState('monitor');
  const [listSearch, setListSearch] = useState('');
  const [showRfqList, setShowRfqList] = useState(true);

  // 3. ME41 Create RFQ local form states
  const [rfqForm, rfqFormSet] = useState(getInitialRfqForm);

  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false);

  // 4. ME47 Submit Quotation form states
  const [quoteForm, setQuoteForm] = useState(getInitialQuoteForm);

  const [quoteErrors, setQuoteErrors] = useState({});
  const [isSapMappingActive, setIsSapMappingActive] = useState(false);

  useEffect(() => {
    if (activeProcTab === 'me41' || activeProcTab === 'me47') {
      Promise.resolve().then(() => {
        setTabLoading(true);
      });
      const timer = setTimeout(() => setTabLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [activeProcTab]);

  const materialMasterList = [
    { code: 'FAST-HEX-M12-050', desc: 'Hexagonal Bolt M12 x 50mm Grade 8.8', uom: 'EA', target: 15.50 }
  ];


  const [selectedVendors, setSelectedVendors] = useState(['VND-CURRENT']);

  const vendorMasterList = [
    { id: 'VND-CURRENT', name: state.profile.companyName || 'Your Firm (Current Vendor)', rating: 95, category: 'General Engineering' }
  ];


  const [addedItems, setAddedItems] = useState([
    {
      materialCode: 'FAST-HEX-M12-050',
      description: 'Hexagonal Bolt M12 x 50mm Grade 8.8',
      quantity: 10000,
      uom: 'EA',
      targetPrice: 15.50
    }
  ]);

  const handleAddLineItem = () => {
    if (!rfqForm.materialDescription.trim()) {
      alert('Please enter a material code or description.');
      return;
    }
    if (!rfqForm.quantityRequired || Number(rfqForm.quantityRequired) <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    const matchedMat = materialMasterList.find(
      m => m.code === rfqForm.materialDescription || m.desc === rfqForm.materialDescription
    );
    const matCode = matchedMat ? matchedMat.code : 'MAT-CUSTOM';
    const matDesc = matchedMat ? matchedMat.desc : rfqForm.materialDescription;
    const targetPrice = matchedMat ? matchedMat.target : 100.00;

    const newItem = {
      materialCode: matCode,
      description: matDesc,
      quantity: Number(rfqForm.quantityRequired),
      uom: rfqForm.unitOfMeasure,
      targetPrice
    };

    setAddedItems([...addedItems, newItem]);

    // Clear item inputs
    rfqFormSet(prev => ({
      ...prev,
      materialDescription: '',
      quantityRequired: '',
      unitOfMeasure: 'EA'
    }));
  };

  const handleRemoveLineItem = (indexToRemove) => {
    setAddedItems(addedItems.filter((_, idx) => idx !== indexToRemove));
  };

  // 5. ME48 Quotation Evaluation states
  const [selectedRfqEvalId, setSelectedRfqEvalId] = useState('');
  const [selectedVendorDetailId, setSelectedVendorDetailId] = useState('');
  const [evaluationFilter, setEvaluationFilter] = useState('');

  // 6. ME58 PO Conversion dialog states
  const [isPoConverting, setIsPoConverting] = useState(false);
  const [convertedPoId, setConvertedPoId] = useState('');

  // Submit ME41 RFQ Form
  const handlePublishRFQSubmit = (e) => {
    if (e) e.preventDefault();

    const errors = {};
    if (!rfqForm.rfqRefNo.trim()) errors.rfqRefNo = true;
    if (!rfqForm.description.trim()) errors.description = true;
    if (!rfqForm.deadlineDate) errors.deadlineDate = true;
    if (!rfqForm.bindingPeriod) errors.bindingPeriod = true;
    if (selectedVendors.length === 0) errors.selectedVendors = true;
    if (!rfqForm.purchasingGroup.trim()) errors.purchasingGroup = true;

    let currentAdded = [...addedItems];

    // Auto-add current inputs if list is empty and inputs are valid
    if (currentAdded.length === 0 && rfqForm.materialDescription.trim() && rfqForm.quantityRequired && Number(rfqForm.quantityRequired) > 0) {
      const matchedMat = materialMasterList.find(
        m => m.code === rfqForm.materialDescription || m.desc === rfqForm.materialDescription
      );
      const matCode = matchedMat ? matchedMat.code : 'MAT-CUSTOM';
      const matDesc = matchedMat ? matchedMat.desc : rfqForm.materialDescription;
      const targetPrice = matchedMat ? matchedMat.target : 100.00;

      const newItem = {
        materialCode: matCode,
        description: matDesc,
        quantity: Number(rfqForm.quantityRequired),
        uom: rfqForm.unitOfMeasure,
        targetPrice
      };

      currentAdded = [newItem];
      setAddedItems(currentAdded);

      // Clear item inputs
      rfqFormSet(prev => ({
        ...prev,
        materialDescription: '',
        quantityRequired: '',
        unitOfMeasure: 'EA'
      }));
    }

    if (currentAdded.length === 0) {
      errors.materialDescription = true;
      errors.quantityRequired = true;
      setFormErrors(errors);
      alert('Please add at least one line item to the RFQ.');
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      alert('Please fill in all required fields correctly.');
      return;
    }

    // Open preview dialog first
    setIsPreviewOpen(true);
  };

  const confirmAndPublishRFQ = () => {
    setIsPreviewOpen(false);
    setIsLoading(true);

    setTimeout(() => {
      const invitedList = selectedVendors.map(vid => {
        const vMaster = vendorMasterList.find(vm => vm.id === vid || (vid === 'VND-CURRENT' && vm.id === 'VND-CURRENT'));
        return {
          id: vid === 'VND-CURRENT' ? currentVendorCode : vid,
          name: vMaster ? vMaster.name : 'Unknown Vendor',
          status: 'Pending',
          rating: vMaster ? vMaster.rating : 85
        };
      });

      const items = addedItems.map((item, index) => ({
        line: (index + 1) * 10,
        materialCode: item.materialCode,
        description: item.description,
        quantity: Number(item.quantity),
        uom: item.uom,
        targetPrice: Number(item.targetPrice),
        plant: '1000',
        deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));

      createRFQ({
        id: rfqForm.rfqRefNo,
        description: rfqForm.description,
        rfqType: rfqForm.rfqType,
        deadlineDate: rfqForm.deadlineDate,
        paymentTerms: rfqForm.paymentTerms,
        purchasingGroup: rfqForm.purchasingGroup,
        companyCode: rfqForm.companyCode || '1000',
        purchasingOrg: '1000',
        currency: rfqForm.currency || 'INR',
        incoterms: rfqForm.incoterms || 'FOB',
        deliveryLocation: rfqForm.plant || 'Plant 1000 (Mumbai)',
        notes: `Binding Period: ${rfqForm.bindingPeriod} Days`,
        items: items,
        invitedVendors: invitedList
      });

      setIsLoading(false);

      // Reset Form
      rfqFormSet({
        rfqRefNo: '',
        description: '',
        rfqType: 'AN',
        deadlineDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bindingPeriod: '30',
        paymentTerms: 'NET 30 Days',
        purchasingGroup: '001',
        materialDescription: 'FAST-HEX-M12-050',
        quantityRequired: '10000',
        unitOfMeasure: 'EA',
        currency: 'INR',
        priceBasis: 'Exclusive of Tax',
        vendorType: 'Manufacturer',
        vendorCategory: 'Raw Material',
        plant: 'PL01 - Delhi',
        companyCode: '1000',
        incoterms: 'FOB',
        remarks: 'Please provide best competitive pricing.'
      });
      setAddedItems([
        {
          materialCode: 'FAST-HEX-M12-050',
          description: 'Hexagonal Bolt M12 x 50mm Grade 8.8',
          quantity: 10000,
          uom: 'EA',
          targetPrice: 15.50
        }
      ]);
      setSelectedVendors(['VND-4001', 'VND-4002']);
      setFormErrors({});
      setActiveProcTab('monitor');
      alert(`RFQ ${rfqForm.rfqRefNo} successfully created & published to SAP ERP (ME41).`);
    }, 1500); // 1.5 seconds simulated BAPI posting
  };

  // Submit ME47 Quotation (Submit Quotation Tab)
  const handleQuotationSubmit = (e) => {
    if (e) e.preventDefault();

    const errors = {};
    if (!quoteForm.rfqId) errors.rfqId = true;
    if (!quoteForm.quoteDate) errors.quoteDate = true;
    if (!quoteForm.validityDate) errors.validityDate = true;
    if (!quoteForm.unitPrice || Number(quoteForm.unitPrice) <= 0) errors.unitPrice = true;
    if (!quoteForm.gstRate) errors.gstRate = true;
    if (!quoteForm.deliveryLeadTime || Number(quoteForm.deliveryLeadTime) <= 0) errors.deliveryLeadTime = true;

    if (Object.keys(errors).length > 0) {
      setQuoteErrors(errors);
      alert('Please fill in all required fields correctly.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Structure prices object mapping selected line number to unit price
      const prices = {
        [quoteForm.selectedLine]: Number(quoteForm.unitPrice)
      };

      // Formulate comments/remarks
      const remarks = `Quote Ref: ${quoteForm.quoteRef || 'N/A'} | Discount: ${quoteForm.discount || '0'}% | Incoterms: ${quoteForm.incoterms}`;

      handleBidSubmit(
        quoteForm.rfqId,
        prices,
        Number(quoteForm.deliveryLeadTime),
        remarks,
        quoteForm.gstRate,
        quoteForm.validityDate,
        Number(quoteForm.freight),
        1, // MOQ default
        [] // docs empty
      );

      setIsLoading(false);

      // Reset form
      setQuoteForm({
        rfqId: '',
        selectedLine: 10,
        quoteRef: '',
        quoteDate: new Date().toISOString().split('T')[0],
        validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        unitPrice: '',
        gstRate: '18%',
        discount: '0',
        deliveryLeadTime: '7',
        freight: '0',
        incoterms: 'EXW'
      });
      setQuoteErrors({});
      setActiveProcTab('monitor');
      alert('Quotation submitted and synchronized with SAP Info Records (ME47).');
    }, 1500); // 1.5s simulated posting delay
  };


  // Calculations for ME48 Comparison Matrix
  const getEvaluationData = (rfq) => {
    if (!rfq || !rfq.bids || rfq.bids.length === 0) return null;

    // Calculate total bid value per vendor
    const vendorsAnalysis = rfq.bids.map(bid => {
      let itemsTotal = 0;
      rfq.items.forEach(item => {
        const uPrice = bid.unitPrices[item.line] || 0;
        itemsTotal += uPrice * item.quantity;
      });
      const totalCost = itemsTotal + (bid.freight || 0);
      return {
        ...bid,
        totalCost,
        itemsTotal
      };
    });

    // Find lowest total cost
    const lowestTotalCost = Math.min(...vendorsAnalysis.map(v => v.totalCost));
    // Find lowest lead time
    const lowestLeadTime = Math.min(...vendorsAnalysis.map(v => v.deliveryLeadTimeDays));

    // Compute scores
    const scoredVendors = vendorsAnalysis.map(v => {
      const priceScore = v.totalCost > 0 ? (lowestTotalCost / v.totalCost) * 100 : 0;
      const deliveryScore = v.deliveryLeadTimeDays > 0 ? (lowestLeadTime / v.deliveryLeadTimeDays) * 100 : 0;

      // Formula: 40% Price, 30% Technical, 20% Delivery, 10% Vendor Rating
      const weightedScore = (priceScore * 0.40) +
        ((v.technicalScore || 80) * 0.30) +
        (deliveryScore * 0.20) +
        ((v.vendorRating || 80) * 0.10);
      return {
        ...v,
        priceScore,
        deliveryScore,
        weightedScore: Number(weightedScore.toFixed(1))
      };
    });

    // Sort by weighted score descending
    scoredVendors.sort((a, b) => b.weightedScore - a.weightedScore);

    const highestScore = Math.max(...scoredVendors.map(v => v.weightedScore));
    const highestTech = Math.max(...scoredVendors.map(v => v.technicalScore));

    return {
      scoredVendors,
      lowestTotalCost,
      highestScore,
      highestTech
    };
  };

  // Convert Award & Convert PO (ME58 equivalent BAPI simulation)
  const triggerPOConversion = (rfqId, vendorId) => {
    setIsPoConverting(true);
    setTimeout(() => {
      awardVendorBid(rfqId, vendorId);
      setIsPoConverting(false);
      setSelectedRfqEvalId('');
      alert(`BAPI_PO_CREATE Sync Complete. RFQ converted to PO successfully!`);
    }, 1500);
  };

  if (isPageLoading) {
    return (
      <ErrorBoundary>
        <div className="card p-4 space-y-4">
          <SkeletonLoader type="table" rows={6} cols={5} />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4 max-w-full animate-fade-in pb-16">

      {/* PROCUREMENT SUB NAVIGATION */}
      <div className="flex items-center justify-between border-b border-border select-none bg-surface p-1 rounded-md shadow-xs">
        <div className="flex">
          <button
            onClick={() => { setActiveProcTab('monitor'); setListSearch(''); }}
            className={`pb-2.5 px-5 text-xs font-bold border-b-2 transition-colors duration-150 cursor-pointer flex items-center gap-2 ${activeProcTab === 'monitor'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-tertiary hover:text-text-primary'
              }`}
          >
            <ClipboardList className="size-4" /> RFQ Monitor &amp; History
          </button>
          <button
            onClick={() => { setActiveProcTab('me41'); setListSearch(''); }}
            className={`pb-2.5 px-5 text-xs font-bold border-b-2 transition-colors duration-150 cursor-pointer flex items-center gap-2 ${activeProcTab === 'me41'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-tertiary hover:text-text-primary'
              }`}
          >
            <Plus className="size-4" /> Create RFQ (ME41)
          </button>
          <button
            onClick={() => { setActiveProcTab('me47'); setListSearch(''); }}
            className={`pb-2.5 px-5 text-xs font-bold border-b-2 transition-colors duration-150 cursor-pointer flex items-center gap-2 ${activeProcTab === 'me47'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-tertiary hover:text-text-primary'
              }`}
          >
            <Percent className="size-4" /> Submit Quotation (ME47)
          </button>
          <button
            onClick={() => { setActiveProcTab('me48'); setListSearch(''); }}
            className={`pb-2.5 px-5 text-xs font-bold border-b-2 transition-colors duration-150 cursor-pointer flex items-center gap-2 ${activeProcTab === 'me48'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-tertiary hover:text-text-primary'
              }`}
          >
            <Layers className="size-4" /> Evaluate &amp; Award (ME48)
          </button>
        </div>
        {activeProcTab === 'monitor' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRfqList(!showRfqList)}
            className="mr-2"
          >
            {showRfqList ? <ChevronsLeft className="size-3.5" /> : <Menu className="size-3.5" />}
            <span>{showRfqList ? 'Hide List' : 'Show List'}</span>
          </Button>
        )}
      </div>

      {activeProcTab !== 'me41' && activeProcTab !== 'me47' && activeProcTab !== 'me48' ? (
        <div className="card flex overflow-hidden min-h-[500px]">
          {/* LEFT SIDEBAR PANEL: RFQ LIST */}
          <div className={`shrink-0 bg-surface flex flex-col h-[calc(100vh-13.5rem)] transition-all duration-300 ease-in-out overflow-hidden ${
            showRfqList ? 'w-80 border-r border-border opacity-100' : 'w-0 opacity-0 border-r-0'
          }`}>
            <div className="p-3 border-b border-border bg-surface2/40">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">RFQ List</h3>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 size-3.5 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search RFQs..."
                  value={listSearch}
                  onChange={e => setListSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border">
              {state.rfqs
                .filter(r => r.id.toLowerCase().includes(listSearch.toLowerCase()) || r.description.toLowerCase().includes(listSearch.toLowerCase()))
                .map(rfq => {
                  const isSelected = selectedRfqId === rfq.id || (!selectedRfqId && state.rfqs[0]?.id === rfq.id);
                  
                  return (
                    <button
                      key={rfq.id}
                      type="button"
                      onClick={() => {
                        setSelectedRfqId(rfq.id);
                      }}
                      className={`w-full text-left p-3.5 transition-colors duration-150 cursor-pointer block ${
                        isSelected
                          ? 'bg-surface2 border-l-4 border-primary'
                          : 'hover:bg-surface2/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-text-primary">{rfq.id}</span>
                        <StatusBadge label={rfq.status} variant={rfqStatusVariant(rfq.status)} />
                      </div>
                      <p className="text-xs font-bold text-text-primary truncate" title={rfq.description}>{rfq.description}</p>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-text-tertiary font-mono">
                        <span>Org: {rfq.purchasingOrg}</span>
                        <span className="whitespace-nowrap">Date: {formatDate(rfq.createdDate)}</span>
                      </div>
                    </button>
                  );
                })}
              {state.rfqs.filter(r => r.id.toLowerCase().includes(listSearch.toLowerCase()) || r.description.toLowerCase().includes(listSearch.toLowerCase())).length === 0 && (
                <EmptyState title="No RFQ records found" className="py-8" />
              )}
            </div>
          </div>

          {/* RIGHT SIDE DETAILS PANEL */}
          <div className="flex-1 flex flex-col min-w-0 bg-base/40 overflow-hidden h-[calc(100vh-13.5rem)]">

            {/* TABS: MONITOR VIEW */}
            {activeProcTab === 'monitor' && (() => {
              const activeRfq = state.rfqs.find(r => r.id === selectedRfqId) || state.rfqs[0];
              if (!activeRfq) {
                return (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <EmptyState title="Select an RFQ from the left list to view details" />
                  </div>
                );
              }
              return (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Detail Header */}
                  <div className="p-4 border-b border-border bg-surface2/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowRfqList(!showRfqList)}
                        className="shrink-0 border border-border"
                        title={showRfqList ? "Hide RFQ List" : "Show RFQ List"}
                      >
                        {showRfqList ? <ChevronsLeft className="size-4" /> : <Menu className="size-4" />}
                      </Button>
                      <div>
                        <h3 className="text-xs font-bold text-text-primary uppercase">
                          (RFQ-{activeRfq.id}) / (Cat.-{activeRfq.description}) / (Typ-{activeRfq.rfqType})
                        </h3>
                        <p className="text-[10px] text-text-secondary font-mono mt-0.5 whitespace-nowrap">
                          Vendor: {currentVendorCode} &bull; Created: {formatDate(activeRfq.createdDate)} &bull; Org: {activeRfq.purchasingOrg}
                        </p>
                      </div>
                    </div>
                    <StatusBadge label={activeRfq.status} variant={rfqStatusVariant(activeRfq.status)} />
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6 bg-surface">
                    {/* RAW DETAILS */}
                    <div>
                      <SectionHeader title="RAW Details" icon={FileText} />
                      <div className="card overflow-x-auto">
                        <table className="w-full text-left border-collapse table-sticky">
                          <thead>
                            <tr>
                              <th className="w-12">Line</th>
                              <th className="whitespace-nowrap">Material Code</th>
                              <th>Description</th>
                              <th className="text-right">Qty Required</th>
                              <th className="text-center">UoM</th>
                              <th className="text-right whitespace-nowrap">Target Ref Price</th>
                              <th className="font-mono whitespace-nowrap">Delivery Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeRfq.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="font-mono font-bold text-text-tertiary">{(idx + 1) * 10}</td>
                                <td className="font-mono font-bold text-text-primary whitespace-nowrap">{item.materialCode}</td>
                                <td className="font-semibold text-text-primary">{item.description}</td>
                                <td className="text-right font-mono font-bold tabular-nums">{item.quantity.toLocaleString()}</td>
                                <td className="text-center font-bold">{item.uom}</td>
                                <td className="text-right font-mono text-text-secondary whitespace-nowrap tabular-nums">₹{item.targetPrice ? item.targetPrice.toFixed(2) : '0.00'}</td>
                                <td className="font-mono text-text-tertiary whitespace-nowrap">{formatDate(item.deliveryDate)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* OTHER DETAILS (INVITED VENDORS) */}
                    <div>
                      <SectionHeader title="Invited Vendors (Other Details)" icon={User} />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {activeRfq.invitedVendors?.map(v => {
                           const ratingVal = Number(v.rating || 0);
                           let ratingColorClass = "bg-surface2 text-text-secondary border-border-em";
                           if (ratingVal >= 90) {
                             ratingColorClass = "bg-emerald-900/20 text-emerald-400 border-emerald-900/50";
                           } else if (ratingVal >= 80) {
                             ratingColorClass = "bg-amber-500/20 text-amber-400 border-amber-500/30";
                           } else if (ratingVal > 0) {
                             ratingColorClass = "bg-rose-900/20 text-rose-400 border-rose-900/50";
                           }

                           return (
                             <div key={v.id} className="p-4 bg-surface2/30 border border-border rounded-xl flex flex-col justify-between gap-3 text-xs shadow-xs hover:shadow-sm transition-all duration-200 relative min-h-[90px]">
                               <div className="flex justify-between items-start gap-4 w-full">
                                 <p className="font-bold text-text-primary text-[11px] leading-tight break-words flex-1 pr-6">{v.name}</p>
                                 <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${ratingColorClass} absolute top-4.5 right-4.5`} title={`Vendor Rating: ${v.rating}`}>
                                   {v.rating}
                                 </span>
                               </div>
                               <div>
                                 <p className="text-[10px] text-text-secondary font-mono break-all">Code: {v.id}</p>
                               </div>
                             </div>
                           );
                         })}
                      </div>
                    </div>

                    {/* PROCESS DETAILS (AUDIT WORKFLOW STATUS) */}
                    <div>
                      <SectionHeader title="Audit Process Details & SAP Status Tracking" icon={Layers} />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 border border-border rounded-md bg-surface2/30">
                          <span className="text-[9px] text-text-tertiary uppercase block font-bold">ME41 Create</span>
                          <span className="font-bold text-text-primary flex items-center gap-1.5 mt-1.5">
                            <CheckCircle2 className="size-3.5 text-green-600" /> Published
                          </span>
                          <span className="text-[9px] font-mono text-text-tertiary block mt-1 whitespace-nowrap">{formatDate(activeRfq.createdDate)}</span>
                        </div>

                        <div className="p-3 border border-border rounded-md bg-surface2/30">
                          <span className="text-[9px] text-text-tertiary uppercase block font-bold">ME47 Quotation</span>
                          <span className={`font-bold mt-1.5 flex items-center gap-1.5 ${activeRfq.bids?.length > 0 ? 'text-text-primary' : 'text-text-tertiary'}`}>
                            {activeRfq.bids?.length > 0 ? (
                              <>
                                <CheckCircle2 className="size-3.5 text-green-600" /> {activeRfq.bids.length} Bid(s) Recd
                              </>
                            ) : (
                              <>
                                <Clock className="size-3.5 text-text-tertiary animate-pulse" /> Pending Bids
                              </>
                            )}
                          </span>
                          <span className="text-[9px] font-mono text-text-tertiary block mt-1 whitespace-nowrap">Deadline: {formatDate(activeRfq.deadlineDate)}</span>
                        </div>

                        <div className="p-3 border border-border rounded-md bg-surface2/30">
                          <span className="text-[9px] text-text-tertiary uppercase block font-bold">ME48 Evaluation</span>
                          <span className={`font-bold mt-1.5 flex items-center gap-1.5 ${activeRfq.status === 'Awarded' || activeRfq.status === 'Under Review' ? 'text-text-primary' : 'text-text-tertiary'}`}>
                            {activeRfq.status === 'Awarded' ? (
                              <>
                                <CheckCircle2 className="size-3.5 text-green-600" /> Evaluated
                              </>
                            ) : activeRfq.bids?.length > 0 ? (
                              <>
                                <Clock className="size-3.5 text-amber-500 animate-pulse" /> Review Ready
                              </>
                            ) : (
                              'Pending Review'
                            )}
                          </span>
                          <span className="text-[9px] text-text-tertiary block mt-1">Score weights active</span>
                        </div>

                        <div className="p-3 border border-border rounded-md bg-surface2/30">
                          <span className="text-[9px] text-text-tertiary uppercase block font-bold">ME58 PO Generation</span>
                          <span className={`font-bold mt-1.5 flex items-center gap-1.5 ${activeRfq.status === 'Awarded' ? 'text-text-primary' : 'text-text-tertiary'}`}>
                            {activeRfq.status === 'Awarded' ? (
                              <>
                                <CheckCircle2 className="size-3.5 text-green-600" /> PO Synced
                              </>
                            ) : (
                              'PO Pending'
                            )}
                          </span>
                          <span className="text-[9px] font-mono text-text-tertiary block mt-1">
                            {activeRfq.status === 'Awarded' ? 'Conversion Completed' : 'Pending Award'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-border text-xs text-text-secondary">
                      <p className="font-semibold">
                        Delivery Location: {activeRfq.deliveryLocation}
                      </p>
                      <div>
                        {activeRfq.bids?.length > 0 && activeRfq.status !== 'Awarded' && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedRfqEvalId(activeRfq.id);
                              setActiveProcTab('me48');
                            }}
                          >
                            Open Bid Evaluation Matrix ({activeRfq.bids.length} Bids)
                          </Button>
                        )}
                        {activeRfq.status === 'Awarded' && (
                          <span className="font-mono text-[10px] text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded font-bold">
                            Awarded to {activeRfq.awardedVendorName || 'Synced Vendor'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}            {/* TABS: ME48 EVALUATION & Comparative analysis is now handled as a standalone page below */}
          </div>
        </div>
      ) : activeProcTab === 'me48' ? (
        /* TAB: ME48 (Quotation Evaluation dashboard) */
        <div className="space-y-6">

          {/* Selection RFQ card */}
          <div className="card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="label mb-0">Select RFQ for Comparative Analysis</h3>
                <p className="text-[11px] text-text-secondary mt-0.5">Select a quoted or submitted RFQ to view the full bids comparison matrix</p>
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedRfqEvalId}
                  onChange={e => setSelectedRfqEvalId(e.target.value)}
                  className="w-auto font-semibold cursor-pointer"
                >
                  <option value="">-- Choose RFQ --</option>
                  {state.rfqs.filter(r => r.bids && r.bids.length > 0).map(r => (
                    <option key={r.id} value={r.id}>
                      {r.id} - {r.description.slice(0, 35)}... ({r.bids.length} bids)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {selectedRfqEvalId ? (() => {
            const rfq = state.rfqs.find(r => r.id === selectedRfqEvalId);
            if (!rfq) return null;

            const evalData = getEvaluationData(rfq);
            if (!evalData) return null;

            const { scoredVendors, lowestTotalCost, highestScore, highestTech } = evalData;

            return (
              <div className="space-y-6 animate-fade-in">

                {/* Top KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="metric-panel">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider block">Total Bidders</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-text-primary tabular-nums">{scoredVendors.length}</span>
                      <span className="text-xs text-text-secondary">vendors</span>
                    </div>
                  </div>

                  <div className="metric-panel">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider block">Lowest Bid Received</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">₹{lowestTotalCost.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="metric-panel">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider block">Average Bid Value</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-text-primary font-mono tabular-nums">
                        ₹{Math.round(scoredVendors.reduce((s, v) => s + v.totalCost, 0) / scoredVendors.length).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="metric-panel">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider block">Expected Savings %</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      {(() => {
                        const targetTotal = rfq.items.reduce((sum, item) => sum + item.targetPrice * item.quantity, 0);
                        const savings = targetTotal > 0 ? ((targetTotal - lowestTotalCost) / targetTotal) * 100 : 0;
                        return (
                          <span className="text-2xl font-bold text-emerald-700 tabular-nums">
                            {savings > 0 ? `${savings.toFixed(1)}%` : '0.0%'}
                          </span>
                        );
                      })()}
                      <span className="text-[10px] text-text-tertiary">vs target budget</span>
                    </div>
                  </div>
                </div>

                {/* Comparison Matrix Grid */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h4 className="font-bold text-xs text-text-primary">ME48 Comparative Evaluation Matrix</h4>
                    <span className="text-[9px] text-text-tertiary uppercase font-mono font-bold">
                      Formula: Price 40% | Tech 30% | Delivery 20% | Rating 10%
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr>
                          <th>Evaluation Metric</th>
                          {scoredVendors.map(vendor => (
                            <th key={vendor.vendorId} className="text-center">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-text-primary font-bold block normal-case tracking-normal">{vendor.vendorName}</span>
                                <span className="text-[9px] text-text-tertiary font-mono font-normal normal-case tracking-normal">Code: {vendor.vendorId}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="font-sans">
                        {/* Materials Prices */}
                        {rfq.items.map(item => (
                          <tr key={item.line}>
                            <td className="font-semibold text-text-primary">
                              L{item.line}: {item.description}
                            </td>
                            {scoredVendors.map(vendor => {
                              const bidPrice = vendor.unitPrices[item.line];
                              const target = item.targetPrice;
                              const isLowest = bidPrice === Math.min(...scoredVendors.map(v => v.unitPrices[item.line] || Infinity));
                              return (
                                <td key={vendor.vendorId} className="text-center font-mono font-semibold">
                                  <p className={isLowest ? 'text-emerald-700 font-bold tabular-nums' : 'text-text-primary tabular-nums'}>
                                    ₹{bidPrice ? bidPrice.toLocaleString() : 'N/A'}
                                  </p>
                                  <p className="text-[9px] text-text-tertiary font-normal tabular-nums">Target: ₹{target}</p>
                                </td>
                              );
                            })}
                          </tr>
                        ))}

                        {/* Additional Parameters */}
                        <tr>
                          <td className="font-semibold text-text-secondary">Estimated Freight (INR)</td>
                          {scoredVendors.map(vendor => (
                            <td key={vendor.vendorId} className="text-center font-mono font-bold text-text-primary tabular-nums">
                              ₹{(vendor.freight || 0).toLocaleString()}
                            </td>
                          ))}
                        </tr>

                        <tr>
                          <td className="font-semibold text-text-secondary">Lead Time (Days)</td>
                          {scoredVendors.map(vendor => (
                            <td key={vendor.vendorId} className="text-center font-mono font-bold text-text-primary tabular-nums">
                              {vendor.deliveryLeadTimeDays} days
                            </td>
                          ))}
                        </tr>

                        <tr>
                          <td className="font-semibold text-text-secondary">Quotation Validity</td>
                          {scoredVendors.map(vendor => (
                            <td key={vendor.vendorId} className="text-center font-mono font-bold text-text-primary">
                              {vendor.validityDate || 'N/A'}
                            </td>
                          ))}
                        </tr>

                        <tr>
                          <td className="font-semibold text-text-secondary font-sans">Min Order Qty (MOQ)</td>
                          {scoredVendors.map(vendor => (
                            <td key={vendor.vendorId} className="text-center font-mono font-bold text-text-primary tabular-nums">
                              {vendor.moq} EA
                            </td>
                          ))}
                        </tr>

                        {/* Scores Row */}
                        <tr className="font-sans border-t border-border">
                          <td className="font-bold text-text-primary">Technical Score</td>
                          {scoredVendors.map(vendor => (
                            <td key={vendor.vendorId} className="text-center font-bold text-text-primary">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${vendor.technicalScore === highestTech ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-surface2 text-text-secondary'}`}>
                                {vendor.technicalScore} / 100
                              </span>
                            </td>
                          ))}
                        </tr>

                        <tr className="font-sans">
                          <td className="font-bold text-text-primary">Vendor Master Rating</td>
                          {scoredVendors.map(vendor => (
                            <td key={vendor.vendorId} className="text-center font-mono font-bold text-text-primary tabular-nums">
                              {vendor.vendorRating} pts
                            </td>
                          ))}
                        </tr>

                        {/* Weighted Score */}
                        <tr className="bg-primary text-white font-sans border-t border-primary">
                          <td className="py-3.5 font-bold text-xs uppercase tracking-wider text-white border-b-0">Weighted score (calculated)</td>
                          {scoredVendors.map(vendor => {
                            const isWinner = vendor.weightedScore === highestScore;
                            return (
                              <td key={vendor.vendorId} className="py-3.5 text-center font-bold text-sm border-b-0">
                                <span className={isWinner ? 'text-amber-300 font-extrabold tabular-nums' : 'text-white tabular-nums'}>
                                  {vendor.weightedScore}%
                                </span>
                                {isWinner && (
                                  <span className="block text-[8px] text-amber-300 font-bold uppercase tracking-wider mt-0.5">
                                    ⭐ Recommended Winner
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>

                        {/* System Badges / Recommendations */}
                        <tr className="font-sans">
                          <td className="font-bold text-text-primary">System Evaluation Badges</td>
                          {scoredVendors.map(vendor => {
                            const isLowestTotal = vendor.totalCost === lowestTotalCost;
                            const isBestTech = vendor.technicalScore === highestTech;
                            return (
                              <td key={vendor.vendorId} className="text-center">
                                <div className="flex flex-col gap-1 items-center justify-center">
                                  {isLowestTotal && (
                                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold rounded">
                                      Lowest Price Vendor
                                    </span>
                                  )}
                                  {isBestTech && (
                                    <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[9px] font-bold rounded">
                                      Best Technical Vendor
                                    </span>
                                  )}
                                  {!isLowestTotal && !isBestTech && <span className="text-text-tertiary text-[10px]">-</span>}
                                </div>
                              </td>
                            );
                          })}
                        </tr>

                        {/* Total Cost Value Summary */}
                        <tr className="font-sans font-bold">
                          <td className="text-text-primary">Total Quotation Value (Inc Freight)</td>
                          {scoredVendors.map(vendor => (
                            <td key={vendor.vendorId} className="text-center text-sm font-bold text-text-primary font-mono tabular-nums">
                              ₹{vendor.totalCost.toLocaleString()}
                            </td>
                          ))}
                        </tr>

                        {/* Actions Column */}
                        {rfq.status !== 'Awarded' && (
                          <tr className="font-sans border-t border-border">
                            <td className="py-4 font-bold text-text-primary">Award Actions [ME58 PO]</td>
                            {scoredVendors.map(vendor => (
                              <td key={vendor.vendorId} className="py-4 text-center">
                                <Button
                                  onClick={() => triggerPOConversion(rfq.id, vendor.vendorId)}
                                  disabled={isPoConverting}
                                  variant={vendor.weightedScore === highestScore ? 'default' : 'outline'}
                                  className={vendor.weightedScore === highestScore ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 border-transparent' : ''}
                                >
                                  {isPoConverting ? 'Converting...' : 'Award & Convert PO'}
                                </Button>
                              </td>
                            ))}
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Re-issue or Cancel general RFQ actions */}
                  {rfq.status !== 'Awarded' && rfq.status !== 'Closed' && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newDead = prompt('Enter new Bidding Deadline Date (YYYY-MM-DD):', new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                          if (newDead) {
                            reissueRFQ(rfq.id, newDead);
                            setSelectedRfqEvalId('');
                            alert(`RFQ ${rfq.id} successfully re-issued with new deadline: ${newDead}. Bids have been reset.`);
                          }
                        }}
                      >
                        🔄 Re-issue RFQ (Extend &amp; Reset Bids)
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          if (confirm(`Are you sure you want to cancel RFQ ${rfq.id}? This will permanently close the document.`)) {
                            cancelRFQ(rfq.id);
                            setSelectedRfqEvalId('');
                            alert(`RFQ ${rfq.id} has been cancelled.`);
                          }
                        }}
                      >
                        ❌ Cancel RFQ Document
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })() : (
            <div className="card">
              <EmptyState icon={Layers} title="No RFQ Selected" description="Please select an RFQ with active vendor quotations above to load the evaluation grid." />
            </div>
          )}
        </div>
      ) : activeProcTab === 'me47' ? (
        /* TAB: ME47 MAINTAIN QUOTATION FORM */
        <div className="space-y-6">
          {tabLoading ? (
            <div className="card space-y-6 animate-fade-in p-6">
              <div>
                <div className="h-4.5 w-48 skeleton mb-1.5" />
                <div className="h-3 w-80 skeleton" />
              </div>
              <div className="space-y-3">
                <div className="h-4.5 w-28 skeleton" />
                <div className="flex flex-col border border-border rounded-md divide-y divide-border bg-surface overflow-hidden">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="py-2.5 px-3 flex items-center gap-3">
                      <div className="h-3.5 w-40 skeleton shrink-0" />
                      <div className="h-8 flex-1 skeleton" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleQuotationSubmit} className="card space-y-6 relative p-6">
              {isLoading && (
                <div className="absolute inset-0 bg-surface/85 backdrop-blur-xs flex flex-col items-center justify-center z-30 min-h-[400px]">
                  <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-xs font-bold text-text-primary uppercase tracking-widest font-mono">BAPI_QUOTATION_CREATE Posting to SAP ERP...</p>
                  <p className="text-[10px] text-text-secondary mt-1">Updating Info Records &amp; synchronization with SAP database (ME47)...</p>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Submit Quotation (ME47)</h3>
                  <p className="text-[11px] text-text-secondary mt-0.5">Submit proposal prices, discount structures and delivery timelines directly to SAP</p>
                </div>
              </div>

              {/* RFQ Selection Dropdown and Details */}
              {(() => {
                const selectedRfq = state.rfqs.find(r => r.id === quoteForm.rfqId);
                return (
                  <div className={`p-4 bg-surface2/30 border rounded-md space-y-4 ${quoteErrors.rfqId ? 'border-red-500 ring-1 ring-red-500/50 bg-red-50/5' : 'border-border'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider font-mono">Select RFQ Document</h4>
                        <p className="text-[10px] text-text-tertiary mt-0.5 font-semibold">Choose an active RFQ from the SAP ERP system to quote for</p>
                      </div>
                      <div>
                        <select
                          value={quoteForm.rfqId}
                          onChange={e => {
                            const selectedId = e.target.value;
                            const rfq = state.rfqs.find(r => r.id === selectedId);
                            setQuoteForm({
                              ...quoteForm,
                              rfqId: selectedId,
                              selectedLine: rfq && rfq.items.length > 0 ? rfq.items[0].line : 10
                            });
                            if (quoteErrors.rfqId) setQuoteErrors(prev => ({ ...prev, rfqId: false }));
                          }}
                          className={`w-auto font-semibold ${
                            quoteErrors.rfqId ? 'border-red-500' : ''
                          }`}
                        >
                          <option value="">-- Choose RFQ Document --</option>
                          {state.rfqs.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.id} - {r.description} ({r.status})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {selectedRfq && (
                      <div className="border-t border-border pt-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider">RFQ Line Item Details (Selected for Quotation)</h5>
                          <span className="font-mono text-[9px] text-text-secondary font-bold bg-surface2 px-2 py-0.5 rounded">
                            Status: {selectedRfq.status}
                          </span>
                        </div>

                        {/* Line Item selector if multiple items */}
                        {selectedRfq.items.length > 1 && (
                          <div className="flex flex-wrap items-center gap-2 py-1">
                            <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider mr-1">Select Line Item:</span>
                            {selectedRfq.items.map(item => (
                              <button
                                key={item.line}
                                type="button"
                                onClick={() => setQuoteForm({ ...quoteForm, selectedLine: item.line })}
                                className={`px-3 py-1 text-xs font-mono font-bold rounded-md border transition-colors duration-150 cursor-pointer ${
                                  Number(quoteForm.selectedLine) === item.line
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-surface text-text-secondary border-border hover:bg-surface2'
                                }`}
                              >
                                Line {item.line}: {item.materialCode}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Selected Item Info Card */}
                        {(() => {
                          const selectedItem = selectedRfq.items.find(item => item.line === Number(quoteForm.selectedLine)) || selectedRfq.items[0];
                          if (!selectedItem) return null;
                          return (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1 text-xs font-sans text-text-secondary">
                              <div>
                                <span className="text-[9px] text-text-tertiary block font-bold uppercase">Material Code</span>
                                <span className="font-bold text-text-primary font-mono">{selectedItem.materialCode}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-text-tertiary block font-bold uppercase">Description</span>
                                <span className="font-bold text-text-primary truncate block max-w-[200px]">{selectedItem.description}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-text-tertiary block font-bold uppercase">Required Quantity</span>
                                <span className="font-bold text-text-primary font-mono tabular-nums">{selectedItem.quantity.toLocaleString()} {selectedItem.uom}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-text-tertiary block font-bold uppercase">Target Price Reference</span>
                                <span className="font-bold text-text-primary font-mono tabular-nums">₹{selectedItem.targetPrice?.toFixed(2)}</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 1. QUOTATION HEADER */}
              <div className="space-y-4">
                <SectionHeader title="Quotation Header" icon={FileText} />
                <div className="flex flex-col border border-border rounded-lg divide-y divide-border bg-surface overflow-x-auto custom-scrollbar shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border bg-surface min-w-[900px]">
                    <div className="flex-1">
                      <EnterpriseFieldCard
                        label="Your Quote Reference"
                        error={quoteErrors.quoteRef}
                        labelWidth="sm:w-36"
                      >
                        <input
                          type="text"
                          placeholder="e.g. QT-2026-001"
                          value={quoteForm.quoteRef}
                          onChange={e => setQuoteForm({ ...quoteForm, quoteRef: e.target.value })}
                          className="max-w-[180px] font-mono uppercase font-bold h-8"
                        />
                      </EnterpriseFieldCard>
                    </div>

                    <div className="flex-1">
                      <EnterpriseFieldCard
                        label="Quotation Date"
                        required
                        error={quoteErrors.quoteDate}
                        labelWidth="sm:w-32"
                      >
                        <div className="flex items-center h-8 max-w-[180px] w-full bg-base border border-border rounded-md overflow-hidden focus-within:border-[rgb(var(--color-emerald-default-rgb))] transition-colors duration-150">
                          <input
                            type="date"
                            required
                            value={quoteForm.quoteDate}
                            onChange={e => {
                              setQuoteForm({ ...quoteForm, quoteDate: e.target.value });
                              if (quoteErrors.quoteDate) setQuoteErrors(prev => ({ ...prev, quoteDate: false }));
                            }}
                            className="border-none shadow-none bg-transparent flex-1 min-w-0 px-2.5 text-[13px] text-text-primary outline-none font-mono font-bold"
                          />
                          <Calendar className="size-3.5 text-text-tertiary shrink-0 mr-2 pointer-events-none" />
                        </div>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="flex-1">
                      <EnterpriseFieldCard
                        label="Validity Date"
                        required
                        error={quoteErrors.validityDate}
                        labelWidth="sm:w-32"
                      >
                        <div className="flex items-center h-8 max-w-[180px] w-full bg-base border border-border rounded-md overflow-hidden focus-within:border-[rgb(var(--color-emerald-default-rgb))] transition-colors duration-150">
                          <input
                            type="date"
                            required
                            value={quoteForm.validityDate}
                            onChange={e => {
                              setQuoteForm({ ...quoteForm, validityDate: e.target.value });
                              if (quoteErrors.validityDate) setQuoteErrors(prev => ({ ...prev, validityDate: false }));
                            }}
                            className="border-none shadow-none bg-transparent flex-1 min-w-0 px-2.5 text-[13px] text-text-primary outline-none font-mono font-bold"
                          />
                          <Calendar className="size-3.5 text-text-tertiary shrink-0 mr-2 pointer-events-none" />
                        </div>
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>


              {/* 2. LINE ITEM PRICING */}
              <div className="space-y-4">
                <SectionHeader title="Line Item Pricing" icon={Percent} />
                <div className="flex flex-col border border-border rounded-lg divide-y divide-border bg-surface overflow-x-auto custom-scrollbar shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border bg-surface min-w-[900px]">
                    <div className="flex-1">
                      <EnterpriseFieldCard
                        label="Unit Price (₹)"
                        required
                        error={quoteErrors.unitPrice}
                        labelWidth="sm:w-28"
                      >
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          required
                          placeholder="0.00"
                          value={quoteForm.unitPrice}
                          onChange={e => {
                            setQuoteForm({ ...quoteForm, unitPrice: e.target.value });
                            if (quoteErrors.unitPrice) setQuoteErrors(prev => ({ ...prev, unitPrice: false }));
                          }}
                          className="max-w-[180px] font-mono font-bold h-8"
                        />
                      </EnterpriseFieldCard>
                    </div>

                    <div className="flex-1">
                      <EnterpriseFieldCard
                        label="GST Rate (%)"
                        required
                        error={quoteErrors.gstRate}
                        labelWidth="sm:w-32"
                      >
                        <select
                          value={quoteForm.gstRate}
                          onChange={e => {
                            setQuoteForm({ ...quoteForm, gstRate: e.target.value });
                            if (quoteErrors.gstRate) setQuoteErrors(prev => ({ ...prev, gstRate: false }));
                          }}
                          className="max-w-[180px] font-semibold h-8"
                        >
                          <option value="18%">18% - G1</option>
                          <option value="12%">12% - G2</option>
                          <option value="5%">5% - G3</option>
                          <option value="28%">28% - G4</option>
                          <option value="Exempt">Exempt - G0</option>
                        </select>
                      </EnterpriseFieldCard>
                    </div>

                    <div className="flex-1">
                      <EnterpriseFieldCard
                        label="Discount (%)"
                        labelWidth="sm:w-32"
                      >
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="0"
                          value={quoteForm.discount}
                          onChange={e => setQuoteForm({ ...quoteForm, discount: e.target.value })}
                          className="max-w-[120px] font-mono font-bold h-8"
                        />
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>


              {/* 3. DELIVERY TERMS */}
              <div className="space-y-4">
                <SectionHeader title="Delivery Terms" icon={Clock} />
                <div className="flex flex-col border border-border rounded-lg divide-y divide-border bg-surface overflow-x-auto custom-scrollbar shadow-xs">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border bg-surface min-w-[900px]">
                    <div className="flex-1">
                      <EnterpriseFieldCard
                        label="Delivery Lead Time (Days)"
                        required
                        error={quoteErrors.deliveryLeadTime}
                        labelWidth="sm:w-44"
                      >
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="7"
                          value={quoteForm.deliveryLeadTime}
                          onChange={e => {
                            setQuoteForm({ ...quoteForm, deliveryLeadTime: e.target.value });
                            if (quoteErrors.deliveryLeadTime) setQuoteErrors(prev => ({ ...prev, deliveryLeadTime: false }));
                          }}
                          className="max-w-[120px] font-mono font-bold h-8"
                        />
                      </EnterpriseFieldCard>
                    </div>

                    <div className="flex-1">
                      <EnterpriseFieldCard
                        label="Freight / Packing (₹)"
                        labelWidth="sm:w-28"
                      >
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={quoteForm.freight}
                          onChange={e => setQuoteForm({ ...quoteForm, freight: e.target.value })}
                          className="max-w-[180px] font-mono font-bold h-8"
                        />
                      </EnterpriseFieldCard>
                    </div>

                    <div className="flex-1">
                      <EnterpriseFieldCard
                        label="Incoterms"
                        labelWidth="sm:w-32"
                      >
                        <select
                          value={quoteForm.incoterms}
                          onChange={e => setQuoteForm({ ...quoteForm, incoterms: e.target.value })}
                          className="max-w-[180px] font-semibold h-8"
                        >
                          <option value="EXW">EXW - Ex Works</option>
                          <option value="FOB">FOB - Free on Board</option>
                          <option value="CIF">CIF - Cost, Insurance &amp; Freight</option>
                          <option value="FOR">FOR - Free on Rail</option>
                          <option value="DDP">DDP - Delivered Duty Paid</option>
                        </select>
                      </EnterpriseFieldCard>
                    </div>
                  </div>
                </div>
              </div>


              {/* STICKY BOTTOM ACTION BAR */}
              <div className="sticky bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xs border border-border p-4 rounded-xl flex items-center justify-between gap-4 shadow-lg z-10 mt-8 transition-shadow duration-150 hover:shadow-xl">
                <div>
                  <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest block font-mono">SAP Info Record Session</span>
                  <p className="text-xs font-semibold text-text-primary">ME47 Maintain Quotation Bids</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => {
                      alert('Quotation Draft saved in local memory.');
                    }}
                    variant="outline"
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    className="px-8"
                  >
                    Submit Quotation
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      ) : activeProcTab === 'me41' ? (
        <div className="space-y-6">
          {tabLoading ? (
            <div className="card space-y-6 animate-fade-in p-6">
              <div>
                <div className="h-4.5 w-48 skeleton mb-1.5" />
                <div className="h-3 w-80 skeleton" />
              </div>
              <div className="space-y-3">
                <div className="h-4.5 w-28 skeleton" />
                <div className="flex flex-col border border-border rounded-md divide-y divide-border bg-surface overflow-hidden">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="py-2.5 px-3 flex items-center gap-3">
                      <div className="h-3.5 w-40 skeleton shrink-0" />
                      <div className="h-8 flex-1 skeleton" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePublishRFQSubmit} className="card space-y-5 relative p-5">
          {isLoading && (
            <div className="absolute inset-0 bg-surface/85 backdrop-blur-xs flex flex-col items-center justify-center z-30 min-h-[400px]">
              <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs font-bold text-text-primary uppercase tracking-widest font-mono">BAPI_RFQ_CREATE Posting to SAP ERP...</p>
              <p className="text-[10px] text-text-secondary mt-1">Establishing RFC connection &amp; writing database records</p>
            </div>
          )}

          <div className="space-y-3">
            {/* Header Details Card Title & Form Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-2 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-text-secondary shrink-0" />
                <h3 className="text-xs font-extrabold text-text-primary tracking-wider uppercase select-none">
                  RFQ Header Details
                </h3>
              </div>
              <div className="flex items-center gap-2 select-none">
                <Button
                  type="button"
                  onClick={() => {
                    if (confirm("Are you sure you want to cancel?")) {
                      setActiveProcTab('monitor');
                    }
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    alert('Draft saved in local memory.');
                  }}
                  variant="outline"
                >
                  Save Draft
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="px-4 flex items-center gap-1"
                >
                  <span>Create RFQ</span>
                  <ChevronDown className="size-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col border border-border rounded-lg divide-y divide-border bg-surface overflow-hidden shadow-xs">
              {/* Row 1: RFQ Reference No. | Document Type */}
              <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border bg-surface">
                <div className="flex-1">
                  <EnterpriseFieldCard
                    label="RFQ Reference No."
                    required
                    dataType="CHAR"
                    length="LEN 10"
                    tableField="EKKO-EBELN"
                    labelWidth="sm:w-28"
                    error={formErrors.rfqRefNo}
                  >
                    <input
                      type="text"
                      required
                      placeholder="e.g. RFQ-10029"
                      value={rfqForm.rfqRefNo}
                      onChange={e => {
                        rfqFormSet({ ...rfqForm, rfqRefNo: e.target.value });
                        if (formErrors.rfqRefNo) setFormErrors({ ...formErrors, rfqRefNo: false });
                      }}
                      className="w-[150px] font-mono uppercase font-bold"
                    />
                  </EnterpriseFieldCard>
                </div>

                <div className="flex-1">
                  <EnterpriseFieldCard
                    label="Document Type"
                    required
                    dataType="CHAR"
                    length="LEN 4"
                    tableField="EKKO-BSART"
                    labelWidth="sm:w-24"
                    error={formErrors.rfqType}
                  >
                    <select
                      value={rfqForm.rfqType}
                      onChange={e => {
                        rfqFormSet({ ...rfqForm, rfqType: e.target.value });
                        if (formErrors.rfqType) setFormErrors({ ...formErrors, rfqType: false });
                      }}
                      className="w-[190px] font-semibold"
                    >
                      <option value="AN">AN - Standard RFQ</option>
                      <option value="AB">AB - Outline Agreement RFQ</option>
                    </select>
                  </EnterpriseFieldCard>
                </div>
              </div>

              {/* Row 2: RFQ Description */}
              <div className="bg-surface">
                <EnterpriseFieldCard
                  label="RFQ Description"
                  required
                  dataType="CHAR"
                  length="LEN 40"
                  tableField="EKKO-TXZ01"
                  labelWidth="sm:w-28"
                  error={formErrors.description}
                >
                  <textarea
                    rows={2}
                    required
                    placeholder="Describe the RFQ purchase target..."
                    value={rfqForm.description}
                    onChange={e => {
                      rfqFormSet({ ...rfqForm, description: e.target.value });
                      if (formErrors.description) setFormErrors({ ...formErrors, description: false });
                    }}
                    className="w-full max-w-2xl min-h-0 resize-none font-bold"
                  />
                </EnterpriseFieldCard>
              </div>
            </div>
          </div>

          {/* Schedule & Terms */}
          <div className="space-y-3">
            <SectionHeader title="Schedule & Terms" icon={Calendar} />
            <div className="flex flex-col border border-border rounded-lg divide-y divide-border bg-surface overflow-hidden shadow-xs">
              <div className="flex flex-col lg:flex-row lg:flex-wrap divide-y lg:divide-y-0 lg:divide-x divide-border bg-surface">
                <div className="flex-1">
                  <EnterpriseFieldCard
                    label="Quotation Deadline"
                    required
                    dataType="DATE"
                    length="LEN 8"
                    tableField="EKKO-ANGDT"
                    labelWidth="sm:w-36"
                    error={formErrors.deadlineDate}
                  >
                    <div className="flex items-center h-8 max-w-[180px] w-full bg-base border border-border rounded-md overflow-hidden focus-within:border-[rgb(var(--color-emerald-default-rgb))] transition-colors duration-150">
                      <input
                        type="date"
                        required
                        value={rfqForm.deadlineDate}
                        onChange={e => {
                          rfqFormSet({ ...rfqForm, deadlineDate: e.target.value });
                          if (formErrors.deadlineDate) setFormErrors({ ...formErrors, deadlineDate: false });
                        }}
                        className="border-none shadow-none bg-transparent flex-1 min-w-0 px-2.5 text-[13px] text-text-primary outline-none font-mono font-bold"
                      />
                      <Calendar className="size-3.5 text-text-tertiary shrink-0 mr-2 pointer-events-none" />
                    </div>
                  </EnterpriseFieldCard>
                </div>

                <div className="flex-1">
                  <EnterpriseFieldCard
                    label="Binding Period"
                    dataType="NUMC"
                    length="LEN 3"
                    tableField="EKKO-BNDDT"
                    labelWidth="sm:w-20"
                    error={formErrors.bindingPeriod}
                  >
                    <input
                      type="number"
                      min="1"
                      value={rfqForm.bindingPeriod}
                      onChange={e => {
                        rfqFormSet({ ...rfqForm, bindingPeriod: e.target.value });
                        if (formErrors.bindingPeriod) setFormErrors({ ...formErrors, bindingPeriod: false });
                      }}
                      className="w-[70px] font-mono font-bold"
                    />
                  </EnterpriseFieldCard>
                </div>

                <div className="flex-1">
                  <EnterpriseFieldCard
                    label="Payment Terms"
                    dataType="CHAR"
                    length="LEN 4"
                    tableField="EKKO-ZTERM"
                    labelWidth="sm:w-22"
                  >
                    <select
                      value={rfqForm.paymentTerms}
                      onChange={e => rfqFormSet({ ...rfqForm, paymentTerms: e.target.value })}
                      className="w-[150px] font-semibold"
                    >
                      <option value="NET 30 Days">NET 30 Days</option>
                      <option value="NET 45 Days">NET 45 Days</option>
                      <option value="NET 60 Days">NET 60 Days</option>
                      <option value="Immediate">Immediate / COD</option>
                    </select>
                  </EnterpriseFieldCard>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Selection */}
          <div className="space-y-3">
            <SectionHeader title="Vendor Selection" icon={User} />
            <div className="flex flex-col border border-border rounded-lg divide-y divide-border bg-surface overflow-hidden shadow-xs">
              <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border bg-surface">
                <div className="flex-1">
                  <EnterpriseFieldCard
                    label="Purchasing Group"
                    required
                    dataType="CHAR"
                    length="LEN 3"
                    tableField="EKKO-EKGRP"
                    labelWidth="sm:w-24"
                    error={formErrors.purchasingGroup}
                  >
                    <select
                      value={rfqForm.purchasingGroup}
                      onChange={e => {
                        rfqFormSet({ ...rfqForm, purchasingGroup: e.target.value });
                        if (formErrors.purchasingGroup) setFormErrors({ ...formErrors, purchasingGroup: false });
                      }}
                      className="w-[130px] font-semibold"
                    >
                      <option value="001">001 - Raw Materials</option>
                      <option value="002">002 - Steel & Piping</option>
                      <option value="003">003 - Fasteners</option>
                      <option value="100">100 - General Services</option>
                    </select>
                  </EnterpriseFieldCard>
                </div>
              </div>

              <div className="bg-surface">
                <EnterpriseFieldCard
                  label="Vendors to Invite"
                  required
                  dataType="CHAR"
                  length="LEN 10"
                  tableField="EKKO-LIFNR"
                  labelWidth="sm:w-32"
                  error={formErrors.selectedVendors}
                >
                  <div className="w-full relative">
                    <div className="flex flex-wrap gap-1.5 p-1 border border-border rounded-md bg-base min-h-[36px] focus-within:border-[rgb(var(--color-emerald-default-rgb))] transition-colors duration-150">
                      {selectedVendors.map(vid => {
                        const v = vendorMasterList.find(vm => vm.id === vid);
                        return (
                          <span key={vid} className="inline-flex items-center gap-1 bg-surface2 text-text-primary text-[10px] font-semibold px-2 py-0.5 rounded border border-border-em">
                            👤 {v ? v.name : vid} ({vid})
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = selectedVendors.filter(id => id !== vid);
                                setSelectedVendors(filtered);
                                if (filtered.length === 0) setFormErrors({ ...formErrors, selectedVendors: true });
                              }}
                              className="text-text-tertiary hover:text-red-600 focus:outline-none ml-0.5 cursor-pointer"
                            >
                              <X className="size-3" />
                            </button>
                          </span>
                        );
                      })}
                      <input
                        type="search"
                        placeholder={selectedVendors.length === 0 ? "Search vendors to invite..." : ""}
                        value={vendorSearch}
                        onChange={e => {
                          setVendorSearch(e.target.value);
                          setVendorDropdownOpen(true);
                        }}
                        onFocus={() => setVendorDropdownOpen(true)}
                        className="flex-1 bg-transparent border-0 shadow-none outline-none text-xs text-text-primary p-1 min-w-[120px]"
                      />
                      <button
                        type="button"
                        onClick={() => setVendorDropdownOpen(!vendorDropdownOpen)}
                        className="text-text-tertiary hover:text-text-primary focus:outline-none px-1 transition-colors duration-150"
                      >
                        <ChevronDown className="size-4" />
                      </button>
                    </div>

                    {vendorDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-5" onClick={() => setVendorDropdownOpen(false)} />
                        <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {vendorMasterList
                            .filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase()) || v.id.toLowerCase().includes(vendorSearch.toLowerCase()))
                            .map(vendor => {
                              const isSelected = selectedVendors.includes(vendor.id);
                              return (
                                <div
                                  key={vendor.id}
                                  onClick={() => {
                                    if (isSelected) {
                                      const filtered = selectedVendors.filter(id => id !== vendor.id);
                                      setSelectedVendors(filtered);
                                      if (filtered.length === 0) setFormErrors({ ...formErrors, selectedVendors: true });
                                    } else {
                                      setSelectedVendors([...selectedVendors, vendor.id]);
                                      if (formErrors.selectedVendors) setFormErrors({ ...formErrors, selectedVendors: false });
                                    }
                                    setVendorSearch('');
                                  }}
                                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-surface2 flex items-center justify-between border-b border-border last:border-0 ${isSelected ? 'bg-surface2 font-semibold' : ''}`}
                                >
                                  <div>
                                    <span className="font-bold text-text-primary">{vendor.name}</span>
                                    <span className="font-mono text-text-tertiary ml-2">({vendor.id})</span>
                                  </div>
                                  {isSelected && <span className="text-primary text-xs">✓</span>}
                                </div>
                              );
                            })}
                        </div>
                      </>
                    )}
                  </div>
                </EnterpriseFieldCard>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <SectionHeader title="Line Items Entry" icon={ClipboardList} />
            <div className="flex flex-col border border-border rounded-lg divide-y divide-border bg-surface overflow-hidden shadow-xs">
              {/* Row 1: Material Description (full width) */}
              <div className="bg-surface">
                <EnterpriseFieldCard
                  label="Material / Item"
                  dataType="CHAR"
                  length="LEN 18"
                  tableField="EKPO-MATNR/TXZ01"
                  labelWidth="sm:w-24"
                  error={formErrors.materialDescription}
                >
                  <div className="w-full max-w-xl relative">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder="Select material code or type custom description..."
                        value={rfqForm.materialDescription}
                        onChange={e => {
                          rfqFormSet({ ...rfqForm, materialDescription: e.target.value });
                          setMaterialDropdownOpen(true);
                          if (formErrors.materialDescription) setFormErrors({ ...formErrors, materialDescription: false });
                        }}
                        onFocus={() => setMaterialDropdownOpen(true)}
                        className="w-full pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setMaterialDropdownOpen(!materialDropdownOpen)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary focus:outline-none cursor-pointer transition-colors duration-150"
                      >
                        <ChevronDown className="size-3.5" />
                      </button>
                    </div>

                    {materialDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-5" onClick={() => setMaterialDropdownOpen(false)} />
                        <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {materialMasterList
                            .filter(m => m.code.toLowerCase().includes(rfqForm.materialDescription.toLowerCase()) || m.desc.toLowerCase().includes(rfqForm.materialDescription.toLowerCase()))
                            .map(mat => (
                              <div
                                key={mat.code}
                                onClick={() => {
                                  rfqFormSet({
                                    ...rfqForm,
                                    materialDescription: mat.code,
                                    unitOfMeasure: mat.uom
                                  });
                                  setMaterialDropdownOpen(false);
                                  if (formErrors.materialDescription) setFormErrors({ ...formErrors, materialDescription: false });
                                }}
                                className="px-3 py-2 text-xs cursor-pointer hover:bg-surface2 border-b border-border last:border-0"
                              >
                                <div className="font-bold text-text-primary">{mat.code}</div>
                                <div className="text-text-secondary text-[10px] truncate">{mat.desc}</div>
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                </EnterpriseFieldCard>
              </div>

              {/* Row 2: Quantity | UoM | Add Button side-by-side */}
              <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border bg-surface">
                <div className="flex-1">
                  <EnterpriseFieldCard
                    label="Quantity"
                    dataType="QUAN"
                    length="LEN 13"
                    tableField="EKPO-MENGE"
                    labelWidth="sm:w-16"
                    error={formErrors.quantityRequired}
                  >
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 10000"
                      value={rfqForm.quantityRequired}
                      onChange={e => {
                        rfqFormSet({ ...rfqForm, quantityRequired: e.target.value });
                        if (formErrors.quantityRequired) setFormErrors({ ...formErrors, quantityRequired: false });
                      }}
                      className="w-[120px] font-mono font-bold"
                    />
                  </EnterpriseFieldCard>
                </div>

                <div className="flex-1">
                  <EnterpriseFieldCard
                    label="Unit of Measure"
                    dataType="UNIT"
                    length="LEN 3"
                    tableField="EKPO-MEINS"
                    labelWidth="sm:w-22"
                    error={formErrors.unitOfMeasure}
                  >
                    <select
                      value={rfqForm.unitOfMeasure}
                      onChange={e => {
                        rfqFormSet({ ...rfqForm, unitOfMeasure: e.target.value });
                        if (formErrors.unitOfMeasure) setFormErrors({ ...formErrors, unitOfMeasure: false });
                      }}
                      className="w-[100px] font-semibold"
                    >
                      <option value="EA">EA - Each</option>
                      <option value="PC">PC - Piece</option>
                      <option value="KG">KG - Kilogram</option>
                      <option value="MTR">MTR - Meter</option>
                      <option value="NOS">NOS - Number</option>
                    </select>
                  </EnterpriseFieldCard>
                </div>

                <div className="flex items-center px-3 py-1.5">
                  <Button
                    type="button"
                    onClick={handleAddLineItem}
                    variant="default"
                    className="h-7"
                  >
                    <Plus className="size-3.5" /> Add Item
                  </Button>
                </div>
              </div>

              {/* Added items list */}
              <div className="md:col-span-3 space-y-2 pt-2">
                <label className="label">Currently Added Items ({addedItems.length})</label>
                {addedItems.length === 0 ? (
                  <EmptyState description={'No items added to this RFQ yet. Enter details above and click "Add Line Item".'} className="border border-dashed border-border-em rounded-md bg-surface2/30 py-6" />
                ) : (
                  <div className="card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="w-12">Line</th>
                          <th>Material / Item Description</th>
                          <th className="text-right">Quantity</th>
                          <th className="text-center">UoM</th>
                          <th className="text-right">Target Price (₹)</th>
                          <th className="text-center font-mono">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {addedItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="font-mono font-bold text-text-tertiary">{(idx + 1) * 10}</td>
                            <td>
                              <p className="font-bold text-text-primary">{item.description}</p>
                              <p className="text-[10px] text-text-tertiary font-mono mt-0.5">{item.materialCode}</p>
                            </td>
                            <td className="text-right font-mono font-bold tabular-nums">{item.quantity.toLocaleString()}</td>
                            <td className="text-center font-bold">{item.uom}</td>
                            <td className="text-right font-mono text-text-secondary tabular-nums">₹{item.targetPrice.toFixed(2)}</td>
                            <td className="text-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon-sm"
                                onClick={() => handleRemoveLineItem(idx)}
                                title="Remove Item"
                                className="border-transparent"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest block font-mono">SAP Draft Session</span>
              <p className="text-xs font-semibold text-text-primary">ME41 RFQ Document Creation</p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => alert('Draft saved.')}
                variant="outline"
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                variant="default"
                className="px-8"
              >
                Preview &amp; Post RFQ
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  ) : null}

      {/* 3. PREVIEW DRAFT OVERLAY DIALOG */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface rounded-xl border border-border w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-down">
            {/* Modal Header */}
            <div className="p-4 border-b border-border bg-surface2/40 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                  Draft Document Check
                </span>
                <h3 className="font-bold text-sm text-text-primary mt-1">Review SAP RFQ Proposal</h3>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-text-tertiary hover:text-text-primary focus:outline-none transition-colors duration-150 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs text-text-secondary custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 bg-surface2/30 p-4 border border-border rounded-md font-sans">
                <div>
                  <span className="text-[10px] text-text-primary font-bold block uppercase font-mono">RFQ Number </span>
                  <span className="text-sm font-bold font-mono text-text-primary uppercase">{rfqForm.rfqRefNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-primary font-bold block uppercase font-mono">Document Type </span>
                  <span className="text-sm font-bold text-text-primary">{rfqForm.rfqType === 'AN' ? 'AN - Standard RFQ' : 'AB - Outline Agreement RFQ'}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-border">
                  <span className="text-[10px] text-text-primary font-bold block uppercase font-mono">RFQ Description</span>
                  <span className="font-semibold text-text-primary text-xs">{rfqForm.description}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-text-primary border-b border-border pb-1 uppercase font-mono text-[9px] tracking-wider text-text-tertiary">
                  Schedule &amp; Terms
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-[9px] text-text-secondary block font-bold uppercase font-mono">Deadline </span>
                    <span className="font-bold font-mono text-text-primary">{rfqForm.deadlineDate}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-text-secondary font-bold block uppercase font-mono">Binding Period</span>
                    <span className="font-bold font-mono text-text-primary">{rfqForm.bindingPeriod} Days</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-text-secondary block font-bold uppercase font-mono">Payment Terms</span>
                    <span className="font-semibold text-text-primary">{rfqForm.paymentTerms}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-text-primary border-b border-border pb-1 uppercase font-mono text-[9px] tracking-wider text-text-tertiary">
                  Invited Vendors
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedVendors.map(vid => {
                    const v = vendorMasterList.find(vm => vm.id === vid);
                    return (
                      <span key={vid} className="px-2 py-0.5 bg-surface2 border border-border text-text-primary font-bold rounded flex items-center gap-1.5 font-mono text-[10px]">
                        👤 {v ? v.name : vid} ({vid})
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-text-primary border-b border-border pb-1 uppercase font-mono text-[9px] tracking-wider text-text-tertiary">
                  Line Item Details
                </h4>
                <div className="card overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="w-12">Line</th>
                        <th>Material / Item Description</th>
                        <th className="text-right">Quantity</th>
                        <th className="text-center font-mono">UOM</th>
                      </tr>
                    </thead>
                    <tbody className="font-sans">
                      {addedItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="font-mono text-text-tertiary font-bold">{(idx + 1) * 10}</td>
                          <td>
                            <p className="font-bold text-text-primary">{item.materialCode}</p>
                            <p className="text-[9px] text-text-tertiary font-mono">{item.description}</p>
                          </td>
                          <td className="text-right font-bold font-mono text-text-primary tabular-nums">
                            {Number(item.quantity).toLocaleString()}
                          </td>
                          <td className="text-center font-bold text-text-primary">{item.uom}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-surface2/40 border-t border-border flex justify-end gap-3">
              <Button
                onClick={() => setIsPreviewOpen(false)}
                variant="outline"
              >
                Back to Edit
              </Button>
              <Button
                onClick={confirmAndPublishRFQ}
                variant="default"
                className="px-6"
              >
                Confirm &amp; Post RFQ <ArrowRight className="size-3.5" />
              </Button>
            </div>

          </div>
        </div>
      )}

      </div>
    </ErrorBoundary>
  );
}