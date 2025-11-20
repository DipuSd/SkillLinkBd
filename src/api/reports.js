import httpClient from "./httpClient";

export const createReport = async (payload) => {
  const { data } = await httpClient.post("/api/reports", payload);
  return data;
};

export const getReports = async (params = {}) => {
  const { data } = await httpClient.get("/api/reports", { params });
  return data;
};

export const updateReportStatus = async ({ reportId, status, actionTaken }) => {
  const { data } = await httpClient.patch(`/api/reports/${reportId}`, {
    status,
    actionTaken,
  });
  return data;
};

