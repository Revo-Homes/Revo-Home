/**
 * REVO HOMES - User Preferences Service
 * 
 * This service handles UX personalization that does NOT require authentication:
 * - preferred_city: Stored in cookie (synced to backend when logged in)
 * - property_type: Stored in cookie (synced to backend when logged in)
 * - last_search: Stored in localStorage (ephemeral, device-specific)
 * - recent_properties: Stored in localStorage (ephemeral, device-specific)
 * 
 * Architecture:
 * - Cookies: For preferences that might be synced to backend (cross-device)
 * - localStorage: For ephemeral UI state (device-specific only)
 * 
 * NOTE: Preference cookies are only set if user has given consent via CookieConsent banner
 */

const CONSENT_KEY = 'revo_cookie_consent';

/**
 * Check if user has consented to preference cookies
 */
const hasPreferenceConsent = () => {
  try {
    const consent = JSON.parse(localStorage.getItem(CONSENT_KEY));
    return consent?.preferences === true;
  } catch {
    return false;
  }
};

// Cookie utilities (for cross-device preferences)
const setCookie = (name, value, days = 365) => {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  } catch (error) {
    console.error('Error setting cookie:', error);
  }
};

const getCookie = (name) => {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  } catch (error) {
    console.error('Error getting cookie:', error);
    return null;
  }
};

const deleteCookie = (name) => {
  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  } catch (error) {
    console.error('Error deleting cookie:', error);
  }
};

// localStorage utilities (for device-specific preferences)
const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
};

const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error getting localStorage:', error);
    return defaultValue;
  }
};

const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing localStorage:', error);
  }
};

// Keys
const COOKIE_KEYS = {
  PREFERRED_CITY: 'revo_preferred_city',
  PROPERTY_TYPE: 'revo_property_type',
  BUDGET_MIN: 'revo_budget_min',
  BUDGET_MAX: 'revo_budget_max',
};

const LOCALSTORAGE_KEYS = {
  LAST_SEARCH: 'revo_last_search',
  RECENT_PROPERTIES: 'revo_recent_properties',
  SEARCH_HISTORY: 'revo_search_history',
};

const MAX_RECENT_PROPERTIES = 10;
const MAX_SEARCH_HISTORY = 5;

// ==================== PREFERENCES (Cookies - Cross-device potential) ====================

export const preferences = {
  // Preferred City
  setPreferredCity: (city) => {
    if (!city) return;
    if (!hasPreferenceConsent()) {
      console.log('[Preferences] Skipping cookie - no consent');
      return;
    }
    setCookie(COOKIE_KEYS.PREFERRED_CITY, city);
  },
  
  getPreferredCity: () => getCookie(COOKIE_KEYS.PREFERRED_CITY),
  
  clearPreferredCity: () => deleteCookie(COOKIE_KEYS.PREFERRED_CITY),

  // Property Type
  setPropertyType: (type) => {
    if (!type) return;
    if (!hasPreferenceConsent()) {
      console.log('[Preferences] Skipping cookie - no consent');
      return;
    }
    setCookie(COOKIE_KEYS.PROPERTY_TYPE, type);
  },
  
  getPropertyType: () => getCookie(COOKIE_KEYS.PROPERTY_TYPE),
  
  clearPropertyType: () => deleteCookie(COOKIE_KEYS.PROPERTY_TYPE),

  // Budget Range
  setBudgetRange: (min, max) => {
    if (!hasPreferenceConsent()) {
      console.log('[Preferences] Skipping cookie - no consent');
      return;
    }
    if (min !== undefined && min !== null) setCookie(COOKIE_KEYS.BUDGET_MIN, String(min), 30);
    if (max !== undefined && max !== null) setCookie(COOKIE_KEYS.BUDGET_MAX, String(max), 30);
  },
  
  getBudgetRange: () => ({
    min: getCookie(COOKIE_KEYS.BUDGET_MIN),
    max: getCookie(COOKIE_KEYS.BUDGET_MAX),
  }),
  
  clearBudgetRange: () => {
    deleteCookie(COOKIE_KEYS.BUDGET_MIN);
    deleteCookie(COOKIE_KEYS.BUDGET_MAX);
  },

  // Get all preferences (for syncing to backend when user logs in)
  getAll: () => ({
    preferred_city: getCookie(COOKIE_KEYS.PREFERRED_CITY),
    property_type: getCookie(COOKIE_KEYS.PROPERTY_TYPE),
    budget_min: getCookie(COOKIE_KEYS.BUDGET_MIN),
    budget_max: getCookie(COOKIE_KEYS.BUDGET_MAX),
  }),

  // Clear all preferences
  clearAll: () => {
    deleteCookie(COOKIE_KEYS.PREFERRED_CITY);
    deleteCookie(COOKIE_KEYS.PROPERTY_TYPE);
    deleteCookie(COOKIE_KEYS.BUDGET_MIN);
    deleteCookie(COOKIE_KEYS.BUDGET_MAX);
  },
};

// ==================== EPHEMERAL STATE (localStorage - Device-specific) ====================

export const ephemeral = {
  // Last Search
  setLastSearch: (searchData) => {
    setLocalStorage(LOCALSTORAGE_KEYS.LAST_SEARCH, {
      ...searchData,
      timestamp: Date.now(),
    });
  },
  
  getLastSearch: () => getLocalStorage(LOCALSTORAGE_KEYS.LAST_SEARCH),
  
  clearLastSearch: () => removeLocalStorage(LOCALSTORAGE_KEYS.LAST_SEARCH),

  // Recent Properties (for "Recently Viewed" feature)
  addRecentProperty: (property) => {
    if (!property || !property.id) return;
    
    const recent = getLocalStorage(LOCALSTORAGE_KEYS.RECENT_PROPERTIES, []);
    
    // Remove if already exists (to move to front)
    const filtered = recent.filter(p => p.id !== property.id);
    
    // Add to front
    filtered.unshift({
      id: property.id,
      title: property.title || property.name,
      image: property.image || property.thumbnail,
      price: property.price,
      location: property.location,
      timestamp: Date.now(),
    });
    
    // Keep only max
    const trimmed = filtered.slice(0, MAX_RECENT_PROPERTIES);
    setLocalStorage(LOCALSTORAGE_KEYS.RECENT_PROPERTIES, trimmed);
  },
  
  getRecentProperties: () => getLocalStorage(LOCALSTORAGE_KEYS.RECENT_PROPERTIES, []),
  
  clearRecentProperties: () => removeLocalStorage(LOCALSTORAGE_KEYS.RECENT_PROPERTIES),

  // Search History
  addSearchHistory: (searchTerm) => {
    if (!searchTerm || typeof searchTerm !== 'string') return;
    
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    
    const history = getLocalStorage(LOCALSTORAGE_KEYS.SEARCH_HISTORY, []);
    
    // Remove if already exists
    const filtered = history.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
    
    // Add to front
    filtered.unshift(trimmed);
    
    // Keep only max
    const trimmedHistory = filtered.slice(0, MAX_SEARCH_HISTORY);
    setLocalStorage(LOCALSTORAGE_KEYS.SEARCH_HISTORY, trimmedHistory);
  },
  
  getSearchHistory: () => getLocalStorage(LOCALSTORAGE_KEYS.SEARCH_HISTORY, []),
  
  clearSearchHistory: () => removeLocalStorage(LOCALSTORAGE_KEYS.SEARCH_HISTORY),

  // Clear all ephemeral data
  clearAll: () => {
    removeLocalStorage(LOCALSTORAGE_KEYS.LAST_SEARCH);
    removeLocalStorage(LOCALSTORAGE_KEYS.RECENT_PROPERTIES);
    removeLocalStorage(LOCALSTORAGE_KEYS.SEARCH_HISTORY);
  },
};

// ==================== SYNC WITH BACKEND ====================

/**
 * Syncs cookie preferences to backend when user logs in
 * Call this after successful login/signup
 */
export const syncPreferencesToBackend = async (userApi) => {
  try {
    const prefs = preferences.getAll();
    
    // Only sync if there's something to sync
    const hasData = Object.values(prefs).some(v => v !== null && v !== undefined);
    if (!hasData) return;
    
    await userApi.updatePreferences({
      preferred_city: prefs.preferred_city,
      property_type: prefs.property_type,
      budget_min: prefs.budget_min,
      budget_max: prefs.budget_max,
    });
    
    console.log('✅ Preferences synced to backend');
  } catch (error) {
    console.error('Failed to sync preferences:', error);
    // Non-critical: Don't throw, just log
  }
};

/**
 * Loads preferences from backend and updates cookies
 * Call this when app initializes for logged-in user
 */
export const loadPreferencesFromBackend = async (userApi) => {
  try {
    const response = await userApi.getPreferences();
    const prefs = response.data || response;
    
    if (prefs.preferred_city) preferences.setPreferredCity(prefs.preferred_city);
    if (prefs.property_type) preferences.setPropertyType(prefs.property_type);
    if (prefs.budget_min !== undefined) {
      setCookie(COOKIE_KEYS.BUDGET_MIN, String(prefs.budget_min), 30);
    }
    if (prefs.budget_max !== undefined) {
      setCookie(COOKIE_KEYS.BUDGET_MAX, String(prefs.budget_max), 30);
    }
    
    console.log('✅ Preferences loaded from backend');
  } catch (error) {
    console.error('Failed to load preferences:', error);
    // Non-critical: Don't throw, just log
  }
};

// ==================== HOOKS ====================

/**
 * React hook for using preferences
 * Usage: const prefs = usePreferences();
 */
export const usePreferences = () => {
  return {
    ...preferences,
    ...ephemeral,
    syncToBackend: syncPreferencesToBackend,
    loadFromBackend: loadPreferencesFromBackend,
  };
};

export default {
  preferences,
  ephemeral,
  syncPreferencesToBackend,
  loadPreferencesFromBackend,
  usePreferences,
};
