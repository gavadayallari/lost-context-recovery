import api from "./api";

export const startRepositorySync = async (
  repoUrl: string
) => {
  const response = await api.post("/sync", {
    repoUrl,
  });

  return response.data;
};

export const getSyncStatus = async (
  jobId: string
) => {
  const response = await api.get(
    `/sync/${jobId}`
  );

  return response.data;
};