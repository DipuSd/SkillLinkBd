import httpClient from "./httpClient";

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await httpClient.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};
