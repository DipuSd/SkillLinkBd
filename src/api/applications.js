import httpClient from "./httpClient";

export const applyToJob = async (payload) => {
  const { data } = await httpClient.post("/api/applications", payload);
  return data;
};

export const getApplications = async (params = {}) => {
  const { data } = await httpClient.get("/api/applications", { params });
  return data;
};

export const updateApplicationStatus = async ({ applicationId, status }) => {
  const { data } = await httpClient.patch(
    `/api/applications/${applicationId}`,
    { status }
  );
  return data;
};

