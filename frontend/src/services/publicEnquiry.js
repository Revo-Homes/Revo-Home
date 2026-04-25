import { publicEnquiryApi } from './api';

const compactObject = (value) => Object.fromEntries(
  Object.entries(value).filter(([, entry]) => {
    if (entry === undefined || entry === null) return false;
    if (typeof entry === 'string' && entry.trim() === '') return false;
    if (Array.isArray(entry) && entry.length === 0) return false;
    return true;
  })
);

export const buildStructuredMessage = (title, fields = {}, freeText = '') => {
  const lines = [title];

  Object.entries(fields).forEach(([label, value]) => {
    if (value === undefined || value === null || value === '') return;
    lines.push(`${label}: ${value}`);
  });

  if (freeText) {
    lines.push('');
    lines.push(freeText);
  }

  return lines.join('\n');
};

export const splitFullName = (fullName = '') => {
  const normalized = String(fullName).trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return { firstName: 'Website', lastName: 'Visitor' };
  }

  const [firstName, ...rest] = normalized.split(' ');
  return {
    firstName,
    lastName: rest.join(' ') || 'Visitor',
  };
};

export const submitPublicEnquiry = async ({
  name,
  email,
  phone,
  subject,
  message,
  enquiryType = 'general',
  budgetMin,
  budgetMax,
  preferredLocation,
  preferredPropertyTypes,
  propertyId,
  listingId,
  sourcePage,
  utmSource,
  utmMedium,
  utmCampaign,
}) => {
  const payload = compactObject({
    name,
    email,
    phone,
    subject,
    message,
    enquiry_type: enquiryType,
    budget_min: budgetMin,
    budget_max: budgetMax,
    preferred_location: preferredLocation,
    preferred_property_types: preferredPropertyTypes,
    property_id: propertyId,
    listing_id: listingId,
    source_page: sourcePage || window.location.pathname,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
  });

  return publicEnquiryApi.submit(payload);
};
