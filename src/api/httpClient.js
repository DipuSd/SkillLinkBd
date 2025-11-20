import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:4000";

const httpClient = axios.create({
  baseURL,
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("skilllink_access_token")
      : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("skilllink_access_token");
        window.localStorage.removeItem("skilllink_user");
      }
    }
    return Promise.reject(error);
  }
);

export default httpClient;

