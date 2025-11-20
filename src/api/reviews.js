import httpClient from "./httpClient";

export const createReview = async (payload) => {
  const { data } = await httpClient.post("/api/reviews", payload);
  return data;
};

export const getProviderReviews = async (providerId) => {
  const { data } = await httpClient.get(`/api/reviews/provider/${providerId}`);
  return data;
};

