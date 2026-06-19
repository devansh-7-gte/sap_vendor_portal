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
      <h3 className="text-xs font-bold text-stone-900 tracking-wider uppercase border-b-2 border-primary/30 pb-1.5 flex items-center gap-2">
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
    <div className={`h-full py-1.5 px-3 bg-white transition-all flex flex-col sm:flex-row sm:items-center gap-1 select-none ${
      error ? 'bg-red-50/10' : 'hover:bg-stone-50/30 focus-within:bg-stone-50/50'
    }`}>
      <label className={`text-xs font-bold text-stone-750 ${labelWidth || 'sm:w-48'} shrink-0 whitespace-nowrap select-none block`} title={label}>
        {label} {required && <span className="text-red-500 font-bold select-none ml-0.5">*</span>}
      </label>
      <div className="flex-1 w-full min-w-0 flex flex-col justify-center">
        {children}
        {error && (
          <span className="text-[10px] font-bold text-red-650 mt-1 select-none">{error}</span>
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        className="w-full flex items-center justify-between bg-white border border-stone-300 focus:border-stone-500 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-900 text-left h-9 shadow-sm transition-all"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOpt ? 'text-stone-900 font-medium' : 'text-stone-400'}>
          {selectedOpt ? `${selectedOpt.name} (${selectedOpt.code})` : placeholder}
        </span>
        <ChevronRight className={`size-3 text-stone-400 transition-transform shrink-0 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-56 overflow-y-auto custom-scrollbar animate-slide-down">
          <div className="p-1.5 border-b border-stone-100 sticky top-0 bg-white flex items-center gap-1.5">
            <Search className="size-3.5 text-stone-400 shrink-0" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full text-xs outline-none text-stone-800 bg-transparent py-0.5"
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
                  className={`px-3 py-1.5 text-xs cursor-pointer flex items-center justify-between hover:bg-stone-50 text-stone-800 ${opt.code === value ? 'bg-stone-100 text-stone-900 font-semibold' : ''
                    }`}
                >
                  <span>{opt.name}</span>
                  <span className="font-mono text-[10px] text-stone-400">{opt.code}</span>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-xs text-stone-400 text-center select-none">No states found</li>
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
          className={`h-6 w-full rounded-md text-[11px] font-medium flex items-center justify-center transition-all ${isSelected
            ? 'bg-stone-850 text-white font-bold'
            : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
            }`}
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
        className="w-full flex items-center justify-between bg-white border border-stone-300 focus:border-stone-500 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-900 text-left h-9 shadow-sm transition-all"
      >
        <span className={value ? 'text-stone-900 font-medium' : 'text-stone-400'}>
          {value ? value : placeholder}
        </span>
        <Calendar className="size-3.5 text-stone-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-xl p-3 w-64 animate-slide-down">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="p-1 hover:bg-stone-100 rounded-md text-stone-600"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <div className="flex items-center gap-1">
              <select
                value={currentDate.getMonth()}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="text-[11px] font-semibold text-stone-800 bg-transparent border-none outline-none cursor-pointer py-0.5 px-1 rounded hover:bg-stone-50"
              >
                {MONTHS.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
              <select
                value={currentDate.getFullYear()}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="text-[11px] font-semibold text-stone-800 bg-transparent border-none outline-none cursor-pointer py-0.5 px-1 rounded hover:bg-stone-50"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="p-1 hover:bg-stone-100 rounded-md text-stone-600"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-stone-400 mb-1 select-none border-b border-stone-100 pb-1">
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
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const fileInputRef = useRef(null);

  const startSimulatedUpload = (fileName, fileSize) => {
    setUploadProgress(0);
    const totalDuration = 1000; // 1s upload
    const intervalTime = 100;
    const step = 100 / (totalDuration / intervalTime);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onChange(fileName);
          setTimeout(() => setUploadProgress(null), 300);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      startSimulatedUpload(file.name, file.size);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      startSimulatedUpload(file.name, file.size);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full border border-dashed rounded-lg p-3 text-center transition-all h-16 flex items-center justify-center cursor-pointer group ${dragOver
        ? 'border-stone-850 bg-stone-50'
        : error
          ? 'border-red-300 hover:border-red-400 bg-red-50/5'
          : 'border-stone-300 hover:border-stone-400 hover:bg-stone-50/50 bg-stone-50/20'
        }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
      />

      {uploadProgress !== null ? (
        <div className="w-full px-4 text-left space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-stone-500 font-mono">
            <span>UPLOADING FILE...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-stone-200 h-1 rounded-full overflow-hidden">
            <div className="bg-stone-850 h-full transition-all duration-100" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      ) : value ? (
        <div className="flex items-center justify-between w-full gap-2 px-1">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="size-5 text-emerald-600 shrink-0" />
            <div className="text-left overflow-hidden">
              <p className="text-[11px] font-semibold text-stone-900 truncate" title={value}>
                {value}
              </p>
              <p className="text-[9px] text-emerald-600 font-mono flex items-center gap-0.5 select-none">
                <Check className="size-3 text-emerald-600" /> UPLOADED
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 hover:bg-stone-100 rounded-md text-stone-500 hover:text-red-600 transition-colors"
              title="Delete File"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 text-stone-500 select-none">
          <Upload className="size-4 group-hover:text-stone-850 transition-colors shrink-0" />
          <div className="text-left leading-tight">
            <span className="text-[11px] font-semibold text-stone-700 group-hover:text-stone-850 block">
              Drag & Drop file or <span className="underline">Browse</span>
            </span>
            <span className="text-[9px] text-stone-400 font-mono block">PDF, JPG, PNG up to 10MB</span>
          </div>
        </div>
      )}
    </div>
  );
}

// 8. Wizard Progress Indicator (Tabs)
function ProgressIndicator({ steps, currentStep, onStepClick, errors }) {
  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border py-3 shadow-sm select-none">
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
              className={`flex items-center gap-2 pb-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer hover:border-primary ${isActive
                ? 'border-primary text-primary font-bold'
                : isCompleted
                  ? 'border-green-600 text-green-700 font-semibold'
                  : stepHasErrors
                    ? 'border-red-400 text-red-700 font-semibold'
                    : 'border-transparent text-stone-400 font-medium'
                }`}
            >
              <span className={`size-5 rounded-full text-[10px] flex items-center justify-center font-bold ${isActive
                ? 'bg-primary text-white'
                : isCompleted
                  ? 'bg-green-600 text-white'
                  : stepHasErrors
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-stone-100 text-stone-400 border border-stone-200'
                }`}>
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
    <footer className="sticky bottom-0 z-30 bg-white border-t border-border py-3.5 shadow-md px-4 md:px-6 select-none animate-slide-down">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Left Action Elements */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 1}
            onClick={onBack}
            className="border-stone-300 text-stone-700 hover:bg-stone-50 font-bold px-4 hover:text-stone-900 h-9 transition-colors select-none text-xs cursor-pointer"
          >
            <ChevronLeft className="size-4" /> Back
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={draftSaving}
            className="border-stone-300 text-stone-750 hover:bg-stone-50 font-bold px-4 hover:text-stone-900 h-9 transition-colors select-none text-xs cursor-pointer"
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
              onClick={onContinue}
              className="bg-primary hover:bg-primary/95 text-white font-bold px-5 h-9 transition-colors shadow-sm text-xs flex items-center gap-1 select-none cursor-pointer"
            >
              Save &amp; Continue <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onSubmit}
              className="bg-primary hover:bg-primary/95 text-white font-bold px-6 h-9 transition-colors shadow-sm text-xs select-none cursor-pointer"
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
  const isPending = state.profile.status === 'Pending Approval';
  const isDraft = state.profile.status === 'Draft' || state.profile.status === 'Rejected';

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
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-stone-900 border border-stone-850 text-stone-100 text-xs px-4 py-2.5 rounded-xl shadow-lg animate-slide-down">
          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
          <span className="font-semibold select-none">Draft onboarding configurations saved successfully</span>
        </div>
      )}

      {/* 2. COMPONENT WIZARD HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4 select-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-stone-900">Vendor Registration</h2>
            <ProgressBadge count={`${currentStep} / 4`} />
          </div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold">
            <span className="bg-stone-100 border border-stone-200 text-stone-600 px-2 py-0.5 rounded font-mono uppercase tracking-wide">
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
            <div className="animate-fade-in space-y-3">
              <SectionHeader title="COMPANY IDENTITY" icon={Building2} />
              <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                <div className="bg-white">
                  <EnterpriseFieldCard label="Legal Entity Name" required labelWidth="sm:w-28" error={validationErrors[1]?.companyName}>
                    <input type="text" value={companyForm.companyName} onChange={e => handleFieldChange('companyName', e.target.value)} placeholder="e.g. Bharat Steel Alloys Pvt. Ltd." className="w-full max-w-md bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal h-9 shadow-sm transition-all" />
                  </EnterpriseFieldCard>
                </div>
                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                  <div className="w-[320px] shrink-0">
                    <EnterpriseFieldCard label="Trade / Brand Name" labelWidth="sm:w-28" error={validationErrors[1]?.tradeName}>
                      <input type="text" value={companyForm.tradeName} onChange={e => handleFieldChange('tradeName', e.target.value)} placeholder="e.g. Bharat Steel" className="w-[160px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal h-9 shadow-sm transition-all" />
                    </EnterpriseFieldCard>
                  </div>
                  <div className="w-[330px] shrink-0">
                    <EnterpriseFieldCard label="Business Type" required labelWidth="sm:w-24" error={validationErrors[1]?.businessType}>
                      <select value={companyForm.businessType} onChange={e => handleFieldChange('businessType', e.target.value)} className="w-[190px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1 px-2.5 text-xs outline-none text-stone-955 font-normal h-9 shadow-sm transition-all">
                        <option value="" disabled className="text-stone-400">Select Business Type</option>
                        <option value="MFGR">Manufacturer (MFGR)</option>
                        <option value="TRDR">Trader / Distributor (TRDR)</option>
                        <option value="SRVC">Service Provider (SRVC)</option>
                        <option value="MSME">Micro Enterprise (MSME)</option>
                      </select>
                    </EnterpriseFieldCard>
                  </div>
                </div>
                <div className="bg-white">
                  <EnterpriseFieldCard label="Incorporation Date" labelWidth="sm:w-28" error={validationErrors[1]?.incorporationDate}>
                    <div className="w-[150px]">
                      <CustomDatePicker value={companyForm.incorporationDate} onChange={val => handleFieldChange('incorporationDate', val)} placeholder="Select Date" />
                    </div>
                  </EnterpriseFieldCard>
                </div>
              </div>

              <SectionHeader title="REGISTERED ADDRESS" icon={Truck} />
              <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                <div className="bg-white">
                  <EnterpriseFieldCard label="Street / Area" required labelWidth="sm:w-20" error={validationErrors[1]?.address}>
                    <input type="text" value={companyForm.address} onChange={e => handleFieldChange('address', e.target.value)} placeholder="e.g. 102, Mittal Chambers, Nariman Point" className="w-full max-w-lg bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal h-9 shadow-sm transition-all" />
                  </EnterpriseFieldCard>
                </div>
                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                  <div className="w-[250px] shrink-0">
                    <EnterpriseFieldCard label="City" required labelWidth="sm:w-12" error={validationErrors[1]?.city}>
                      <input type="text" value={companyForm.city} onChange={e => handleFieldChange('city', e.target.value)} placeholder="e.g. Mumbai" className="w-[150px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal h-9 shadow-sm transition-all" />
                    </EnterpriseFieldCard>
                  </div>
                  <div className="w-[310px] shrink-0">
                    <EnterpriseFieldCard label="State" required labelWidth="sm:w-14" error={validationErrors[1]?.state}>
                      <SearchableSelect value={companyForm.state} onChange={val => handleFieldChange('state', val)} options={INDIAN_STATES} placeholder="Select State" />
                    </EnterpriseFieldCard>
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
                  <div className="w-[210px] shrink-0">
                    <EnterpriseFieldCard label="PIN Code" required labelWidth="sm:w-16" error={validationErrors[1]?.postalCode}>
                      <input type="text" maxLength={6} value={companyForm.postalCode} onChange={e => handleFieldChange('postalCode', e.target.value.replace(/\D/g, ''))} placeholder="e.g. 400021" className="w-[100px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal font-mono h-9 shadow-sm transition-all" />
                    </EnterpriseFieldCard>
                  </div>
                  <div className="w-[320px] shrink-0">
                    <EnterpriseFieldCard label="Contact Email" required labelWidth="sm:w-24" error={validationErrors[1]?.email}>
                      <input type="email" value={companyForm.email} onChange={e => handleFieldChange('email', e.target.value)} placeholder="e.g. billing@company.com" className="w-[190px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal h-9 shadow-sm transition-all" />
                    </EnterpriseFieldCard>
                  </div>
                  <div className="w-[320px] shrink-0">
                    <EnterpriseFieldCard label="Mobile / Phone" required labelWidth="sm:w-28" error={validationErrors[1]?.phone}>
                      <input type="text" value={companyForm.phone} onChange={e => handleFieldChange('phone', e.target.value)} placeholder="e.g. +91 22 2345 6789" className="w-[150px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal h-9 shadow-sm transition-all" />
                    </EnterpriseFieldCard>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TAX & REGULATORY */}
          {currentStep === 2 && (
            <div className="animate-fade-in space-y-1">
              <SectionHeader title="INDIAN TAX IDS" icon={Building2} />
              <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
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
                        className="w-[150px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal uppercase font-mono h-9 shadow-sm transition-all"
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
                        className="w-[180px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal uppercase font-mono h-9 shadow-sm transition-all"
                      />
                    </EnterpriseFieldCard>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
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
                        className="w-[180px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1 px-2.5 text-xs outline-none text-stone-955 font-normal h-9 shadow-sm transition-all"
                      >
                        <option value="" disabled className="text-stone-400">Select Type</option>
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
                        className="w-[210px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal uppercase font-mono h-9 shadow-sm transition-all"
                      />
                    </EnterpriseFieldCard>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
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
                        className="w-[190px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal uppercase font-mono h-9 shadow-sm transition-all"
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
                        className="w-[220px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1 px-2.5 text-xs outline-none text-stone-955 font-normal h-9 shadow-sm transition-all"
                      >
                        <option value="" disabled className="text-stone-400">Select TDS mapping</option>
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
            <div className="animate-fade-in space-y-3">
              <SectionHeader title="BANK ACCOUNT" icon={CreditCard} />
              <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
                <div className="bg-white">
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
                      className="w-full max-w-md bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal h-9 shadow-sm transition-all"
                    />
                  </EnterpriseFieldCard>
                </div>

                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
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
                          className="w-full bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 pl-3 pr-8 text-xs outline-none text-stone-955 font-normal font-mono h-9 shadow-sm transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setPassVisible(!passVisible)}
                          className="absolute right-2 top-2 hover:bg-stone-50 rounded text-stone-400 hover:text-stone-700"
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
                        className="w-[150px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal uppercase font-mono h-9 shadow-sm transition-all"
                      />
                    </EnterpriseFieldCard>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-white">
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
                        className="w-[220px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal h-9 shadow-sm transition-all"
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
                        className="w-[220px] bg-white border border-stone-400 hover:border-stone-600 focus:border-stone-955 focus:ring-1 focus:ring-stone-955 rounded-lg py-1.5 px-3 text-xs outline-none text-stone-955 font-normal h-9 shadow-sm transition-all"
                      />
                    </EnterpriseFieldCard>
                  </div>
                </div>

                <div className="bg-white">
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
            <div className="animate-fade-in space-y-3">
              <SectionHeader title="MANDATORY DOCUMENTS" icon={FileText} />
              <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
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
              <div className="flex flex-col border border-stone-200 rounded-lg divide-y divide-stone-200 bg-white overflow-hidden shadow-xs">
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
        <div className="p-8 rounded-2xl border border-stone-200 bg-white text-center space-y-6 flex flex-col items-center shadow-sm max-w-lg mx-auto">
          <div className="size-14 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-600 shadow-sm">
            <Clock className="size-6 text-stone-500 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-stone-900">Compliance Processing in Progress</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              We are checking compliance registries, tax registrations, and banking clearance links in SAP ERP. A master record synchronization will run shortly.
            </p>
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden border border-stone-200">
            <div className="bg-stone-850 h-full w-2/3 rounded-full animate-[pulse_1.5s_infinite]"></div>
          </div>
          <button
            type="button"
            onClick={approveRegistration}
            className="px-5 py-2.5 bg-stone-850 hover:bg-black text-stone-700 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            Acknowledge compliance checks manually
          </button>
        </div>
      )}

      {/* 7. APPROVED / WORKFLOW COMPLETED VIEW (SAP Vendor Ledger Summary) */}
      {isApproved && (
        <div className="space-y-6 animate-fade-in select-none">
          <div className="p-6 rounded-xl border border-stone-200 bg-white flex items-start gap-4 shadow-sm">
            <div className="size-11 rounded-full bg-emerald-550/10 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
              <CheckCircle2 className="size-5.5 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-900">SAP Vendor Master Record Synced</h3>
              <p className="text-xs text-stone-550 leading-normal">
                Tax profiles and clearing bank settlement parameters are synced successfully to SAP. Assigned Vendor Code:
                <span className="font-mono text-stone-850 font-bold bg-stone-100 border border-stone-200 px-2 py-0.5 rounded ml-1.5 text-xs">
                  {state.profile.sapVendorCode}
                </span>
              </p>
              <div className="flex items-center gap-4 text-[10px] text-stone-400 mt-2.5 font-semibold font-mono">
                <span>SYNC TIME: {new Date(state.profile.approvedAt || '').toLocaleString()}</span>
                <span>&bull;</span>
                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-100 rounded text-[9px] font-bold">STATUS: ACTIVE</span>
              </div>
            </div>
          </div>

          {/* DETAILED LEDGER PROFILE INFORMATION */}
          <div className="p-6 rounded-xl border border-stone-200 bg-white shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 pb-2">
              Registered Master Ledger Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs text-stone-700">
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
                <div key={idx} className="flex justify-between items-center border-b border-stone-100 pb-2 gap-4">
                  <span className="text-stone-400 font-semibold shrink-0">{row.label}</span>
                  <span className={`font-semibold text-right truncate max-w-[220px] ${row.isMono || row.isFile ? 'font-mono' : ''
                    } ${row.isGreen ? 'text-stone-900 font-bold' : 'text-stone-950'
                    } ${row.isFile ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded text-[10px] flex items-center gap-1 select-none font-semibold' : ''
                    }`}>
                    {row.isFile && <FileText className="size-3 text-emerald-600 inline shrink-0" />}
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
    <span className="bg-stone-900 text-stone-100 border border-stone-850 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full select-none shrink-0">
      {count}
    </span>
  );
}
