export { useRevoLeadTracker as usePropertyLeadTracker } from "./useRevoLeadTracker";

/*
import { useCallback, useRef } from 'react';

// Use Vite env variable (not process.env which is Node/CRA only)
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * Custom hook to track property clicks and generate leads in the CRM backend.
 * Sends the exact payload accepted by the backend LeadValidator.
 */
export const usePropertyLeadTracker = () => {
  const isProcessingRef = useRef(false);
  const generatedLeadsRef = useRef(new Set()); // Track generated leads

  /**
   * Generate a CRM lead when a user clicks a property.
   * Maps user + property data → exact backend payload spec.
   */
  const generateLead = useCallback(async (propertyId, userId, propertyData = {}) => {
    if (!propertyId) {
      console.error('generateLead: propertyId is required');
      return false;
    }
    if (!userId) {
      console.error('generateLead: userId is required (user must be logged in)');
      return false;
    }

    // Check if lead already generated for this property-user combination
    const leadKey = `${userId}-${propertyId}`;
    if (generatedLeadsRef.current.has(leadKey)) {
      console.log('🔄 Lead already generated for this property-user combination - skipping');
      return true;
    }

    // Derive requirement_type from listing type
    const requirementTypeMap = {
      rent: 'rent',
      lease: 'lease',
      invest: 'invest',
      buy: 'buy'
    };
    const requirement_type = requirementTypeMap[propertyData.listingType] || 'buy';

    // Build the exact payload the backend accepts (matches LeadValidator.validateCreate)
    const leadPayload = {
      // ── Identity & Tenant ───────────────────────────────────────────────
      // organization_id will be injected by backend from auth token

      // ── Contact (CORE) ──────────────────────────────────────────────────
      first_name: propertyData.userFirstName || 'Website',
      last_name: propertyData.userLastName || 'User',
      email: propertyData.userEmail || null,
      phone: propertyData.userPhone ? propertyData.userPhone.replace(/[\s\-\(\)]/g, '') : '+910000000000',
      // alternate_phone removed - not in current DB schema

      // ── Relationships (FK) ──────────────────────────────────────
      property_id: propertyId,
      listing_id: null,
      assigned_to: null,
      organization_id: propertyData.organizationId || null,
      // team_id removed - not in current DB schema

      // ── Visibility ─────────────────────────────────────────────────────
      visibility_scope: 'private',

      // ── Location (from property) ────────────────────────────────────────
      city: propertyData.city || null,
      state: propertyData.state || null,
      country: 'IN',
      // nationality removed - not in current DB schema

      // ── Requirement (derived from property) ─────────────────────────────
      requirement_type,
      budget_min: propertyData.price ? Math.round(propertyData.price * 0.8) : null,
      budget_max: propertyData.price ? Math.round(propertyData.price * 1.2) : null,
      currency: 'INR',
      // Preference fields removed - not in current DB schema

      // Notes field removed - not in current DB schema

      // ── CRM Intelligence ────────────────────────────────────────────────
      score: propertyData.score || 30,           // Initial score for a property-click lead
      priority: propertyData.priority || 'medium',
      // is_hot removed - not in current DB schema
      follow_up_date: null,

      // ── Marketing fields for simplified schema ────────────────────────
      source: propertyData.utm_source || 'website',
      medium: propertyData.utm_medium || 'property_card',
      campaign: propertyData.utm_campaign || 'revo_homes_direct',

      // ── Status for simplified schema ───────────────────────────────────
      status: 'new'
    };

    try {
      console.log('=== PROPERTY LEAD GENERATION START ===');
      console.log('Property ID:', propertyId);
      console.log('User ID:', userId);
      console.log('Property Details:', {
        title: propertyData.title,
        price: propertyData.price,
        location: propertyData.location,
        propertyType: propertyData.propertyType,
        bhk: propertyData.bhk,
        bathrooms: propertyData.bathrooms,
        area: propertyData.area,
        listingType: propertyData.listingType
      });
      console.log('User Details:', {
        firstName: propertyData.userFirstName,
        lastName: propertyData.userLastName,
        email: propertyData.userEmail,
        phone: propertyData.userPhone
      });
      console.log('Lead Payload Being Sent:', JSON.stringify(leadPayload, null, 2));
      console.log('=====================================');

      const response = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(leadPayload)
      });

      const result = await response.json();

      if (!response.ok) {
        console.warn(`Lead request failed: ${response.status} ${response.statusText}`);
        console.warn('Response body:', result);
        
        // 409 = duplicate — not really a failure, but track it to prevent retries
        if (response.status === 409) {
          generatedLeadsRef.current.add(leadKey);
          return true; // Not really a failure
        }
        // 422 = validation error — log details for debugging
        if (response.status === 422) {
          console.warn('Lead validation failed:', result.details);
          return false;
        }
        // 400 = bad request — log details for debugging
        if (response.status === 400) {
          console.warn('Bad request error:', result);
          throw new Error(result.error || `Bad Request: ${JSON.stringify(result)}`);
        }
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      // Mark this lead as generated to prevent duplicates
      generatedLeadsRef.current.add(leadKey);

      console.log('=== LEAD GENERATION SUCCESS ===');
      console.log('Lead ID:', result.data?.id);
      console.log('Property ID:', propertyId);
      console.log('User ID:', userId);
      console.log('Property Title:', propertyData.title);
      console.log('Property Price:', propertyData.price);
      console.log('Property Location:', propertyData.location);
      console.log('User Email:', propertyData.userEmail);
      console.log('User Phone:', propertyData.userPhone);
      console.log('Lead Created Successfully!');
      console.log('===============================');
      return true;

    } catch (error) {
      console.error('❌ Failed to generate lead:', error.message);
      console.error('❌ Error details:', error);
      
      // Try to parse validation errors if they exist
      if (error.details && Array.isArray(error.details)) {
        console.error('❌ Validation errors:');
        error.details.forEach(err => {
          console.error(`   - ${err.field}: ${err.message}`);
        });
      }
      
      return false; // Non-blocking — navigation still proceeds
    }
  }, []);

  /**
   * Handle property card click with debounce protection.
   */
  const handlePropertyClick = useCallback(async (propertyId, userId, propertyData = {}) => {
    if (isProcessingRef.current) {
      console.log('⏳ Lead generation already in progress — skipping duplicate click');
      return false;
    }
    if (!propertyId) {
      console.error('handlePropertyClick: propertyId is required');
      return false;
    }
    if (!userId) {
      console.log('🔒 User not logged in — no lead generated');
      return false;
    }

    isProcessingRef.current = true;

    try {
      const leadGenerated = await generateLead(propertyId, userId, propertyData);
      if (leadGenerated) {
        console.log(`🎯 Lead generated for property ${propertyId} by user ${userId}`);
      }
      return leadGenerated;
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 500);
    }
  }, [generateLead]);

  return {
    generateLead,
    handlePropertyClick
  };
};
*/
