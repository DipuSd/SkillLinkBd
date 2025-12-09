
/**
 * Jobs API
 */

import httpClient from "./httpClient";

/**
 * Get jobs with filters
 * @param {Object} params - Query filters (status, sort, etc.)
 */
export const getJobs = async (params = {}) => {
  const { data } = await httpClient.get("/api/jobs", { params });
  return data;
};

/**
 * Get job details by ID
 */
export const getJobById = async (jobId) => {
  const { data } = await httpClient.get(`/api/jobs/${jobId}`);
  return data;
};

/**
 * Create a new job
 * @param {Object} payload - Job data
 */
export const createJob = async (payload) => {
  const { data } = await httpClient.post("/api/jobs", payload);
  return data;
};

/**
 * Update an existing job
 */
export const updateJob = async (jobId, payload) => {
  const { data } = await httpClient.put(`/api/jobs/${jobId}`, payload);
  return data;
};

/**
 * Delete a job
 */
export const deleteJob = async (jobId) => {
  const { data } = await httpClient.delete(`/api/jobs/${jobId}`);
  return data;
};

/**
 * Get jobs posted by current client
 */
export const getClientJobs = async (params = {}) => {
  const { data } = await httpClient.get("/api/client/jobs", { params });
  return data;
};

/**
 * Update job status (e.g. open -> in-progress)
 */
export const updateJobStatus = async ({ jobId, status }) => {
  const { data } = await httpClient.patch(`/api/jobs/${jobId}/status`, {
    status,
  });
  return data;
};

/**
 * Assign provider to job
 */
export const assignJobProvider = async ({ jobId, providerId }) => {
  const { data } = await httpClient.patch(`/api/jobs/${jobId}/assign`, {
    providerId,
  });
  return data;
};

/**
 * Process job payment
 */
export const payForJob = async ({ jobId, amount }) => {
  const { data } = await httpClient.post(`/api/jobs/${jobId}/pay`, { amount });
  return data;
};

/**
 * Get recommended jobs for provider
 */
export const getRecommendedJobs = async (params = {}) => {
  const { data } = await httpClient.get("/api/jobs/recommended", { params });
  return data;
};
