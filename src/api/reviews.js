/**
 * Reviews API
 */

import httpClient from "./httpClient";

/**
 * Create a review
 * @param {Object} payload - { jobId, rating, comment }
 */
export const createReview = async (payload) => {
  const { data } = await httpClient.post("/api/reviews", payload);
  return data;
};

/**
 * Get reviews for a provider
 */
export const getProviderReviews = async (providerId) => {
  const { data } = await httpClient.get(`/api/reviews/provider/${providerId}`);
  return data;
};

