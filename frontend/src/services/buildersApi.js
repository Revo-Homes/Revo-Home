const normalizeApiBase = (value) => (value || '/api').replace(/\/+$/, '');

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_CORE_API_URL || '/api'
);

function unwrap(json) {
  if (json && typeof json === 'object' && json.data !== undefined) return json.data;
  return json;
}

export async function fetchPopularBuilders(limit = 8) {
  const baseUrl = API_BASE.startsWith('http') ? API_BASE : `${window.location.origin}${API_BASE}`;
  const url = `${baseUrl.replace(/\/+$/, '')}/builders/popular?limit=${limit}`;
  const response = await fetch(url, { credentials: 'include' });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || 'Failed to load builders');
  const data = unwrap(json);
  return data?.builders || [];
}

export default { fetchPopularBuilders };
