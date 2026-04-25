/**
 * Public Enquiry Service
 * Handles lead generation and public enquiry submissions
 */

import { listingApi } from './api';

/**
 * Build a structured message for enquiries
 */
export const buildStructuredMessage = (subject, details, customMessage = '') => {
  const detailLines = Object.entries(details)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return `${subject}\n\n${detailLines}${customMessage ? `\n\nAdditional Message:\n${customMessage}` : ''}`;
};

/**
 * Split full name into first and last name
 */
export const splitFullName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') {
    return { firstName: '', lastName: '' };
  }

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  };
};

/**
 * Submit a public enquiry
 */
export const submitPublicEnquiry = async (enquiryData) => {
  try {
    // For now, simulate API call - replace with actual endpoint when available
    console.log('Submitting public enquiry:', enquiryData);
    
    // You can uncomment and modify this when you have the actual API endpoint
    // const response = await listingApi.submitEnquiry(enquiryData);
    // return response;
    
    return { success: true, message: 'Enquiry submitted successfully' };
  } catch (error) {
    console.error('Failed to submit enquiry:', error);
    throw error;
  }
};

/**
 * Generate a lead from property enquiry
 */
export const generateLead = async (propertyId, userId, leadData) => {
  try {
    console.log('Generating lead:', { propertyId, userId, ...leadData });
    
    // Track the lead generation event
    // This can be integrated with your analytics or CRM system
    
    return { success: true, leadId: `lead_${Date.now()}` };
  } catch (error) {
    console.error('Failed to generate lead:', error);
    throw error;
  }
};

export default {
  buildStructuredMessage,
  splitFullName,
  submitPublicEnquiry,
  generateLead
};
