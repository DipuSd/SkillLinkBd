import httpClient from "./httpClient";

export const registerUser = async (payload) => {
  const { data } = await httpClient.post("/api/auth/register", payload);
  return data;
};

export const loginUser = async (payload) => {
  const { data } = await httpClient.post("/api/auth/login", payload);
  return data;
};

export const fetchProfile = async () => {
  const { data } = await httpClient.get("/api/auth/profile");
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await httpClient.put("/api/users/me", payload);
  return data;
};

