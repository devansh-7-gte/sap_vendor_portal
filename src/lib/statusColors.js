/**
 * Pure status -> `.status-badge-*` class mappers (JIT-safe literal strings only).
 * Mirrors the Super Admin Console `colors.ts` pattern, adapted to this portal's
 * domain statuses (PO, invoice, payment, RFQ, MSME, onboarding).
 */

export function poStatusVariant(status) {
  switch (status) {
    case 'Paid':
    case 'Delivered':
      return 'active';
    case 'Invoiced':
    case 'Dispatched':
      return 'info';
    case 'Acknowledged':
      return 'pending';
    case 'Open':
      return 'warn';
    case 'Cancelled':
      return 'suspended';
    default:
      return 'pending';
  }
}

export function invoiceStatusVariant(status) {
  switch (status) {
    case 'Paid':
      return 'active';
    default:
      return 'warn';
  }
}

export function paymentStatusVariant(status) {
  switch (status) {
    case 'Cleared':
    case 'Paid':
    case 'Active':
    case 'Available':
    case 'Filed & Signed':
      return 'active';
    case 'Processing':
      return 'info';
    case 'Pending':
      return 'pending';
    case 'Overdue':
    case 'Uncleared':
      return 'suspended';
    default:
      return 'pending';
  }
}

export function rfqStatusVariant(status) {
  switch (status) {
    case 'Awarded':
    case 'Quoted':
      return 'active';
    case 'Bidding Open':
      return 'info';
    case 'Submitted':
    case 'Under Review':
      return 'pending';
    case 'Draft':
      return 'pending';
    case 'Closed':
      return 'revoked';
    default:
      return 'pending';
  }
}

export function msmeStatusVariant(status) {
  switch (status) {
    case 'Safe':
    case 'Cleared':
      return 'active';
    case 'Critical (45-Day Alert)':
      return 'warn';
    case 'Overdue (MSME Priority!)':
      return 'suspended';
    default:
      return 'info';
  }
}

export function onboardingStatusVariant(status) {
  switch (status) {
    case 'Approved':
      return 'active';
    case 'Pending Approval':
    case 'Under Review':
    case 'Pending':
      return 'pending';
    case 'Draft':
      return 'info';
    case 'Rejected':
      return 'suspended';
    default:
      return 'pending';
  }
}
