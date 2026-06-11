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
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Redesigned SAP Fiori Components ---
const SectionHeader = ({ title, icon: Icon }) => (
  <div className="col-span-full mb-4 mt-6 first:mt-0">
    <h3 className="text-xs font-extrabold text-stone-900 tracking-wider uppercase border-b border-stone-200 pb-2 flex items-center gap-2 select-none">
      {Icon && <Icon className="size-4 text-stone-700 shrink-0" />}
      <span>{title}</span>
    </h3>
  </div>
);

const EnterpriseCard = ({ label, required, children, error }) => (
  <div className={`p-4.5 border rounded-xl shadow-xs flex flex-col justify-between min-h-[110px] transition-all duration-200 ${error ? 'border-red-500 ring-1 ring-red-500/50 bg-red-50/5' : 'border-stone-200 hover:border-stone-300 hover:shadow-xs bg-white'
    }`}>
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-xs font-medium text-stone-750 block select-none">{label} {required && <span className="text-red-500 font-bold select-none ml-0.5">*</span>}</span>
    </div>
    <div className="flex-1 flex items-center w-full">
      {children}
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="p-4.5 bg-white border border-stone-200 rounded-xl flex flex-col justify-between min-h-[140px] animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-3.5 w-24 bg-stone-200 rounded" />
      <div className="h-3.5 w-8 bg-stone-100/50 rounded" />
    </div>
    <div className="h-9 w-full bg-stone-100 rounded-lg mt-2" />
    <div className="flex justify-between items-center pt-2 mt-3 border-t border-stone-100">
      <div className="flex gap-1.5">
        <div className="h-4.5 w-10 bg-stone-100 rounded-full" />
        <div className="h-4.5 w-10 bg-stone-100 rounded-full" />
      </div>
      <div className="h-3 w-16 bg-stone-100 rounded" />
    </div>
  </div>
);

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
  const isApproved = state.profile.status === 'Approved';
  const currentVendorCode = state.profile.sapVendorCode || 'VND-CURRENT';

  // 1. Role state defaults to procurement (vendor representative role removed)
  const [userRole, setUserRole] = useState('procurement');

  // 2. Tab selector state
  // Procurement tabs: 'monitor', 'me41', 'me47' (Submit Quotation), 'me48'
  const [activeProcTab, setActiveProcTab] = useState('monitor');

  // 3. ME41 Create RFQ local form states
  const [rfqForm, rfqFormSet] = useState({
    rfqRefNo: '',
    description: '',
    rfqType: 'AN',
    deadlineDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    bindingPeriod: '30',
    paymentTerms: 'NET 30 Days',
    purchasingGroup: '001',
    materialDescription: 'FAST-HEX-M12-050',
    quantityRequired: '10000',
    unitOfMeasure: 'EA'
  });

  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false);

  // 4. ME47 Submit Quotation form states
  const [quoteForm, setQuoteForm] = useState({
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

  const [quoteErrors, setQuoteErrors] = useState({});
  const [isSapMappingActive, setIsSapMappingActive] = useState(false);

  useEffect(() => {
    if (activeProcTab === 'me41' || activeProcTab === 'me47') {
      setTabLoading(true);
      const timer = setTimeout(() => setTabLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [activeProcTab]);

  const materialMasterList = [
    { code: 'FAST-HEX-M12-050', desc: 'Hexagonal Bolt M12 x 50mm Grade 8.8', uom: 'EA', target: 15.50 },
    { code: 'FAST-WASHER-M12', desc: 'Plain Washer M12 Medium Carbon Steel', uom: 'EA', target: 2.20 },
    { code: 'FAST-NUT-M12', desc: 'Hexagonal Nut M12 Grade 8', uom: 'EA', target: 4.80 },
    { code: 'PIP-FLG-SS316-04', desc: 'Weld Neck Flange 4 inch Class 150 SS316', uom: 'EA', target: 2450.00 },
    { code: 'MECH-GASK-001', desc: 'Spiral Wound Gasket 3 inch SS316/Graphite', uom: 'EA', target: 320.00 }
  ];


  const [selectedVendors, setSelectedVendors] = useState(['VND-4001', 'VND-4002']);

  const vendorMasterList = [
    { id: 'VND-4001', name: 'Apex Fasteners', rating: 92, category: 'Fasteners & Hardware' },
    { id: 'VND-4002', name: 'Quality Steel Corp', rating: 88, category: 'Raw Materials & Piping' },
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
        companyCode: '1000',
        purchasingOrg: '1000',
        currency: 'INR',
        incoterms: 'EXW',
        deliveryLocation: 'Plant 1000 (Mumbai)',
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
        unitOfMeasure: 'EA'
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

  const getRfqStatusBadge = (status) => {
    switch (status) {
      case 'Draft': return 'bg-stone-100 text-stone-700 border-stone-200';
      case 'Bidding Open': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Submitted': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Under Review': return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'Awarded': return 'bg-emerald-50 text-emerald-700 border-emerald-250 font-bold';
      case 'Closed': return 'bg-red-50 text-red-700 border-red-200 font-bold';
      default: return 'bg-stone-50 text-stone-500 border-stone-200';
    }
  };

  return (
    <div className="space-y-6 max-w-full animate-fade-in pb-20">

      {/* PROCUREMENT SUB NAVIGATION */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveProcTab('monitor')}
          className={`pb-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${activeProcTab === 'monitor'
            ? 'border-stone-850 text-stone-900'
            : 'border-transparent text-stone-450 hover:text-stone-750'
            }`}
        >
          <ClipboardList className="size-4" /> RFQ Monitor &amp; History
        </button>
        <button
          onClick={() => setActiveProcTab('me41')}
          className={`pb-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${activeProcTab === 'me41'
            ? 'border-stone-850 text-stone-900'
            : 'border-transparent text-stone-450 hover:text-stone-750'
            }`}
        >
          <Plus className="size-4" /> Create RFQ (ME41)
        </button>
        <button
          onClick={() => setActiveProcTab('me47')}
          className={`pb-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${activeProcTab === 'me47'
            ? 'border-stone-850 text-stone-900'
            : 'border-transparent text-stone-450 hover:text-stone-750'
            }`}
        >
          <Percent className="size-4" /> Submit Quotation (ME47)
        </button>
        <button
          onClick={() => setActiveProcTab('me48')}
          className={`pb-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${activeProcTab === 'me48'
            ? 'border-stone-850 text-stone-900'
            : 'border-transparent text-stone-450 hover:text-stone-750'
            }`}
        >
          <Layers className="size-4" /> Evaluate &amp; Award (ME48)
        </button>
      </div>

      {/* PROCUREMENT SUB-TAB: MONITOR */}
      {activeProcTab === 'monitor' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">RFQ Purchasing Records</h3>
              <p className="text-[11px] text-stone-500 mt-0.5">Active requests for quotation (SAP database records)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {state.rfqs.map(rfq => (
              <div key={rfq.id} className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs space-y-4 hover:border-stone-300 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold font-mono text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded">
                        {rfq.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRfqStatusBadge(rfq.status)}`}>
                        {rfq.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-stone-900 pt-1">{rfq.description}</h4>
                  </div>

                  <div className="text-right text-xs">
                    <p className="text-stone-450 font-medium">Deadline: <span className="text-stone-750 font-bold font-mono">{rfq.deadlineDate}</span></p>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">Purchasing Org: {rfq.purchasingOrg} / Grp: {rfq.purchasingGroup}</p>
                  </div>
                </div>

                {/* Timeline Tracker */}
                <div className="bg-stone-50/50 border border-stone-150 p-4 rounded-xl space-y-3">
                  <h5 className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">RFQ Audit Workflow &amp; SAP Status Tracking</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-2 border border-stone-200 rounded-lg bg-white">
                      <span className="text-[9px] text-stone-400 uppercase block font-semibold">ME41 Create</span>
                      <span className="font-bold text-stone-900 flex items-center gap-1 mt-1">
                        <CheckCircle2 className="size-3.5 text-emerald-600" /> Published
                      </span>
                      <span className="text-[9px] font-mono text-stone-500 block mt-0.5">{rfq.createdDate}</span>
                    </div>

                    <div className="p-2 border border-stone-200 rounded-lg bg-white">
                      <span className="text-[9px] text-stone-400 uppercase block font-semibold">ME47 Quotation</span>
                      <span className={`font-bold mt-1 flex items-center gap-1 ${rfq.bids?.length > 0 ? 'text-stone-900' : 'text-stone-400'}`}>
                        {rfq.bids?.length > 0 ? (
                          <>
                            <CheckCircle2 className="size-3.5 text-emerald-600" /> {rfq.bids.length} Bid(s) Recd
                          </>
                        ) : (
                          <>
                            <Clock className="size-3.5 text-stone-450 animate-pulse" /> Pending Bids
                          </>
                        )}
                      </span>
                      <span className="text-[9px] font-mono text-stone-500 block mt-0.5">Deadline: {rfq.deadlineDate}</span>
                    </div>

                    <div className="p-2 border border-stone-200 rounded-lg bg-white">
                      <span className="text-[9px] text-stone-400 uppercase block font-semibold">ME48 Evaluation</span>
                      <span className={`font-bold mt-1 flex items-center gap-1 ${rfq.status === 'Awarded' || rfq.status === 'Under Review' ? 'text-stone-900' : 'text-stone-400'}`}>
                        {rfq.status === 'Awarded' ? (
                          <>
                            <CheckCircle2 className="size-3.5 text-emerald-600" /> Evaluated
                          </>
                        ) : rfq.bids?.length > 0 ? (
                          <>
                            <Clock className="size-3.5 text-amber-500 animate-pulse" /> Review Ready
                          </>
                        ) : (
                          'Pending Review'
                        )}
                      </span>
                      <span className="text-[9px] text-stone-505 block mt-0.5">Score weights active</span>
                    </div>

                    <div className="p-2 border border-stone-200 rounded-lg bg-white">
                      <span className="text-[9px] text-stone-400 uppercase block font-semibold">ME58 PO Generation</span>
                      <span className={`font-bold mt-1 flex items-center gap-1 ${rfq.status === 'Awarded' ? 'text-stone-900' : 'text-stone-400'}`}>
                        {rfq.status === 'Awarded' ? (
                          <>
                            <CheckCircle2 className="size-3.5 text-emerald-600" /> PO Synced
                          </>
                        ) : (
                          'PO Pending'
                        )}
                      </span>
                      <span className="text-[9px] font-mono text-stone-500 block mt-0.5">
                        {rfq.status === 'Awarded' ? 'Conversion Completed' : 'Pending Award'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items brief */}
                <div className="flex justify-between items-center pt-2 border-t border-stone-100 text-xs">
                  <p className="text-stone-500 font-medium">
                    Contains <strong className="text-stone-850 font-bold">{rfq.items.length} materials</strong> lines &bull; Delivery location: {rfq.deliveryLocation}
                  </p>

                  <div className="space-x-3">
                    {rfq.bids?.length > 0 && rfq.status !== 'Awarded' && (
                      <Button
                        onClick={() => {
                          setSelectedRfqEvalId(rfq.id);
                          setActiveProcTab('me48');
                        }}
                        variant="outline"
                        className="border-stone-300 text-stone-750 hover:bg-stone-100 font-bold text-xs"
                      >
                        Open Bid Evaluation Matrix ({rfq.bids.length} Bids)
                      </Button>
                    )}
                    {rfq.status === 'Awarded' && (
                      <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded font-bold">
                        Awarded to {rfq.awardedVendorName || 'Synced Vendor'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* PROCUREMENT SUB-TAB: ME41 (Create RFQ Form) */}
      {activeProcTab === 'me41' && (
        <div className="space-y-6">
          {tabLoading ? (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="h-4.5 w-48 bg-stone-200 rounded animate-pulse mb-1.5" />
                <div className="h-3 w-80 bg-stone-150 rounded animate-pulse" />
              </div>

              <div className="space-y-3">
                <div className="h-4.5 w-28 bg-stone-200 rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                  <div className="md:col-span-3">
                    <SkeletonCard />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-4.5 w-36 bg-stone-200 rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePublishRFQSubmit} className="space-y-6 relative">

              {isLoading && (
                <div className="absolute inset-0 bg-stone-100/75 backdrop-blur-xs flex flex-col items-center justify-center z-30 rounded-xl min-h-[400px]">
                  <div className="size-10 border-4 border-stone-850 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-xs font-bold text-stone-900 uppercase tracking-widest font-mono">BAPI_RFQ_CREATE Posting to SAP ERP...</p>
                  <p className="text-[10px] text-stone-500 mt-1">Establishing RFC connection &amp; writing database records</p>
                </div>
              )}

              {/* 1. RFQ HEADER */}
              <div className="space-y-4">
                <SectionHeader title="RFQ Header" icon={FileText} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <EnterpriseCard
                      label="RFQ Reference No."
                      required
                      dataType="CHAR"
                      length="LEN 10"
                      tableField="EKKO-EBELN"
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
                        className="w-full bg-white border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 rounded-lg py-2 px-3 text-xs outline-none text-stone-900 transition-all font-mono uppercase font-bold"
                      />
                    </EnterpriseCard>
                  </div>

                  <EnterpriseCard
                    label="Document Type"
                    required
                    dataType="CHAR"
                    length="LEN 4"
                    tableField="EKKO-BSART"
                    error={formErrors.rfqType}
                  >
                    <select
                      value={rfqForm.rfqType}
                      onChange={e => {
                        rfqFormSet({ ...rfqForm, rfqType: e.target.value });
                        if (formErrors.rfqType) setFormErrors({ ...formErrors, rfqType: false });
                      }}
                      className="w-full bg-white border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 rounded-lg py-2 px-3 text-xs outline-none text-stone-900 transition-all font-semibold"
                    >
                      <option value="AN">AN - Standard RFQ</option>
                      <option value="AB">AB - Outline Agreement RFQ</option>
                    </select>
                  </EnterpriseCard>

                  <div className="md:col-span-3">
                    <EnterpriseCard
                      label="RFQ Description"
                      required
                      dataType="CHAR"
                      length="LEN 40"
                      tableField="EKKO-TXZ01"
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
                        className="w-full bg-white border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 rounded-lg py-2 px-3 text-xs outline-none text-stone-900 transition-all resize-none"
                      />
                    </EnterpriseCard>
                  </div>
                </div>
              </div>

              {/* 2. SCHEDULE & TERMS */}
              <div className="space-y-4">
                <SectionHeader title="Schedule & Terms" icon={Calendar} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <EnterpriseCard
                    label="Quotation Deadline"
                    required
                    dataType="DATE"
                    length="LEN 8"
                    tableField="EKKO-ANGDT"
                    error={formErrors.deadlineDate}
                  >
                    <div className="relative w-full">
                      <input
                        type="date"
                        required
                        value={rfqForm.deadlineDate}
                        onChange={e => {
                          rfqFormSet({ ...rfqForm, deadlineDate: e.target.value });
                          if (formErrors.deadlineDate) setFormErrors({ ...formErrors, deadlineDate: false });
                        }}
                        className="w-full bg-white border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 rounded-lg py-2 pl-3 pr-10 text-xs outline-none text-stone-900 transition-all font-mono"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
                    </div>
                  </EnterpriseCard>

                  <EnterpriseCard
                    label="Binding Period (Days)"
                    dataType="NUMC"
                    length="LEN 3"
                    tableField="EKKO-BNDDT"
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
                      className="w-full bg-white border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 rounded-lg py-2 px-3 text-xs outline-none text-stone-900 transition-all font-mono font-bold"
                    />
                  </EnterpriseCard>

                  <EnterpriseCard
                    label="Payment Terms"
                    dataType="CHAR"
                    length="LEN 4"
                    tableField="EKKO-ZTERM"
                  >
                    <select
                      value={rfqForm.paymentTerms}
                      onChange={e => rfqFormSet({ ...rfqForm, paymentTerms: e.target.value })}
                      className="w-full bg-white border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 rounded-lg py-2 px-3 text-xs outline-none text-stone-900 transition-all font-semibold"
                    >
                      <option value="NET 30 Days">NET 30 Days</option>
                      <option value="NET 45 Days">NET 45 Days</option>
                      <option value="NET 60 Days">NET 60 Days</option>
                      <option value="Immediate">Immediate / COD</option>
                    </select>
                  </EnterpriseCard>
                </div>
              </div>

              {/* 3. VENDOR SELECTION */}
              <div className="space-y-4">
                <SectionHeader title="Vendor Selection" icon={User} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EnterpriseCard
                    label="Vendors to Invite"
                    required
                    dataType="CHAR"
                    length="LEN 10"
                    tableField="EKKO-LIFNR"
                    error={formErrors.selectedVendors}
                  >
                    <div className="w-full relative">
                      <div className="flex flex-wrap gap-1.5 p-1.5 border border-stone-300 rounded-lg bg-white min-h-[38px] focus-within:border-stone-800 focus-within:ring-1 focus-within:ring-stone-800 transition-all">
                        {selectedVendors.map(vid => {
                          const v = vendorMasterList.find(vm => vm.id === vid);
                          return (
                            <span key={vid} className="inline-flex items-center gap-1 bg-stone-100 text-stone-800 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-stone-200">
                              {v ? v.name : vid} ({vid})
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = selectedVendors.filter(id => id !== vid);
                                  setSelectedVendors(filtered);
                                  if (filtered.length === 0) setFormErrors({ ...formErrors, selectedVendors: true });
                                }}
                                className="text-stone-400 hover:text-stone-605 focus:outline-none ml-0.5 cursor-pointer"
                              >
                                <X className="size-3" />
                              </button>
                            </span>
                          );
                        })}
                        <input
                          type="text"
                          placeholder={selectedVendors.length === 0 ? "Search vendors to invite..." : ""}
                          value={vendorSearch}
                          onChange={e => {
                            setVendorSearch(e.target.value);
                            setVendorDropdownOpen(true);
                          }}
                          onFocus={() => setVendorDropdownOpen(true)}
                          className="flex-1 bg-transparent border-0 outline-none text-xs text-stone-900 p-1 min-w-[120px]"
                        />
                        <button
                          type="button"
                          onClick={() => setVendorDropdownOpen(!vendorDropdownOpen)}
                          className="text-stone-400 hover:text-stone-650 focus:outline-none px-1"
                        >
                          <ChevronDown className="size-4" />
                        </button>
                      </div>

                      {vendorDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-5" onClick={() => setVendorDropdownOpen(false)} />
                          <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
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
                                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-stone-50 flex items-center justify-between border-b border-stone-100 last:border-0 ${isSelected ? 'bg-stone-50/70 font-semibold' : ''
                                      }`}
                                  >
                                    <div>
                                      <span className="font-bold text-stone-955">{vendor.name}</span>
                                      <span className="font-mono text-stone-400 ml-2">({vendor.id})</span>
                                    </div>
                                    {isSelected && <span className="text-stone-700 text-xs">✓</span>}
                                  </div>
                                );
                              })}
                          </div>
                        </>
                      )}
                    </div>
                  </EnterpriseCard>

                  <EnterpriseCard
                    label="Purchasing Group"
                    required
                    dataType="CHAR"
                    length="LEN 3"
                    tableField="EKKO-EKGRP"
                    error={formErrors.purchasingGroup}
                  >
                    <select
                      value={rfqForm.purchasingGroup}
                      onChange={e => {
                        rfqFormSet({ ...rfqForm, purchasingGroup: e.target.value });
                        if (formErrors.purchasingGroup) setFormErrors({ ...formErrors, purchasingGroup: false });
                      }}
                      className="w-full bg-white border border-stone-300 focus:border-stone-850 focus:ring-1 focus:ring-stone-850 rounded-lg py-2 px-3 text-xs outline-none text-stone-900 transition-all font-semibold"
                    >
                      <option value="001">001 - Raw Materials</option>
                      <option value="002">002 - Steel & Piping</option>
                      <option value="003">003 - Fasteners</option>
                      <option value="100">100 - General Services</option>
                    </select>
                  </EnterpriseCard>
                </div>
              </div>              {/* 4. LINE ITEMS */}
              <div className="space-y-4">
                <SectionHeader title="Line Items Entry" icon={ClipboardList} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <EnterpriseCard
                      label="Material / Item Description"
                      dataType="CHAR"
                      length="LEN 18"
                      tableField="EKPO-MATNR/TXZ01"
                      error={formErrors.materialDescription}
                    >
                      <div className="w-full relative">
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
                            className="w-full bg-white border border-stone-300 focus:border-stone-850 focus:ring-1 focus:ring-stone-850 rounded-lg py-2 pl-3 pr-10 text-xs outline-none text-stone-900 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setMaterialDropdownOpen(!materialDropdownOpen)}
                            className="absolute right-3 text-stone-400 hover:text-stone-605 focus:outline-none cursor-pointer"
                          >
                            <ChevronDown className="size-4" />
                          </button>
                        </div>

                        {materialDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-5" onClick={() => setMaterialDropdownOpen(false)} />
                            <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
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
                                    className="px-3 py-2 text-xs cursor-pointer hover:bg-stone-50 border-b border-stone-100 last:border-0"
                                  >
                                    <div className="font-bold text-stone-955">{mat.code}</div>
                                    <div className="text-stone-500 text-[10px] truncate">{mat.desc}</div>
                                  </div>
                                ))}
                            </div>
                          </>
                        )}
                      </div>
                    </EnterpriseCard>
                  </div>

                  <EnterpriseCard
                    label="Quantity Required"
                    dataType="QUAN"
                    length="LEN 13"
                    tableField="EKPO-MENGE"
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
                      className="w-full bg-white border border-stone-300 focus:border-stone-850 focus:ring-1 focus:ring-stone-850 rounded-lg py-2 px-3 text-xs outline-none text-stone-900 transition-all font-mono font-bold"
                    />
                  </EnterpriseCard>

                  <EnterpriseCard
                    label="Unit of Measure"
                    dataType="UNIT"
                    length="LEN 3"
                    tableField="EKPO-MEINS"
                    error={formErrors.unitOfMeasure}
                  >
                    <select
                      value={rfqForm.unitOfMeasure}
                      onChange={e => {
                        rfqFormSet({ ...rfqForm, unitOfMeasure: e.target.value });
                        if (formErrors.unitOfMeasure) setFormErrors({ ...formErrors, unitOfMeasure: false });
                      }}
                      className="w-full bg-white border border-stone-300 focus:border-stone-850 focus:ring-1 focus:ring-stone-850 rounded-lg py-2 px-3 text-xs outline-none text-stone-900 transition-all font-semibold"
                    >
                      <option value="EA">EA - Each</option>
                      <option value="PC">PC - Piece</option>
                      <option value="KG">KG - Kilogram</option>
                      <option value="MTR">MTR - Meter</option>
                      <option value="NOS">NOS - Number</option>
                    </select>
                  </EnterpriseCard>

                  <div className="flex items-end justify-end p-2.5">
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="w-full bg-stone-800 hover:bg-black text-white hover:text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="size-4" /> Add Line Item
                    </button>
                  </div>

                  {/* Dynamic Items Table */}
                  <div className="md:col-span-3 space-y-2 pt-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Currently Added Items ({addedItems.length})</label>
                    {addedItems.length === 0 ? (
                      <div className="p-6 rounded-xl border border-dashed border-stone-300 bg-stone-50/50 text-center text-xs text-stone-500 shadow-sm">
                        No items added to this RFQ yet. Enter details above and click "Add Line Item".
                      </div>
                    ) : (
                      <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-xs">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-stone-50 border-b border-stone-200 font-bold text-[9px] text-stone-505 uppercase tracking-wider">
                              <th className="py-2.5 px-4 w-12">Line</th>
                              <th className="py-2.5 px-4">Material / Item Description</th>
                              <th className="py-2.5 px-4 text-right">Quantity</th>
                              <th className="py-2.5 px-4 text-center">UoM</th>
                              <th className="py-2.5 px-4 text-right">Target Price (₹)</th>
                              <th className="py-2.5 px-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 text-[11px] text-stone-700">
                            {addedItems.map((item, idx) => (
                              <tr key={idx} className="hover:bg-stone-50/20">
                                <td className="py-2.5 px-4 font-mono font-bold text-stone-450">{(idx + 1) * 10}</td>
                                <td className="py-2.5 px-4">
                                  <p className="font-semibold text-stone-900">{item.description}</p>
                                  <p className="text-[10px] text-stone-400 font-mono mt-0.5">{item.materialCode}</p>
                                </td>
                                <td className="py-2.5 px-4 text-right font-mono font-semibold">{item.quantity.toLocaleString()}</td>
                                <td className="py-2.5 px-4 text-center font-semibold">{item.uom}</td>
                                <td className="py-2.5 px-4 text-right font-mono text-stone-600">₹{item.targetPrice.toFixed(2)}</td>
                                <td className="py-2.5 px-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLineItem(idx)}
                                    className="text-stone-400 hover:text-red-650 p-1.5 rounded transition-colors cursor-pointer"
                                    title="Remove Item"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
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

              {/* STICKY BOTTOM ACTION BAR */}
              <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xs border border-stone-250/70 p-4 rounded-xl flex items-center justify-between gap-4 shadow-lg z-10 mt-8 transition-all duration-150 hover:shadow-xl">
                <div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block font-mono">SAP Draft Session</span>
                  <p className="text-xs font-semibold text-stone-800">ME41 RFQ Document Creation</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => {
                      alert('Draft saved in local memory.');
                    }}
                    variant="outline"
                    className="border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs"
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    className="bg-stone-850 hover:bg-black text-stone-700 hover:text-white font-bold text-xs px-8 rounded-lg"
                  >
                    Preview &amp; Post RFQ
                  </Button>
                </div>
              </div>

            </form>
          )}
        </div>
      )}

      {/* PROCUREMENT SUB-TAB: ME47 (Submit Quotation Form) */}
      {activeProcTab === 'me47' && (
        <div className="space-y-6">
          {tabLoading ? (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="h-4.5 w-48 bg-stone-200 rounded animate-pulse mb-1.5" />
                <div className="h-3 w-80 bg-stone-150 rounded animate-pulse" />
              </div>

              <div className="space-y-3">
                <div className="h-4.5 w-28 bg-stone-200 rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-4.5 w-36 bg-stone-200 rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleQuotationSubmit} className="space-y-6 relative">

              {isLoading && (
                <div className="absolute inset-0 bg-stone-100/75 backdrop-blur-xs flex flex-col items-center justify-center z-30 rounded-xl min-h-[400px]">
                  <div className="size-10 border-4 border-stone-850 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-xs font-bold text-stone-900 uppercase tracking-widest font-mono">BAPI_QUOTATION_CREATE Posting to SAP ERP...</p>
                  <p className="text-[10px] text-stone-500 mt-1">Updating Info Records &amp; synchronization with SAP database (ME47)...</p>
                </div>
              )}

              {/* macOS-style Window Address Bar Wrapper */}
              {/* <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-md p-3 flex items-center gap-3">
                <div className="flex gap-1.5 shrink-0 pl-1">
                  <div className="size-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="size-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="size-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex-1 bg-stone-800/80 border border-stone-700/50 rounded-md py-1 px-3 flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <div className="flex items-center gap-1 truncate">
                    <span className="text-stone-500">https://</span>
                    <span>vendorportal.app</span>
                    <span className="text-stone-500">/</span>
                    <span>rfq</span>
                    <span className="text-stone-500">/</span>
                    <span className="text-stone-200 font-bold">qt</span>
                  </div>
                  <span className="text-[9px] text-stone-500 uppercase tracking-widest shrink-0 font-semibold pl-2">ME47 Maintain Quotation</span>
                </div>
              </div> */}

              {/* Header Title with Toggles */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-bold text-stone-900">Maintain Quotation (ME47)</h3>

                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">Submit proposal prices, discount structures and delivery timelines directly to SAP</p>
                </div>

                {/* Form View / SAP Mapping Toggle Removed */}
              </div>

              {/* RFQ Selection Dropdown and Details */}
              {(() => {
                const selectedRfq = state.rfqs.find(r => r.id === quoteForm.rfqId);
                return (
                  <div className={`p-4.5 bg-white border rounded-xl shadow-xs space-y-4 ${quoteErrors.rfqId ? 'border-red-500 ring-1 ring-red-500/50 bg-red-50/5' : 'border-stone-200'
                    }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-[11px] font-bold text-stone-750 uppercase tracking-wider font-mono">Select RFQ Document</h4>
                        <p className="text-[10px] text-stone-400 mt-0.5">Choose an active RFQ from the SAP ERP system to quote for</p>
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
                            if (quoteErrors.rfqId) setQuoteErrors({ ...quoteErrors, rfqId: false });
                          }}
                          className={`bg-white border rounded-lg px-3 py-2 text-xs outline-none font-semibold text-stone-900 transition-all ${quoteErrors.rfqId ? 'border-red-500 focus:border-red-600' : 'border-stone-300 focus:border-stone-850'
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
                      <div className="bg-stone-50/50 border border-stone-200 p-4 rounded-xl space-y-3 mt-2">
                        <div className="flex items-center justify-between border-b border-stone-150 pb-2">
                          <h5 className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">RFQ Line Item Details (Selected for Quotation)</h5>
                          <span className="font-mono text-[9px] text-stone-600 font-bold bg-stone-200/60 px-2 py-0.5 rounded">
                            Status: {selectedRfq.status}
                          </span>
                        </div>

                        {/* Line Item selector if multiple items */}
                        {selectedRfq.items.length > 1 && (
                          <div className="flex flex-wrap items-center gap-2 py-1">
                            <span className="text-[9px] font-bold text-stone-450 uppercase tracking-wider mr-1">Select Line Item:</span>
                            {selectedRfq.items.map(item => (
                              <button
                                key={item.line}
                                type="button"
                                onClick={() => setQuoteForm({ ...quoteForm, selectedLine: item.line })}
                                className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border transition-all ${Number(quoteForm.selectedLine) === item.line
                                  ? 'bg-stone-850 text-stone-50 border-stone-850'
                                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1 text-xs font-sans text-stone-750">
                              <div>
                                <span className="text-[9px] text-stone-400 block font-semibold uppercase">Material Code</span>
                                <span className="font-bold text-stone-900 font-mono">{selectedItem.materialCode}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-stone-400 block font-semibold uppercase">Description</span>
                                <span className="font-bold text-stone-900 truncate block max-w-[200px]">{selectedItem.description}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-stone-400 block font-semibold uppercase">Required Quantity</span>
                                <span className="font-bold text-stone-900 font-mono">{selectedItem.quantity.toLocaleString()} {selectedItem.uom}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-stone-400 block font-semibold uppercase">Target Price Reference</span>
                                <span className="font-bold text-stone-900 font-mono">₹{selectedItem.targetPrice?.toFixed(2)}</span>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <EnterpriseCard
                    label="Your Quote Reference"
                    dataType="CHAR"
                    length="LEN 12"
                    tableField="EKKO-IHREZ"
                    highlightTableField={isSapMappingActive}
                  >
                    <input
                      type="text"
                      placeholder="e.g. QT-2026-001"
                      value={quoteForm.quoteRef}
                      onChange={e => setQuoteForm({ ...quoteForm, quoteRef: e.target.value })}
                      className="w-full bg-white border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 rounded-lg py-2 px-3 text-xs outline-none text-stone-900 transition-all font-mono uppercase"
                    />
                  </EnterpriseCard>

                  <EnterpriseCard
                    label="Quotation Date"
                    required
                    dataType="DATS"
                    length="LEN 8"
                    tableField="EKKO-ANGDT"
                    error={quoteErrors.quoteDate}
                    highlightTableField={isSapMappingActive}
                  >
                    <div className="relative w-full">
                      <input
                        type="date"
                        required
                        value={quoteForm.quoteDate}
                        onChange={e => {
                          setQuoteForm({ ...quoteForm, quoteDate: e.target.value });
                          if (quoteErrors.quoteDate) setQuoteErrors({ ...quoteErrors, quoteDate: false });
                        }}
                        className="w-full bg-white border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 rounded-lg py-2 pl-3 pr-10 text-xs outline-none text-stone-900 transition-all font-mono"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
                    </div>
                  </EnterpriseCard>

                  <EnterpriseCard
                    label="Validity Date"
                    required
                    dataType="DATS"
                    length="LEN 8"
                    tableField="EKKO-BNDDT"
                    error={quoteErrors.validityDate}
                    highlightTableField={isSapMappingActive}
                  >
                    <div className="relative w-full">
                      <input
                        type="date"
                        required
                        value={quoteForm.validityDate}
                        onChange={e => {
                          setQuoteForm({ ...quoteForm, validityDate: e.target.value });
                          if (quoteErrors.validityDate) setQuoteErrors({ ...quoteErrors, validityDate: false });
                        }}
                        className="w-full bg-white border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 rounded-lg py-2 pl-3 pr-10 text-xs outline-none text-stone-900 transition-all font-mono"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
                    </div>
                  </EnterpriseCard>
                </div>
              </div>

              {/* 2. LINE ITEM PRICING */}
              <div className="space-y-4">
                <SectionHeader title="Line Item Pricing" icon={Percent} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <EnterpriseCard
                    label="Unit Price (₹)"
                    required
                    dataType="CURR"
                    length="LEN 11"
                    tableField="EKPO-PREIS"
                    error={quoteErrors.unitPrice}
                    highlightTableField={isSapMappingActive}
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
                        if (quoteErrors.unitPrice) setQuoteErrors({ ...quoteErrors, unitPrice: false });
                      }}
                      className="w-full bg-white border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 rounded-lg py-2 px-3 text-xs outline-none text-stone-900 transition-all font-mono font-normal"
                    />
                  </EnterpriseCard>

                  <EnterpriseCard
                    label="GST Rate (%)"
                    required
                    dataType="CHAR"
                    length="LEN 2"
                    tableField="EKPO-MWSKZ"
                    error={quoteErrors.gstRate}
                    highlightTableField={isSapMappingActive}
                  >
                    <select
                      value={quoteForm.gstRate}
                      onChange={e => {
                        setQuoteForm({ ...quoteForm, gstRate: e.target.value });
                        if (quoteErrors.gstRate) setQuoteErrors({ ...quoteErrors, gstRate: false });
                      }}
                      className="w-full bg-white border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 rounded-lg py-2 px-3 text-xs outline-none text-stone-900 transition-all font-semibold"
                    >
                      <option value="18%">18% - G1</option>
                      <option value="12%">12% - G2</option>
                      <option value="5%">5% - G3</option>
                      <option value="28%">28% - G4</option>
                      <option value="Exempt">Exempt - G0</option>
                    </select>
                  </EnterpriseCard>

                  <EnterpriseCard
                    label="Discount (%)"
                    dataType="DEC"
                    length="LEN 5"
                    tableField="KONV-SKVAL"
                    highlightTableField={isSapMappingActive}
                  >
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0"
                      value={quoteForm.discount}
                      onChange={e => setQuoteForm({ ...quoteForm, discount: e.target.value })}
                      className="w-full bg-white border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 rounded-lg py-2 px-3 text-xs outline-none text-stone-900 transition-all font-mono"
                    />
                  </EnterpriseCard>
                </div>
              </div>

              {/* 3. DELIVERY TERMS */}
              <div className="space-y-4">
                <SectionHeader title="Delivery Terms" icon={Clock} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <EnterpriseCard
                    label="Delivery Lead Time (Days)"
                    required
                    dataType="NUMC"
                    length="LEN 5"
                    tableField="EKPO-PLIFZ"
                    error={quoteErrors.deliveryLeadTime}
                    highlightTableField={isSapMappingActive}
                  >
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="7"
                      value={quoteForm.deliveryLeadTime}
                      onChange={e => {
                        setQuoteForm({ ...quoteForm, deliveryLeadTime: e.target.value });
                        if (quoteErrors.deliveryLeadTime) setQuoteErrors({ ...quoteErrors, deliveryLeadTime: false });
                      }}
                      className="w-full bg-white border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 rounded-lg py-2 px-3 text-xs outline-none text-stone-900 transition-all font-mono font-normal"
                    />
                  </EnterpriseCard>

                  <EnterpriseCard
                    label="Freight / Packing (₹)"
                    dataType="CURR"
                    length="LEN 11"
                    tableField="EKPO-APRPV"
                    highlightTableField={isSapMappingActive}
                  >
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={quoteForm.freight}
                      onChange={e => setQuoteForm({ ...quoteForm, freight: e.target.value })}
                      className="w-full bg-white border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 rounded-lg py-2 px-3 text-xs outline-none text-stone-900 transition-all font-mono"
                    />
                  </EnterpriseCard>

                  <EnterpriseCard
                    label="Incoterms"
                    dataType="CHAR"
                    length="LEN 3"
                    tableField="EKKO-INCO1"
                    highlightTableField={isSapMappingActive}
                  >
                    <select
                      value={quoteForm.incoterms}
                      onChange={e => setQuoteForm({ ...quoteForm, incoterms: e.target.value })}
                      className="w-full bg-white border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 rounded-lg py-2 px-3 text-xs outline-none text-stone-900 transition-all font-semibold"
                    >
                      <option value="EXW">EXW - Ex Works</option>
                      <option value="FOB">FOB - Free on Board</option>
                      <option value="CIF">CIF - Cost, Insurance &amp; Freight</option>
                      <option value="FOR">FOR - Free on Rail</option>
                      <option value="DDP">DDP - Delivered Duty Paid</option>
                    </select>
                  </EnterpriseCard>
                </div>
              </div>

              {/* STICKY BOTTOM ACTION BAR */}
              <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xs border border-stone-250/70 p-4 rounded-xl flex items-center justify-between gap-4 shadow-lg z-10 mt-8 transition-all duration-150 hover:shadow-xl">
                <div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block font-mono">SAP Info Record Session</span>
                  <p className="text-xs font-semibold text-stone-800">ME47 Maintain Quotation Bids</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => {
                      alert('Quotation Draft saved in local memory.');
                    }}
                    variant="outline"
                    className="border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs"
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    className="bg-stone-850 hover:bg-black text-stone-700 hover:text-white font-bold text-xs px-8 rounded-lg"
                  >
                    Submit Quotation
                  </Button>
                </div>
              </div>

            </form>
          )}
        </div>
      )}

      {/* PROCUREMENT SUB-TAB: ME48 (Quotation Evaluation dashboard) */}
      {activeProcTab === 'me48' && (
        <div className="space-y-6">

          {/* Selection RFQ card */}
          <div className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold text-stone-450 tracking-wider uppercase">Select RFQ for Comparative Analysis</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">Select a quoted or submitted RFQ to view the full bids comparison matrix</p>
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedRfqEvalId}
                  onChange={e => setSelectedRfqEvalId(e.target.value)}
                  className="bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs outline-none font-semibold text-stone-900"
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

                {/* Top KPI Cards (Fiori standards) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Total Bidders</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-stone-900">{scoredVendors.length}</span>
                      <span className="text-xs text-stone-500">vendors</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Lowest Bid Received</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-emerald-700 font-mono">₹{lowestTotalCost.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Average Bid Value</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-stone-900 font-mono">
                        ₹{Math.round(scoredVendors.reduce((s, v) => s + v.totalCost, 0) / scoredVendors.length).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Expected Savings %</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      {(() => {
                        const targetTotal = rfq.items.reduce((sum, item) => sum + item.targetPrice * item.quantity, 0);
                        const savings = targetTotal > 0 ? ((targetTotal - lowestTotalCost) / targetTotal) * 100 : 0;
                        return (
                          <span className="text-2xl font-bold text-emerald-700">
                            {savings > 0 ? `${savings.toFixed(1)}%` : '0.0%'}
                          </span>
                        );
                      })()}
                      <span className="text-[10px] text-stone-400">vs target budget</span>
                    </div>
                  </div>
                </div>

                {/* Comparison Matrix Grid */}
                <div className="p-6 bg-white border border-stone-200 rounded-xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <h4 className="font-bold text-xs text-stone-900">ME48 Comparative Evaluation Matrix</h4>
                    <span className="text-[9px] text-stone-400 uppercase font-mono font-bold">
                      Formula: Price 40% | Tech 30% | Delivery 20% | Rating 10%
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold text-[9px] uppercase">
                          <th className="py-3 px-4">Evaluation Metric</th>
                          {scoredVendors.map(vendor => (
                            <th key={vendor.vendorId} className="py-3 px-4 text-center">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-stone-900 font-bold block">{vendor.vendorName}</span>
                                <span className="text-[9px] text-stone-400 font-mono font-normal">Code: {vendor.vendorId}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-150 text-stone-750 font-sans">
                        {/* Materials Prices */}
                        {rfq.items.map(item => (
                          <tr key={item.line} className="hover:bg-stone-50/20">
                            <td className="py-3 px-4 font-semibold text-stone-900">
                              L{item.line}: {item.description}
                            </td>
                            {scoredVendors.map(vendor => {
                              const bidPrice = vendor.unitPrices[item.line];
                              const target = item.targetPrice;
                              const isLowest = bidPrice === Math.min(...scoredVendors.map(v => v.unitPrices[item.line] || Infinity));
                              return (
                                <td key={vendor.vendorId} className="py-3 px-4 text-center font-mono font-semibold">
                                  <p className={isLowest ? 'text-emerald-700 font-bold' : 'text-stone-850'}>
                                    ₹{bidPrice ? bidPrice.toLocaleString() : 'N/A'}
                                  </p>
                                  <p className="text-[9px] text-stone-400">Target: ₹{target}</p>
                                </td>
                              );
                            })}
                          </tr>
                        ))}

                        {/* Additional Parameters */}
                        <tr className="bg-stone-50/40">
                          <td className="py-2.5 px-4 font-semibold text-stone-700">Estimated Freight (INR)</td>
                          {scoredVendors.map(vendor => (
                            <td key={vendor.vendorId} className="py-2.5 px-4 text-center font-mono">
                              ₹{(vendor.freight || 0).toLocaleString()}
                            </td>
                          ))}
                        </tr>

                        <tr>
                          <td className="py-2.5 px-4 font-semibold text-stone-750">Lead Time (Days) - [PLIFZ]</td>
                          {scoredVendors.map(vendor => (
                            <td key={vendor.vendorId} className="py-2.5 px-4 text-center font-mono">
                              {vendor.deliveryLeadTimeDays} days
                            </td>
                          ))}
                        </tr>

                        <tr>
                          <td className="py-2.5 px-4 font-semibold text-stone-750">Quotation Validity - [BNDDT]</td>
                          {scoredVendors.map(vendor => (
                            <td key={vendor.vendorId} className="py-2.5 px-4 text-center font-mono">
                              {vendor.validityDate || 'N/A'}
                            </td>
                          ))}
                        </tr>

                        <tr>
                          <td className="py-2.5 px-4 font-semibold text-stone-750 font-sans">Min Order Qty (MOQ)</td>
                          {scoredVendors.map(vendor => (
                            <td key={vendor.vendorId} className="py-2.5 px-4 text-center font-mono">
                              {vendor.moq} EA
                            </td>
                          ))}
                        </tr>

                        {/* Scores Row */}
                        <tr className="bg-stone-50/60 font-sans border-t border-stone-200">
                          <td className="py-3 px-4 font-bold text-stone-900">Technical Score</td>
                          {scoredVendors.map(vendor => (
                            <td key={vendor.vendorId} className="py-3 px-4 text-center font-bold text-stone-900">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${vendor.technicalScore === highestTech ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-stone-100 text-stone-600'
                                }`}>
                                {vendor.technicalScore} / 100
                              </span>
                            </td>
                          ))}
                        </tr>

                        <tr className="bg-stone-50/60 font-sans">
                          <td className="py-3 px-4 font-bold text-stone-900">Vendor Master Rating</td>
                          {scoredVendors.map(vendor => (
                            <td key={vendor.vendorId} className="py-3 px-4 text-center font-mono">
                              {vendor.vendorRating} pts
                            </td>
                          ))}
                        </tr>

                        {/* Weighted Score */}
                        <tr className="bg-stone-900 text-white font-sans border-t-2 border-stone-950">
                          <td className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider">Weighted score (calculated)</td>
                          {scoredVendors.map(vendor => {
                            const isWinner = vendor.weightedScore === highestScore;
                            return (
                              <td key={vendor.vendorId} className="py-3.5 px-4 text-center font-bold text-sm">
                                <span className={isWinner ? 'text-amber-400' : 'text-white'}>
                                  {vendor.weightedScore} %
                                </span>
                                {isWinner && (
                                  <span className="block text-[8px] text-amber-400 font-bold uppercase tracking-wider mt-0.5">
                                    ⭐ Recommended Winner
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>

                        {/* System Badges / Recommendations */}
                        <tr className="bg-stone-50/20 font-sans border-b border-stone-200">
                          <td className="py-3 px-4 font-bold text-stone-850">System Evaluation Badges</td>
                          {scoredVendors.map(vendor => {
                            const isLowestTotal = vendor.totalCost === lowestTotalCost;
                            const isBestTech = vendor.technicalScore === highestTech;
                            return (
                              <td key={vendor.vendorId} className="py-3 px-4 text-center">
                                <div className="flex flex-col gap-1 items-center justify-center">
                                  {isLowestTotal && (
                                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-250 text-emerald-700 text-[9px] font-bold rounded">
                                      Lowest Price Vendor
                                    </span>
                                  )}
                                  {isBestTech && (
                                    <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[9px] font-bold rounded">
                                      Best Technical Vendor
                                    </span>
                                  )}
                                  {!isLowestTotal && !isBestTech && <span className="text-stone-400 text-[10px]">-</span>}
                                </div>
                              </td>
                            );
                          })}
                        </tr>

                        {/* Total Cost Value Summary */}
                        <tr className="bg-stone-50/60 font-sans font-bold border-b border-stone-200">
                          <td className="py-3 px-4 text-stone-850">Total Quotation Value (Inc Freight)</td>
                          {scoredVendors.map(vendor => (
                            <td key={vendor.vendorId} className="py-3 px-4 text-center text-sm font-bold text-stone-900 font-mono">
                              ₹{vendor.totalCost.toLocaleString()}
                            </td>
                          ))}
                        </tr>

                        {/* Actions Column */}
                        {rfq.status !== 'Awarded' && (
                          <tr className="font-sans border-t border-stone-200">
                            <td className="py-4 px-4 font-bold text-stone-900">Award Actions [ME58 PO]</td>
                            {scoredVendors.map(vendor => (
                              <td key={vendor.vendorId} className="py-4 px-4 text-center">
                                <Button
                                  onClick={() => triggerPOConversion(rfq.id, vendor.vendorId)}
                                  disabled={isPoConverting}
                                  variant={vendor.weightedScore === highestScore ? 'default' : 'outline'}
                                  className={`font-bold text-[11px] h-8.5 rounded-lg px-4 ${vendor.weightedScore === highestScore
                                    ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 border-transparent shadow-xs'
                                    : 'border-stone-300 text-stone-750 hover:bg-stone-100'
                                    }`}
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
                    <div className="flex justify-end gap-3.5 pt-4 border-t border-stone-100">
                      <Button
                        type="button"
                        onClick={() => {
                          const newDead = prompt('Enter new Bidding Deadline Date (YYYY-MM-DD):', new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                          if (newDead) {
                            reissueRFQ(rfq.id, newDead);
                            setSelectedRfqEvalId('');
                            alert(`RFQ ${rfq.id} successfully re-issued with new deadline: ${newDead}. Bids have been reset.`);
                          }
                        }}
                        variant="outline"
                        className="border-stone-300 text-stone-750 hover:bg-stone-100 font-bold text-xs px-4"
                      >
                        ✗ Re-issue RFQ (Extend &amp; Reset Bids)
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to cancel RFQ ${rfq.id}? This will permanently close the document.`)) {
                            cancelRFQ(rfq.id);
                            setSelectedRfqEvalId('');
                            alert(`RFQ ${rfq.id} has been cancelled.`);
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs px-5 rounded-lg h-9 animate-fade-in"
                      >
                        ✗ Cancel RFQ Document
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })() : (
            <div className="p-8 border border-stone-200 rounded-xl bg-white text-center text-stone-400">
              <Layers className="size-8 mx-auto text-stone-300 mb-3 animate-pulse" />
              <p className="text-xs font-semibold text-stone-700">No RFQ Selected</p>
              <p className="text-[10px] text-stone-500 mt-1">Please select an RFQ with active vendor quotations above to load the evaluation grid.</p>
            </div>
          )}
        </div>
      )}

      {/* 3. PREVIEW DRAFT OVERLAY DIALOG */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-down">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-150 bg-stone-50 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                  Draft Document Check
                </span>
                <h3 className="font-bold text-sm text-stone-900 mt-1">Review SAP RFQ Proposal</h3>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-stone-400 hover:text-stone-605 focus:outline-none transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-800 custom-scrollbar">

              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200/60 font-sans">
                <div>
                  <span className="text-[10px] text-stone-450 font-bold block uppercase font-mono">RFQ Number (EBELN)</span>
                  <span className="text-sm font-bold font-mono text-stone-900 uppercase">{rfqForm.rfqRefNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-455 font-bold block uppercase font-mono">Document Type (BSART)</span>
                  <span className="text-sm font-bold text-stone-900">{rfqForm.rfqType === 'AN' ? 'AN - Standard RFQ' : 'AB - Outline Agreement RFQ'}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-stone-150">
                  <span className="text-[10px] text-stone-450 font-bold block uppercase font-mono">RFQ Description (TXZ01)</span>
                  <span className="font-semibold text-stone-900 text-xs">{rfqForm.description}</span>
                </div>
              </div>

              {/* Schedule & Terms */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 border-b border-stone-150 pb-1 uppercase font-mono text-[10px] tracking-wider text-stone-450">
                  Schedule &amp; Terms
                </h4>
                <div className="grid grid-cols-3 gap-4 font-sans">
                  <div>
                    <span className="text-[9px] text-stone-400 block uppercase font-mono">Deadline (ANGDT)</span>
                    <span className="font-bold font-mono text-stone-900">{rfqForm.deadlineDate}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-400 block uppercase font-mono">Binding Period</span>
                    <span className="font-bold font-mono text-stone-900">{rfqForm.bindingPeriod} Days</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-400 block uppercase font-mono">Payment Terms</span>
                    <span className="font-semibold text-stone-900">{rfqForm.paymentTerms}</span>
                  </div>
                </div>
              </div>

              {/* Invited Vendors */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 border-b border-stone-150 pb-1 uppercase font-mono text-[10px] tracking-wider text-stone-450">
                  Invited Vendors (LIFNR)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedVendors.map(vid => {
                    const v = vendorMasterList.find(vm => vm.id === vid);
                    return (
                      <span key={vid} className="px-2.5 py-1 bg-stone-150/70 border border-stone-200 text-stone-850 font-bold rounded-lg flex items-center gap-1.5 font-mono text-[10px]">
                        👤 {v ? v.name : vid} ({vid})
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 border-b border-stone-150 pb-1 uppercase font-mono text-[10px] tracking-wider text-stone-450">
                  Line Item Details (EKPO)
                </h4>
                <div className="border border-stone-200 rounded-lg overflow-hidden bg-stone-50/20">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold text-[9px] uppercase font-mono">
                        <th className="py-2 px-4 w-12">Line</th>
                        <th className="py-2 px-4">Material / Item Description</th>
                        <th className="py-2 px-4 text-right">Quantity</th>
                        <th className="py-2 px-4 text-center">UOM</th>
                      </tr>
                    </thead>
                    <tbody className="font-sans">
                      {addedItems.map((item, idx) => (
                        <tr key={idx} className="text-stone-700 border-b border-stone-100 last:border-b-0">
                          <td className="py-2.5 px-4 font-mono text-stone-400 font-bold">{(idx + 1) * 10}</td>
                          <td className="py-2.5 px-4">
                            <p className="font-bold text-stone-900">{item.materialCode}</p>
                            <p className="text-[9px] text-stone-400 font-mono">{item.description}</p>
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold font-mono text-stone-900">
                            {Number(item.quantity).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-4 text-center font-bold text-stone-900">{item.uom}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
            <div className="p-4 bg-stone-50 border-t border-stone-150 flex justify-end gap-3">
              <Button
                onClick={() => setIsPreviewOpen(false)}
                variant="outline"
                className="border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs"
              >
                Back to Edit
              </Button>
              <Button
                onClick={confirmAndPublishRFQ}
                variant="default"
                className="bg-stone-850 hover:bg-black text-stone-700 hover:text-white font-bold text-xs px-6 rounded-lg flex items-center gap-1.5"
              >
                Confirm &amp; Post RFQ <ArrowRight className="size-3.5" />
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
