import httpClient from "./httpClient";

export const searchProviders = async (params = {}) => {
  const { data } = await httpClient.get("/api/providers", { params });
  return data;
};

