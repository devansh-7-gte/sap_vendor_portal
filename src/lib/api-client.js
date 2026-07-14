const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = {
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    
    // Add Authorization header with JWT token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Add default vendor ID header for development/compatibility
      let clerkId = localStorage.getItem('clerk_user_id');
      
      if (!clerkId) {
        const profileData = localStorage.getItem('sap_vendor_profile_data');
        if (profileData) {
          try {
            const parsed = JSON.parse(profileData);
            clerkId = parsed.clerkId || parsed.vendorId;
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
            clerkId = state?.profile?.clerkId || state?.profile?.vendorId;
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
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('clerk_user_id');
        localStorage.removeItem('sap_vendor_profile_data');
        if (window.location.pathname !== '/sign-in' && window.location.pathname !== '/sign-up') {
          window.location.href = '/sign-in';
        }
      }
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
