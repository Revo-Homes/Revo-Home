import React, { useState, useEffect } from 'react';
import './CookieConsent.css';

const CONSENT_KEY = 'revo_cookie_consent';

/**
 * CookieConsent Banner
 * 
 * Shows on first visit to get user consent for:
 * - Essential cookies: session_token (required for login) - CANNOT BE DISABLED
 * - Preference cookies: preferred_city, property_type, budget
 * - Analytics cookies: (optional, disabled by default)
 * 
 * IMPORTANT: Essential cookies are always active and required for site functionality.
 * Users can reject non-essential cookies (preferences, analytics) but not essential ones.
 */
const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [preferences, setPreferences] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small delay to not interrupt initial page load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      essential: true,
      preferences: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setVisible(false);
  };

  const handleAcceptEssential = () => {
    const consent = {
      essential: true,
      preferences: false,
      analytics: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    
    // Clear any existing preference cookies if user declines
    document.cookie = 'revo_preferred_city=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    document.cookie = 'revo_property_type=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    document.cookie = 'revo_budget_min=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    document.cookie = 'revo_budget_max=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    
    setVisible(false);
  };

  const handleSavePreferences = () => {
    const consent = {
      essential: true,
      preferences: preferences,
      analytics: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-banner">
        <div className="cookie-consent-content">
          <h3>🍪 We Value Your Privacy</h3>
          <p>
            We use cookies to enhance your browsing experience, serve personalized 
            content, and analyze our traffic. Read our{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>{' '}
            for more information.
          </p>

          <div className="cookie-consent-options">
            <div className="cookie-option cookie-option--required">
              <div className="cookie-option__lock">🔒</div>
              <input type="checkbox" checked disabled />
              <span>
                <strong>Essential Cookies</strong>
                <small>Required for login and site functionality — Always Active</small>
              </span>
            </div>

            <label className="cookie-option">
              <input 
                type="checkbox" 
                checked={preferences}
                onChange={(e) => setPreferences(e.target.checked)}
              />
              <span>
                <strong>Preference Cookies</strong>
                <small>Remember your preferred city, property type, and budget (Optional)</small>
              </span>
            </label>
          </div>

          <div className="cookie-consent-notice">
            <p className="cookie-notice-text">
              <strong>Note:</strong> Essential cookies are necessary for the website to function 
              properly and cannot be rejected. You can choose to reject optional preference cookies above.
            </p>
          </div>
        </div>

        <div className="cookie-consent-actions cookie-consent-actions--three">
          <button 
            className="cookie-btn cookie-btn--reject"
            onClick={handleAcceptEssential}
            title="Reject all non-essential cookies. Essential cookies will remain active."
          >
            Reject All
          </button>
          <button 
            className="cookie-btn cookie-btn--secondary"
            onClick={handleAcceptEssential}
          >
            Essential Only
          </button>
          <button 
            className="cookie-btn cookie-btn--primary"
            onClick={preferences ? handleSavePreferences : handleAcceptAll}
          >
            {preferences ? 'Save Preferences' : 'Accept All'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Check if user has consented to preference cookies
 */
export const hasPreferenceConsent = () => {
  try {
    const consent = JSON.parse(localStorage.getItem(CONSENT_KEY));
    return consent?.preferences === true;
  } catch {
    return false;
  }
};

/**
 * Check if user has consented to analytics cookies
 */
export const hasAnalyticsConsent = () => {
  try {
    const consent = JSON.parse(localStorage.getItem(CONSENT_KEY));
    return consent?.analytics === true;
  } catch {
    return false;
  }
};

/**
 * Get full consent status
 */
export const getConsentStatus = () => {
  try {
    return JSON.parse(localStorage.getItem(CONSENT_KEY));
  } catch {
    return null;
  }
};

export default CookieConsent;
