/**
 * Direct Jobs API
 */

import httpClient from "./httpClient";

/**
 * Create a direct job invitation
 * @param {Object} payload - { providerId, title, description, budget, dueDate }
 */
export const createDirectJob = async (payload) => {
  const { data } = await httpClient.post("/api/direct-jobs", payload);
  return data;
};

/**
 * Get direct jobs list
 * @param {Object} params - Filters
 */
export const getDirectJobs = async (params = {}) => {
  const { data } = await httpClient.get("/api/direct-jobs", { params });
  return data;
};

/**
 * Update direct job status
 * @param {Object} params - { directJobId, action } (accept, decline, complete, cancel)
 */
export const updateDirectJobStatus = async ({ directJobId, action }) => {
  const { data } = await httpClient.patch(`/api/direct-jobs/${directJobId}/status`, {
    action,
  });
  return data;
};

/**
 * Payment for direct job
 */
export const payForDirectJob = async ({ directJobId, amount }) => {
  const { data } = await httpClient.post(`/api/direct-jobs/${directJobId}/pay`, { amount });
  return data;
};

