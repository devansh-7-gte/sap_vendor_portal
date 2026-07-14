import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Truck,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Check,
  Upload,
  Trash2,
  Calendar,
  FileText,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Search,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileUploadZone from '@/components/shared/FileUploadZone';

// --- INDIAN STATES CONSTANT ---
const INDIAN_STATES = [
  { code: 'AN', name: 'Andaman & Nicobar Islands' },
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'AR', name: 'Arunachal Pradesh' },
  { code: 'AS', name: 'Assam' },
  { code: 'BR', name: 'Bihar' },
  { code: 'CH', name: 'Chandigarh' },
  { code: 'CG', name: 'Chhattisgarh' },
  { code: 'DN', name: 'Dadra & Nagar Haveli' },
  { code: 'DD', name: 'Daman & Diu' },
  { code: 'DL', name: 'Delhi' },
  { code: 'GA', name: 'Goa' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'HR', name: 'Haryana' },
  { code: 'HP', name: 'Himachal Pradesh' },
  { code: 'JK', name: 'Jammu & Kashmir' },
  { code: 'JH', name: 'Jharkhand' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'KL', name: 'Kerala' },
  { code: 'LA', name: 'Ladakh' },
  { code: 'LD', name: 'Lakshadweep' },
  { code: 'MP', name: 'Madhya Pradesh' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'MN', name: 'Manipur' },
  { code: 'ML', name: 'Meghalaya' },
  { code: 'MZ', name: 'Mizoram' },
  { code: 'NL', name: 'Nagaland' },
  { code: 'OD', name: 'Odisha' },
  { code: 'PY', name: 'Puducherry' },
  { code: 'PB', name: 'Punjab' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'SK', name: 'Sikkim' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'TS', name: 'Telangana' },
  { code: 'TR', name: 'Tripura' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'UK', name: 'Uttarakhand' },
  { code: 'WB', name: 'West Bengal' }
];

// --- STATIC SUBCOMPONENTS ---

// 1. Section Header Component
function SectionHeader({ title, icon: Icon }) {
  return (
    <div className="col-span-full mb-1 mt-4 first:mt-0 select-none">
      <h3 className="text-xs font-bold text-text-primary tracking-wider uppercase border-b-2 border-primary/30 pb-1.5 flex items-center gap-2">
        {Icon && <Icon className="size-4 text-primary shrink-0" />}
        <span>{title}</span>
      </h3>
    </div>
  );
}

// 3. SAP Field Mapping Label
function SAPFieldMapping() {
  return null;
}

// 4. Enterprise Metadata Field Card
function EnterpriseFieldCard({ label, required, error, labelWidth, children }) {
  return (
    <div className={`h-full py-1.5 px-3 bg-surface transition-colors duration-150 flex flex-col sm:flex-row sm:items-center gap-1 select-none ${
      error ? 'bg-red-50/10' : 'hover:bg-surface2/30 focus-within:bg-surface2/50'
    }`}>
      <label className={`text-xs font-bold text-text-secondary ${labelWidth || 'sm:w-48'} shrink-0 whitespace-nowrap select-none block`} title={label}>
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
}

// 5. Accessible Searchable Dropdown
function SearchableSelect({ value, onChange, options, placeholder, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(search.toLowerCase()) ||
    opt.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOpt = options.find(opt => opt.code === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch('');
        }}
        className="w-full flex items-center justify-between bg-base border border-border rounded-md py-1.5 px-3 text-xs outline-none text-text-primary text-left h-9 transition-[border-color] duration-150"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOpt ? 'text-text-primary font-medium' : 'text-text-tertiary'}>
          {selectedOpt ? `${selectedOpt.name} (${selectedOpt.code})` : placeholder}
        </span>
        <ChevronRight className={`size-3 text-text-tertiary transition-transform shrink-0 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-md shadow-[0_1px_4px_rgba(10,15,46,0.08)] max-h-56 overflow-y-auto custom-scrollbar animate-slide-down">
          <div className="p-1.5 border-b border-border sticky top-0 bg-surface flex items-center gap-1.5">
            <Search className="size-3.5 text-text-tertiary shrink-0" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              placeholder="Search..."
              className="w-full text-xs outline-none text-text-primary bg-transparent py-0.5"
              autoFocus
            />
          </div>
          <ul className="py-1" role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <li
                  key={opt.code}
                  role="option"
                  aria-selected={opt.code === value}
                  onClick={() => {
                    onChange(opt.code);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-1.5 text-xs cursor-pointer flex items-center justify-between hover:bg-surface2 text-text-secondary transition-colors duration-150 ${opt.code === value ? 'bg-surface2 text-text-primary font-semibold' : ''
                    }`}
                >
                  <span>{opt.name}</span>
                  <span className="font-mono text-[10px] text-text-tertiary">{opt.code}</span>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-xs text-text-tertiary text-center select-none">No states found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// 6. Accessible Interactive Date Picker (Calendar)
function CustomDatePicker({ value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const years = [];
  const startYear = new Date().getFullYear() - 50;
  const endYear = new Date().getFullYear() + 10;
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }

  const handleYearChange = (year) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
  };

  const handleMonthChange = (month) => {
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handleSelectDay = (day) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const yyyy = selected.getFullYear();
    const mm = String(selected.getMonth() + 1).padStart(2, '0');
    const dd = String(selected.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const renderDays = () => {
    const dayElements = [];
    for (let i = 0; i < firstDayIndex; i++) {
      dayElements.push(<div key={`empty-${i}`} className="h-6"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = value === formattedDate;
      dayElements.push(
        <button
          key={day}
          type="button"
          onClick={() => handleSelectDay(day)}
          className={`h-6 w-full rounded-md text-[11px] font-medium flex items-center justify-center transition-colors duration-150 ${isSelected
            ? 'text-white font-bold'
            : 'text-text-secondary hover:bg-surface2 hover:text-text-primary'
            }`}
          style={isSelected ? { backgroundColor: 'rgb(var(--color-emerald-default-rgb))' } : undefined}
        >
          {day}
        </button>
      );
    }
    return dayElements;
  };

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-base border border-border rounded-md py-1.5 px-3 text-xs outline-none text-text-primary text-left h-9 transition-[border-color] duration-150"
      >
        <span className={value ? 'text-text-primary font-medium' : 'text-text-tertiary'}>
          {value ? value : placeholder}
        </span>
        <Calendar className="size-3.5 text-text-tertiary shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 mt-1 bg-surface border border-border rounded-xl shadow-[0_1px_4px_rgba(10,15,46,0.08)] p-3 w-64 animate-slide-down">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="p-1 hover:bg-surface2 rounded-md text-text-secondary transition-colors duration-150"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <div className="flex items-center gap-1">
              <select
                value={currentDate.getMonth()}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="text-[11px] font-semibold text-text-secondary bg-transparent border-none outline-none cursor-pointer py-0.5 px-1 rounded hover:bg-surface2"
              >
                {MONTHS.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
              <select
                value={currentDate.getFullYear()}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="text-[11px] font-semibold text-text-secondary bg-transparent border-none outline-none cursor-pointer py-0.5 px-1 rounded hover:bg-surface2"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="p-1 hover:bg-surface2 rounded-md text-text-secondary transition-colors duration-150"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-text-tertiary mb-1 select-none border-b border-border pb-1">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {renderDays()}
          </div>
        </div>
      )}
    </div>
  );
}

// 7. Drag and Drop Document Upload Zone Component
function DocumentUploadZone({ fieldName, value, onChange, label, error }) {
  const fileValue = value
    ? (typeof value === 'object' && value.documentId
        ? value
        : { documentId: value, originalName: typeof value === 'object' ? value.originalName || 'file.pdf' : value, url: typeof value === 'object' ? value.url || '#' : '#' })
    : null;

  return (
    <FileUploadZone
      label={label}
      value={fileValue}
      onUploadComplete={(result) => onChange(result)}
      onFileRemoved={() => onChange(null)}
      linkedTo="Profile"
      accept=".pdf,.png,.jpg,.jpeg"
    />
  );
}

// 8. Wizard Progress Indicator (Tabs)
function ProgressIndicator({ steps, currentStep, onStepClick, errors }) {
  return (
    <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border py-3 select-none">
      <div className="max-w-5xl mx-auto px-4 md:px-6 flex items-center justify-between gap-2 md:gap-4 overflow-x-auto custom-scrollbar">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;
          const stepHasErrors = errors[stepNum] && Object.keys(errors[stepNum]).length > 0;

          return (
            <div
              key={stepNum}
              onClick={() => onStepClick && onStepClick(stepNum)}
              className={`flex items-center gap-2 pb-1.5 border-b-2 transition-colors duration-150 whitespace-nowrap cursor-pointer hover:border-primary ${isActive
                ? 'border-primary text-text-primary font-bold'
                : isCompleted
                  ? 'border-emerald-500 text-emerald-text font-semibold'
                  : stepHasErrors
                    ? 'border-red-400 text-red-700 font-semibold'
                    : 'border-transparent text-text-tertiary font-medium'
                }`}
            >
              <span className={`size-5 rounded-full text-[10px] flex items-center justify-center font-bold ${isActive
                ? 'bg-surface2 text-text-primary'
                : isCompleted
                  ? 'text-white'
                  : stepHasErrors
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-surface2 text-text-tertiary border border-border'
                }`}
                style={isCompleted ? { backgroundColor: 'rgb(var(--color-emerald-default-rgb))' } : undefined}
              >
                {isCompleted ? <Check className="size-3 stroke-[3]" /> : stepNum}
              </span>
              <span className="text-xs">{step.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 9. Sticky action footer component
function ActionFooter({ currentStep, onBack, onSaveDraft, onContinue, onSubmit, draftSaving }) {
  return (
    <footer className="sticky bottom-0 z-30 bg-surface border-t border-border py-3.5 px-4 md:px-6 select-none animate-slide-down">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Left Action Elements */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 1}
            onClick={onBack}
          >
            <ChevronLeft className="size-4" /> Back
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={draftSaving}
          >
            {draftSaving ? (
              <>
                <RefreshCw className="size-3.5 animate-spin mr-1" />
                Saving...
              </>
            ) : 'Save Draft'}
          </Button>
        </div>

        {/* Right Action Elements */}
        <div className="flex items-center gap-2">
          {currentStep < 4 ? (
            <Button
              type="button"
              variant="default"
              onClick={onContinue}
            >
              Save &amp; Continue <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              onClick={onSubmit}
            >
              Submit Registration
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}


// --- MAIN MODULE RENDERING VIEW ---
export default function RegistrationView({
  state,
  companyForm,
  setCompanyForm,
  handleCompanySubmit,
  approveRegistration,
  saveDraft,
  submitRegistration
}) {
  const isApproved = state.profile.status === 'Approved';
  const isPending = state.profile.status === 'Pending Approval' || state.profile.status === 'Under Review';
  const isDraft = state.profile.status === 'Draft' || state.profile.status === 'Rejected' || state.profile.status === 'Pending';

  const [currentStep, setCurrentStep] = useState(1);
  const [isSapView, setIsSapView] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [draftSaving, setDraftSaving] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [passVisible, setPassVisible] = useState(false);

  // Field definitions to calculate metadata counts dynamically
  const stepConfigs = [
    {
      name: 'Company Information',
      sections: [
        { title: 'COMPANY IDENTITY', fields: ['companyName', 'tradeName', 'businessType', 'incorporationDate'] },
        { title: 'REGISTERED ADDRESS', fields: ['address', 'city', 'state', 'postalCode', 'email', 'phone'] }
      ]
    },
    {
      name: 'Tax & Regulatory',
      sections: [
        { title: 'INDIAN TAX IDS', fields: ['pan', 'gstin', 'gstType', 'cin', 'msmeNumber', 'tdsSection'] }
      ]
    },
    {
      name: 'Bank Details',
      sections: [
        { title: 'BANK ACCOUNT', fields: ['accountName', 'accountNumber', 'ifscCode', 'bankName', 'bankBranch', 'cancelledCheque'] }
      ]
    },
    {
      name: 'Document Uploads',
      sections: [
        { title: 'MANDATORY', fields: ['panCardCopy', 'gstCertificate', 'incorporationCertificate'] },
        { title: 'OPTIONAL', fields: ['msmeCertificate', 'isoCertificate', 'itReturns'] }
      ]
    }
  ];

  // Helper validation schemas
  const validateField = (field, value) => {
    switch (field) {
      case 'companyName':
        if (!value || !value.trim()) return 'Legal Entity Name is required';
        return '';
      case 'businessType':
        if (!value) return 'Business Type is required';
        return '';
      case 'address':
        if (!value || !value.trim()) return 'Street address is required';
        return '';
      case 'city':
        if (!value || !value.trim()) return 'City is required';
        return '';
      case 'state':
        if (!value) return 'State registration is required';
        return '';
      case 'postalCode':
        if (!value || !value.trim()) return 'PIN code is required';
        if (!/^\d{6}$/.test(value)) return 'PIN code must be exactly 6 digits';
        return '';
      case 'email':
        if (!value || !value.trim()) return 'Contact Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
        return '';
      case 'phone':
        if (!value || !value.trim()) return 'Mobile / Phone is required';
        if (!/^\+?[\d\s-]{10,15}$/.test(value)) return 'Phone number must be between 10 and 15 digits';
        return '';
      case 'pan':
        if (!value || !value.trim()) return 'PAN Number is required';
        if (!/^[A-Z]{5}\d{4}[A-Z]$/i.test(value)) return 'PAN must follow standard format (e.g. ABCDE1234F)';
        return '';
      case 'gstin':
        if (!value || !value.trim()) return 'GSTIN is required';
        if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/i.test(value)) return 'GSTIN must follow standard format (e.g. 27AABCB1234F1Z5)';
        return '';
      case 'gstType':
        if (!value) return 'GST Registration Type is required';
        return '';
      case 'tdsSection':
        if (!value) return 'TDS Section mapping is required';
        return '';
      case 'accountName':
        if (!value || !value.trim()) return 'Account Holder Name is required';
        return '';
      case 'accountNumber':
        if (!value || !value.trim()) return 'Account Number is required';
        if (!/^\d{9,18}$/.test(value)) return 'Account Number must be 9 to 18 digits';
        return '';
      case 'ifscCode':
        if (!value || !value.trim()) return 'IFSC Code is required';
        if (!/^[A-Z]{4}0[A-Z\d]{6}$/i.test(value)) return 'IFSC Code must follow standard format (e.g. HDFC0000060)';
        return '';
      case 'bankName':
        if (!value || !value.trim()) return 'Bank Name is required';
        return '';
      case 'bankBranch':
        if (!value || !value.trim()) return 'Bank Branch is required';
        return '';
      case 'cancelledCheque':
        if (!value) return 'Cancelled Cheque document copy is required';
        return '';
      case 'panCardCopy':
        if (!value) return 'PAN Card document copy is required';
        return '';
      case 'gstCertificate':
        if (!value) return 'GST Certificate document copy is required';
        return '';
      case 'incorporationCertificate':
        if (!value) return 'Certificate of Incorporation is required';
        return '';
      default:
        return '';
    }
  };

  const validateStep = (stepIdx) => {
    const config = stepConfigs[stepIdx - 1];
    const stepErrors = {};
    let stepValid = true;

    config.sections.forEach(sec => {
      sec.fields.forEach(field => {
        const error = validateField(field, companyForm[field]);
        if (error) {
          stepErrors[field] = error;
          stepValid = false;
        }
      });
    });

    setValidationErrors(prev => ({ ...prev, [stepIdx]: stepErrors }));
    return stepValid;
  };

  // Field change hook
  const handleFieldChange = (field, val) => {
    setCompanyForm(prev => ({ ...prev, [field]: val }));

    // Clear error dynamically on input edit
    if (validationErrors[currentStep]?.[field]) {
      setValidationErrors(prev => {
        const nextErrors = { ...prev };
        if (nextErrors[currentStep]) {
          delete nextErrors[currentStep][field];
        }
        return nextErrors;
      });
    }
  };

  // Navigation handlers
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleContinue = () => {
    // Run validation to display error indicators, but do not block progression
    validateStep(currentStep);
    saveDraft(companyForm);
    setCurrentStep(prev => prev + 1);
  };

  const handleTriggerSaveDraft = () => {
    setDraftSaving(true);
    saveDraft(companyForm);
    setTimeout(() => {
      setDraftSaving(false);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2000);
    }, 800);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    // Do not block submissions with strict validation gates during test phase
    submitRegistration(companyForm);
  };

  // Auto-fill form values on page mount if state exists
  useEffect(() => {
    if (state.profile && state.profile.companyName) {
      // Restore step tracking if previously drafted
      if (state.profile.status === 'Draft' || state.profile.status === 'Rejected') {
        Promise.resolve().then(() => {
          // Find if they filled bank details but not uploads, etc.
          if (state.profile.panCardCopy && state.profile.gstCertificate) {
            setCurrentStep(4);
          } else if (state.profile.accountNumber && state.profile.cancelledCheque) {
            setCurrentStep(3);
          } else if (state.profile.pan && state.profile.gstin) {
            setCurrentStep(2);
          } else {
            setCurrentStep(1);
          }
        });
      }
    }
  }, []);

  // Compute stats for current step header
  const currentStepConfig = stepConfigs[currentStep - 1];
  const currentFieldsCount = currentStepConfig.sections.reduce((acc, s) => acc + s.fields.length, 0);
  const currentSectionsCount = currentStepConfig.sections.length;

  return (
    <div className="space-y-6 max-w-full pb-12 animate-fade-in relative">
      {/* 1. TOAST NOTIFICATION FOR SAVE DRAFT */}
      {showSaveToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-surface2 border border-border-em text-text-primary text-xs px-4 py-2.5 rounded-xl shadow-[0_1px_4px_rgba(10,15,46,0.08)] animate-slide-down">
          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
          <span className="font-semibold select-none">Draft onboarding configurations saved successfully</span>
        </div>
      )}

      {/* 2. COMPONENT WIZARD HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4 select-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[22px] font-bold text-text-primary">Vendor Registration</h2>
            <ProgressBadge count={`${currentStep} / 4`} />
          </div>
          <div className="flex items-center gap-2 text-text-tertiary text-xs font-semibold">
            <span className="bg-surface2 border border-border text-text-secondary px-2 py-0.5 rounded font-mono uppercase tracking-wide">
              Vendor
            </span>

          </div>
        </div>

        {/* 3. BUSINESS VIEW VS SAP VIEW TOGGLE REMOVED */}
      </div>

      {/* 4. TABBED PROGRESS INDICATOR */}
      {isDraft && (
        <ProgressIndicator
          steps={stepConfigs}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          errors={validationErrors}
        />
      )}

      {/* 5. DRAFT STATE: 4-STEP WIZARD BODY */}
      {isDraft && (
        <form onSubmit={handleFinalSubmit} className="space-y-6">
          {state.profile.status === 'Rejected' && (
            <div className="p-4.5 rounded-xl border border-red-200 bg-red-50/50 text-red-700 flex items-start gap-3 shadow-sm select-none">
              <AlertTriangle className="size-5 shrink-0 mt-0.5 text-red-650" />
              <div>
                <h4 className="font-bold text-sm">ERP Verification Rejected</h4>
                <p className="text-xs mt-1 text-red-700/80">
                  The uploaded compliance documents or banking parameters failed approval checks. Reason:
                  <span className="font-semibold block mt-0.5 text-red-800 italic">
                    &quot;{state.profile.rejectionReason || 'GSTN registration / Bank settlement key discrepancies detected.'}&quot;
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* STEP 1: COMPANY INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-3">
              <SectionHeader title="COMPANY IDENTITY" icon={Building2} />
              <div className="flex flex-col border border-border rounded-lg divide-y divide-border bg-surface overflow-hidden">
                <div className="bg-surface">
                  <EnterpriseFieldCard label="Legal Entity Name" required labelWidth="sm:w-28" error={validationErrors[1]?.companyName}>
                    <input type="text" value={companyForm.companyName} onChange={e => handleFieldChange('companyName', e.target.value)} placeholder="e.g. Bharat Steel Alloys Pvt. Ltd." className="w-full max-w-md" />
                  </EnterpriseFieldCard>
                </div>
                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border bg-surface">
                  <div className="w-[320px] shrink-0">
                    <EnterpriseFieldCard label="Trade / Brand Name" labelWidth="sm:w-28" error={validationErrors[1]?.tradeName}>
                      <input type="text" value={companyForm.tradeName} onChange={e => handleFieldChange('tradeName', e.target.value)} placeholder="e.g. Bharat Steel" className="w-[160px]" />
                    </EnterpriseFieldCard>
                  </div>
                  <div className="w-[330px] shrink-0">
                    <EnterpriseFieldCard label="Business Type" required labelWidth="sm:w-24" error={validationErrors[1]?.businessType}>
                      <select value={companyForm.businessType} onChange={e => handleFieldChange('businessType', e.target.value)} className="w-[190px]">
                        <option value="" disabled className="text-text-tertiary">Select Business Type</option>
                        <option value="MFGR">Manufacturer (MFGR)</option>
                        <option value="TRDR">Trader / Distributor (TRDR)</option>
                        <option value="SRVC">Service Provider (SRVC)</option>
                        <option value="MSME">Micro Enterprise (MSME)</option>
                      </select>
                    </EnterpriseFieldCard>
                  </div>
                </div>
                <div className="bg-surface">
                  <EnterpriseFieldCard label="Incorporation Date" labelWidth="sm:w-28" error={validationErrors[1]?.incorporationDate}>
                    <input
                      type="date"
                      value={companyForm.incorporationDate || ''}
                      onChange={e => handleFieldChange('incorporationDate', e.target.value)}
                      className="w-[150px]"
                    />
                  </EnterpriseFieldCard>
                </div>
              </div>

              <SectionHeader title="REGISTERED ADDRESS" icon={Truck} />
              <div className="flex flex-col border border-border rounded-lg divide-y divide-border bg-surface">
                <div className="bg-surface rounded-t-lg overflow-hidden">
                  <EnterpriseFieldCard label="Street / Area" required labelWidth="sm:w-20" error={validationErrors[1]?.address}>
                    <input type="text" value={companyForm.address} onChange={e => handleFieldChange('address', e.target.value)} placeholder="e.g. 102, Mittal Chambers, Nariman Point" className="w-full max-w-lg" />
                  </EnterpriseFieldCard>
                </div>
                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border bg-surface">
                  <div className="w-[250px] shrink-0">
                    <EnterpriseFieldCard label="City" required labelWidth="sm:w-12" error={validationErrors[1]?.city}>
                      <input type="text" value={companyForm.city} onChange={e => handleFieldChange('city', e.target.value)} placeholder="e.g. Mumbai" className="w-[150px]" />
                    </EnterpriseFieldCard>
                  </div>
                  <div className="w-[310px] shrink-0">
                    <EnterpriseFieldCard label="State" required labelWidth="sm:w-14" error={validationErrors[1]?.state}>
                      <SearchableSelect value={companyForm.state} onChange={val => handleFieldChange('state', val)} options={INDIAN_STATES} placeholder="Select State" />
                    </EnterpriseFieldCard>
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border bg-surface rounded-b-lg overflow-hidden">
                  <div className="w-[210px] shrink-0">
                    <EnterpriseFieldCard label="PIN Code" required labelWidth="sm:w-16" error={validationErrors[1]?.postalCode}>
                      <input type="text" maxLength={6} value={companyForm.postalCode} onChange={e => handleFieldChange('postalCode', e.target.value.replace(/\D/g, ''))} placeholder="e.g. 400021" className="w-[100px] font-mono" />
                    </EnterpriseFieldCard>
                  </div>
                  <div className="w-[320px] shrink-0">
                    <EnterpriseFieldCard label="Contact Email" required labelWidth="sm:w-24" error={validationErrors[1]?.email}>
                      <input type="email" value={companyForm.email} onChange={e => handleFieldChange('email', e.target.value)} placeholder="e.g. billing@company.com" className="w-[190px]" />
                    </EnterpriseFieldCard>
                  </div>
                  <div className="w-[320px] shrink-0">
                    <EnterpriseFieldCard label="Mobile / Phone" required labelWidth="sm:w-28" error={validationErrors[1]?.phone}>
                      <input type="text" value={companyForm.phone} onChange={e => handleFieldChange('phone', e.target.value)} placeholder="e.g. +91 22 2345 6789" className="w-[150px]" />
                    </EnterpriseFieldCard>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TAX & REGULATORY */}
          {currentStep === 2 && (
            <div className="space-y-1">
              <SectionHeader title="INDIAN TAX IDS" icon={Building2} />
              <div className="flex flex-col border border-border rounded-lg divide-y divide-border bg-surface overflow-hidden">
                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border bg-surface">
                  <div className="w-[320px] shrink-0">
                    <EnterpriseFieldCard
                      label="PAN Number"
                      required
                      labelWidth="sm:w-24"
                      mappingCode="LFA1-STCD2"
                      isSapView={isSapView}
                      error={validationErrors[2]?.pan}
                    >
                      <input
                        type="text"
                        maxLength={10}
                        value={companyForm.pan}
                        onChange={e => handleFieldChange('pan', e.target.value.toUpperCase())}
                        placeholder="e.g. AABCB1234F"
                        className="w-[150px] uppercase font-mono"
                      />
                    </EnterpriseFieldCard>
                  </div>
                  <div className="w-[330px] shrink-0">
                    <EnterpriseFieldCard
                      label="GSTIN"
                      required
                      labelWidth="sm:w-20"
                      mappingCode="LFB1-STCEG"
                      isSapView={isSapView}
                      error={validationErrors[2]?.gstin}
                    >
                      <input
                        type="text"
                        maxLength={15}
                        value={companyForm.gstin}
                        onChange={e => handleFieldChange('gstin', e.target.value.toUpperCase())}
                        placeholder="e.g. 27AABCB1234F1Z5"
                        className="w-[180px] uppercase font-mono"
                      />
                    </EnterpriseFieldCard>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border bg-surface">
                  <div className="w-[380px] shrink-0">
                    <EnterpriseFieldCard
                      label="GST Registration Type"
                      required
                      labelWidth="sm:w-36"
                      mappingCode="LFB1-GST_TYPE"
                      isSapView={isSapView}
                      error={validationErrors[2]?.gstType}
                    >
                      <select
                        value={companyForm.gstType}
                        onChange={e => handleFieldChange('gstType', e.target.value)}
                        className="w-[180px]"
                      >
                        <option value="" disabled className="text-text-tertiary">Select Type</option>
                        <option value="01">Regular Taxpayer (01)</option>
                        <option value="02">Composition Scheme (02)</option>
                        <option value="03">SEZ Developer (03)</option>
                        <option value="04">Exempt / Unregistered (04)</option>
                      </select>
                    </EnterpriseFieldCard>
                  </div>
                  <div className="w-[350px] shrink-0">
                    <EnterpriseFieldCard
                      label="CIN Number"
                      labelWidth="sm:w-24"
                      mappingCode="LFA1-CIN_NO"
                      isSapView={isSapView}
                      error={validationErrors[2]?.cin}
                    >
                      <input
                        type="text"
                        maxLength={21}
                        value={companyForm.cin}
                        onChange={e => handleFieldChange('cin', e.target.value.toUpperCase())}
                        placeholder="e.g. L01500MH1995PLC094858"
                        className="w-[210px] uppercase font-mono"
                      />
                    </EnterpriseFieldCard>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border bg-surface">
                  <div className="w-[390px] shrink-0">
                    <EnterpriseFieldCard
                      label="MSME / Udyam Number"
                      labelWidth="sm:w-40"
                      mappingCode="LFA1-MSME_NO"
                      isSapView={isSapView}
                      error={validationErrors[2]?.msmeNumber}
                    >
                      <input
                        type="text"
                        maxLength={19}
                        value={companyForm.msmeNumber}
                        onChange={e => handleFieldChange('msmeNumber', e.target.value.toUpperCase())}
                        placeholder="e.g. UDYAM-MH-12-0012345"
                        className="w-[190px] uppercase font-mono"
                      />
                    </EnterpriseFieldCard>
                  </div>
                  <div className="w-[350px] shrink-0">
                    <EnterpriseFieldCard
                      label="TDS Section"
                      required
                      labelWidth="sm:w-24"
                      mappingCode="LFBW-WITHT"
                      isSapView={isSapView}
                      error={validationErrors[2]?.tdsSection}
                    >
                      <select
                        value={companyForm.tdsSection}
                        onChange={e => handleFieldChange('tdsSection', e.target.value)}
                        className="w-[220px]"
                      >
                        <option value="" disabled className="text-text-tertiary">Select TDS mapping</option>
                        <option value="194C">194C - Contractor Payments</option>
                        <option value="194J">194J - Professional Service Fees</option>
                        <option value="194I">194I - Renting Clearances</option>
                        <option value="194Q">194Q - Goods Purchase Credits</option>
                        <option value="EXMP">EXMP - TDS Exempt status</option>
                      </select>
                    </EnterpriseFieldCard>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BANK DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-3">
              <SectionHeader title="BANK ACCOUNT" icon={CreditCard} />
              <div className="flex flex-col border border-border rounded-lg divide-y divide-border bg-surface overflow-hidden">
                <div className="bg-surface">
                  <EnterpriseFieldCard
                    label="Account Holder Name"
                    required
                    labelWidth="sm:w-44"
                    mappingCode="LFBK-KOINH"
                    isSapView={isSapView}
                    error={validationErrors[3]?.accountName}
                  >
                    <input
                      type="text"
                      value={companyForm.accountName}
                      onChange={e => handleFieldChange('accountName', e.target.value)}
                      placeholder="e.g. Bharat Steel Alloys Pvt. Ltd."
                      className="w-full max-w-md"
                    />
                  </EnterpriseFieldCard>
                </div>

                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border bg-surface">
                  <div className="w-[420px] shrink-0">
                    <EnterpriseFieldCard
                      label="Bank Account Number"
                      required
                      labelWidth="sm:w-44"
                      mappingCode="LFBK-BANKN"
                      isSapView={isSapView}
                      error={validationErrors[3]?.accountNumber}
                    >
                      <div className="relative w-full">
                        <input
                          type={passVisible ? 'text' : 'password'}
                          maxLength={18}
                          value={companyForm.accountNumber}
                          onChange={e => handleFieldChange('accountNumber', e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter Bank Account Number"
                          className="w-full font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setPassVisible(!passVisible)}
                          className="absolute right-2 top-2 hover:bg-surface2 rounded text-text-tertiary hover:text-text-primary transition-colors duration-150"
                        >
                          {passVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </EnterpriseFieldCard>
                  </div>
                  <div className="w-[300px] shrink-0">
                    <EnterpriseFieldCard
                      label="IFSC Code"
                      required
                      labelWidth="sm:w-24"
                      mappingCode="LFBK-SWIFT"
                      isSapView={isSapView}
                      error={validationErrors[3]?.ifscCode}
                    >
                      <input
                        type="text"
                        maxLength={11}
                        value={companyForm.ifscCode}
                        onChange={e => handleFieldChange('ifscCode', e.target.value.toUpperCase())}
                        placeholder="e.g. HDFC0000060"
                        className="w-[150px] uppercase font-mono"
                      />
                    </EnterpriseFieldCard>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border bg-surface">
                  <div className="w-[380px] shrink-0">
                    <EnterpriseFieldCard
                      label="Bank Name"
                      required
                      labelWidth="sm:w-28"
                      mappingCode="LFBK-BANKA"
                      isSapView={isSapView}
                      error={validationErrors[3]?.bankName}
                    >
                      <input
                        type="text"
                        value={companyForm.bankName}
                        onChange={e => handleFieldChange('bankName', e.target.value)}
                        placeholder="e.g. HDFC Bank Ltd."
                        className="w-[220px]"
                      />
                    </EnterpriseFieldCard>
                  </div>
                  <div className="w-[350px] shrink-0">
                    <EnterpriseFieldCard
                      label="Branch"
                      required
                      labelWidth="sm:w-20"
                      mappingCode="LFBK-BRNCH"
                      isSapView={isSapView}
                      error={validationErrors[3]?.bankBranch}
                    >
                      <input
                        type="text"
                        value={companyForm.bankBranch}
                        onChange={e => handleFieldChange('bankBranch', e.target.value)}
                        placeholder="e.g. Nariman Point, Mumbai"
                        className="w-[220px]"
                      />
                    </EnterpriseFieldCard>
                  </div>
                </div>

                <div className="bg-surface">
                  <EnterpriseFieldCard
                    label="Cancelled Cheque Copy"
                    required
                    labelWidth="sm:w-44"
                    mappingCode="LFBK-CHQ_DOC"
                    isSapView={isSapView}
                    error={validationErrors[3]?.cancelledCheque}
                  >
                    <DocumentUploadZone
                      fieldName="cancelledCheque"
                      value={companyForm.cancelledCheque}
                      onChange={val => handleFieldChange('cancelledCheque', val)}
                      error={validationErrors[3]?.cancelledCheque}
                    />
                  </EnterpriseFieldCard>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: DOCUMENT UPLOADS */}
          {currentStep === 4 && (
            <div className="space-y-3">
              <SectionHeader title="MANDATORY DOCUMENTS" icon={FileText} />
              <div className="flex flex-col border border-border rounded-lg divide-y divide-border bg-surface overflow-hidden">
                <EnterpriseFieldCard
                  label="PAN Card Copy"
                  required
                  labelWidth="sm:w-44"
                  mappingCode="DMS-PAN_DOC"
                  isSapView={isSapView}
                  error={validationErrors[4]?.panCardCopy}
                >
                  <DocumentUploadZone
                    fieldName="panCardCopy"
                    value={companyForm.panCardCopy}
                    onChange={val => handleFieldChange('panCardCopy', val)}
                    error={validationErrors[4]?.panCardCopy}
                  />
                </EnterpriseFieldCard>

                <EnterpriseFieldCard
                  label="GST Certificate"
                  required
                  labelWidth="sm:w-44"
                  mappingCode="DMS-GST_DOC"
                  isSapView={isSapView}
                  error={validationErrors[4]?.gstCertificate}
                >
                  <DocumentUploadZone
                    fieldName="gstCertificate"
                    value={companyForm.gstCertificate}
                    onChange={val => handleFieldChange('gstCertificate', val)}
                    error={validationErrors[4]?.gstCertificate}
                  />
                </EnterpriseFieldCard>

                <EnterpriseFieldCard
                  label="Certificate of Incorporation"
                  required
                  labelWidth="sm:w-44"
                  mappingCode="DMS-COI_DOC"
                  isSapView={isSapView}
                  error={validationErrors[4]?.incorporationCertificate}
                >
                  <DocumentUploadZone
                    fieldName="incorporationCertificate"
                    value={companyForm.incorporationCertificate}
                    onChange={val => handleFieldChange('incorporationCertificate', val)}
                    error={validationErrors[4]?.incorporationCertificate}
                  />
                </EnterpriseFieldCard>
              </div>

              <SectionHeader title="OPTIONAL CERTIFICATES" icon={FileText} />
              <div className="flex flex-col border border-border rounded-lg divide-y divide-border bg-surface overflow-hidden">
                <EnterpriseFieldCard
                  label="MSME Certificate"
                  labelWidth="sm:w-44"
                  mappingCode="DMS-MSME_DOC"
                  isSapView={isSapView}
                >
                  <DocumentUploadZone
                    fieldName="msmeCertificate"
                    value={companyForm.msmeCertificate}
                    onChange={val => handleFieldChange('msmeCertificate', val)}
                  />
                </EnterpriseFieldCard>

                <EnterpriseFieldCard
                  label="ISO Certificate Copy"
                  labelWidth="sm:w-44"
                  mappingCode="DMS-ISO_DOC"
                  isSapView={isSapView}
                >
                  <DocumentUploadZone
                    fieldName="isoCertificate"
                    value={companyForm.isoCertificate}
                    onChange={val => handleFieldChange('isoCertificate', val)}
                  />
                </EnterpriseFieldCard>

                <EnterpriseFieldCard
                  label="IT Returns (Last 2 Years)"
                  labelWidth="sm:w-44"
                  mappingCode="DMS-ITR_DOC"
                  isSapView={isSapView}
                >
                  <DocumentUploadZone
                    fieldName="itReturns"
                    value={companyForm.itReturns}
                    onChange={val => handleFieldChange('itReturns', val)}
                  />
                </EnterpriseFieldCard>
              </div>
            </div>
          )}

          {/* 6. STICKY ACTION FOOTER BAR */}
          <ActionFooter
            currentStep={currentStep}
            onBack={handleBack}
            onSaveDraft={handleTriggerSaveDraft}
            onContinue={handleContinue}
            onSubmit={handleFinalSubmit}
            draftSaving={draftSaving}
          />
        </form>
      )}

      {/* 6. PENDING APPROVAL COMPLIANCE CARD */}
      {isPending && (
        <div className="p-8 card text-center space-y-6 flex flex-col items-center max-w-lg mx-auto">
          <div className="size-14 rounded-full bg-surface2 border border-border flex items-center justify-center text-text-secondary">
            <Clock className="size-6 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text-primary">Compliance Processing in Progress</h3>
            <p className="text-xs text-text-tertiary max-w-sm mx-auto leading-relaxed">
              We are checking compliance registries, tax registrations, and banking clearance links in SAP ERP. A master record synchronization will run shortly.
            </p>
          </div>
          <div className="w-full bg-surface2 h-1.5 rounded-full overflow-hidden border border-border">
            <div className="h-full w-2/3 rounded-full animate-[pulse_1.5s_infinite]" style={{ backgroundColor: 'rgb(var(--color-emerald-default-rgb))' }}></div>
          </div>
          <Button type="button" onClick={approveRegistration} variant="default">
            Acknowledge compliance checks manually
          </Button>
        </div>
      )}

      {/* 7. APPROVED / WORKFLOW COMPLETED VIEW (SAP Vendor Ledger Summary) */}
      {isApproved && (
        <div className="space-y-6 animate-fade-in select-none">
          <div className="p-6 card flex items-start gap-4">
            <div className="size-11 rounded-full text-emerald-text flex items-center justify-center shrink-0 border border-border" style={{ backgroundColor: 'var(--color-emerald-dim)' }}>
              <CheckCircle2 className="size-5.5 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-primary">SAP Vendor Master Record Synced</h3>
              <p className="text-xs text-text-tertiary leading-normal">
                Tax profiles and clearing bank settlement parameters are synced successfully to SAP. Assigned Vendor Code:
                <span className="font-mono text-text-primary font-bold bg-surface2 border border-border px-2 py-0.5 rounded ml-1.5 text-xs tabular-nums">
                  {state.profile.sapVendorCode}
                </span>
              </p>
              <div className="flex items-center gap-4 text-[10px] text-text-tertiary mt-2.5 font-semibold font-mono">
                <span className="tabular-nums">SYNC TIME: {new Date(state.profile.approvedAt || '').toLocaleString()}</span>
                <span>&bull;</span>
                <span className="text-emerald-text px-1.5 py-0.5 border border-border rounded text-[9px] font-bold" style={{ backgroundColor: 'var(--color-emerald-dim)' }}>STATUS: ACTIVE</span>
              </div>
            </div>
          </div>

          {/* DETAILED LEDGER PROFILE INFORMATION */}
          <div className="p-6 card space-y-4">
            <h3 className="label mb-0 border-b border-border pb-2">
              Registered Master Ledger Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs text-text-secondary">
              {[
                { label: 'Legal Corporate Name', val: state.profile.companyName },
                { label: 'Trade / Brand Name', val: state.profile.tradeName || 'Not Provided' },
                { label: 'Business Category Type', val: state.profile.businessType || 'Not Provided' },
                { label: 'Incorporation Date', val: state.profile.incorporationDate || 'Not Provided' },
                { label: 'Assigned Vendor ID (SAP)', val: state.profile.sapVendorCode, isMono: true, isGreen: true },
                { label: 'GSTIN / Tax Registration', val: state.profile.gstin, isMono: true },
                { label: 'PAN Identity Number', val: state.profile.pan, isMono: true },
                { label: 'CIN Number Registration', val: state.profile.cin || 'Not Applicable', isMono: true },
                { label: 'MSME Registration Number', val: state.profile.msmeNumber || 'Not Applicable', isMono: true },
                { label: 'TDS Section Clearance Code', val: state.profile.tdsSection || 'Not Mapped' },
                { label: 'Finance Contact Email', val: state.profile.email },
                { label: 'Operations Phone Contact', val: state.profile.phone },
                { label: 'Clearing Bank Institution', val: state.profile.bankName },
                { label: 'Clearance Bank Branch', val: state.profile.bankBranch || 'Not Mapped' },
                { label: 'Clearance Bank Account', val: `••••${state.profile.accountNumber?.slice(-4)} (${state.profile.ifscCode})`, isMono: true },
                { label: 'Operations Plant Office', val: `${state.profile.address}, ${state.profile.city}, ${state.profile.state} - ${state.profile.postalCode}` },
                { label: 'Cancelled Cheque Copy Document', val: state.profile.cancelledCheque || 'Not Uploaded', isFile: true },
                { label: 'PAN Card Copy Document', val: state.profile.panCardCopy || 'Not Uploaded', isFile: true },
                { label: 'GST Certificate Document', val: state.profile.gstCertificate || 'Not Uploaded', isFile: true },
                { label: 'Certificate of Incorporation', val: state.profile.incorporationCertificate || 'Not Uploaded', isFile: true },
                { label: 'MSME Compliance Certificate', val: state.profile.msmeCertificate || 'Not Uploaded', isFile: true },
                { label: 'ISO Standard Certificate Copy', val: state.profile.isoCertificate || 'Not Uploaded', isFile: true },
                { label: 'Income Tax Return Archives', val: state.profile.itReturns || 'Not Uploaded', isFile: true }
              ].map((row, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-border-subtle pb-2 gap-4">
                  <span className="text-text-secondary font-bold shrink-0">{row.label}</span>
                  <span className={`font-semibold text-right truncate max-w-[220px] ${row.isMono || row.isFile ? 'font-mono' : ''
                    } ${row.isGreen ? 'text-text-primary font-bold' : 'text-text-primary'
                    } ${row.isFile ? 'text-emerald-text bg-surface2 px-2 py-0.5 border border-border rounded text-[10px] flex items-center gap-1 select-none font-semibold' : ''
                    }`}>
                    {row.isFile && <FileText className="size-3 text-emerald-text inline shrink-0" />}
                    {row.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 10. Progress badge component for UI header
function ProgressBadge({ count }) {
  return (
    <span className="bg-surface2 text-text-primary border border-border text-[10px] font-bold font-mono px-2 py-0.5 rounded-full select-none shrink-0 tabular-nums">
      {count}
    </span>
  );
}
