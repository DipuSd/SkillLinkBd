import httpClient from "./httpClient";

export const createDirectJob = async (payload) => {
  const { data } = await httpClient.post("/api/direct-jobs", payload);
  return data;
};

export const getDirectJobs = async (params = {}) => {
  const { data } = await httpClient.get("/api/direct-jobs", { params });
  return data;
};

export const updateDirectJobStatus = async ({ directJobId, action }) => {
  const { data } = await httpClient.patch(`/api/direct-jobs/${directJobId}/status`, {
    action,
  });
  return data;
};

export const payForDirectJob = async ({ directJobId, amount }) => {
  const { data } = await httpClient.post(`/api/direct-jobs/${directJobId}/pay`, { amount });
  return data;
};

