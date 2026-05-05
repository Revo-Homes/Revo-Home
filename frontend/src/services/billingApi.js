// Billing API Service for Revo-Homes
// Connects to the backend billing and subscription endpoints

const normalizeApiBase = (value) => {
  const base = (value || '/api/v1').replace(/\/+$/, '');
  return base === '/api' ? '/api/v1' : base;
};

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_CORE_API_URL || 'http://localhost:3000/api/v1'
);

const authHeaders = () => {
  // Revo-Home uses cookie-based auth (session_token cookie set by backend)
  // The browser automatically sends cookies with credentials: 'include'
  // We only need to add the Organization ID header
  return { 'X-Organization-ID': '1' };
};

/** Backend returns `{ success, data, message? }` — unwrap `data` for callers. */
function unwrapPayload(json) {
  if (json && typeof json === 'object' && json.success !== false && json.data !== undefined) {
    return json.data;
  }
  return json;
}

async function apiClient(endpoint, options = {}) {
  const baseUrl = API_BASE.startsWith('http') ? API_BASE : `${window.location.origin}${API_BASE}`;
  const url = `${baseUrl.replace(/\/+$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  const json = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    throw new Error(json.message || json.error || `HTTP ${response.status}`);
  }
  
  return unwrapPayload(json);
}

function query(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.append(key, value);
  });
  const value = search.toString();
  return value ? `?${value}` : '';
}

export const billingApi = {
  getPlans: async (params = {}) => {
    return apiClient(`/subscriptions/plans${query(params)}`);
  },
  
  getPlanById: async (planId) => {
    return apiClient(`/subscriptions/plans/${planId}`);
  },
  
  validateCoupon: async (code, params = {}) => {
    return apiClient(`/billing/coupons/validate${query({ code, ...params })}`);
  },

  createListingDocumentCheckout: async (payload) => {
    return apiClient('/billing/portal/listing-document-checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getListingDocumentAccess: async (listingId) => {
    return apiClient(`/billing/portal/listing-document-access${query({ listingId })}`);
  },
  
  getActiveSubscription: async (orgId, params = {}) => {
    const path = orgId
      ? `/subscriptions/active-any/${orgId}${query(params)}`
      : `/subscriptions/active-any${query(params)}`;
    return apiClient(path);
  },
  
  getSubscriptions: async (params = {}) => {
    return apiClient(`/subscriptions${query(params)}`);
  },

  createSubscription: async (payload) => {
    return apiClient('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  changePlan: async (subscriptionId, payload) => {
    return apiClient(`/subscriptions/${subscriptionId}/change-plan`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  cancelSubscription: async (subscriptionId, payload = {}) => {
    return apiClient(`/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  
  renewSubscription: async (subscriptionId) => {
    return apiClient(`/subscriptions/${subscriptionId}/renew`, {
      method: 'POST',
    });
  },

  getPortalOverview: async (orgId, categoryKey = 'crm_plans') => {
    return apiClient(`/billing/portal/overview${query({ organizationId: orgId, categoryKey })}`);
  },
  
  getInvoices: async (params = {}) => {
    return apiClient(`/billing/portal/invoices${query(params)}`);
  },
  
  getUsage: async (params = {}) => {
    return apiClient(`/billing/portal/usage${query(params)}`);
  },
  
  getSummary: async (orgId) => {
    return apiClient(`/billing/summary${query({ organizationId: orgId })}`);
  },

  requestRefund: async (payload) => {
    return apiClient('/billing/refunds', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  
  getMyRefunds: async () => {
    return apiClient('/billing/refunds/my');
  },

  createPayUOrder: async (payload) => {
    return apiClient('/payments/payu/order', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  verifyPayU: async (payload) => {
    return apiClient('/payments/payu/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  
  getPayUStatus: async (txnid) => {
    return apiClient(`/payments/payu/status/${txnid}`);
  },
  
  payAdvance: async (invoiceId, payload) => {
    return apiClient(`/billing/invoices/${invoiceId}/pay-advance`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  
  payRemaining: async (invoiceId, payload) => {
    return apiClient(`/billing/invoices/${invoiceId}/pay-remaining`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  
  downloadInvoicePdf: async (invoiceId) => {
    const baseUrl = API_BASE.startsWith('http') ? API_BASE : `${window.location.origin}${API_BASE}`;
    const url = `${baseUrl.replace(/\/+$/, '')}/billing/invoices/${invoiceId}/pdf`;
    
    const response = await fetch(url, {
      credentials: 'include',
      headers: authHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `invoice-${invoiceId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  },
};

export default billingApi;
