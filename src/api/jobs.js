
import httpClient from "./httpClient";

export const getJobs = async (params = {}) => {
  const { data } = await httpClient.get("/api/jobs", { params });
  return data;
};

export const getJobById = async (jobId) => {
  const { data } = await httpClient.get(`/api/jobs/${jobId}`);
  return data;
};

export const createJob = async (payload) => {
  const { data } = await httpClient.post("/api/jobs", payload);
  return data;
};

export const updateJob = async (jobId, payload) => {
  const { data } = await httpClient.put(`/api/jobs/${jobId}`, payload);
  return data;
};

export const deleteJob = async (jobId) => {
  const { data } = await httpClient.delete(`/api/jobs/${jobId}`);
  return data;
};

export const getClientJobs = async (params = {}) => {
  const { data } = await httpClient.get("/api/client/jobs", { params });
  return data;
};

export const updateJobStatus = async ({ jobId, status }) => {
  const { data } = await httpClient.patch(`/api/jobs/${jobId}/status`, {
    status,
  });
  return data;
};

export const assignJobProvider = async ({ jobId, providerId }) => {
  const { data } = await httpClient.patch(`/api/jobs/${jobId}/assign`, {
    providerId,
  });
  return data;
};

export const payForJob = async ({ jobId, amount }) => {
  const { data } = await httpClient.post(`/api/jobs/${jobId}/pay`, { amount });
  return data;
};

export const getRecommendedJobs = async (params = {}) => {
  const { data } = await httpClient.get("/api/jobs/recommended", { params });
  return data;
};
