import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Truck,
  CreditCard,
  Check,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function OnboardingView({ state, companyForm, setCompanyForm, handleCompanySubmit, approveRegistration }) {
  const isApproved = state.profile.status === 'Approved';
  const isPending = state.profile.status === 'Pending Approval' || state.profile.status === 'Under Review';
  const isDraft = state.profile.status === 'Draft' || state.profile.status === 'Rejected' || state.profile.status === 'Pending';

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h2 className="text-[22px] font-bold text-text-primary">Vendor Onboarding & Compliance</h2>
        <p className="text-text-tertiary text-xs mt-0.5">Submit organizational details to register vendor master record in SAP.</p>
      </div>

      {/* STEP PROGRESS TRACKER */}
      <div className="flex items-center gap-4 p-4.5 card">
        <div className="flex items-center gap-2">
          <span className={`size-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
            isApproved ? 'text-white' : 'bg-surface2 text-text-tertiary border border-border'
          }`}
            style={isApproved ? { backgroundColor: 'rgb(var(--color-emerald-default-rgb))' } : undefined}
          >
            {isApproved ? <Check className="size-3" /> : '1'}
          </span>
          <span className={`text-xs font-semibold ${isApproved ? 'text-text-primary' : 'text-text-tertiary'}`}>General Profile</span>
        </div>
        <div className="h-px bg-border flex-1"></div>
        <div className="flex items-center gap-2">
          <span className={`size-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
            isApproved ? 'text-white' : isPending ? 'bg-surface2 text-text-primary animate-pulse border border-border-em' : 'bg-surface2 text-text-tertiary border border-border'
          }`}
            style={isApproved ? { backgroundColor: 'rgb(var(--color-emerald-default-rgb))' } : undefined}
          >
            {isApproved ? <Check className="size-3" /> : '2'}
          </span>
          <span className={`text-xs font-semibold ${isPending ? 'text-text-primary' : isApproved ? 'text-text-primary' : 'text-text-tertiary'}`}>Compliance Check</span>
        </div>
        <div className="h-px bg-border flex-1"></div>
        <div className="flex items-center gap-2">
          <span className={`size-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
            isApproved ? 'text-white' : 'bg-surface2 text-text-tertiary border border-border'
          }`}
            style={isApproved ? { backgroundColor: 'rgb(var(--color-emerald-default-rgb))' } : undefined}
          >
            {isApproved ? <Check className="size-3" /> : '3'}
          </span>
          <span className={`text-xs font-semibold ${isApproved ? 'text-text-primary' : 'text-text-tertiary'}`}>SAP Sync Success</span>
        </div>
      </div>

      {/* 1. ONBOARDING REGISTRATION FORM */}
      {isDraft && (
        <form onSubmit={handleCompanySubmit} className="space-y-6">
          {state.profile.status === 'Rejected' && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 text-red-700 flex items-start gap-3">
              <AlertTriangle className="size-5 shrink-0 mt-0.5 text-red-600" />
              <div>
                <h4 className="font-bold text-xs">Compliance Verification Failure</h4>
                <p className="text-[11px] mt-1 text-red-700/80">The provided GSTIN or Account documentation failed automated compliance validation in SAP ERP.</p>
              </div>
            </div>
          )}

          {/* Company details */}
          <div className="p-6 card space-y-4">
            <h3 className="label mb-0 border-b border-border pb-2 flex items-center gap-2">
              <Building2 className="size-4 text-text-tertiary" /> Company profile specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="label">Company Legal Name *</label>
                <input
                  type="text" required value={companyForm.companyName}
                  onChange={e => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                  placeholder="e.g. Enterprise Solutions Pvt Ltd"
                />
              </div>
              <div className="space-y-1">
                <label className="label">GSTIN / Tax ID *</label>
                <input
                  type="text" required value={companyForm.gstin}
                  onChange={e => setCompanyForm({ ...companyForm, gstin: e.target.value })}
                  placeholder="e.g. 07AAAAA1111A1Z1"
                  className="uppercase font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="label">PAN (Income Tax Identifier)</label>
                <input
                  type="text" value={companyForm.pan}
                  onChange={e => setCompanyForm({ ...companyForm, pan: e.target.value })}
                  placeholder="e.g. ABCDE1234F"
                  className="uppercase font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="label">Email Address *</label>
                  <input
                    type="email" required value={companyForm.email}
                    onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })}
                    placeholder="sales@company.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="label">Phone Endpoint</label>
                  <input
                    type="text" value={companyForm.phone}
                    onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address details */}
          <div className="p-6 card space-y-4">
            <h3 className="label mb-0 border-b border-border pb-2 flex items-center gap-2">
              <Truck className="size-4 text-text-tertiary" /> Dispatch & registered office address
            </h3>
            <div className="space-y-1.5">
              <label className="label">Street Address</label>
              <input
                type="text" value={companyForm.address}
                onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })}
                placeholder="Plot 42, Phase 1, Industrial Area"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="label">City</label>
                <input
                  type="text" value={companyForm.city}
                  onChange={e => setCompanyForm({ ...companyForm, city: e.target.value })}
                  placeholder="New Delhi"
                />
              </div>
              <div className="space-y-1">
                <label className="label">State</label>
                <input
                  type="text" value={companyForm.state}
                  onChange={e => setCompanyForm({ ...companyForm, state: e.target.value })}
                  placeholder="Delhi"
                />
              </div>
              <div className="space-y-1">
                <label className="label">Postal Code</label>
                <input
                  type="text" value={companyForm.postalCode}
                  onChange={e => setCompanyForm({ ...companyForm, postalCode: e.target.value })}
                  placeholder="110001"
                />
              </div>
            </div>
          </div>

          {/* Banking details */}
          <div className="p-6 card space-y-4">
            <h3 className="label mb-0 border-b border-border pb-2 flex items-center gap-2">
              <CreditCard className="size-4 text-text-tertiary" /> Banking settlement specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="label">Bank Institution Name</label>
                <input
                  type="text" value={companyForm.bankName}
                  onChange={e => setCompanyForm({ ...companyForm, bankName: e.target.value })}
                  placeholder="State Bank of India"
                />
              </div>
              <div className="space-y-1">
                <label className="label">Account Name / Beneficiary</label>
                <input
                  type="text" value={companyForm.accountName}
                  onChange={e => setCompanyForm({ ...companyForm, accountName: e.target.value })}
                  placeholder="e.g. Enterprise Solutions Account"
                />
              </div>
              <div className="space-y-1">
                <label className="label">Account Number</label>
                <input
                  type="password" value={companyForm.accountNumber}
                  onChange={e => setCompanyForm({ ...companyForm, accountNumber: e.target.value })}
                  placeholder="••••••••••••••"
                  className="font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="label">IFSC / Routing Code</label>
                <input
                  type="text" value={companyForm.ifscCode}
                  onChange={e => setCompanyForm({ ...companyForm, ifscCode: e.target.value })}
                  placeholder="SBIN0001234"
                  className="uppercase font-mono"
                />
              </div>
            </div>
          </div>

          {/* SUBMIT */}
          <div className="flex justify-end gap-3">
            <Button type="submit" variant="default" size="lg">
              Trigger BAPI Onboarding Sync
            </Button>
          </div>
        </form>
      )}

      {/* 2. PENDING COMPLIANCE STATE */}
      {isPending && (
        <div className="p-8 card text-center space-y-6 flex flex-col items-center">
          <div className="size-14 rounded-full bg-surface2 border border-border flex items-center justify-center text-text-tertiary">
            <Clock className="size-6 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text-primary">Compliance Processing in SAP ERP</h3>
            <p className="text-xs text-text-tertiary max-w-md mx-auto leading-relaxed">
              We have dispatched general master records to BAPI queues. Verification of compliance certificates is executing in background.
            </p>
          </div>
          {/* PROGRESS */}
          <div className="w-64 bg-surface2 h-1.5 rounded-full overflow-hidden border border-border">
            <div className="h-full w-2/3 rounded-full animate-progress-bar" style={{ backgroundColor: 'rgb(var(--color-emerald-default-rgb))' }}></div>
          </div>

          <Button onClick={approveRegistration} variant="default">
            Acknowledge compliance checks manually
          </Button>
        </div>
      )}

      {/* 3. APPROVED STATE */}
      {isApproved && (
        <div className="space-y-6">
          <div className="p-6 card flex items-start gap-4">
            <div className="size-11 rounded-full bg-surface2 flex items-center justify-center text-text-secondary shrink-0 border border-border">
              <CheckCircle2 className="size-5.5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary">SAP Vendor Master Record Synced</h3>
              <p className="text-xs text-text-tertiary leading-normal">
                Onboarding check complete. Assigned Vendor Code: <span className="font-mono text-text-primary font-bold bg-surface2 border border-border px-2 py-0.5 rounded ml-1 tabular-nums">{state.profile.sapVendorCode}</span>
              </p>
              <div className="flex items-center gap-4 text-[10px] text-text-tertiary mt-2 font-medium">
                <span className="tabular-nums">Synced At: {new Date(state.profile.approvedAt || '').toLocaleString()}</span>
                <span>•</span>
                <span className="text-text-secondary font-bold font-mono">STATUS: ACTIVE</span>
              </div>
            </div>
          </div>

          {/* PROFILE SUMMARY */}
          <div className="p-6 card space-y-4">
            <h3 className="label mb-0 border-b border-border pb-2">Registered Entity Profile Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-tertiary">Legal Entity Name</span>
                <span className="font-semibold text-text-primary">{state.profile.companyName}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-tertiary">SAP Vendor Code</span>
                <span className="font-mono font-bold text-text-primary tabular-nums">{state.profile.sapVendorCode}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-tertiary">GSTIN / Tax ID</span>
                <span className="font-mono text-text-primary">{state.profile.gstin}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-tertiary">PAN Number</span>
                <span className="font-mono text-text-primary">{state.profile.pan}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-tertiary">Email Address</span>
                <span className="text-text-primary">{state.profile.email}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-tertiary">Settlement Bank</span>
                <span className="text-text-primary">{state.profile.bankName}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-tertiary">Account Details</span>
                <span className="font-mono text-text-primary tabular-nums">••••{state.profile.accountNumber?.slice(-4)} ({state.profile.ifscCode})</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-tertiary">Registered Office</span>
                <span className="text-text-primary">{state.profile.city}, {state.profile.state}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
