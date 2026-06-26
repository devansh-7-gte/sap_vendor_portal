import { apiClient } from '../../../lib/api-client';

export const poService = {
  async getPOs() {
    return apiClient.get('/pos').catch(() => null);
  },

  async getPOById(poId) {
    return apiClient.get(`/pos/${poId}`).catch(() => null);
  },

  async createPO(poData) {
    return apiClient.post('/pos/simulate', poData);
  },

  async acknowledgePO(poId) {
    return apiClient.put(`/pos/${poId}/acknowledge`, {});
  },

  async submitASN(poId, asnData) {
    return apiClient.post(`/pos/${poId}/asn`, asnData);
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
