/**
 * Reports API
 */

import httpClient from "./httpClient";

/**
 * Report a user
 * @param {Object} payload - { reportedUserId, reason, description, evidenceUrl, ... }
 */
export const createReport = async (payload) => {
  const { data } = await httpClient.post("/api/reports", payload);
  return data;
};

/**
 * Get reports (Admin)
 * @param {Object} params - Filters
 */
export const getReports = async (params = {}) => {
  const { data } = await httpClient.get("/api/reports", { params });
  return data;
};

/**
 * Update report status (Admin)
 * @param {Object} params - { reportId, status, actionTaken, warningMessage }
 */
export const updateReportStatus = async ({
  reportId,
  status,
  actionTaken,
  warningMessage,
}) => {
  const { data } = await httpClient.patch(`/api/reports/${reportId}`, {
    status,
    actionTaken,
    warningMessage,
  });
  return data;
};

