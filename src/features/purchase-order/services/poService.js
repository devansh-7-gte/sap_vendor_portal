import { apiClient } from '../../../lib/api-client';

export const poService = {
  async getPOs() {
    return apiClient.get('/purchase-orders').catch(() => null);
  },

  async getPOById(poId) {
    return apiClient.get(`/purchase-orders/${poId}`).catch(() => null);
  },

  async createPO(poData) {
    return apiClient.post('/purchase-orders', poData).catch(() => null);
  },

  async acknowledgePO(poId) {
    return apiClient.put(`/purchase-orders/${poId}/acknowledge`, {}).catch(() => null);
  },

  async submitASN(poId, asnData) {
    return apiClient.post(`/purchase-orders/${poId}/asn`, asnData).catch(() => null);
  },

  async getASNs() {
    return apiClient.get('/asns').catch(() => null);
  },

  async getGRNs() {
    return apiClient.get('/grns').catch(() => null);
  },

  async updatePOStatus(poId, status) {
    return apiClient.put(`/purchase-orders/${poId}/status`, { status }).catch(() => null);
  }
};
