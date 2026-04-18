import { useCallback, useRef } from 'react';
import { publicLeadApi } from '../services/api';

// Global in-flight request tracker (persists across React re-renders)
const inFlightRequests = new Map();
const completedRequests = new Set();

const sanitizePhone = (value) => value ? String(value).replace(/[^\d+]/g, '') : '';

const getRequirementType = (listingType) => {
  const normalized = String(listingType || '').toLowerCase();

  if (normalized === 'rent' || normalized === 'lease') {
    return 'rent';
  }

  if (normalized === 'invest') {
    return 'invest';
  }

  return 'buy';
};

const buildLeadPayload = (propertyData = {}, userId) => ({
  first_name: propertyData.userFirstName || 'Website',
  last_name: propertyData.userLastName || 'Visitor',
  email: propertyData.userEmail || undefined,
  phone: sanitizePhone(propertyData.userPhone) || undefined,
  city: propertyData.city || undefined,
  state: propertyData.state || undefined,
  country: (propertyData.country || 'IN').slice(0, 2).toUpperCase(),
  requirement_type: getRequirementType(propertyData.listingType),
  budget_min: propertyData.price ? Math.round(Number(propertyData.price) * 0.8) : undefined,
  budget_max: propertyData.price ? Math.round(Number(propertyData.price) * 1.2) : undefined,
  currency: propertyData.currency || 'INR',
  priority: propertyData.priority || 'medium',
  score: propertyData.score || (propertyData.leadEvent === 'inquiry' ? 80 : 45),
  medium: propertyData.utm_medium || (propertyData.leadEvent === 'inquiry' ? 'property_inquiry' : 'property_card'),
  campaign: propertyData.utm_campaign || 'revo_homes_direct',
  source: propertyData.utm_source || 'website',
  message: propertyData.notes || propertyData.message || undefined,
  user_id: userId || undefined,
});

export const useRevoLeadTracker = () => {
  const generateLead = useCallback(async (primaryId, userId, propertyData = {}) => {
    const listingId = propertyData.listingId || propertyData.listing_id || primaryId;
    const propertyId = propertyData.propertyId || propertyData.property_id || null;
    const leadEvent = propertyData.leadEvent || 'visit';

    if (!listingId && !propertyId) {
      console.error('generateLead: listingId or propertyId is required');
      return false;
    }

    // Create dedupe key including timestamp window (5 second window)
    const timeWindow = Math.floor(Date.now() / 5000); // 5-second window
    const contactKey = propertyData.userEmail || sanitizePhone(propertyData.userPhone) || userId || 'anonymous';
    const dedupeKey = `${leadEvent}-${contactKey}-${listingId || propertyId}-${timeWindow}`;

    // Check if already completed or in-flight
    if (completedRequests.has(dedupeKey)) {
      console.log('Lead already generated in this window:', dedupeKey);
      return true;
    }
    if (inFlightRequests.has(dedupeKey)) {
      console.log('Lead request already in flight:', dedupeKey);
      return inFlightRequests.get(dedupeKey);
    }

    // Mark as in-flight immediately
    const requestPromise = (async () => {
      const payload = buildLeadPayload({ ...propertyData, leadEvent }, userId);

      try {
        const response = listingId
          ? (leadEvent === 'inquiry'
            ? await publicLeadApi.createListingInquiryLead(listingId, payload)
            : await publicLeadApi.createListingVisitLead(listingId, payload))
          : (leadEvent === 'inquiry'
            ? await publicLeadApi.createPropertyInquiryLead(propertyId, payload)
            : await publicLeadApi.createPropertyVisitLead(propertyId, payload));

        const leadId = response?.data?.id || response?.id;

        console.log('Lead generated from Revo Homes interaction:', {
          leadEvent,
          listingId,
          propertyId,
          leadId,
          dedupeKey
        });

        // Mark as completed
        completedRequests.add(dedupeKey);
        setTimeout(() => completedRequests.delete(dedupeKey), 30000); // Clean up after 30s

        return true;
      } catch (error) {
        const status = error?.status || error?.response?.status;

        if (status === 200 || status === 201 || status === 409) {
          completedRequests.add(dedupeKey);
          return true;
        }

        console.error('Failed to generate lead:', error);
        return false;
      } finally {
        inFlightRequests.delete(dedupeKey);
      }
    })();

    inFlightRequests.set(dedupeKey, requestPromise);
    return requestPromise;
  }, []);

  const handlePropertyClick = useCallback(async (primaryId, userId, propertyData = {}) => {
    if (!primaryId || !userId) {
      return false;
    }
    return generateLead(primaryId, userId, { ...propertyData, leadEvent: 'visit' });
  }, [generateLead]);

  return {
    generateLead,
    handlePropertyClick,
  };
};
