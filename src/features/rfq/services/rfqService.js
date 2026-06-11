import { apiClient } from '../../../lib/api-client';

export const rfqService = {
  async getRFQs() {
    return apiClient.get('/rfqs').catch(() => null);
  },

  async getRFQById(rfqId) {
    return apiClient.get(`/rfqs/${rfqId}`).catch(() => null);
  },

  async createRFQ(rfqData) {
    return apiClient.post('/rfqs', rfqData).catch(() => null);
  },

  async submitBid(rfqId, bidData) {
    return apiClient.post(`/rfqs/${rfqId}/bid`, bidData).catch(() => null);
  },

  async awardBid(rfqId, vendorId) {
    return apiClient.post(`/rfqs/${rfqId}/award`, { vendorId }).catch(() => null);
  },

  async reissueRFQ(rfqId, newDeadline) {
    return apiClient.put(`/rfqs/${rfqId}/reissue`, { deadlineDate: newDeadline }).catch(() => null);
  },

  async cancelRFQ(rfqId) {
    return apiClient.put(`/rfqs/${rfqId}/cancel`, {}).catch(() => null);
  }
};
