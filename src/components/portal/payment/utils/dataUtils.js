'use client';

/**
 * Generate mock payment data for demonstration
 */
export function generateMockPayments(state) {
  if (state?.payments && state.payments.length > 0) {
    return state.payments.map((pay) => {
      const invoice = state.invoices?.find(i => i.id === pay.invoiceId) || {};
      return {
        id: pay.id,
        paymentNumber: `PAY-${Math.random().toString(36).substring(7).toUpperCase()}`,
        invoiceNumber: invoice.invoiceNumber || 'INV-00000',
        poNumber: invoice.poNumber || 'PO-00000',
        paymentDate: pay.paymentDate || new Date().toISOString().split('T')[0],
        invoiceDate: invoice.invoiceDate || new Date().toISOString().split('T')[0],
        grossAmount: pay.amount || 50000,
        tdsAmount: Math.round((pay.amount || 50000) * 0.1),
        netAmount: Math.round((pay.amount || 50000) * 0.9),
        utrNumber: `UTR${Date.now().toString().slice(-10)}`,
        status: pay.status || 'Cleared',
        paymentMethod: pay.paymentMethod || 'NEFT',
        bankName: 'ICICI Bank',
        bankReference: `REF${Math.random().toString(36).substring(7).toUpperCase()}`,
        clearingDate: pay.paymentDate || new Date().toISOString().split('T')[0],
      };
    });
  }

  // Fallback mock data
  const statuses = ['Cleared', 'Processing', 'Pending', 'Overdue'];
  const paymentMethods = ['NEFT', 'RTGS', 'IMPS', 'Bank Transfer'];
  const banks = ['ICICI Bank', 'HDFC Bank', 'Axis Bank', 'SBI'];

  return Array.from({ length: 15 }, (_, i) => ({
    id: `payment-${i}`,
    paymentNumber: `PAY-${String(i + 1).padStart(6, '0')}`,
    invoiceNumber: `INV-${String(Math.floor(Math.random() * 1000)).padStart(5, '0')}`,
    poNumber: `PO-${String(Math.floor(Math.random() * 1000)).padStart(5, '0')}`,
    paymentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    invoiceDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    grossAmount: Math.round(Math.random() * 500000) + 10000,
    tdsAmount: Math.round(Math.random() * 50000) + 1000,
    netAmount: Math.round(Math.random() * 450000) + 9000,
    utrNumber: `UTR${Date.now().toString().slice(-10)}${String(i).padStart(2, '0')}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    bankName: banks[Math.floor(Math.random() * banks.length)],
    bankReference: `REF${Math.random().toString(36).substring(7).toUpperCase()}`,
    clearingDate: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }));
}

/**
 * Generate mock TDS certificate data
 */
export function generateMockTDSCertificates(state) {
  const quarters = ['Q1 (Apr-Jun)', 'Q2 (Jul-Sep)', 'Q3 (Oct-Dec)', 'Q4 (Jan-Mar)'];
  const currentYear = new Date().getFullYear();

  return Array.from({ length: 8 }, (_, i) => {
    const year = currentYear - Math.floor(i / 4);
    const quarter = i % 4;

    return {
      id: `tds-${i}`,
      certificateNumber: `16A-${year}-${String(quarter + 1).padStart(2, '0')}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      quarter: quarters[quarter],
      financialYear: `${year}-${String(year + 1).slice(-2)}`,
      paymentReference: `PAY-REF-${year}-${String(quarter + 1).padStart(2, '0')}`,
      tdsAmount: Math.round(Math.random() * 50000) + 1000,
      issueDate: new Date(year, quarter * 3 + 2).toISOString().split('T')[0],
      status: 'Available',
    };
  });
}

/**
 * Generate mock payment advice documents
 */
export function generateMockPaymentAdvices(state) {
  const types = ['Payment Advice', 'Bank Advice', 'Remittance Advice', 'Settlement Advice'];

  return Array.from({ length: 12 }, (_, i) => ({
    id: `advice-${i}`,
    name: `Payment Advice ${String(i + 1).padStart(4, '0')}`,
    type: types[Math.floor(Math.random() * types.length)],
    generatedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: Math.round(Math.random() * 500000) + 10000,
    reference: `REF-${Math.random().toString(36).substring(7).toUpperCase()}`,
    paymentDate: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }));
}

/**
 * Generate mock account statement data
 */
export function generateMockAccountStatement(state) {
  const documentTypes = ['Invoice', 'Payment', 'Credit Memo', 'Debit Memo', 'Journal Entry'];

  return Array.from({ length: 20 }, (_, i) => {
    const amount = Math.round(Math.random() * 500000) + 10000;
    const isDebit = Math.random() > 0.5;

    return {
      id: `statement-${i}`,
      documentNumber: `DOC-${String(i + 1).padStart(6, '0')}`,
      documentType: documentTypes[Math.floor(Math.random() * documentTypes.length)],
      debit: isDebit ? amount : 0,
      credit: !isDebit ? amount : 0,
      balance: Math.random() * 1000000,
      reference: `REF-${Math.random().toString(36).substring(7).toUpperCase()}`,
      postingDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
  });
}

/**
 * Generate mock MSME payment data
 */
export function generateMockMSMEPayments(state) {
  const riskLevels = ['Green', 'Amber', 'Red'];
  const statuses = ['On Time', 'Warning', 'Overdue'];

  return Array.from({ length: 10 }, (_, i) => {
    const daysOverdue = Math.floor(Math.random() * 120);
    const riskLevel = daysOverdue > 45 ? 'Red' : daysOverdue > 15 ? 'Amber' : 'Green';

    return {
      id: `msme-${i}`,
      invoiceNumber: `INV-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
      dueDate: new Date(Date.now() - daysOverdue * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      outstandingAmount: Math.round(Math.random() * 500000) + 10000,
      delayDays: daysOverdue,
      riskLevel: riskLevel,
      status: daysOverdue > 0 ? 'Overdue' : 'On Time',
      agingBucket: daysOverdue <= 15 ? '0-15 Days' : daysOverdue <= 30 ? '15-30 Days' : daysOverdue <= 45 ? '30-45 Days' : '45+ Days',
    };
  });
}

/**
 * Format currency for display
 */
export function formatCurrency(amount, symbol = '₹') {
  if (!amount) return `${symbol} 0.00`;
  return `${symbol} ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format date for display
 */
export function formatDate(date, format = 'en-IN') {
  if (!date) return '-';
  return new Date(date).toLocaleDateString(format, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate payment statistics
 */
export function calculatePaymentStats(payments) {
  if (!payments || payments.length === 0) {
    return {
      total: 0,
      cleared: 0,
      pending: 0,
      overdue: 0,
      totalAmount: 0,
      clearedAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      averagePaymentDays: 0,
    };
  }

  const cleared = payments.filter(p => p.status === 'Cleared');
  const pending = payments.filter(p => p.status === 'Pending' || p.status === 'Processing');
  const overdue = payments.filter(p => p.status === 'Overdue');

  const totalAmount = payments.reduce((sum, p) => sum + (p.netAmount || 0), 0);
  const clearedAmount = cleared.reduce((sum, p) => sum + (p.netAmount || 0), 0);
  const pendingAmount = pending.reduce((sum, p) => sum + (p.netAmount || 0), 0);
  const overdueAmount = overdue.reduce((sum, p) => sum + (p.netAmount || 0), 0);

  const avgPaymentDays = payments.length > 0
    ? Math.round(
        payments.reduce((sum, p) => {
          const invDate = new Date(p.invoiceDate);
          const payDate = new Date(p.paymentDate);
          return sum + ((payDate - invDate) / (1000 * 60 * 60 * 24));
        }, 0) / payments.length
      )
    : 0;

  return {
    total: payments.length,
    cleared: cleared.length,
    pending: pending.length,
    overdue: overdue.length,
    totalAmount,
    clearedAmount,
    pendingAmount,
    overdueAmount,
    averagePaymentDays: avgPaymentDays,
  };
}

/**
 * Get status color class
 */
export function getStatusColor(status) {
  const colors = {
    Cleared: 'green',
    Processing: 'blue',
    Pending: 'yellow',
    Overdue: 'red',
    Failed: 'red',
    Approved: 'green',
  };
  return colors[status] || 'gray';
}

/**
 * Download file helper
 */
export function downloadFile(filename, content, type = 'application/pdf') {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Generate CSV from array of objects
 */
export function generateCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(',')),
  ].join('\n');

  downloadFile(filename, csv, 'text/csv');
}
