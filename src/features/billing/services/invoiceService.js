import { apiClient } from '../../../lib/api-client';

export const invoiceService = {
  async getInvoices() {
    return apiClient.get('/invoices').catch(() => null);
  },

  async getInvoiceById(invoiceId) {
    return apiClient.get(`/invoices/${invoiceId}`).catch(() => null);
  },

  async createInvoice(invoiceData) {
    return apiClient.post('/invoices', invoiceData).catch(() => null);
  },

  async updateInvoiceStatus(invoiceId, status) {
    return apiClient.put(`/invoices/${invoiceId}/status`, { status }).catch(() => null);
  },

  /** MIRO posting — triggers accounting document creation in SAP */
  async postMiro(invoiceId) {
    return apiClient.post(`/invoices/${invoiceId}/miro`, {}).catch(() => null);
  }
};
