const normalizeApiBase = (value) => (value || '/api').replace(/\/+$/, '');

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_CORE_API_URL || '/api'
);

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getOrganizationHeader = () => {
  try {
    const savedUser = localStorage.getItem('authUser');
    const user = savedUser ? JSON.parse(savedUser) : null;
    const organizationId = user?.organization_id || user?.organizationId || user?.organization?.id || 1;
    return { 'X-Organization-ID': String(organizationId) };
  } catch {
    return { 'X-Organization-ID': '1' };
  }
};

function unwrap(json) {
  if (json && typeof json === 'object' && json.success !== false && json.data !== undefined) {
    return json.data;
  }
  return json;
}

async function request(endpoint, options = {}) {
  const baseUrl = API_BASE.startsWith('http') ? API_BASE : `${window.location.origin}${API_BASE}`;
  const url = `${baseUrl.replace(/\/+$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...getOrganizationHeader(),
      ...(options.headers || {}),
    },
    ...options,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || json.error || `HTTP ${response.status}`);
  }
  return unwrap(json);
}

export const propertyDocumentApi = {
  createPayment: (payload) =>
    request('/property-documents/create-payment', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verifyPayment: (payload) =>
    request('/property-documents/verify-payment', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  checkAccess: (propertyId) =>
    request(`/property-documents/check-access/${propertyId}`),

  getDocuments: (propertyId) =>
    request(`/property-documents/${propertyId}`),
};

export default propertyDocumentApi;
