/**
 * Applications API
 */

import httpClient from "./httpClient";

/**
 * Apply to a job
 * @param {Object} payload - Application data {jobId, message, etc}
 */
export const applyToJob = async (payload) => {
  const { data } = await httpClient.post("/api/applications", payload);
  return data;
};

/**
 * Get applications list
 * @param {Object} params - Filters
 */
export const getApplications = async (params = {}) => {
  const { data } = await httpClient.get("/api/applications", { params });
  return data;
};

/**
 * Update application status
 * @param {Object} params - { applicationId, status }
 */
export const updateApplicationStatus = async ({ applicationId, status }) => {
  const { data } = await httpClient.patch(
    `/api/applications/${applicationId}`,
    { status }
  );
  return data;
};

