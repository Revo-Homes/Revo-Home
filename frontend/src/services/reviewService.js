import { get, post, put, del } from './api';

const BASE_URL = '/reviews';

export const reviewService = {
  /**
   * Get reviews for a property
   * @param {string|number} propertyId - Property ID
   * @param {Object} options - Query options (status, limit, offset)
   * @returns {Promise<{reviews: Array, stats: Object}>}
   */
  async getReviews(propertyId, options = {}) {
    const { status = 'approved', limit = 50, offset = 0 } = options;
    const response = await get(
      `${BASE_URL}/property/${propertyId}`,
      { status, limit, offset }
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch reviews');
    }
    
    return response.data;
  },

  /**
   * Get review stats for a property
   * @param {string|number} propertyId - Property ID
   * @returns {Promise<Object>} Stats object with average_rating, total_reviews, distribution
   */
  async getStats(propertyId) {
    const response = await get(`${BASE_URL}/property/${propertyId}/stats`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch review stats');
    }
    
    return response.data;
  },

  /**
   * Create a new review (requires authentication)
   * @param {string|number} propertyId - Property ID
   * @param {Object} reviewData - { rating, comment, title }
   * @returns {Promise<Object>} Created review
   */
  async createReview(propertyId, reviewData) {
    const response = await post(
      `${BASE_URL}/property/${propertyId}`,
      reviewData
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create review');
    }
    
    return response.data;
  },

  /**
   * Update an existing review (requires authentication, must be owner)
   * @param {string|number} reviewId - Review ID
   * @param {Object} reviewData - { rating, comment, title }
   * @returns {Promise<Object>} Updated review
   */
  async updateReview(reviewId, reviewData) {
    const response = await put(
      `${BASE_URL}/${reviewId}`,
      reviewData
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update review');
    }
    
    return response.data;
  },

  /**
   * Delete a review (requires authentication, must be owner or admin)
   * @param {string|number} reviewId - Review ID
   * @returns {Promise<Object>}
   */
  async deleteReview(reviewId) {
    const response = await del(`${BASE_URL}/${reviewId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete review');
    }
    
    return response;
  }
};

export default reviewService;
