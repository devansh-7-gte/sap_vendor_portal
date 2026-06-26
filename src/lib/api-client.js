const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = {
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    
    // Add default vendor ID header for development/compatibility
    if (typeof window !== 'undefined') {
      let clerkId = localStorage.getItem('clerk_user_id');
      
      if (!clerkId) {
        const profileData = localStorage.getItem('sap_vendor_profile_data');
        if (profileData) {
          try {
            const parsed = JSON.parse(profileData);
            clerkId = parsed.clerkId;
          } catch (e) {
            // Ignore
          }
        }
      }
      
      if (!clerkId) {
        const savedState = localStorage.getItem('sap_vendor_portal_state');
        if (savedState) {
          try {
            const state = JSON.parse(savedState);
            clerkId = state?.profile?.clerkId;
          } catch (e) {
            // Ignore
          }
        }
      }

      if (clerkId) {
        headers['x-vendor-id'] = clerkId;
      }
    }

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    
    if (response.status === 204) return null;
    return response.json();
  },

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'GET', headers });
  },

  post(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    });
  },

  put(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers,
    });
  },

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
};
