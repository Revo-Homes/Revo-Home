/**
 * Cross-app navigation helpers (Revo Homes → Revo CRM).
 */
export function getCrmBaseUrl() {
  const fromEnv = import.meta.env.VITE_CRM_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');
  return 'http://localhost:5174';
}

export function getCrmPlansUrl({ returnTo, savedStep, from } = {}) {
  const url = new URL(`${getCrmBaseUrl()}/plans`);
  if (returnTo) url.searchParams.set('returnTo', returnTo);
  if (savedStep != null) url.searchParams.set('savedStep', String(savedStep));
  if (from) url.searchParams.set('from', from);
  return url.toString();
}

export function redirectToCrmPlans(options = {}) {
  window.location.href = getCrmPlansUrl(options);
}
