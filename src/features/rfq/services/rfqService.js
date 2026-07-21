import { apiClient } from '../../../lib/api-client';

export const rfqService = {
  async getRFQs() {
    return apiClient.get('/rfqs?all=true').catch(() => null);
  },

  async getRFQById(rfqId) {
    return apiClient.get(`/rfqs/${rfqId}`).catch(() => null);
  },

  async createRFQ(rfqData) {
    return apiClient.post('/rfqs', rfqData);
  },

  async submitBid(rfqId, bidData) {
    return apiClient.post(`/rfqs/${rfqId}/bid`, bidData);
  },

  async awardBid(rfqId, vendorId) {
    return apiClient.post(`/rfqs/${rfqId}/award`, { vendorId });
  },

  async reissueRFQ(rfqId, newDeadline) {
    return apiClient.put(`/rfqs/${rfqId}/reissue`, { deadlineDate: newDeadline });
  },

  async cancelRFQ(rfqId) {
    return apiClient.put(`/rfqs/${rfqId}/cancel`, {});
  }
};
