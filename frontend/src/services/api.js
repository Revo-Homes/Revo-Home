/**
 * REVO HOMES - API Client
 * Base URL: Set via VITE_API_BASE_URL or defaults to /api/v1
 * All endpoints align with frontend pages: Login, OTP, Signup, Properties, Sell, Dashboard, Tools, Admin
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  const headers = { Authorization: `Bearer ${token}` };
  
  // Add Revo Homes organization headers (Organization ID: 1)
  headers['X-Organization-ID'] = '1';
  headers['X-Organization-Name'] = 'Revo Homes';
  
  return headers;
};

const buildUrl = (path, params) => {
  // If API_BASE is an absolute URL, use it directly, otherwise use relative path
  const baseUrl = API_BASE.startsWith('http') ? API_BASE : `${window.location.origin}${API_BASE}`;
  const url = new URL(`${baseUrl}${path}`, baseUrl.startsWith('http') ? baseUrl : window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      url.searchParams.append(key, value);
    });
  }

  return url.toString();
};

const handleResponse = async (res) => {
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }
  
  if (!res.ok) {
    // Log unauthorized specifically to help debugging
    if (res.status === 401) {
      console.warn('API: Unauthorized access - check token');
    }
    throw { status: res.status, message: data.message || data.error || 'Request failed', data };
  }
  return data;
};

const request = (method, path, body = null, opts = {}) => {
  const url = buildUrl(path, opts.params);
  const headers = { 
    'Content-Type': 'application/json', 
    ...getAuthHeader(), 
    ...opts.headers 
  };

  const config = {
    method,
    headers,
  };
  
  if (body && method !== 'GET') {
    // Add organization_id to body for POST/PUT/PATCH requests
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
      body = {
        ...body,
        organization_id: 1  // Always Revo Homes (ID: 1)
      };
    }
    config.body = body instanceof FormData ? body : JSON.stringify(body);
    if (body instanceof FormData) delete config.headers['Content-Type'];
  }

  return fetch(url, config).then(handleResponse);
};

const get = (path, params) => request('GET', path, null, { params });

const post = (path, body) => request('POST', path, body);
const put = (path, body) => request('PUT', path, body);
const patch = (path, body) => request('PATCH', path, body);
const del = (path) => request('DELETE', path);

// -------------------- AUTH (Login, OTP, Signup, Social) --------------------
export const authApi = {
  login: (payload) => post('/auth/login', payload),
  refreshToken: (payload) => post('/auth/refresh-token', payload),
  forgotPassword: (payload) => post('/auth/forgot-password', payload),
  resetPassword: (payload) => post('/auth/reset-password', payload),
  verifyEmailToken: (payload) => post('/auth/verify-email', payload),
  verify2fa: (payload) => post('/auth/2fa/verify', payload),
  sendOtp: (payload) => post('/auth/otp/request', payload),
  verifyOtp: (payload) => post('/auth/otp/verify', payload),
  oauthCallback: (payload) => post('/auth/oauth/callback', payload),
  getMe: () => get('/auth/me'),
  logout: () => post('/auth/logout', {}),
  changePassword: (payload) => post('/auth/change-password', payload),
};

// -------------------- PROPERTIES --------------------
export const propertyApi = {
  list: (params) => get('/properties', params),
  getById: (id) => get(`/properties/${id}`), // Use public endpoint
  featured: () => get('/properties/featured'),
  nearby: (params) => get('/properties/nearby', params),
  city: (city) => get('/properties/by-city', { city }),
  priceRange: (min, max) => get('/properties/by-price-range', { min_price: min, max_price: max }),
  create: (data) => post('/properties', data),
  createFromPayload: (data) => post('/listings/property', data), // New endpoint for SellProperty.jsx payload
  update: (id, data) => put(`/properties/${id}`, data),
  delete: (id) => del(`/properties/${id}`),
  popularCities: () => get('/properties/by-city', { city: 'Mumbai' }), // Fallback to a valid query
  stats: () => get('/properties/stats'),
  
  // Units
  getUnits: (id) => get(`/properties/${id}/units`),
  createUnit: (id, data) => post(`/properties/${id}/units`, data),
  
  // Media
  getMedia: (id) => get(`/properties/${id}/media`),
  uploadImages: (id, formData) => {
    const url = `${API_BASE}/properties/${id}/images`;
    return fetch(url, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    }).then(handleResponse);
  },
};

// -------------------- LISTINGS --------------------
export const listingApi = {
  create: (data) => post('/listings', data),
  search: (params) => get('/listings', params),
  getById: (id) => get(`/listings/${id}`),
  getBySlug: (slug) => get(`/listings/slug/${slug}`),
  update: (id, data) => patch(`/listings/${id}`, data),
  delete: (id) => del(`/listings/${id}`),
  
  publish: (id) => post(`/listings/${id}/publish`),
  unpublish: (id) => post(`/listings/${id}/unpublish`),
  toggleFeatured: (id) => post(`/listings/${id}/feature`),
  
  getFeatured: () => get('/listings/featured'),
  getExclusive: () => get('/listings/exclusive'),
  
  inquiry: (id, data) => post(`/listings/${id}/inquiry`, data),
  favorite: (id) => post(`/listings/${id}/favorite`),
};

export const publicLeadApi = {
  createListingVisitLead: (listingId, data) => post(`/leads/public/listing-visit/${listingId}`, data),
  createListingInquiryLead: (listingId, data) => post(`/leads/public/listing-inquiry/${listingId}`, data),
  createPropertyVisitLead: (propertyId, data) => post(`/leads/public/property-visit/${propertyId}`, data),
  createPropertyInquiryLead: (propertyId, data) => post(`/leads/public/inquiry/${propertyId}`, data),
};

// -------------------- ORGANIZATIONS --------------------
export const organizationApi = {
  create: (data) => post('/organizations', data),
  list: (params) => get('/organizations', params),
  search: (params) => get('/organizations/search', params),
  getById: (id) => get(`/organizations/${id}`),
  update: (id, data) => put(`/organizations/${id}`, data),
  delete: (id) => del(`/organizations/${id}`),
  
  getMembers: (id) => get(`/organizations/${id}/members`),
  addMember: (id, data) => post(`/organizations/${id}/members`, data),
  removeMember: (id, userId) => del(`/organizations/${id}/members/${userId}`),
  
  getStats: (id) => get(`/organizations/${id}/stats`),
  getSettings: (id) => get(`/organizations/${id}/settings`),
  updateSettings: (id, data) => post(`/organizations/${id}/settings`, data),
};

// -------------------- SAVED / FAVORITES (Legacy/Common) --------------------
export const savedApi = {
  list: () => get('/users/me/favorites'),
  add: (propertyId) => post(`/listings/${propertyId}/favorite`), // Redirect to listings if needed
  remove: (propertyId) => del(`/users/me/favorites/${propertyId}?type=property`),
};

// -------------------- USERS (DashboardSettings, Admin User Management) --------------------
export const userApi = {
  // -------------------- USER ME --------------------
  getMe: () => get('/auth/me'),
  updateMe: (id, data) => patch(`/users/${id}`, data),
  changePasswordMe: (payload) => patch('/users/me/password', payload),
  uploadAvatarMe: (formData) => {
    const url = `${API_BASE}/users/me/avatar`;
    return fetch(url, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    }).then(handleResponse);
  },

  getPreferences: () => get('/users/me/preferences'),
  updatePreferences: (data) => patch('/users/me/preferences', data),

  getFavorites: (params) => get('/users/me/favorites', params),
  addFavorite: (payload) => post('/users/me/favorites', payload),
  removeFavorite: (itemId, type = 'property') => del(`/users/me/favorites/${itemId}?type=${type}`),

  getInquiriesMe: (params) => get('/users/me/inquiries', params),
  sendInquiry: (payload) => post('/inquiries', payload),
  stats: () => get('/auth/me').then(res => res.user?.stats || {}), // Fallback
  // CRUD Operations (Admin)
  list: (params) => get('/users', params),
  create: (data) => post('/users', data),
  getById: (id) => get(`/users/${id}`),
  getByRole: (role) => get(`/users?role=${role}`),
  update: (id, data) => patch(`/users/${id}`, data),
  delete: (id) => del(`/users/${id}`),
  verifyEmail: (id) => post(`/users/${id}/verify-email`),
  verifyPhone: (id) => post(`/users/${id}/verify-phone`),
};

// -------------------- ENQUIRIES (Legacy Compatibility) --------------------
export const enquiryApi = {
  create: (propertyId, data) => post(`/listings/${propertyId}/inquiry`, data),
  myEnquiries: () => get('/users/me/inquiries'),
};

// -------------------- VISITS (Legacy Compatibility) --------------------
export const visitApi = {
  schedule: (propertyId, data) => post(`/properties/${propertyId}/schedule-visit`, data),
  myVisits: () => get('/users/me/scheduled-visits'),
  updateStatus: (visitId, status) => patch(`/visits/${visitId}/status`, { status }),
};

// -------------------- TOOLS --------------------
export const toolsApi = {
  calculateEmi: (payload) => post('/tools/emi', payload),
  homeLoanAssistance: (payload) => post('/tools/home-loan-assistance', payload),
};

// -------------------- ADMIN --------------------
export const adminApi = {
  pendingProperties: () => get('/admin/properties/pending'),
  approveProperty: (id, status) => patch(`/admin/properties/${id}/approve`, { status }),
  analytics: () => get('/admin/analytics'),
  enquiries: (params) => get('/admin/enquiries', params),
};

export default {
  auth: authApi,
  property: propertyApi,
  listing: listingApi,
  publicLead: publicLeadApi,
  organization: organizationApi,
  user: userApi,
  enquiry: enquiryApi,
  visit: visitApi,
  tools: toolsApi,
  admin: adminApi,
};
