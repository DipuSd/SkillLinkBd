/**
 * Upload API
 */

import httpClient from "./httpClient";

/**
 * Upload a file (image)
 * @param {File} file - File object
 * @returns {Promise<Object>} { url: string }
 */
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
