const AUTH_STORAGE_KEY = 'revohomes.auth';

/**
 * Bridge Revo Homes localStorage auth into CRM session format for shared AddProperty module.
 */
export function syncHomesAuthToCrm() {
  try {
    const token = localStorage.getItem('authToken');
    const rawUser = localStorage.getItem('authUser');
    if (!token || !rawUser) return false;
    const user = JSON.parse(rawUser);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token,
        refreshToken: localStorage.getItem('refreshToken') || null,
        user,
      }),
    );
    return true;
  } catch {
    return false;
  }
}
