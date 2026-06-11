import { apiClient } from '../../../lib/api-client';

export const paymentService = {
  async getPayments() {
    return apiClient.get('/payments').catch(() => null);
  },

  async getPaymentById(paymentId) {
    return apiClient.get(`/payments/${paymentId}`).catch(() => null);
  },

  async createPayment(paymentData) {
    return apiClient.post('/payments', paymentData).catch(() => null);
  },

  async updatePaymentStatus(paymentId, status) {
    return apiClient.put(`/payments/${paymentId}/status`, { status }).catch(() => null);
  }
};
